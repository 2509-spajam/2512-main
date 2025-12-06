import React from "react";
import { useRouter } from "expo-router";
import { Timeline } from "../components/Timeline";
import { mockRoutes } from "../data/mockData";
import { TravelRoute } from "../types";
import { Text, View } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";

export default function Index() {
  const router = useRouter();

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: "/detail",
      params: { routeId: route.id },
    });
  };

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, padding: 20 }}>
        <Timeline routes={mockRoutes} onRouteSelect={handleRouteSelect} />;
      </View>
    </ScreenWrapper>
  );
}
