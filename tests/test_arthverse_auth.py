"""
ArthVerse Authentication Tests
Tests for:
- User registration with new fields (date_of_birth, major_members, minor_members)
- Client ID auto-generation on registration
- Login with Client ID (not email)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestUserRegistration:
    """Test user registration with new fields"""
    
    def test_register_new_user_with_new_fields(self):
        """Test registration with date_of_birth, major_members, minor_members"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "name": "John Doe",
            "email": unique_email,
            "password": "Test123!",
            "mobile_number": "9876543210",
            "date_of_birth": "1990-05-15",
            "age": 34,
            "city": "Mumbai",
            "marital_status": "single",
            "major_members": 1,
            "minor_members": 2,
            "data_privacy_consent": True
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        # Status assertion
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "token" in data, "Token not returned"
        assert "user" in data, "User data not returned"
        
        user = data["user"]
        assert user["email"] == unique_email
        assert user["name"] == "John Doe"
        assert user["date_of_birth"] == "1990-05-15"
        assert user["major_members"] == 1
        assert user["minor_members"] == 2
        assert "client_id" in user, "Client ID not generated"
        
        # Verify client_id format: [FirstInitial][LastInitial][Random][DDMM]
        client_id = user["client_id"]
        assert len(client_id) >= 6, f"Client ID too short: {client_id}"
        assert client_id[0] == "J", f"First initial should be J, got {client_id[0]}"
        assert client_id[1] == "D", f"Last initial should be D, got {client_id[1]}"
        # DDMM from 1990-05-15 should be 1505
        assert "1505" in client_id, f"DDMM (1505) not found in client_id: {client_id}"
        
        print(f"SUCCESS: User registered with client_id: {client_id}")
        return client_id, payload["password"]
    
    def test_register_duplicate_email_fails(self):
        """Test that duplicate email registration fails"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "name": "Test User",
            "email": unique_email,
            "password": "Test123!",
            "mobile_number": "9876543211",
            "date_of_birth": "1995-01-20",
            "age": 29,
            "city": "Delhi",
            "marital_status": "single",
            "major_members": 0,
            "minor_members": 0,
            "data_privacy_consent": True
        }
        
        # First registration should succeed
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response1.status_code == 200, f"First registration failed: {response1.text}"
        
        # Second registration with same email should fail
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response2.status_code == 400, f"Duplicate email should fail, got {response2.status_code}"
        
        data = response2.json()
        assert "already registered" in data.get("detail", "").lower() or "email" in data.get("detail", "").lower()
        print("SUCCESS: Duplicate email registration correctly rejected")
    
    def test_register_invalid_dob_format_fails(self):
        """Test that invalid date of birth format fails"""
        unique_email = f"test_dob_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "name": "Test User",
            "email": unique_email,
            "password": "Test123!",
            "mobile_number": "9876543212",
            "date_of_birth": "invalid-date",  # Invalid format
            "age": 30,
            "city": "Chennai",
            "marital_status": "single",
            "major_members": 0,
            "minor_members": 0,
            "data_privacy_consent": True
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 400, f"Invalid DOB should fail, got {response.status_code}"
        print("SUCCESS: Invalid DOB format correctly rejected")


class TestClientIdLogin:
    """Test login with Client ID instead of email"""
    
    def test_login_with_existing_client_id(self):
        """Test login with existing user's client_id"""
        # Use provided test credentials
        payload = {
            "client_id": "AV271676A7",
            "password": "Demo123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        # Status assertion
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "token" in data, "Token not returned"
        assert "user" in data, "User data not returned"
        
        user = data["user"]
        assert user["client_id"] == "AV271676A7"
        assert "email" in user
        assert "name" in user
        
        print(f"SUCCESS: Logged in as {user['name']} with client_id {user['client_id']}")
        return data["token"]
    
    def test_login_with_invalid_client_id_fails(self):
        """Test that login with invalid client_id fails"""
        payload = {
            "client_id": "INVALID123",
            "password": "Test123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Invalid client_id should fail, got {response.status_code}"
        print("SUCCESS: Invalid client_id login correctly rejected")
    
    def test_login_with_wrong_password_fails(self):
        """Test that login with wrong password fails"""
        payload = {
            "client_id": "AV271676A7",
            "password": "WrongPassword123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Wrong password should fail, got {response.status_code}"
        print("SUCCESS: Wrong password login correctly rejected")
    
    def test_register_and_login_flow(self):
        """Test complete registration and login flow"""
        unique_email = f"test_flow_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register new user
        register_payload = {
            "name": "Flow Test User",
            "email": unique_email,
            "password": "FlowTest123!",
            "mobile_number": "9876543213",
            "date_of_birth": "1988-12-25",
            "age": 36,
            "city": "Bangalore",
            "marital_status": "married",
            "major_members": 2,
            "minor_members": 1,
            "data_privacy_consent": True
        }
        
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload)
        assert register_response.status_code == 200, f"Registration failed: {register_response.text}"
        
        register_data = register_response.json()
        client_id = register_data["user"]["client_id"]
        print(f"Registered user with client_id: {client_id}")
        
        # Login with the generated client_id
        login_payload = {
            "client_id": client_id,
            "password": "FlowTest123!"
        }
        
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        login_data = login_response.json()
        assert login_data["user"]["client_id"] == client_id
        assert login_data["user"]["email"] == unique_email
        
        print(f"SUCCESS: Complete registration and login flow works with client_id: {client_id}")


class TestDashboardHealthScore:
    """Test dashboard health score endpoint"""
    
    def get_auth_token(self):
        """Helper to get auth token"""
        payload = {
            "client_id": "AV271676A7",
            "password": "Demo123!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        if response.status_code == 200:
            return response.json()["token"]
        return None
    
    def test_health_score_endpoint(self):
        """Test health score endpoint returns data"""
        token = self.get_auth_token()
        if not token:
            pytest.skip("Could not get auth token")
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/reports/health-score", headers=headers)
        
        assert response.status_code == 200, f"Health score failed: {response.text}"
        
        data = response.json()
        assert "score" in data, "Score not in response"
        print(f"SUCCESS: Health score endpoint works, score: {data.get('score')}")
    
    def test_health_score_without_auth_fails(self):
        """Test health score endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/health-score")
        assert response.status_code in [401, 403], f"Should require auth, got {response.status_code}"
        print("SUCCESS: Health score endpoint correctly requires authentication")


class TestClientIdGeneration:
    """Test client ID generation format"""
    
    def test_client_id_format_single_name(self):
        """Test client ID generation for single name"""
        unique_email = f"test_single_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "name": "Madonna",  # Single name
            "email": unique_email,
            "password": "Test123!",
            "mobile_number": "9876543214",
            "date_of_birth": "1985-08-16",
            "age": 39,
            "city": "Pune",
            "marital_status": "single",
            "major_members": 0,
            "minor_members": 0,
            "data_privacy_consent": True
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        client_id = data["user"]["client_id"]
        
        # For single name "Madonna", should use first two letters: MA
        assert client_id[0] == "M", f"First initial should be M, got {client_id[0]}"
        # DDMM from 1985-08-16 should be 1608
        assert "1608" in client_id, f"DDMM (1608) not found in client_id: {client_id}"
        
        print(f"SUCCESS: Single name client_id generated: {client_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
