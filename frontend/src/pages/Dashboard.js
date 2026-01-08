import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
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

          <div className="col-span-1 md:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm" data-testid="recent-transactions-card">
            <h3 className="text-xl font-semibold font-heading mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8" data-testid="no-transactions-message">No transactions yet. Add your first transaction!</p>
              ) : (
                recentTransactions.map((transaction, idx) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors" data-testid={`transaction-${idx}`}>
                    <div>
                      <p className="font-medium font-body">{transaction.description}</p>
                      <p className="text-sm text-slate-500 font-mono">{transaction.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold font-mono ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
