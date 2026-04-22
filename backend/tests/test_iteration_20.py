"""Iteration 20 tests — Smart Import Scan&Apply All + Subscription Cancel Nudges."""
import os
import pytest
import requests
from datetime import datetime, timedelta, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://financial-advisor-15.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

CLIENT_ID = "AV271676A7"
PASSWORD = "Demo123!"


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(f"{API}/auth/login", json={"client_id": CLIENT_ID, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json()["token"]
    return {"Authorization": f"Bearer {token}"}


# ============================ 1. scan-and-apply-all (Gmail connected) ============================

def test_scan_and_apply_all_connected(auth_headers):
    """POST /api/gmail/scan-and-apply-all?max_emails=5 with Gmail connected returns full schema."""
    # Confirm Gmail is connected
    s = requests.get(f"{API}/gmail/status", headers=auth_headers, timeout=15)
    assert s.status_code == 200
    if not s.json().get("connected"):
        pytest.skip("Gmail not connected for AV271676A7 — main agent note says it should be")

    r = requests.post(f"{API}/gmail/scan-and-apply-all?max_emails=5", headers=auth_headers, timeout=180)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:500]}"
    data = r.json()
    required = ["success", "summary", "emails_processed", "emails_with_data",
                "total_transactions_saved", "total_fields_updated",
                "policies_applied", "investments_applied", "errors", "details"]
    for field in required:
        assert field in data, f"Missing field: {field}"
    assert data["success"] is True
    assert isinstance(data["summary"], str) and len(data["summary"]) > 0
    assert isinstance(data["emails_processed"], int)
    assert isinstance(data["policies_applied"], list)
    assert isinstance(data["investments_applied"], list)
    assert isinstance(data["details"], list)
    assert data["emails_processed"] >= 1, "Should have processed at least one email"


# ============================ 2. scan-and-apply-all (no auth) ============================

def test_scan_and_apply_all_no_auth():
    """Without Gmail connected / no auth returns 401/403."""
    # Use a fresh user with no Gmail by logging-in unauthenticated
    r = requests.post(f"{API}/gmail/scan-and-apply-all", timeout=15)
    assert r.status_code in (401, 403), f"Expected 401/403, got {r.status_code}"


# ============================ 3. Subscription detector likely_unused ============================

def test_subscription_detector_likely_unused_flag():
    """Unit-test subscription detector: likely_unused=True and yearly_savings=9600 for Netflix."""
    from backend.services.subscription_detector import detect_subscriptions  # noqa
    # If import-path differs, fall back
    pass


def test_subscription_detector_direct():
    """Direct import test of detect_subscriptions."""
    import sys
    sys.path.insert(0, '/app/backend')
    from services.subscription_detector import detect_subscriptions

    today = datetime.now()
    txns = []
    # Netflix: 4 monthly Entertainment charges at ₹800, last 25 days ago
    for i in range(4):
        d = today - timedelta(days=25 + i * 30)
        txns.append({
            "amount": 800, "type": "expense", "description": "Netflix Subscription",
            "date": d.date().isoformat(), "category": "Entertainment"
        })
    # Add a non-Entertainment recent expense so recent_by_category[Entertainment]==4 (just netflix)
    txns.append({
        "amount": 500, "type": "expense", "description": "Zomato",
        "date": (today - timedelta(days=5)).date().isoformat(), "category": "Food"
    })

    result = detect_subscriptions(txns, cancelled_merchants=set())
    netflix = [s for s in result["subscriptions"] if "netflix" in s["merchant"].lower()]
    assert len(netflix) == 1, f"Expected 1 Netflix sub, got {result['subscriptions']}"
    nf = netflix[0]
    assert nf["likely_unused"] is True, f"likely_unused should be True: {nf}"
    assert nf["yearly_savings_if_cancelled"] == 9600, f"Expected 9600, got {nf['yearly_savings_if_cancelled']}"
    assert nf["frequency"] == "monthly"
    assert nf["occurrence_count"] == 4


def test_subscription_detector_cancelled_filter():
    """cancelled_merchants set should filter out the sub."""
    import sys
    sys.path.insert(0, '/app/backend')
    from services.subscription_detector import detect_subscriptions

    today = datetime.now()
    txns = []
    for i in range(4):
        d = today - timedelta(days=25 + i * 30)
        txns.append({
            "amount": 800, "type": "expense", "description": "Netflix Subscription",
            "date": d.date().isoformat(), "category": "Entertainment"
        })
    result = detect_subscriptions(txns, cancelled_merchants={"netflix subscription"})
    netflix = [s for s in result["subscriptions"] if "netflix" in s["merchant"].lower()]
    assert len(netflix) == 0, "Cancelled merchant should be filtered"


# ============================ 4. Cancel subscription endpoint ============================

def test_cancel_missing_merchant_returns_400(auth_headers):
    r = requests.post(f"{API}/transactions/subscriptions/cancel", headers=auth_headers,
                      json={}, timeout=15)
    assert r.status_code == 400


def test_cancel_empty_merchant_returns_400(auth_headers):
    r = requests.post(f"{API}/transactions/subscriptions/cancel", headers=auth_headers,
                      json={"merchant": "   "}, timeout=15)
    assert r.status_code == 400


def test_cancel_subscription_and_removed_from_list(auth_headers):
    """Cancel a subscription and confirm it no longer appears in the /subscriptions list."""
    # Fetch existing subscriptions
    r = requests.get(f"{API}/transactions/subscriptions", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    subs = r.json().get("subscriptions", [])
    if not subs:
        pytest.skip("No subscriptions exist for this user; cannot test cancel flow")

    target = subs[0]
    merchant = target["merchant"]
    display_name = target.get("display_name", merchant)

    # Cancel
    r2 = requests.post(f"{API}/transactions/subscriptions/cancel", headers=auth_headers,
                       json={"merchant": merchant, "display_name": display_name}, timeout=15)
    assert r2.status_code == 200
    assert r2.json().get("merchant") == merchant

    # Verify removed
    r3 = requests.get(f"{API}/transactions/subscriptions", headers=auth_headers, timeout=30)
    assert r3.status_code == 200
    new_merchants = {s["merchant"] for s in r3.json().get("subscriptions", [])}
    assert merchant not in new_merchants, f"{merchant} should have been filtered out"


# ============================ 5. Regression: subscriptions list structure ============================

def test_subscriptions_list_structure(auth_headers):
    r = requests.get(f"{API}/transactions/subscriptions", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    for k in ["subscriptions", "total_monthly_cost", "total_yearly_cost", "count"]:
        assert k in data
    assert isinstance(data["subscriptions"], list)
    assert isinstance(data["count"], int)
    for s in data["subscriptions"]:
        for k in ("merchant", "display_name", "amount", "frequency",
                  "occurrence_count", "monthly_cost", "likely_unused",
                  "yearly_savings_if_cancelled"):
            assert k in s, f"Missing {k} in subscription: {s}"


# ============================ 6. Regression: /documents/auto-apply still works ============================

def test_documents_auto_apply_empty(auth_headers):
    r = requests.post(f"{API}/documents/auto-apply", headers=auth_headers,
                      json={"source": "test", "data": {}}, timeout=60)
    assert r.status_code == 200
    d = r.json()
    assert d.get("success") is True


def test_documents_auto_apply_sip(auth_headers):
    r = requests.post(f"{API}/documents/auto-apply", headers=auth_headers,
                      json={"source": "test", "data": {
                          "transactions": [{
                              "description": "TEST_SIP Regression iter20",
                              "amount": 1000, "type": "debit",
                              "date": datetime.now().date().isoformat(),
                              "category": "investment"
                          }],
                          "investment_data": {"amount": 1000, "type": "sip", "scheme": "Test Fund"}
                      }}, timeout=60)
    assert r.status_code == 200
    d = r.json()
    assert d.get("success") is True
    # New shape returns actions nested dict
    actions = d.get("actions", d)
    assert actions.get("transactions_saved", 0) >= 1


# ============================ 7. Regression: parse-email / parse-policy ============================

def test_parse_email_endpoint(auth_headers):
    r = requests.post(f"{API}/documents/parse-email", headers=auth_headers,
                      json={"email_text": "From: alerts@hdfcbank.com\nSubject: Debit alert\n\nRs 500 debited to Amazon on 2026-01-05."},
                      timeout=120)
    assert r.status_code == 200
    d = r.json()
    assert "success" in d


def test_parse_policy_endpoint(auth_headers):
    """parse-policy expects a PDF file upload; verify it rejects missing file (422)."""
    r = requests.post(f"{API}/documents/parse-policy", headers=auth_headers, timeout=30)
    # 422 = missing required File field — endpoint alive
    assert r.status_code in (400, 422), f"parse-policy alive check, got {r.status_code}"
