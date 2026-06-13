import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

const PRICE_UNITS = ["Ft/hó", "Ft/alkalom", "Ft/óra", "Ft/m²/hó", "egyösszegű"];

export default function SupplierInviteDetailScreen({
  invite,
  onBack,
  onSubmitted,
}: {
  invite: api.Invite;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const { token } = useAuth();
  const [priceNet, setPriceNet] = useState("");
  const [priceUnit, setPriceUnit] = useState(PRICE_UNITS[0]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closed = invite.rfq.status === "DECIDED" || invite.rfq.status === "CLOSED";
  const alreadyOffered = invite.status === "OFFERED" || invite.offer !== null;

  async function submit() {
    if (!token) return;
    setError(null);
    const price = Number.parseInt(priceNet, 10);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Adj meg érvényes nettó árat (Ft).");
      return;
    }
    setBusy(true);
    try {
      await api.submitInviteOffer(token, invite.id, { priceNet: price, priceUnit, notes: notes.trim() || undefined });
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sikertelen beküldés");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Vissza</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{invite.rfq.title}</Text>
      <Text style={styles.meta}>
        {invite.rfq.buyer} · {invite.rfq.category ?? "Egyéb"} · {invite.rfq.region ?? "régió n/a"}
      </Text>
      <Text style={styles.summary}>{invite.rfq.summary}</Text>

      {alreadyOffered ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneTitle}>Beadott ajánlatod</Text>
          {invite.offer && (
            <Text style={styles.doneText}>
              {invite.offer.priceNet.toLocaleString("hu-HU")} Ft ({invite.offer.priceUnit}) ·{" "}
              {invite.offer.status === "ACCEPTED"
                ? "✅ elfogadva"
                : invite.offer.status === "REJECTED"
                  ? "másikat választottak"
                  : "elbírálás alatt"}
            </Text>
          )}
        </View>
      ) : closed ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>Ez az ajánlatkérés már lezárult.</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Ajánlatadás</Text>
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.label}>Nettó ár (Ft)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={priceNet}
            onChangeText={setPriceNet}
            placeholder="pl. 150000"
          />

          <Text style={styles.label}>Ár egysége</Text>
          <View style={styles.chips}>
            {PRICE_UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.chip, priceUnit === u && styles.chipActive]}
                onPress={() => setPriceUnit(u)}
              >
                <Text style={[styles.chipText, priceUnit === u && styles.chipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Megjegyzés (opcionális)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Tartalom, feltételek, kezdés…"
          />

          <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajánlat beküldése</Text>}
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  back: { color: "#4f46e5", fontWeight: "600", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  meta: { fontSize: 13, color: "#64748b", marginTop: 4 },
  summary: { fontSize: 14, color: "#475569", marginTop: 12 },
  doneBox: { backgroundColor: "#f1f5f9", borderRadius: 12, padding: 16, marginTop: 20 },
  doneTitle: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  doneText: { fontSize: 14, color: "#475569", marginTop: 4 },
  form: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  chipText: { fontSize: 13, color: "#475569" },
  chipTextActive: { color: "#4f46e5", fontWeight: "600" },
  button: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "#dc2626", marginBottom: 8 },
});
