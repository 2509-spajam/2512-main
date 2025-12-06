// components/ScreenWrapper.js

import React from "react";
// このライブラリをインストールしていない場合は yarn add react-native-safe-area-context
// または npx expo install react-native-safe-area-context で追加してください
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const ScreenWrapper = ({ children, style }) => {
  return (
    // 上下左右に適切な余白を適用しつつ、画面いっぱいに広げます
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // 画面のデフォルトの背景色
  },
});

export default ScreenWrapper;
