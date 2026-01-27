import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { TrendingUp, Shield, Landmark, PiggyBank, Banknote, IndianRupee, LogOut, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ArthVersePortal({ token, user, onLogout }) {
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchNetWorth();
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

  const fetchNetWorth = async () => {
    try {
      const response = await axios.get(`${API}/reports/balance-sheet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNetWorth(response.data.net_worth || 0);
    } catch (error) {
      // User might not have completed questionnaire yet
      console.log('Balance sheet not available');
    }
  };

  const apps = [
    {
      name: 'VYAY',
      logo: '/logo-vyay.png',
      tagline: '"Your balance sheet. Your life."',
      description: 'Personal Finance Management',
      icon: TrendingUp,
      color: 'blue',
      link: '/arthvyay/dashboard',
      available: true
    },
    {
      name: 'RAKSHAK',
      logo: '/logo-rakshak.png',
      tagline: '"Your financial shield."',
      description: 'Insurance & Risk Coverage',
      icon: Shield,
      color: 'orange',
      link: '/arthrakshak/dashboard',
      available: true
    },
    {
      name: 'YOJNA',
      logo: '/logo-yojna.png',
      tagline: '"Plan with purpose."',
      description: 'Financial Planning',
      icon: Landmark,
      color: 'blue',
      link: '#',
      available: false
    },
    {
      name: 'NIVESH',
      logo: '/logo-nivesh.png',
      tagline: '"Invest with intent."',
      description: 'Investment Platform',
      icon: PiggyBank,
      color: 'orange',
      link: '#',
      available: false
    },
    {
      name: 'DHAN',
      logo: '/logo-dhan.png',
      tagline: '"Right debt, right time."',
      description: 'Loan Services',
      icon: Banknote,
      color: 'blue',
      link: '#',
      available: false
    },
    {
      name: 'UNNATI',
      logo: '/logo-unnati.png',
      tagline: '"Restoring wealth."',
      description: 'IEPF Services',
      icon: IndianRupee,
      color: 'orange',
      link: '#',
      available: false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="text-lg text-slate-600 font-body">Loading portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster" data-testid="arthverse-portal">
      {/* Navigation */}
      <nav className="border-b border-slate-200/50 glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <img 
                src="/arth-verse-logo.png" 
                alt="Arth-Verse Logo" 
                className="h-10 object-contain"
              />
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="text-right mr-4 hidden sm:block">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Client ID</p>
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

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold font-heading text-slate-900 tracking-tight" data-testid="welcome-message">
                Welcome back, {userData?.name?.split(' ')[0]}!
              </h1>
              <p className="text-slate-500 font-body">Universe for every rupee</p>
            </div>
          </div>
        </div>

        {/* Networth Card */}
        <Card className="mb-12 bg-brand-blue text-white p-8 lg:p-10 rounded-3xl shadow-floating border-0 animate-fade-in stagger-1 relative overflow-hidden" data-testid="networth-card">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid-pattern"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-white/70 text-sm uppercase tracking-wider font-medium mb-2">Your Net Worth</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl lg:text-6xl font-semibold font-heading tracking-tight" data-testid="networth-value">
                  ₹{netWorth.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-white/60 text-sm mt-3">Synced across all your apps</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Age</p>
                <p className="text-3xl font-semibold">{userData?.age || '-'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Apps Grid */}
        <div className="animate-fade-in stagger-2">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-brand-orange font-semibold">Your Products</span>
            <h2 className="text-2xl font-semibold font-heading text-slate-900 mt-1" data-testid="apps-section-title">
              Financial Apps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, idx) => {
              const Icon = app.icon;
              const isBlue = app.color === 'blue';
              
              return (
                <Card 
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all duration-300 card-hover ${
                    app.available 
                      ? `bg-white border-slate-200 hover:border-${isBlue ? 'brand-blue' : 'brand-orange'} shadow-card hover:shadow-floating cursor-pointer group`
                      : 'bg-slate-50 border-slate-200 cursor-not-allowed'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  data-testid={`app-card-${app.name.toLowerCase()}`}
                >
                  {app.available ? (
                    <Link to={app.link} className="block h-full">
                      <div className={`w-12 h-12 rounded-xl ${isBlue ? 'bg-brand-blue' : 'bg-brand-orange'} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="mb-3">
                        <img 
                          src={app.logo} 
                          alt={`Arth-${app.name}`}
                          className="h-14 object-contain"
                        />
                      </div>
                      <p className={`text-sm font-medium mb-2 ${isBlue ? 'text-brand-orange' : 'text-brand-blue'}`}>
                        {app.tagline}
                      </p>
                      <p className="text-slate-600 font-body text-sm leading-relaxed">{app.description}</p>
                      <div className="mt-5 inline-flex items-center text-sm font-semibold text-brand-blue group-hover:translate-x-1 transition-transform">
                        Open App 
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </div>
                    </Link>
                  ) : (
                    <div className="h-full opacity-50">
                      <div className="w-12 h-12 rounded-xl bg-slate-300 flex items-center justify-center mb-5">
                        <Icon className="w-6 h-6 text-slate-500" strokeWidth={1.5} />
                      </div>
                      <div className="mb-3">
                        <img 
                          src={app.logo} 
                          alt={`Arth-${app.name}`}
                          className="h-14 object-contain grayscale"
                        />
                      </div>
                      <p className="text-sm font-medium mb-2 text-slate-400">
                        {app.tagline}
                      </p>
                      <p className="text-slate-400 font-body text-sm">{app.description}</p>
                      <div className="mt-5 inline-flex items-center text-sm font-medium text-slate-400">
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
