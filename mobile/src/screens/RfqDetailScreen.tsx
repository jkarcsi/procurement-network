import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

type Offer = {
  companyName: string;
  priceNet: number;
  priceUnit: string;
  status: string;
};

type RfqDetail = api.Rfq & {
  spec: { summary?: string } | null;
  offers: Offer[];
  invites: unknown[];
};

export default function RfqDetailScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const { token } = useAuth();
  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const result = await api.getRfq(token, id);
        setRfq(result.data as unknown as RfqDetail);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Betöltési hiba");
      }
    })();
  }, [token, id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Vissza</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
      {!rfq && !error && <ActivityIndicator style={{ marginTop: 40 }} color="#4f46e5" />}

      {rfq && (
        <ScrollView>
          <Text style={styles.title}>{rfq.title}</Text>
          {rfq.spec?.summary && <Text style={styles.summary}>{rfq.spec.summary}</Text>}

          <Text style={styles.sectionTitle}>Beérkezett ajánlatok ({rfq.offers.length})</Text>
          {rfq.offers.length === 0 ? (
            <Text style={styles.empty}>Még nincs beérkezett ajánlat.</Text>
          ) : (
            rfq.offers.map((offer, i) => (
              <View key={i} style={styles.offer}>
                <Text style={styles.offerCompany}>{offer.companyName}</Text>
                <Text style={styles.offerPrice}>
                  {offer.priceNet.toLocaleString("hu-HU")} Ft ({offer.priceUnit})
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  back: { color: "#4f46e5", fontWeight: "600", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  summary: { fontSize: 14, color: "#475569", marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginTop: 24, marginBottom: 8 },
  offer: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  offerCompany: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  offerPrice: { fontSize: 14, color: "#475569", marginTop: 2 },
  empty: { color: "#94a3b8" },
  error: { color: "#dc2626", marginTop: 12 },
});
