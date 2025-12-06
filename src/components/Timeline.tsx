import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { TravelRoute } from "../types";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";

interface TimelineProps {
  routes: TravelRoute[];
  onRouteSelect: (route: TravelRoute) => void;
}

export function Timeline({ routes, onRouteSelect }: TimelineProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Quest</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    {route.spots.length} check points
                  </Text>
                </View>
                <View style={styles.syncroRate}>
                  <Text style={styles.syncroRateText}>Syncro Rate</Text>
                  <Text style={styles.syncroRateTextValue}>75 %</Text>
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
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#313745",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#03FFD1",
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  grid: {
    // 2列から1列に変更
    flexDirection: "column",
    padding: 16,
    // gap は環境によって非対応のため使用しない
  },
  card: {
    // 1列表示に合わせて幅を100%に、下マージンで間隔をつくる
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#192130",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#313745",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  spotBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  spotBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.ORBITRON_BOLD,
    color: "#ffffff",
  },
  syncroRate: {
    position: "absolute",
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncroRateText: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: FONTS.ORBITRON_BOLD,
  },
  syncroRateTextValue: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: FONTS.ORBITRON_BOLD,
    color: "#03FFD1",
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#313745",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  statText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 11,
    color: "#6B7280",
  },
});
