import React from 'react';
import { useRouter } from 'expo-router';
import { Timeline } from '../src/components/Timeline';
import { mockRoutes } from '../src/data/mockData';
import { TravelRoute } from '../src/types';

export default function Index() {
  const router = useRouter();

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: '/detail',
      params: { routeId: route.id },
    });
  };

  return (
    <Timeline routes={mockRoutes} onRouteSelect={handleRouteSelect} />
  );
}
