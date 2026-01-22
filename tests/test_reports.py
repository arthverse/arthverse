"""
Test Reports API Endpoints - Income/Expenses (P&L) and Assets/Liabilities (Balance Sheet)
Tests the enhanced reports page data from questionnaire collection
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"

class TestReportsAPI:
    """Test Reports API endpoints for P&L and Balance Sheet"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_login_success(self):
        """Test that login works with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Login successful for user: {data['user']['name']}")
    
    def test_get_pl_statement_returns_200(self):
        """Test GET /api/reports/pl returns 200"""
        response = self.session.get(f"{BASE_URL}/api/reports/pl")
        assert response.status_code == 200
        print(f"✓ GET /api/reports/pl returned 200")
    
    def test_get_pl_statement_structure(self):
        """Test GET /api/reports/pl returns correct structure"""
        response = self.session.get(f"{BASE_URL}/api/reports/pl")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "total_income" in data
        assert "total_expenses" in data
        assert "net_profit_loss" in data
        assert "income_by_category" in data
        assert "expenses_by_category" in data
        
        print(f"✓ P&L structure valid - Total Income: ₹{data['total_income']:,}, Total Expenses: ₹{data['total_expenses']:,}")
    
    def test_get_pl_income_breakdown(self):
        """Test GET /api/reports/pl returns income breakdown from questionnaire"""
        response = self.session.get(f"{BASE_URL}/api/reports/pl")
        assert response.status_code == 200
        data = response.json()
        
        income_by_category = data.get("income_by_category", {})
        
        # Expected income sources based on test user questionnaire
        # Salary ₹120k, Rental ₹25k
        print(f"✓ Income categories found: {list(income_by_category.keys())}")
        
        # Verify income values are positive numbers
        for category, amount in income_by_category.items():
            assert isinstance(amount, (int, float))
            assert amount > 0
            print(f"  - {category}: ₹{amount:,}")
        
        # Verify total income matches sum of categories
        total_income = data.get("total_income", 0)
        calculated_total = sum(income_by_category.values())
        assert total_income == calculated_total, f"Total income mismatch: {total_income} vs {calculated_total}"
        print(f"✓ Total income verified: ₹{total_income:,}")
    
    def test_get_pl_expense_breakdown(self):
        """Test GET /api/reports/pl returns expense breakdown from questionnaire"""
        response = self.session.get(f"{BASE_URL}/api/reports/pl")
        assert response.status_code == 200
        data = response.json()
        
        expenses_by_category = data.get("expenses_by_category", {})
        
        print(f"✓ Expense categories found: {list(expenses_by_category.keys())}")
        
        # Verify expense values are positive numbers
        for category, amount in expenses_by_category.items():
            assert isinstance(amount, (int, float))
            assert amount > 0
            print(f"  - {category}: ₹{amount:,}")
        
        # Verify total expenses matches sum of categories
        total_expenses = data.get("total_expenses", 0)
        calculated_total = sum(expenses_by_category.values())
        assert total_expenses == calculated_total, f"Total expenses mismatch: {total_expenses} vs {calculated_total}"
        print(f"✓ Total expenses verified: ₹{total_expenses:,}")
    
    def test_get_pl_net_profit_loss_calculation(self):
        """Test GET /api/reports/pl calculates net profit/loss correctly"""
        response = self.session.get(f"{BASE_URL}/api/reports/pl")
        assert response.status_code == 200
        data = response.json()
        
        total_income = data.get("total_income", 0)
        total_expenses = data.get("total_expenses", 0)
        net_profit_loss = data.get("net_profit_loss", 0)
        
        expected_net = total_income - total_expenses
        assert net_profit_loss == expected_net, f"Net P&L mismatch: {net_profit_loss} vs {expected_net}"
        
        savings_rate = (net_profit_loss / total_income * 100) if total_income > 0 else 0
        print(f"✓ Net Profit/Loss: ₹{net_profit_loss:,} (Savings Rate: {savings_rate:.1f}%)")
    
    def test_get_balance_sheet_returns_200(self):
        """Test GET /api/reports/balance-sheet returns 200"""
        response = self.session.get(f"{BASE_URL}/api/reports/balance-sheet")
        assert response.status_code == 200
        print(f"✓ GET /api/reports/balance-sheet returned 200")
    
    def test_get_balance_sheet_structure(self):
        """Test GET /api/reports/balance-sheet returns correct structure"""
        response = self.session.get(f"{BASE_URL}/api/reports/balance-sheet")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "total_assets" in data
        assert "total_liabilities" in data
        assert "net_worth" in data
        assert "assets_breakdown" in data
        assert "liabilities_breakdown" in data
        
        print(f"✓ Balance Sheet structure valid - Assets: ₹{data['total_assets']:,}, Liabilities: ₹{data['total_liabilities']:,}")
    
    def test_get_balance_sheet_assets_breakdown(self):
        """Test GET /api/reports/balance-sheet returns assets breakdown from questionnaire"""
        response = self.session.get(f"{BASE_URL}/api/reports/balance-sheet")
        assert response.status_code == 200
        data = response.json()
        
        assets_breakdown = data.get("assets_breakdown", {})
        
        # Expected assets: Stocks ₹15L, MF ₹10L, Gold ₹5L, Bank ₹8L
        print(f"✓ Asset categories found: {list(assets_breakdown.keys())}")
        
        # Verify asset values are positive numbers
        for category, amount in assets_breakdown.items():
            assert isinstance(amount, (int, float))
            assert amount > 0
            print(f"  - {category}: ₹{amount:,}")
        
        # Verify total assets matches sum of categories
        total_assets = data.get("total_assets", 0)
        calculated_total = sum(assets_breakdown.values())
        assert total_assets == calculated_total, f"Total assets mismatch: {total_assets} vs {calculated_total}"
        print(f"✓ Total assets verified: ₹{total_assets:,}")
    
    def test_get_balance_sheet_liabilities_breakdown(self):
        """Test GET /api/reports/balance-sheet returns liabilities breakdown from questionnaire"""
        response = self.session.get(f"{BASE_URL}/api/reports/balance-sheet")
        assert response.status_code == 200
        data = response.json()
        
        liabilities_breakdown = data.get("liabilities_breakdown", {})
        
        # Expected liabilities: Credit Card ₹50k
        print(f"✓ Liability categories found: {list(liabilities_breakdown.keys())}")
        
        # Verify liability values are positive numbers
        for category, amount in liabilities_breakdown.items():
            assert isinstance(amount, (int, float))
            assert amount > 0
            print(f"  - {category}: ₹{amount:,}")
        
        # Verify total liabilities matches sum of categories
        total_liabilities = data.get("total_liabilities", 0)
        calculated_total = sum(liabilities_breakdown.values())
        assert total_liabilities == calculated_total, f"Total liabilities mismatch: {total_liabilities} vs {calculated_total}"
        print(f"✓ Total liabilities verified: ₹{total_liabilities:,}")
    
    def test_get_balance_sheet_net_worth_calculation(self):
        """Test GET /api/reports/balance-sheet calculates net worth correctly"""
        response = self.session.get(f"{BASE_URL}/api/reports/balance-sheet")
        assert response.status_code == 200
        data = response.json()
        
        total_assets = data.get("total_assets", 0)
        total_liabilities = data.get("total_liabilities", 0)
        net_worth = data.get("net_worth", 0)
        
        expected_net_worth = total_assets - total_liabilities
        assert net_worth == expected_net_worth, f"Net worth mismatch: {net_worth} vs {expected_net_worth}"
        
        debt_ratio = (total_liabilities / total_assets * 100) if total_assets > 0 else 0
        print(f"✓ Net Worth: ₹{net_worth:,} (Debt-to-Asset Ratio: {debt_ratio:.1f}%)")
    
    def test_reports_require_authentication(self):
        """Test that reports endpoints require authentication"""
        # Test without auth header
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        pl_response = session.get(f"{BASE_URL}/api/reports/pl")
        bs_response = session.get(f"{BASE_URL}/api/reports/balance-sheet")
        
        # Should return 401 or 403 without auth
        assert pl_response.status_code in [401, 403], f"P&L should require auth, got {pl_response.status_code}"
        assert bs_response.status_code in [401, 403], f"Balance Sheet should require auth, got {bs_response.status_code}"
        print(f"✓ Reports endpoints properly require authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
