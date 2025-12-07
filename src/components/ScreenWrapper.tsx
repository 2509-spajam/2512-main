import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";
import { ParticlesBackground } from "./ParticlesBackground";

interface ScreenWrapperProps {
  children: ReactNode;
}

const ScreenWrapper = ({ children }: ScreenWrapperProps) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.particlesContainer} pointerEvents="none">
        <ParticlesBackground />
      </View>
      <SafeAreaView style={styles.container} pointerEvents="box-none">
        <View style={styles.content} pointerEvents="auto">
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default ScreenWrapper;
