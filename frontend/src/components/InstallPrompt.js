import { useEffect, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';

/**
 * PWA Install Prompt
 * - Android/Chrome: uses `beforeinstallprompt` event
 * - iOS Safari: shows manual instructions (no event API on iOS)
 * - Dismissable forever via localStorage flag
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) return; // already installed

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Android / Chrome prompt capture
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 2500);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS manual prompt (show after 10s delay the first time)
    if (ios) {
      setTimeout(() => setShow(true), 10000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        localStorage.setItem('pwa_install_dismissed', '1');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_install_dismissed', '1');
  };

  if (!show || isStandalone) return null;

  return (
    <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500" data-testid="pwa-install-prompt">
      <div className="rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-800 text-white p-4 shadow-2xl border border-white/10">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
          aria-label="Dismiss"
          data-testid="install-dismiss-btn"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Install ArthVyay</p>
            {isIOS ? (
              <p className="text-[11px] text-white/85 mt-1 flex items-center gap-1 flex-wrap">
                Tap <Share2 className="w-3 h-3 inline" /> then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-[11px] text-white/85 mt-1">
                Get the full-screen app experience — one tap from your home screen
              </p>
            )}
          </div>
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-shrink-0 bg-white text-brand-blue text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-100"
              data-testid="install-btn"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
