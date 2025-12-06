import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";

const ScreenWrapper = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container}>{children}</SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});

export default ScreenWrapper;
