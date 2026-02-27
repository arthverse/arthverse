"""
Test suite for Premium Report feature
Tests login, dashboard, health-score, payment status, and PDF download endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://financial-advisor-15.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        assert data["user"]["client_id"] == TEST_CLIENT_ID
        print(f"PASS: Login successful for {TEST_CLIENT_ID}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": "INVALID_ID",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Invalid credentials rejected correctly")


class TestHealthScore:
    """Health score endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_health_score(self):
        """Test GET /api/reports/health-score returns score data"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "score" in data, "Score not in response"
        assert "rating" in data, "Rating not in response"
        assert "component_scores" in data, "Component scores not in response"
        assert "financials" in data, "Financials not in response"
        
        # Validate score is 80 as expected
        assert data["score"] == 80, f"Expected score 80, got {data['score']}"
        print(f"PASS: Health score returned: {data['score']}/100 - {data['rating']}")
    
    def test_health_score_components(self):
        """Test health score has all 5 component scores"""
        response = requests.get(
            f"{BASE_URL}/api/reports/health-score",
            headers=self.headers
        )
        
        data = response.json()
        components = data.get("component_scores", {})
        
        # Check for expected component scores
        assert "Savings Rate" in components
        assert "Emergency Fund" in components
        assert "Investment Portfolio" in components
        
        print(f"PASS: Component scores present: {list(components.keys())}")
    
    def test_health_score_requires_auth(self):
        """Test health score endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/health-score")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Health score endpoint requires authentication")


class TestPaymentStatus:
    """Payment status endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_payment_status(self):
        """Test GET /api/payment/status returns premium status"""
        response = requests.get(
            f"{BASE_URL}/api/payment/status",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "has_premium" in data
        # Test user should have premium access
        assert data["has_premium"] == True, "Test user should have premium access"
        print(f"PASS: Payment status - has_premium: {data['has_premium']}")
    
    def test_payment_status_requires_auth(self):
        """Test payment status endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payment/status")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Payment status endpoint requires authentication")


class TestPDFDownload:
    """PDF download endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_download_pdf(self):
        """Test GET /api/reports/download-pdf returns PDF"""
        response = requests.get(
            f"{BASE_URL}/api/reports/download-pdf",
            headers=self.headers,
            timeout=30
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers.get("content-type") == "application/pdf"
        
        # Check PDF size is reasonable (> 10KB)
        content_length = len(response.content)
        assert content_length > 10000, f"PDF too small: {content_length} bytes"
        
        print(f"PASS: PDF downloaded successfully - {content_length} bytes")
    
    def test_download_pdf_has_correct_filename(self):
        """Test PDF download has correct suggested filename"""
        response = requests.get(
            f"{BASE_URL}/api/reports/download-pdf",
            headers=self.headers,
            timeout=30
        )
        
        content_disposition = response.headers.get("content-disposition", "")
        assert "ArthSthithi_Report" in content_disposition or response.status_code == 200
        print(f"PASS: PDF has correct filename format")
    
    def test_download_pdf_requires_auth(self):
        """Test PDF download endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/download-pdf")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: PDF download endpoint requires authentication")


class TestQuestionnaire:
    """Questionnaire endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_questionnaire(self):
        """Test GET /api/questionnaire returns financial data"""
        response = requests.get(
            f"{BASE_URL}/api/questionnaire",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that income data exists
        assert data.get("salary_income", 0) > 0 or data.get("rental_property1", 0) > 0
        print(f"PASS: Questionnaire data retrieved - Salary: {data.get('salary_income')}")
    
    def test_questionnaire_requires_auth(self):
        """Test questionnaire endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/questionnaire")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Questionnaire endpoint requires authentication")


class TestPLStatement:
    """P&L statement endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_pl_statement(self):
        """Test GET /api/reports/pl returns income/expense data"""
        response = requests.get(
            f"{BASE_URL}/api/reports/pl",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_income" in data
        assert "total_expenses" in data
        assert "net_profit_loss" in data
        
        # Validate expected values
        assert data["total_income"] == 145000, f"Expected income 145000, got {data['total_income']}"
        assert data["total_expenses"] == 63000, f"Expected expenses 63000, got {data['total_expenses']}"
        
        print(f"PASS: P&L - Income: {data['total_income']}, Expenses: {data['total_expenses']}")


class TestBalanceSheet:
    """Balance sheet endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_balance_sheet(self):
        """Test GET /api/reports/balance-sheet returns assets/liabilities"""
        response = requests.get(
            f"{BASE_URL}/api/reports/balance-sheet",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_assets" in data
        assert "total_liabilities" in data
        assert "net_worth" in data
        
        # Validate expected net worth ~ 37.5L
        assert data["total_assets"] == 3800000
        assert data["net_worth"] == 3750000
        
        print(f"PASS: Balance Sheet - Assets: {data['total_assets']}, Net Worth: {data['net_worth']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
