import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TravelRoute } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";

interface RouteDetailProps {
  route: TravelRoute;
  onBack: () => void;
  onStartSync: () => void;
  onShowOriginal?: () => void;
}

const { width } = Dimensions.get("window");

export function RouteDetail({
  route,
  onBack,
  onStartSync,
  onShowOriginal,
}: RouteDetailProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = Array.from(
    new Set([route.coverImage, ...route.spots.map((spot) => spot.imageUrl)])
  ).filter(Boolean);

  const totalImages = images.length;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor((contentOffsetX + width / 2) / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#03FFD1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ルート詳細</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.slideImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.gradient}
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageTitle}>{route.title}</Text>
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: route.authorAvatar }}
                style={styles.authorAvatarLarge}
              />
              <Text style={styles.authorNameLarge}>{route.authorName}</Text>
            </View>
          </View>

          {totalImages > 0 && (
            <View style={styles.pagerContainer}>
              <Text style={styles.pagerText}>
                {activeIndex + 1} / {totalImages}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.description}>{route.description}</Text>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Feather name="map" size={20} color="#03FFD1" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>距離</Text>
                <Text style={styles.statValue}>{route.totalDistance}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Feather name="clock" size={20} color="#03FFD1" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>所要時間</Text>
                <Text style={styles.statValue}>{route.duration}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Feather name="map-pin" size={20} color="#03FFD1" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>スポット数</Text>
                <Text style={styles.statValue}>{route.spots.length} 箇所</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.spotsSection}>
          <Text style={styles.sectionTitle}>撮影スポット</Text>
          {route.spots.map((spot, index) => (
            <View key={spot.id} style={styles.spotCard}>
              <View style={styles.spotNumber}>
                <Text style={styles.spotNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.spotInfo}>
                <Text style={styles.spotName}>{spot.name}</Text>
                <View style={styles.spotLocation}>
                  <Feather name="map-pin" size={14} color="#6B7280" />
                  <Text style={styles.spotLocationText}>
                    {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                  </Text>
                </View>
              </View>
              <Image
                source={{ uri: spot.imageUrl }}
                style={styles.spotImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {route.originTravelId && (
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                marginBottom: 12,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#2563EB",
              },
            ]}
            onPress={onShowOriginal}
            activeOpacity={0.8}
          >
            <View style={styles.startButtonGradient}>
              <Text style={[styles.startButtonText, { color: "#2563EB" }]}>
                元旅行を見る
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStartSync}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#03FFD1", "#03FFD1"]}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>シンクロを開始する</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#03FFD1",
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 320,
    position: "relative",
    overflow: "hidden",
  },
  slideImage: {
    width,
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  imageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatarLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 8,
  },
  authorNameLarge: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  pagerContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  pagerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: FONTS.ORBITRON_BOLD,
  },
  infoSection: {
    padding: 24,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: "#192130",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  metaStats: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 24,
  },
  metaStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaStatText: {
    fontSize: 13,
    color: "#6B7280",
  },
  spotsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 16,
  },
  spotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#192130",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  spotNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#03FFD1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  spotNumberText: {
    fontSize: 18,
    // fontWeight: "600", // フォント自体が太字なので削除
    color: "#000",
    fontFamily: FONTS.ORBITRON_BOLD, // ここを追加
  },
  spotInfo: {
    flex: 1,
    marginRight: 12,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  spotLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  spotLocationText: {
    fontSize: 13,
    color: "#6B7280",
  },
  spotImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: "transparent",
  },
  startButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
