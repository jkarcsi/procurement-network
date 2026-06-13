import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

export default function SupplierOpportunitiesScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<api.Opportunity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    setError(null);
    try {
      const result = await api.listOpportunities(token);
      setItems(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Betöltési hiba");
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const join = useCallback(
    async (rfqId: string) => {
      if (!token) return;
      setJoining(rfqId);
      try {
        await api.joinOpportunity(token, rfqId);
        setItems((prev) => prev.filter((o) => o.id !== rfqId));
        Alert.alert(
          "Sikeres jelentkezés",
          "Az ajánlatodat a Megkeresések fülön adhatod be.",
        );
      } catch (e) {
        Alert.alert("Hiba", e instanceof Error ? e.message : "Sikertelen jelentkezés");
      } finally {
        setJoining(null);
      }
    },
    [token],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nyílt lehetőségek</Text>
      <Text style={styles.subtitle}>A profilodhoz illő élő ajánlatkérések – meghívás nélkül.</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={
          !refreshing ? (
            <Text style={styles.empty}>Most nincs a profilodhoz illő nyílt ajánlatkérés.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.buyer} · {item.category ?? "Egyéb"} · {item.region ?? "régió n/a"}
            </Text>
            <Text style={styles.cardSummary} numberOfLines={2}>
              {item.summary}
            </Text>
            <TouchableOpacity style={styles.joinBtn} onPress={() => join(item.id)} disabled={joining !== null}>
              <Text style={styles.joinText}>{joining === item.id ? "Jelentkezés…" : "Jelentkezem"}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  cardMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  cardSummary: { fontSize: 14, color: "#475569", marginTop: 8 },
  joinBtn: { backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 12 },
  joinText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
  error: { color: "#dc2626", marginBottom: 8 },
});
