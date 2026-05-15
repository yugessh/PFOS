// Native bridge stubs for Capacitor — safe to import on web (guards used)
type CapacitorBridge = {
  init?: () => Promise<void>;
  showSplash?: () => Promise<void>;
  hideSplash?: () => Promise<void>;
  setStatusBarColor?: (color: string, style?: 'DARK'|'LIGHT') => Promise<void>;
  addBackButtonListener?: (cb: () => void) => (() => void);
  requestPushPermission?: () => Promise<boolean>;
  biometricAvailable?: () => Promise<boolean>;
  takePhoto?: () => Promise<string | null>;
};

const bridge: CapacitorBridge = {};

export async function initNativeBridge() {
  if (typeof window === 'undefined') return;
  try {
    const cap = await import('@capacitor/core');
    const { StatusBar, App, SplashScreen } = cap;
    bridge.init = async () => {
      try {
        await SplashScreen.hide();
      } catch {}
    };
    bridge.hideSplash = async () => {
      try { await SplashScreen.hide(); } catch {}
    };
    bridge.setStatusBarColor = async (color: string) => {
      try { await StatusBar.setBackgroundColor({ color }); } catch {}
    };
    bridge.addBackButtonListener = (cb: () => void) => {
      try {
        const handler = App.addListener('backButton', cb as any);
        return () => { handler.remove(); };
      } catch {
        return () => {};
      }
    };
  } catch (e) {
    // Not running in Capacitor environment — noop
  }
}

export function getBridge() {
  return bridge;
}

// Stubs for future features (push, biometric, local notifications, file export, camera)
export async function requestPushPermission() {
  // implement later with Capacitor Push Notifications plugin
  return false;
}

export async function biometricAvailable() {
  // implement later
  return false;
}

export async function takePhoto() {
  // implement later
  return null;
}

export default { initNativeBridge, getBridge };
