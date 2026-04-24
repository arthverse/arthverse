import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { LayoutDashboard, Receipt, FileText, LogOut, ArrowLeft, Sparkles, Settings as SettingsIcon } from 'lucide-react';

export default function Layout({ children, token, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-alabaster" data-testid="layout">
      <nav className="border-b border-slate-200/50 glass-effect sticky top-0 z-50" data-testid="main-nav">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/arthverse/portal" className="flex items-center gap-2 text-slate-500 hover:text-brand-blue transition-colors" data-testid="back-to-portal">
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Portal</span>
              </Link>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <Link to="/arthvyay/dashboard" className="flex items-center" data-testid="logo-link">
                <img 
                  src="/logo-vyay.png" 
                  alt="ArthVyay Logo" 
                  className="h-8 object-contain"
                />
              </Link>
              
              <div className="hidden md:flex gap-1" data-testid="nav-links">
                <Link to="/arthvyay/dashboard" data-testid="nav-dashboard-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full px-4 ${
                      isActive('/arthvyay/dashboard') 
                        ? 'bg-brand-blue text-white hover:bg-brand-blue' 
                        : 'text-slate-600 hover:text-brand-blue hover:bg-slate-100'
                    }`}
                    data-testid="nav-dashboard-btn"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" strokeWidth={1.5} /> Dashboard
                  </Button>
                </Link>
                
                <Link to="/arthvyay/transactions" data-testid="nav-transactions-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full px-4 ${
                      isActive('/arthvyay/transactions') 
                        ? 'bg-brand-blue text-white hover:bg-brand-blue' 
                        : 'text-slate-600 hover:text-brand-blue hover:bg-slate-100'
                    }`}
                    data-testid="nav-transactions-btn"
                  >
                    <Receipt className="mr-2 h-4 w-4" strokeWidth={1.5} /> Transactions
                  </Button>
                </Link>
                
                <Link to="/arthvyay/reports" data-testid="nav-reports-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full px-4 ${
                      isActive('/arthvyay/reports') 
                        ? 'bg-brand-blue text-white hover:bg-brand-blue' 
                        : 'text-slate-600 hover:text-brand-blue hover:bg-slate-100'
                    }`}
                    data-testid="nav-reports-btn"
                  >
                    <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} /> Reports
                  </Button>
                </Link>

                <Link to="/arthvyay/smart-import" data-testid="nav-smart-import-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full px-4 ${
                      isActive('/arthvyay/smart-import') 
                        ? 'bg-brand-orange text-white hover:bg-brand-orange' 
                        : 'text-slate-600 hover:text-brand-orange hover:bg-orange-50'
                    }`}
                    data-testid="nav-smart-import-btn"
                  >
                    <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} /> Smart Import
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/settings" data-testid="nav-settings-link">
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-full"
                  data-testid="nav-settings-btn"
                >
                  <SettingsIcon className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </Link>
              <Button 
                onClick={onLogout}
                variant="ghost"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                data-testid="logout-btn"
              >
                <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main data-testid="main-content">{children}</main>
    </div>
  );
}
