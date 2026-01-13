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
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
        
        Returns:
            True if signature is valid, False otherwise
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

# Plan configurations
PLANS = {
    "individual": {
        "name": "Individual Plan",
        "amount": 49900,  # ₹499 in paise
        "description": "Comprehensive Financial Health Report for Individual",
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
    },
    "family": {
        "name": "Family Plan",
        "amount": 99900,  # ₹999 in paise
        "description": "Comprehensive Financial Health Report with Peer Comparison",
        "features": [
            "Everything in Individual Plan",
            "Peer Comparison (vs Age Group)",
            "Family Financial Consolidation",
            "Priority Support"
        ]
    }
}

# Singleton instance
payment_service = PaymentService()
