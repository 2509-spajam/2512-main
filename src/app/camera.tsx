import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView } from "../components/CameraView";
import { fetchTravelById } from "../services/travelService";
import { TravelRoute, CompletedSpot } from "../types";
import { compareImages } from "../utils/pHash";

const COMPLETED_SPOTS_KEY = "completedSpots";

export default function Camera() {
  const router = useRouter();
  const { routeId, spotIndex } = useLocalSearchParams<{
    routeId: string;
    spotIndex: string;
  }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const currentSpotIndex = spotIndex ? parseInt(spotIndex, 10) : 0;

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
      router.replace("/");
    }
  }, [loading, route, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!route) {
    return null;
  }

  const handleCapture = async (spotId: string, uri: string) => {
    const spot = route.spots[currentSpotIndex];
    let syncRate = 0;

    try {
      console.log(`Comparing spot image: ${spot.imageUrl} with captured: ${uri}`);
      const start = Date.now();
      const percentage = await compareImages(spot.imageUrl, uri);
      const end = Date.now();
      console.log(`Comparison finished in ${end - start}ms. Result: ${percentage}%`);
      syncRate = Math.floor(percentage);
    } catch (e) {
      console.error('Failed to compare images', e);
      syncRate = 0;
    }

    const completedSpot: CompletedSpot = {
      spotId,
      syncRate,
      timestamp: new Date().toISOString(),
      userImageUrl: uri,
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
