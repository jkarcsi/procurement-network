import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

const TX_TYPE: Record<string, string> = { BONUS: "Bónusz", PURCHASE: "Vásárlás", USAGE: "Felhasználás" };

export default function CreditsScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getCredits>> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyPkg, setBusyPkg] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      setData(await api.getCredits(token));
    } catch {
      // keep stale data
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const buy = useCallback(
    async (packageId: string) => {
      if (!token) return;
      setBusyPkg(packageId);
      setNote(null);
      try {
        const result = await api.purchaseCredits(token, packageId);
        if (result.checkoutUrl) {
          await Linking.openURL(result.checkoutUrl);
        } else if (result.granted) {
          setNote("A krediteket jóváírtuk.");
          await load();
        }
      } catch {
        setNote("A vásárlás nem sikerült. Próbáld újra.");
      } finally {
        setBusyPkg(null);
      }
    },
    [token, load],
  );

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <Text style={styles.title}>Kreditek</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Egyenleged</Text>
        <Text style={styles.balanceValue}>{data.balance} kredit</Text>
        <Text style={styles.balanceHint}>Egy Procura elemzés {data.comparisonCost} kredit.</Text>
      </View>

      {note && <Text style={styles.note}>{note}</Text>}

      <Text style={styles.sectionTitle}>Kreditcsomagok</Text>
      {data.packages.map((pkg) => (
        <View key={pkg.id} style={styles.pkg}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pkgName}>{pkg.name}</Text>
            <Text style={styles.pkgMeta}>
              {pkg.credits} kredit · {pkg.priceHuf.toLocaleString("hu-HU")} Ft + áfa
            </Text>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={() => buy(pkg.id)} disabled={busyPkg !== null}>
            {busyPkg === pkg.id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buyText}>Megveszem</Text>
            )}
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Tranzakciók</Text>
      {data.transactions.length === 0 ? (
        <Text style={styles.empty}>Még nincs tranzakciód.</Text>
      ) : (
        data.transactions.map((tx) => (
          <View key={tx.id} style={styles.tx}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txMeta}>
                {TX_TYPE[tx.type] ?? tx.type} · {new Date(tx.createdAt).toLocaleDateString("hu-HU")}
              </Text>
            </View>
            <Text style={[styles.txAmount, tx.amount > 0 ? styles.txPlus : styles.txMinus]}>
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
            </Text>
          </View>
        ))
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  balanceCard: { backgroundColor: "#4f46e5", borderRadius: 16, padding: 20 },
  balanceLabel: { color: "#c7d2fe", fontSize: 13 },
  balanceValue: { color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: 4 },
  balanceHint: { color: "#c7d2fe", fontSize: 12, marginTop: 6 },
  note: { color: "#047857", marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginTop: 24, marginBottom: 8 },
  pkg: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  pkgName: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  pkgMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  buyButton: { backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  buyText: { color: "#fff", fontWeight: "600" },
  tx: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  txDesc: { fontSize: 14, color: "#334155" },
  txMeta: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "600" },
  txPlus: { color: "#047857" },
  txMinus: { color: "#0f172a" },
  empty: { color: "#94a3b8" },
});
