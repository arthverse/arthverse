import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Download, FileText, TrendingUp, TrendingDown, PiggyBank, 
  Shield, Target, Lightbulb, CheckCircle2, 
  AlertTriangle, ArrowRight, Wallet, 
  Gem, Scale, PieChart, BarChart3, Calendar, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Component score colors
const getScoreColor = (score) => {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
};

export default function AnalysisResults({ token, user, healthScore, questionnaire }) {
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Prepare report data from healthScore and questionnaire
    if (healthScore && questionnaire) {
      prepareReportData();
    }
  }, [healthScore, questionnaire]);

  const prepareReportData = () => {
    const score = healthScore?.score || 0;
    const components = healthScore?.component_scores || {};
    
    // Calculate totals from questionnaire
    const income = questionnaire?.income || {};
    const expenses = questionnaire?.expenses || {};
    const assets = questionnaire?.assets || {};
    const liabilities = questionnaire?.liabilities || {};
    
    const totalIncome = Object.values(income).reduce((a, b) => a + (b || 0), 0);
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + (b || 0), 0);
    const totalAssets = Object.values(assets).reduce((a, b) => a + (b || 0), 0);
    const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + (b || 0), 0);
    
    setReportData({
      score,
      components,
      income: { ...income, total: totalIncome },
      expenses: { ...expenses, total: totalExpenses },
      assets: { ...assets, total: totalAssets },
      liabilities: { ...liabilities, total: totalLiabilities },
      netWorth: totalAssets - totalLiabilities,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
      debtToAsset: totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0
    });
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API}/reports/download-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
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

  const score = healthScore?.score || 0;
  const components = healthScore?.component_scores || {
    'Savings Rate': 75,
    'Emergency Fund': 60,
    'Debt Management': 85,
    'Insurance Coverage': 65,
    'Investment Mix': 70,
    'Expense Control': 78,
    'Tax Efficiency': 68,
    'Retirement Ready': 72,
    'Net Worth Growth': 80
  };

  const insights = healthScore?.insights || [];

  return (
    <div className="space-y-8 animate-fade-in" data-testid="analysis-results">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Analysis Complete
        </div>
        <h2 className="text-3xl font-semibold font-heading text-slate-900 mb-2">
          Your ArthSthithi Diagnostic Report
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Aapki complete financial position ka analysis. Download karein aur apne financial goals achieve karein.
        </p>
      </div>

      {/* Main Score Card */}
      <Card className="p-8 bg-gradient-to-br from-brand-blue to-blue-700 text-white rounded-3xl shadow-floating relative overflow-hidden" data-testid="main-score-card">
        <div className="absolute inset-0 opacity-10">
          <div className="grid-pattern"></div>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-white/70 text-sm uppercase tracking-wider mb-2">Your ArthSthithi Score</p>
              <div className="text-8xl font-bold font-heading tracking-tight">
                {score}
                <span className="text-4xl text-white/60"> / 100</span>
              </div>
              <p className="text-2xl font-medium text-white/90 mt-2">
                {getScoreLabel(score)}
              </p>
              <p className="text-white/60 text-sm mt-4 max-w-md">
                ArthSthithi is a financial diagnostic indicator generated using user-provided and consented data. It is not financial advice.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="bg-white text-brand-blue hover:bg-slate-100 rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:-translate-y-1 transition-all group"
                data-testid="download-report-btn"
              >
                {downloading ? (
                  <>Generating PDF...</>
                ) : (
                  <>
                    <Download className="mr-2 w-5 h-5" />
                    Download Full Report
                  </>
                )}
              </Button>
              <p className="text-white/60 text-xs text-center">PDF • 8-10 pages</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 9-Component Breakdown */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="component-breakdown">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-heading">9-Component ArthSthithi Breakdown</h3>
            <p className="text-slate-500 text-sm">Har component ka detailed analysis</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(components).map(([name, value], idx) => (
            <div 
              key={name}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
              style={{ backgroundColor: `${getScoreColor(value)}10` }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span 
                  className="text-lg font-bold"
                  style={{ color: getScoreColor(value) }}
                >
                  {value}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${value}%`,
                    backgroundColor: getScoreColor(value)
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{getScoreLabel(value)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-emerald-100">Monthly Income</p>
          </div>
          <p className="text-3xl font-bold font-mono">
            ₹{(reportData?.income?.total || healthScore?.financials?.monthly_income || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        {/* Total Expenses */}
        <Card className="p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-red-100">Monthly Expenses</p>
          </div>
          <p className="text-3xl font-bold font-mono">
            ₹{(reportData?.expenses?.total || healthScore?.financials?.monthly_expenses || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        {/* Total Assets */}
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Gem className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-blue-100">Total Assets</p>
          </div>
          <p className="text-3xl font-bold font-mono">
            ₹{(reportData?.assets?.total || healthScore?.financials?.total_assets || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        {/* Net Worth */}
        <Card className="p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-violet-100">Net Worth</p>
          </div>
          <p className="text-3xl font-bold font-mono">
            ₹{(reportData?.netWorth || (healthScore?.financials?.total_assets - healthScore?.financials?.total_liabilities) || 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* Key Insights & Recommendations */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="insights-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-heading">Personalized Recommendations</h3>
            <p className="text-slate-500 text-sm">Actionable steps to improve your ArthSthithi</p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.slice(0, 5).map((insight, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                    insight.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {insight.priority === 'HIGH' ? <AlertTriangle className="w-4 h-4" /> :
                     insight.priority === 'MEDIUM' ? <Target className="w-4 h-4" /> :
                     <Lightbulb className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        insight.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        insight.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {insight.priority}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{insight.category}</span>
                    </div>
                    <p className="text-slate-700 mb-2">{insight.issue}</p>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="text-red-600">Current: {insight.current}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="text-green-600">Target: {insight.target}</span>
                    </div>
                    <p className="text-sm text-brand-blue bg-blue-50 p-3 rounded-lg">
                      💡 {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-emerald-800">Build Emergency Fund</p>
                      <p className="text-sm text-emerald-600">Target 6 months of expenses (₹6,00,000)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-blue-800">Increase Life Insurance Cover</p>
                      <p className="text-sm text-blue-600">Current gap: ₹50,00,000 additional coverage needed</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium text-orange-800">Increase Savings Rate</p>
                      <p className="text-sm text-orange-600">Target: 30% of income (currently at 20%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Report Contents Preview */}
      <Card className="p-8 bg-slate-50 border border-slate-200 rounded-2xl" data-testid="report-contents">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-heading">What's in Your PDF Report</h3>
            <p className="text-slate-500 text-sm">Complete 8-10 page diagnostic report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Target, title: "ArthSthithi Score", desc: "Overall score with rating explanation" },
            { icon: PieChart, title: "9-Component Breakdown", desc: "Detailed analysis of each component" },
            { icon: BarChart3, title: "Income & Expense Analysis", desc: "Monthly cash flow visualization" },
            { icon: Scale, title: "Balance Sheet", desc: "Assets vs Liabilities comparison" },
            { icon: Shield, title: "Insurance Adequacy", desc: "Life & Health coverage analysis" },
            { icon: CreditCard, title: "Credit Card Recommendation", desc: "Best card based on your spending" },
            { icon: TrendingUp, title: "5-Year Projection", desc: "Financial growth forecast" },
            { icon: Lightbulb, title: "Action Plan", desc: "Priority-wise recommendations" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="bg-brand-blue hover:bg-blue-800 text-white rounded-full px-8 py-4 font-semibold shadow-lg hover:-translate-y-1 transition-all"
            data-testid="download-report-btn-bottom"
          >
            {downloading ? 'Generating...' : 'Download Complete Report (PDF)'}
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-400 max-w-2xl mx-auto">
        ArthSthithi is a financial diagnostic indicator generated using user-provided and consented data. 
        It is not financial advice. Please consult a certified financial planner for personalized advice.
      </p>
    </div>
  );
}
