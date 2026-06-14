import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Badge } from "../status";

// Small pill that renders a status label in its semantic colors.
export default function StatusBadge({ label, bg, fg }: Badge) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontSize: 12, fontWeight: "600" },
});
