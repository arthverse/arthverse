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
  const [generatedLoginId, setGeneratedLoginId] = useState('');
  const [formData, setFormData] = useState({
    client_id: '',
    password: '',
    name: '',
    email: '',
    mobile_number: '',
    date_of_birth: '',
    age: '',
    city: '',
    marital_status: '',
    major_members: 0,
    minor_members: 0,
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
            password: formData.password,
            name: formData.name,
            mobile_number: formData.mobile_number,
            date_of_birth: formData.date_of_birth,
            age: parseInt(formData.age) || 0,
            city: formData.city,
            marital_status: formData.marital_status,
            major_members: parseInt(formData.major_members) || 0,
            minor_members: parseInt(formData.minor_members) || 0,
            data_privacy_consent: formData.data_privacy_consent
          };
            mobile_number: formData.mobile_number,
            age: parseInt(formData.age),
            city: formData.city,
            marital_status: formData.marital_status,
            no_of_dependents: parseInt(formData.no_of_dependents),
            data_privacy_consent: formData.data_privacy_consent,
            monthly_income: parseFloat(formData.monthly_income)
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      onAuth(response.data.token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : `Account created! Your Client ID: ${response.data.user.client_id}`);
      navigate('/arthverse/portal');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-white to-brand-orange/5 flex items-center justify-center px-6 py-12" data-testid="arthverse-auth-page">
      <Card className="w-full max-w-2xl p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl" data-testid="arthverse-auth-card">
        <div className="mb-8 text-center">
          <div className="font-heading text-3xl font-bold mb-2">
            <span className="text-brand-blue">a</span>
            <span className="text-brand-orange">₹</span>
            <span className="text-brand-blue">th-verse</span>
            <span className="text-brand-orange">.in</span>
          </div>
          <p className="text-slate-600 font-body">Universe Where Every Rupee Finds Its Place.</p>
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

              <div data-testid="password-signup-container">
                <Label htmlFor="password_signup" className="font-semibold">Password *</Label>
                <Input
                  id="password_signup"
                  data-testid="password-signup-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-testid="age-container">
                  <Label htmlFor="age" className="font-semibold">Age *</Label>
                  <Input
                    id="age"
                    data-testid="age-input"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-testid="marital-status-container">
                  <Label className="font-semibold">Marital Status *</Label>
                  <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value })} required>
                    <SelectTrigger className="mt-1 h-12 bg-slate-50" data-testid="marital-status-select">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div data-testid="dependents-container">
                  <Label htmlFor="no_of_dependents" className="font-semibold">No of Dependents *</Label>
                  <Input
                    id="no_of_dependents"
                    data-testid="dependents-input"
                    type="number"
                    min="0"
                    value={formData.no_of_dependents}
                    onChange={(e) => setFormData({ ...formData, no_of_dependents: e.target.value })}
                    required
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                  />
                </div>
              </div>

              <div data-testid="monthly-income-container">
                <Label htmlFor="monthly_income" className="font-semibold">Monthly Income (₹)</Label>
                <Input
                  id="monthly_income"
                  data-testid="monthly-income-input"
                  type="number"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
                />
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
    </div>
  );
}
