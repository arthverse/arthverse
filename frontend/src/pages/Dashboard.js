import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, PiggyBank, Edit, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import BankLinking from '../components/BankLinking';
import AggregatedFinancialData from '../components/AggregatedFinancialData';

export default function Dashboard({ token, user, onLogout }) {
  const [healthScore, setHealthScore] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [showBankData, setShowBankData] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(true); // Temporarily enabled for testing
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const handleConsentApproved = (consentId) => {
    setShowBankData(true);
    toast.success('Bank accounts linked! Your financial data is now available.');
  };

  const fetchData = async () => {
    try {
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

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all your financial data? This will clear your questionnaire responses and you will need to fill them again.')) {
      return;
    }

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

  if (loading) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96" data-testid="dashboard-loading">
          <div className="text-lg text-slate-600">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto p-6" data-testid="dashboard-page">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="dashboard-title">Dashboard</h1>
            <p className="text-slate-600 font-body">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/arthvyay/questionnaire')}
              className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Financials
            </Button>
            <Button
              variant="outline"
              onClick={handleResetData}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 rounded-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm" data-testid="health-score-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold font-heading mb-2">Financial Health Score</h2>
                <div className={`text-6xl font-bold font-mono mb-4 ${getScoreColor(healthScore?.score)}`} data-testid="health-score-value">
                  {healthScore?.score || 0}/100
                </div>
                <p className="text-lg font-medium text-slate-700 mb-6">
                  {healthScore?.rating || 'Not Available'} - {healthScore?.message || 'Complete questionnaire to see score'}
                </p>

                {/* Show insights for premium users only */}
                {hasPremiumAccess && (
                  <div className="space-y-3">
                    {healthScore?.insights?.slice(0, 5).map((insight, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200" data-testid={`insight-${idx}`}>
                        <div className="flex items-start gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            insight.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                            insight.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {insight.priority}
                          </span>
                          <p className="text-sm font-semibold text-slate-900">{insight.category}</p>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{insight.issue}</p>
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="text-red-600">Current: {insight.current}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">Target: {insight.target}</span>
                        </div>
                        <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                          💡 {insight.action}
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
                      <p className="text-xl font-bold font-mono text-green-600" data-testid="total-income-value">₹{healthScore?.total_income?.toLocaleString() || 0}</p>
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
                      <p className="text-xl font-bold font-mono text-red-600" data-testid="total-expenses-value">₹{healthScore?.total_expenses?.toLocaleString() || 0}</p>
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
                      <p className="text-xl font-bold font-mono text-brand-blue" data-testid="net-savings-value">₹{healthScore?.net_savings?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Unlock Complete Financial Analysis - Paywall */}
          {!hasPremiumAccess && (
            <div className="col-span-1 md:col-span-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-brand-blue">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">Unlock Complete Financial Analysis</h3>
                  <p className="text-lg text-slate-600">Get personalized insights to improve your financial health</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Individual Plan */}
                  <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-brand-blue rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-brand-blue">Individual Plan</h4>
                        <p className="text-sm text-slate-600">Perfect for personal finance tracking</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-brand-blue">₹499</div>
                        <div className="text-xs text-slate-500">one-time</div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Detailed Score Breakdown (9 components)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Age-Specific Action Plan (prioritized)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Credit Card Recommendations</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Insurance Gap Analysis</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>5-Year Financial Projection</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Peer Comparison (vs your age group)</span>
                      </li>
                    </ul>

                    <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold py-3 rounded-full">
                      Unlock for ₹499
                    </Button>
                  </div>

                  {/* Family Plan */}
                  <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-brand-orange rounded-xl p-6 relative">
                    <div className="absolute -top-3 right-4 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                      BEST VALUE
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-brand-orange">Family Plan</h4>
                        <p className="text-sm text-slate-600">Complete family financial dashboard</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-brand-orange">₹999</div>
                        <div className="text-xs text-slate-500">one-time</div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Everything in Individual Plan</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Multi-member access (spouse + dependents)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Consolidated family financial view</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Priority support</span>
                      </li>
                    </ul>

                    <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-3 rounded-full">
                      Unlock Family Plan for ₹999
                    </Button>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-600 mt-6">
                  🔒 Secure payment • Lifetime access • No recurring charges
                </p>
              </div>
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
    </Layout>
  );
}
