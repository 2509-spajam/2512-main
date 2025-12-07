import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MapViewComponent } from "../components/MapView";
import { LoadingView } from "../components/LoadingView";
import { COLORS } from "../constants/colors";
import { fetchTravelById } from "../services/travelService";
import { TravelRoute, CompletedSpot } from "../types";
import { calculateDistance } from "../utils/location";

const COMPLETED_SPOTS_KEY = "completedSpots";
const MAX_DISTANCE_METERS = 100;

export default function Map() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSpots, setCompletedSpots] = useState<CompletedSpot[]>([]);
  const [isCheckingDistance, setIsCheckingDistance] = useState(false);

  const loadCompletedSpots = useCallback(async () => {
    if (!routeId) return;
    try {
      const stored = await AsyncStorage.getItem(
        `${COMPLETED_SPOTS_KEY}_${routeId}`
      );
      if (stored) {
        setCompletedSpots(JSON.parse(stored));
      } else {
        setCompletedSpots([]);
      }
    } catch (error) {
      console.error("Error loading completed spots:", error);
    }
  }, [routeId]);

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
    } else if (!loading && route) {
      loadCompletedSpots();
    }
  }, [loading, route, router, loadCompletedSpots]);

  useFocusEffect(
    useCallback(() => {
      loadCompletedSpots();
    }, [loadCompletedSpots])
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "transparent",
        }}
      >
        <ActivityIndicator size="large" color="#03FFD1" />
      </View>
    );
  }

  if (!route) {
    return null;
  }

  const handleSpotSelect = async (spotId: string, spotIndex: number) => {
    if (!route) return;

    const spot = route.spots[spotIndex];
    if (!spot) return;

    setIsCheckingDistance(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsCheckingDistance(false);
        Alert.alert(
          "位置情報の権限が必要",
          "撮影するには位置情報の権限が必要です。設定から位置情報の権限を許可してください。"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;
      const distance = calculateDistance(
        currentLat,
        currentLng,
        spot.lat,
        spot.lng
      );

      if (distance > MAX_DISTANCE_METERS) {
        setIsCheckingDistance(false);
        Alert.alert(
          "撮影ポイントから離れています",
          `撮影ポイントから${Math.round(
            distance
          )}m離れています。\n撮影ポイントから${MAX_DISTANCE_METERS}m以内に近づいてください。`,
          [{ text: "OK" }]
        );
        return;
      }

      router.push({
        pathname: "/camera",
        params: { routeId: route.id, spotIndex: spotIndex.toString() },
      });
    } catch (error) {
      setIsCheckingDistance(false);
      console.error("Error checking distance:", error);
      Alert.alert("エラー", "位置情報の取得に失敗しました。");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleShowResult = () => {
    router.push({
      pathname: "/result",
      params: { routeId: route.id },
    });
  };

  return (
    <>
      <MapViewComponent
        route={route}
        completedSpots={completedSpots}
        onSpotSelect={handleSpotSelect}
        onBack={handleBack}
        onShowResult={handleShowResult}
      />
      {isCheckingDistance && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <LoadingView showProgress={false} />
        </View>
      )}
    </>
  );
}
