import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView } from "../components/CameraView";
import { LoadingView } from "../components/LoadingView";
import {
  fetchTravelById,
  uploadPointImage,
  createPoint,
} from "../services/travelService";
import { TravelRoute, CompletedSpot } from "../types";
import { compareImages } from "../utils/pHash";
import { supabase } from "../lib/supabase";

const COMPLETED_SPOTS_KEY = "completedSpots";

export default function Camera() {
  const router = useRouter();
  const { routeId, spotIndex } = useLocalSearchParams<{
    routeId: string;
    spotIndex: string;
  }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
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
    return <LoadingView />;
  }

  if (!route) {
    return null;
  }

  const handleCapture = async (spotId: string, uri: string) => {
    setIsProcessing(true);
    const spot = route.spots[currentSpotIndex];
    let syncRate = 0;
    let pointId = "";

    try {
      console.log(`Processing capture: ${uri}`);

      const start = Date.now();



      // OPTIMIZATION: Resize image to avoid OOM
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to 1080px width, maintining aspect ratio
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const resizedUri = manipulated.uri;
      console.log(`Image resized: ${uri} -> ${resizedUri}`);

      // 1. Upload Image First (Background or concurrent?)
      // We still need to upload it for saving the record.
      const imagePath = await uploadPointImage(resizedUri);
      if (!imagePath) throw new Error("Image upload failed");

      // 2. Prepare Base64 for User Capture (image2)
      // Use resizedUri here as well
      const base64User = await FileSystem.readAsStringAsync(resizedUri, { encoding: 'base64' });
      const userImageBase64 = `data:image/jpeg;base64,${base64User}`;

      // 3. Prepare Base64 for Original Spot Image (image1)
      // OpenAI times out on the Supabase URL, so we download it locally and send Base64.
      console.log(`Downloading original image for Base64 conversion: ${spot.imageUrl}`);
      const downloadRes = await FileSystem.downloadAsync(
        spot.imageUrl,
        FileSystem.documentDirectory + 'temp_original.jpg'
      );
      const base64Original = await FileSystem.readAsStringAsync(downloadRes.uri, { encoding: 'base64' });
      const originalImageBase64 = `data:image/jpeg;base64,${base64Original}`;

      // 4. Call Supabase Edge Function with both Base64 images
      console.log(`Comparing images (both Base64)...`);

      const { data, error } = await supabase.functions.invoke('compare-images', {
        body: {
          image1: originalImageBase64,
          image2: userImageBase64
        }
      });

      if (error) {
        console.error("Edge Function Error:", JSON.stringify(error, null, 2));
        if (error instanceof Error) {
          console.error("Error Message:", error.message);
          console.error("Error Stack:", error.stack);
        }
        // Fallback or alert? For now, assume 0 or handle error.
        throw error;
      }

      const percentage = data.score || 0;
      console.log(`AI Comparison Result: ${percentage}% Reason: ${data.reason}`);

      const end = Date.now();
      console.log(`Total processing time: ${end - start}ms`);

      syncRate = Math.floor(percentage);

      // 3. Create Point (using the already uploaded imagePath)
      const pid = await createPoint(spot.lat, spot.lng, imagePath);
      if (pid) {
        pointId = pid;
      }

    } catch (e) {
      console.error("Failed to process capture", e);
      syncRate = 0;
      // Optionally show alert to user
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
      createdPointId: pointId,
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        route={route}
        currentSpotIndex={currentSpotIndex}
        onCapture={handleCapture}
        onClose={handleClose}
      />
      {isProcessing && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <LoadingView />
        </View>
      )}
    </View>
  );
}
