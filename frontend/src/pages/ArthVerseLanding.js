import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield, TrendingUp, PiggyBank, Banknote, Landmark, CircleDollarSign } from 'lucide-react';

export default function ArthVerseLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="font-heading text-2xl font-bold">
              <span className="text-brand-blue">a</span>
              <span className="text-brand-orange">₹</span>
              <span className="text-brand-blue">th-verse</span>
              <span className="text-brand-orange">.in</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/arthverse/auth?mode=login" data-testid="nav-login-btn">
              <Button variant="outline" className="rounded-full border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5" data-testid="header-login-btn">
                Login
              </Button>
            </Link>
            <Link to="/arthverse/auth?mode=signup" data-testid="nav-signup-btn">
              <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full px-6 font-semibold" data-testid="header-signup-btn">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-6" data-testid="arthverse-hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none font-heading text-slate-900 mb-6">
            <span className="text-brand-blue">arth-verse</span>
          </h1>
          <p className="text-2xl md:text-3xl text-brand-orange font-heading mb-8">
            "Universe Where Every Rupee Finds Its Place."
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-slate-600 font-body mb-12 max-w-3xl mx-auto">
            Your complete financial ecosystem - from expense tracking to investments, insurance to loans. All in one place.
          </p>
          <Link to="/arthverse/auth?mode=signup" data-testid="hero-cta-link">
            <Button 
              className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-full px-10 py-7 text-xl font-semibold shadow-2xl hover:shadow-brand-blue/25 transition-all"
              data-testid="hero-get-started-btn"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-16 px-6 bg-white/50" data-testid="apps-showcase">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight font-heading text-center mb-4">
            Six Powerful Financial Apps
          </h2>
          <p className="text-center text-slate-600 font-body mb-12">One Platform, Complete Financial Control</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-brand-blue/20 hover:border-brand-blue hover:shadow-xl transition-all duration-300" data-testid="app-arthvyay">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 text-brand-blue">Arthvyay</h3>
              <p className="text-sm text-brand-orange font-semibold mb-3">"Your balance sheet. Your life."</p>
              <p className="text-slate-600 font-body mb-4">
                Personal Finance Management - Track expenses, auto-generate P&L, get financial health scores
              </p>
              <div className="text-xs text-slate-500">For: Young professionals, Shop owners</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-brand-orange/20 hover:border-brand-orange hover:shadow-xl transition-all duration-300" data-testid="app-arthrakshak">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 text-brand-orange">Arthrakshak</h3>
              <p className="text-sm text-brand-blue font-semibold mb-3">"Your financial shield."</p>
              <p className="text-slate-600 font-body mb-4">
                Insurance Aggregator - Unified platform for all insurance needs with AI assistance
              </p>
              <div className="text-xs text-slate-500">For: Early earners, Self-employed</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-brand-blue/20 hover:border-brand-blue hover:shadow-xl transition-all duration-300" data-testid="app-arthyojna">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center mb-4">
                <Landmark className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 text-brand-blue">ArthYojna</h3>
              <p className="text-sm text-brand-orange font-semibold mb-3">"Plan with purpose."</p>
              <p className="text-slate-600 font-body mb-4">
                Financial Planning - Forecasting, goal-based planning, tax advisory, ITR filing
              </p>
              <div className="text-xs text-slate-500">For: Salaried professionals, Families</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-brand-orange/20 hover:border-brand-orange hover:shadow-xl transition-all duration-300" data-testid="app-arthnivesh">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center mb-4">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 text-brand-orange">ArthNivesh</h3>
              <p className="text-sm text-brand-blue font-semibold mb-3">"Invest with intent."</p>
              <p className="text-slate-600 font-body mb-4">
                Investment Platform - Mutual funds, stocks, PMS, IPOs, and fixed income instruments
              </p>
              <div className="text-xs text-slate-500">For: Working professionals, SMEs</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-brand-blue/20 hover:border-brand-blue hover:shadow-xl transition-all duration-300" data-testid="app-arthdhan">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center mb-4">
                <Banknote className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 text-brand-blue">ArthDhan</h3>
              <p className="text-sm text-brand-orange font-semibold mb-3">"Right debt, right time, right purpose."</p>
              <p className="text-slate-600 font-body mb-4">
                Loan Services - Business, personal loans, P2P lending, gold loans
              </p>
              <div className="text-xs text-slate-500">For: Salaried, SMEs, Traders</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-brand-orange/20 hover:border-brand-orange hover:shadow-xl transition-all duration-300" data-testid="app-arthunnati">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center mb-4">
                <CircleDollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 text-brand-orange">ArthUnnati</h3>
              <p className="text-sm text-brand-blue font-semibold mb-3">"Restoring wealth. Renewing trust."</p>
              <p className="text-slate-600 font-body mb-4">
                IEPF Services - Investment recovery, debt recovery, fraud support
              </p>
              <div className="text-xs text-slate-500">For: Professionals, Business owners</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-gradient-to-br from-brand-blue to-brand-blue/80" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">
            Ready to Transform Your Financial Journey?
          </h2>
          <p className="text-xl text-white/90 font-body mb-8">
            Join thousands managing their complete financial life on arth-verse
          </p>
          <Link to="/arthverse/auth?mode=signup" data-testid="cta-signup-link">
            <Button 
              className="bg-white text-brand-blue hover:bg-slate-50 rounded-full px-10 py-7 text-xl font-semibold shadow-lg"
              data-testid="cta-signup-btn"
            >
              Create Account Now
            </Button>
          </Link>
        </div>
      </div>

      <footer className="bg-slate-900 text-white py-12 px-6" data-testid="footer">
        <div className="max-w-7xl mx-auto text-center">
          <div className="font-heading text-2xl font-bold mb-4">
            <span className="text-brand-blue">a</span>
            <span className="text-brand-orange">₹</span>
            <span className="text-white">th-verse</span>
            <span className="text-brand-orange">.in</span>
          </div>
          <p className="text-slate-400 font-body">Universe Where Every Rupee Finds Its Place.</p>
          <p className="text-slate-500 text-sm mt-6">© 2025 ArthVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
