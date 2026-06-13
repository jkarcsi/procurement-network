import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import LockScreen from "./src/screens/LockScreen";
import RfqListScreen from "./src/screens/RfqListScreen";
import RfqDetailScreen from "./src/screens/RfqDetailScreen";
import NewRfqScreen from "./src/screens/NewRfqScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import CreditsScreen from "./src/screens/CreditsScreen";

type TabKey = "rfqs" | "notifications" | "credits";
type RfqView = { mode: "list" } | { mode: "detail"; id: string } | { mode: "new" };

// The RFQ tab is itself a tiny list ↔ detail ↔ new stack.
function RfqTab() {
  const [view, setView] = useState<RfqView>({ mode: "list" });
  if (view.mode === "detail") {
    return <RfqDetailScreen id={view.id} onBack={() => setView({ mode: "list" })} />;
  }
  if (view.mode === "new") {
    return (
      <NewRfqScreen onDone={() => setView({ mode: "list" })} onCancel={() => setView({ mode: "list" })} />
    );
  }
  return (
    <RfqListScreen
      onOpen={(id) => setView({ mode: "detail", id })}
      onNew={() => setView({ mode: "new" })}
    />
  );
}

function SignedInApp() {
  const { user } = useAuth();
  const isBuyer = user?.role === "BUYER";
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "rfqs", label: isBuyer ? "Ajánlatkérések" : "Megkeresések", icon: "📋" },
    { key: "notifications", label: "Értesítések", icon: "🔔" },
    ...(isBuyer ? [{ key: "credits" as const, label: "Kreditek", icon: "🪙" }] : []),
  ];
  const [tab, setTab] = useState<TabKey>("rfqs");

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        {tab === "rfqs" && <RfqTab />}
        {tab === "notifications" && <NotificationsScreen />}
        {tab === "credits" && <CreditsScreen />}
      </View>
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
  return <SignedInApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.flex}>
        <Root />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  tabBar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  tabLabelActive: { color: "#4f46e5", fontWeight: "600" },
});
