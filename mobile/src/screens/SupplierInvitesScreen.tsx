import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";
import { inviteStatusBadge } from "../status";
import StatusBadge from "../components/StatusBadge";

export default function SupplierInvitesScreen({ onOpen }: { onOpen: (invite: api.Invite) => void }) {
  const { token, company, signOut } = useAuth();
  const [invites, setInvites] = useState<api.Invite[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    setError(null);
    try {
      const result = await api.listInvites(token);
      setInvites(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Betöltési hiba");
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Megkeresések</Text>
          <Text style={styles.subtitle}>{company?.name}</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOut}>Kilépés</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={
          !refreshing ? <Text style={styles.empty}>Még nincs beérkezett megkeresésed.</Text> : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onOpen(item)}>
            <Text style={styles.cardTitle}>{item.rfq.title}</Text>
            <Text style={styles.cardMeta}>
              {item.rfq.buyer} · {item.rfq.category ?? "Egyéb"}
            </Text>
            <View style={styles.cardStatus}>
              <StatusBadge {...inviteStatusBadge(item.status)} />
              {item.offer ? (
                <Text style={styles.cardPrice}>{item.offer.priceNet.toLocaleString("hu-HU")} Ft</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  signOut: { color: "#4f46e5", fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  cardMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  cardStatus: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  cardPrice: { fontSize: 13, color: "#475569", fontWeight: "600" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
  error: { color: "#dc2626", marginBottom: 8 },
});
