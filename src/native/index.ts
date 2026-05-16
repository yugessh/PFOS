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

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

async function loadCapacitor(): Promise<any | null> {
  if (!isBrowser) return null;
  const globalCap = (window as any).Capacitor;
  if (globalCap) return globalCap;

  try {
    const cap = await import('@capacitor/core');
    return cap?.Capacitor ?? null;
  } catch {
    return null;
  }
}

export async function isNativePlatform(): Promise<boolean> {
  const Capacitor = await loadCapacitor();
  return !!Capacitor?.isNativePlatform?.();
}

export async function getCapacitorPlatform(): Promise<string | null> {
  const Capacitor = await loadCapacitor();
  return Capacitor?.getPlatform?.() ?? null;
}

export async function isCapacitorAndroid(): Promise<boolean> {
  const Capacitor = await loadCapacitor();
  return !!Capacitor?.isNativePlatform?.() && Capacitor?.getPlatform?.() === 'android';
}

export function isCapacitorAndroidSync(): boolean {
  if (!isBrowser) return false;
  const Capacitor = (window as any).Capacitor;
  return !!Capacitor?.isNativePlatform?.() && Capacitor?.getPlatform?.() === 'android';
}

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

export default { initNativeBridge, getBridge, isNativePlatform, getCapacitorPlatform, isCapacitorAndroid, isCapacitorAndroidSync };
