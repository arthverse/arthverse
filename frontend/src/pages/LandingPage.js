import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, BarChart3, Shield, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="font-heading text-2xl font-bold">
              <span className="text-brand-blue">a</span>
              <span className="text-brand-orange">₹</span>
              <span className="text-brand-blue">th</span>
              <span className="text-brand-orange">vyay</span>
            </div>
          </div>
          <Link to="/auth" data-testid="nav-login-btn">
            <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full px-6 font-semibold" data-testid="header-get-started-btn">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-6" data-testid="landing-hero-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="col-span-full md:col-span-8" data-testid="hero-content">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none font-heading text-slate-900 mb-6">
                Your balance sheet. <br />
                <span className="text-brand-blue">Your life.</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-slate-600 font-body mb-8 max-w-2xl">
                Track expenses, auto-generate P&L statements, and get AI-powered insights to improve your financial health.
              </p>
              <Link to="/auth" data-testid="hero-cta-link">
                <Button 
                  className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-brand-blue/25 transition-all group tracing-beam"
                  data-testid="hero-get-started-btn"
                >
                  Start Tracking Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="col-span-full md:col-span-4" data-testid="hero-image-container">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1765648763990-ad0ee9b546c9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2lhbCUyMHN1Y2Nlc3MlMjBsYXB0b3B8ZW58MHx8fHwxNzY3ODYwMzkwfDA&ixlib=rb-4.1.0&q=85"
                  alt="Young professional managing finances"
                  className="w-full h-full object-cover"
                  data-testid="hero-main-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-6 bg-slate-50" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight font-heading text-center mb-12">
            Everything you need for <span className="text-brand-blue">financial clarity</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="col-span-full md:col-span-4 bg-white rounded-2xl p-8 border border-slate-100 hover:-translate-y-1 transition-transform duration-300" data-testid="feature-expense-tracking">
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-2xl font-medium font-heading mb-3">Smart Expense Tracking</h3>
              <p className="text-base leading-relaxed text-slate-600 font-body">
                AI-powered categorization makes tracking expenses effortless. Add transactions and let our system do the rest.
              </p>
            </div>

            <div className="col-span-full md:col-span-4 bg-white rounded-2xl p-8 border border-slate-100 hover:-translate-y-1 transition-transform duration-300" data-testid="feature-financial-reports">
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-medium font-heading mb-3">Auto P&L & Balance Sheet</h3>
              <p className="text-base leading-relaxed text-slate-600 font-body">
                Get professional financial statements generated automatically from your transactions.
              </p>
            </div>

            <div className="col-span-full md:col-span-4 bg-white rounded-2xl p-8 border border-slate-100 hover:-translate-y-1 transition-transform duration-300" data-testid="feature-health-score">
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-2xl font-medium font-heading mb-3">Financial Health Score</h3>
              <p className="text-base leading-relaxed text-slate-600 font-body">
                Know your financial health at a glance with personalized insights and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-gradient-to-br from-brand-blue to-brand-blue/80" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-white/90 font-body mb-8">
            Join thousands of users managing their financial health with Arthvyay.
          </p>
          <Link to="/auth" data-testid="cta-get-started-link">
            <Button 
              className="bg-white text-brand-blue hover:bg-slate-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg"
              data-testid="cta-get-started-btn"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      <footer className="bg-slate-900 text-white py-12 px-6" data-testid="footer">
        <div className="max-w-7xl mx-auto text-center">
          <div className="font-heading text-2xl font-bold mb-4">
            <span className="text-brand-blue">a</span>
            <span className="text-brand-orange">₹</span>
            <span className="text-white">thvyay</span>
          </div>
          <p className="text-slate-400 font-body">Your balance sheet. Your life.</p>
          <p className="text-slate-500 text-sm mt-6">© 2025 Arthvyay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
