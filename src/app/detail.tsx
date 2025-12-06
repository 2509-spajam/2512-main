import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { RouteDetail } from "../components/RouteDetail";
import { fetchTravelById } from "../services/travelService";
import { TravelRoute } from "../types";

export default function Detail() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoute = async () => {
      if (!routeId) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchTravelById(routeId);
        setRoute(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadRoute();
  }, [routeId]);

  useEffect(() => {
    if (!loading && !route) {
      // Redirect if not found, but only after loading is done
      router.replace("/");
    }
  }, [loading, route]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!route) {
    return null; // or generic error view before redirect logic kicks in
  }

  const handleBack = () => {
    router.back();
  };

  const handleStartSync = () => {
    router.push({
      pathname: "/map",
      params: { routeId: route.id },
    });
  };

  const handleShowOriginal = () => {
    if (route && route.originTravelId) {
      router.push({
        pathname: "/detail",
        params: { routeId: route.originTravelId },
      });
    }
  };

  return (
    <RouteDetail
      route={route}
      onBack={handleBack}
      onStartSync={handleStartSync}
      onShowOriginal={handleShowOriginal}
    />
  );
}
