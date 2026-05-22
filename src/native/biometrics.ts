export async function isBiometricAvailable() {
  return false;
}

export async function promptBiometricAuth() {
  return false;
}

export async function clearBiometricEnrollment() {
  return false;
}

export default { isBiometricAvailable, promptBiometricAuth, clearBiometricEnrollment };