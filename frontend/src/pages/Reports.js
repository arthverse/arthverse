import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Reports({ token, onLogout }) {
  const [plData, setPlData] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [plRes, bsRes] = await Promise.all([
        axios.get(`${API}/reports/pl`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/reports/balance-sheet`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPlData(plRes.data);
      setBalanceSheet(bsRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96" data-testid="reports-loading">
          <div className="text-lg text-slate-600">Loading reports...</div>
        </div>
      </Layout>
    );
  }

  const incomeChartData = Object.entries(plData?.income_by_category || {}).map(([category, amount]) => ({
    category,
    amount
  }));

  const expenseChartData = Object.entries(plData?.expenses_by_category || {}).map(([category, amount]) => ({
    category,
    amount
  }));

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto p-6" data-testid="reports-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="reports-title">Financial Reports</h1>
          <p className="text-slate-600 font-body">Detailed P&L and Balance Sheet analysis</p>
        </div>

        <Tabs defaultValue="pl" className="space-y-6" data-testid="reports-tabs">
          <TabsList className="bg-slate-100 p-1 rounded-full" data-testid="reports-tabs-list">
            <TabsTrigger value="pl" className="rounded-full px-6" data-testid="pl-tab">P&L Statement</TabsTrigger>
            <TabsTrigger value="bs" className="rounded-full px-6" data-testid="bs-tab">Balance Sheet</TabsTrigger>
          </TabsList>

          <TabsContent value="pl" className="space-y-6" data-testid="pl-tab-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-transparent border-green-200" data-testid="pl-income-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Total Income</p>
                </div>
                <p className="text-3xl font-bold font-mono text-green-600" data-testid="pl-income-value">₹{plData?.total_income?.toLocaleString() || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-transparent border-red-200" data-testid="pl-expenses-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                </div>
                <p className="text-3xl font-bold font-mono text-red-600" data-testid="pl-expenses-value">₹{plData?.total_expenses?.toLocaleString() || 0}</p>
              </Card>

              <Card className={`p-6 bg-gradient-to-br ${
                plData?.net_profit_loss >= 0 
                  ? 'from-brand-blue/10 to-transparent border-brand-blue/20' 
                  : 'from-brand-orange/10 to-transparent border-brand-orange/20'
              }`} data-testid="pl-net-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    plData?.net_profit_loss >= 0 ? 'bg-brand-blue/10' : 'bg-brand-orange/10'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      plData?.net_profit_loss >= 0 ? 'text-brand-blue' : 'text-brand-orange'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Net {plData?.net_profit_loss >= 0 ? 'Profit' : 'Loss'}</p>
                </div>
                <p className={`text-3xl font-bold font-mono ${
                  plData?.net_profit_loss >= 0 ? 'text-brand-blue' : 'text-brand-orange'
                }`} data-testid="pl-net-value">₹{Math.abs(plData?.net_profit_loss || 0).toLocaleString()}</p>
              </Card>
            </div>

            <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="income-chart-card">
              <h3 className="text-xl font-semibold font-heading mb-4">Income by Category</h3>
              {incomeChartData.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No income data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="expense-chart-card">
              <h3 className="text-xl font-semibold font-heading mb-4">Expenses by Category</h3>
              {expenseChartData.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No expense data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#EF4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="bs" className="space-y-6" data-testid="bs-tab-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/20" data-testid="bs-assets-card">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Assets</p>
                <p className="text-3xl font-bold font-mono text-brand-blue" data-testid="bs-assets-value">₹{balanceSheet?.total_assets?.toLocaleString() || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-brand-orange/10 to-transparent border-brand-orange/20" data-testid="bs-liabilities-card">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Liabilities</p>
                <p className="text-3xl font-bold font-mono text-brand-orange" data-testid="bs-liabilities-value">₹{balanceSheet?.total_liabilities?.toLocaleString() || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-transparent border-green-200" data-testid="bs-networth-card">
                <p className="text-sm font-medium text-slate-600 mb-2">Net Worth</p>
                <p className="text-3xl font-bold font-mono text-green-600" data-testid="bs-networth-value">₹{balanceSheet?.net_worth?.toLocaleString() || 0}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="assets-breakdown-card">
                <h3 className="text-xl font-semibold font-heading mb-4">Assets Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(balanceSheet?.assets_breakdown || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg" data-testid={`asset-${key.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="font-medium text-slate-700">{key}</span>
                      <span className="font-bold font-mono text-brand-blue">₹{value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="liabilities-breakdown-card">
                <h3 className="text-xl font-semibold font-heading mb-4">Liabilities Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(balanceSheet?.liabilities_breakdown || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg" data-testid={`liability-${key.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="font-medium text-slate-700">{key}</span>
                      <span className="font-bold font-mono text-brand-orange">₹{value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
