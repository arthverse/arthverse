import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Target, FileText, PieChart, TrendingUp, Scale, Shield,
  CreditCard, Lightbulb, Download, Check, Lock, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const BENEFITS = [
  {
    icon: Target,
    title: "Personal Financial Score (0–100)",
    description: "Calculated using income stability, expense discipline, assets, liabilities, and risk indicators."
  },
  {
    icon: FileText,
    title: "Business-style Balance Sheet & P&L for Your Life",
    description: "A structured snapshot of your personal finances."
  },
  {
    icon: PieChart,
    title: "9-Component Financial Health Breakdown",
    description: "Covers savings, debt stress, investments, insurance, net worth, asset allocation, and financial habits."
  },
  {
    icon: TrendingUp,
    title: "Income & Expense Intelligence",
    description: "Identifies cash-flow gaps and spending inefficiencies."
  },
  {
    icon: Scale,
    title: "Net Worth & Liability Stress Analysis",
    description: "Highlights strengths and pressure points in your finances."
  },
  {
    icon: Shield,
    title: "Insurance Adequacy Check (Life & Health)",
    description: "Flags protection gaps based on age and dependents."
  },
  {
    icon: CreditCard,
    title: "Best Credit Card Based on Your Spending Pattern",
    description: "An unbiased recommendation using your actual spending behaviour, expected benefits, and suitability — not sponsored rankings."
  },
  {
    icon: Lightbulb,
    title: "Actionable Financial Decisions (Not Generic Tips)",
    description: "Clear next steps such as Apply / Wait / Fix, explained with reasoning."
  },
  {
    icon: Download,
    title: "Downloadable Financial Report (PDF)",
    description: "A consolidated record of your financial diagnosis."
  }
];

export default function PaymentSection({ token, user, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // Create order with base pricing (₹499)
      const orderResponse = await axios.post(
        `${API}/payment/create-order`,
        {
          major_members: 0,
          minor_members: 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order_id, amount, key_id } = orderResponse.data;

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
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
        description: 'Individual Plan - Financial Diagnosis',
        order_id: order_id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                major_members: 0,
                minor_members: 0
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Your financial diagnosis is ready.');
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
          color: '#1e40af'
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

  return (
    <div className="space-y-6" data-testid="payment-section">
      {/* Hero Card */}
      <Card className="overflow-hidden rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" data-testid="payment-hero-card">
        <div className="p-8 md:p-12">
          {/* Plan Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Individual Plan</span>
            </div>
          </div>

          {/* Value Proposition */}
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4 leading-tight">
            Complete Financial Diagnosis<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              & Decision Framework
            </span>
          </h2>
          
          <p className="text-lg text-slate-300 mb-8 max-w-2xl">
            Built on your real income, expenses, assets, and liabilities. 
            Data-driven insights, not generic advice.
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-5xl md:text-6xl font-bold text-white font-mono">₹499</span>
            <div className="text-slate-400">
              <p className="text-sm">one-time payment</p>
              <p className="text-xs">inclusive of all applicable taxes</p>
            </div>
          </div>

          {/* Primary User Badge */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl w-fit mb-8">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-white text-sm">Includes 1 primary user by default</span>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full md:w-auto h-14 px-10 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30"
            data-testid="checkout-btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Unlock My Financial Score – ₹499
              </span>
            )}
          </Button>

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 mt-6 max-w-md">
            "This is not financial advice. It is a financial diagnosis generated using your data."
          </p>
        </div>
      </Card>

      {/* Benefits Grid */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          What's Included in Your Diagnosis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={idx} 
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-blue/30 hover:shadow-lg transition-all duration-300 bg-white"
                data-testid={`benefit-card-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/10 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1 leading-tight">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trust Indicators */}
      <Card className="p-6 rounded-2xl bg-slate-50 border border-slate-200" data-testid="trust-indicators">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Data-Driven</p>
              <p className="text-xs text-slate-500">Based on your actual numbers</p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-10 bg-slate-300" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Unbiased Insights</p>
              <p className="text-xs text-slate-500">No sponsored recommendations</p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-10 bg-slate-300" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Secure Payment</p>
              <p className="text-xs text-slate-500">Powered by Razorpay</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
