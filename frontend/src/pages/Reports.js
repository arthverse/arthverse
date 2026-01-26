import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Building2, 
  CreditCard, PiggyBank, Landmark, Car, Gem, Banknote
} from 'lucide-react';

// Color palettes for charts - Vibrant multi-color scheme
const INCOME_COLORS = ['#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#22C55E'];
const EXPENSE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EC4899', '#D946EF', '#8B5CF6', '#6366F1', '#F43F5E', '#E11D48'];
const ASSET_COLORS = ['#3B82F6', '#06B6D4', '#14B8A6', '#10B981', '#22C55E', '#84CC16', '#EAB308', '#F59E0B', '#0EA5E9'];
const LIABILITY_COLORS = ['#F97316', '#EF4444', '#EC4899', '#D946EF', '#8B5CF6', '#F59E0B', '#F43F5E', '#E11D48', '#FB923C'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-lg font-mono font-bold text-slate-900">
          {prefix}{payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// Custom pie chart label
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // Don't show labels for small slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

  // Transform data for charts
  const incomeChartData = Object.entries(plData?.income_by_category || {})
    .map(([category, amount]) => ({ name: category, value: amount }))
    .sort((a, b) => b.value - a.value);

  const expenseChartData = Object.entries(plData?.expenses_by_category || {})
    .map(([category, amount]) => ({ name: category, value: amount }))
    .sort((a, b) => b.value - a.value);

  const assetsChartData = Object.entries(balanceSheet?.assets_breakdown || {})
    .map(([category, amount]) => ({ name: category, value: amount }))
    .sort((a, b) => b.value - a.value);

  const liabilitiesChartData = Object.entries(balanceSheet?.liabilities_breakdown || {})
    .map(([category, amount]) => ({ name: category, value: amount }))
    .sort((a, b) => b.value - a.value);

  // Bar chart data
  const incomeBarData = incomeChartData.map(item => ({ category: item.name, amount: item.value }));
  const expenseBarData = expenseChartData.map(item => ({ category: item.name, amount: item.value }));

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto p-6" data-testid="reports-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="reports-title">
            Financial Reports
          </h1>
          <p className="text-slate-600 font-body">
            Detailed breakdown of your income, expenses, assets, and liabilities
          </p>
        </div>

        <Tabs defaultValue="pl" className="space-y-6" data-testid="reports-tabs">
          <TabsList className="bg-slate-100 p-1 rounded-full" data-testid="reports-tabs-list">
            <TabsTrigger value="pl" className="rounded-full px-6" data-testid="pl-tab">
              Income & Expenses
            </TabsTrigger>
            <TabsTrigger value="bs" className="rounded-full px-6" data-testid="bs-tab">
              Assets & Liabilities
            </TabsTrigger>
          </TabsList>

          {/* P&L Tab */}
          <TabsContent value="pl" className="space-y-6" data-testid="pl-tab-content">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl shadow-lg" data-testid="pl-income-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-green-100">Total Monthly Income</p>
                </div>
                <p className="text-4xl font-bold font-mono" data-testid="pl-income-value">
                  ₹{plData?.total_income?.toLocaleString() || 0}
                </p>
                <p className="text-green-200 text-sm mt-2">
                  {incomeChartData.length} income sources
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-lg" data-testid="pl-expenses-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-red-100">Total Monthly Expenses</p>
                </div>
                <p className="text-4xl font-bold font-mono" data-testid="pl-expenses-value">
                  ₹{plData?.total_expenses?.toLocaleString() || 0}
                </p>
                <p className="text-red-200 text-sm mt-2">
                  {expenseChartData.length} expense categories
                </p>
              </Card>

              <Card className={`p-6 rounded-2xl shadow-lg text-white ${
                plData?.net_profit_loss >= 0 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-orange-500 to-amber-600'
              }`} data-testid="pl-net-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium opacity-80">
                    Monthly {plData?.net_profit_loss >= 0 ? 'Savings' : 'Deficit'}
                  </p>
                </div>
                <p className="text-4xl font-bold font-mono" data-testid="pl-net-value">
                  ₹{Math.abs(plData?.net_profit_loss || 0).toLocaleString()}
                </p>
                <p className="opacity-80 text-sm mt-2">
                  {plData?.total_income > 0 
                    ? `${((plData?.net_profit_loss / plData?.total_income) * 100).toFixed(1)}% savings rate`
                    : 'No income data'
                  }
                </p>
              </Card>
            </div>

            {/* Income Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Pie Chart */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="income-pie-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  Income Distribution
                </h3>
                {incomeChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No income data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {incomeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Income Bar Chart */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="income-bar-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  Income by Category
                </h3>
                {incomeBarData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No income data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incomeBarData.map((item, idx) => ({ ...item, fill: INCOME_COLORS[idx % INCOME_COLORS.length] }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                        {incomeBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* Expense Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Pie Chart */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="expense-pie-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-red-600" />
                  </div>
                  Expense Distribution
                </h3>
                {expenseChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No expense data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Expense Bar Chart */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="expense-bar-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                  Expenses by Category
                </h3>
                {expenseBarData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No expense data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expenseBarData.map((item, idx) => ({ ...item, fill: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                        {expenseBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* Income vs Expense Comparison */}
            <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="income-expense-comparison">
              <h3 className="text-xl font-semibold font-heading mb-4">Income vs Expenses Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Income List */}
                <div>
                  <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Income Sources
                  </h4>
                  <div className="space-y-2">
                    {incomeChartData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-mono font-semibold text-green-600">₹{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    {incomeChartData.length === 0 && (
                      <p className="text-slate-500 text-center py-4">No income recorded</p>
                    )}
                  </div>
                </div>
                
                {/* Expense List */}
                <div>
                  <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Expense Categories
                  </h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {expenseChartData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-mono font-semibold text-red-600">₹{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    {expenseChartData.length === 0 && (
                      <p className="text-slate-500 text-center py-4">No expenses recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="bs" className="space-y-6" data-testid="bs-tab-content">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg" data-testid="bs-assets-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-blue-100">Total Assets</p>
                </div>
                <p className="text-4xl font-bold font-mono" data-testid="bs-assets-value">
                  ₹{balanceSheet?.total_assets?.toLocaleString() || 0}
                </p>
                <p className="text-blue-200 text-sm mt-2">
                  {assetsChartData.length} asset categories
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg" data-testid="bs-liabilities-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-orange-100">Total Liabilities</p>
                </div>
                <p className="text-4xl font-bold font-mono" data-testid="bs-liabilities-value">
                  ₹{balanceSheet?.total_liabilities?.toLocaleString() || 0}
                </p>
                <p className="text-orange-200 text-sm mt-2">
                  {liabilitiesChartData.length} liability types
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg" data-testid="bs-networth-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-emerald-100">Net Worth</p>
                </div>
                <p className="text-4xl font-bold font-mono" data-testid="bs-networth-value">
                  ₹{balanceSheet?.net_worth?.toLocaleString() || 0}
                </p>
                <p className="text-emerald-200 text-sm mt-2">
                  Assets - Liabilities
                </p>
              </Card>
            </div>

            {/* Asset Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets Pie Chart */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="assets-pie-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Gem className="w-4 h-4 text-blue-600" />
                  </div>
                  Asset Allocation
                </h3>
                {assetsChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No asset data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetsChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {assetsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Assets Breakdown */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="assets-breakdown-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  Assets Breakdown
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {assetsChartData.map((item, idx) => {
                    const percentage = balanceSheet?.total_assets > 0 
                      ? ((item.value / balanceSheet.total_assets) * 100).toFixed(1) 
                      : 0;
                    const color = ASSET_COLORS[idx % ASSET_COLORS.length];
                    return (
                      <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }} data-testid={`asset-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className="font-mono font-bold" style={{ color }}>₹{item.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full rounded-full h-2" style={{ backgroundColor: `${color}30` }}>
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{percentage}% of total assets</p>
                      </div>
                    );
                  })}
                  {assetsChartData.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No assets recorded</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Liability Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liabilities Pie Chart */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="liabilities-pie-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-orange-600" />
                  </div>
                  Liability Distribution
                </h3>
                {liabilitiesChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No liability data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={liabilitiesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {liabilitiesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={LIABILITY_COLORS[index % LIABILITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Liabilities Breakdown */}
              <Card className="p-6 bg-white border border-slate-200 rounded-2xl" data-testid="liabilities-breakdown-card">
                <h3 className="text-xl font-semibold font-heading mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                  </div>
                  Liabilities Breakdown
                </h3>
                <div className="space-y-3">
                  {liabilitiesChartData.map((item, idx) => {
                    const percentage = balanceSheet?.total_liabilities > 0 
                      ? ((item.value / balanceSheet.total_liabilities) * 100).toFixed(1) 
                      : 0;
                    const color = LIABILITY_COLORS[idx % LIABILITY_COLORS.length];
                    return (
                      <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }} data-testid={`liability-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className="font-mono font-bold" style={{ color }}>₹{item.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full rounded-full h-2" style={{ backgroundColor: `${color}30` }}>
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{percentage}% of total liabilities</p>
                      </div>
                    );
                  })}
                  {liabilitiesChartData.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No liabilities recorded - Great!</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Net Worth Summary */}
            <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl" data-testid="networth-summary">
              <h3 className="text-xl font-semibold mb-6">Net Worth Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-slate-400 text-sm mb-2">Total Assets</p>
                  <p className="text-2xl font-bold font-mono text-blue-400">
                    ₹{balanceSheet?.total_assets?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-slate-400 text-sm mb-2">Total Liabilities</p>
                  <p className="text-2xl font-bold font-mono text-orange-400">
                    - ₹{balanceSheet?.total_liabilities?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-slate-300 text-sm mb-2">Net Worth</p>
                  <p className={`text-3xl font-bold font-mono ${balanceSheet?.net_worth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{balanceSheet?.net_worth?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              {balanceSheet?.total_assets > 0 && (
                <div className="mt-6">
                  <p className="text-slate-400 text-sm mb-2">Debt-to-Asset Ratio</p>
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, 100 - ((balanceSheet?.total_liabilities / balanceSheet?.total_assets) * 100))}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    {((balanceSheet?.total_liabilities / balanceSheet?.total_assets) * 100).toFixed(1)}% of your assets are financed by debt
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
