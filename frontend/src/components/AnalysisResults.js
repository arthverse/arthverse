import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Download, FileText, TrendingUp, TrendingDown, PiggyBank, 
  Shield, Target, Lightbulb, CheckCircle2, 
  AlertTriangle, ArrowRight, Wallet, 
  Gem, Scale, PieChart, BarChart3, Calendar, Sparkles, Share2
} from 'lucide-react';
import { toast } from 'sonner';

// Component score colors
const getScoreColor = (score) => {
  if (score >= 70) return '#10B981';  // Strong - Green
  if (score >= 40) return '#F59E0B';  // Improving - Yellow
  return '#EF4444';                    // Action Needed - Red
};

const getScoreLabel = (score) => {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Improving';
  return 'Action Needed';
};

const getScoreEmoji = (score) => {
  if (score >= 70) return '✅';
  if (score >= 40) return '🟡';
  return '🔴';
};

const getOverallTagline = (score) => {
  if (score >= 80) return 'Waah! Aap financial champion ho! 🏆';
const getOverallTagline = (score) => {
  if (score >= 80) return 'Excellent! You are a financial champion! 🏆';
  if (score >= 70) return 'Great job! Your financial health is strong! 💪';
  if (score >= 50) return 'You are on the right track! Keep improving! 🎯';
  if (score >= 30) return 'Don\'t worry, there\'s room for improvement! 📈';
  return 'Start now, everything will be fine! 🚀';
};

// Section definitions for the 5-point breakdown
const SECTIONS = [
  { id: 'savings', icon: '💰', title: 'Savings', subtitle: 'Savings habit and emergency fund' },
  { id: 'debt', icon: '📉', title: 'Debt', subtitle: 'Loans and debt management' },
  { id: 'insurance', icon: '🛡️', title: 'Insurance', subtitle: 'Life and health coverage' },
  { id: 'investment', icon: '📈', title: 'Investment', subtitle: 'Stocks, MF and diversification' },
  { id: 'goals', icon: '🎯', title: 'Goals', subtitle: 'Financial goals planning' }
];

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

  // WhatsApp Share functionality
  const handleWhatsAppShare = () => {
    const userName = user?.name || 'User';
    const userScore = healthScore?.score || 0;
    const scoreEmoji = getScoreEmoji(userScore);
    const tagline = getOverallTagline(userScore);
    
    // Create share message in English
    const shareMessage = `🎯 *My ArthSthithi Score: ${userScore}/100* ${scoreEmoji}

${tagline}

I checked my financial health on ArthVerse! 💰

📊 *ArthSthithi* = Financial Health Indicator
✅ 5-Point Analysis: Savings, Debt, Insurance, Investment, Goals
📈 Personalized tips and 30-day action plan

Check your score too! 👇
🔗 https://arth-verse.in

#ArthVerse #FinancialHealth #ArthSthithi`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(shareMessage);
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp...');
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
          ArthMitra Financial Report
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Your complete financial position analysis. Download and achieve your financial goals.
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
              <p className="text-white/70 text-sm uppercase tracking-wider mb-2">ArthSthithi Score</p>
              <div className="text-8xl font-bold font-heading tracking-tight">
                {score}
                <span className="text-4xl text-white/60"> / 100</span>
              </div>
              <p className="text-2xl font-medium text-white/90 mt-2">
                {getScoreEmoji(score)} {getScoreLabel(score)}
              </p>
              <p className="text-lg text-brand-orange mt-3 font-medium">
                {getOverallTagline(score)}
              </p>
              <p className="text-white/60 text-sm mt-4 max-w-md">
                ArthSthithi is a financial diagnostic indicator. This report is for educational purposes.
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
              
              {/* WhatsApp Share Button */}
              <Button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 py-5 font-semibold shadow-lg hover:-translate-y-1 transition-all group"
                data-testid="whatsapp-share-btn"
              >
                <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </Button>
              
              <p className="text-white/60 text-xs text-center">PDF • 10 pages • English</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 5-Component ArthSthithi Breakdown - Hinglish Style */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="component-breakdown">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-heading">5-Point ArthSthithi Breakdown</h3>
            <p className="text-slate-500 text-sm">Har category ka detailed score</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {SECTIONS.map((section, idx) => {
            // Map component scores to sections
            const sectionScoreMap = {
              'savings': components['Savings Rate'] || components['Emergency Fund'] || 60,
              'debt': components['Debt Management'] || 70,
              'insurance': components['Insurance Coverage'] || 50,
              'investment': components['Investment Diversification'] || components['Investment Mix'] || 55,
              'goals': components['Retirement Readiness'] || components['Net Worth Growth'] || 65
            };
            const sectionScore = sectionScoreMap[section.id] || 50;
            
            return (
              <div 
                key={section.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors text-center"
                style={{ backgroundColor: `${getScoreColor(sectionScore)}10` }}
              >
                <div className="text-3xl mb-2">{section.icon}</div>
                <p className="text-sm font-medium text-slate-700 mb-1">{section.title}</p>
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: getScoreColor(sectionScore) }}
                >
                  {sectionScore}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${sectionScore}%`,
                      backgroundColor: getScoreColor(sectionScore)
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {getScoreEmoji(sectionScore)} {getScoreLabel(sectionScore)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Score Legend */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700 mb-2">Score Guide:</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> 70-100: Strong</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> 40-69: Improving</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> 0-39: Action Needed</span>
          </div>
        </div>
      </Card>

      {/* Financial Summary - Hinglish Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-emerald-100">Monthly Income (Aay)</p>
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
            <p className="text-sm font-medium text-red-100">Monthly Expenses (Kharcha)</p>
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
            <p className="text-sm font-medium text-blue-100">Total Assets (Sampatti)</p>
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
            <p className="text-sm font-medium text-violet-100">Net Worth (Shuddh Sampatti)</p>
          </div>
          <p className="text-3xl font-bold font-mono">
            ₹{(reportData?.netWorth || (healthScore?.financials?.total_assets - healthScore?.financials?.total_liabilities) || 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* Key Insights & Recommendations - Hinglish */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-card" data-testid="insights-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-heading">Aage Kya Karo? (Action Items)</h3>
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
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div className="text-left">
                    <p className="font-medium text-emerald-800">Emergency Fund Banao</p>
                    <p className="text-sm text-emerald-600">6 months ka kharcha bachake rakho</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div className="text-left">
                    <p className="font-medium text-blue-800">Term Insurance Lo</p>
                    <p className="text-sm text-blue-600">Annual income ka 15-20x coverage lo</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div className="text-left">
                    <p className="font-medium text-orange-800">SIP Shuru Karo</p>
                    <p className="text-sm text-orange-600">Monthly ₹5,000 se start karo, wealth create karo</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Report Contents Preview - Hinglish */}
      <Card className="p-8 bg-slate-50 border border-slate-200 rounded-2xl" data-testid="report-contents">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-heading">PDF Report Mein Kya Hai?</h3>
            <p className="text-slate-500 text-sm">Complete 10-page ArthMitra diagnostic report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Sparkles, title: "ArthSthithi Score", desc: "Overall score with Hinglish explanation" },
            { icon: PieChart, title: "5-Point Breakdown", desc: "Bachat, Karz, Suraksha, Nivesh, Lakshya" },
            { icon: BarChart3, title: "Income & Expense Analysis", desc: "Aay aur Kharcha ka breakdown" },
            { icon: Scale, title: "Net Worth (Shuddh Sampatti)", desc: "Assets vs Liabilities comparison" },
            { icon: Shield, title: "Insurance Adequacy", desc: "Life & Health coverage check" },
            { icon: Wallet, title: "50-30-20 Allocation", desc: "Ideal paisa distribution guide" },
            { icon: Calendar, title: "30-Day Action Calendar", desc: "Week-wise financial improvement plan" },
            { icon: Lightbulb, title: "Personalized Tips", desc: "Hinglish mein actionable advice" }
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

      {/* Share Section */}
      <Card className="p-6 bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 rounded-2xl" data-testid="share-section">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/20 text-[#128C7E] rounded-full text-sm font-medium mb-4">
            <Share2 className="w-4 h-4" />
            Share Your Score
          </div>
          <h3 className="text-xl font-semibold font-heading text-slate-900 mb-2">
            Apna ArthSthithi Score Share Karo! 🎉
          </h3>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Apne friends aur family ke saath share karo. Unhe bhi apni financial health check karne mein help karo!
          </p>
          <Button
            onClick={handleWhatsAppShare}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 py-4 font-semibold shadow-lg hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            data-testid="whatsapp-share-btn-bottom"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp pe Share Karo
          </Button>
          <p className="text-xs text-slate-500 mt-3">
            Share karne se aapka data share nahi hota, sirf score aur ArthVerse link share hota hai
          </p>
        </div>
      </Card>

      {/* Disclaimer - Hinglish */}
      <p className="text-center text-xs text-slate-400 max-w-2xl mx-auto">
        ArthSthithi is a financial diagnostic indicator generated using user-provided and consented data. 
        Yeh report educational purpose ke liye hai. Professional financial advice ke liye certified planner se consult karein.
      </p>
    </div>
  );
}
