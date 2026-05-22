const isBrowser = typeof window !== 'undefined';

export async function isBiometricAvailable() {
  if (!isBrowser) return false;

  try {
    const Capacitor = (window as any).Capacitor;
    if (!Capacitor) return false;

    const biometrics = Capacitor.Plugins?.Biometrics ?? Capacitor.Plugins?.TouchID ?? Capacitor.Plugins?.Fingerprint;
    if (biometrics?.isAvailable) {
      const result = await biometrics.isAvailable();
      return Boolean(result?.available ?? result?.isAvailable ?? result);
    }

    return false;
  } catch (error) {
    console.warn('Biometric availability check failed', error);
    return false;
  }
}

export async function promptBiometricAuth() {
  if (!isBrowser) return false;

  try {
    const Capacitor = (window as any).Capacitor;
    if (!Capacitor) return false;

    const biometrics = Capacitor.Plugins?.Biometrics ?? Capacitor.Plugins?.TouchID ?? Capacitor.Plugins?.Fingerprint;
    if (biometrics?.authenticate) {
      const response = await biometrics.authenticate({ reason: 'Verify identity for PFOS security settings' });
      return Boolean(response?.verified ?? response?.success ?? response);
    }

    return false;
  } catch (error) {
    console.warn('Biometric authentication failed', error);
    return false;
  }
}

export async function clearBiometricEnrollment() {
  if (!isBrowser) return false;

  try {
    const Capacitor = (window as any).Capacitor;
    const biometrics = Capacitor?.Plugins?.Biometrics ?? Capacitor?.Plugins?.TouchID ?? Capacitor?.Plugins?.Fingerprint;
    if (biometrics?.clear) {
      await biometrics.clear();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Clearing biometric enrollment failed', error);
    return false;
  }
}

export default { isBiometricAvailable, promptBiometricAuth, clearBiometricEnrollment };