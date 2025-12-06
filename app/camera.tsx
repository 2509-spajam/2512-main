import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView } from "../src/components/CameraView";
import { mockRoutes } from "../src/data/mockData";
import { TravelRoute, CompletedSpot } from "../src/types";

const COMPLETED_SPOTS_KEY = "completedSpots";

export default function Camera() {
  const router = useRouter();
  const { routeId, spotIndex } = useLocalSearchParams<{
    routeId: string;
    spotIndex: string;
  }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const currentSpotIndex = spotIndex ? parseInt(spotIndex, 10) : 0;

  useEffect(() => {
    const foundRoute = mockRoutes.find((r) => r.id === routeId);
    if (!foundRoute) {
      router.replace("/");
      return;
    }
    setRoute(foundRoute);
  }, [routeId, router]);

  if (!route) {
    return null;
  }

  const handleCapture = async (spotId: string) => {
    const syncRate = Math.floor(Math.random() * 30) + 70;
    const spot = route.spots[currentSpotIndex];

    const completedSpot: CompletedSpot = {
      spotId,
      syncRate,
      timestamp: new Date().toISOString(),
      userImageUrl: spot.imageUrl,
    };

    try {
      const stored = await AsyncStorage.getItem(
        `${COMPLETED_SPOTS_KEY}_${routeId}`
      );
      const existingSpots: CompletedSpot[] = stored ? JSON.parse(stored) : [];
      const newCompletedSpots = [
        ...existingSpots.filter((s) => s.spotId !== spotId),
        completedSpot,
      ];
      await AsyncStorage.setItem(
        `${COMPLETED_SPOTS_KEY}_${routeId}`,
        JSON.stringify(newCompletedSpots)
      );

      router.push({
        pathname: "/spot-result",
        params: {
          routeId: route.id,
          spotIndex: currentSpotIndex.toString(),
          spotId,
        },
      });
    } catch (error) {
      console.error("Error saving completed spot:", error);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <CameraView
      route={route}
      currentSpotIndex={currentSpotIndex}
      onCapture={handleCapture}
      onClose={handleClose}
    />
  );
}
