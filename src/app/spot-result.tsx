import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SpotResultView } from "../components/SpotResultView";
import { fetchTravelById } from "../services/travelService";
import { TravelRoute, CompletedSpot } from "../types";

const COMPLETED_SPOTS_KEY = "completedSpots";

export default function SpotResult() {
  const router = useRouter();
  const { routeId, spotIndex, spotId } = useLocalSearchParams<{
    routeId: string;
    spotIndex: string;
    spotId: string;
  }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSpot, setCompletedSpot] = useState<CompletedSpot | null>(
    null
  );
  const currentSpotIndex = spotIndex ? parseInt(spotIndex, 10) : 0;

  useEffect(() => {
    const loadData = async () => {
      if (!routeId) {
        setLoading(false);
        return;
      }

      try {
        // Load Route
        const routeData = await fetchTravelById(routeId);
        setRoute(routeData);

        if (routeData) {
          // Load Completed Spot only if route exists
          const stored = await AsyncStorage.getItem(
            `${COMPLETED_SPOTS_KEY}_${routeId}`
          );
          if (stored) {
            const completedSpots: CompletedSpot[] = JSON.parse(stored);
            const found = completedSpots.find((s) => s.spotId === spotId);
            if (found) {
              setCompletedSpot(found);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [routeId, spotId]);

  useEffect(() => {
    if (!loading && (!route || !completedSpot)) {
      // Only redirect/back if finished loading and data is missing
      router.back();
    }
  }, [loading, route, completedSpot, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!route || !completedSpot) {
    return null;
  }

  const spot = route.spots[currentSpotIndex];
  if (!spot) {
    router.back();
    return null;
  }

  const handleBackToMap = () => {
    router.push({
      pathname: "/map",
      params: { routeId: route.id },
    });
  };

  return (
    <SpotResultView
      spot={spot}
      completedSpot={completedSpot}
      onBackToMap={handleBackToMap}
    />
  );
}
