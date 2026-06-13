import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import LockScreen from "./src/screens/LockScreen";
import RfqListScreen from "./src/screens/RfqListScreen";
import RfqDetailScreen from "./src/screens/RfqDetailScreen";

// Minimal route state: the signed-in stack is just list ↔ detail, so a
// dedicated navigation library would be overkill for this skeleton.
function SignedInStack() {
  const [openRfqId, setOpenRfqId] = useState<string | null>(null);
  return openRfqId ? (
    <RfqDetailScreen id={openRfqId} onBack={() => setOpenRfqId(null)} />
  ) : (
    <RfqListScreen onOpen={setOpenRfqId} />
  );
}

function Root() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }
  if (status === "signedOut") return <LoginScreen />;
  if (status === "locked") return <LockScreen />;
  return <SignedInStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
