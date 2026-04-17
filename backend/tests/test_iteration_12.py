"""
Iteration 12 Backend Tests
Testing:
1. Risk Meter - health-score-v2 API returns risk_level and risk_label fields
2. Placeholder Integration APIs (account-aggregator, email-parsing, sms-parsing, portfolio-sync)
3. Integration status endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


class TestHealthScoreV2RiskFields:
    """Test that health-score-v2 API returns risk_level and risk_label fields"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for premium user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["token"]
    
    def test_health_score_v2_returns_risk_level(self, auth_token):
        """Test that health-score-v2 returns risk_level field"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        # Verify risk_level field exists
        assert "risk_level" in data, "risk_level field missing from response"
        assert data["risk_level"] in ["low", "medium", "high"], f"Invalid risk_level: {data['risk_level']}"
        print(f"✓ risk_level: {data['risk_level']}")
    
    def test_health_score_v2_returns_risk_label(self, auth_token):
        """Test that health-score-v2 returns risk_label field"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        # Verify risk_label field exists
        assert "risk_label" in data, "risk_label field missing from response"
        assert data["risk_label"] in ["Low Risk", "Medium Risk", "High Risk"], f"Invalid risk_label: {data['risk_label']}"
        print(f"✓ risk_label: {data['risk_label']}")
    
    def test_health_score_v2_risk_level_matches_score(self, auth_token):
        """Test that risk_level matches the normalized_score (>=65 = low, 35-64 = medium, <35 = high)"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        score = data.get("normalized_score", 0)
        risk_level = data.get("risk_level")
        
        # Verify risk level matches score
        if score >= 65:
            expected_level = "low"
        elif score >= 35:
            expected_level = "medium"
        else:
            expected_level = "high"
        
        assert risk_level == expected_level, f"Risk level mismatch: score={score}, expected={expected_level}, got={risk_level}"
        print(f"✓ Score {score} correctly maps to risk_level '{risk_level}'")
    
    def test_premium_user_has_low_risk(self, auth_token):
        """Test that premium user with score 78.6 has Low Risk"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        score = data.get("normalized_score", 0)
        risk_level = data.get("risk_level")
        risk_label = data.get("risk_label")
        
        # Premium user should have score around 78.6 and Low Risk
        assert score >= 65, f"Expected score >= 65, got {score}"
        assert risk_level == "low", f"Expected risk_level 'low', got '{risk_level}'"
        assert risk_label == "Low Risk", f"Expected risk_label 'Low Risk', got '{risk_label}'"
        print(f"✓ Premium user: score={score}, risk_level={risk_level}, risk_label={risk_label}")


class TestPlaceholderIntegrationAPIs:
    """Test placeholder integration APIs for future automation"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["token"]
    
    def test_account_aggregator_placeholder(self, auth_token):
        """Test GET /api/integrations/account-aggregator returns correct placeholder"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/account-aggregator",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        assert data["status"] == "placeholder", f"Expected status 'placeholder', got '{data['status']}'"
        assert data["module"] == "account_aggregator", f"Expected module 'account_aggregator', got '{data['module']}'"
        assert data["ready"] == False, "Expected ready=False"
        assert "message" in data, "Missing message field"
        print(f"✓ Account Aggregator placeholder: {data['module']} - {data['status']}")
    
    def test_email_parsing_placeholder(self, auth_token):
        """Test GET /api/integrations/email-parsing returns correct placeholder"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/email-parsing",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        assert data["status"] == "placeholder", f"Expected status 'placeholder', got '{data['status']}'"
        assert data["module"] == "email_parsing", f"Expected module 'email_parsing', got '{data['module']}'"
        assert data["ready"] == False, "Expected ready=False"
        assert "message" in data, "Missing message field"
        print(f"✓ Email Parsing placeholder: {data['module']} - {data['status']}")
    
    def test_sms_parsing_placeholder(self, auth_token):
        """Test GET /api/integrations/sms-parsing returns correct placeholder"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/sms-parsing",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        assert data["status"] == "placeholder", f"Expected status 'placeholder', got '{data['status']}'"
        assert data["module"] == "sms_parsing", f"Expected module 'sms_parsing', got '{data['module']}'"
        assert data["ready"] == False, "Expected ready=False"
        assert "message" in data, "Missing message field"
        print(f"✓ SMS Parsing placeholder: {data['module']} - {data['status']}")
    
    def test_portfolio_sync_placeholder(self, auth_token):
        """Test GET /api/integrations/portfolio-sync returns correct placeholder"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/portfolio-sync",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        assert data["status"] == "placeholder", f"Expected status 'placeholder', got '{data['status']}'"
        assert data["module"] == "portfolio_sync", f"Expected module 'portfolio_sync', got '{data['module']}'"
        assert data["ready"] == False, "Expected ready=False"
        assert "message" in data, "Missing message field"
        print(f"✓ Portfolio Sync placeholder: {data['module']} - {data['status']}")
    
    def test_integrations_status_returns_all_modules(self, auth_token):
        """Test GET /api/integrations/status returns all 4 integration modules"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        assert "integrations" in data, "Missing 'integrations' field"
        integrations = data["integrations"]
        
        assert len(integrations) == 4, f"Expected 4 integrations, got {len(integrations)}"
        
        # Verify all modules are present
        modules = [i["module"] for i in integrations]
        expected_modules = ["account_aggregator", "email_parsing", "sms_parsing", "portfolio_sync"]
        
        for expected in expected_modules:
            assert expected in modules, f"Missing module: {expected}"
        
        # Verify all are not ready
        for integration in integrations:
            assert integration["ready"] == False, f"Module {integration['module']} should not be ready"
            assert "status" in integration, f"Missing status for {integration['module']}"
            assert "description" in integration, f"Missing description for {integration['module']}"
        
        print(f"✓ All 4 integration modules present: {modules}")
    
    def test_integration_apis_require_auth(self):
        """Test that integration APIs require authentication"""
        endpoints = [
            "/api/integrations/account-aggregator",
            "/api/integrations/email-parsing",
            "/api/integrations/sms-parsing",
            "/api/integrations/portfolio-sync",
            "/api/integrations/status"
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code in [401, 403], f"{endpoint} should require auth, got {response.status_code}"
        
        print("✓ All integration APIs require authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
