import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TravelRoute, CompletedSpot } from '../types';
import { COLORS } from '../constants/colors';

interface MapViewProps {
  route: TravelRoute;
  completedSpots: CompletedSpot[];
  onSpotSelect: (spotId: string, spotIndex: number) => void;
  onBack: () => void;
  onShowResult: () => void;
}

const { width, height } = Dimensions.get('window');

export function MapViewComponent({
  route,
  completedSpots,
  onSpotSelect,
  onBack,
  onShowResult,
}: MapViewProps) {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const isAllCompleted = route.spots.every((spot) =>
    completedSpots.some((completed) => completed.spotId === spot.id)
  );

  const shouldScroll = route.spots.length >= 6;
  const scrollViewStyle = shouldScroll ? { maxHeight: 300 } : {};

  const initialRegion = useMemo(() => {
    if (route.spots.length === 0) {
      return {
        latitude: 35.6762,
        longitude: 139.6503,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const lats = route.spots.map((spot) => spot.lat);
    const lngs = route.spots.map((spot) => spot.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latDelta = (maxLat - minLat) * 1.5 || 0.01;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.01;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }, [route.spots]);

  const getCompletedSpot = (spotId: string): CompletedSpot | undefined => {
    return completedSpots.find((spot) => spot.spotId === spotId);
  };

  const getSyncRateColor = (rate: number): string => {
    if (rate >= 95) return '#FBBF24';
    if (rate >= 85) return '#3B82F6';
    if (rate >= 75) return '#10B981';
    if (rate >= 60) return '#F97316';
    return '#6B7280';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>撮影スポット</Text>
        <ScrollView
          style={[styles.legendScrollView, scrollViewStyle]}
          contentContainerStyle={styles.legendItems}
          showsVerticalScrollIndicator={shouldScroll}
          nestedScrollEnabled={true}
          bounces={shouldScroll}
        >
          {route.spots.map((spot, index) => {
            const completed = getCompletedSpot(spot.id);
            return (
              <TouchableOpacity
                key={spot.id}
                style={styles.legendItem}
                onPress={() => {
                  setSelectedSpotId(spot.id);
                  onSpotSelect(spot.id, index);
                }}
              >
                <View
                  style={[
                    styles.legendMarker,
                    completed && {
                      backgroundColor: getSyncRateColor(completed.syncRate),
                    },
                  ]}
                >
                  <Text style={styles.legendMarkerNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.legendText} numberOfLines={1}>
                  {spot.name}
                </Text>
                {completed && (
                  <View
                    style={[
                      styles.legendSyncRate,
                      { backgroundColor: getSyncRateColor(completed.syncRate) },
                    ]}
                  >
                    <Text style={styles.legendSyncRateText}>
                      {completed.syncRate}%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {route.spots.map((spot, index) => {
          const completed = getCompletedSpot(spot.id);
          const isSelected = selectedSpotId === spot.id;

          return (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.lat,
                longitude: spot.lng,
              }}
              onPress={() => {
                setSelectedSpotId(spot.id);
                onSpotSelect(spot.id, index);
              }}
            >
              <View
                style={[
                  styles.markerContainer,
                  isSelected && styles.markerContainerSelected,
                ]}
              >
                <View
                  style={[
                    styles.markerPin,
                    completed && {
                      backgroundColor: getSyncRateColor(completed.syncRate),
                    },
                  ]}
                >
                  <Text style={styles.markerNumber}>{index + 1}</Text>
                </View>
                {completed && (
                  <View
                    style={[
                      styles.syncRateBadge,
                      { backgroundColor: getSyncRateColor(completed.syncRate) },
                    ]}
                  >
                    <Text style={styles.syncRateText}>
                      {completed.syncRate}%
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {isAllCompleted && (
        <View style={styles.resultButtonContainer}>
          <TouchableOpacity
            style={styles.resultButton}
            onPress={onShowResult}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              style={styles.resultButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Feather name="award" size={20} color="#FFFFFF" />
              <Text style={styles.resultButtonText}>リザルトを見る</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingTop: 44,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  syncRateBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  syncRateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  legend: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  legendScrollView: {
  },
  legendItems: {
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  legendMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legendMarkerNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  legendSyncRate: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 45,
    alignItems: 'center',
  },
  legendSyncRateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  resultButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
