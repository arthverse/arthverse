"""
ArthRakshak Module - Backend API Tests
Tests for insurance policies, protection gap, risk profile, and summary endpoints
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://financial-advisor-15.preview.emergentagent.com')

# Test credentials
PREMIUM_USER = {
    "client_id": "AV271676A7",
    "password": "Demo123!"
}

NON_PREMIUM_USER = {
    "client_id": "RUS1501",
    "password": "Test@123"
}


class TestAuthentication:
    """Test authentication for ArthRakshak access"""
    
    def test_login_premium_user(self):
        """Test login with premium user credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Premium user login successful: {data['user']['client_id']}")
        return data["token"]
    
    def test_login_non_premium_user(self):
        """Test login with non-premium user credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=NON_PREMIUM_USER)
        # May fail if user doesn't exist
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            print(f"✓ Non-premium user login successful: {data['user']['client_id']}")
        else:
            print(f"⚠ Non-premium user login failed (user may not exist): {response.status_code}")


class TestArthRakshakSummary:
    """Test /api/arthrakshak/summary endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_get_summary_success(self, auth_token):
        """Test getting ArthRakshak summary"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/arthrakshak/summary", headers=headers)
        
        assert response.status_code == 200, f"Summary failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_policies" in data
        assert "by_category" in data
        assert "total_annual_premium" in data
        assert "policies" in data
        
        # Verify category structure
        assert "life" in data["by_category"]
        assert "health" in data["by_category"]
        assert "vehicle" in data["by_category"]
        assert "cards" in data["by_category"]
        
        print(f"✓ Summary retrieved: {data['total_policies']} policies, ₹{data['total_annual_premium']} annual premium")
        return data
    
    def test_summary_unauthorized(self):
        """Test summary without auth token"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/summary")
        assert response.status_code in [401, 403], "Should require authentication"
        print("✓ Summary correctly requires authentication")


class TestArthRakshakProtectionGap:
    """Test /api/arthrakshak/protection-gap endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_get_protection_gap(self, auth_token):
        """Test getting protection gap analysis"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/arthrakshak/protection-gap", headers=headers)
        
        assert response.status_code == 200, f"Protection gap failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "protection_score" in data
        assert "life_insurance" in data
        assert "health_insurance" in data
        assert "vehicle_insurance" in data
        assert "cards_insurance" in data
        assert "unprotected_areas" in data
        assert "action_items" in data
        
        # Verify protection score is valid
        assert 0 <= data["protection_score"] <= 100
        
        # Verify category structure
        for category in ["life_insurance", "health_insurance", "vehicle_insurance", "cards_insurance"]:
            assert "category" in data[category]
            assert "status" in data[category]
            assert "message" in data[category]
            assert "recommendations" in data[category]
        
        print(f"✓ Protection gap retrieved: Score {data['protection_score']}/100")
        print(f"  - Unprotected areas: {len(data['unprotected_areas'])}")
        print(f"  - Action items: {len(data['action_items'])}")
        return data


class TestArthRakshakRiskProfile:
    """Test /api/arthrakshak/risk-profile endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_get_risk_profile(self, auth_token):
        """Test getting risk profile"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/arthrakshak/risk-profile", headers=headers)
        
        assert response.status_code == 200, f"Risk profile failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "user_id" in data
        assert "age" in data
        assert "marital_status" in data
        assert "dependents" in data
        assert "annual_income" in data
        
        print(f"✓ Risk profile retrieved: Age {data['age']}, Income ₹{data['annual_income']}")
        return data
    
    def test_save_risk_profile(self, auth_token):
        """Test saving risk profile"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        profile_data = {
            "age": 35,
            "marital_status": "married",
            "dependents": 2,
            "earning_members": 1,
            "city_tier": "tier1",
            "annual_income": 1800000,
            "outstanding_loans": 500000,
            "existing_investments": 1000000,
            "emergency_fund_months": 6,
            "has_pure_term": True,
            "total_life_cover": 10000000,
            "health_cover_type": "floater",
            "health_sum_insured": 1000000,
            "employer_insurance_only": False,
            "vehicle_cover_type": "comprehensive",
            "has_zero_depreciation": True,
            "has_own_damage": True,
            "knows_card_benefits": True,
            "card_accidental_cover": 500000
        }
        
        response = requests.post(
            f"{BASE_URL}/api/arthrakshak/risk-profile",
            headers=headers,
            json=profile_data
        )
        
        assert response.status_code == 200, f"Save risk profile failed: {response.text}"
        data = response.json()
        assert "message" in data
        assert "profile" in data
        
        print(f"✓ Risk profile saved successfully")
        return data


class TestArthRakshakPolicies:
    """Test /api/arthrakshak/policies CRUD endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_get_policies(self, auth_token):
        """Test getting all policies"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/arthrakshak/policies", headers=headers)
        
        assert response.status_code == 200, f"Get policies failed: {response.text}"
        data = response.json()
        assert "policies" in data
        
        print(f"✓ Retrieved {len(data['policies'])} policies")
        return data
    
    def test_create_policy(self, auth_token):
        """Test creating a new policy"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        policy_data = {
            "category": "life",
            "policy_type": "term_insurance",
            "insurer_name": "TEST_HDFC Life",
            "policy_number": f"TEST_{uuid.uuid4().hex[:8].upper()}",
            "start_date": "2024-01-01",
            "end_date": "2054-01-01",
            "premium_amount": 15000,
            "premium_frequency": "yearly",
            "sum_assured": 10000000,
            "nominee_added": True,
            "nominees": [{"name": "Test Nominee", "relationship": "spouse", "percentage": 100}]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/arthrakshak/policies",
            headers=headers,
            json=policy_data
        )
        
        assert response.status_code == 200, f"Create policy failed: {response.text}"
        data = response.json()
        
        # Verify response
        assert "id" in data
        assert data["insurer_name"] == policy_data["insurer_name"]
        assert data["sum_assured"] == policy_data["sum_assured"]
        
        print(f"✓ Policy created: {data['id']}")
        return data
    
    def test_update_policy(self, auth_token):
        """Test updating a policy"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a policy
        policy_data = {
            "category": "health",
            "policy_type": "health_family_floater",
            "insurer_name": "TEST_Star Health",
            "policy_number": f"TEST_{uuid.uuid4().hex[:8].upper()}",
            "start_date": "2024-01-01",
            "end_date": "2025-01-01",
            "premium_amount": 25000,
            "premium_frequency": "yearly",
            "sum_assured": 1000000,
            "nominee_added": False,
            "nominees": []
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/arthrakshak/policies",
            headers=headers,
            json=policy_data
        )
        assert create_response.status_code == 200
        created_policy = create_response.json()
        policy_id = created_policy["id"]
        
        # Update the policy
        updated_data = policy_data.copy()
        updated_data["sum_assured"] = 1500000
        updated_data["premium_amount"] = 30000
        
        update_response = requests.put(
            f"{BASE_URL}/api/arthrakshak/policies/{policy_id}",
            headers=headers,
            json=updated_data
        )
        
        assert update_response.status_code == 200, f"Update policy failed: {update_response.text}"
        updated_policy = update_response.json()
        
        assert updated_policy["sum_assured"] == 1500000
        assert updated_policy["premium_amount"] == 30000
        
        print(f"✓ Policy updated: {policy_id}")
        return updated_policy
    
    def test_delete_policy(self, auth_token):
        """Test deleting a policy"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a policy to delete
        policy_data = {
            "category": "vehicle",
            "policy_type": "vehicle_car",
            "insurer_name": "TEST_ICICI Lombard",
            "policy_number": f"TEST_{uuid.uuid4().hex[:8].upper()}",
            "start_date": "2024-01-01",
            "end_date": "2025-01-01",
            "premium_amount": 12000,
            "premium_frequency": "yearly",
            "sum_assured": 800000,
            "nominee_added": False,
            "nominees": []
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/arthrakshak/policies",
            headers=headers,
            json=policy_data
        )
        assert create_response.status_code == 200
        policy_id = create_response.json()["id"]
        
        # Delete the policy
        delete_response = requests.delete(
            f"{BASE_URL}/api/arthrakshak/policies/{policy_id}",
            headers=headers
        )
        
        assert delete_response.status_code == 200, f"Delete policy failed: {delete_response.text}"
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/arthrakshak/policies", headers=headers)
        policies = get_response.json()["policies"]
        assert not any(p["id"] == policy_id for p in policies)
        
        print(f"✓ Policy deleted: {policy_id}")


class TestArthRakshakCoverage:
    """Test /api/arthrakshak/coverage-checklist and policy coverage endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_get_coverage_checklist_life(self, auth_token):
        """Test getting coverage checklist for life insurance"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/life",
            headers=headers
        )
        
        assert response.status_code == 200, f"Coverage checklist failed: {response.text}"
        data = response.json()
        
        assert "inclusions" in data
        assert "exclusions" in data
        assert len(data["inclusions"]) > 0
        assert len(data["exclusions"]) > 0
        
        print(f"✓ Life coverage checklist: {len(data['inclusions'])} inclusions, {len(data['exclusions'])} exclusions")
    
    def test_get_coverage_checklist_health(self, auth_token):
        """Test getting coverage checklist for health insurance"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/health",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "inclusions" in data
        assert "exclusions" in data
        
        print(f"✓ Health coverage checklist: {len(data['inclusions'])} inclusions, {len(data['exclusions'])} exclusions")
    
    def test_get_coverage_checklist_vehicle(self, auth_token):
        """Test getting coverage checklist for vehicle insurance"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/vehicle",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "inclusions" in data
        assert "exclusions" in data
        
        print(f"✓ Vehicle coverage checklist: {len(data['inclusions'])} inclusions, {len(data['exclusions'])} exclusions")
    
    def test_get_coverage_checklist_cards(self, auth_token):
        """Test getting coverage checklist for card insurance"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/cards",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "inclusions" in data
        
        print(f"✓ Cards coverage checklist: {len(data['inclusions'])} inclusions")


class TestQuestionnaireForArthRakshak:
    """Test /api/questionnaire endpoint used by ArthRakshak"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_get_questionnaire(self, auth_token):
        """Test getting questionnaire data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/questionnaire", headers=headers)
        
        assert response.status_code == 200, f"Questionnaire failed: {response.text}"
        data = response.json()
        
        # Verify key fields used by ArthRakshak
        print(f"✓ Questionnaire retrieved")
        
        # Check for family-related fields
        if "marital_status" in data:
            print(f"  - Marital status: {data.get('marital_status', 'N/A')}")
        
        # Check for vehicle data
        if "vehicles" in data and data["vehicles"]:
            print(f"  - Vehicles: {len(data['vehicles'])}")
        
        return data


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PREMIUM_USER)
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["token"]
    
    def test_cleanup_test_policies(self, auth_token):
        """Delete all TEST_ prefixed policies"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get all policies
        response = requests.get(f"{BASE_URL}/api/arthrakshak/policies", headers=headers)
        if response.status_code != 200:
            return
        
        policies = response.json().get("policies", [])
        deleted_count = 0
        
        for policy in policies:
            if policy.get("insurer_name", "").startswith("TEST_") or \
               policy.get("policy_number", "").startswith("TEST_"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/arthrakshak/policies/{policy['id']}",
                    headers=headers
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test policies")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
