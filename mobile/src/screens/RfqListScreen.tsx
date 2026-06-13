import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

const STATUS_LABEL: Record<string, string> = {
  READY: "Kiküldésre kész",
  SENT: "Kiküldve",
  DECIDED: "Eldöntve",
  CLOSED: "Lezárva",
};

export default function RfqListScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const { token, company, user, signOut } = useAuth();
  const [rfqs, setRfqs] = useState<api.Rfq[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    setError(null);
    try {
      const result = await api.listRfqs(token);
      setRfqs(result.data);
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
          <Text style={styles.title}>Ajánlatkérések</Text>
          <Text style={styles.subtitle}>
            {company?.name} · {company?.creditBalance ?? 0} kredit
          </Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOut}>Kilépés</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={rfqs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={
          !refreshing ? (
            <Text style={styles.empty}>
              {user?.role === "SUPPLIER"
                ? "A beérkezett megkereséseidet a webes felületen találod."
                : "Még nincs ajánlatkérésed."}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onOpen(item.id)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardStatus}>{STATUS_LABEL[item.status] ?? item.status}</Text>
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
  cardStatus: { fontSize: 13, color: "#4f46e5", marginTop: 4 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
  error: { color: "#dc2626", marginBottom: 8 },
});
