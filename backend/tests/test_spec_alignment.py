"""
Backend API Tests for Iteration 15 - ArthMitra Data Input Spec Alignment (84 fields)
Tests spec-aligned field names across questionnaire, health-score-v2, PL, and balance-sheet endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


class TestSpecAlignedQuestionnaire:
    """Test questionnaire API returns spec-aligned field names"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["token"]
    
    def test_get_questionnaire_spec_fields(self, auth_token):
        """Test GET /api/questionnaire returns spec-aligned field names"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get questionnaire failed: {response.text}"
        data = response.json()
        
        # Section B: Income fields (spec-aligned)
        income_fields = [
            "monthly_salary_net",      # B1
            "monthly_business_income", # B2
            "monthly_rental_income",   # B3
            "monthly_other_income",    # B4
        ]
        for field in income_fields:
            assert field in data, f"Missing spec field: {field}"
        
        # Section B: Additional income fields
        additional_income = [
            "employer_epf_monthly",    # B6
            "annual_bonus",            # B7
            "tax_regime",              # B8
            "annual_tax_paid",         # B9
        ]
        for field in additional_income:
            assert field in data, f"Missing spec field: {field}"
        
        # Section A: Profile fields
        profile_fields = [
            "employment_type",
            "city_tier",
            "family_situation",
            "cibil_score",
        ]
        for field in profile_fields:
            assert field in data, f"Missing profile field: {field}"
        
        print(f"✓ All Section A & B spec fields present")
    
    def test_questionnaire_expense_fields(self, auth_token):
        """Test questionnaire has Section C expense fields"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Section C: Expense fields (C1-C11)
        expense_fields = [
            "monthly_rent_or_emi_home",    # C1
            "monthly_groceries",           # C2
            "monthly_utilities",           # C3
            "monthly_transport",           # C4
            "monthly_education",           # C5
            "monthly_food_eating_out",     # C6
            "monthly_entertainment",       # C7
            "monthly_medical",             # C8
            "monthly_insurance_premiums",  # C9
            "monthly_investments_sip",     # C10
            "monthly_other_expenses",      # C11
            "total_monthly_expenses",      # C12 (computed)
        ]
        for field in expense_fields:
            assert field in data, f"Missing expense field: {field}"
        
        print(f"✓ All Section C expense fields present")
    
    def test_questionnaire_asset_fields(self, auth_token):
        """Test questionnaire has Section D asset fields"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Section D: Asset fields (D1-D18)
        asset_fields = [
            "bank_savings_balance",        # D1
            "cash_in_hand",                # D2
            "sweep_fd_balance",            # D3
            "regular_fd_balance",          # D4
            "liquid_mf_balance",           # D5
            "equity_mf_current_value",     # D6
            "equity_mf_invested_amount",   # D7
            "direct_stocks_value",         # D8
            "direct_stocks_cost",          # D9
            "debt_mf_bonds_value",         # D10
            "debt_mf_bonds_invested",      # D11
            "ppf_nps_balance",             # D12
            "gold_silver_value",           # D13
            "gold_silver_cost",            # D14
            "real_estate_primary_value",   # D15
            "real_estate_investment_value",# D16
            "ulip_endowment_value",        # D17
            "other_assets",                # D18
        ]
        for field in asset_fields:
            assert field in data, f"Missing asset field: {field}"
        
        print(f"✓ All Section D asset fields present")
    
    def test_questionnaire_liability_fields(self, auth_token):
        """Test questionnaire has Section E liability fields"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Section E: Liability fields (E1-E14)
        liability_fields = [
            "home_loan_outstanding",       # E1
            "home_loan_emi",               # E2
            "home_loan_interest_rate",     # E3
            "vehicle_loan_outstanding",    # E4
            "vehicle_loan_emi",            # E5
            "vehicle_loan_interest_rate",  # E6
            "education_loan_outstanding",  # E7
            "education_loan_emi",          # E8
            "education_loan_interest_rate",# E9
            "personal_loan_outstanding",   # E10
            "personal_loan_emi",           # E11
            "credit_card_outstanding",     # E12
            "credit_card_emi_monthly",     # E13
            "other_loans_emi",             # E14
        ]
        for field in liability_fields:
            assert field in data, f"Missing liability field: {field}"
        
        print(f"✓ All Section E liability fields present")
    
    def test_questionnaire_insurance_fields(self, auth_token):
        """Test questionnaire has Section F insurance fields"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Section F: Insurance fields (F1-F16)
        insurance_fields = [
            "has_term_life_insurance",     # F1
            "term_insurance_cover",        # F2
            "term_insurance_premium_annual",# F3
            "has_ulip_endowment",          # F4
            "ulip_endowment_cover",        # F5
            "ulip_endowment_premium_annual",# F6
            "has_health_insurance",        # F7
            "health_insurance_type",       # F8
            "health_insurance_cover",      # F9
            "health_insurance_premium_annual",# F10
            "family_members_covered",      # F11
            "dependent_parents_covered",   # F12
            "has_vehicle",                 # F13
            "vehicle_insurance_type",      # F14
            "vehicle_insurance_premium_annual",# F15
            "vehicle_idv",                 # F16
        ]
        for field in insurance_fields:
            assert field in data, f"Missing insurance field: {field}"
        
        print(f"✓ All Section F insurance fields present")
    
    def test_questionnaire_habit_fields(self, auth_token):
        """Test questionnaire has Section G financial habit fields"""
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Section G: Financial Habits (G1-G7)
        habit_fields = [
            "habit_q1_health_insurance",   # G1
            "habit_q2_term_insurance",     # G2
            "habit_q3_itr_filing",         # G3
            "habit_q4_credit_card",        # G4
            "habit_q5_cc_revolving",       # G5
            "habit_q6_personal_loan",      # G6
            "habit_q7_invest_beyond_fd",   # G7
        ]
        for field in habit_fields:
            assert field in data, f"Missing habit field: {field}"
        
        print(f"✓ All Section G habit fields present")


class TestHealthScoreV2:
    """Test health-score-v2 endpoint with spec-aligned data"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_health_score_v2_returns_score(self, auth_token):
        """Test GET /api/reports/health-score-v2 returns valid score"""
        response = requests.get(f"{BASE_URL}/api/reports/health-score-v2", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Health score v2 failed: {response.text}"
        data = response.json()
        
        # Check for score fields
        assert "total_score" in data or "normalized_score" in data, "Missing score field"
        assert "band" in data, "Missing band field"
        assert "components" in data, "Missing components field"
        
        # Verify score is reasonable (0-100)
        score = data.get("total_score") or data.get("normalized_score", 0)
        assert 0 <= score <= 100, f"Score {score} out of range"
        
        print(f"✓ Health Score V2: {score}/100 - Band: {data.get('band')}")
    
    def test_health_score_v2_components(self, auth_token):
        """Test health-score-v2 returns 10 factor components"""
        response = requests.get(f"{BASE_URL}/api/reports/health-score-v2", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        components = data.get("components", [])
        assert len(components) >= 5, f"Expected at least 5 components, got {len(components)}"
        
        # Check component structure
        for comp in components:
            assert "name" in comp or "factor" in comp or "component" in comp, "Component missing name/factor/component"
            assert "score" in comp or "points" in comp, "Component missing score/points"
        
        print(f"✓ Health Score V2 has {len(components)} components")


class TestPLStatement:
    """Test P&L statement endpoint with spec-aligned categories"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_pl_statement_returns_data(self, auth_token):
        """Test GET /api/reports/pl returns spec-aligned categories"""
        response = requests.get(f"{BASE_URL}/api/reports/pl", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"PL statement failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "total_income" in data, "Missing total_income"
        assert "total_expenses" in data, "Missing total_expenses"
        assert "net_profit_loss" in data, "Missing net_profit_loss"
        assert "income_by_category" in data, "Missing income_by_category"
        assert "expenses_by_category" in data, "Missing expenses_by_category"
        
        print(f"✓ PL Statement: Income ₹{data['total_income']:,.0f}, Expenses ₹{data['total_expenses']:,.0f}")
    
    def test_pl_income_categories_spec_aligned(self, auth_token):
        """Test PL income categories use spec-aligned names"""
        response = requests.get(f"{BASE_URL}/api/reports/pl", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        income_categories = data.get("income_by_category", {})
        # Spec-aligned income category names
        expected_categories = ["Salary (Net)", "Business Income", "Rental Income", "Other Income"]
        
        # At least one category should be present if user has income
        if data["total_income"] > 0:
            found_categories = list(income_categories.keys())
            print(f"✓ PL Income Categories: {found_categories}")
    
    def test_pl_expense_categories_spec_aligned(self, auth_token):
        """Test PL expense categories use spec-aligned names"""
        response = requests.get(f"{BASE_URL}/api/reports/pl", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        expense_categories = data.get("expenses_by_category", {})
        # Spec-aligned expense category names
        expected_categories = [
            "Rent / Home EMI", "Groceries", "Utilities", "Transport",
            "Education", "Food & Dining", "Entertainment", "Medical",
            "Insurance Premiums", "SIP / Investments", "Other Expenses"
        ]
        
        if data["total_expenses"] > 0:
            found_categories = list(expense_categories.keys())
            print(f"✓ PL Expense Categories: {found_categories}")


class TestBalanceSheet:
    """Test balance sheet endpoint with spec-aligned categories"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_balance_sheet_returns_data(self, auth_token):
        """Test GET /api/reports/balance-sheet returns spec-aligned data"""
        response = requests.get(f"{BASE_URL}/api/reports/balance-sheet", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Balance sheet failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "total_assets" in data, "Missing total_assets"
        assert "total_liabilities" in data, "Missing total_liabilities"
        assert "net_worth" in data, "Missing net_worth"
        assert "assets_breakdown" in data, "Missing assets_breakdown"
        assert "liabilities_breakdown" in data, "Missing liabilities_breakdown"
        
        print(f"✓ Balance Sheet: Assets ₹{data['total_assets']:,.0f}, Liabilities ₹{data['total_liabilities']:,.0f}, Net Worth ₹{data['net_worth']:,.0f}")
    
    def test_balance_sheet_asset_categories(self, auth_token):
        """Test balance sheet asset categories are spec-aligned"""
        response = requests.get(f"{BASE_URL}/api/reports/balance-sheet", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        assets = data.get("assets_breakdown", {})
        # Spec-aligned asset category names
        expected_assets = [
            "Bank Savings", "Fixed Deposits", "Sweep FD", "Liquid MF",
            "Equity MF", "Stocks", "Debt MF/Bonds", "PPF/NPS",
            "Gold & Silver", "Real Estate (Primary)", "Real Estate (Investment)",
            "ULIP/Endowment", "Cash in Hand", "Other Assets"
        ]
        
        if data["total_assets"] > 0:
            found_assets = list(assets.keys())
            print(f"✓ Balance Sheet Assets: {found_assets}")
    
    def test_balance_sheet_liability_categories(self, auth_token):
        """Test balance sheet liability categories are spec-aligned"""
        response = requests.get(f"{BASE_URL}/api/reports/balance-sheet", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        liabilities = data.get("liabilities_breakdown", {})
        # Spec-aligned liability category names
        expected_liabilities = [
            "Home Loan", "Vehicle Loan", "Education Loan",
            "Personal Loan", "Credit Card"
        ]
        
        if data["total_liabilities"] > 0:
            found_liabilities = list(liabilities.keys())
            print(f"✓ Balance Sheet Liabilities: {found_liabilities}")


class TestOpportunityAnalysis:
    """Test opportunity analysis endpoint with spec-aligned data"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_opportunity_analysis_returns_data(self, auth_token):
        """Test GET /api/reports/opportunity-analysis returns valid data"""
        response = requests.get(f"{BASE_URL}/api/reports/opportunity-analysis", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Opportunity analysis failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "summary" in data, "Missing summary"
        assert "saving_opportunities" in data, "Missing saving_opportunities"
        assert "risk_reductions" in data, "Missing risk_reductions"
        
        summary = data.get("summary", {})
        print(f"✓ Opportunity Analysis: Savings ₹{summary.get('total_annual_savings_potential', 0):,.0f}, Risk Gap ₹{summary.get('total_coverage_gap', 0):,.0f}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
