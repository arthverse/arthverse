import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, Check, Loader2, Download, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export default function PaymentSection({ token, onPaymentSuccess }) {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchPaymentStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/payment/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      const response = await axios.get(`${API}/payment/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentStatus(response.data);
    } catch (error) {
      console.error('Error fetching payment status:', error);
    }
  };

  const handlePayment = async (planType) => {
    setProcessingPlan(planType);
    
    try {
      // Create order
      const orderResponse = await axios.post(
        `${API}/payment/create-order`,
        { plan_type: planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order_id, amount, key_id, plan_name } = orderResponse.data;

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Open Razorpay checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: "INR",
        name: "arth-verse",
        description: plan_name,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_type: planType
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Your report is ready.');
              fetchPaymentStatus();
              if (onPaymentSuccess) onPaymentSuccess(planType);
            }
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
            setProcessingPlan(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    } finally {
      setProcessingPlan(null);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(`${API}/report/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'arth-verse_financial_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  // If user already has premium
  if (paymentStatus?.has_premium) {
    return (
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900">Premium Access Active</h3>
            <p className="text-sm text-amber-700">
              {paymentStatus.premium_plan === 'family' ? 'Family Plan' : 'Individual Plan'} • 
              Purchased on {new Date(paymentStatus.payments[0]?.date).toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={handleDownloadReport}
            className="bg-amber-600 hover:bg-amber-700 rounded-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Unlock Detailed Financial Insights
        </h2>
        <p className="text-slate-600">
          Get your comprehensive financial health report with personalized recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual Plan */}
        <Card className="p-6 border-2 border-slate-200 hover:border-brand-blue transition-colors relative overflow-hidden">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">Individual Plan</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold text-brand-blue">₹499</span>
              <span className="text-slate-500">one-time</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {plans?.individual?.features?.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handlePayment('individual')}
            disabled={processingPlan === 'individual'}
            className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 rounded-xl"
            data-testid="buy-individual-btn"
          >
            {processingPlan === 'individual' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Now - ₹499
              </>
            )}
          </Button>
        </Card>

        {/* Family Plan */}
        <Card className="p-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Family Plan
            </h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold text-amber-600">₹999</span>
              <span className="text-slate-500">one-time</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {plans?.family?.features?.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handlePayment('family')}
            disabled={processingPlan === 'family'}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 rounded-xl"
            data-testid="buy-family-btn"
          >
            {processingPlan === 'family' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Buy Now - ₹999
              </>
            )}
          </Button>
        </Card>
      </div>

      <p className="text-center text-sm text-slate-500">
        🔒 Secure payment via Razorpay • UPI, Cards, NetBanking accepted • No recurring charges
      </p>
    </div>
  );
}
