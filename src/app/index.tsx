import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Timeline } from "../components/Timeline";
import { fetchTravels } from "../services/travelService";
import { TravelRoute } from "../types";
import { sessionState } from "../lib/session";

export default function HomeScreen() {
  const router = useRouter();

  if (!sessionState.hasSeenKV) {
    return <Redirect href="/welcome" />;
  }

  const [routes, setRoutes] = React.useState<TravelRoute[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadTravels();
  }, []);

  const loadTravels = async () => {
    try {
      setLoading(true);
      const data = await fetchTravels();
      setRoutes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: "/detail",
      params: { routeId: route.id },
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <Timeline routes={routes} onRouteSelect={handleRouteSelect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
