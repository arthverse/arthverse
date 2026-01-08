import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { TrendingUp, Shield, Landmark, PiggyBank, Banknote, CircleDollarSign, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ArthVersePortal({ token, user, onLogout }) {
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const apps = [
    {
      name: 'Arthvyay',
      tagline: '"Your balance sheet. Your life."',
      description: 'Personal Finance Management',
      icon: TrendingUp,
      color: 'blue',
      link: '/arthvyay/dashboard',
      available: true,
      logoUrl: 'https://customer-assets.emergentagent.com/job_8d545a45-b9a1-43e1-a407-4b746a401ef7/artifacts/xkf0jjlw_image.png'
    },
    {
      name: 'Arthrakshak',
      tagline: '"Your financial shield."',
      description: 'Insurance Aggregator',
      icon: Shield,
      color: 'orange',
      link: '#',
      available: false,
      logoUrl: 'https://customer-assets.emergentagent.com/job_8d545a45-b9a1-43e1-a407-4b746a401ef7/artifacts/b80clgwt_image.png'
    },
    {
      name: 'ArthYojna',
      tagline: '"Plan with purpose."',
      description: 'Financial Planning',
      icon: Landmark,
      color: 'blue',
      link: '#',
      available: false,
      logoUrl: 'https://customer-assets.emergentagent.com/job_8d545a45-b9a1-43e1-a407-4b746a401ef7/artifacts/oy6psxie_image.png'
    },
    {
      name: 'ArthNivesh',
      tagline: '"Invest with intent."',
      description: 'Investment Platform',
      icon: PiggyBank,
      color: 'orange',
      link: '#',
      available: false,
      logoUrl: 'https://customer-assets.emergentagent.com/job_8d545a45-b9a1-43e1-a407-4b746a401ef7/artifacts/j5ar06cr_image.png'
    },
    {
      name: 'ArthDhan',
      tagline: '"Right debt, right time."',
      description: 'Loan Services',
      icon: Banknote,
      color: 'blue',
      link: '#',
      available: false,
      logoUrl: 'https://customer-assets.emergentagent.com/job_8d545a45-b9a1-43e1-a407-4b746a401ef7/artifacts/ubdv403d_image.png'
    },
    {
      name: 'ArthUnnati',
      tagline: '"Restoring wealth."',
      description: 'IEPF Services',
      icon: CircleDollarSign,
      color: 'orange',
      link: '#',
      available: false,
      logoUrl: 'https://customer-assets.emergentagent.com/job_8d545a45-b9a1-43e1-a407-4b746a401ef7/artifacts/w9yhnupf_image.png'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" data-testid="arthverse-portal">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="font-heading text-2xl font-bold">
              <span className="text-brand-blue">a</span>
              <span className="text-brand-orange">₹</span>
              <span className="text-brand-blue">th-verse</span>
              <span className="text-brand-orange">.in</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-slate-500">Client ID</p>
                <p className="font-mono font-semibold text-brand-blue">{userData?.client_id}</p>
              </div>
              <Button 
                onClick={onLogout}
                variant="ghost"
                className="text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                data-testid="logout-btn"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-slate-900" data-testid="welcome-message">
                Welcome, {userData?.name}!
              </h1>
              <p className="text-slate-600 font-body">Your financial universe awaits</p>
            </div>
          </div>
        </div>

        {/* Networth Card */}
        <Card className="mb-12 bg-gradient-to-br from-brand-blue to-blue-600 text-white p-8 rounded-3xl shadow-2xl border-0" data-testid="networth-card">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-white/80 text-lg font-body mb-2">Your Net Worth</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold font-mono" data-testid="networth-value">₹{userData?.networth?.toLocaleString() || 0}</span>
              </div>
              <p className="text-white/70 text-sm mt-2">Updated in real-time across all apps</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-white/80 text-sm">Age</p>
                <p className="text-2xl font-bold">{userData?.age}</p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm">Dependents</p>
                <p className="text-2xl font-bold">{userData?.no_of_dependents}</p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm">City</p>
                <p className="text-lg font-semibold">{userData?.city}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Apps Grid */}
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6" data-testid="apps-section-title">
            Your Financial Apps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, idx) => {
              const Icon = app.icon;
              const isBlue = app.color === 'blue';
              
              return (
                <Card 
                  key={idx}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    app.available 
                      ? `${isBlue ? 'border-brand-blue/30 hover:border-brand-blue hover:shadow-xl cursor-pointer' : 'border-brand-orange/30 hover:border-brand-orange hover:shadow-xl cursor-pointer'}`
                      : 'border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                  data-testid={`app-card-${app.name.toLowerCase()}`}
                >
                  {app.available ? (
                    <Link to={app.link} className="block h-full">
                      <div className={`w-14 h-14 rounded-2xl ${isBlue ? 'bg-gradient-to-br from-brand-blue to-blue-600' : 'bg-gradient-to-br from-brand-orange to-orange-600'} flex items-center justify-center mb-4`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="mb-1">
                        <img 
                          src={app.logoUrl} 
                          alt={app.name}
                          className="h-12 object-contain"
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                      <p className={`text-sm font-semibold mb-2 ${isBlue ? 'text-brand-orange' : 'text-brand-blue'}`}>
                        {app.tagline}
                      </p>
                      <p className="text-slate-600 font-body text-sm">{app.description}</p>
                      <div className="mt-4 inline-flex items-center text-sm font-semibold text-brand-blue">
                        Open App →
                      </div>
                    </Link>
                  ) : (
                    <div className="h-full">
                      <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="mb-1">
                        <img 
                          src={app.logoUrl} 
                          alt={app.name}
                          className="h-12 object-contain opacity-40"
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                      <p className="text-sm font-semibold mb-2 text-slate-400">
                        {app.tagline}
                      </p>
                      <p className="text-slate-400 font-body text-sm">{app.description}</p>
                      <div className="mt-4 inline-flex items-center text-sm font-semibold text-slate-400">
                        Coming Soon
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
