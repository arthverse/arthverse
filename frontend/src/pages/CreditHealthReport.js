import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, CreditCard, Shield, Clock, Ban, Calendar, Layers, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

const BAND_CONFIG = {
  excellent: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500', emoji: '🟢' },
  good: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500', emoji: '🟡' },
  average: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500', emoji: '🟠' },
  weak: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', emoji: '🔴' },
  high_risk: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700', bar: 'bg-slate-700', emoji: '⚫' },
};

const ICON_MAP = { 'clock': Clock, 'credit-card': CreditCard, 'ban': Ban, 'calendar': Calendar, 'layers': Layers, 'check-circle': CheckCircle2 };

export default function CreditHealthReport({ token, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    cibil_score: 0,
    credit_limit: 0,
    credit_usage: 0,
    emi_history: 'never_missed',
    loan_count: 0,
    enquiries: '0_1',
    credit_age: '2_5_years',
    credit_mix: [],
  });

  const loadExistingProfile = useCallback(async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        axios.get(`${API}/credit/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/credit/history`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (profileRes.data.exists) {
        setForm({
          cibil_score: profileRes.data.cibil_score || 0,
          credit_limit: profileRes.data.credit_limit || 0,
          credit_usage: profileRes.data.credit_usage || 0,
          emi_history: profileRes.data.emi_history || 'never_missed',
          loan_count: profileRes.data.loan_count || 0,
          enquiries: profileRes.data.enquiries || '0_1',
          credit_age: profileRes.data.credit_age || '2_5_years',
          credit_mix: profileRes.data.credit_mix || [],
        });
        if (profileRes.data.analysis) setAnalysis(profileRes.data.analysis);
      }
      setHistory(historyRes.data.history || []);
    } catch {
      // No profile yet
    }
  }, [token]);

  useEffect(() => { loadExistingProfile(); }, [loadExistingProfile]);

  const handleAnalyze = async () => {
    if (!form.cibil_score || form.cibil_score < 300 || form.cibil_score > 900) {
      toast.error('Enter a valid CIBIL score (300-900)');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/credit/analyze`, form, { headers: { Authorization: `Bearer ${token}` } });
      setAnalysis(res.data);
      toast.success('Credit analysis complete!');
      const histRes = await axios.get(`${API}/credit/history`, { headers: { Authorization: `Bearer ${token}` } });
      setHistory(histRes.data.history || []);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMix = (val) => {
    setForm(prev => ({
      ...prev,
      credit_mix: prev.credit_mix.includes(val) ? prev.credit_mix.filter(v => v !== val) : [...prev.credit_mix, val],
    }));
  };

  const bandCfg = analysis ? (BAND_CONFIG[analysis.band] || BAND_CONFIG.average) : null;
  const scorePosition = analysis ? Math.max(0, Math.min(100, ((analysis.score - 300) / 600) * 100)) : 0;

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/arthvyay/dashboard')} data-testid="back-to-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-slate-900" data-testid="credit-health-title">Credit Health Report</h1>
          <p className="text-slate-500 mt-1">Understand and improve your CIBIL score with a personalized action plan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Input Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 border border-slate-200 rounded-2xl sticky top-8" data-testid="credit-input-form">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Credit Health Check</h2>
              <p className="text-xs text-slate-500 mb-5">Tell us a few details — we'll show how to improve your score.</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">CIBIL Score *</Label>
                  <Input type="number" data-testid="cibil-score-input" value={form.cibil_score || ''} onChange={e => setForm({ ...form, cibil_score: Number(e.target.value) || 0 })} placeholder="e.g., 720" min={300} max={900} className="mt-1" />
                  <p className="text-[10px] text-slate-400 mt-1">Find this in your CIBIL report or credit app</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Total Credit Card Limit</Label>
                  <Input type="number" data-testid="credit-limit-input" value={form.credit_limit || ''} onChange={e => setForm({ ...form, credit_limit: Number(e.target.value) || 0 })} placeholder="e.g., 200000" className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm font-semibold">Current Credit Card Usage</Label>
                  <Input type="number" data-testid="credit-usage-input" value={form.credit_usage || ''} onChange={e => setForm({ ...form, credit_usage: Number(e.target.value) || 0 })} placeholder="e.g., 85000" className="mt-1" />
                  {form.credit_limit > 0 && form.credit_usage > 0 && (
                    <p className={`text-[10px] mt-1 font-semibold ${(form.credit_usage / form.credit_limit) > 0.3 ? 'text-red-500' : 'text-green-600'}`}>
                      Utilisation: {((form.credit_usage / form.credit_limit) * 100).toFixed(0)}% {(form.credit_usage / form.credit_limit) > 0.3 ? '(High)' : '(Good)'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold">EMI Payment History (12 months)</Label>
                  <Select value={form.emi_history} onValueChange={v => setForm({ ...form, emi_history: v })}>
                    <SelectTrigger className="mt-1" data-testid="emi-history-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never_missed">Never missed</SelectItem>
                      <SelectItem value="missed_once">Missed once</SelectItem>
                      <SelectItem value="missed_multiple">Missed more than once</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Active Loans</Label>
                  <Input type="number" value={form.loan_count || ''} onChange={e => setForm({ ...form, loan_count: Number(e.target.value) || 0 })} placeholder="0" className="mt-1" min={0} />
                </div>

                <div>
                  <Label className="text-sm font-semibold">Loan Enquiries (last 6 months)</Label>
                  <Select value={form.enquiries} onValueChange={v => setForm({ ...form, enquiries: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0_1">0-1</SelectItem>
                      <SelectItem value="2_3">2-3</SelectItem>
                      <SelectItem value="more_than_3">More than 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Oldest Credit Account Age</Label>
                  <Select value={form.credit_age} onValueChange={v => setForm({ ...form, credit_age: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                      <SelectItem value="1_2_years">1-2 years</SelectItem>
                      <SelectItem value="2_5_years">2-5 years</SelectItem>
                      <SelectItem value="more_than_5">More than 5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Credit Mix</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Credit Card', 'Personal Loan', 'Home Loan', 'Vehicle Loan'].map(item => (
                      <label key={item} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox checked={form.credit_mix.includes(item)} onCheckedChange={() => toggleMix(item)} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl" data-testid="analyze-credit-btn">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                  {loading ? 'Analyzing...' : 'Generate My Credit Plan'}
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT: Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {!analysis && (
              <div className="text-center py-20">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Enter your credit details and click "Generate My Credit Plan" to see your personalized analysis.</p>
              </div>
            )}

            {analysis && bandCfg && (
              <>
                {/* PART 1: Score Band */}
                <Card className={`p-0 overflow-hidden rounded-2xl border ${bandCfg.border}`} data-testid="score-band-card">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Your CIBIL Score</p>
                    <p className="text-7xl font-bold text-white font-heading" data-testid="cibil-score-display">{analysis.score}</p>
                    <div className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-bold ${bandCfg.bg} ${bandCfg.text}`}>
                      {bandCfg.emoji} {analysis.band_label}
                    </div>
                    {/* Score bar */}
                    <div className="mt-6 mx-auto max-w-sm">
                      <div className="h-2 bg-slate-700 rounded-full relative overflow-visible">
                        <div className="absolute h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" style={{ width: '100%' }} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-800 shadow-lg transition-all" style={{ left: `calc(${scorePosition}% - 8px)` }} />
                      </div>
                      <div className="flex justify-between mt-1 text-[9px] text-slate-500 font-mono">
                        <span>300</span><span>500</span><span>650</span><span>750</span><span>900</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* PART 2: What It Means */}
                <Card className={`p-6 rounded-2xl border ${bandCfg.border} ${bandCfg.bg}`} data-testid="loan-impact-card">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: analysis.band_color }} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">What This Means for Loans</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{analysis.loan_message}</p>
                    </div>
                  </div>
                  {analysis.risk_flags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysis.risk_flags.map((flag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3" /> {flag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>

                {/* PART 3: Top Actions */}
                <Card className="p-6 rounded-2xl border border-slate-200" data-testid="top-actions-card">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Top Actions to Improve Your Score</h3>
                  <p className="text-xs text-slate-500 mb-5">Ranked by impact — start with #1</p>
                  <div className="space-y-4">
                    {analysis.top_actions?.map((action, idx) => {
                      const Icon = ICON_MAP[action.icon] || CheckCircle2;
                      const impactColor = action.impact === 'high' ? 'bg-red-100 text-red-700 border-red-200' : action.impact === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200';
                      return (
                        <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors" data-testid={`action-${idx}`}>
                          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-brand-blue" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-slate-800">#{idx + 1} {action.title}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${impactColor}`}>{action.impact} impact</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{action.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Timeline: {action.timeline}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* PART 4: 6-Month Plan */}
                <Card className="p-6 rounded-2xl border border-slate-200" data-testid="improvement-plan-card">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Your 6-Month Improvement Plan</h3>
                  <p className="text-xs text-slate-500 mb-5">Follow this step-by-step to see real improvement</p>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200" />
                    <div className="space-y-0">
                      {analysis.improvement_plan?.map((step, idx) => (
                        <div key={idx} className="flex gap-4 relative" data-testid={`plan-month-${step.month}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold ${idx === 0 ? 'bg-brand-blue text-white' : idx === 5 ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-300 text-slate-500'}`}>
                            M{step.month}
                          </div>
                          <div className="flex-1 pb-5">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{step.focus}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{step.message}</p>
                            {idx === 2 && (
                              <p className="text-[10px] text-green-600 font-semibold mt-1">Score may start improving around this time</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {analysis.estimated_improvement > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-sm text-green-800 font-semibold">
                        Estimated Improvement: +{analysis.estimated_improvement - 10} to +{analysis.estimated_improvement} points in 6 months
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">Results vary based on individual credit behavior. Not guaranteed.</p>
                    </div>
                  )}
                </Card>

                {/* Score History */}
                <Card className="p-6 rounded-2xl border border-slate-200" data-testid="score-history-card">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Credit Score History</h3>
                  <p className="text-xs text-slate-500 mb-5">Track your progress over time</p>
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No history yet. Your score will be tracked each time you run an analysis.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((entry, idx) => {
                        const date = new Date(entry.date);
                        const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                        const prevScore = idx > 0 ? history[idx - 1].score : null;
                        const diff = prevScore ? entry.score - prevScore : null;
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-blue">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 font-mono">{entry.score}</p>
                                <p className="text-[10px] text-slate-400">{formatted}</p>
                              </div>
                            </div>
                            {diff !== null && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${diff > 0 ? 'bg-green-100 text-green-700' : diff < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
