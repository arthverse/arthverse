"""
Backend API Tests for Iteration 17 - Smart Import Module
Covers Gmail OAuth routes and document parsing routes.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


@pytest.fixture(scope="module")
def auth_token():
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "client_id": TEST_CLIENT_ID,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ============ Gmail Routes ============
class TestGmailRoutes:
    def test_gmail_status_configured(self, auth_headers):
        """GET /api/gmail/status should return configured:true (creds set)."""
        r = requests.get(f"{BASE_URL}/api/gmail/status", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("configured") is True, f"Expected configured:true, got {data}"
        assert "connected" in data

    def test_gmail_connect_redirect(self):
        """GET /api/gmail/connect should 307 redirect to accounts.google.com."""
        r = requests.get(
            f"{BASE_URL}/api/gmail/connect",
            params={"user_id": "test_user_smartimport"},
            allow_redirects=False
        )
        assert r.status_code in (302, 307), f"Expected redirect, got {r.status_code}: {r.text[:300]}"
        location = r.headers.get("Location", "")
        assert "accounts.google.com" in location, f"Location missing google OAuth: {location}"
        assert "client_id=" in location, f"Location missing client_id: {location}"

    def test_gmail_emails_without_connection(self, auth_headers):
        """GET /api/gmail/emails should return 403 when Gmail not connected."""
        r = requests.get(f"{BASE_URL}/api/gmail/emails", headers=auth_headers)
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"
        body = r.json()
        detail = body.get("detail", "")
        assert "not connected" in detail.lower() or "connect" in detail.lower(), f"Unclear error: {detail}"


# ============ Document Parsing Routes ============
class TestDocumentRoutes:
    def test_parse_email_bank_statement(self, auth_headers):
        """POST /api/documents/parse-email with bank email -> extracted transactions."""
        email_text = """
        From: alerts@icicibank.com
        Subject: Transaction Alert

        Dear Customer, your ICICI Bank Account XX1234 has been debited with INR 2,500.00
        on 15-Jan-2026 towards UPI/BigBasket/Grocery. Available balance: INR 45,200.
        Also on 16-Jan-2026, credited INR 75,000 as salary from ACME Corp.
        """
        r = requests.post(
            f"{BASE_URL}/api/documents/parse-email",
            json={"email_text": email_text},
            headers=auth_headers,
            timeout=90,
        )
        assert r.status_code == 200, f"Parse-email failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("success") is True, f"Expected success:true, got {data}"
        assert "data" in data, "Response missing 'data'"

    def test_parse_email_insurance_renewal(self, auth_headers):
        """POST /api/documents/parse-email with insurance renewal -> insurance_data."""
        email_text = """
        From: renewals@hdfcergo.com
        Subject: Your Health Insurance Policy Renewal

        Dear Customer, your HDFC ERGO Health Optima policy POL-HLT-998877 is due for renewal.
        Sum Insured: INR 10,00,000. Premium: INR 18,500. Policy Type: Health Insurance (Family Floater).
        Due date: 28-Feb-2026.
        """
        r = requests.post(
            f"{BASE_URL}/api/documents/parse-email",
            json={"email_text": email_text},
            headers=auth_headers,
            timeout=90,
        )
        assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("success") is True
        # Parsed data could have insurance_data, policy info, etc.
        parsed = data.get("data", {})
        # Flexible assertion — we just ensure some policy/insurance related content
        parsed_str = str(parsed).lower()
        assert any(k in parsed_str for k in ["insurance", "policy", "health", "premium", "sum_insured", "sum_assured"]), \
            f"No insurance fields detected in parsed data: {parsed}"

    def test_parse_email_missing_body(self, auth_headers):
        """POST /api/documents/parse-email with empty body -> 400."""
        r = requests.post(
            f"{BASE_URL}/api/documents/parse-email",
            json={"email_text": ""},
            headers=auth_headers,
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"

    def test_parsed_policies_list(self, auth_headers):
        """GET /api/documents/parsed-policies should return list."""
        r = requests.get(f"{BASE_URL}/api/documents/parsed-policies", headers=auth_headers)
        assert r.status_code == 200, f"Failed: {r.text}"
        data = r.json()
        assert "policies" in data
        assert isinstance(data["policies"], list)

    def test_apply_policy_health(self, auth_headers):
        """POST /api/documents/apply-policy with health type -> updated_fields."""
        payload = {
            "policy_data": {
                "policy_type": "health",
                "cover_amount": 1000000,
                "premium_amount": 18500,
            }
        }
        r = requests.post(
            f"{BASE_URL}/api/documents/apply-policy",
            json=payload,
            headers=auth_headers,
        )
        assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
        data = r.json()
        assert "updated_fields" in data
        fields = data["updated_fields"]
        assert "has_health_insurance" in fields
        assert "health_insurance_cover" in fields
        assert "health_insurance_premium_annual" in fields

    def test_parse_policy_invalid_file(self, auth_headers):
        """POST /api/documents/parse-policy with non-PDF -> 400."""
        files = {"file": ("bad.txt", b"not a pdf", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/documents/parse-policy",
            files=files,
            headers=auth_headers,
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "").lower()
        assert "pdf" in detail


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
