import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const TOKEN_KEY = "procura_session_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// True when the device has enrolled biometrics (Face ID / Touch ID / fingerprint).
export async function biometricsAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

// Prompts the device biometric check; falls back to the device passcode.
export async function authenticateBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Belépés a Procurába",
    cancelLabel: "Mégse",
    disableDeviceFallback: false,
  });
  return result.success;
}
