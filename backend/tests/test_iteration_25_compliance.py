"""
Iteration 25 — India compliance batch (DPDP Act 2023 + IT Act 2000).

Endpoints under test:
  GET    /api/compliance/grievance-officer    (public)
  POST   /api/compliance/grievance            (public)
  GET    /api/compliance/export-data          (auth)
  DELETE /api/compliance/account              (auth, body {confirmation:"DELETE MY ACCOUNT"})
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://financial-advisor-15.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def premium_token(s):
    r = s.post(f"{API}/auth/login", json={"client_id": "AV271676A7", "password": "Demo123!"})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def throwaway_user(s):
    """Create a throwaway user via /register + /set-password and return (token, user_id, client_id)."""
    uniq = uuid.uuid4().hex[:8]
    payload = {
        "email": f"test_throwaway_{uniq}@arthverse.com",
        "name": "Throwaway Tester",
        "mobile_number": f"9{uniq[:9]}",
        "pan_number": f"ABCDE{uniq[:4].upper()}Z",
        "date_of_birth": "1990-01-15",
        "city": "Mumbai",
        "data_privacy_consent": True,
    }
    r = s.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    client_id = data["user"]["client_id"]
    user_id = data["user"]["id"]

    # set password
    r2 = s.post(f"{API}/auth/set-password", json={
        "client_id": client_id, "password": "Throw123!", "confirm_password": "Throw123!"
    })
    assert r2.status_code == 200, f"set-password failed: {r2.status_code} {r2.text}"
    token = r2.json()["token"]
    return {"token": token, "user_id": user_id, "client_id": client_id, "email": payload["email"]}


# ---------- 1. grievance-officer ----------
class TestGrievanceOfficer:
    def test_public_no_auth(self, s):
        r = s.get(f"{API}/compliance/grievance-officer")
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "Mehul Shrishrimal"
        assert d["email"] == "grievance@arth-verse.in"
        assert d["phone"] == "+91-91113-49710"
        assert d["jurisdiction"] == "India"
        assert d["acknowledge_within_hours"] == 24
        assert d["resolve_within_days"] == 15
        assert "DPDP" in d["regulatory_basis"] or "IT Act" in d["regulatory_basis"]


# ---------- 2. submit grievance ----------
class TestGrievanceSubmit:
    def test_valid_submission(self, s):
        r = s.post(f"{API}/compliance/grievance", json={
            "name": "Test Reporter",
            "email": "reporter@example.com",
            "subject": "Data concern",
            "message": "I have a concern about my personal data handling and would like details.",
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["grievance_id"].startswith("GRV-")
        assert d["email"] == "reporter@example.com"
        assert d["status"] == "OPEN"
        assert d["acknowledge_within_hours"] == 24
        assert d["resolve_within_days"] == 15

    def test_rejects_short_message(self, s):
        r = s.post(f"{API}/compliance/grievance", json={
            "name": "Test", "email": "t@e.com", "message": "short"
        })
        assert r.status_code == 422

    def test_rejects_invalid_email(self, s):
        r = s.post(f"{API}/compliance/grievance", json={
            "name": "Test", "email": "not-an-email",
            "message": "This message is at least ten chars long."
        })
        assert r.status_code == 422

    def test_rejects_short_name(self, s):
        r = s.post(f"{API}/compliance/grievance", json={
            "name": "A", "email": "t@e.com",
            "message": "This message is at least ten chars long."
        })
        assert r.status_code == 422

    def test_rejects_missing_fields(self, s):
        r = s.post(f"{API}/compliance/grievance", json={})
        assert r.status_code == 422


# ---------- 3. export-data ----------
class TestExportData:
    def test_requires_auth(self, s):
        r = s.get(f"{API}/compliance/export-data")
        assert r.status_code in (401, 403)

    def test_rejects_bad_token(self, s):
        r = s.get(f"{API}/compliance/export-data", headers={"Authorization": "Bearer invalid"})
        assert r.status_code in (401, 403)

    def test_returns_expected_shape(self, s, premium_token):
        r = s.get(f"{API}/compliance/export-data",
                  headers={"Authorization": f"Bearer {premium_token}"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert "meta" in d and "data" in d
        assert "generated_at" in d["meta"]
        assert "user_id" in d["meta"]
        assert "DPDP" in d["meta"]["regulatory_basis"]

        data = d["data"]
        for coll in ["users", "questionnaires", "transactions", "payments", "orders"]:
            assert coll in data, f"missing collection {coll}"
            assert isinstance(data[coll], list)

    def test_no_password_hash_or_id(self, s, premium_token):
        r = s.get(f"{API}/compliance/export-data",
                  headers={"Authorization": f"Bearer {premium_token}"})
        assert r.status_code == 200
        blob = r.text
        # No Mongo _id or password hash should leak out
        assert '"_id"' not in blob, "_id leaked in export"
        assert "password_hash" not in blob, "password_hash leaked in export"
        # User doc should still have expected public identifiers
        users = r.json()["data"]["users"]
        assert len(users) >= 1
        u = users[0]
        assert "client_id" in u
        assert "_id" not in u
        assert "password_hash" not in u


# ---------- 4. delete account ----------
class TestDeleteAccount:
    def test_requires_auth(self, s):
        r = s.delete(f"{API}/compliance/account",
                     json={"confirmation": "DELETE MY ACCOUNT"})
        assert r.status_code in (401, 403)

    def test_rejects_wrong_confirmation(self, s, throwaway_user):
        r = s.delete(f"{API}/compliance/account",
                     headers={"Authorization": f"Bearer {throwaway_user['token']}"},
                     json={"confirmation": "delete"})
        assert r.status_code == 400
        assert "DELETE MY ACCOUNT" in r.text

    def test_rejects_case_mismatch(self, s, throwaway_user):
        r = s.delete(f"{API}/compliance/account",
                     headers={"Authorization": f"Bearer {throwaway_user['token']}"},
                     json={"confirmation": "delete my account"})
        assert r.status_code == 400

    def test_deletes_throwaway_and_login_fails(self, s, throwaway_user):
        # hard delete
        r = s.delete(f"{API}/compliance/account",
                     headers={"Authorization": f"Bearer {throwaway_user['token']}"},
                     json={"confirmation": "DELETE MY ACCOUNT"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["success"] is True
        assert "deleted_records" in d
        assert d["deleted_records"]["users"] >= 1

        # subsequent login for that client_id must fail
        r2 = s.post(f"{API}/auth/login",
                    json={"client_id": throwaway_user["client_id"], "password": "Throw123!"})
        assert r2.status_code == 401

        # export-data using the now-invalid token should fail OR return empty users list
        r3 = s.get(f"{API}/compliance/export-data",
                   headers={"Authorization": f"Bearer {throwaway_user['token']}"})
        if r3.status_code == 200:
            assert r3.json()["data"]["users"] == []
