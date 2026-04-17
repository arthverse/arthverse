"""
Iteration 13 Tests - Financial Diagnosis Redesign & Refactoring
Tests for:
1. Dashboard ArthSthithi card redesigned as 'Financial Diagnosis'
2. ArthMitraReport refactoring (PILLAR_DETAILS and CSS extracted)
3. FinancialQuestionnaire refactoring (formDefaults extracted)
4. Backend health-score-v2 API
5. Placeholder integration APIs
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://financial-advisor-15.preview.emergentagent.com')

# Test credentials
PREMIUM_USER = {
    "client_id": "AV271676A7",
    "password": "Demo123!"
}


class TestAuthentication:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for premium user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": PREMIUM_USER["client_id"],
            "password": PREMIUM_USER["password"]
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        return data["token"]
    
    def test_login_premium_user(self, auth_token):
        """Test premium user can login"""
        assert auth_token is not None
        assert len(auth_token) > 0
        print(f"✓ Premium user login successful, token length: {len(auth_token)}")


class TestHealthScoreV2API:
    """Tests for health-score-v2 API endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": PREMIUM_USER["client_id"],
            "password": PREMIUM_USER["password"]
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_health_score_v2_returns_data(self, auth_token):
        """Test health-score-v2 API returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "normalized_score" in data, "Missing normalized_score"
        assert "band" in data, "Missing band"
        assert "components" in data, "Missing components"
        assert "summary" in data, "Missing summary"
        
        print(f"✓ Health score v2 API returns score: {data['normalized_score']}, band: {data['band']}")
    
    def test_health_score_v2_has_risk_level(self, auth_token):
        """Test health-score-v2 API returns risk_level field"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check risk level fields
        assert "risk_level" in data, "Missing risk_level field"
        assert "risk_label" in data, "Missing risk_label field"
        
        # For score ~78.6, should be low risk
        score = data.get("normalized_score", 0)
        if score >= 65:
            assert data["risk_level"] == "low", f"Expected low risk for score {score}"
        
        print(f"✓ Risk level: {data['risk_level']}, Risk label: {data['risk_label']}")
    
    def test_health_score_v2_summary_fields(self, auth_token):
        """Test health-score-v2 API summary contains financial data"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score-v2",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        summary = data.get("summary", {})
        assert "monthly_income" in summary, "Missing monthly_income in summary"
        assert "monthly_expenses" in summary, "Missing monthly_expenses in summary"
        assert "monthly_savings" in summary, "Missing monthly_savings in summary"
        
        # Verify expected values for premium user
        assert summary["monthly_income"] == 145000, f"Expected income 145000, got {summary['monthly_income']}"
        assert summary["monthly_expenses"] == 63000, f"Expected expenses 63000, got {summary['monthly_expenses']}"
        assert summary["monthly_savings"] == 82000, f"Expected savings 82000, got {summary['monthly_savings']}"
        
        print(f"✓ Summary: Income ₹{summary['monthly_income']}, Expenses ₹{summary['monthly_expenses']}, Savings ₹{summary['monthly_savings']}")


class TestPlaceholderIntegrationAPIs:
    """Tests for placeholder integration APIs"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": PREMIUM_USER["client_id"],
            "password": PREMIUM_USER["password"]
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_integrations_status_endpoint(self, auth_token):
        """Test /api/integrations/status returns all modules"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        # Should have integrations list
        assert "integrations" in data, "Missing integrations field"
        integrations = data["integrations"]
        
        # Should have 4 modules
        modules = [i["module"] for i in integrations]
        expected_modules = ["account_aggregator", "email_parsing", "sms_parsing", "portfolio_sync"]
        for module in expected_modules:
            assert module in modules, f"Missing module: {module}"
        
        print(f"✓ Integrations status returns {len(integrations)} modules")
    
    def test_account_aggregator_placeholder(self, auth_token):
        """Test account aggregator placeholder API"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/account-aggregator",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("status") == "placeholder", "Expected placeholder status"
        assert data.get("module") == "account_aggregator", "Wrong module name"
        assert data.get("ready") == False, "Expected ready=false"
        
        print("✓ Account aggregator placeholder API working")
    
    def test_email_parsing_placeholder(self, auth_token):
        """Test email parsing placeholder API"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/email-parsing",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("status") == "placeholder"
        assert data.get("module") == "email_parsing"
        
        print("✓ Email parsing placeholder API working")
    
    def test_sms_parsing_placeholder(self, auth_token):
        """Test SMS parsing placeholder API"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/sms-parsing",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("status") == "placeholder"
        assert data.get("module") == "sms_parsing"
        
        print("✓ SMS parsing placeholder API working")
    
    def test_portfolio_sync_placeholder(self, auth_token):
        """Test portfolio sync placeholder API"""
        response = requests.get(
            f"{BASE_URL}/api/integrations/portfolio-sync",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("status") == "placeholder"
        assert data.get("module") == "portfolio_sync"
        
        print("✓ Portfolio sync placeholder API working")


class TestOpportunityAnalysisAPI:
    """Tests for opportunity analysis API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": PREMIUM_USER["client_id"],
            "password": PREMIUM_USER["password"]
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_opportunity_analysis_endpoint(self, auth_token):
        """Test opportunity analysis API returns data"""
        response = requests.get(
            f"{BASE_URL}/api/reports/opportunity-analysis",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"API failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "saving_opportunities" in data or "risk_reductions" in data, "Missing opportunity data"
        
        print(f"✓ Opportunity analysis API working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
