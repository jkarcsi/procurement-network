import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "./src/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import LockScreen from "./src/screens/LockScreen";
import RfqListScreen from "./src/screens/RfqListScreen";
import RfqDetailScreen from "./src/screens/RfqDetailScreen";
import NewRfqScreen from "./src/screens/NewRfqScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import CreditsScreen from "./src/screens/CreditsScreen";
import SupplierInvitesScreen from "./src/screens/SupplierInvitesScreen";
import SupplierInviteDetailScreen from "./src/screens/SupplierInviteDetailScreen";
import SupplierOpportunitiesScreen from "./src/screens/SupplierOpportunitiesScreen";
import AccountScreen from "./src/screens/AccountScreen";
import type { Invite } from "./src/api";

type TabKey = "rfqs" | "opportunities" | "notifications" | "credits" | "account";
type RfqView = { mode: "list" } | { mode: "detail"; id: string } | { mode: "new" };

// Maps a notification's linkUrl (e.g. "/rfq/abc") to an in-app destination.
function linkToRfqId(link: unknown): string | null {
  return typeof link === "string" && link.startsWith("/rfq/") ? link.slice("/rfq/".length) : null;
}

// Buyer's RFQ tab: list ↔ detail ↔ new stack.
function RfqTab({
  pendingRfqId,
  onConsumePending,
}: {
  pendingRfqId: string | null;
  onConsumePending: () => void;
}) {
  const [view, setView] = useState<RfqView>({ mode: "list" });
  useEffect(() => {
    if (pendingRfqId) {
      setView({ mode: "detail", id: pendingRfqId });
      onConsumePending();
    }
  }, [pendingRfqId, onConsumePending]);
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

// Supplier's tab: invite list ↔ invite detail (with offer form).
function SupplierTab() {
  const [open, setOpen] = useState<Invite | null>(null);
  // `key` forces the list to remount (and reload) after submitting an offer.
  const [reloadKey, setReloadKey] = useState(0);
  if (open) {
    return (
      <SupplierInviteDetailScreen
        invite={open}
        onBack={() => setOpen(null)}
        onSubmitted={() => {
          setOpen(null);
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }
  return <SupplierInvitesScreen key={reloadKey} onOpen={setOpen} />;
}

function SignedInApp() {
  const { user } = useAuth();
  const isBuyer = user?.role === "BUYER";
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "rfqs", label: isBuyer ? "Ajánlatkérések" : "Megkeresések", icon: "📋" },
    ...(isBuyer ? [] : [{ key: "opportunities" as const, label: "Lehetőségek", icon: "🔎" }]),
    { key: "notifications", label: "Értesítések", icon: "🔔" },
    ...(isBuyer ? [{ key: "credits" as const, label: "Kreditek", icon: "🪙" }] : []),
    { key: "account", label: "Fiók", icon: "👤" },
  ];
  const [tab, setTab] = useState<TabKey>("rfqs");
  const [pendingRfqId, setPendingRfqId] = useState<string | null>(null);

  // Tap on a push → route to the relevant screen. Buyer RFQ links open the
  // detail; everything else lands on the notifications list.
  useEffect(() => {
    function route(link: unknown) {
      const rfqId = linkToRfqId(link);
      if (rfqId && isBuyer) {
        setTab("rfqs");
        setPendingRfqId(rfqId);
      } else {
        setTab("notifications");
      }
    }
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) route(response.notification.request.content.data?.linkUrl);
    });
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      route(response.notification.request.content.data?.linkUrl);
    });
    return () => sub.remove();
  }, [isBuyer]);

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        {tab === "rfqs" &&
          (isBuyer ? (
            <RfqTab pendingRfqId={pendingRfqId} onConsumePending={() => setPendingRfqId(null)} />
          ) : (
            <SupplierTab />
          ))}
        {tab === "opportunities" && <SupplierOpportunitiesScreen />}
        {tab === "notifications" && <NotificationsScreen />}
        {tab === "credits" && <CreditsScreen />}
        {tab === "account" && <AccountScreen />}
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
