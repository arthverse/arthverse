import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Users, TrendingUp, Sparkles, AlertCircle, Crown, Lock } from 'lucide-react';

export default function PeerComparison({ token, onLogout }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await axios.get(`${API}/payment/status`, { headers: { Authorization: `Bearer ${token}` } });
        const unlocked = Boolean(p.data.has_premium);
        setHasPremium(unlocked);

        if (unlocked) {
          const res = await axios.get(`${API}/reports/peer-comparison`, { headers: { Authorization: `Bearer ${token}` } });
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Could not load peer comparison');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const formatValue = (v, fmt) => {
    if (fmt === 'inr') return `₹${Number(v).toLocaleString('en-IN')}`;
    if (fmt === 'percent') return `${v.toFixed(1)}%`;
    if (fmt === 'months') return `${v.toFixed(1)} mo`;
    if (fmt === 'x') return `${v.toFixed(1)}x`;
    return v;
  };

  const getRatingColor = (pct) => {
    if (pct >= 75) return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
    if (pct >= 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
    if (pct >= 30) return 'bg-gradient-to-r from-amber-400 to-orange-400 text-white';
    return 'bg-gradient-to-r from-red-400 to-rose-500 text-white';
  };

  if (loading) {
    return <Layout token={token} onLogout={onLogout}><div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500">Loading peer comparison...</div></Layout>;
  }

  if (!hasPremium) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate('/arthvyay/dashboard')} data-testid="back-btn" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Card className="p-10 border border-amber-200 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Peer Comparison is Premium</h2>
            <p className="text-sm text-slate-600 mb-6 max-w-xl mx-auto">
              See exactly how your Net Worth, Savings Rate, SIP Investments and Insurance Cover stack up against peers
              in your city-tier and age bracket. Benchmarks based on CRISIL / RBI / NSSO aggregates.
            </p>
            <Button onClick={() => navigate('/arthvyay/dashboard')} className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6" data-testid="upgrade-cta">
              <Lock className="w-4 h-4 mr-2" /> Unlock with Premium
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Card className="p-8 border border-slate-200 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-slate-700 mb-4">{error || 'Could not load comparison.'}</p>
            <Button onClick={() => navigate('/arthvyay/questionnaire')}>Complete Financial Profile</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-6xl mx-auto px-4 lg:px-12 py-8" data-testid="peer-comparison-page">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/arthvyay/dashboard')} data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-brand-orange font-semibold">Premium Insight</span>
          <h1 className="text-3xl font-semibold font-heading text-slate-900 tracking-tight mt-1" data-testid="peer-title">
            How You Compare to Peers
          </h1>
          <p className="text-slate-500 font-body mt-1">
            Benchmarked against <span className="font-semibold text-slate-700">{data.cohort.description}</span>
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-8 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-slate-900 to-indigo-900 text-white border-0" data-testid="overall-score-card">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-indigo-300" />
                <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Your Cohort Rank</span>
              </div>
              <h2 className="text-5xl font-bold font-heading tracking-tight">
                {data.overall_percentile}<span className="text-2xl text-indigo-300">th percentile</span>
              </h2>
              <div className="mt-3 inline-flex">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getRatingColor(data.overall_percentile)}`} data-testid="overall-rating-pill">
                  {data.overall_rating}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-[260px]">
              <p className="text-sm text-indigo-200 mb-3">
                You're ahead of {data.overall_percentile}% of {data.cohort.description.toLowerCase()} across 6 key financial metrics.
              </p>
              <div className="h-3 rounded-full bg-indigo-950/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-400 transition-all duration-1000"
                  style={{ width: `${data.overall_percentile}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8" data-testid="metrics-grid">
          {data.metrics.map((m, i) => {
            const bar = Math.min(100, (m.user_value / (m.peer_top_quartile * 1.2)) * 100);
            const medianBar = (m.peer_median / (m.peer_top_quartile * 1.2)) * 100;
            return (
              <Card key={i} className="p-6 border border-slate-200 rounded-2xl" data-testid={`metric-card-${i}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{m.label}</h3>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">{m.tier}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRatingColor(m.percentile)}`}>
                    {m.percentile}th
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">You</p>
                  <p className="text-2xl font-bold font-mono text-slate-900">{formatValue(m.user_value, m.format)}</p>
                </div>

                {/* Bar chart */}
                <div className="relative h-2 rounded-full bg-slate-100 mb-3 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-brand-blue to-indigo-500 rounded-full" style={{ width: `${Math.max(6, bar)}%` }} />
                  <div className="absolute top-0 h-full w-0.5 bg-slate-400" style={{ left: `${medianBar}%` }} title="Peer Median" />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Peer median: <span className="font-semibold text-slate-700">{formatValue(m.peer_median, m.format)}</span></span>
                  <span>Top quartile: <span className="font-semibold text-slate-700">{formatValue(m.peer_top_quartile, m.format)}</span></span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Insights */}
        <Card className="p-6 border border-brand-blue/20 rounded-2xl bg-blue-50/40" data-testid="insights-card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-brand-blue" />
            <h3 className="text-lg font-bold text-slate-900">Key Takeaways</h3>
          </div>
          <ul className="space-y-2">
            {data.insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <TrendingUp className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                <span>{ins}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-400 mt-5 italic">
            Benchmarks modelled on CRISIL Wealth Outlook, RBI Consumer Finance Survey, and NSSO aggregates (illustrative, not official).
          </p>
        </Card>
      </div>
    </Layout>
  );
}
