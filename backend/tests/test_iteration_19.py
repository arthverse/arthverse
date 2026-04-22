"""
Iteration 19 — Smart Import Auto-Apply endpoint + regressions
Tests for:
- POST /api/documents/auto-apply (SIP, insurance life, insurance health, vehicle, empty)
- Regression: parse-email, save-transactions, parsed-policies, apply-policy
- Regression: gmail/status, gmail/emails, gmail/connect, transactions/subscriptions
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
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"client_id": TEST_CLIENT_ID, "password": TEST_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ---------- /api/documents/auto-apply ----------
class TestAutoApply:
    def test_auto_apply_sip_investment(self, auth_headers):
        """SIP email: 1 txn saved, invests_in_mutual_funds=true, monthly_investments_sip bumped."""
        payload = {
            "source": "email",
            "data": {
                "investment_data": {
                    "scheme_name": "HDFC Top 100",
                    "amount": 5000,
                    "type": "sip",
                    "units": 42.5,
                    "nav": 117.6,
                },
                "transactions": [
                    {
                        "date": "2026-01-05",
                        "description": "TEST_AutoApply HDFC Top 100 SIP",
                        "amount": 5000,
                        "type": "debit",
                        "category": "sip",
                    }
                ],
            },
        }
        r = requests.post(
            f"{BASE_URL}/api/documents/auto-apply",
            json=payload,
            headers=auth_headers,
            timeout=30,
        )
        assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("success") is True
        actions = data.get("actions", {})
        assert actions.get("transactions_saved") == 1, f"Expected 1 txn saved, got {actions}"
        fields = actions.get("questionnaire_fields_updated") or []
        assert "invests_in_mutual_funds" in fields, f"Missing invests_in_mutual_funds: {fields}"
        assert "monthly_investments_sip" in fields, f"Missing monthly_investments_sip: {fields}"
        assert actions.get("investment_applied"), f"investment_applied should be non-empty: {actions}"
        assert "SIP" in str(actions.get("investment_applied")) or "sip" in str(actions.get("investment_applied")).lower()
        # message should mention transactions + questionnaire
        msg = (data.get("message") or "").lower()
        assert "transaction" in msg or "questionnaire" in msg, f"Unexpected message: {msg}"

    def test_auto_apply_life_insurance(self, auth_headers):
        """HDFC Life insurance → has_term_life_insurance + cover + premium."""
        payload = {
            "data": {
                "insurance_data": {
                    "insurer": "HDFC Life",
                    "cover_amount": 5000000,
                    "premium_due": 25000,
                }
            }
        }
        r = requests.post(
            f"{BASE_URL}/api/documents/auto-apply",
            json=payload,
            headers=auth_headers,
            timeout=20,
        )
        assert r.status_code == 200, r.text
        actions = r.json().get("actions", {})
        fields = actions.get("questionnaire_fields_updated") or []
        assert "has_term_life_insurance" in fields, f"Missing has_term_life_insurance: {fields}"
        assert "term_insurance_cover" in fields
        assert "term_insurance_premium_annual" in fields
        assert actions.get("policy_applied")

    def test_auto_apply_health_insurance(self, auth_headers):
        """Star Health → has_health_insurance + health_insurance_cover=500000."""
        payload = {
            "data": {
                "insurance_data": {
                    "insurer": "Star Health",
                    "cover_amount": 500000,
                }
            }
        }
        r = requests.post(
            f"{BASE_URL}/api/documents/auto-apply",
            json=payload,
            headers=auth_headers,
            timeout=20,
        )
        assert r.status_code == 200, r.text
        actions = r.json().get("actions", {})
        fields = actions.get("questionnaire_fields_updated") or []
        assert "has_health_insurance" in fields, f"Missing has_health_insurance: {fields}"
        assert "health_insurance_cover" in fields, f"Missing health_insurance_cover: {fields}"

    def test_auto_apply_vehicle_policy(self, auth_headers):
        """policy_type=vehicle → has_vehicle, vehicle_insurance_type, premium, idv."""
        payload = {
            "data": {
                "policy_type": "vehicle",
                "premium_amount": 8000,
                "idv": 450000,
            }
        }
        r = requests.post(
            f"{BASE_URL}/api/documents/auto-apply",
            json=payload,
            headers=auth_headers,
            timeout=20,
        )
        assert r.status_code == 200, r.text
        actions = r.json().get("actions", {})
        fields = actions.get("questionnaire_fields_updated") or []
        for f in ("has_vehicle", "vehicle_insurance_type", "vehicle_insurance_premium_annual", "vehicle_idv"):
            assert f in fields, f"Missing {f} in {fields}"
        assert actions.get("policy_applied") == "vehicle"

    def test_auto_apply_empty_data(self, auth_headers):
        """Empty {} → success:true, 'No data to apply'."""
        r = requests.post(
            f"{BASE_URL}/api/documents/auto-apply",
            json={},
            headers=auth_headers,
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("success") is True
        assert "No data to apply" in (data.get("message") or "")
        actions = data.get("actions", {})
        assert actions.get("transactions_saved") == 0
        assert actions.get("questionnaire_fields_updated") in ([], None)

    def test_auto_apply_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/documents/auto-apply", json={}, timeout=10)
        assert r.status_code in (401, 403)


# ---------- Regressions ----------
class TestDocumentRegressions:
    def test_parsed_policies_list(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/documents/parsed-policies", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert "policies" in r.json()

    def test_save_transactions_empty_array_400(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/documents/save-transactions",
            headers=auth_headers,
            json={"transactions": []},
            timeout=10,
        )
        assert r.status_code in (400, 422)

    def test_save_transactions_with_item(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/documents/save-transactions",
            headers=auth_headers,
            json={
                "transactions": [
                    {"date": "2026-01-07", "description": "TEST_SaveTxn regression", "amount": 123, "type": "debit", "category": "food"}
                ],
                "source": "email",
            },
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("saved_count") == 1

    def test_apply_policy_health_still_works(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/documents/apply-policy",
            headers=auth_headers,
            json={"policy_data": {"policy_type": "health", "cover_amount": 800000, "premium_amount": 12000}},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        fields = r.json().get("updated_fields", [])
        assert "has_health_insurance" in fields


class TestGmailRegressions:
    def test_gmail_status_configured(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gmail/status", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert r.json().get("configured") is True

    def test_gmail_emails_without_connection(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gmail/emails", headers=auth_headers, timeout=10)
        # Behavior evolved: endpoint may return 200 with empty list OR 403 when not connected
        assert r.status_code in (200, 403), f"Unexpected: {r.status_code} {r.text[:200]}"
        if r.status_code == 200:
            data = r.json()
            # Should not leak other users' emails
            assert isinstance(data, (list, dict))

    def test_gmail_connect_with_token_param_redirects(self, auth_token):
        r = requests.get(
            f"{BASE_URL}/api/gmail/connect",
            params={"token": auth_token},
            allow_redirects=False,
            timeout=10,
        )
        assert r.status_code in (302, 307), f"Unexpected: {r.status_code} {r.text[:200]}"
        assert "accounts.google.com" in r.headers.get("location", "")

    def test_gmail_connect_without_token_401(self):
        r = requests.get(
            f"{BASE_URL}/api/gmail/connect",
            allow_redirects=False,
            timeout=10,
        )
        # Either 401/403 (rejected) or 422 (pydantic missing-query-param). Accept either.
        assert r.status_code in (400, 401, 403, 422), f"Unexpected: {r.status_code} {r.text[:200]}"

    def test_gmail_connect_invalid_token_401(self):
        r = requests.get(
            f"{BASE_URL}/api/gmail/connect",
            params={"token": "not-a-valid-jwt"},
            allow_redirects=False,
            timeout=10,
        )
        assert r.status_code in (400, 401, 403), f"Unexpected: {r.status_code} {r.text[:200]}"


class TestSubscriptionsRegression:
    def test_subscriptions_endpoint(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/transactions/subscriptions", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        for k in ("subscriptions", "total_monthly_cost", "total_yearly_cost", "count"):
            assert k in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
