import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapViewComponent } from '../src/components/MapView';
import { mockRoutes } from '../src/data/mockData';
import { TravelRoute, CompletedSpot } from '../src/types';

const COMPLETED_SPOTS_KEY = 'completedSpots';

export default function Map() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [completedSpots, setCompletedSpots] = useState<CompletedSpot[]>([]);

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
      console.error('Error loading completed spots:', error);
    }
  }, [routeId]);

  useEffect(() => {
    const foundRoute = mockRoutes.find((r) => r.id === routeId);
    if (!foundRoute) {
      router.replace('/');
      return;
    }
    setRoute(foundRoute);
    loadCompletedSpots();
  }, [routeId, router, loadCompletedSpots]);

  useFocusEffect(
    useCallback(() => {
      loadCompletedSpots();
    }, [loadCompletedSpots])
  );

  if (!route) {
    return null;
  }

  const handleSpotSelect = (spotId: string, spotIndex: number) => {
    router.push({
      pathname: '/camera',
      params: { routeId: route.id, spotIndex: spotIndex.toString() },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleShowResult = () => {
    router.push({
      pathname: '/result',
      params: { routeId: route.id },
    });
  };

  return (
    <MapViewComponent
      route={route}
      completedSpots={completedSpots}
      onSpotSelect={handleSpotSelect}
      onBack={handleBack}
      onShowResult={handleShowResult}
    />
  );
}
