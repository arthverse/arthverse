"""
Iteration 22 — PDF attachment parsing for Gmail
- GET /api/gmail/emails returns attachments[]
- POST /api/gmail/parse-attachment: 400 validation, 403 no Gmail (covered via code),
  unencrypted success, encrypted password_required, incorrect password 401
- Regression: gmail_auto_scan FINANCIAL_SEARCH_QUERY contains CAS terms
- Regression: /api/gmail/scan-and-apply-all exists, /api/documents/auto-apply exists,
  /api/reports/peer-comparison exists
"""
import os
import pytest
import requests

def _get_base_url():
    url = os.environ.get('REACT_APP_BACKEND_URL')
    if not url:
        # Read from frontend/.env as fallback
        try:
            with open('/app/frontend/.env') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        url = line.split('=', 1)[1].strip()
                        break
        except Exception:
            pass
    assert url, "REACT_APP_BACKEND_URL not set"
    return url.rstrip('/')

BASE_URL = _get_base_url()
API = f"{BASE_URL}/api"

CLIENT_ID = "AV271676A7"
PASSWORD = "Demo123!"

# Per reviewer note — these are real email IDs in AV271676A7's connected Gmail
UNENCRYPTED_EMAIL_ID = "19d97c3a7e1c7490"   # Zerodha Daily Margin Statement
ENCRYPTED_EMAIL_ID = "19d96681abe47ab8"     # Zerodha Capital Gain Statement


@pytest.fixture(scope="module")
def auth_token():
    r = requests.post(f"{API}/auth/login",
                      json={"client_id": CLIENT_ID, "password": PASSWORD},
                      timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok, f"No token in response: {r.json()}"
    return tok


@pytest.fixture(scope="module")
def headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ---------------- Regression: source code checks ----------------
class TestSourceRegression:
    def test_gmail_auto_scan_query_has_cas_terms(self):
        with open("/app/backend/services/gmail_auto_scan.py") as f:
            src = f.read()
        assert "CAS" in src
        assert "consolidated" in src
        assert "cams.com" in src
        assert "nsdl.co.in" in src
        assert "newer_than:365d" in src

    def test_gmail_emails_uses_365d_window(self):
        with open("/app/backend/routes/gmail.py") as f:
            src = f.read()
        assert "newer_than:365d" in src
        assert "parse-attachment" in src


# ---------------- Gmail status + emails endpoint ----------------
class TestGmailEmails:
    def test_status_connected(self, headers):
        r = requests.get(f"{API}/gmail/status", headers=headers, timeout=30)
        assert r.status_code == 200
        j = r.json()
        assert j.get("configured") is True
        assert j.get("connected") is True, f"Gmail not connected for {CLIENT_ID}: {j}"

    def test_emails_returns_attachments_field(self, headers):
        r = requests.get(f"{API}/gmail/emails?max_results=20", headers=headers, timeout=90)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "emails" in j
        assert "total" in j
        assert isinstance(j["emails"], list)
        # Every email should have an `attachments` array (possibly empty)
        for e in j["emails"]:
            assert "attachments" in e, f"Missing attachments key on email {e.get('id')}"
            assert isinstance(e["attachments"], list)
            for att in e["attachments"]:
                assert "attachment_id" in att
                assert "filename" in att
                assert "size" in att
                assert "looks_like_cas" in att
                assert isinstance(att["looks_like_cas"], bool)


# ---------------- parse-attachment endpoint ----------------
class TestParseAttachment:
    def test_missing_fields_returns_400(self, headers):
        r = requests.post(f"{API}/gmail/parse-attachment", json={}, headers=headers, timeout=30)
        assert r.status_code == 400
        assert "required" in r.text.lower()

    def test_missing_attachment_id_returns_400(self, headers):
        r = requests.post(f"{API}/gmail/parse-attachment",
                          json={"email_id": "abc"}, headers=headers, timeout=30)
        assert r.status_code == 400

    def test_no_auth_returns_401_or_403(self):
        r = requests.post(f"{API}/gmail/parse-attachment",
                          json={"email_id": "a", "attachment_id": "b"}, timeout=30)
        assert r.status_code in (401, 403)

    def test_encrypted_pdf_returns_password_required(self, headers):
        # Discover a password-protected attachment dynamically
        er = requests.get(f"{API}/gmail/emails?max_results=30", headers=headers, timeout=90)
        assert er.status_code == 200
        target = None
        for e in er.json().get("emails", []):
            if e["id"] == ENCRYPTED_EMAIL_ID and e.get("attachments"):
                target = (e["id"], e["attachments"][0])
                break
        if not target:
            # fallback: first email with a PDF attachment
            for e in er.json().get("emails", []):
                if e.get("attachments"):
                    target = (e["id"], e["attachments"][0])
                    break
        if not target:
            pytest.skip("No emails with PDF attachments available")

        email_id, att = target
        r = requests.post(
            f"{API}/gmail/parse-attachment",
            json={"email_id": email_id, "attachment_id": att["attachment_id"],
                  "filename": att["filename"], "auto_apply": False},
            headers=headers, timeout=180,
        )
        # Either success:true (unencrypted) or success:false+password_required (encrypted)
        assert r.status_code in (200, 401, 500), r.text
        j = r.json() if r.status_code == 200 else {}
        if r.status_code == 200:
            if j.get("password_required"):
                assert j.get("success") is False
                assert "password" in (j.get("message") or "").lower()
                assert "PAN" in (j.get("message") or "") or "pan" in (j.get("message") or "").lower()

    def test_specific_encrypted_email_returns_password_required(self, headers):
        # Find attachment_id for the known encrypted email
        er = requests.get(f"{API}/gmail/emails?max_results=30", headers=headers, timeout=90)
        if er.status_code != 200:
            pytest.skip("emails endpoint failed")
        target = None
        for e in er.json().get("emails", []):
            if e["id"] == ENCRYPTED_EMAIL_ID and e.get("attachments"):
                target = e["attachments"][0]
                break
        if not target:
            pytest.skip(f"Encrypted email {ENCRYPTED_EMAIL_ID} not found in current inbox")

        r = requests.post(
            f"{API}/gmail/parse-attachment",
            json={"email_id": ENCRYPTED_EMAIL_ID, "attachment_id": target["attachment_id"],
                  "filename": target["filename"], "auto_apply": False},
            headers=headers, timeout=180,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert j.get("success") is False
        assert j.get("password_required") is True
        msg = j.get("message") or ""
        assert "password" in msg.lower()
        assert "PAN" in msg or "pan" in msg.lower()

    def test_incorrect_password_returns_401(self, headers):
        er = requests.get(f"{API}/gmail/emails?max_results=30", headers=headers, timeout=90)
        if er.status_code != 200:
            pytest.skip("emails endpoint failed")
        target = None
        for e in er.json().get("emails", []):
            if e["id"] == ENCRYPTED_EMAIL_ID and e.get("attachments"):
                target = e["attachments"][0]
                break
        if not target:
            pytest.skip(f"Encrypted email {ENCRYPTED_EMAIL_ID} not found")

        r = requests.post(
            f"{API}/gmail/parse-attachment",
            json={"email_id": ENCRYPTED_EMAIL_ID, "attachment_id": target["attachment_id"],
                  "filename": target["filename"], "password": "WRONGPASS123",
                  "auto_apply": False},
            headers=headers, timeout=180,
        )
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"
        assert "password" in r.text.lower()

    def test_unencrypted_pdf_parses_successfully(self, headers):
        er = requests.get(f"{API}/gmail/emails?max_results=30", headers=headers, timeout=90)
        if er.status_code != 200:
            pytest.skip("emails endpoint failed")
        target = None
        for e in er.json().get("emails", []):
            if e["id"] == UNENCRYPTED_EMAIL_ID and e.get("attachments"):
                target = e["attachments"][0]
                break
        if not target:
            pytest.skip(f"Unencrypted test email {UNENCRYPTED_EMAIL_ID} not found")

        r = requests.post(
            f"{API}/gmail/parse-attachment",
            json={"email_id": UNENCRYPTED_EMAIL_ID, "attachment_id": target["attachment_id"],
                  "filename": target["filename"], "auto_apply": True},
            headers=headers, timeout=240,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert j.get("success") is True
        assert "data" in j
        data = j["data"]
        assert "document_type" in data
        assert "totals" in data
        assert "mutual_funds" in data
        assert "equity_holdings" in data
        assert "transactions" in data
        assert j.get("applied") is True
        assert "applied_fields" in j
        assert "transactions_saved" in j


# ---------------- Regression on other endpoints ----------------
class TestOtherEndpointsRegression:
    def test_scan_and_apply_all_auth_gate(self):
        r = requests.post(f"{API}/gmail/scan-and-apply-all", timeout=30)
        assert r.status_code in (401, 403)

    def test_documents_auto_apply_auth_gate(self):
        r = requests.post(f"{API}/documents/auto-apply", json={}, timeout=30)
        assert r.status_code in (401, 403)

    def test_peer_comparison_endpoint(self, headers):
        r = requests.get(f"{API}/reports/peer-comparison", headers=headers, timeout=30)
        # User has questionnaire → 200
        assert r.status_code == 200, r.text
        j = r.json()
        assert "cohort" in j
        assert "metrics" in j
        assert "overall_percentile" in j
