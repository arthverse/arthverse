"""
Iteration 24 — PWA conversion regression tests.
Verifies PWA does NOT break existing backend APIs and that public static
PWA assets (manifest, service-worker, icon) are served correctly.
"""
import os
import json
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://financial-advisor-15.preview.emergentagent.com").rstrip("/")

CLIENT_ID = "AV271676A7"
PASSWORD = "Demo123!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"client_id": CLIENT_ID, "password": PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"No token in login response: {data}"
    return token


@pytest.fixture(scope="module")
def auth_client(session, auth_token):
    session.headers.update({"Authorization": f"Bearer {auth_token}"})
    return session


# ---- PWA public asset tests ----

class TestPWAAssets:
    def test_manifest_json_valid(self):
        r = requests.get(f"{BASE_URL}/manifest.json", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ("name", "short_name", "icons", "start_url", "display", "theme_color", "shortcuts"):
            assert k in d, f"manifest missing key: {k}"
        assert d["display"] == "standalone"
        assert isinstance(d["icons"], list) and len(d["icons"]) >= 1
        assert isinstance(d["shortcuts"], list) and len(d["shortcuts"]) >= 1
        assert d["start_url"].startswith("/")

    def test_service_worker_served(self):
        r = requests.get(f"{BASE_URL}/service-worker.js", timeout=15)
        assert r.status_code == 200
        body = r.text
        assert "addEventListener('install'" in body or 'addEventListener("install"' in body
        assert "addEventListener('activate'" in body or 'addEventListener("activate"' in body
        assert "addEventListener('fetch'" in body or 'addEventListener("fetch"' in body

    def test_logo_png_served(self):
        r = requests.get(f"{BASE_URL}/arth-verse-logo.png", timeout=15)
        assert r.status_code == 200
        assert int(r.headers.get("Content-Length", len(r.content))) > 1000

    def test_index_html_has_pwa_tags(self):
        r = requests.get(f"{BASE_URL}/", timeout=15)
        assert r.status_code == 200
        html = r.text
        assert 'rel="manifest"' in html and "/manifest.json" in html
        assert 'apple-mobile-web-app-capable' in html
        assert 'apple-touch-icon' in html
        assert 'viewport-fit=cover' in html
        assert "navigator.serviceWorker.register" in html


# ---- Backend regression (should be unaffected by PWA changes) ----

class TestBackendRegression:
    def test_login(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login", json={"client_id": CLIENT_ID, "password": PASSWORD}, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data.get("access_token") or data.get("token")

    def test_gmail_status(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/gmail/status", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "connected" in data or "is_connected" in data or "status" in data

    def test_transactions_subscriptions(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/transactions/subscriptions", timeout=30)
        assert r.status_code == 200
        # response should be a list or dict with subscriptions
        data = r.json()
        assert isinstance(data, (list, dict))

    def test_reports_peer_comparison(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/reports/peer-comparison", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)
