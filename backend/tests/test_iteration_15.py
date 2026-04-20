"""
Backend API Tests for Iteration 15 - Route Extraction Refactoring
Tests auth, questionnaire, and integration routes that were extracted to /app/backend/routes/
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


class TestAuthRoutes:
    """Test extracted auth routes (/api/auth/*)"""
    
    def test_login_success(self):
        """Test /api/auth/login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response missing token"
        assert "user" in data, "Response missing user"
        assert data["user"]["client_id"] == TEST_CLIENT_ID
        return data["token"]
    
    def test_login_invalid_credentials(self):
        """Test /api/auth/login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": "INVALID123",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_auth_me_with_token(self):
        """Test /api/auth/me with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Test /api/auth/me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Auth me failed: {response.text}"
        data = response.json()
        assert data["client_id"] == TEST_CLIENT_ID
        assert "email" in data
        assert "name" in data
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"


class TestQuestionnaireRoutes:
    """Test extracted questionnaire routes (/api/questionnaire)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_get_questionnaire(self, auth_token):
        """Test GET /api/questionnaire"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get questionnaire failed: {response.text}"
        data = response.json()
        # Verify questionnaire structure
        assert "salary_income" in data or "rental_property1" in data, "Missing expected questionnaire fields"
    
    def test_post_questionnaire(self, auth_token):
        """Test POST /api/questionnaire"""
        # First get existing data
        get_response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        existing_data = get_response.json() if get_response.status_code == 200 else {}
        
        # Update with test data
        test_data = {
            **existing_data,
            "salary_income": existing_data.get("salary_income", 1800000),
            "rent_expense": existing_data.get("rent_expense", 0),
            "groceries": existing_data.get("groceries", 8000),
        }
        
        response = requests.post(f"{BASE_URL}/api/questionnaire", 
            json=test_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Post questionnaire failed: {response.text}"
        data = response.json()
        assert "message" in data
        assert "questionnaire" in data
    
    def test_questionnaire_without_auth(self):
        """Test questionnaire endpoints without auth return 403"""
        response = requests.get(f"{BASE_URL}/api/questionnaire")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"


class TestIntegrationRoutes:
    """Test extracted integration routes (/api/integrations/*)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_integrations_status(self, auth_token):
        """Test GET /api/integrations/status"""
        response = requests.get(f"{BASE_URL}/api/integrations/status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Integrations status failed: {response.text}"
        data = response.json()
        assert "integrations" in data
        # Verify integration modules are listed
        modules = [i["module"] for i in data["integrations"]]
        assert "account_aggregator" in modules
        assert "email_parsing" in modules
    
    def test_account_aggregator_placeholder(self, auth_token):
        """Test GET /api/integrations/account-aggregator"""
        response = requests.get(f"{BASE_URL}/api/integrations/account-aggregator", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Account aggregator failed: {response.text}"
        data = response.json()
        assert data["status"] == "placeholder"
        assert data["module"] == "account_aggregator"
    
    def test_email_parsing_placeholder(self, auth_token):
        """Test GET /api/integrations/email-parsing"""
        response = requests.get(f"{BASE_URL}/api/integrations/email-parsing", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Email parsing failed: {response.text}"
        data = response.json()
        assert data["status"] == "placeholder"
        assert data["module"] == "email_parsing"


class TestRemainingServerRoutes:
    """Test routes that remain in server.py (not extracted)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_health_score_v2(self, auth_token):
        """Test GET /api/reports/health-score-v2 (remains in server.py)"""
        response = requests.get(f"{BASE_URL}/api/reports/health-score-v2", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Health score v2 failed: {response.text}"
        data = response.json()
        # Verify health score structure - actual field is total_score
        assert "total_score" in data or "band" in data or "components" in data
    
    def test_payment_status(self, auth_token):
        """Test GET /api/payment/status (remains in server.py)"""
        response = requests.get(f"{BASE_URL}/api/payment/status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Payment status failed: {response.text}"
        data = response.json()
        # Actual field is has_premium
        assert "has_premium" in data or "payments" in data
    
    def test_balance_sheet(self, auth_token):
        """Test GET /api/reports/balance-sheet (remains in server.py)"""
        response = requests.get(f"{BASE_URL}/api/reports/balance-sheet", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Balance sheet failed: {response.text}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
