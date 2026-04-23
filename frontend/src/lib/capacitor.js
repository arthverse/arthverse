/**
 * Capacitor native bridge helpers.
 *
 * These are safe to import from any component — they detect whether we're
 * running inside the native app wrapper and become no-ops on the web.
 *
 * Usage:
 *   import { initCapacitor, triggerHaptic } from './lib/capacitor';
 *   useEffect(() => { initCapacitor(); }, []);
 */

let _Capacitor = null;

async function getCapacitor() {
  if (_Capacitor) return _Capacitor;
  try {
    const mod = await import('@capacitor/core');
    _Capacitor = mod.Capacitor;
    return _Capacitor;
  } catch {
    return null;
  }
}

export async function isNative() {
  const cap = await getCapacitor();
  return cap ? cap.isNativePlatform() : false;
}

export async function initCapacitor() {
  const cap = await getCapacitor();
  if (!cap || !cap.isNativePlatform()) return;

  try {
    // Hide the splash screen after the React app is ready
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch { /* ignore */ }

  try {
    // Style the native status bar to match brand
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1e3a8a' });
  } catch { /* ignore */ }

  try {
    // Wire Android back button to router history
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch { /* ignore */ }
}

/**
 * Trigger a light haptic tap on native devices. No-op on web.
 * Use sparingly on key actions (Auto-Apply, Save Transactions, etc).
 */
export async function triggerHaptic(style = 'light') {
  try {
    const cap = await getCapacitor();
    if (!cap || !cap.isNativePlatform()) return;
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const s = style === 'heavy' ? ImpactStyle.Heavy : style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
    await Haptics.impact({ style: s });
  } catch { /* ignore */ }
}
