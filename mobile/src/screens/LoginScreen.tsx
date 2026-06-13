import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sikertelen belépés");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Procura</Text>
      <Text style={styles.subtitle}>B2B beszerzési hálózat</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="E-mail cím"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Jelszó"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Belépés</Text>}
      </TouchableOpacity>
      <Text style={styles.hint}>
        A következő belépéskor ujjlenyomattal vagy arcfelismeréssel jelentkezhetsz be.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  brand: { fontSize: 36, fontWeight: "bold", color: "#4f46e5", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  hint: { color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 16 },
  error: { color: "#dc2626", textAlign: "center", marginBottom: 12 },
});
