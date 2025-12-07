import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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
    <View style={styles.container}>
      <Text style={styles.title}>ようこそ</Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleStart}
      >
        <Text style={styles.buttonText}>タイムラインを見る</Text>
      </Pressable>
    </View>
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
    fontSize: 24,
    marginBottom: 20,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#2f6df6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
