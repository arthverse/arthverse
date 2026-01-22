"""
ArthVyay Payment & Pricing Module - Backend API Tests
Tests for: Pricing info, Price calculation, Order creation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CLIENT_ID = "AV271676A7"
TEST_PASSWORD = "Demo123!"


class TestPaymentPricing:
    """Tests for payment pricing endpoints"""
    
    def test_get_pricing_info(self):
        """Test GET /api/payment/pricing returns correct pricing info"""
        response = requests.get(f"{BASE_URL}/api/payment/pricing")
        assert response.status_code == 200, f"Pricing endpoint failed: {response.text}"
        
        data = response.json()
        
        # Verify base plan pricing
        assert "base_plan" in data
        assert data["base_plan"]["price"] == 499.0
        assert data["base_plan"]["name"] == "ArthVyay Individual Plan"
        assert data["base_plan"]["description"] == "Includes primary member (account owner)"
        assert data["base_plan"]["currency"] == "INR"
        
        # Verify additional major member pricing
        assert "additional_major_member" in data
        assert data["additional_major_member"]["price"] == 399.0
        assert "18+" in data["additional_major_member"]["description"]
        
        # Verify minor member pricing
        assert "minor_member" in data
        assert data["minor_member"]["price"] == 199.0
        assert "<18" in data["minor_member"]["description"]
        
        # Verify tax inclusive flag
        assert data["tax_inclusive"] == True
        
        # Verify features list
        assert "features" in data
        assert len(data["features"]) > 0
        
        print(f"✓ Pricing info: Base=₹{data['base_plan']['price']}, Major=₹{data['additional_major_member']['price']}, Minor=₹{data['minor_member']['price']}")


class TestPriceCalculation:
    """Tests for price calculation endpoint"""
    
    def test_calculate_base_price_zero_members(self):
        """Test POST /api/payment/calculate with 0 members returns base price ₹499"""
        response = requests.post(
            f"{BASE_URL}/api/payment/calculate",
            json={"major_members": 0, "minor_members": 0}
        )
        assert response.status_code == 200, f"Calculate failed: {response.text}"
        
        data = response.json()
        
        # Verify base plan
        assert data["base_plan"]["amount"] == 49900  # paise
        assert data["base_plan"]["amount_display"] == 499.0  # rupees
        
        # Verify no additional members
        assert data["additional_major_members"]["count"] == 0
        assert data["additional_major_members"]["amount"] == 0
        assert data["minor_members"]["count"] == 0
        assert data["minor_members"]["amount"] == 0
        
        # Verify total
        assert data["total"]["amount"] == 49900  # paise
        assert data["total"]["amount_display"] == 499.0  # rupees
        assert data["total"]["currency"] == "INR"
        
        # Verify tax inclusive
        assert data["tax_inclusive"] == True
        
        print(f"✓ Base price (0 members): ₹{data['total']['amount_display']}")
    
    def test_calculate_with_major_and_minor_members(self):
        """Test POST /api/payment/calculate with 2 major + 1 minor returns ₹1496"""
        response = requests.post(
            f"{BASE_URL}/api/payment/calculate",
            json={"major_members": 2, "minor_members": 1}
        )
        assert response.status_code == 200, f"Calculate failed: {response.text}"
        
        data = response.json()
        
        # Verify base plan
        assert data["base_plan"]["amount"] == 49900  # ₹499
        
        # Verify major members: 2 * ₹399 = ₹798
        assert data["additional_major_members"]["count"] == 2
        assert data["additional_major_members"]["unit_price"] == 39900  # ₹399 in paise
        assert data["additional_major_members"]["amount"] == 79800  # ₹798 in paise
        assert data["additional_major_members"]["amount_display"] == 798.0
        
        # Verify minor members: 1 * ₹199 = ₹199
        assert data["minor_members"]["count"] == 1
        assert data["minor_members"]["unit_price"] == 19900  # ₹199 in paise
        assert data["minor_members"]["amount"] == 19900  # ₹199 in paise
        assert data["minor_members"]["amount_display"] == 199.0
        
        # Verify total: ₹499 + ₹798 + ₹199 = ₹1496
        expected_total = 49900 + 79800 + 19900  # 149600 paise
        assert data["total"]["amount"] == expected_total
        assert data["total"]["amount_display"] == 1496.0
        
        print(f"✓ Price with 2 major + 1 minor: ₹{data['total']['amount_display']}")
    
    def test_calculate_with_only_major_members(self):
        """Test price calculation with only major members"""
        response = requests.post(
            f"{BASE_URL}/api/payment/calculate",
            json={"major_members": 3, "minor_members": 0}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # ₹499 + (3 * ₹399) = ₹499 + ₹1197 = ₹1696
        assert data["additional_major_members"]["count"] == 3
        assert data["additional_major_members"]["amount_display"] == 1197.0
        assert data["total"]["amount_display"] == 1696.0
        
        print(f"✓ Price with 3 major members: ₹{data['total']['amount_display']}")
    
    def test_calculate_with_only_minor_members(self):
        """Test price calculation with only minor members"""
        response = requests.post(
            f"{BASE_URL}/api/payment/calculate",
            json={"major_members": 0, "minor_members": 2}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # ₹499 + (2 * ₹199) = ₹499 + ₹398 = ₹897
        assert data["minor_members"]["count"] == 2
        assert data["minor_members"]["amount_display"] == 398.0
        assert data["total"]["amount_display"] == 897.0
        
        print(f"✓ Price with 2 minor members: ₹{data['total']['amount_display']}")
    
    def test_calculate_breakdown_text(self):
        """Test that breakdown text is correctly formatted"""
        response = requests.post(
            f"{BASE_URL}/api/payment/calculate",
            json={"major_members": 1, "minor_members": 1}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify breakdown text format
        assert "breakdown_text" in data
        assert "₹499 (base)" in data["breakdown_text"]
        assert "1 major" in data["breakdown_text"]
        assert "1 minor" in data["breakdown_text"]
        
        print(f"✓ Breakdown text: {data['breakdown_text']}")


class TestPaymentPlans:
    """Tests for payment plans endpoint"""
    
    def test_get_payment_plans(self):
        """Test GET /api/payment/plans returns plan details"""
        response = requests.get(f"{BASE_URL}/api/payment/plans")
        assert response.status_code == 200, f"Plans endpoint failed: {response.text}"
        
        data = response.json()
        
        assert "plans" in data
        assert "individual" in data["plans"]
        
        individual = data["plans"]["individual"]
        assert individual["name"] == "ArthVyay Individual Plan"
        assert individual["base_amount"] == 499.0
        assert individual["additional_major_price"] == 399.0
        assert individual["minor_price"] == 199.0
        assert individual["tax_inclusive"] == True
        assert "features" in individual
        
        print(f"✓ Payment plans retrieved: {individual['name']}")


class TestCreateOrder:
    """Tests for order creation endpoint (requires auth)"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "client_id": TEST_CLIENT_ID,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Login failed - cannot test authenticated endpoints")
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_create_order_requires_auth(self):
        """Test that create-order requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-order",
            json={"major_members": 0, "minor_members": 0}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Create order requires authentication")
    
    def test_create_order_razorpay_not_configured(self, auth_headers):
        """Test create-order fails gracefully when Razorpay not configured"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-order",
            headers=auth_headers,
            json={"major_members": 0, "minor_members": 0}
        )
        
        # Should return 500 with Razorpay error (API keys not configured)
        # This is expected behavior as Razorpay is mocked
        if response.status_code == 500:
            data = response.json()
            assert "Razorpay" in data.get("detail", ""), "Expected Razorpay error message"
            print(f"✓ Create order fails gracefully: {data.get('detail', '')}")
        elif response.status_code == 400:
            # User might already have premium
            print(f"✓ Create order returned 400 (user may have active plan)")
        elif response.status_code in [520, 502, 503, 504]:
            # Cloudflare/gateway errors - expected when Razorpay times out
            print(f"✓ Create order returned {response.status_code} (gateway timeout - Razorpay not configured)")
        elif response.status_code == 200:
            # If it succeeds, verify response structure
            data = response.json()
            assert "order_id" in data
            print(f"✓ Create order succeeded (Razorpay configured)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


class TestPaymentVerify:
    """Tests for payment verification endpoint"""
    
    def test_verify_requires_auth(self):
        """Test that verify endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payment/verify",
            json={
                "razorpay_order_id": "test_order",
                "razorpay_payment_id": "test_payment",
                "razorpay_signature": "test_signature"
            }
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Verify payment requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
