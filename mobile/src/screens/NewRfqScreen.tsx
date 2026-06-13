import React, { useEffect, useState } from "react";
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

function Chips({
  options,
  selected,
  onSelect,
}: {
  options: api.Option[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const active = selected === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(active ? null : opt.id)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function NewRfqScreen({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { token } = useAuth();
  const [taxonomy, setTaxonomy] = useState<{ categories: api.Option[]; regions: api.Option[] } | null>(null);
  const [intakeText, setIntakeText] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        setTaxonomy(await api.getTaxonomy(token));
      } catch {
        setTaxonomy({ categories: [], regions: [] });
      }
    })();
  }, [token]);

  async function submit() {
    if (!token) return;
    setError(null);
    if (intakeText.trim().length < 10) {
      setError("Írd le legalább egy mondatban, mire van szükséged.");
      return;
    }
    setBusy(true);
    try {
      await api.createRfq(token, {
        intakeText: intakeText.trim(),
        title: title.trim() || undefined,
        categoryId: categoryId ?? undefined,
        regionId: regionId ?? undefined,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sikertelen létrehozás");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.back}>← Mégse</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Új ajánlatkérés</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Mire van szükséged?</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Pl.: Heti két alkalommal takarítót keresek a 600 m²-es budapesti irodánkba"
        multiline
        value={intakeText}
        onChangeText={setIntakeText}
      />

      <Text style={styles.label}>Cím (opcionális)</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ajánlatkérés címe" />

      {taxonomy ? (
        <>
          <Text style={styles.label}>Kategória</Text>
          <Chips options={taxonomy.categories} selected={categoryId} onSelect={setCategoryId} />
          <Text style={styles.label}>Régió</Text>
          <Chips options={taxonomy.regions} selected={regionId} onSelect={setRegionId} />
        </>
      ) : (
        <ActivityIndicator style={{ marginTop: 16 }} color="#4f46e5" />
      )}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajánlatkérés létrehozása</Text>}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  back: { color: "#4f46e5", fontWeight: "600", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  chipText: { fontSize: 13, color: "#475569" },
  chipTextActive: { color: "#4f46e5", fontWeight: "600" },
  button: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "#dc2626", marginTop: 8 },
});
