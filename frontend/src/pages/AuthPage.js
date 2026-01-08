import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthPage({ onAuth }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    monthly_income: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      onAuth(response.data.token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-white to-brand-orange/5 flex items-center justify-center px-6" data-testid="auth-page">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl" data-testid="auth-card">
        <div className="mb-8 text-center">
          <div className="font-heading text-3xl font-bold mb-2">
            <span className="text-brand-blue">a</span>
            <span className="text-brand-orange">₹</span>
            <span className="text-brand-blue">th</span>
            <span className="text-brand-orange">vyay</span>
          </div>
          <p className="text-slate-600 font-body">Your balance sheet. Your life.</p>
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

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
          {!isLogin && (
            <div data-testid="name-input-container">
              <Label htmlFor="name" className="font-semibold">Name</Label>
              <Input
                id="name"
                data-testid="name-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
              />
            </div>
          )}

          <div data-testid="email-input-container">
            <Label htmlFor="email" className="font-semibold">Email</Label>
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

          <div data-testid="password-input-container">
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

          {!isLogin && (
            <div data-testid="monthly-income-input-container">
              <Label htmlFor="monthly_income" className="font-semibold">Monthly Income (₹)</Label>
              <Input
                id="monthly_income"
                data-testid="monthly-income-input"
                type="number"
                value={formData.monthly_income}
                onChange={(e) => setFormData({ ...formData, monthly_income: parseFloat(e.target.value) })}
                className="mt-1 h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue rounded-xl"
              />
            </div>
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