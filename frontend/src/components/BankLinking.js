import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export default function BankLinking({ token, onConsentApproved }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentUrl, setConsentUrl] = useState('');
  const [consentId, setConsentId] = useState('');
  const [step, setStep] = useState('input'); // 'input', 'approval', 'success'

  const handleInitiateConsent = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
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
      setShowConsentDialog(true);
      setStep('approval');
      
      toast.success('Consent request created! Please approve in the new window.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate consent');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConsentWindow = () => {
    window.open(consentUrl, '_blank', 'width=600,height=700');
  };

  const handleCheckApproval = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/setu/consent/status/${consentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'ACTIVE') {
        setStep('success');
        toast.success('Bank accounts linked successfully!');
        
        // Trigger data fetching
        await axios.post(
          `${API}/setu/financial-data/fetch/${consentId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Notify parent component
        if (onConsentApproved) {
          onConsentApproved(consentId);
        }
      } else if (response.data.status === 'REJECTED') {
        toast.error('Consent was rejected. Please try again.');
        setShowConsentDialog(false);
        setStep('input');
      } else {
        toast.info('Approval is still pending. Please complete the process in the consent window.');
      }
    } catch (error) {
      toast.error('Failed to check consent status');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowConsentDialog(false);
    setStep('input');
    setPhoneNumber('');
    setConsentUrl('');
    setConsentId('');
  };

  return (
    <>
      <Card className="p-6 border-2 border-brand-blue/20 hover:border-brand-blue/40 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold font-heading mb-2 text-brand-blue">
              Link Bank Accounts
            </h3>
            <p className="text-slate-600 font-body mb-4">
              Securely connect your bank accounts to automatically fetch transactions, balances, mutual funds, and insurance data.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number (linked to your bank)
                </label>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={loading}
                  className="max-w-md"
                />
              </div>
              
              <Button
                onClick={handleInitiateConsent}
                disabled={loading || !phoneNumber || phoneNumber.length !== 10}
                className="bg-brand-blue hover:bg-brand-blue/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Link Bank Account'
                )}
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-slate-600">
                🔒 <strong>Secure & RBI Regulated:</strong> We use Setu Account Aggregator (regulated by RBI) for secure, consent-based data access. Your bank credentials are never shared.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {step === 'approval' && 'Complete Bank Account Linking'}
              {step === 'success' && 'Bank Accounts Linked Successfully!'}
            </DialogTitle>
            <DialogDescription>
              {step === 'approval' && 'Please complete the verification process in the consent window'}
              {step === 'success' && 'Your financial data is being fetched securely'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {step === 'approval' && (
              <>
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    Click below to open the secure consent approval window. Complete the OTP verification and select your bank accounts.
                  </p>
                </div>
                
                <Button
                  onClick={handleOpenConsentWindow}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                >
                  Open Bank Linking Window
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">After completing</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckApproval}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "I've Completed the Process"
                  )}
                </Button>
              </>
            )}
            
            {step === 'success' && (
              <>
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900 mb-1">All Set!</p>
                    <p className="text-sm text-slate-600">
                      Your bank accounts are now linked. Financial data will appear in your dashboard shortly.
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleClose}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
