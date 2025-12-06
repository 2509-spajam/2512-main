import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Timeline } from './src/components/Timeline';
import { RouteDetail } from './src/components/RouteDetail';
import { MapViewComponent } from './src/components/MapView';
import { CameraView } from './src/components/CameraView';
import { SpotResultView } from './src/components/SpotResultView';
import { ResultView } from './src/components/ResultView';
import { mockRoutes } from './src/data/mockData';
import { TravelRoute, CompletedSpot } from './src/types';

type View = 'timeline' | 'detail' | 'map' | 'camera' | 'spotResult' | 'result';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('timeline');
  const [selectedRoute, setSelectedRoute] = useState<TravelRoute | null>(null);
  const [completedSpots, setCompletedSpots] = useState<CompletedSpot[]>([]);
  const [selectedSpotIndex, setSelectedSpotIndex] = useState<number>(0);

  const handleRouteSelect = (route: TravelRoute) => {
    setSelectedRoute(route);
    setCurrentView('detail');
  };

  const handleStartSync = () => {
    if (!selectedRoute) return;
    setCompletedSpots([]);
    setCurrentView('map');
  };

  const handleSpotSelect = (spotId: string, spotIndex: number) => {
    if (!selectedRoute) return;
    setSelectedSpotIndex(spotIndex);
    setCurrentView('camera');
  };

  const handleCapture = (spotId: string) => {
    if (!selectedRoute) return;

    const syncRate = Math.floor(Math.random() * 30) + 70;
    const spot = selectedRoute.spots[selectedSpotIndex];

    const completedSpot: CompletedSpot = {
      spotId,
      syncRate,
      timestamp: new Date().toISOString(),
      userImageUrl: spot.imageUrl,
    };

    const newCompletedSpots = [
      ...completedSpots.filter((s) => s.spotId !== spotId),
      completedSpot,
    ];

    setCompletedSpots(newCompletedSpots);
    setCurrentView('spotResult');
  };

  const handleBackToTimeline = () => {
    setCurrentView('timeline');
    setSelectedRoute(null);
    setCompletedSpots([]);
    setSelectedSpotIndex(0);
  };

  const handleBackToMap = () => {
    setCurrentView('map');
  };

  const handleCloseCamera = () => {
    setCurrentView('map');
  };

  const handleShowResult = () => {
    setCurrentView('result');
  };

  return (
    <>
      {currentView === 'timeline' && (
        <Timeline routes={mockRoutes} onRouteSelect={handleRouteSelect} />
      )}

      {currentView === 'detail' && selectedRoute && (
        <RouteDetail
          route={selectedRoute}
          onBack={handleBackToTimeline}
          onStartSync={handleStartSync}
        />
      )}

      {currentView === 'map' && selectedRoute && (
        <MapViewComponent
          route={selectedRoute}
          completedSpots={completedSpots}
          onSpotSelect={handleSpotSelect}
          onBack={handleBackToTimeline}
          onShowResult={handleShowResult}
        />
      )}

      {currentView === 'camera' && selectedRoute && (
        <CameraView
          route={selectedRoute}
          currentSpotIndex={selectedSpotIndex}
          onCapture={handleCapture}
          onClose={handleCloseCamera}
        />
      )}

      {currentView === 'spotResult' && selectedRoute && (() => {
        const completedSpot = completedSpots.find(
          (s) => s.spotId === selectedRoute.spots[selectedSpotIndex].id
        );
        if (!completedSpot) {
          setCurrentView('map');
          return null;
        }
        return (
          <SpotResultView
            spot={selectedRoute.spots[selectedSpotIndex]}
            completedSpot={completedSpot}
            onBackToMap={handleBackToMap}
          />
        );
      })()}

      {currentView === 'result' && selectedRoute && (
        <ResultView
          route={selectedRoute}
          completedSpots={completedSpots}
          onBack={handleBackToTimeline}
        />
      )}

      <StatusBar style="auto" />
    </>
  );
}
