import Constants from "expo-constants";

// API base URL comes from app.json `extra.apiBaseUrl`; point it at the
// deployed Procura instance for a real build.
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:3000";
