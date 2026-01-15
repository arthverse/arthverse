"""
ArthRakshak Insurance & Risk Coverage Module - Backend API Tests
Tests for: Policy CRUD, Risk Profile, Protection Gap, Coverage Checklist
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from previous iteration
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


class TestArthRakshakAuth:
    """Authentication tests for ArthRakshak endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print(f"✓ Login successful, token received")


class TestArthRakshakSummary:
    """Tests for ArthRakshak summary endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_summary(self, auth_headers):
        """Test getting ArthRakshak summary"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/summary", headers=auth_headers)
        assert response.status_code == 200, f"Summary failed: {response.text}"
        
        data = response.json()
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


class TestArthRakshakPolicyCRUD:
    """Tests for Policy CRUD operations"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    @pytest.fixture(scope="class")
    def test_policy_data(self):
        """Test policy data for CRUD operations"""
        return {
            "category": "life",
            "policy_type": "term_insurance",
            "insurer_name": "TEST_HDFC Life",
            "policy_number": f"TEST_POL{uuid.uuid4().hex[:8].upper()}",
            "start_date": "2024-01-01",
            "end_date": "2054-01-01",
            "premium_amount": 15000,
            "premium_frequency": "yearly",
            "sum_assured": 10000000,
            "nominee_added": True,
            "nominees": [{"name": "Test Nominee", "relationship": "Spouse", "percentage": 100}],
            "document_url": ""
        }
    
    def test_create_life_policy(self, auth_headers, test_policy_data):
        """Test creating a life insurance policy"""
        response = requests.post(
            f"{BASE_URL}/api/arthrakshak/policies",
            headers=auth_headers,
            json=test_policy_data
        )
        assert response.status_code == 200, f"Create policy failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["category"] == "life"
        assert data["policy_type"] == "term_insurance"
        assert data["insurer_name"] == test_policy_data["insurer_name"]
        assert data["sum_assured"] == 10000000
        assert data["premium_amount"] == 15000
        
        # Store policy ID for later tests
        pytest.created_policy_id = data["id"]
        print(f"✓ Life policy created: {data['id']}")
    
    def test_create_health_policy(self, auth_headers):
        """Test creating a health insurance policy"""
        health_policy = {
            "category": "health",
            "policy_type": "health_family_floater",
            "insurer_name": "TEST_Star Health",
            "policy_number": f"TEST_HEALTH{uuid.uuid4().hex[:8].upper()}",
            "start_date": "2024-01-01",
            "end_date": "2025-01-01",
            "premium_amount": 25000,
            "premium_frequency": "yearly",
            "sum_assured": 1000000,
            "nominee_added": False,
            "nominees": [],
            "document_url": ""
        }
        
        response = requests.post(
            f"{BASE_URL}/api/arthrakshak/policies",
            headers=auth_headers,
            json=health_policy
        )
        assert response.status_code == 200, f"Create health policy failed: {response.text}"
        
        data = response.json()
        assert data["category"] == "health"
        assert data["policy_type"] == "health_family_floater"
        
        pytest.created_health_policy_id = data["id"]
        print(f"✓ Health policy created: {data['id']}")
    
    def test_get_policies(self, auth_headers):
        """Test getting all policies"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/policies", headers=auth_headers)
        assert response.status_code == 200, f"Get policies failed: {response.text}"
        
        data = response.json()
        assert "policies" in data
        assert isinstance(data["policies"], list)
        
        # Verify our test policies exist
        policy_ids = [p["id"] for p in data["policies"]]
        if hasattr(pytest, 'created_policy_id'):
            assert pytest.created_policy_id in policy_ids, "Created life policy not found"
        
        print(f"✓ Retrieved {len(data['policies'])} policies")
    
    def test_update_policy(self, auth_headers, test_policy_data):
        """Test updating a policy"""
        if not hasattr(pytest, 'created_policy_id'):
            pytest.skip("No policy created to update")
        
        updated_data = test_policy_data.copy()
        updated_data["insurer_name"] = "TEST_HDFC Life Updated"
        updated_data["premium_amount"] = 18000
        
        response = requests.put(
            f"{BASE_URL}/api/arthrakshak/policies/{pytest.created_policy_id}",
            headers=auth_headers,
            json=updated_data
        )
        assert response.status_code == 200, f"Update policy failed: {response.text}"
        
        data = response.json()
        assert data["insurer_name"] == "TEST_HDFC Life Updated"
        assert data["premium_amount"] == 18000
        
        print(f"✓ Policy updated successfully")
    
    def test_delete_policy(self, auth_headers):
        """Test deleting a policy"""
        if not hasattr(pytest, 'created_policy_id'):
            pytest.skip("No policy created to delete")
        
        response = requests.delete(
            f"{BASE_URL}/api/arthrakshak/policies/{pytest.created_policy_id}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Delete policy failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/arthrakshak/policies", headers=auth_headers)
        policies = get_response.json()["policies"]
        policy_ids = [p["id"] for p in policies]
        assert pytest.created_policy_id not in policy_ids, "Policy still exists after deletion"
        
        print(f"✓ Policy deleted successfully")
    
    def test_delete_health_policy_cleanup(self, auth_headers):
        """Cleanup: Delete health policy"""
        if not hasattr(pytest, 'created_health_policy_id'):
            pytest.skip("No health policy to cleanup")
        
        response = requests.delete(
            f"{BASE_URL}/api/arthrakshak/policies/{pytest.created_health_policy_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        print(f"✓ Health policy cleaned up")


class TestArthRakshakRiskProfile:
    """Tests for Risk Profile endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_risk_profile(self, auth_headers):
        """Test getting risk profile"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/risk-profile", headers=auth_headers)
        assert response.status_code == 200, f"Get risk profile failed: {response.text}"
        
        data = response.json()
        # Verify profile structure
        assert "age" in data
        assert "marital_status" in data
        assert "dependents" in data
        assert "annual_income" in data
        assert "city_tier" in data
        
        print(f"✓ Risk profile retrieved: age={data.get('age')}, income={data.get('annual_income')}")
    
    def test_save_risk_profile(self, auth_headers):
        """Test saving risk profile"""
        profile_data = {
            "age": 35,
            "marital_status": "married",
            "dependents": 2,
            "earning_members": 2,
            "city_tier": "tier1",
            "annual_income": 1500000,
            "outstanding_loans": 3000000,
            "existing_investments": 500000,
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
            headers=auth_headers,
            json=profile_data
        )
        assert response.status_code == 200, f"Save risk profile failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "profile" in data
        
        # Verify saved data
        saved_profile = data["profile"]
        assert saved_profile["age"] == 35
        assert saved_profile["annual_income"] == 1500000
        assert saved_profile["dependents"] == 2
        
        print(f"✓ Risk profile saved successfully")
    
    def test_verify_risk_profile_persistence(self, auth_headers):
        """Verify risk profile was persisted correctly"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/risk-profile", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["age"] == 35
        assert data["annual_income"] == 1500000
        
        print(f"✓ Risk profile persistence verified")


class TestArthRakshakProtectionGap:
    """Tests for Protection Gap calculation"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_protection_gap(self, auth_headers):
        """Test getting protection gap analysis"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/protection-gap", headers=auth_headers)
        assert response.status_code == 200, f"Get protection gap failed: {response.text}"
        
        data = response.json()
        
        # Verify structure
        assert "protection_score" in data
        assert "life_insurance" in data
        assert "health_insurance" in data
        assert "vehicle_insurance" in data
        assert "cards_insurance" in data
        assert "unprotected_areas" in data
        assert "action_items" in data
        
        # Verify category structure
        for category in ["life_insurance", "health_insurance", "vehicle_insurance", "cards_insurance"]:
            cat_data = data[category]
            assert "category" in cat_data
            assert "status" in cat_data
            assert "message" in cat_data
            assert cat_data["status"] in ["covered", "underinsured", "not_insured", "unknown"]
        
        print(f"✓ Protection gap retrieved: score={data['protection_score']}")
        print(f"  Life: {data['life_insurance']['status']}")
        print(f"  Health: {data['health_insurance']['status']}")
        print(f"  Vehicle: {data['vehicle_insurance']['status']}")
        print(f"  Cards: {data['cards_insurance']['status']}")


class TestArthRakshakCoverageChecklist:
    """Tests for Coverage Checklist endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_life_checklist(self, auth_headers):
        """Test getting life insurance checklist"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/life",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Get life checklist failed: {response.text}"
        
        data = response.json()
        assert "inclusions" in data
        assert "exclusions" in data
        assert len(data["inclusions"]) > 0
        assert len(data["exclusions"]) > 0
        
        # Verify structure
        for item in data["inclusions"]:
            assert "key" in item
            assert "label" in item
        
        print(f"✓ Life checklist: {len(data['inclusions'])} inclusions, {len(data['exclusions'])} exclusions")
    
    def test_get_health_checklist(self, auth_headers):
        """Test getting health insurance checklist"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/health",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["inclusions"]) > 0
        print(f"✓ Health checklist: {len(data['inclusions'])} inclusions, {len(data['exclusions'])} exclusions")
    
    def test_get_vehicle_checklist(self, auth_headers):
        """Test getting vehicle insurance checklist"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/vehicle",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["inclusions"]) > 0
        print(f"✓ Vehicle checklist: {len(data['inclusions'])} inclusions, {len(data['exclusions'])} exclusions")
    
    def test_get_cards_checklist(self, auth_headers):
        """Test getting cards insurance checklist"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/cards",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "inclusions" in data
        print(f"✓ Cards checklist: {len(data['inclusions'])} inclusions")
    
    def test_invalid_category_checklist(self, auth_headers):
        """Test getting checklist for invalid category"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/coverage-checklist/invalid",
            headers=auth_headers
        )
        assert response.status_code == 400
        print(f"✓ Invalid category returns 400 as expected")


class TestArthRakshakPolicyCoverage:
    """Tests for Policy Coverage (inclusions/exclusions) endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    @pytest.fixture(scope="class")
    def test_policy(self, auth_headers):
        """Create a test policy for coverage tests"""
        policy_data = {
            "category": "life",
            "policy_type": "term_insurance",
            "insurer_name": "TEST_Coverage_Policy",
            "policy_number": f"TEST_COV{uuid.uuid4().hex[:8].upper()}",
            "start_date": "2024-01-01",
            "end_date": "2054-01-01",
            "premium_amount": 12000,
            "premium_frequency": "yearly",
            "sum_assured": 5000000,
            "nominee_added": False,
            "nominees": [],
            "document_url": ""
        }
        
        response = requests.post(
            f"{BASE_URL}/api/arthrakshak/policies",
            headers=auth_headers,
            json=policy_data
        )
        assert response.status_code == 200
        return response.json()
    
    def test_get_policy_coverage(self, auth_headers, test_policy):
        """Test getting policy coverage details"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/policies/{test_policy['id']}/coverage",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Get coverage failed: {response.text}"
        
        data = response.json()
        assert "policy_id" in data
        assert "inclusions" in data
        assert "exclusions" in data
        assert "custom_notes" in data
        
        print(f"✓ Policy coverage retrieved with default values")
    
    def test_update_policy_coverage(self, auth_headers, test_policy):
        """Test updating policy coverage"""
        coverage_data = {
            "inclusions": {
                "death_illness": True,
                "death_accident": True,
                "critical_illness": True,
                "accidental_disability": False
            },
            "exclusions": {
                "suicide_clause": True,
                "ped": True,
                "adventure_sports": False
            },
            "custom_notes": "Test coverage notes - policy includes critical illness rider"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/arthrakshak/policies/{test_policy['id']}/coverage",
            headers=auth_headers,
            json=coverage_data
        )
        assert response.status_code == 200, f"Update coverage failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "coverage" in data
        
        print(f"✓ Policy coverage updated successfully")
    
    def test_verify_coverage_persistence(self, auth_headers, test_policy):
        """Verify coverage was persisted correctly"""
        response = requests.get(
            f"{BASE_URL}/api/arthrakshak/policies/{test_policy['id']}/coverage",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["inclusions"]["critical_illness"] == True
        assert data["custom_notes"] == "Test coverage notes - policy includes critical illness rider"
        
        print(f"✓ Coverage persistence verified")
    
    def test_cleanup_test_policy(self, auth_headers, test_policy):
        """Cleanup: Delete test policy"""
        response = requests.delete(
            f"{BASE_URL}/api/arthrakshak/policies/{test_policy['id']}",
            headers=auth_headers
        )
        assert response.status_code == 200
        print(f"✓ Test policy cleaned up")


class TestArthRakshakUnauthorized:
    """Tests for unauthorized access"""
    
    def test_summary_without_auth(self):
        """Test accessing summary without authentication"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/summary")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Summary requires authentication")
    
    def test_policies_without_auth(self):
        """Test accessing policies without authentication"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/policies")
        assert response.status_code in [401, 403]
        print(f"✓ Policies require authentication")
    
    def test_risk_profile_without_auth(self):
        """Test accessing risk profile without authentication"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/risk-profile")
        assert response.status_code in [401, 403]
        print(f"✓ Risk profile requires authentication")
    
    def test_protection_gap_without_auth(self):
        """Test accessing protection gap without authentication"""
        response = requests.get(f"{BASE_URL}/api/arthrakshak/protection-gap")
        assert response.status_code in [401, 403]
        print(f"✓ Protection gap requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
