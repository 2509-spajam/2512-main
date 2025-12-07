import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, Redirect } from "expo-router";
import { COLORS } from "../constants/colors";
import { sessionState } from "../lib/session";

export default function Index() {
  const router = useRouter();

  if (sessionState.hasSeenKV) {
    return <Redirect href="/" />;
  }

  const handleStart = () => {
    sessionState.hasSeenKV = true;
    router.replace("/");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleStart}>
      <Text style={styles.title}>Re:Write</Text>
      <Text style={styles.description}>タッチして始める</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    marginBottom: 20,
    fontSize: 48,
    fontWeight: "bold",
    color: "#03FFD1",
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 20,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
