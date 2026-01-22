import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield, TrendingUp, PiggyBank, Banknote, Landmark, CircleDollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ArthVerseLanding() {
  const apps = [
    {
      name: 'VYAY',
      logo: '/logo-vyay.png',
      tagline: '"Your balance sheet. Your life."',
      description: 'Track expenses, auto-generate P&L, get your ArthSthithi score',
      icon: TrendingUp,
      color: 'blue',
      audience: 'Young professionals, Shop owners',
      features: ['Expense Tracking', 'P&L Reports', 'ArthSthithi']
    },
    {
      name: 'RAKSHAK',
      logo: '/logo-rakshak.png',
      tagline: '"Your financial shield."',
      description: 'Unified platform for all insurance needs with AI assistance',
      icon: Shield,
      color: 'orange',
      audience: 'Early earners, Self-employed',
      features: ['Policy Management', 'Gap Analysis', 'AI Recommendations']
    },
    {
      name: 'YOJNA',
      logo: '/logo-yojna.png',
      tagline: '"Plan with purpose."',
      description: 'Forecasting, goal-based planning, tax advisory, ITR filing',
      icon: Landmark,
      color: 'blue',
      audience: 'Salaried professionals, Families',
      features: ['Goal Planning', 'Tax Advisory', 'ITR Filing']
    },
    {
      name: 'NIVESH',
      logo: '/logo-nivesh.png',
      tagline: '"Invest with intent."',
      description: 'Mutual funds, stocks, PMS, IPOs, and fixed income instruments',
      icon: PiggyBank,
      color: 'orange',
      audience: 'Working professionals, SMEs',
      features: ['Mutual Funds', 'Stocks & IPOs', 'Fixed Income']
    },
    {
      name: 'DHAN',
      logo: '/logo-dhan.png',
      tagline: '"Right debt, right time."',
      description: 'Business, personal loans, P2P lending, gold loans',
      icon: Banknote,
      color: 'blue',
      audience: 'Salaried, SMEs, Traders',
      features: ['Business Loans', 'Personal Loans', 'P2P Lending']
    },
    {
      name: 'UNNATI',
      logo: '/logo-unnati.png',
      tagline: '"Restoring wealth."',
      description: 'Investment recovery, debt recovery, fraud support',
      icon: CircleDollarSign,
      color: 'orange',
      audience: 'Professionals, Business owners',
      features: ['IEPF Claims', 'Debt Recovery', 'Fraud Support']
    }
  ];

  return (
    <div className="min-h-screen bg-alabaster noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/arth-verse-logo.png" 
              alt="Arth-Verse Logo" 
              className="h-12 object-contain"
            />
          </Link>
          <div className="flex gap-3">
            <Link to="/arthverse/auth?mode=login" data-testid="nav-login-btn">
              <Button 
                variant="ghost" 
                className="text-slate-700 hover:text-brand-blue hover:bg-slate-100 rounded-full px-6 font-medium"
                data-testid="header-login-btn"
              >
                Login
              </Button>
            </Link>
            <Link to="/arthverse/auth?mode=signup" data-testid="nav-signup-btn">
              <Button 
                className="bg-brand-blue hover:bg-blue-800 text-white rounded-full px-6 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                data-testid="header-signup-btn"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-12" data-testid="arthverse-hero-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="animate-fade-in">
              <span className="inline-block text-xs uppercase tracking-widest text-brand-orange font-semibold mb-4">
                Your Complete Financial Ecosystem
              </span>
              <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight font-heading text-slate-900 mb-6 leading-tight">
                Universe for<br/>
                <span className="text-brand-blue">every rupee</span>
              </h1>
              <p className="text-xl text-slate-600 font-body mb-10 leading-relaxed max-w-lg">
                Six powerful financial apps, one unified platform. From expense tracking to investments, insurance to loans — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/arthverse/auth?mode=signup" data-testid="hero-cta-link">
                  <Button 
                    className="bg-brand-blue hover:bg-blue-800 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-floating hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    data-testid="hero-get-started-btn"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/arthverse/auth?mode=login">
                  <Button 
                    variant="outline"
                    className="border-2 border-slate-300 text-slate-700 hover:border-brand-blue hover:text-brand-blue rounded-full px-8 py-6 text-lg font-medium transition-all"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </div>
              {/* Trust Badges */}
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative animate-fade-in stagger-2">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-floating p-8 border border-slate-100">
                <img 
                  src="/arth-verse-logo.png" 
                  alt="Arth-Verse" 
                  className="w-full max-w-md mx-auto"
                />
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {apps.slice(0, 6).map((app, idx) => (
                    <div key={app.name} className="text-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <app.icon className={`w-6 h-6 mx-auto mb-2 ${app.color === 'blue' ? 'text-brand-blue' : 'text-brand-orange'}`} />
                      <span className="text-xs font-medium text-slate-600">{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apps Showcase Section */}
      <section className="py-24 px-6 lg:px-12 bg-white" data-testid="apps-showcase">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs uppercase tracking-widest text-brand-orange font-semibold mb-4">
              Our Products
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight font-heading text-slate-900 mb-4">
              Six Powerful Financial Apps
            </h2>
            <p className="text-xl text-slate-600 font-body max-w-2xl mx-auto">
              One platform, complete financial control. Each app designed for specific needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, index) => {
              const Icon = app.icon;
              const isBlue = app.color === 'blue';
              return (
                <div 
                  key={app.name}
                  className={`group bg-white rounded-2xl p-8 border border-slate-200 hover:border-${isBlue ? 'brand-blue' : 'brand-orange'} shadow-card hover:shadow-floating transition-all duration-300 card-hover animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`app-arth${app.name.toLowerCase()}`}
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${isBlue ? 'bg-brand-blue' : 'bg-brand-orange'} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  
                  {/* Logo */}
                  <div className="mb-4">
                    <img 
                      src={app.logo} 
                      alt={`Arth-${app.name}`} 
                      className="h-16 object-contain"
                    />
                  </div>
                  
                  {/* Tagline */}
                  <p className={`text-sm font-semibold mb-3 ${isBlue ? 'text-brand-orange' : 'text-brand-blue'}`}>
                    {app.tagline}
                  </p>
                  
                  {/* Description */}
                  <p className="text-slate-600 font-body mb-6 leading-relaxed">
                    {app.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {app.features.map(feature => (
                      <span 
                        key={feature}
                        className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* Audience */}
                  <p className="text-xs text-slate-400 mt-auto">
                    For: {app.audience}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-brand-blue relative overflow-hidden" data-testid="cta-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid-pattern"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight font-heading text-white mb-6">
            Ready to Transform Your<br/>Financial Journey?
          </h2>
          <p className="text-xl text-white/80 font-body mb-10 max-w-2xl mx-auto">
            Join thousands of users who are managing their complete financial life on Arth-Verse.
          </p>
          <Link to="/arthverse/auth?mode=signup" data-testid="cta-signup-link">
            <Button 
              className="bg-white text-brand-blue hover:bg-slate-50 rounded-full px-10 py-6 text-lg font-semibold shadow-floating hover:-translate-y-1 transition-all duration-300 group"
              data-testid="cta-signup-btn"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 lg:px-12" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <img 
                src="/arth-verse-logo.png" 
                alt="Arth-Verse Logo" 
                className="h-10 object-contain brightness-0 invert mb-3"
              />
              <p className="text-slate-400 font-body text-sm">Universe for every rupee</p>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">© 2025 Arth-Verse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
