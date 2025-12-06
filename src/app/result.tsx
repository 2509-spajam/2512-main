import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResultView } from '../components/ResultView';
import { fetchTravelById } from '../services/travelService';
import { TravelRoute, CompletedSpot } from '../types';

const COMPLETED_SPOTS_KEY = 'completedSpots';

export default function Result() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSpots, setCompletedSpots] = useState<CompletedSpot[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!routeId) {
        setLoading(false);
        return;
      }
      try {
        const routeData = await fetchTravelById(routeId);
        setRoute(routeData);

        const stored = await AsyncStorage.getItem(
          `${COMPLETED_SPOTS_KEY}_${routeId}`
        );
        if (stored) {
          setCompletedSpots(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [routeId]);

  useEffect(() => {
    if (!loading && !route) {
      router.replace('/');
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
