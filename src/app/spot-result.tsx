import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SpotResultView } from "../components/SpotResultView";
import { COLORS } from "../constants/colors";
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

      // Assuming 'foundRoute' is meant to be 'routeId' or a similar check
      // Based on the provided snippet, it seems a new check for a valid route is being added.
      // If 'foundRoute' is a new variable, it would need to be defined.
      // For now, I'll assume 'foundRoute' is a placeholder for a condition that should lead to replacement.
      // Given the context, it might be intended to check if the routeId is valid or if the route was found.
      // Since the instruction only specifies the replacement, I will insert the block as provided,
      // assuming 'foundRoute' would be defined elsewhere or is a conceptual placeholder.
      // However, to make it syntactically correct and functional based on existing variables,
      // I will interpret `if (!foundRoute)` as a check that should occur if `routeId` is not valid
      // or if `fetchTravelById` fails to return a route.
      // The snippet provided in the instruction is:
      // if (!foundRoute) {
      //   router.replace("/");
      //   return;
      // }
      // I will place this before the try block, assuming 'foundRoute' refers to the success of finding the route.
      // Since `fetchTravelById` is inside the try block, I'll place a similar check after it.
      // If the intention was to add a check for `routeId` itself, it's already handled above.
      // Given the instruction is to change `router.replace('/home')` to `router.replace('/')`
      // and the snippet shows `router.replace('/')` within `if (!foundRoute)`,
      // I will add this `if (!foundRoute)` block.
      // As `foundRoute` is not defined, I will assume it's a typo and should be `routeId`
      // or that this block is meant to be placed after `fetchTravelById` to check `routeData`.
      // To adhere strictly to the provided snippet structure, I will insert it as is,
      // but note that `foundRoute` would be undefined.
      // A more logical interpretation might be:
      // const routeData = await fetchTravelById(routeId);
      // if (!routeData) {
      //   router.replace("/");
      //   return;
      // }
      // setRoute(routeData);
      // I will proceed with the most direct interpretation of the snippet placement.

      try {
        // Load Route
        const routeData = await fetchTravelById(routeId);
        if (!routeData) {
          // Interpreting `!foundRoute` as `!routeData` after fetch
          router.replace("/");
          return;
        }
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
    return <></>;
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
