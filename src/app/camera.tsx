import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView } from "../components/CameraView";
import { fetchTravelById, uploadPointImage, createPoint } from "../services/travelService";
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
    let pointId = '';

    try {
      console.log(`Comparing spot image: ${spot.imageUrl} with captured: ${uri}`);
      const start = Date.now();
      const percentage = await compareImages(spot.imageUrl, uri);
      const end = Date.now();
      console.log(`Comparison finished in ${end - start}ms. Result: ${percentage}%`);
      syncRate = Math.floor(percentage);

      // --- Backend Integration ---
      // 1. Upload Image
      const imagePath = await uploadPointImage(uri);

      if (imagePath) {
        // 2. Create Point
        // Note: we just create the point here. We don't link it to a travel yet.
        // The linking will happen in the Result screen.
        const pid = await createPoint(spot.lat, spot.lng, imagePath);
        if (pid) {
          pointId = pid;
        }
      }
      // ---------------------------

    } catch (e) {
      console.error('Failed to process capture', e);
      syncRate = 0;
    }

    // Determine the ID to save locally. 
    // Ideally we want the Point ID if available, but for now CompletedSpot uses 'spotId' (which is the route's spot ID).
    // We need to store the *created* point ID to link it later.
    // Let's check the CompletedSpot type definition again or extend it.
    // Assuming we can add a property or use 'userImageUrl' to store local URI.
    // We need to store `pointId` somewhere. 
    // Let's assume we modify CompletedSpot type or just piggyback.
    // Wait, the CompletedSpot interface is in types/index.ts. 
    // I should check if I can add a field to it without breaking things, or if I should just use AsyncStorage differently.

    // For simplicity and minimal changes, let's update CompletedSpot type to include optional `createdPointId`.

    const completedSpot: CompletedSpot = {
      spotId,
      syncRate,
      timestamp: new Date().toISOString(),
      userImageUrl: uri,
      createdPointId: pointId
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
