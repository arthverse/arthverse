import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Building2, Smartphone, ArrowRight, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export default function BankLinkingPrompt({ token, onComplete, onSkip }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'waiting', 'success', 'error'
  const [consentId, setConsentId] = useState('');
  const [consentUrl, setConsentUrl] = useState('');

  const handleInitiateConsent = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/setu/consent/initiate`,
        { phone_number: phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { consent_id, redirect_url } = response.data;
      setConsentId(consent_id);
      setConsentUrl(redirect_url);
      setStep('waiting');
      
      // Open consent window
      window.open(redirect_url, '_blank', 'width=600,height=700');
      toast.success('Please complete the bank linking in the new window');
    } catch (error) {
      console.error('Consent error:', error);
      setStep('error');
      toast.error(error.response?.data?.detail || 'Failed to initiate bank linking. You can skip and fill manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!consentId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/setu/consent/status/${consentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'ACTIVE') {
        setStep('success');
        toast.success('Bank account linked successfully!');
        
        // Fetch financial data
        try {
          await axios.post(
            `${API}/setu/financial-data/fetch`,
            { consent_id: consentId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Get aggregated data
          const dataResponse = await axios.get(
            `${API}/setu/financial-data`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Pass data to parent for auto-fill
          setTimeout(() => onComplete(dataResponse.data), 1500);
        } catch (fetchError) {
          console.error('Data fetch error:', fetchError);
          setTimeout(() => onComplete(null), 1500);
        }
      } else if (response.data.status === 'REJECTED') {
        setStep('error');
        toast.error('Bank linking was rejected. You can try again or skip.');
      } else {
        toast.info('Consent is still pending. Please complete it in the bank window.');
      }
    } catch (error) {
      toast.error('Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
          Link Your Bank Account
        </h2>
        <p className="text-slate-600 font-body">
          Connect your bank account to automatically fetch your financial data.
          This helps us provide accurate analysis.
        </p>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-brand-blue mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Benefits of linking your account
            </h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Auto-fill income from salary credits</li>
              <li>• Auto-categorize your expenses</li>
              <li>• Track your investments automatically</li>
              <li>• Get more accurate financial health score</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Smartphone className="w-4 h-4 inline mr-2" />
              Mobile Number (linked to bank)
            </label>
            <Input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="h-12 text-lg"
              data-testid="bank-link-phone-input"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleInitiateConsent}
              disabled={loading || phoneNumber.length !== 10}
              className="flex-1 h-12 bg-brand-blue hover:bg-brand-blue/90 rounded-xl text-base"
              data-testid="link-bank-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Link Bank Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 underline"
            data-testid="skip-bank-link-btn"
          >
            Skip for now, I'll fill manually
          </button>
        </div>
      )}

      {step === 'waiting' && (
        <div className="space-y-6 text-center">
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">
              Complete Bank Linking
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              A new window has opened. Please complete the bank linking process there.
              Once done, click the button below.
            </p>
            <Button
              onClick={() => window.open(consentUrl, '_blank', 'width=600,height=700')}
              variant="outline"
              className="mb-4"
            >
              Reopen Bank Window
            </Button>
          </div>

          <Button
            onClick={handleCheckStatus}
            disabled={loading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl"
            data-testid="check-status-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                I've Completed Bank Linking
              </>
            )}
          </Button>

          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Skip and fill manually
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-600 mb-2">
            Bank Account Linked Successfully!
          </h3>
          <p className="text-slate-600">
            Fetching your financial data...
          </p>
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto mt-4" />
        </div>
      )}

      {step === 'error' && (
        <div className="space-y-6 text-center">
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">
              Bank Linking Failed
            </h3>
            <p className="text-sm text-slate-600">
              We couldn't connect to your bank. This might be due to:
            </p>
            <ul className="text-sm text-slate-500 mt-2">
              <li>• Bank server issues</li>
              <li>• Invalid credentials</li>
              <li>• Network problems</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setStep('input');
                setPhoneNumber('');
              }}
              variant="outline"
              className="flex-1"
            >
              Try Again
            </Button>
            <Button
              onClick={handleSkip}
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
            >
              Continue Manually
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">
        🔒 Your data is secure and encrypted. We use RBI-licensed Account Aggregator framework.
      </p>
    </Card>
  );
}
