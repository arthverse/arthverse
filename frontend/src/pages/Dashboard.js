import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, PiggyBank, Edit, RefreshCw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import BankLinking from '../components/BankLinking';
import AggregatedFinancialData from '../components/AggregatedFinancialData';
import { ConfirmDialog } from '../components/ConfirmDialog';
import PaymentSection from '../components/PaymentSection';
import AnalysisResults from '../components/AnalysisResults';
import ArthMitraReport from '../components/ArthMitraReport';

export default function Dashboard({ token, user, onLogout }) {
  const [healthScore, setHealthScore] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [showBankData, setShowBankData] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [userData, setUserData] = useState(user);
  const navigate = useNavigate();

  // Check for demo mode via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = urlParams.get('demo') === 'true';

  useEffect(() => {
    fetchData();
  }, []);

  const handleConsentApproved = (consentId) => {
    setShowBankData(true);
    toast.success('Bank accounts linked! Your financial data is now available.');
  };

  const fetchData = async () => {
    try {
      // Fetch user data if not provided
      if (!userData) {
        try {
          const userRes = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserData(userRes.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      // Check if questionnaire is completed
      let questionnaireData = null;
      try {
        const qResponse = await axios.get(`${API}/questionnaire`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        questionnaireData = qResponse.data;
        setQuestionnaire(questionnaireData);
      } catch (error) {
        // Questionnaire not completed, redirect to setup
        if (error.response?.status === 404) {
          navigate('/arthvyay/questionnaire');
          return;
        }
      }

      // Check payment status for premium access
      try {
        const paymentRes = await axios.get(`${API}/payment/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasPremiumAccess(paymentRes.data.has_premium);
      } catch (error) {
        console.error('Error checking payment status:', error);
      }

      const [scoreRes, transactionsRes] = await Promise.all([
        axios.get(`${API}/reports/health-score`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/transactions?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setHealthScore(scoreRes.data);
      setRecentTransactions(transactionsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (planType) => {
    setHasPremiumAccess(true);
    toast.success(`${planType === 'family' ? 'Family' : 'Individual'} Plan activated! Your report is ready.`);
  };

  const handleResetData = async () => {
    setShowResetDialog(true);
  };

  const confirmResetData = async () => {
    try {
      await axios.delete(`${API}/questionnaire`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Financial data has been reset!');
      navigate('/arthvyay/questionnaire');
    } catch (error) {
      toast.error('Failed to reset data');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-brand-blue';
    return 'text-brand-orange';
  };

  // WhatsApp Share functionality
  const handleWhatsAppShare = () => {
    const userScore = healthScore?.score || 0;
    const getScoreEmoji = (s) => s >= 70 ? '✅' : s >= 40 ? '🟡' : '🔴';
    const getTagline = (s) => {
      if (s >= 80) return 'Excellent! You are a financial champion! 🏆';
      if (s >= 70) return 'Great job! Your financial health is strong! 💪';
      if (s >= 50) return 'You are on the right track! Keep improving! 🎯';
      if (s >= 30) return 'Don\'t worry, there\'s room for improvement! 📈';
      return 'Start now, everything will be fine! 🚀';
    };
    
    const scoreEmoji = getScoreEmoji(userScore);
    const tagline = getTagline(userScore);
    
    const shareMessage = `🎯 *My ArthSthithi Score: ${userScore}/100* ${scoreEmoji}

${tagline}

I checked my financial health on ArthVerse! 💰

📊 *ArthSthithi* = Financial Health Indicator
✅ 5-Point Analysis: Savings, Debt, Insurance, Investment, Goals
📈 Personalized tips and 30-day action plan

Check your score too! 👇
🔗 https://arth-verse.in

#ArthVerse #FinancialHealth #ArthSthithi`;

    const encodedMessage = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  if (loading) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96" data-testid="dashboard-loading">
          <div className="text-lg text-slate-600 font-body">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8" data-testid="dashboard-page">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-orange font-semibold">ArthVyay</span>
            <h1 className="text-3xl font-semibold font-heading text-slate-900 tracking-tight mt-1" data-testid="dashboard-title">
              Financial Dashboard
            </h1>
            <p className="text-slate-500 font-body mt-1">Your complete financial overview</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/arthvyay/questionnaire')}
              className="bg-brand-blue hover:bg-blue-800 text-white rounded-full px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Financials
            </Button>
            <Button
              variant="outline"
              onClick={handleResetData}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-full px-6 transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* ArthSthithi Card */}
          <div className="col-span-1 md:col-span-4 bg-white rounded-2xl p-8 border border-slate-200 shadow-card" data-testid="arthsthithi-card">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <span className="text-xs uppercase tracking-widest text-brand-orange font-semibold">Aapki Financial Position</span>
                <h2 className="text-3xl font-semibold font-heading mt-2 mb-1">ArthSthithi</h2>
                <p className="text-sm text-slate-500 mb-4">Aapki ArthSthithi reflects your personal balance sheet strength.</p>
                <div className={`text-6xl font-semibold font-heading tracking-tight mb-4 ${getScoreColor(healthScore?.score)}`} data-testid="arthsthithi-value">
                  {healthScore?.score || 0}<span className="text-3xl text-slate-400"> / 100</span>
                </div>
                <p className="text-lg font-medium text-slate-700 mb-4">
                  {healthScore?.rating || 'Not Available'} - {healthScore?.message || 'Complete questionnaire to see score'}
                </p>
                
                {/* Disclaimer */}
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg mb-6 border border-slate-100">
                  ArthSthithi is a financial diagnostic indicator generated using user-provided and consented data. It is not financial advice.
                </p>

                {/* Show insights for premium users only */}
                {hasPremiumAccess && (
                  <div className="space-y-3">
                    {healthScore?.insights?.slice(0, 5).map((insight, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100" data-testid={`insight-${idx}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            insight.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                            insight.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {insight.priority}
                          </span>
                          <p className="text-sm font-semibold text-slate-900">{insight.category}</p>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{insight.issue}</p>
                        <div className="text-xs text-slate-600 mb-2">
                          <span className="text-red-600">Current: {insight.current}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">Target: {insight.target}</span>
                        </div>
                        <p className="text-xs text-brand-blue bg-blue-50 p-2 rounded-lg">
                          {insight.action}
                        </p>
                      </div>
                    ))}
                    {(!healthScore?.insights || healthScore?.insights?.length === 0) && (
                      <p className="text-slate-500 text-sm">Complete your financial questionnaire to get personalized insights</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-4">
                <Card className="p-4 bg-white border-brand-blue/20" data-testid="total-income-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-body">Total Income</p>
                      <p className="text-xl font-bold font-mono text-green-600" data-testid="total-income-value">₹{(healthScore?.financials?.monthly_income || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white border-brand-orange/20" data-testid="total-expenses-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-body">Total Expenses</p>
                      <p className="text-xl font-bold font-mono text-red-600" data-testid="total-expenses-value">₹{(healthScore?.financials?.monthly_expenses || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white border-brand-blue/20" data-testid="net-savings-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-body">Net Savings</p>
                      <p className="text-xl font-bold font-mono text-brand-blue" data-testid="net-savings-value">₹{(healthScore?.financials?.monthly_savings || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                
                {/* WhatsApp Share Button */}
                <Button
                  onClick={handleWhatsAppShare}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl px-4 py-3 font-medium shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  data-testid="whatsapp-share-dashboard-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share Score
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Section OR Analysis Results based on premium access */}
          {(!hasPremiumAccess && !isDemo) ? (
            <div className="col-span-1 md:col-span-4">
              <PaymentSection 
                token={token}
                user={userData}
                questionnaire={questionnaire}
                onPaymentSuccess={handlePaymentSuccess} 
              />
            </div>
          ) : (
            <div className="col-span-1 md:col-span-4">
              <ArthMitraReport
                userData={userData}
                healthScore={healthScore}
                questionnaire={questionnaire}
              />
            </div>
          )}
        </div>

        {/* Setu Account Aggregator - Bank Linking Section */}
        <div className="col-span-1 md:col-span-4 mt-8">
          <h2 className="text-2xl font-bold font-heading mb-4 text-brand-blue">
            Connected Financial Accounts
          </h2>
          <p className="text-slate-600 font-body mb-6">
            Link your bank accounts, mutual funds, and insurance policies to get a complete financial picture.
          </p>
          
          <BankLinking token={token} onConsentApproved={handleConsentApproved} />
          
          {showBankData && (
            <div className="mt-6">
              <AggregatedFinancialData token={token} />
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={confirmResetData}
        title="Reset Financial Data"
        message="Are you sure you want to reset all your financial data? This will clear your questionnaire responses and you will need to fill them again. This action cannot be undone."
        confirmText="Reset Data"
        cancelText="Cancel"
        variant="destructive"
      />
    </Layout>
  );
}
