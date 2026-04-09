import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ArthVerseAuth({ onAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');
  const [loading, setLoading] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [generatedLoginId, setGeneratedLoginId] = useState('');
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirm_password: ''
  });
  const [formData, setFormData] = useState({
    client_id: '',
    password: '',
    name: '',
    email: '',
    mobile_number: '',
    pan_number: '',
    date_of_birth: '',
    city: '',
    data_privacy_consent: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && !formData.data_privacy_consent) {
      toast.error('Please accept data privacy consent');
      return;
    }

    if (!isLogin && !formData.date_of_birth) {
      toast.error('Date of Birth is required');
      return;
    }
    
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { client_id: formData.client_id, password: formData.password }
        : {
            email: formData.email,
            name: formData.name,
            mobile_number: formData.mobile_number,
            pan_number: formData.pan_number,
            date_of_birth: formData.date_of_birth,
            city: formData.city,
            data_privacy_consent: formData.data_privacy_consent
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      if (response.data.token) {
        if (isLogin) {
          onAuth(response.data.token, response.data.user);
          toast.success('Welcome back!');
          navigate('/arthverse/portal');
        } else {
          // Show success screen with generated Login ID
          setGeneratedLoginId(response.data.user.client_id);
          setShowSuccessScreen(true);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-white to-brand-orange/5 flex items-center justify-center px-6 py-12" data-testid="arthverse-auth-page">
      {showSuccessScreen ? (
        <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Created Successfully!</h2>
            <p className="text-slate-600 mb-6">Your account has been created. Please save your Client ID for future logins.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-slate-600 mb-2">Your Client ID:</p>
              <p className="text-xl font-bold text-brand-blue">{generatedLoginId}</p>
            </div>
            
            <Button
              onClick={() => {
                setShowSuccessScreen(false);
                setShowPasswordSetup(true);
              }}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full py-3"
            >
              Set Password
            </Button>
          </div>
        </Card>
      ) : showPasswordSetup ? (
        <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Create Password</h2>
            <p className="text-slate-600 mt-2">Set a secure password for your account</p>
            <p className="text-sm text-brand-blue font-medium mt-1">Client ID: {generatedLoginId}</p>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (passwordData.password !== passwordData.confirm_password) {
              toast.error('Passwords do not match');
              return;
            }
            if (passwordData.password.length < 6) {
              toast.error('Password must be at least 6 characters');
              return;
            }
            
            setLoading(true);
            try {
              const response = await axios.post(`${API}/auth/set-password`, {
                client_id: generatedLoginId,
                password: passwordData.password,
                confirm_password: passwordData.confirm_password
              });
              
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));
              toast.success('Password set successfully!');
              onAuth(response.data.token, response.data.user);
              navigate('/arthverse');
            } catch (error) {
              toast.error(error.response?.data?.detail || 'Failed to set password');
            } finally {
              setLoading(false);
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="new_password" className="font-semibold">Password *</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
              />
            </div>
            
            <div>
              <Label htmlFor="confirm_password" className="font-semibold">Confirm Password *</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
                minLength={6}
                placeholder="Re-enter password"
                className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full py-3 mt-4"
            >
              {loading ? 'Setting Password...' : 'Set Password & Login'}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl" data-testid="arthverse-auth-card">
          <div className="mb-8 text-center">
            <img 
              src="/arth-verse-logo.png" 
              alt="Arth-Verse Logo" 
              className="h-20 object-contain mx-auto mb-3"
            />
            <p className="text-slate-600 font-body">Universe for every rupee</p>
          </div>

          <div className="flex gap-2 mb-6" data-testid="auth-toggle">
            <Button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-full ${
                isLogin 
                  ? 'bg-brand-blue text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              data-testid="login-tab-btn"
            >
              Login
            </Button>
            <Button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-full ${
                !isLogin 
                  ? 'bg-brand-blue text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              data-testid="signup-tab-btn"
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="arthverse-auth-form">
            {isLogin ? (
              <>
                <div data-testid="client-id-container">
                  <Label htmlFor="client_id" className="font-semibold">Client ID</Label>
                  <Input
                    id="client_id"
                    data-testid="client-id-input"
                    type="text"
                    placeholder="e.g., AV12345678"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                  />
                </div>

                <div data-testid="password-container">
                  <Label htmlFor="password" className="font-semibold">Password</Label>
                  <Input
                    id="password"
                    data-testid="password-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-testid="name-container">
                    <Label htmlFor="name" className="font-semibold">Name *</Label>
                    <Input
                      id="name"
                      data-testid="name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                    />
                  </div>

                  <div data-testid="mobile-container">
                    <Label htmlFor="mobile_number" className="font-semibold">Mobile Number *</Label>
                    <Input
                      id="mobile_number"
                      data-testid="mobile-input"
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      required
                      className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                    />
                  </div>
                </div>

                <div data-testid="email-container">
                  <Label htmlFor="email" className="font-semibold">Email ID *</Label>
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                  />
                </div>

                <div data-testid="pan-container">
                  <Label htmlFor="pan_number" className="font-semibold">PAN Number *</Label>
                  <Input
                    id="pan_number"
                    data-testid="pan-input"
                    type="text"
                    placeholder="ABCDE1234F"
                    value={formData.pan_number}
                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                    required
                    maxLength={10}
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-testid="dob-container">
                    <Label htmlFor="date_of_birth" className="font-semibold">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      data-testid="dob-input"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      required
                      className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                    />
                  </div>

                  <div data-testid="city-container">
                    <Label htmlFor="city" className="font-semibold">City *</Label>
                    <Input
                      id="city"
                      data-testid="city-input"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl" data-testid="privacy-consent-container">
                  <Checkbox
                    id="data_privacy_consent"
                    checked={formData.data_privacy_consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, data_privacy_consent: checked })}
                    data-testid="privacy-consent-checkbox"
                    required
                  />
                  <Label htmlFor="data_privacy_consent" className="text-sm leading-relaxed cursor-pointer">
                    I consent to the collection and processing of my personal data in accordance with the data privacy policy. *
                  </Label>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full py-6 text-lg font-semibold mt-6"
              data-testid="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
