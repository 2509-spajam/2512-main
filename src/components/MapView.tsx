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
import { FONTS } from '../constants/fonts';

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

  // ネオンカラー判定（ボーダーや背景用）
  const getSyncRateColor = (rate: number): string => {
    if (rate >= 95) return '#03FFD1'; // Neon Cyan
    if (rate >= 85) return '#2563EB'; // Blue
    if (rate >= 75) return '#F59E0B'; // Amber
    if (rate >= 60) return '#D97706'; // Dark Orange
    return '#4B5563'; // Gray
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#03FFD1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* スポット一覧 (Legend) */}
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
                      borderColor: getSyncRateColor(completed.syncRate),
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
                      { borderColor: getSyncRateColor(completed.syncRate) },
                    ]}
                  >
                    {/* ★修正: style配列をやめ、styles.legendSyncRateTextのみにしました */}
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

      {/* マップ */}
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
          const zIndex = isSelected ? 100 : completed ? 10 : 1;

          return (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.lat,
                longitude: spot.lng,
              }}
              zIndex={zIndex}
              opacity={0.99}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={isSelected}
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
                      borderColor: getSyncRateColor(completed.syncRate),
                    },
                  ]}
                >
                  <Text style={styles.markerNumber}>{index + 1}</Text>
                </View>
                {completed && (
                  <View
                    style={[
                      styles.syncRateBadge,
                      { 
                        borderColor: getSyncRateColor(completed.syncRate),
                        backgroundColor: '#192130',
                      },
                    ]}
                  >
                    {/* ★修正: style配列をやめ、styles.syncRateTextのみにしました */}
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

      {/* リザルトボタン */}
      {isAllCompleted && (
        <View style={styles.resultButtonContainer}>
          <TouchableOpacity
            style={styles.resultButton}
            onPress={onShowResult}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#03FFD1', '#03FFD1']}
              style={styles.resultButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
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
    borderBottomColor: '#313745',
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 44,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    color: '#03FFD1',
    textAlign: 'center',
    marginRight: 40,
    fontFamily: FONTS.ORBITRON_BOLD,
    textShadowColor: "rgba(3, 255, 209, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  headerSpacer: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  // --- マーカー関連 ---
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 100,
    paddingBottom: 25,
  },
  markerContainerSelected: {
    transform: [{ scale: 1.3 }],
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#192130',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#03FFD1',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  markerNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: FONTS.ORBITRON_BOLD,
  },
  syncRateBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#192130',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  // ★修正: ここで色を指定
  syncRateText: {
    fontSize: 11,
    fontFamily: FONTS.ORBITRON_BOLD,
    color: '#03FFD1', 
  },
  // --- Legend (リスト) ---
  legend: {
    backgroundColor: '#192130',
    borderBottomWidth: 1,
    borderBottomColor: '#313745',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legendTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: FONTS.ORBITRON_BOLD,
    letterSpacing: 1,
  },
  legendScrollView: {},
  legendItems: {
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#192130',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#313745',
  },
  legendMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#313745',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  legendMarkerNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: FONTS.ORBITRON_BOLD,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  legendSyncRate: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 45,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  legendSyncRateText: {
    fontSize: 12,
    fontFamily: FONTS.ORBITRON_BOLD,
    color: '#03FFD1',
  },
  // --- Result Button ---
  resultButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  resultButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#03FFD1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
    color: '#000000',
    fontFamily: FONTS.ORBITRON_BOLD,
    letterSpacing: 1,
  },
});