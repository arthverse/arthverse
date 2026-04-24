import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, FileText, Sparkles, Settings as SettingsIcon } from 'lucide-react';

/**
 * Bottom Tab Navigation — mobile only (hidden ≥ md).
 * Standard iOS/Android bottom bar pattern. Keeps the top Layout nav intact for desktop.
 */
export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  // Only show on arthvyay routes (authenticated app shell)
  if (!path.startsWith('/arthvyay') && path !== '/settings') return null;

  const tabs = [
    { label: 'Home', icon: LayoutDashboard, href: '/arthvyay/dashboard', testid: 'bottom-tab-home' },
    { label: 'Txns', icon: Receipt, href: '/arthvyay/transactions', testid: 'bottom-tab-txns' },
    { label: 'Import', icon: Sparkles, href: '/arthvyay/smart-import', testid: 'bottom-tab-import', accent: true },
    { label: 'Reports', icon: FileText, href: '/arthvyay/reports', testid: 'bottom-tab-reports' },
    { label: 'Settings', icon: SettingsIcon, href: '/settings', testid: 'bottom-tab-settings' },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden behind the bar */}
      <div className="md:hidden" style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }} aria-hidden="true" />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        data-testid="mobile-bottom-nav"
      >
        <div className="flex items-stretch justify-around h-16">
          {tabs.map((tab) => {
            const active = tab.href === path || (tab.href !== '/arthvyay/dashboard' && path.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
                data-testid={tab.testid}
              >
                {tab.accent ? (
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center -mt-3 shadow-lg transition-all ${
                    active
                      ? 'bg-gradient-to-br from-brand-orange to-amber-500 scale-105'
                      : 'bg-gradient-to-br from-brand-orange/90 to-amber-500/90'
                  }`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-colors ${active ? 'text-brand-blue' : 'text-slate-500'}`}
                    strokeWidth={active ? 2.3 : 1.8}
                  />
                )}
                <span className={`text-[10px] font-semibold transition-colors ${
                  active ? (tab.accent ? 'text-brand-orange' : 'text-brand-blue') : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>
                {active && !tab.accent && (
                  <span className="absolute top-1 w-1 h-1 rounded-full bg-brand-blue" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
