import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText, Mail, CheckCircle2, AlertTriangle, Loader2, ExternalLink, Shield, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function SmartImport({ token, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('policy');
  const [uploading, setUploading] = useState(false);
  const [parsingEmail, setParsingEmail] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [emailText, setEmailText] = useState('');
  const [gmailStatus, setGmailStatus] = useState(null);
  const [gmailEmails, setGmailEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [parsedPolicies, setParsedPolicies] = useState([]);
  const [applyingPolicy, setApplyingPolicy] = useState(false);
  const [savingTransactions, setSavingTransactions] = useState(false);
  const [savedTransactionIds, setSavedTransactionIds] = useState(new Set());
  const [inbox, setInbox] = useState({ emails: [], unparsed_count: 0, last_scanned: null });
  const [refreshingInbox, setRefreshingInbox] = useState(false);

  const loadGmailStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/gmail/status`, { headers: { Authorization: `Bearer ${token}` } });
      setGmailStatus(res.data);
    } catch { /* ignore */ }
  }, [token]);

  const loadInbox = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/gmail/inbox?unparsed_only=false`, { headers: { Authorization: `Bearer ${token}` } });
      setInbox(res.data);
    } catch { /* ignore — might not be connected yet */ }
  }, [token]);

  const handleRefreshInbox = async () => {
    setRefreshingInbox(true);
    try {
      const res = await axios.post(`${API}/gmail/refresh`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.error) {
        toast.error('Refresh failed: ' + res.data.error);
      } else {
        toast.success(`Found ${res.data.new_count} new financial email${res.data.new_count === 1 ? '' : 's'}`);
        loadInbox();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Refresh failed');
    } finally {
      setRefreshingInbox(false);
    }
  };

  const loadParsedPolicies = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/documents/parsed-policies`, { headers: { Authorization: `Bearer ${token}` } });
      setParsedPolicies(res.data.policies || []);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    loadGmailStatus();
    loadParsedPolicies();
    loadInbox();
    if (searchParams.get('gmail') === 'connected') toast.success('Gmail connected successfully!');
    if (searchParams.get('gmail') === 'error') toast.error('Gmail connection failed');
  }, [loadGmailStatus, loadParsedPolicies, loadInbox, searchParams]);

  const handlePolicyUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files supported'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }

    setUploading(true);
    setParsedResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API}/documents/parse-policy`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setParsedResult(res.data);
      if (res.data.success) {
        toast.success('Policy parsed successfully!');
        loadParsedPolicies();
      } else {
        toast.error(res.data.error || 'Could not parse policy');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleEmailParse = async () => {
    if (!emailText.trim()) { toast.error('Paste email content first'); return; }
    setParsingEmail(true);
    setParsedResult(null);
    try {
      const res = await axios.post(`${API}/documents/parse-email`, { email_text: emailText }, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 30000,
      });
      setParsedResult(res.data);
      if (res.data.success) toast.success('Email parsed!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Parse failed');
    } finally {
      setParsingEmail(false);
    }
  };

  const handleApplyPolicy = async (policyData) => {
    setApplyingPolicy(true);
    try {
      const res = await axios.post(`${API}/documents/apply-policy`, { policy_data: policyData }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Applied! Updated: ${res.data.updated_fields.join(', ')}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not apply');
    } finally {
      setApplyingPolicy(false);
    }
  };

  const handleSaveTransactions = async (transactions, source = 'email') => {
    if (!transactions?.length) return;
    setSavingTransactions(true);
    try {
      const res = await axios.post(`${API}/documents/save-transactions`, {
        transactions,
        source,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.saved_count > 0) {
        toast.success(`${res.data.saved_count} transaction${res.data.saved_count > 1 ? 's' : ''} saved to Transactions page`);
        // Track saved signature so we can disable the button
        const sig = transactions.map(t => `${t.date}-${t.amount}-${t.description}`).join('|');
        setSavedTransactionIds(prev => new Set(prev).add(sig));
      } else {
        toast.error('No transactions could be saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSavingTransactions(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      window.location.href = `${API}/gmail/connect?user_id=${user.id}`;
    } catch {
      toast.error('Could not initiate Gmail connection');
    }
  };

  const handleFetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const res = await axios.get(`${API}/gmail/emails?max_results=20`, { headers: { Authorization: `Bearer ${token}` } });
      setGmailEmails(res.data.emails || []);
      toast.success(`Found ${res.data.total} financial emails`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not fetch emails');
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleParseGmailEmail = async (emailId) => {
    setExpandedEmail(emailId);
    try {
      const res = await axios.post(`${API}/gmail/parse-email/${emailId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 30000,
      });
      setParsedResult(res.data);
      if (res.data.success) toast.success('Email parsed with AI!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Parse failed');
    }
  };

  const tabs = [
    { id: 'policy', label: 'Policy Upload', icon: FileText },
    { id: 'email', label: 'Email Parsing', icon: Mail },
    { id: 'gmail', label: 'Gmail Connect', icon: ExternalLink },
  ];

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/arthvyay/dashboard')} data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <h1 className="text-3xl font-bold font-heading text-slate-900 mb-1" data-testid="smart-import-title">Smart Import</h1>
        <p className="text-slate-500 mb-8">Upload insurance policies, parse financial emails, or connect Gmail to auto-import your financial data.</p>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit" data-testid="import-tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setParsedResult(null); }}
              data-testid={`tab-${tab.id}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Input */}
          <div className="lg:col-span-2">
            {/* Policy Upload Tab */}
            {activeTab === 'policy' && (
              <Card className="p-6 border border-slate-200 rounded-2xl" data-testid="policy-upload-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Shield className="w-5 h-5 text-brand-blue" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Upload Insurance Policy</h2>
                    <p className="text-xs text-slate-500">PDF format, max 10MB</p>
                  </div>
                </div>
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${uploading ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                  <input type="file" accept=".pdf" className="hidden" onChange={handlePolicyUpload} disabled={uploading} data-testid="policy-file-input" />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                      <span className="text-sm text-brand-blue font-semibold">AI is reading your policy...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">Drop PDF here or click to upload</span>
                    </div>
                  )}
                </label>

                {/* History */}
                {parsedPolicies.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Previously Parsed</p>
                    <div className="space-y-2">
                      {parsedPolicies.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                          <div>
                            <span className="font-semibold text-slate-700">{p.file_name}</span>
                            <span className="text-slate-400 ml-2">{p.parsed_data?.policy_type}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setParsedResult({ success: true, data: p.parsed_data })}>View</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Email Paste Tab */}
            {activeTab === 'email' && (
              <Card className="p-6 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Mail className="w-5 h-5 text-brand-orange" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Parse Financial Email</h2>
                    <p className="text-xs text-slate-500">Paste email content below</p>
                  </div>
                </div>
                <textarea
                  value={emailText} onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste your bank statement email, investment confirmation, insurance renewal email here..."
                  className="w-full h-48 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  data-testid="email-text-input"
                />
                <Button onClick={handleEmailParse} disabled={parsingEmail} className="w-full mt-3 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl" data-testid="parse-email-btn">
                  {parsingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                  {parsingEmail ? 'AI is parsing...' : 'Parse Email'}
                </Button>
              </Card>
            )}

            {/* Gmail Connect Tab */}
            {activeTab === 'gmail' && (
              <Card className="p-6 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Mail className="w-5 h-5 text-red-600" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Gmail Integration</h2>
                    <p className="text-xs text-slate-500">Auto-scan financial emails</p>
                  </div>
                </div>

                {!gmailStatus?.configured ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-700">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Gmail API credentials not configured yet. Add <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code> to backend .env to enable this feature.
                  </div>
                ) : !gmailStatus?.connected ? (
                  <div>
                    <p className="text-sm text-slate-600 mb-4">Connect your Gmail to automatically find and parse financial emails (bank statements, investment confirmations, insurance renewals).</p>
                    <Button onClick={handleConnectGmail} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl" data-testid="connect-gmail-btn">
                      <Mail className="w-4 h-4 mr-2" /> Connect Gmail
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 mb-4">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Connected: {gmailStatus.email}</span>
                    </div>

                    {/* Auto-scan status banner */}
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 mb-4" data-testid="auto-scan-banner">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2">
                          <RefreshCw className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-indigo-900">Auto-Refresh Active</p>
                            <p className="text-[11px] text-indigo-700">
                              Background scan runs every 12h.
                              {inbox.last_scanned && ` Last: ${new Date(inbox.last_scanned).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        {inbox.unparsed_count > 0 && (
                          <span className="bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" data-testid="inbox-unparsed-badge">
                            {inbox.unparsed_count} new
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={handleRefreshInbox}
                        disabled={refreshingInbox}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8 border-indigo-300 text-indigo-700 hover:bg-indigo-100 rounded-lg"
                        data-testid="refresh-inbox-btn"
                      >
                        {refreshingInbox ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                        {refreshingInbox ? 'Scanning...' : 'Refresh now'}
                      </Button>
                    </div>

                    <Button onClick={handleFetchEmails} disabled={loadingEmails} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl mb-3" data-testid="fetch-emails-btn">
                      {loadingEmails ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                      {loadingEmails ? 'Scanning...' : 'Scan Financial Emails'}
                    </Button>

                    {gmailEmails.length > 0 && (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {gmailEmails.map(email => (
                          <div key={email.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{email.subject}</p>
                                <p className="text-[10px] text-slate-400">{email.from} | {email.date}</p>
                              </div>
                              {expandedEmail === email.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                            {expandedEmail === email.id && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">{email.snippet}</p>
                                <Button size="sm" className="text-xs h-7 bg-brand-blue" onClick={() => handleParseGmailEmail(email.id)}>
                                  Parse with AI
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right: Parsed Result */}
          <div className="lg:col-span-3">
            {!parsedResult && (
              <div className="text-center py-20">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Upload a document or parse an email to see AI-extracted data here.</p>
              </div>
            )}

            {parsedResult?.success && parsedResult.data && (
              <Card className="p-6 border border-green-200 rounded-2xl bg-green-50/30" data-testid="parsed-result-card">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-slate-800">AI Extraction Result</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 ml-auto">
                    {parsedResult.data.confidence || 'parsed'}
                  </span>
                </div>

                {/* Summary */}
                {parsedResult.data.summary && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                    <p className="text-sm text-blue-800">{parsedResult.data.summary}</p>
                  </div>
                )}

                {/* Policy fields */}
                {parsedResult.data.policy_type && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Policy Type', parsedResult.data.policy_type?.replace(/_/g, ' ')?.toUpperCase()],
                        ['Insurer', parsedResult.data.insurer_name],
                        ['Policy Number', parsedResult.data.policy_number],
                        ['Holder', parsedResult.data.policy_holder_name],
                        ['Sum Assured', parsedResult.data.sum_assured ? `₹${Number(parsedResult.data.sum_assured).toLocaleString('en-IN')}` : null],
                        ['Cover Amount', parsedResult.data.cover_amount ? `₹${Number(parsedResult.data.cover_amount).toLocaleString('en-IN')}` : null],
                        ['Premium', parsedResult.data.premium_amount ? `₹${Number(parsedResult.data.premium_amount).toLocaleString('en-IN')} / ${parsedResult.data.premium_frequency || 'year'}` : null],
                        ['Start Date', parsedResult.data.policy_start_date],
                        ['End Date', parsedResult.data.policy_end_date],
                        ['Nominee', parsedResult.data.nominee_name],
                        ['IDV', parsedResult.data.idv ? `₹${Number(parsedResult.data.idv).toLocaleString('en-IN')}` : null],
                      ].filter(([, v]) => v && v !== '0' && v !== '₹0').map(([label, value]) => (
                        <div key={label} className="p-3 bg-white rounded-xl border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{label}</p>
                          <p className="text-sm font-semibold text-slate-800 font-mono mt-1">{value}</p>
                        </div>
                      ))}
                    </div>

                    {parsedResult.data.key_benefits?.length > 0 && (
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Key Benefits</p>
                        <ul className="space-y-1">
                          {parsedResult.data.key_benefits.map((b, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button onClick={() => handleApplyPolicy(parsedResult.data)} disabled={applyingPolicy} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl" data-testid="apply-policy-btn">
                      {applyingPolicy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Apply to My Questionnaire
                    </Button>
                  </div>
                )}

                {/* Email parsed fields */}
                {parsedResult.data.email_type && (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Email Type</p>
                      <p className="text-sm font-semibold text-slate-800">{parsedResult.data.email_type.replace(/_/g, ' ').toUpperCase()}</p>
                    </div>
                    {parsedResult.data.transactions?.length > 0 && (
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] uppercase text-slate-500 font-bold">Transactions Found ({parsedResult.data.transactions.length})</p>
                        </div>
                        <div className="space-y-2">
                          {parsedResult.data.transactions.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                              <div>
                                <span className="font-semibold text-slate-700">{t.description}</span>
                                <span className="text-slate-400 ml-2">{t.category} | {t.date}</span>
                              </div>
                              <span className={`font-bold font-mono ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {(() => {
                          const sig = parsedResult.data.transactions.map(t => `${t.date}-${t.amount}-${t.description}`).join('|');
                          const alreadySaved = savedTransactionIds.has(sig);
                          return (
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              <Button
                                onClick={() => handleSaveTransactions(parsedResult.data.transactions, activeTab === 'gmail' ? 'gmail' : 'email')}
                                disabled={savingTransactions || alreadySaved}
                                className={`flex-1 rounded-xl text-white ${alreadySaved ? 'bg-green-500 hover:bg-green-500' : 'bg-brand-blue hover:bg-brand-blue/90'}`}
                                data-testid="save-transactions-btn"
                              >
                                {savingTransactions ? (
                                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                ) : alreadySaved ? (
                                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved to Transactions</>
                                ) : (
                                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Save {parsedResult.data.transactions.length} to Transactions</>
                                )}
                              </Button>
                              {alreadySaved && (
                                <Button
                                  variant="outline"
                                  onClick={() => navigate('/arthvyay/transactions')}
                                  className="rounded-xl"
                                  data-testid="view-transactions-btn"
                                >
                                  View <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {parsedResult && !parsedResult.success && (
              <Card className="p-6 border border-red-200 rounded-2xl bg-red-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-bold text-red-800">Parsing Failed</h3>
                </div>
                <p className="text-sm text-red-600">{parsedResult.error || 'Could not extract data from the document.'}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
