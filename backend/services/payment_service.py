import os
import razorpay
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    """Service for Razorpay payment integration"""
    
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        self.client = None
        
        if self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
    
    def create_order(self, amount: int, currency: str = "INR", receipt: str = None, notes: dict = None) -> dict:
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in paise (e.g., 49900 for ₹499)
            currency: Currency code (default: INR)
            receipt: Optional receipt ID
            notes: Optional notes dict
        
        Returns:
            Order details including order_id
        """
        if not self.client:
            raise Exception("Razorpay client not initialized. Check API keys.")
        
        if not receipt:
            receipt = f"receipt_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        order_data = {
            "amount": amount,
            "currency": currency,
            "receipt": receipt,
            "notes": notes or {}
        }
        
        try:
            order = self.client.order.create(data=order_data)
            logger.info(f"Created Razorpay order: {order['id']}")
            return order
        except Exception as e:
            logger.error(f"Failed to create Razorpay order: {str(e)}")
            raise
    
    def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verify Razorpay payment signature
        """
        if not self.client:
            raise Exception("Razorpay client not initialized. Check API keys.")
        
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            logger.info(f"Payment verified successfully: {razorpay_payment_id}")
            return True
        except razorpay.errors.SignatureVerificationError:
            logger.error(f"Payment signature verification failed: {razorpay_payment_id}")
            return False
        except Exception as e:
            logger.error(f"Payment verification error: {str(e)}")
            return False
    
    def get_payment_details(self, payment_id: str) -> dict:
        """Get payment details from Razorpay"""
        if not self.client:
            raise Exception("Razorpay client not initialized. Check API keys.")
        
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            logger.error(f"Failed to fetch payment details: {str(e)}")
            raise


# ==================== PRICING CONFIGURATION ====================

# Base pricing (in paise - 100 paise = ₹1)
PRICING = {
    "base_plan": 49900,              # ₹499 - includes primary member
    "additional_major": 39900,       # ₹399 per additional major member (18+)
    "additional_minor": 19900,       # ₹199 per minor member (<18)
}

# Plan configurations
PLANS = {
    "individual": {
        "name": "ArthVyay Individual Plan",
        "base_amount": PRICING["base_plan"],
        "description": "Comprehensive Financial Health Report",
        "includes_primary": True,
        "features": [
            "Detailed Financial Health Score",
            "9-Component Score Breakdown",
            "Income & Expense Analysis",
            "Net Worth Analysis",
            "Insurance Coverage Analysis",
            "5 Personalized Recommendations",
            "5-Year Financial Projection",
            "PDF Report Download"
        ]
    }
}


def calculate_plan_price(major_members: int = 0, minor_members: int = 0) -> dict:
    """
    Calculate total plan price based on family members.
    
    Args:
        major_members: Number of additional major members (18+), excluding primary user
        minor_members: Number of minor members (<18)
    
    Returns:
        dict with pricing breakdown
    """
    base_amount = PRICING["base_plan"]
    major_amount = major_members * PRICING["additional_major"]
    minor_amount = minor_members * PRICING["additional_minor"]
    total_amount = base_amount + major_amount + minor_amount
    
    return {
        "base_plan": {
            "description": "Individual Plan (includes primary member)",
            "amount": base_amount,
            "amount_display": base_amount / 100  # Convert to rupees
        },
        "additional_major_members": {
            "count": major_members,
            "unit_price": PRICING["additional_major"],
            "unit_price_display": PRICING["additional_major"] / 100,
            "amount": major_amount,
            "amount_display": major_amount / 100
        },
        "minor_members": {
            "count": minor_members,
            "unit_price": PRICING["additional_minor"],
            "unit_price_display": PRICING["additional_minor"] / 100,
            "amount": minor_amount,
            "amount_display": minor_amount / 100
        },
        "total": {
            "amount": total_amount,
            "amount_display": total_amount / 100,
            "currency": "INR"
        },
        "tax_inclusive": True,
        "breakdown_text": f"₹499 (base) + ₹{int(major_amount/100)} ({major_members} major) + ₹{int(minor_amount/100)} ({minor_members} minor)"
    }


# Singleton instance
payment_service = PaymentService()
