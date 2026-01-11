import requests
import sys
import json
from datetime import datetime

class ArthverseAPITester:
    def __init__(self, base_url="https://arth-verse-launch.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.transaction_ids = []
        # Test credentials from review request
        self.test_client_id = "AV271676A7"
        self.test_password = "Demo123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_login_with_client_id(self):
        """Test user login with Client ID and Password (as per review request)"""
        success, response = self.run_test(
            "User Login with Client ID",
            "POST", 
            "auth/login",
            200,
            data={
                "client_id": self.test_client_id,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            print(f"   Client ID: {response['user']['client_id']}")
            return True
        return False

    def test_user_signup(self):
        """Test user signup endpoint (if it exists)"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@arthverse.com"
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data={
                "email": test_email,
                "password": "NewUser123!",
                "name": "New Test User",
                "mobile_number": "9876543210",
                "age": 30,
                "city": "Mumbai",
                "marital_status": "Single",
                "no_of_dependents": 0,
                "data_privacy_consent": True,
                "monthly_income": 75000
            }
        )
        return success

    def test_user_profile(self):
        """Test getting user profile/dashboard info"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        if success:
            print(f"   User Name: {response.get('name', 'N/A')}")
            print(f"   Client ID: {response.get('client_id', 'N/A')}")
            print(f"   Net Worth: ${response.get('networth', 0)}")
            print(f"   Monthly Income: ${response.get('monthly_income', 0)}")
        return success

    def test_save_questionnaire(self):
        """Test saving financial questionnaire with comprehensive data"""
        questionnaire_data = {
            # Income data
            "salary_income": 50000,
            "rental_property1": 10000,
            "business_income": 20000,
            "interest_income": 2000,
            "dividend_income": 1500,
            
            # Expenses data
            "rent_expense": 15000,
            "groceries": 5000,
            "fuel": 3000,
            "food_dining": 4000,
            "entertainment": 2000,
            "healthcare": 1500,
            "telecom_utilities": 2500,
            
            # Assets data
            "property_value": 5000000,
            "stocks_value": 200000,
            "mutual_funds_value": 150000,
            "bank_balance": 100000,
            "cash_in_hand": 10000,
            "gold_value": 50000,
            
            # Liabilities data
            "home_loan": 2000000,
            "personal_loan": 100000,
            "credit_card_outstanding": 25000,
            
            # Financial stability
            "has_health_insurance": True,
            "has_term_insurance": True,
            "invests_in_mutual_funds": True,
            "takes_tds_refund": True,
            "has_emergency_fund": True,
            "files_itr_yearly": True,
            
            # Credit cards
            "credit_cards": ["HDFC Regalia", "SBI SimplyCLICK"],
            
            # Monthly investment
            "monthly_investment": 15000,
            
            # Properties list
            "properties": [
                {
                    "name": "Primary Residence",
                    "estimated_value": 3000000,
                    "area_sqft": 1200
                },
                {
                    "name": "Investment Property",
                    "estimated_value": 2000000,
                    "area_sqft": 800
                }
            ],
            
            # Vehicles list
            "vehicles": [
                {
                    "vehicle_type": "4-Wheeler",
                    "name": "Maruti Swift",
                    "registration_number": "MH12AB1234",
                    "estimated_value": 400000,
                    "is_insured": True
                }
            ],
            
            # Loans list
            "loans": [
                {
                    "loan_type": "Home",
                    "name": "HDFC Home Loan",
                    "principal_amount": 2000000,
                    "interest_rate": 8.5,
                    "tenure_months": 240
                }
            ],
            
            # Interest investments
            "interest_investments": [
                {
                    "name": "HDFC Bank FD",
                    "investment_type": "FD",
                    "principal_amount": 500000,
                    "interest_rate": 6.5
                }
            ]
        }
        
        success, response = self.run_test(
            "Save Financial Questionnaire",
            "POST",
            "questionnaire",
            200,
            data=questionnaire_data
        )
        if success:
            print(f"   Message: {response.get('message', 'N/A')}")
        return success

    def test_get_questionnaire(self):
        """Test retrieving saved questionnaire"""
        success, response = self.run_test(
            "Get Financial Questionnaire",
            "GET",
            "questionnaire",
            200
        )
        if success:
            print(f"   Retrieved questionnaire data")
            print(f"   Salary Income: ${response.get('salary_income', 0)}")
            print(f"   Property Value: ${response.get('property_value', 0)}")
            print(f"   Home Loan: ${response.get('home_loan', 0)}")
            print(f"   Properties Count: {len(response.get('properties', []))}")
            print(f"   Vehicles Count: {len(response.get('vehicles', []))}")
        return success

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Credentials Test",
            "POST",
            "auth/login",
            401,  # Expecting 401 Unauthorized
            data={
                "client_id": "INVALID123",
                "password": "wrongpassword"
            }
        )
        return success

    def test_ai_categorization(self):
        """Test AI expense categorization"""
        success, response = self.run_test(
            "AI Expense Categorization",
            "POST",
            "ai/categorize",
            200,
            data={
                "description": "Lunch at restaurant",
                "amount": 500
            }
        )
        if success:
            print(f"   AI suggested category: {response.get('category', 'N/A')}")
            print(f"   Confidence: {response.get('confidence', 'N/A')}")
        return success

    def test_get_transactions(self):
        """Test getting user transactions"""
        success, response = self.run_test(
            "Get Transactions",
            "GET",
            "transactions",
            200
        )
        if success:
            print(f"   Found {len(response)} transactions")
        return success

    def test_financial_health_score(self):
        """Test financial health score calculation"""
        success, response = self.run_test(
            "Financial Health Score",
            "GET",
            "reports/health-score",
            200
        )
        if success:
            print(f"   Health Score: {response.get('score', 'N/A')}/100")
            print(f"   Total Income: ${response.get('total_income', 0)}")
            print(f"   Total Expenses: ${response.get('total_expenses', 0)}")
            print(f"   Net Savings: ${response.get('net_savings', 0)}")
        return success

    def test_pl_statement(self):
        """Test P&L statement"""
        success, response = self.run_test(
            "P&L Statement",
            "GET",
            "reports/pl",
            200
        )
        if success:
            print(f"   Total Income: ${response.get('total_income', 0)}")
            print(f"   Total Expenses: ${response.get('total_expenses', 0)}")
            print(f"   Net P&L: ${response.get('net_profit_loss', 0)}")
        return success

    def test_balance_sheet(self):
        """Test balance sheet"""
        success, response = self.run_test(
            "Balance Sheet",
            "GET",
            "reports/balance-sheet",
            200
        )
        if success:
            print(f"   Total Assets: ${response.get('total_assets', 0)}")
            print(f"   Total Liabilities: ${response.get('total_liabilities', 0)}")
            print(f"   Net Worth: ${response.get('net_worth', 0)}")
        return success

    def test_delete_transaction(self):
        """Test deleting a transaction"""
        if not self.transaction_ids:
            print("⚠️  No transactions to delete")
            return True
            
        transaction_id = self.transaction_ids[0]
        success, response = self.run_test(
            "Delete Transaction",
            "DELETE",
            f"transactions/{transaction_id}",
            200
        )
        return success

def main():
    print("🚀 Starting Arthvyay API Tests...")
    print("=" * 50)
    
    tester = ArthvyayAPITester()
    
    # Test sequence
    tests = [
        ("User Registration", tester.test_user_registration),
        ("Get Current User", tester.test_get_current_user),
        ("Create Income Transaction", tester.test_create_income_transaction),
        ("Create Expense Transaction", tester.test_create_expense_transaction),
        ("AI Categorization", tester.test_ai_categorization),
        ("Get Transactions", tester.test_get_transactions),
        ("Financial Health Score", tester.test_financial_health_score),
        ("P&L Statement", tester.test_pl_statement),
        ("Balance Sheet", tester.test_balance_sheet),
        ("Delete Transaction", tester.test_delete_transaction),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print final results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print(f"\n✅ All tests passed!")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\nSuccess Rate: {success_rate:.1f}%")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())