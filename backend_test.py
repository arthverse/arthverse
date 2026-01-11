import requests
import sys
import json
from datetime import datetime

class ArthvyayAPITester:
    def __init__(self, base_url="https://arth-verse-launch.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.transaction_ids = []

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

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@arthvyay.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "Test123!",
                "name": "Test User",
                "monthly_income": 50000
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data={
                "email": "test@arthvyay.com",
                "password": "Test123!"
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_income_transaction(self):
        """Test creating income transaction"""
        success, response = self.run_test(
            "Create Income Transaction",
            "POST",
            "transactions",
            200,
            data={
                "amount": 50000,
                "type": "income",
                "category": "Salary",
                "description": "Monthly Salary",
                "date": datetime.now().strftime('%Y-%m-%d')
            }
        )
        if success and 'id' in response:
            self.transaction_ids.append(response['id'])
            return True
        return False

    def test_create_expense_transaction(self):
        """Test creating expense transaction"""
        success, response = self.run_test(
            "Create Expense Transaction",
            "POST",
            "transactions",
            200,
            data={
                "amount": 500,
                "type": "expense",
                "category": "Food & Dining",
                "description": "Lunch at restaurant",
                "date": datetime.now().strftime('%Y-%m-%d')
            }
        )
        if success and 'id' in response:
            self.transaction_ids.append(response['id'])
            return True
        return False

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