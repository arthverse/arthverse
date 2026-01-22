import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  CreditCard, Check, Plus, Minus, Users, User, 
  Baby, FileText, Shield, TrendingUp, Download,
  Sparkles, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const PRICING = {
  base: 499,
  majorMember: 399,
  minorMember: 199
};

export default function PaymentSection({ token, user, onPaymentSuccess }) {
  const [majorMembers, setMajorMembers] = useState(0);
  const [minorMembers, setMinorMembers] = useState(0);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState([]);

  // Pre-fill from user's registered data
  useEffect(() => {
    if (user) {
      setMajorMembers(user.major_members || 0);
      setMinorMembers(user.minor_members || 0);
    }
    fetchPricingInfo();
  }, [user]);

  // Update pricing whenever members change
  useEffect(() => {
    calculatePrice();
  }, [majorMembers, minorMembers]);

  const fetchPricingInfo = async () => {
    try {
      const response = await axios.get(`${API}/payment/pricing`);
      setFeatures(response.data.features || []);
    } catch (error) {
      console.error('Failed to fetch pricing info:', error);
    }
  };

  const calculatePrice = async () => {
    try {
      const response = await axios.post(`${API}/payment/calculate`, {
        major_members: majorMembers,
        minor_members: minorMembers
      });
      setPricing(response.data);
    } catch (error) {
      // Fallback to local calculation
      const baseAmount = PRICING.base * 100;
      const majorAmount = majorMembers * PRICING.majorMember * 100;
      const minorAmount = minorMembers * PRICING.minorMember * 100;
      const totalAmount = baseAmount + majorAmount + minorAmount;
      
      setPricing({
        base_plan: { amount_display: PRICING.base },
        additional_major_members: { 
          count: majorMembers, 
          amount_display: majorMembers * PRICING.majorMember 
        },
        minor_members: { 
          count: minorMembers, 
          amount_display: minorMembers * PRICING.minorMember 
        },
        total: { amount: totalAmount, amount_display: totalAmount / 100 }
      });
    }
  };

  const handleMajorChange = (delta) => {
    const newValue = Math.max(0, majorMembers + delta);
    setMajorMembers(newValue);
  };

  const handleMinorChange = (delta) => {
    const newValue = Math.max(0, minorMembers + delta);
    setMinorMembers(newValue);
  };

  const handleCheckout = async () => {
    if (!pricing) {
      toast.error('Please wait for pricing to load');
      return;
    }

    setLoading(true);
    
    try {
      // Create order
      const orderResponse = await axios.post(
        `${API}/payment/create-order`,
        {
          major_members: majorMembers,
          minor_members: minorMembers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order_id, amount, key_id } = orderResponse.data;

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: 'INR',
        name: 'ArthVyay',
        description: `Individual Plan + ${majorMembers} Major + ${minorMembers} Minor Members`,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                major_members: majorMembers,
                minor_members: minorMembers
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Your report is ready.');
              onPaymentSuccess?.('individual');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email || '',
          contact: user?.mobile_number || ''
        },
        theme: {
          color: '#2563eb'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to initiate payment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = 1 + majorMembers + minorMembers; // 1 = primary member

  return (
    <Card className="overflow-hidden rounded-3xl border-2 border-brand-blue/20 shadow-xl" data-testid="payment-section">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-2xl font-bold font-heading">ArthVyay Individual Plan</h2>
        </div>
        <p className="text-blue-100">Comprehensive Financial Health Report for your family</p>
      </div>

      <div className="p-6">
        {/* Pricing Info */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-brand-blue" />
            <h3 className="font-semibold text-lg">Pricing Details</h3>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              All prices inclusive of taxes
            </span>
          </div>

          {/* Base Plan */}
          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p className="font-medium">Base Plan</p>
                <p className="text-sm text-slate-500">Includes primary member (you)</p>
              </div>
            </div>
            <p className="text-xl font-bold text-brand-blue">₹{PRICING.base}</p>
          </div>

          {/* Additional Major Members */}
          <div className="flex items-center justify-between py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Additional Major Members <span className="text-slate-400 text-sm">(18+)</span></p>
                <p className="text-sm text-slate-500">₹{PRICING.majorMember} per member</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleMajorChange(-1)}
                disabled={majorMembers === 0}
                className="w-9 h-9 rounded-full"
                data-testid="decrease-major-btn"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center text-xl font-bold" data-testid="major-members-count">
                {majorMembers}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleMajorChange(1)}
                className="w-9 h-9 rounded-full"
                data-testid="increase-major-btn"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="w-20 text-right font-semibold text-green-600">
                ₹{majorMembers * PRICING.majorMember}
              </span>
            </div>
          </div>

          {/* Minor Members */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Baby className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Minor Members <span className="text-slate-400 text-sm">(&lt;18)</span></p>
                <p className="text-sm text-slate-500">₹{PRICING.minorMember} per member</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleMinorChange(-1)}
                disabled={minorMembers === 0}
                className="w-9 h-9 rounded-full"
                data-testid="decrease-minor-btn"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center text-xl font-bold" data-testid="minor-members-count">
                {minorMembers}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleMinorChange(1)}
                className="w-9 h-9 rounded-full"
                data-testid="increase-minor-btn"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="w-20 text-right font-semibold text-orange-600">
                ₹{minorMembers * PRICING.minorMember}
              </span>
            </div>
          </div>
        </div>

        {/* Total Members Summary */}
        <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-blue" />
            <span className="font-medium">Total Family Members Covered:</span>
          </div>
          <span className="text-xl font-bold text-brand-blue" data-testid="total-members">
            {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Total Price */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Amount</p>
              <p className="text-4xl font-bold font-mono" data-testid="total-price">
                ₹{pricing?.total?.amount_display || PRICING.base + (majorMembers * PRICING.majorMember) + (minorMembers * PRICING.minorMember)}
              </p>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>₹{PRICING.base} (base)</p>
              {majorMembers > 0 && <p>+ ₹{majorMembers * PRICING.majorMember} ({majorMembers} major)</p>}
              {minorMembers > 0 && <p>+ ₹{minorMembers * PRICING.minorMember} ({minorMembers} minor)</p>}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            What's Included
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {(features.length > 0 ? features : [
              'Detailed Financial Health Score',
              '9-Component Score Breakdown',
              'Income & Expense Analysis',
              'Net Worth Analysis',
              'Insurance Coverage Analysis',
              '5 Personalized Recommendations',
              '5-Year Financial Projection',
              'PDF Report Download'
            ]).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg mb-6 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-amber-800">
            <strong>Note:</strong> Primary member (you) cannot be removed. 
            If a minor member turns 18, they will be automatically reclassified as a major member.
          </p>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={loading || !pricing}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-brand-blue to-blue-600 hover:from-brand-blue/90 hover:to-blue-600/90 rounded-xl shadow-lg"
          data-testid="checkout-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pay ₹{pricing?.total?.amount_display || PRICING.base + (majorMembers * PRICING.majorMember) + (minorMembers * PRICING.minorMember)}
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Secure payment powered by Razorpay • 100% Refund if not satisfied
        </p>
      </div>
    </Card>
  );
}
