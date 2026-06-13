import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAuth } from "../AuthContext";
import * as api from "../api";

function MultiChips({
  options,
  selected,
  onToggle,
}: {
  options: api.Option[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const on = selected.has(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, on && styles.chipOn]}
            onPress={() => onToggle(opt.id)}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SupplierProfileForm() {
  const { token } = useAuth();
  const [taxonomy, setTaxonomy] = useState<{ categories: api.Option[]; regions: api.Option[] } | null>(null);
  const [profile, setProfile] = useState<api.SupplierProfile | null>(null);
  const [description, setDescription] = useState("");
  const [certifications, setCertifications] = useState("");
  const [nationwide, setNationwide] = useState(false);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [regions, setRegions] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const [tax, prof] = await Promise.all([api.getTaxonomy(token), api.getProfile(token)]);
      setTaxonomy(tax);
      setProfile(prof.data);
      setDescription(prof.data.description ?? "");
      setCertifications(prof.data.certifications ?? "");
      setNationwide(prof.data.nationwide);
      setCategories(new Set(prof.data.categoryIds));
      setRegions(new Set(prof.data.regionIds));
    })();
  }, [token]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const save = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setNote(null);
    try {
      await api.updateProfile(token, {
        description,
        certifications,
        nationwide,
        categoryIds: Array.from(categories),
        regionIds: Array.from(regions),
      });
      setNote("Profil elmentve.");
    } catch {
      setNote("A mentés nem sikerült.");
    } finally {
      setBusy(false);
    }
  }, [token, description, certifications, nationwide, categories, regions]);

  if (!taxonomy || !profile) {
    return <ActivityIndicator style={{ marginTop: 24 }} color="#4f46e5" />;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Beszállítói profil</Text>
      <Text style={styles.cardHint}>Minél pontosabb a profil, annál relevánsabb megkereséseket kapsz.</Text>

      {note && <Text style={styles.note}>{note}</Text>}

      <Text style={styles.label}>Bemutatkozás</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Mivel foglalkoztok, milyen referenciáitok vannak?"
      />

      <Text style={styles.label}>Tanúsítványok (vesszővel)</Text>
      <TextInput
        style={styles.input}
        value={certifications}
        onChangeText={setCertifications}
        placeholder="pl. ISO 9001, NKVH F-Gáz"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Országos lefedettség</Text>
        <Switch value={nationwide} onValueChange={setNationwide} />
      </View>

      <Text style={styles.label}>Kategóriák</Text>
      <MultiChips options={taxonomy.categories} selected={categories} onToggle={toggle(categories, setCategories)} />

      <Text style={styles.label}>Régiók</Text>
      <MultiChips options={taxonomy.regions} selected={regions} onToggle={toggle(regions, setRegions)} />

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Profil mentése</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function AccountScreen() {
  const { user, company, signOut } = useAuth();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fiók</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.meta}>
          {company?.name} · {company?.plan === "PRO" ? "Pro csomag" : "Alap csomag"}
        </Text>
      </View>

      {user?.role === "SUPPLIER" && <SupplierProfileForm />}

      <TouchableOpacity style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Kilépés</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  name: { fontSize: 17, fontWeight: "600", color: "#0f172a" },
  meta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  cardHint: { fontSize: 13, color: "#64748b", marginTop: 2, marginBottom: 8 },
  note: { color: "#047857", marginTop: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, fontSize: 15 },
  multiline: { minHeight: 70, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipOn: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  chipText: { fontSize: 13, color: "#475569" },
  chipTextOn: { color: "#4f46e5", fontWeight: "600" },
  saveBtn: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 20 },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  signOut: { borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, padding: 14, alignItems: "center" },
  signOutText: { color: "#dc2626", fontWeight: "600" },
});
