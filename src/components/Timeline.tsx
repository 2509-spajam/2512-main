// ...existing code...
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TravelRoute } from '../types';

interface TimelineProps {
  routes: TravelRoute[];
  onRouteSelect: (route: TravelRoute) => void;
}

const { width } = Dimensions.get('window');
// const cardWidth = (width - 48) / 2; // 2列用の計算 → 削除/未使用に変更

export function Timeline({ routes, onRouteSelect }: TimelineProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>未定</Text>
        <Text style={styles.subtitle}>未定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tabs removed */}

        <View style={styles.grid}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={styles.card}
              onPress={() => onRouteSelect(route)}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: route.coverImage }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
                <View style={styles.spotBadge}>
                  <Text style={styles.spotBadgeText}>
                    {route.spots.length} スポット
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {route.title}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {route.description}
                </Text>

                <View style={styles.authorContainer}>
                  <Image
                    source={{ uri: route.authorAvatar }}
                    style={styles.authorAvatar}
                  />
                  <Text style={styles.authorName}>{route.authorName}</Text>
                </View>

                <View style={styles.statsContainer}>
                  <Text style={styles.distanceText}>
                    {route.totalDistance} · {route.duration}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
// ...existing code...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingBottom: 12,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  grid: {
    // 2列から1列に変更
    flexDirection: 'column',
    padding: 16,
    // gap は環境によって非対応のため使用しない
  },
  card: {
    // 1列表示に合わせて幅を100%に、下マージンで間隔をつくる
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  spotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  spotBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 13,
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap を使わない場合は適宜 margin を使って調整可能
    marginRight: 8,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
});