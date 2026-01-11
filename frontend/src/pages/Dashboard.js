import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, PiggyBank, Edit, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard({ token, user, onLogout }) {
  const [healthScore, setHealthScore] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-slate-600 font-body">Welcome back! Here's your financial overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm" data-testid="health-score-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold font-heading mb-2">Financial Health Score</h2>
                <div className={`text-6xl font-bold font-mono mb-4 ${getScoreColor(healthScore?.score)}`} data-testid="health-score-value">
                  {healthScore?.score || 0}/100
                </div>
                <div className="space-y-2">
                  {healthScore?.insights?.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2" data-testid={`insight-${idx}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2" />
                      <p className="text-slate-600 font-body">{insight}</p>
                    </div>
                  ))}
                </div>
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

          {/* Your Money Story */}
          <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-brand-orange/10 to-brand-blue/10 rounded-2xl p-8 border-2 border-brand-blue/20 shadow-sm" data-testid="money-story-card">
            <h3 className="text-2xl font-bold font-heading mb-6 text-brand-blue">YOUR MONEY STORY</h3>
            
            {questionnaire ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <p className="text-lg text-slate-700 font-body">Every month, you earn:</p>
                    <p className="text-3xl font-bold font-mono text-green-600">
                      ₹{(() => {
                        const monthlyIncome = 
                          // Predefined monthly
                          (parseFloat(questionnaire.rental_property1) || 0) +
                          (parseFloat(questionnaire.rental_property2) || 0) +
                          // Predefined yearly to monthly
                          ((parseFloat(questionnaire.salary_income) || 0) / 12) +
                          ((parseFloat(questionnaire.business_income) || 0) / 12) +
                          ((parseFloat(questionnaire.interest_income) || 0) / 12) +
                          ((parseFloat(questionnaire.dividend_income) || 0) / 12) +
                          ((parseFloat(questionnaire.capital_gains) || 0) / 12) +
                          ((parseFloat(questionnaire.freelance_income) || 0) / 12) +
                          ((parseFloat(questionnaire.other_income) || 0) / 12) +
                          // Custom entries
                          (questionnaire.income_entries || []).reduce((sum, entry) => {
                            const amount = parseFloat(entry.amount) || 0;
                            return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                          }, 0);
                        return Math.round(monthlyIncome).toLocaleString();
                      })()}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <p className="text-lg text-slate-700 font-body">But only keep:</p>
                    <p className="text-3xl font-bold font-mono text-brand-blue">
                      ₹{(() => {
                        const monthlyIncome = (questionnaire.income_entries || []).reduce((sum, entry) => {
                          const amount = parseFloat(entry.amount) || 0;
                          return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                        }, 0);
                        const monthlyExpenses = (questionnaire.expense_entries || []).reduce((sum, entry) => {
                          const amount = parseFloat(entry.amount) || 0;
                          return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                        }, 0);
                        const savings = monthlyIncome - monthlyExpenses;
                        const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome * 100) : 0;
                        return Math.round(savings).toLocaleString() + ' (' + Math.round(savingsRate) + '%)';
                      })()}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <p className="text-lg text-slate-700 font-body">You're losing:</p>
                    <p className="text-3xl font-bold font-mono text-brand-orange">
                      ₹{(() => {
                        const monthlyExpenses = 
                          // Predefined monthly
                          (parseFloat(questionnaire.rent_expense) || 0) +
                          (parseFloat(questionnaire.emis) || 0) +
                          (parseFloat(questionnaire.household_maid) || 0) +
                          (parseFloat(questionnaire.groceries) || 0) +
                          (parseFloat(questionnaire.food_dining) || 0) +
                          (parseFloat(questionnaire.fuel) || 0) +
                          (parseFloat(questionnaire.travel) || 0) +
                          (parseFloat(questionnaire.shopping) || 0) +
                          (parseFloat(questionnaire.online_shopping) || 0) +
                          (parseFloat(questionnaire.electronics) || 0) +
                          (parseFloat(questionnaire.entertainment) || 0) +
                          (parseFloat(questionnaire.telecom_utilities) || 0) +
                          (parseFloat(questionnaire.healthcare) || 0) +
                          (parseFloat(questionnaire.education) || 0) +
                          (parseFloat(questionnaire.cash_withdrawals) || 0) +
                          (parseFloat(questionnaire.foreign_transactions) || 0) +
                          // Predefined yearly to monthly
                          ((parseFloat(questionnaire.term_insurance) || 0) / 12) +
                          ((parseFloat(questionnaire.health_insurance) || 0) / 12) +
                          ((parseFloat(questionnaire.vehicle_2w_1) || 0) / 12) +
                          ((parseFloat(questionnaire.vehicle_2w_2) || 0) / 12) +
                          ((parseFloat(questionnaire.vehicle_4w_1) || 0) / 12) +
                          ((parseFloat(questionnaire.vehicle_4w_2) || 0) / 12) +
                          ((parseFloat(questionnaire.vehicle_4w_3) || 0) / 12) +
                          // Custom entries
                          (questionnaire.expense_entries || []).reduce((sum, entry) => {
                            const amount = parseFloat(entry.amount) || 0;
                            return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                          }, 0);
                        return Math.round(monthlyExpenses).toLocaleString();
                      })()} to expenses
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-brand-blue/20">
                  <p className="text-lg text-slate-700 font-body mb-3">At this rate, in 10 years you'll have:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-xl p-4">
                      <p className="text-sm text-slate-600 mb-1">Saved:</p>
                      <p className="text-2xl font-bold font-mono text-green-600">
                        ₹{(() => {
                          const monthlyIncome = (questionnaire.income_entries || []).reduce((sum, entry) => {
                            const amount = parseFloat(entry.amount) || 0;
                            return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                          }, 0);
                          const monthlyExpenses = (questionnaire.expense_entries || []).reduce((sum, entry) => {
                            const amount = parseFloat(entry.amount) || 0;
                            return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                          }, 0);
                          const monthlySavings = monthlyIncome - monthlyExpenses;
                          const tenYearSavings = monthlySavings * 12 * 10;
                          return (tenYearSavings / 100000).toFixed(1) + 'L';
                        })()}
                      </p>
                    </div>

                    <div className="bg-white/60 rounded-xl p-4">
                      <p className="text-sm text-slate-600 mb-1">Could have:</p>
                      <p className="text-2xl font-bold font-mono text-brand-blue">
                        ₹{(() => {
                          const monthlyIncome = (questionnaire.income_entries || []).reduce((sum, entry) => {
                            const amount = parseFloat(entry.amount) || 0;
                            return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
                          }, 0);
                          const potentialSavings = monthlyIncome * 0.5; // Assuming 50% savings rate
                          const tenYearPotential = potentialSavings * 12 * 10 * 1.12; // With 12% returns
                          return (tenYearPotential / 100000).toFixed(1) + 'L';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Complete your financial profile to see your money story</p>
                <Button 
                  onClick={() => navigate('/arthvyay/questionnaire')}
                  className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
                >
                  Complete Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
