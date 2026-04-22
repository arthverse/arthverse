import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { Mail, Sparkles, CheckCircle2, Loader2, X, ArrowRight } from 'lucide-react';

/**
 * "Complete in 60s" Onboarding Modal
 * Steps:
 *  1. Connect Gmail (deep-link OAuth)
 *  2. Auto-trigger Scan & Parse All
 *  3. Show result → Review Questionnaire CTA
 *
 * Dismissable forever via localStorage flag `onboardingDismissed`.
 */
export default function OnboardingModal({ token, open, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=intro, 2=scanning, 3=done
  const [gmailConnected, setGmailConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [gmailEmail, setGmailEmail] = useState(null);

  // Check Gmail status on open
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await axios.get(`${API}/gmail/status`, { headers: { Authorization: `Bearer ${token}` } });
        setGmailConnected(Boolean(res.data.connected));
        setGmailEmail(res.data.email);
      } catch { /* ignore */ }
    })();
  }, [open, token]);

  // Auto-advance: if user just returned from OAuth with ?gmail=connected
  useEffect(() => {
    if (!open) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gmail') === 'connected') {
      setGmailConnected(true);
      // Auto-trigger scan
      setTimeout(() => handleBulkScan(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConnectGmail = () => {
    localStorage.setItem('onboardingInProgress', '1');
    window.location.href = `${API}/gmail/connect?token=${encodeURIComponent(token)}`;
  };

  const handleBulkScan = async () => {
    setStep(2);
    setScanning(true);
    try {
      const res = await axios.post(`${API}/gmail/scan-and-apply-all?max_emails=20`, {},
        { headers: { Authorization: `Bearer ${token}` }, timeout: 300000 });
      setScanResult(res.data);
      setStep(3);
    } catch (err) {
      setScanResult({ error: err.response?.data?.detail || 'Scan failed' });
      setStep(3);
    } finally {
      setScanning(false);
      localStorage.removeItem('onboardingInProgress');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('onboardingDismissed', '1');
    localStorage.removeItem('onboardingInProgress');
    onClose();
  };

  const handleReviewQuestionnaire = () => {
    localStorage.setItem('onboardingDismissed', '1');
    localStorage.removeItem('onboardingInProgress');
    onClose();
    navigate('/arthvyay/questionnaire');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" data-testid="onboarding-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Top bar with steps */}
        <div className="relative bg-gradient-to-br from-brand-blue to-indigo-700 text-white p-6 pb-8">
          <button onClick={handleDismiss} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" data-testid="onboarding-close-btn">
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3 h-3" /> 60-Second Onboarding
          </div>
          <h2 className="text-2xl font-bold font-heading" data-testid="onboarding-title">
            {step === 1 && "Auto-fill your entire financial profile"}
            {step === 2 && "AI is reading your financial emails..."}
            {step === 3 && scanResult?.error ? "Something went wrong" : step === 3 ? "You're all set!" : ""}
          </h2>
          <p className="text-sm text-white/85 mt-2">
            {step === 1 && "Connect Gmail once — we'll extract your insurance, SIPs, bank transactions, and auto-fill your questionnaire."}
            {step === 2 && "Parsing up to 20 financial emails with GPT-5.2. Typically 30-60 seconds."}
            {step === 3 && !scanResult?.error && `${scanResult?.summary || 'Setup complete'}`}
            {step === 3 && scanResult?.error && scanResult.error}
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5">
            {[1, 2, 3].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= step ? 'bg-white' : 'bg-white/25'}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Feature icon={Mail} title="Scan insurance, SIP, bank emails" desc="We find policies, investments & transactions automatically" />
                <Feature icon={Sparkles} title="AI extracts structured data" desc="GPT-5.2 reads each email and pulls amounts, dates, insurers" />
                <Feature icon={CheckCircle2} title="Auto-fills your questionnaire" desc="Health cover, SIPs, term life — no manual typing" />
              </div>

              {gmailConnected ? (
                <Button
                  onClick={handleBulkScan}
                  className="w-full bg-gradient-to-r from-brand-orange to-amber-500 hover:opacity-90 text-white rounded-xl h-12 font-bold shadow-lg"
                  data-testid="onboarding-start-scan-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Scan my Gmail now
                </Button>
              ) : (
                <Button
                  onClick={handleConnectGmail}
                  className="w-full bg-gradient-to-r from-brand-blue to-indigo-700 hover:opacity-90 text-white rounded-xl h-12 font-bold shadow-lg"
                  data-testid="onboarding-connect-gmail-btn"
                >
                  <Mail className="w-4 h-4 mr-2" /> Connect Gmail to get started
                </Button>
              )}

              <button onClick={handleDismiss} className="w-full text-xs text-slate-500 hover:text-slate-700 mt-2" data-testid="onboarding-skip-btn">
                I'll do this manually later
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-orange to-amber-400 flex items-center justify-center mb-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              {gmailEmail && <p className="text-xs text-slate-500 mb-1">Connected: {gmailEmail}</p>}
              <p className="text-sm font-semibold text-slate-800">Scanning financial emails...</p>
              <p className="text-xs text-slate-500 mt-1">Extracting insurance, SIPs, and transactions</p>
            </div>
          )}

          {step === 3 && scanResult && !scanResult.error && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat value={scanResult.emails_processed || 0} label="Emails scanned" color="text-slate-800" />
                <Stat value={scanResult.emails_with_data || 0} label="With data" color="text-emerald-600" />
                <Stat value={scanResult.total_transactions_saved || 0} label="Transactions saved" color="text-brand-blue" />
                <Stat value={scanResult.total_fields_updated || 0} label="Profile fields filled" color="text-purple-600" />
              </div>
              {scanResult.percentile_change && scanResult.percentile_change.delta >= 3 && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white" data-testid="onboarding-percentile-card">
                  <p className="text-[10px] uppercase text-white/80 font-bold tracking-widest">Financial Rank Jumped</p>
                  <p className="text-lg font-bold">
                    {scanResult.percentile_change.before}<span className="text-white/70 text-sm"> → </span>{scanResult.percentile_change.after}<span className="text-white/80 text-xs"> percentile 🎉</span>
                  </p>
                  <p className="text-[11px] text-white/85">vs {scanResult.percentile_change.cohort_description}</p>
                </div>
              )}
              {scanResult.policies_applied?.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  ✓ Applied {scanResult.policies_applied.length} insurance polic{scanResult.policies_applied.length > 1 ? 'ies' : 'y'}
                </div>
              )}
              <Button
                onClick={handleReviewQuestionnaire}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl h-11 font-bold"
                data-testid="onboarding-review-btn"
              >
                Review Auto-Filled Questionnaire <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button onClick={handleDismiss} className="w-full text-xs text-slate-500 hover:text-slate-700" data-testid="onboarding-done-btn">
                Close
              </button>
            </div>
          )}

          {step === 3 && scanResult?.error && (
            <div className="space-y-3">
              <Button onClick={() => { setStep(1); setScanResult(null); }} className="w-full">Try Again</Button>
              <button onClick={handleDismiss} className="w-full text-xs text-slate-500">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-brand-blue" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

const Stat = ({ value, label, color }) => (
  <div className="p-3 bg-slate-50 rounded-xl text-center">
    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mt-1">{label}</p>
  </div>
);
