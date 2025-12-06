import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ScreenWrapper from "../components/ScreenWrapper";

export default function RootLayout() {
  return (
    <ScreenWrapper>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="map" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="spot-result" />
        <Stack.Screen name="result" />
      </Stack>
    </ScreenWrapper>
  );
}
