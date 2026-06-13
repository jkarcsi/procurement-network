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

  // Send-out state (READY RFQs)
  const [shortlist, setShortlist] = useState<api.ShortlistMatch[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const result = await api.getRfq(token, id);
      const detail = result.data as unknown as RfqDetail;
      setRfq(detail);
      if (detail.status === "READY" && user?.role === "BUYER") {
        const sl = await api.getShortlist(token, id);
        setShortlist(sl.data);
        setSelected(new Set(sl.data.map((m) => m.supplierId)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Betöltési hiba");
    }
  }, [token, id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (supplierId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(supplierId)) next.delete(supplierId);
      else next.add(supplierId);
      return next;
    });

  const send = useCallback(async () => {
    if (!token || selected.size === 0) return;
    setSending(true);
    try {
      await api.sendRfq(token, id, Array.from(selected));
      setShortlist(null);
      await load();
    } catch (e) {
      Alert.alert("Hiba", e instanceof Error ? e.message : "Sikertelen kiküldés");
    } finally {
      setSending(false);
    }
  }, [token, id, selected, load]);

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

  const isReady = rfq?.status === "READY" && user?.role === "BUYER";
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

          {isReady ? (
            <>
              <Text style={styles.sectionTitle}>Ajánlott beszállítók</Text>
              <Text style={styles.hint}>Pipáld ki, kiknek menjen az ajánlatkérés.</Text>
              {shortlist === null ? (
                <ActivityIndicator style={{ marginTop: 12 }} color="#4f46e5" />
              ) : shortlist.length === 0 ? (
                <Text style={styles.empty}>
                  Ehhez a kategóriához még nincs beszállító a hálózatban.
                </Text>
              ) : (
                shortlist.map((m) => {
                  const on = selected.has(m.supplierId);
                  return (
                    <TouchableOpacity key={m.supplierId} style={styles.supplier} onPress={() => toggle(m.supplierId)}>
                      <View style={[styles.checkbox, on && styles.checkboxOn]}>
                        {on && <Text style={styles.check}>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.supplierName}>{m.companyName}</Text>
                        <Text style={styles.supplierMeta} numberOfLines={1}>
                          {m.reason}
                          {m.regionNames.length > 0 ? ` · ${m.regionNames.join(", ")}` : ""}
                        </Text>
                      </View>
                      <Text style={styles.score}>{m.score}p</Text>
                    </TouchableOpacity>
                  );
                })
              )}
              {shortlist !== null && shortlist.length > 0 && (
                <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending || selected.size === 0}>
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sendText}>Kiküldés ({selected.size})</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
          <View style={{ height: 40 }} />
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
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginTop: 24, marginBottom: 4 },
  hint: { fontSize: 13, color: "#64748b", marginBottom: 8 },
  supplier: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  check: { color: "#fff", fontSize: 14, fontWeight: "700" },
  supplierName: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  supplierMeta: { fontSize: 12, color: "#64748b", marginTop: 2 },
  score: { fontSize: 14, fontWeight: "700", color: "#4f46e5" },
  sendBtn: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 16 },
  sendText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  offer: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  offerAccepted: { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },
  offerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  offerCompany: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  offerPrice: { fontSize: 14, color: "#475569", marginTop: 2 },
  accepted: { color: "#047857", fontWeight: "600" },
  acceptBtn: { backgroundColor: "#059669", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  acceptText: { color: "#fff", fontWeight: "600" },
  empty: { color: "#94a3b8", marginTop: 4 },
  error: { color: "#dc2626", marginTop: 12 },
});
