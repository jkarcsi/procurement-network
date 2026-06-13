import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// Show push notifications while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const devicePlatform = Platform.OS;

// Requests permission and returns this device's Expo push token, or null if
// permission is denied or the token can't be obtained (e.g. Expo Go without a
// projectId, simulators). Never throws.
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Procura",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.granted;
    }
    if (!granted) return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const result = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return result.data;
  } catch (err) {
    console.warn("push registration failed:", err);
    return null;
  }
}
