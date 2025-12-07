import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResultView } from '../components/ResultView';
import { COLORS } from '../constants/colors';
import { fetchTravelById, saveSynchroTravel } from '../services/travelService';
import { TravelRoute, CompletedSpot } from '../types';

const COMPLETED_SPOTS_KEY = 'completedSpots';

export default function Result() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSpots, setCompletedSpots] = useState<CompletedSpot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const hasSavedRef = React.useRef(false); // To prevent double saving on re-renders

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
          const spots: CompletedSpot[] = JSON.parse(stored);
          setCompletedSpots(spots);

          // Auto-save travel if not already saved
          if (spots.length > 0 && !hasSavedRef.current) {
            hasSavedRef.current = true;
            setIsSaving(true);
            const pointIds = spots
              .map(s => s.createdPointId)
              .filter((id): id is string => !!id);

            if (pointIds.length > 0) {
              await saveSynchroTravel(routeId, pointIds);
            }
            setIsSaving(false);
          }
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

  if (loading || isSaving) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }}>
        <ActivityIndicator size="large" color="#03FFD1" />
        {isSaving && <Text style={{ marginTop: 10, color: '#666' }}>保存中...</Text>}
      </View>
    );
  }

  if (!route) {
    return null;
  }

  const handleBack = () => {
    router.replace('/');
  };

  const handleShowOriginal = () => {
    if (route && route.originTravelId) {
      router.push({
        pathname: "/detail",
        params: { routeId: route.originTravelId },
      });
    }
  };

  return (
    <ResultView
      route={route}
      completedSpots={completedSpots}
      onBack={handleBack}
      onShowOriginal={handleShowOriginal}
    />
  );
}
