import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SpotResultView } from "../components/SpotResultView";
import { mockRoutes } from "../data/mockData";
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
  const [completedSpot, setCompletedSpot] = useState<CompletedSpot | null>(
    null
  );
  const currentSpotIndex = spotIndex ? parseInt(spotIndex, 10) : 0;

  useEffect(() => {
    const foundRoute = mockRoutes.find((r) => r.id === routeId);
    if (!foundRoute) {
      router.replace("/");
      return;
    }
    setRoute(foundRoute);

    const loadCompletedSpot = async () => {
      try {
        const stored = await AsyncStorage.getItem(
          `${COMPLETED_SPOTS_KEY}_${routeId}`
        );
        if (stored) {
          const completedSpots: CompletedSpot[] = JSON.parse(stored);
          const found = completedSpots.find((s) => s.spotId === spotId);
          if (found) {
            setCompletedSpot(found);
          } else {
            router.back();
          }
        } else {
          router.back();
        }
      } catch (error) {
        console.error("Error loading completed spot:", error);
        router.back();
      }
    };

    loadCompletedSpot();
  }, [routeId, spotId, router]);

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
