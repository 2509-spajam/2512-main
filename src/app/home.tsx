import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Timeline } from "../components/Timeline";
import { mockRoutes } from "../data/mockData";
import { TravelRoute } from "../types";
import { COLORS } from "../constants/colors";

export default function HomeScreen() {
  const router = useRouter();

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: "/detail",
      params: { routeId: route.id },
    });
  };

  return (
    <View style={styles.container}>
      <Timeline routes={mockRoutes} onRouteSelect={handleRouteSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});
