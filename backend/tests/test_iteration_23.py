"""
Iteration 23 — Auto-try user's saved PAN for encrypted PDFs + Credit Card statement support

Covers:
1. POST /api/gmail/parse-attachment on encrypted PDF
   - When user has NO PAN saved → {success:false, password_required:true, tried_your_pan:false,
     message mentions 'CAS / credit card / Zerodha'}
   - When user has WRONG 10-char PAN saved → {success:false, password_required:true,
     tried_your_pan:true, message starts with "We tried your saved PAN but it didn't work"}
2. Source-level verification: pdf_attachment_parser.parse_cas_pdf prompt contains
   credit_card_statement enum + credit_card object with issuer/card_number_last4/
   total_due/credit_limit/purchases_debits fields
3. Source-level verification: cas_to_questionnaire_updates maps credit_card fields
   (credit_limit → has_credit_card + credit_card_limit, total_due →
   credit_card_outstanding, purchases_debits → monthly_credit_card_spend)
4. Source-level: /api/gmail/emails query now has 'card statement', 'payment due',
   'bill' subjects + 'sbicard.com', 'americanexpress', 'hdfcbank.net', 'axisbank.com' senders.
   looks_like_cas heuristic includes 'credit', 'card', 'bill'.
5. Regression: /api/gmail/status, /api/gmail/scan-and-apply-all, /api/documents/auto-apply,
   /api/reports/peer-comparison, /api/transactions/subscriptions still reachable.
"""
import os
import pytest
import requests

# ---------- Config ----------
def _get_base_url():
    url = os.environ.get('REACT_APP_BACKEND_URL')
    if not url:
        with open('/app/frontend/.env') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    url = line.split('=', 1)[1].strip().strip('"')
                    break
    assert url, "REACT_APP_BACKEND_URL not set"
    return url.rstrip('/')

BASE_URL = _get_base_url()
API = f"{BASE_URL}/api"

CLIENT_ID = "AV271676A7"
PASSWORD = "Demo123!"

# Real encrypted Zerodha Capital Gain email from AV271676A7's Gmail (iter-22 ref)
ENCRYPTED_EMAIL_ID = "19d96681abe47ab8"
WRONG_PAN = "ABCDE1234F"  # fake 10-char PAN for test


# ---------- Fixtures ----------
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


@pytest.fixture(scope="module")
def mongo_client():
    import pymongo
    # Load backend/.env for MONGO_URL + DB_NAME
    cfg = {}
    with open('/app/backend/.env') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                cfg[k] = v.strip().strip('"')
    client = pymongo.MongoClient(cfg.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[cfg.get('DB_NAME', 'test_database')]
    return db


@pytest.fixture(scope="module")
def user_doc(mongo_client):
    """Find the AV271676A7 user doc; yield doc then restore original pan_number."""
    u = mongo_client.users.find_one({"client_id": CLIENT_ID})
    assert u, f"User {CLIENT_ID} not found in DB"
    original_pan = u.get("pan_number")
    # Ensure PAN is UNSET at start of module
    mongo_client.users.update_one({"id": u["id"]}, {"$unset": {"pan_number": ""}})
    yield u
    # Restore original
    if original_pan:
        mongo_client.users.update_one({"id": u["id"]}, {"$set": {"pan_number": original_pan}})
    else:
        mongo_client.users.update_one({"id": u["id"]}, {"$unset": {"pan_number": ""}})


# ---------- 1. Source-level: GPT-5.2 prompt + mapping ----------
class TestCreditCardSchema:
    """Verify the GPT-5.2 prompt schema and questionnaire mapping for CC statements."""

    def test_prompt_has_credit_card_enum(self):
        with open("/app/backend/services/pdf_attachment_parser.py") as f:
            src = f.read()
        # document_type enum includes credit_card_statement
        assert "credit_card_statement" in src, "document_type enum missing credit_card_statement"
        # credit_card object exists with all required fields
        for field in ["issuer", "card_number_last4", "statement_date", "due_date",
                      "total_due", "min_due", "credit_limit", "available_credit",
                      "reward_points", "purchases_debits", "payments_credits"]:
            assert field in src, f"credit_card.{field} missing from GPT-5.2 prompt"

    def test_cas_to_questionnaire_maps_credit_card(self):
        """Unit test of cas_to_questionnaire_updates() for credit card fields."""
        import sys
        sys.path.insert(0, "/app/backend")
        from services.pdf_attachment_parser import cas_to_questionnaire_updates

        # Simulate a parsed credit card statement
        cas = {
            "document_type": "credit_card_statement",
            "totals": {},
            "credit_card": {
                "issuer": "HDFC",
                "card_number_last4": "1234",
                "total_due": 15000.50,
                "credit_limit": 200000.0,
                "purchases_debits": 18000.0,
            }
        }
        updates = cas_to_questionnaire_updates(cas)
        assert updates.get("has_credit_card") is True
        assert updates.get("credit_card_limit") == 200000.0
        assert updates.get("credit_card_outstanding") == 15000.50
        assert updates.get("monthly_credit_card_spend") == 18000.0

    def test_cas_to_questionnaire_no_cc_when_empty(self):
        import sys
        sys.path.insert(0, "/app/backend")
        from services.pdf_attachment_parser import cas_to_questionnaire_updates
        cas = {"totals": {}, "credit_card": {}}
        updates = cas_to_questionnaire_updates(cas)
        # No CC fields should be populated
        assert "has_credit_card" not in updates
        assert "credit_card_limit" not in updates
        assert "credit_card_outstanding" not in updates
        assert "monthly_credit_card_spend" not in updates


# ---------- 2. Source-level: /emails Gmail query has CC terms ----------
class TestEmailsQueryHasCreditCardTerms:
    def test_emails_query_contains_cc_subjects_and_senders(self):
        with open("/app/backend/routes/gmail.py") as f:
            src = f.read()
        # Subjects
        for term in ['"card statement"', '"payment due"', 'subject:bill']:
            assert term in src, f"Gmail /emails query missing subject filter: {term}"
        # Senders
        for sender in ["sbicard.com", "americanexpress", "hdfcbank.net", "axisbank.com"]:
            assert sender in src, f"Gmail /emails query missing sender: {sender}"

    def test_looks_like_cas_heuristic_has_cc_keywords(self):
        with open("/app/backend/routes/gmail.py") as f:
            src = f.read()
        # Find the looks_like_cas line(s) and ensure credit/card/bill are present
        for kw in ["'credit'", "'card'", "'bill'"]:
            assert kw in src, f"looks_like_cas heuristic missing keyword {kw}"


# ---------- 3. Auto-PAN logic via live endpoint ----------
class TestAutoPanLogic:
    """Hit /api/gmail/parse-attachment with the real encrypted Zerodha PDF, mutating the
    user's pan_number between calls to exercise both branches of the auto-try logic."""

    def test_encrypted_no_pan_returns_tried_false(self, headers, mongo_client, user_doc):
        """No PAN on user → tried_your_pan should be False, message should mention CAS/CC/Zerodha."""
        # Ensure PAN is unset
        mongo_client.users.update_one({"id": user_doc["id"]}, {"$unset": {"pan_number": ""}})

        # We need the encrypted email's attachment_id — fetch /emails and find it
        r = requests.get(f"{API}/gmail/emails?max_results=50", headers=headers, timeout=90)
        assert r.status_code == 200, f"/gmail/emails failed: {r.status_code} {r.text[:200]}"
        emails = r.json().get("emails", [])
        target = next((e for e in emails if e["id"] == ENCRYPTED_EMAIL_ID), None)
        if not target or not target.get("attachments"):
            pytest.skip(f"Encrypted email {ENCRYPTED_EMAIL_ID} not found in inbox (test data may have aged out)")
        att_id = target["attachments"][0]["attachment_id"]
        filename = target["attachments"][0]["filename"]

        resp = requests.post(
            f"{API}/gmail/parse-attachment",
            headers=headers,
            json={"email_id": ENCRYPTED_EMAIL_ID, "attachment_id": att_id,
                  "filename": filename, "auto_apply": False},
            timeout=120,
        )
        assert resp.status_code == 200, f"parse-attachment: {resp.status_code} {resp.text[:300]}"
        j = resp.json()
        assert j.get("success") is False
        assert j.get("password_required") is True
        assert j.get("tried_your_pan") is False, f"Expected tried_your_pan=False, got {j}"
        # Message should mention CAS / credit card / Zerodha
        msg = j.get("message", "")
        assert any(k in msg for k in ["CAS", "credit card", "Zerodha"]), \
            f"Message missing CAS/credit card/Zerodha hint: {msg}"

    def test_encrypted_wrong_pan_returns_tried_true(self, headers, mongo_client, user_doc):
        """Save a wrong 10-char PAN → endpoint should auto-try it, fail, and
        return tried_your_pan:true with helpful message."""
        # Write a wrong PAN
        mongo_client.users.update_one(
            {"id": user_doc["id"]}, {"$set": {"pan_number": WRONG_PAN}}
        )

        # Get attachment id (re-fetch to be safe)
        r = requests.get(f"{API}/gmail/emails?max_results=50", headers=headers, timeout=90)
        assert r.status_code == 200
        emails = r.json().get("emails", [])
        target = next((e for e in emails if e["id"] == ENCRYPTED_EMAIL_ID), None)
        if not target or not target.get("attachments"):
            pytest.skip(f"Encrypted email {ENCRYPTED_EMAIL_ID} not found")
        att_id = target["attachments"][0]["attachment_id"]
        filename = target["attachments"][0]["filename"]

        resp = requests.post(
            f"{API}/gmail/parse-attachment",
            headers=headers,
            json={"email_id": ENCRYPTED_EMAIL_ID, "attachment_id": att_id,
                  "filename": filename, "auto_apply": False},
            timeout=120,
        )
        # Cleanup PAN immediately
        mongo_client.users.update_one({"id": user_doc["id"]}, {"$unset": {"pan_number": ""}})

        assert resp.status_code == 200, f"parse-attachment: {resp.status_code} {resp.text[:300]}"
        j = resp.json()
        assert j.get("success") is False
        assert j.get("password_required") is True
        assert j.get("tried_your_pan") is True, f"Expected tried_your_pan=True, got {j}"
        msg = j.get("message", "")
        assert msg.startswith("We tried your saved PAN but it didn't work"), \
            f"Message should start with 'We tried your saved PAN but...': {msg}"


# ---------- 4. Regression ----------
class TestRegression:
    def test_gmail_status(self, headers):
        r = requests.get(f"{API}/gmail/status", headers=headers, timeout=30)
        assert r.status_code == 200
        assert r.json().get("configured") is True

    def test_scan_and_apply_all_reachable(self, headers):
        # Heavy endpoint — we just confirm it doesn't 5xx; skip if it times out
        try:
            r = requests.post(f"{API}/gmail/scan-and-apply-all?max_emails=1",
                              headers=headers, timeout=180)
        except requests.exceptions.Timeout:
            pytest.skip("scan-and-apply-all timed out (Gmail + GPT latency)")
        assert r.status_code in (200, 403), f"{r.status_code} {r.text[:200]}"

    def test_documents_auto_apply_exists(self, headers):
        # Send empty body — expect 400/422 (validation), NOT 404
        r = requests.post(f"{API}/documents/auto-apply", headers=headers,
                          json={}, timeout=30)
        assert r.status_code != 404, "documents/auto-apply endpoint missing"
        assert r.status_code in (200, 400, 422), f"{r.status_code} {r.text[:200]}"

    def test_peer_comparison(self, headers):
        r = requests.get(f"{API}/reports/peer-comparison", headers=headers, timeout=30)
        assert r.status_code == 200
        j = r.json()
        assert "overall_percentile" in j or "metrics" in j

    def test_subscriptions(self, headers):
        r = requests.get(f"{API}/transactions/subscriptions", headers=headers, timeout=30)
        assert r.status_code == 200

    def test_parse_attachment_validation(self, headers):
        r = requests.post(f"{API}/gmail/parse-attachment", headers=headers,
                          json={}, timeout=30)
        assert r.status_code == 400
