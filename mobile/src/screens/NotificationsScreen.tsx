import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

const TYPE_ICON: Record<string, string> = {
  OFFER_RECEIVED: "📥",
  OFFER_ACCEPTED: "✅",
  RFQ_INVITE: "📨",
};

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<api.Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const result = await api.listNotifications(token);
      setItems(result.data);
    } catch {
      // keep stale list on error
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(async () => {
    if (!token) return;
    await api.markNotificationsRead(token);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [token]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Értesítések</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markRead}>
            <Text style={styles.markRead}>Mind olvasott ({unread})</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={!refreshing ? <Text style={styles.empty}>Még nincs értesítésed.</Text> : null}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.cardUnread]}>
            <Text style={styles.icon}>{TYPE_ICON[item.type] ?? "🔔"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.message, !item.read && styles.messageUnread]}>{item.message}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString("hu-HU")}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  markRead: { color: "#4f46e5", fontWeight: "600" },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  cardUnread: { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" },
  icon: { fontSize: 18 },
  message: { fontSize: 14, color: "#334155" },
  messageUnread: { fontWeight: "600", color: "#0f172a" },
  date: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4f46e5", marginTop: 6 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
});
