import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../AuthContext";

export default function LockScreen() {
  const { unlock, signOut } = useAuth();

  // Trigger the biometric prompt automatically when the lock screen appears.
  useEffect(() => {
    unlock();
  }, [unlock]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>Procura zárolva</Text>
      <Text style={styles.subtitle}>Oldd fel ujjlenyomattal vagy arcfelismeréssel.</Text>
      <TouchableOpacity style={styles.button} onPress={unlock}>
        <Text style={styles.buttonText}>Feloldás</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={signOut}>
        <Text style={styles.link}>Kilépés és másik fiók</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#fff" },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 8, marginBottom: 24 },
  button: { backgroundColor: "#4f46e5", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#64748b", marginTop: 20, fontSize: 14 },
});
