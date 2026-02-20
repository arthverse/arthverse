// ═══════════════════════════════════════════════════════════════
//  PremiumReport.js — ArthVerse Premium Financial Report Screen
//  Displays detailed financial analysis for paid users
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Download, TrendingUp, TrendingDown, PiggyBank, Shield, 
  Target, Lightbulb, CheckCircle2, AlertTriangle, ArrowRight,
  Wallet, Gem, Scale, Calendar, Clock, ChevronRight, Star,
  Heart, Building, GraduationCap, Briefcase, Home, Car
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar
} from 'recharts';

// ─── Utility: format Indian currency ─────────────────────────────
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const inrL = (n) => "₹" + (n / 100000).toFixed(1) + "L";
const inrCr = (n) => "₹" + (n / 10000000).toFixed(2) + " Cr";

// ─── Score color helper ─────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 70) return '#10B981';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent!';
  if (score >= 70) return 'Good Progress!';
  if (score >= 50) return 'Improving';
  return 'Needs Attention!';
};

// ─── Chart Colors ─────────────────────────────────────────────────
const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981'];

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PremiumReport({ token, user, healthScore, questionnaire }) {
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  // Calculate financial metrics
  const income = questionnaire?.monthly_income || healthScore?.financials?.monthly_income || 145000;
  const expenses = questionnaire?.monthly_expenses || healthScore?.financials?.monthly_expenses || 63000;
  const savings = income - expenses;
  const savingsPct = Math.round((savings / income) * 100 * 10) / 10;
  const netWorth = healthScore?.financials?.total_assets - healthScore?.financials?.total_liabilities || 3750000;
  const annualIncome = income * 12;
  
  // Scores
  const overallScore = healthScore?.score || 70;
  const componentScores = healthScore?.components || {
    'Savings Rate': 100,
    'Debt Management': 70,
    'Insurance Coverage': 50,
    'Investment Diversification': 55,
    'Retirement Readiness': 65
  };

  // Map component scores to 5 categories
  const scores = {
    savings: componentScores['Savings Rate'] || componentScores['Emergency Fund'] || 100,
    debt: componentScores['Debt Management'] || 70,
    insurance: componentScores['Insurance Coverage'] || 50,
    investment: componentScores['Investment Diversification'] || componentScores['Investment Mix'] || 55,
    goals: componentScores['Retirement Readiness'] || componentScores['Net Worth Growth'] || 65
  };

  // Monthly SIP
  const monthlyInvestment = questionnaire?.monthly_investments || 5000;
  
  // SIP calculations (12% annual = ~1% monthly)
  const sip5Years = Math.round(monthlyInvestment * (((1.01 ** 60) - 1) / 0.01));
  const sip10Years = Math.round(monthlyInvestment * (((1.01 ** 120) - 1) / 0.01));
  
  // Wealth projection (12% CAGR)
  const nw5Years = Math.round(netWorth * (1.12 ** 5));
  const nw10Years = Math.round(netWorth * (1.12 ** 10));
  
  // Emergency fund target
  const emergencyFundTarget = expenses * 6;
  
  // Term insurance target
  const termInsuranceTarget = annualIncome * 15;
  
  // Tax savings
  const tax80C = Math.min(150000, Math.round(savings * 0.18));
  const taxSaved = Math.round(150000 * 0.30); // 30% bracket on 1.5L

  // Radar chart data
  const radarData = [
    { subject: 'Savings', score: scores.savings, fullMark: 100 },
    { subject: 'Debt', score: scores.debt, fullMark: 100 },
    { subject: 'Insurance', score: scores.insurance, fullMark: 100 },
    { subject: 'Investment', score: scores.investment, fullMark: 100 },
    { subject: 'Goals', score: scores.goals, fullMark: 100 },
  ];

  // Money split data
  const needsAmount = Math.min(expenses, income * 0.5);
  const wantsAmount = Math.max(0, expenses - needsAmount);
  const actualSplit = [
    { name: 'Needs', value: needsAmount, color: '#3B82F6' },
    { name: 'Wants', value: wantsAmount, color: '#F59E0B' },
    { name: 'Savings', value: savings, color: '#10B981' },
  ];
  
  const idealSplit = [
    { name: 'Needs', value: income * 0.5, color: '#3B82F6' },
    { name: 'Wants', value: income * 0.3, color: '#F59E0B' },
    { name: 'Savings', value: income * 0.2, color: '#10B981' },
  ];

  // SIP growth data for line chart
  const sipGrowthData = Array.from({ length: 11 }, (_, i) => ({
    year: `Year ${i}`,
    invested: monthlyInvestment * 12 * i,
    withGrowth: i === 0 ? 0 : Math.round(monthlyInvestment * (((1.01 ** (i * 12)) - 1) / 0.01)),
  }));

  // Wealth projection bar chart data
  const wealthData = [
    { name: 'Today', value: netWorth, fill: '#3B82F6' },
    { name: 'Year 5', value: nw5Years, fill: '#8B5CF6' },
    { name: 'Year 10', value: nw10Years, fill: '#10B981' },
  ];

  // Download handler
  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API}/reports/download-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ArthSthithi_Report_${user?.client_id || 'User'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // 5 Financial Tools data
  const financialTools = [
    {
      icon: '🏦',
      title: 'Emergency Fund',
      target: inr(emergencyFundTarget),
      description: '6 months of expenses saved in a liquid account',
      action: 'Open a separate savings account and automate monthly transfers',
      color: '#3B82F6'
    },
    {
      icon: '📈',
      title: 'SIP Investment',
      target: `${inr(monthlyInvestment)}/month`,
      description: 'Systematic Investment Plan in diversified mutual funds',
      action: 'Start with Nifty 50 Index Fund for beginners',
      color: '#10B981'
    },
    {
      icon: '🛡️',
      title: 'Term Insurance',
      target: inr(termInsuranceTarget),
      description: '15x annual income as life cover',
      action: 'Compare plans on PolicyBazaar and buy online',
      color: '#8B5CF6'
    },
    {
      icon: '🏥',
      title: 'Health Insurance',
      target: '₹10L+ Cover',
      description: 'Family floater health policy',
      action: 'Get a ₹10 Lakh family floater with no room rent cap',
      color: '#F59E0B'
    },
    {
      icon: '🎯',
      title: 'NPS Account',
      target: '₹50,000/year',
      description: 'National Pension System for retirement',
      action: 'Open NPS account for additional ₹50K tax deduction',
      color: '#EF4444'
    }
  ];

  // 30-day action plan
  const actionPlan = [
    {
      week: 'Week 1',
      title: 'Foundation Setup',
      color: '#3B82F6',
      tasks: [
        'List all your bank accounts and balances',
        'Calculate your exact monthly income and expenses',
        'Create a simple budget using 50-30-20 rule'
      ]
    },
    {
      week: 'Week 2',
      title: 'Protection First',
      color: '#8B5CF6',
      tasks: [
        'Compare term insurance plans (target: 15x income)',
        'Check your health insurance coverage',
        'Start building emergency fund (target: 6 months expenses)'
      ]
    },
    {
      week: 'Week 3',
      title: 'Wealth Building',
      color: '#10B981',
      tasks: [
        `Start SIP of ${inr(monthlyInvestment)} in index fund`,
        'Review and organize existing investments',
        'Open NPS account if not already done'
      ]
    },
    {
      week: 'Week 4',
      title: 'Goals & Review',
      color: '#F59E0B',
      tasks: [
        'Write 3 SMART financial goals with timelines',
        'Review all insurance nominee details',
        'Set up monthly financial review calendar'
      ]
    }
  ];

  // Score categories detail
  const scoreDetails = [
    {
      id: 'savings',
      title: 'Savings',
      score: scores.savings,
      icon: '💰',
      keyNumbers: [
        `Monthly Savings: ${inr(savings)}`,
        `Savings Rate: ${savingsPct}%`,
        `Target Rate: 20%`
      ],
      analysis: scores.savings >= 80 
        ? `Excellent! You are saving ${savingsPct}% of your income, which is way above the recommended 20%. You are a savings champion!`
        : scores.savings >= 50
        ? `Good progress! You are saving ${savingsPct}% of your income. Try to increase it to at least 20% for better financial security.`
        : `You need to focus on saving more. Currently saving ${savingsPct}% — target is at least 20% of income.`,
      actions: [
        'Automate savings on salary day',
        'Track expenses weekly',
        'Cut unnecessary subscriptions'
      ]
    },
    {
      id: 'debt',
      title: 'Debt Management',
      score: scores.debt,
      icon: '📉',
      keyNumbers: [
        'Total EMIs: Check your EMI-to-income ratio',
        'Target: EMIs < 40% of income',
        'Credit Card: Pay full amount monthly'
      ],
      analysis: scores.debt >= 70
        ? 'Good job managing your debt! Your debt-to-income ratio is healthy. Keep avoiding unnecessary loans.'
        : scores.debt >= 50
        ? 'Your debt is manageable but could be better. Focus on paying off high-interest debt first.'
        : 'High debt alert! Prioritize clearing high-interest loans like credit cards and personal loans.',
      actions: [
        'List all loans with interest rates',
        'Pay highest interest loan first',
        'Avoid new debt unless necessary'
      ]
    },
    {
      id: 'insurance',
      title: 'Insurance Coverage',
      score: scores.insurance,
      icon: '🛡️',
      keyNumbers: [
        `Term Insurance Target: ${inrL(termInsuranceTarget)}`,
        'Health Cover: ₹10L+ family floater',
        'Critical Illness: Consider adding'
      ],
      analysis: scores.insurance >= 70
        ? 'Well protected! Your insurance coverage is adequate. Review annually to ensure it keeps pace with your income.'
        : scores.insurance >= 50
        ? 'Partial coverage. You have some insurance but gaps exist. Review your term and health insurance immediately.'
        : 'Insurance gap is critical! You need immediate term life and health insurance to protect your family.',
      actions: [
        'Get term insurance of 15x annual income',
        'Buy ₹10L+ health insurance',
        'Update all nominee details'
      ]
    },
    {
      id: 'investment',
      title: 'Investments',
      score: scores.investment,
      icon: '📈',
      keyNumbers: [
        `Monthly SIP: ${inr(monthlyInvestment)}`,
        `5-Year Value: ${inrL(sip5Years)}`,
        `10-Year Value: ${inrL(sip10Years)}`
      ],
      analysis: scores.investment >= 70
        ? 'Great investment discipline! Your portfolio is well-diversified. Keep reviewing asset allocation annually.'
        : scores.investment >= 50
        ? 'Good start with investments. Increase SIP amount when income grows. Focus on diversification.'
        : 'Start investing TODAY! Even ₹5,000/month in index funds can build significant wealth over time.',
      actions: [
        'Start/Increase monthly SIP',
        'Diversify: 60% equity, 30% debt, 10% gold',
        'Review portfolio every quarter'
      ]
    },
    {
      id: 'goals',
      title: 'Financial Goals',
      score: scores.goals,
      icon: '🎯',
      keyNumbers: [
        `Current Net Worth: ${inrL(netWorth)}`,
        `5-Year Projection: ${inrL(nw5Years)}`,
        `10-Year Projection: ${netWorth > 10000000 ? inrCr(nw10Years) : inrL(nw10Years)}`
      ],
      analysis: scores.goals >= 70
        ? 'Clear goals set! You have specific financial targets. Keep tracking and adjusting as life changes.'
        : scores.goals >= 50
        ? 'Goals need clarity. Define specific amounts and timelines for your financial objectives.'
        : 'Set SMART goals now! Without clear targets, your money has no direction.',
      actions: [
        'Write 3 major financial goals',
        'Set specific amounts and deadlines',
        'Review progress quarterly'
      ]
    }
  ];

  return (
    <div ref={reportRef} className="space-y-8 animate-fade-in" data-testid="premium-report">
      
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: Cover & Score Overview
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-gradient-to-br from-brand-blue to-blue-800 text-white rounded-3xl shadow-2xl relative overflow-hidden" data-testid="report-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-sm uppercase tracking-wider mb-1">ArthMitra Financial Report</p>
              <h1 className="text-3xl font-bold font-heading">{user?.name || 'User'}</h1>
              <p className="text-white/70">{user?.city || 'India'} • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Client ID</p>
              <p className="font-mono text-sm">{user?.client_id || 'N/A'}</p>
            </div>
          </div>
          
          {/* Main Score Display */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-8">
            <div className="text-center md:text-left">
              <p className="text-white/70 text-sm uppercase tracking-wider mb-2">Your ArthSthithi Score</p>
              <div className="text-8xl font-bold font-heading">
                {overallScore}
                <span className="text-4xl text-white/60">/100</span>
              </div>
              <p className="text-2xl font-medium text-brand-orange mt-2">
                {getScoreLabel(overallScore)}
              </p>
              <p className="text-white/60 text-sm mt-4 max-w-md">
                Your money report card — like school marks! This score reflects your overall financial health across 5 key areas.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-white/60 text-xs uppercase">Monthly Income</p>
                <p className="text-2xl font-bold font-mono">{inr(income)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-white/60 text-xs uppercase">Monthly Expenses</p>
                <p className="text-2xl font-bold font-mono">{inr(expenses)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-white/60 text-xs uppercase">Monthly Savings</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">{inr(savings)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-white/60 text-xs uppercase">Net Worth</p>
                <p className="text-2xl font-bold font-mono">{inrL(netWorth)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: 5 Money Subjects (Radar Chart)
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="radar-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">Your 5 Money Subjects</h2>
            <p className="text-slate-500 text-sm">Spider-web: outward = strong, inward = needs work</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          Like a school exam with 5 subjects, your money health is tested in 5 areas. 
          The spider-web shows at a glance where you are strong (web goes outward) and where to improve (web stays close to centre).
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Cards */}
          <div className="space-y-3">
            {Object.entries(scores).map(([key, value]) => (
              <div 
                key={key}
                className="p-4 rounded-xl border border-slate-100"
                style={{ backgroundColor: `${getScoreColor(value)}10` }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {key === 'savings' ? '💰' : 
                       key === 'debt' ? '📉' : 
                       key === 'insurance' ? '🛡️' : 
                       key === 'investment' ? '📈' : '🎯'}
                    </span>
                    <span className="font-medium capitalize">{key}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: getScoreColor(value)
                        }}
                      />
                    </div>
                    <span 
                      className="font-bold text-lg w-12 text-right"
                      style={{ color: getScoreColor(value) }}
                    >
                      {value}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-10">{getScoreLabel(value)}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: Money Flow (50-30-20 Rule)
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="money-flow-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">Where Does Your Money Go?</h2>
            <p className="text-slate-500 text-sm">The famous 50-30-20 Rule</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          Every month {inr(income)} arrives in your account. Think of it like a big pizza! 
          We show how YOUR pizza is cut right now, and how the PERFECT pizza should be cut using the world-famous 50-30-20 Rule!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your Actual Split */}
          <div className="text-center">
            <h3 className="font-semibold mb-4 text-slate-700">Your Actual Split</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actualSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${Math.round(value/income*100)}%`}
                  >
                    {actualSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => inr(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Needs</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Wants</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Savings</span>
            </div>
          </div>

          {/* Ideal 50-30-20 Split */}
          <div className="text-center">
            <h3 className="font-semibold mb-4 text-slate-700">Ideal 50-30-20 Split</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={idealSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${Math.round(value/income*100)}%`}
                  >
                    {idealSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => inr(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span>50% Needs</span>
              <span>30% Wants</span>
              <span>20% Savings</span>
            </div>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <p className="text-emerald-800">
            <span className="font-bold">💡 Did you know?</span> You save {inr(savings)}/month — that's {savingsPct}% of your income! 
            {savingsPct >= 20 ? ' You are saving more than the recommended 20%. Great job!' : ' Try to reach at least 20% savings rate.'}
          </p>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: Magic of Compounding (Line Chart)
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="compounding-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">The Magic of Growing Money</h2>
            <p className="text-slate-500 text-sm">How small investments become big over time</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          Imagine planting a mango tree. In Year 1, you just see a small plant. But every year, it grows bigger. 
          By Year 10, you have a tree full of mangoes! That's exactly how your money grows with compound interest.
        </p>

        {/* SIP Growth Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sipGrowthData}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => inr(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="invested" 
                stroke="#94a3b8" 
                strokeWidth={2}
                name="If kept idle"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="withGrowth" 
                stroke="#10B981" 
                strokeWidth={3}
                name="With 12% growth"
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* SIP Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-slate-500 text-xs uppercase">Monthly SIP</p>
            <p className="text-xl font-bold text-brand-blue">{inr(monthlyInvestment)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-slate-500 text-xs uppercase">After 5 Years</p>
            <p className="text-xl font-bold text-emerald-600">{inrL(sip5Years)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-slate-500 text-xs uppercase">After 10 Years</p>
            <p className="text-xl font-bold text-emerald-600">{inrL(sip10Years)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-slate-500 text-xs uppercase">Total Invested</p>
            <p className="text-xl font-bold text-slate-700">{inrL(monthlyInvestment * 120)}</p>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
          <p className="text-blue-800 italic">
            "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."
          </p>
          <p className="text-blue-600 text-sm mt-2">— Albert Einstein</p>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: Wealth Projection (Bar Chart)
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="wealth-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
            <Gem className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">Wealth Grows Like Video Game Levels!</h2>
            <p className="text-slate-500 text-sm">Your net worth projection at 12% growth</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          In video games, you start at Level 1 and grow stronger with each level. 
          Your wealth works the same way! Here's how your net worth can grow if you keep investing consistently.
        </p>

        {/* Wealth Bar Chart */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wealthData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip formatter={(value) => inr(value)} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {wealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wealth Milestones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-blue-600 text-xs uppercase">Today</p>
            <p className="text-xl font-bold text-blue-700">{inrL(netWorth)}</p>
          </div>
          <div className="p-4 bg-violet-50 rounded-xl text-center">
            <p className="text-violet-600 text-xs uppercase">Year 5</p>
            <p className="text-xl font-bold text-violet-700">{inrL(nw5Years)}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl text-center">
            <p className="text-emerald-600 text-xs uppercase">Year 10</p>
            <p className="text-xl font-bold text-emerald-700">{nw10Years > 10000000 ? inrCr(nw10Years) : inrL(nw10Years)}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-center">
            <p className="text-amber-600 text-xs uppercase">Retirement Goal</p>
            <p className="text-xl font-bold text-amber-700">₹3-5 Cr</p>
          </div>
        </div>

        {/* Golden Rules */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <h4 className="font-semibold text-slate-700 mb-3">🏆 5 Golden Rules of Wealth Building</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <p>✅ Start early — time is your biggest friend</p>
            <p>✅ Invest consistently — every month, without fail</p>
            <p>✅ Stay invested — don't panic during market falls</p>
            <p>✅ Increase SIP — whenever income increases</p>
            <p>✅ Review annually — but don't change too often</p>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: 5 Financial Tools
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="tools-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">5 Financial Tools You Must Have</h2>
            <p className="text-slate-500 text-sm">Essential building blocks of financial security</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          Just like a carpenter needs a hammer, saw, and drill, you need these 5 financial tools to build a secure future. 
          Each tool has a specific purpose — missing even one can leave your finances incomplete!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialTools.map((tool, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl border-2"
              style={{ borderColor: `${tool.color}40`, backgroundColor: `${tool.color}08` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{tool.icon}</span>
                <div>
                  <h4 className="font-semibold text-slate-800">{tool.title}</h4>
                  <p className="text-sm font-medium" style={{ color: tool.color }}>{tool.target}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
              <p className="text-xs text-slate-500 bg-white/50 rounded-lg p-2">
                <span className="font-medium">How to get:</span> {tool.action}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7: Detailed Score Report
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="detailed-scores-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">Your Detailed Score Report</h2>
            <p className="text-slate-500 text-sm">Deep dive into each financial category</p>
          </div>
        </div>

        <div className="space-y-6">
          {scoreDetails.map((detail) => (
            <div 
              key={detail.id}
              className="p-6 rounded-2xl border"
              style={{ 
                borderColor: `${getScoreColor(detail.score)}40`,
                backgroundColor: `${getScoreColor(detail.score)}05`
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{detail.icon}</span>
                  <h3 className="text-lg font-semibold">{detail.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(detail.score) }}
                  >
                    {detail.score}/100
                  </span>
                  <span 
                    className="text-sm px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${getScoreColor(detail.score)}20`,
                      color: getScoreColor(detail.score)
                    }}
                  >
                    {getScoreLabel(detail.score)}
                  </span>
                </div>
              </div>

              {/* Analysis */}
              <p className="text-slate-600 mb-4">{detail.analysis}</p>

              {/* Key Numbers & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-700 mb-2">📊 Key Numbers</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {detail.keyNumbers.map((num, i) => (
                      <li key={i}>• {num}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-700 mb-2">✅ Action Steps</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {detail.actions.map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8: Tax Savings
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-2xl" data-testid="tax-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">Save Tax While Building Wealth</h2>
            <p className="text-slate-500 text-sm">Smart investments that reduce your tax bill</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl text-center shadow-sm">
            <p className="text-emerald-600 text-xs uppercase">ELSS Investment</p>
            <p className="text-2xl font-bold text-emerald-700">₹1.5L</p>
            <p className="text-xs text-slate-500">Section 80C</p>
          </div>
          <div className="p-4 bg-white rounded-xl text-center shadow-sm">
            <p className="text-emerald-600 text-xs uppercase">Tax Saved</p>
            <p className="text-2xl font-bold text-emerald-700">{inr(taxSaved)}</p>
            <p className="text-xs text-slate-500">at 30% bracket</p>
          </div>
          <div className="p-4 bg-white rounded-xl text-center shadow-sm">
            <p className="text-blue-600 text-xs uppercase">NPS Investment</p>
            <p className="text-2xl font-bold text-blue-700">₹50K</p>
            <p className="text-xs text-slate-500">Section 80CCD(1B)</p>
          </div>
          <div className="p-4 bg-white rounded-xl text-center shadow-sm">
            <p className="text-blue-600 text-xs uppercase">Extra Tax Saved</p>
            <p className="text-2xl font-bold text-blue-700">₹15,000</p>
            <p className="text-xs text-slate-500">Additional benefit</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-xl">
          <p className="text-emerald-800">
            <span className="font-bold">💰 Total Annual Tax Savings:</span> Up to {inr(taxSaved + 15000)} by investing in ELSS and NPS!
          </p>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 9: 30-Day Action Plan
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="action-plan-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading">Your 30-Day Money Action Plan</h2>
            <p className="text-slate-500 text-sm">Week-by-week tasks to transform your finances</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          Big changes happen through small, consistent steps. Here's your 30-day plan — just one week at a time!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionPlan.map((week, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl border-2"
              style={{ borderColor: week.color, backgroundColor: `${week.color}08` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: week.color }}
                >
                  {week.week}
                </span>
                <h4 className="font-semibold text-slate-800">{week.title}</h4>
              </div>
              <ul className="space-y-2">
                {week.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: week.color }} />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 10: Summary & Download
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl" data-testid="summary-section">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold font-heading mb-2">Your Complete Summary</h2>
          <p className="text-slate-400">Key metrics at a glance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white/10 rounded-xl text-center">
            <p className="text-slate-400 text-xs uppercase">Score</p>
            <p className="text-3xl font-bold text-brand-orange">{overallScore}/100</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl text-center">
            <p className="text-slate-400 text-xs uppercase">Savings Rate</p>
            <p className="text-3xl font-bold text-emerald-400">{savingsPct}%</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl text-center">
            <p className="text-slate-400 text-xs uppercase">Net Worth</p>
            <p className="text-3xl font-bold text-blue-400">{inrL(netWorth)}</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl text-center">
            <p className="text-slate-400 text-xs uppercase">10Y Projection</p>
            <p className="text-3xl font-bold text-violet-400">{nw10Years > 10000000 ? inrCr(nw10Years) : inrL(nw10Years)}</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <Button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="bg-brand-orange hover:bg-orange-600 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg hover:-translate-y-1 transition-all"
            data-testid="download-pdf-btn"
          >
            {downloading ? (
              <>Generating PDF...</>
            ) : (
              <>
                <Download className="mr-2 w-5 h-5" />
                Download Complete PDF Report
              </>
            )}
          </Button>
          <p className="text-slate-500 text-sm mt-3">10-page detailed report with all charts and analysis</p>
        </div>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-400 max-w-3xl mx-auto">
        <strong>Disclaimer:</strong> This report is for educational purposes only and does not constitute professional 
        financial advice. Please consult a SEBI-registered investment adviser before making any investment decisions.
        Past performance is not indicative of future results.
      </p>
    </div>
  );
}
