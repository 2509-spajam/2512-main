import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResultView } from '../src/components/ResultView';
import { mockRoutes } from '../src/data/mockData';
import { TravelRoute, CompletedSpot } from '../src/types';

const COMPLETED_SPOTS_KEY = 'completedSpots';

export default function Result() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [completedSpots, setCompletedSpots] = useState<CompletedSpot[]>([]);

  useEffect(() => {
    const foundRoute = mockRoutes.find((r) => r.id === routeId);
    if (!foundRoute) {
      router.replace('/');
      return;
    }
    setRoute(foundRoute);

    const loadCompletedSpots = async () => {
      try {
        const stored = await AsyncStorage.getItem(
          `${COMPLETED_SPOTS_KEY}_${routeId}`
        );
        if (stored) {
          setCompletedSpots(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading completed spots:', error);
      }
    };

    loadCompletedSpots();
  }, [routeId, router]);

  if (!route) {
    return null;
  }

  const handleBack = () => {
    router.replace('/');
  };

  return (
    <ResultView
      route={route}
      completedSpots={completedSpots}
      onBack={handleBack}
    />
  );
}
