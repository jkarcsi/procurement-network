import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

type Offer = {
  id: string;
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

const STATUS_LABEL: Record<string, string> = {
  READY: "Kiküldésre kész",
  SENT: "Kiküldve",
  DECIDED: "Eldöntve",
  CLOSED: "Lezárva",
};

export default function RfqDetailScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const { token, user } = useAuth();
  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const result = await api.getRfq(token, id);
      setRfq(result.data as unknown as RfqDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Betöltési hiba");
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = useCallback(
    (offer: Offer) => {
      if (!token) return;
      Alert.alert(
        "Ajánlat elfogadása",
        `Elfogadod ${offer.companyName} ajánlatát (${offer.priceNet.toLocaleString("hu-HU")} Ft)? A többi ajánlat elutasításra kerül.`,
        [
          { text: "Mégse", style: "cancel" },
          {
            text: "Elfogadom",
            onPress: async () => {
              setAccepting(offer.id);
              try {
                await api.acceptOffer(token, offer.id);
                await load();
              } catch (e) {
                Alert.alert("Hiba", e instanceof Error ? e.message : "Sikertelen művelet");
              } finally {
                setAccepting(null);
              }
            },
          },
        ],
      );
    },
    [token, load],
  );

  const canAccept = rfq?.status === "SENT" && user?.role === "BUYER";

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
          <Text style={styles.statusLine}>{STATUS_LABEL[rfq.status] ?? rfq.status}</Text>
          {rfq.spec?.summary && <Text style={styles.summary}>{rfq.spec.summary}</Text>}

          <Text style={styles.sectionTitle}>Beérkezett ajánlatok ({rfq.offers.length})</Text>
          {rfq.offers.length === 0 ? (
            <Text style={styles.empty}>Még nincs beérkezett ajánlat.</Text>
          ) : (
            rfq.offers.map((offer) => (
              <View key={offer.id} style={[styles.offer, offer.status === "ACCEPTED" && styles.offerAccepted]}>
                <View style={styles.offerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerCompany}>{offer.companyName}</Text>
                    <Text style={styles.offerPrice}>
                      {offer.priceNet.toLocaleString("hu-HU")} Ft ({offer.priceUnit})
                    </Text>
                  </View>
                  {offer.status === "ACCEPTED" && <Text style={styles.accepted}>✅ Elfogadva</Text>}
                  {canAccept && offer.status === "SUBMITTED" && (
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => accept(offer)} disabled={accepting !== null}>
                      {accepting === offer.id ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.acceptText}>Elfogadás</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
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
  statusLine: { fontSize: 13, color: "#4f46e5", marginTop: 4 },
  summary: { fontSize: 14, color: "#475569", marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginTop: 24, marginBottom: 8 },
  offer: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  offerAccepted: { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },
  offerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  offerCompany: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  offerPrice: { fontSize: 14, color: "#475569", marginTop: 2 },
  accepted: { color: "#047857", fontWeight: "600" },
  acceptBtn: { backgroundColor: "#059669", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  acceptText: { color: "#fff", fontWeight: "600" },
  empty: { color: "#94a3b8" },
  error: { color: "#dc2626", marginTop: 12 },
});
