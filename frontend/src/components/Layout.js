import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { LayoutDashboard, Receipt, FileText, LogOut } from 'lucide-react';

export default function Layout({ children, token, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" data-testid="layout">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50" data-testid="main-nav">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="font-heading text-2xl font-bold" data-testid="logo-link">
                <span className="text-brand-blue">a</span>
                <span className="text-brand-orange">₹</span>
                <span className="text-brand-blue">thvyay</span>
              </Link>
              
              <div className="hidden md:flex gap-2" data-testid="nav-links">
                <Link to="/dashboard" data-testid="nav-dashboard-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full ${
                      isActive('/dashboard') 
                        ? 'bg-brand-blue/10 text-brand-blue' 
                        : 'text-slate-600 hover:text-brand-blue hover:bg-brand-blue/5'
                    }`}
                    data-testid="nav-dashboard-btn"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                
                <Link to="/transactions" data-testid="nav-transactions-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full ${
                      isActive('/transactions') 
                        ? 'bg-brand-blue/10 text-brand-blue' 
                        : 'text-slate-600 hover:text-brand-blue hover:bg-brand-blue/5'
                    }`}
                    data-testid="nav-transactions-btn"
                  >
                    <Receipt className="mr-2 h-4 w-4" /> Transactions
                  </Button>
                </Link>
                
                <Link to="/reports" data-testid="nav-reports-link">
                  <Button 
                    variant="ghost"
                    className={`rounded-full ${
                      isActive('/reports') 
                        ? 'bg-brand-blue/10 text-brand-blue' 
                        : 'text-slate-600 hover:text-brand-blue hover:bg-brand-blue/5'
                    }`}
                    data-testid="nav-reports-btn"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Reports
                  </Button>
                </Link>
              </div>
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
      </nav>

      <main data-testid="main-content">{children}</main>
    </div>
  );
}
