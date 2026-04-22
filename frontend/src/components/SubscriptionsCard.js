import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from './ui/card';
import { RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';

export default function SubscriptionsCard({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`${API}/transactions/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setData({ subscriptions: [], count: 0, total_monthly_cost: 0, total_yearly_cost: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <Card className="p-6 border border-slate-200 rounded-2xl" data-testid="subscriptions-card-loading">
        <div className="h-4 w-40 bg-slate-200 animate-pulse rounded mb-4" />
        <div className="h-24 bg-slate-100 animate-pulse rounded" />
      </Card>
    );
  }

  if (!data || data.count === 0) {
    return (
      <Card className="p-6 border border-slate-200 rounded-2xl" data-testid="subscriptions-card-empty">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Recurring Subscriptions</h3>
            <p className="text-xs text-slate-500">Auto-detected from your transactions</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          No recurring subscriptions detected yet. Once you have at least 2 months of transactions,
          we'll surface all your monthly SIPs, OTT subscriptions, and recurring bills here.
        </p>
      </Card>
    );
  }

  const upcoming = data.subscriptions.filter(s => s.days_until_next <= 7);

  return (
    <Card className="p-6 border border-slate-200 rounded-2xl overflow-hidden" data-testid="subscriptions-card">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-brand-orange font-bold">Auto-Detected</span>
            <h3 className="text-lg font-bold font-heading text-slate-900 leading-tight">Recurring Subscriptions</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Monthly Outflow</p>
          <p className="text-2xl font-bold font-mono text-indigo-600" data-testid="subscription-total-monthly">
            ₹{data.total_monthly_cost.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">₹{data.total_yearly_cost.toLocaleString('en-IN')}/yr</p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900">
              {upcoming.length} subscription{upcoming.length > 1 ? 's' : ''} renew in the next 7 days
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Review them below — cancel any you no longer use before the charge hits.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2" data-testid="subscriptions-list">
        {data.subscriptions.slice(0, 6).map((sub, i) => (
          <div
            key={`${sub.merchant}-${i}`}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            data-testid={`subscription-item-${i}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                sub.frequency === 'monthly' ? 'bg-indigo-100' : sub.frequency === 'yearly' ? 'bg-purple-100' : 'bg-blue-100'
              }`}>
                <span className={`text-[10px] font-bold ${
                  sub.frequency === 'monthly' ? 'text-indigo-700' : sub.frequency === 'yearly' ? 'text-purple-700' : 'text-blue-700'
                }`}>
                  {sub.frequency === 'monthly' ? 'M' : sub.frequency === 'yearly' ? 'Y' : 'W'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{sub.display_name}</p>
                <p className="text-[11px] text-slate-500">
                  {sub.category} · Next: {sub.days_until_next === 0 ? 'any day' : `in ${sub.days_until_next}d`}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold font-mono text-slate-800">₹{sub.amount.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400">{sub.frequency}</p>
            </div>
          </div>
        ))}
      </div>

      {data.subscriptions.length > 6 && (
        <button
          className="mt-3 text-xs font-semibold text-brand-blue hover:text-brand-blue/80 flex items-center gap-1"
          data-testid="view-all-subscriptions-btn"
        >
          View all {data.subscriptions.length} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </Card>
  );
}
