"""
Iteration 18 — Subscriptions detection + Gmail auto-scan/inbox + regressions
Tests for:
- GET /api/transactions/subscriptions (new)
- GET /api/gmail/inbox (new)
- POST /api/gmail/refresh (new, expects 403 without Gmail)
- Regression: Smart Import + txn CRUD + gmail status/connect
"""
import os
import requests
import pytest

def _load_backend_url():
    url = os.environ.get("REACT_APP_BACKEND_URL", "")
    if not url:
        try:
            with open("/app/frontend/.env") as f:
                for line in f:
                    if line.startswith("REACT_APP_BACKEND_URL="):
                        url = line.split("=", 1)[1].strip()
                        break
        except Exception:
            pass
    return url.rstrip("/")


BASE_URL = _load_backend_url()
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


@pytest.fixture(scope="module")
def auth_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"client_id": TEST_CLIENT_ID, "password": TEST_PASSWORD},
                      timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ---------- Subscriptions endpoint ----------
class TestSubscriptions:
    def test_subscriptions_endpoint_success(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/transactions/subscriptions", headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Structure
        for key in ("subscriptions", "total_monthly_cost", "total_yearly_cost", "count"):
            assert key in data, f"Missing key {key} in response: {data.keys()}"
        assert isinstance(data["subscriptions"], list)
        assert isinstance(data["count"], int)
        assert data["count"] == len(data["subscriptions"])

    def test_subscriptions_detect_seeded_recurring(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/transactions/subscriptions", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        subs = data["subscriptions"]
        # Seeded Netflix/Spotify/SIP should be detected as monthly
        assert data["count"] >= 1, f"Expected at least one recurring subscription; got {data['count']}"

        # Each subscription must have required keys
        required = {"merchant", "display_name", "amount", "frequency", "occurrence_count",
                    "last_charged", "next_expected", "days_until_next", "monthly_cost", "category"}
        for s in subs:
            missing = required - set(s.keys())
            assert not missing, f"Subscription missing keys: {missing}; got {s}"
            assert s["frequency"] in ("monthly", "yearly", "weekly")
            assert s["occurrence_count"] >= 2
            assert isinstance(s["amount"], (int, float))
            assert isinstance(s["monthly_cost"], (int, float))

        # Seed transactions include Netflix ₹799, Spotify ₹199, SIP ₹5000
        merchants = " ".join(s["display_name"].lower() for s in subs)
        assert any(k in merchants for k in ("netflix", "spotify", "sip", "hdfc")), \
            f"Seeded recurring merchants not detected: {[s['display_name'] for s in subs]}"

        # total_monthly should be > 0 and > 500 given seed
        assert data["total_monthly_cost"] > 0
        assert data["total_yearly_cost"] >= data["total_monthly_cost"]

    def test_subscriptions_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/transactions/subscriptions", timeout=10)
        assert r.status_code in (401, 403), f"Unexpected status {r.status_code}"


# ---------- Gmail inbox (no gmail connected case) ----------
class TestGmailInbox:
    def test_inbox_without_connection_returns_empty_not_403(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gmail/inbox", headers=auth_headers, timeout=15)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        for key in ("emails", "unparsed_count", "last_scanned"):
            assert key in data, f"Missing key {key}"
        assert isinstance(data["emails"], list)
        # user AV271676A7 has no Gmail connected → empty
        assert data["emails"] == []
        assert data["unparsed_count"] == 0
        assert data["last_scanned"] is None

    def test_inbox_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/gmail/inbox", timeout=10)
        assert r.status_code in (401, 403)


# ---------- Gmail refresh ----------
class TestGmailRefresh:
    def test_refresh_without_gmail_returns_403(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/gmail/refresh", headers=auth_headers, timeout=15)
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "")
        assert "Gmail not connected" in detail, f"Unexpected detail: {detail}"

    def test_refresh_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/gmail/refresh", timeout=10)
        assert r.status_code in (401, 403)


# ---------- Regressions ----------
class TestSmartImportRegression:
    def test_gmail_status_configured(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gmail/status", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data.get("configured") is True
        # connected should be False for this user
        assert data.get("connected") is False

    def test_gmail_connect_returns_307(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gmail/connect",
                         params={"user_id": TEST_CLIENT_ID},
                         allow_redirects=False, timeout=10)
        assert r.status_code in (302, 307), f"Unexpected: {r.status_code}"
        assert "accounts.google.com" in r.headers.get("location", ""), \
            f"Location header not Google: {r.headers.get('location')}"

    def test_parsed_policies_list(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/documents/parsed-policies",
                         headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), (list, dict))

    def test_save_transactions_endpoint_exists(self, auth_headers):
        # Validate endpoint responds (even if to empty list)
        r = requests.post(f"{BASE_URL}/api/documents/save-transactions",
                          headers=auth_headers, json={"transactions": []}, timeout=15)
        assert r.status_code in (200, 400, 422), f"Unexpected: {r.status_code} {r.text}"


class TestTransactionsCRUDRegression:
    created_id = None

    def test_list_transactions(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/transactions", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (list, dict))

    def test_create_and_delete_transaction(self, auth_headers):
        payload = {
            "amount": 100,
            "type": "expense",
            "category": "Other",
            "description": "TEST_iteration18_txn",
            "date": "2026-01-10",
        }
        r = requests.post(f"{BASE_URL}/api/transactions", headers=auth_headers,
                          json=payload, timeout=15)
        assert r.status_code in (200, 201), f"Create failed: {r.status_code} {r.text}"
        created = r.json()
        txn_id = created.get("id") or created.get("_id") or created.get("transaction", {}).get("id")
        assert txn_id, f"No id returned: {created}"

        # Delete it
        d = requests.delete(f"{BASE_URL}/api/transactions/{txn_id}",
                            headers=auth_headers, timeout=10)
        assert d.status_code in (200, 204), f"Delete failed: {d.status_code} {d.text}"
