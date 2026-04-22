"""
Iteration 21 tests — Peer Comparison endpoint + regression checks for iterations 17-20.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://financial-advisor-15.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

CLIENT_ID = "AV271676A7"
PASSWORD = "Demo123!"


@pytest.fixture(scope="session")
def auth_token():
    r = requests.post(f"{API}/auth/login", json={"client_id": CLIENT_ID, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json().get("token") or r.json().get("access_token")
    assert token, f"No token in login response: {r.json()}"
    return token


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ============ Peer Comparison ============

class TestPeerComparison:
    def test_auth_required(self):
        r = requests.get(f"{API}/reports/peer-comparison", timeout=30)
        assert r.status_code in (401, 403), f"Expected 401/403 got {r.status_code}"

    def test_invalid_token(self):
        r = requests.get(f"{API}/reports/peer-comparison", headers={"Authorization": "Bearer invalid"}, timeout=30)
        assert r.status_code in (401, 403)

    def test_peer_comparison_success(self, auth_headers):
        r = requests.get(f"{API}/reports/peer-comparison", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"status={r.status_code} body={r.text}"
        data = r.json()
        # Schema checks
        assert "cohort" in data
        assert "overall_percentile" in data
        assert "overall_rating" in data
        assert "metrics" in data
        assert "insights" in data
        # Cohort
        cohort = data["cohort"]
        assert "city_tier" in cohort
        assert "age_bracket" in cohort
        assert "description" in cohort
        # The test user is documented as tier_2 + 30-39
        assert cohort["city_tier"] == "tier_2", f"Got city_tier={cohort['city_tier']}"
        assert cohort["age_bracket"] == "30-39", f"Got age_bracket={cohort['age_bracket']}"
        assert "30-39" in cohort["description"]
        # Overall
        assert isinstance(data["overall_percentile"], int)
        assert 0 <= data["overall_percentile"] <= 100
        assert isinstance(data["overall_rating"], str)
        # Metrics
        metrics = data["metrics"]
        assert isinstance(metrics, list)
        assert len(metrics) == 6
        expected_labels = {"Net Worth", "Savings Rate", "Investment Ratio", "Emergency Fund", "Monthly SIP", "Life Cover Multiplier"}
        actual_labels = {m["label"] for m in metrics}
        assert expected_labels == actual_labels, f"Missing labels: {expected_labels - actual_labels}"
        for m in metrics:
            assert "user_value" in m
            assert "peer_median" in m
            assert "peer_top_quartile" in m
            assert "tier" in m
            assert "percentile" in m
            assert "format" in m
            assert m["format"] in ("inr", "percent", "months", "x")
        # Insights
        assert isinstance(data["insights"], list)
        assert len(data["insights"]) <= 3


# ============ Regression: payment/status (SINGULAR) ============

class TestPaymentStatus:
    def test_payment_status(self, auth_headers):
        r = requests.get(f"{API}/payment/status", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"status={r.status_code} body={r.text}"
        data = r.json()
        assert "has_premium" in data
        assert isinstance(data["has_premium"], bool)


# ============ Regression: Gmail ============

class TestGmailStatus:
    def test_gmail_status(self, auth_headers):
        r = requests.get(f"{API}/gmail/status", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "connected" in data

    def test_scan_apply_all_requires_auth(self):
        # Do NOT actually trigger scan (costs GPT budget) — just verify auth gate.
        r = requests.post(f"{API}/gmail/scan-and-apply-all?max_emails=1", timeout=30)
        assert r.status_code in (401, 403), f"Expected auth failure, got {r.status_code}"


# ============ Regression: subscriptions ============

class TestSubscriptions:
    def test_list_subscriptions(self, auth_headers):
        r = requests.get(f"{API}/transactions/subscriptions", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        # Typically returns {"subscriptions": [...]} or list
        assert isinstance(data, (list, dict))

    def test_cancel_missing_merchant(self, auth_headers):
        r = requests.post(f"{API}/transactions/subscriptions/cancel", headers=auth_headers, json={}, timeout=30)
        assert r.status_code == 400


# ============ Regression: documents auto-apply ============

class TestDocumentsAutoApply:
    def test_auto_apply_requires_auth(self):
        r = requests.post(f"{API}/documents/auto-apply", json={"extracted_data": {}}, timeout=30)
        assert r.status_code in (401, 403)


# ============ No-questionnaire scenario ============
# Create a fresh user with no questionnaire to verify 400 path

class TestPeerComparisonNoQuestionnaire:
    def test_returns_400_for_user_without_questionnaire(self):
        import uuid
        suffix = uuid.uuid4().hex[:6]
        signup_payload = {
            "email": f"test_peer_{suffix}@example.com",
            "password": "Test1234!",
            "name": f"TestPeer{suffix}",
            "age": 28,
        }
        r = requests.post(f"{API}/auth/signup", json=signup_payload, timeout=30)
        if r.status_code not in (200, 201):
            pytest.skip(f"Signup not available or failed: {r.status_code} {r.text[:200]}")
        body = r.json()
        token = body.get("token") or body.get("access_token")
        if not token:
            # Try login
            lr = requests.post(f"{API}/auth/login", json={"client_id": body.get("client_id"), "password": "Test1234!"}, timeout=30)
            if lr.status_code == 200:
                token = lr.json().get("token")
        if not token:
            pytest.skip("Could not obtain token for fresh user")
        headers = {"Authorization": f"Bearer {token}"}
        r2 = requests.get(f"{API}/reports/peer-comparison", headers=headers, timeout=30)
        assert r2.status_code == 400, f"Expected 400 got {r2.status_code}: {r2.text}"
        data = r2.json()
        detail = str(data.get("detail", "")).lower()
        assert "profile" in detail or "questionnaire" in detail, f"Unexpected error: {data}"
