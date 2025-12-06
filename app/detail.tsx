import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RouteDetail } from '../src/components/RouteDetail';
import { mockRoutes } from '../src/data/mockData';

export default function Detail() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const route = mockRoutes.find((r) => r.id === routeId);

  if (!route) {
    router.replace('/');
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  const handleStartSync = () => {
    router.push({
      pathname: '/map',
      params: { routeId: route.id },
    });
  };

  return (
    <RouteDetail route={route} onBack={handleBack} onStartSync={handleStartSync} />
  );
}
