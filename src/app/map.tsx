import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapViewComponent } from '../components/MapView';
import { COLORS } from '../constants/colors';
import { fetchTravelById } from '../services/travelService';
import { TravelRoute, CompletedSpot } from '../types';

const COMPLETED_SPOTS_KEY = 'completedSpots';

export default function Map() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
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
      router.replace('/');
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}>
        <ActivityIndicator size="large" color="#03FFD1" />
      </View>
    );
  }

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
