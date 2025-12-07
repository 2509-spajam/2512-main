import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TravelSpot, CompletedSpot } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";

interface SpotResultViewProps {
  spot: TravelSpot;
  completedSpot: CompletedSpot;
  onBackToMap: () => void;
}

const { width } = Dimensions.get("window");

export function SpotResultView({
  spot,
  completedSpot,
  onBackToMap,
}: SpotResultViewProps) {
  const getRankMessage = (rate: number) => {
    if (rate >= 95)
      return { rank: "S", message: "完璧なシンクロ！", color: "#FBBF24" };
    if (rate >= 85)
      return { rank: "A", message: "素晴らしい！", color: "#3B82F6" };
    if (rate >= 75)
      return { rank: "B", message: "よくできました！", color: "#10B981" };
    if (rate >= 60)
      return { rank: "C", message: "もう少し！", color: "#F97316" };
    return { rank: "D", message: "再チャレンジ！", color: "#6B7280" };
  };

  const result = getRankMessage(completedSpot.syncRate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>撮影結果</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.trophyIcon}>
            <Feather name="award" size={48} color={result.color} />
          </View>
          <Text style={styles.spotName}>{spot.name}</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>
              {completedSpot.syncRate}
              <Text style={styles.scoreUnit}>%</Text>
            </Text>
            <Text style={[styles.rankText, { color: result.color }]}>
              {result.rank}
            </Text>
          </View>

          <Text style={styles.messageText}>{result.message}</Text>
        </View>

        <View style={styles.comparisonContainer}>
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>元の写真</Text>
            <Image
              source={{ uri: spot.imageUrl }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>あなたの写真</Text>
            <Image
              source={{
                uri: completedSpot.userImageUrl || spot.imageUrl,
              }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.timeInfo}>
          <Feather name="clock" size={14} color="#6B7280" />
          <Text style={styles.timeText}>
            {new Date(completedSpot.timestamp)
              .toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(/\//g, "-")
              .replace(
                /(\d{4})-(\d{2})-(\d{2}), (\d{2}):(\d{2})/,
                "$1-$2-$3 $4:$5"
              )}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToMap}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#03FFD1", "#03FFD1"]}
            style={styles.backButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="map" size={20} color="#000" />
            <Text style={styles.backButtonText}>マップに戻る</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#313745",
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#03FFD1",
    textAlign: "center",
    fontFamily: FONTS.ORBITRON_BOLD,
    textShadowColor: "rgba(3, 255, 209, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    backgroundColor: "#374151",
    borderRadius: 24,
    padding: 32,
    margin: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 64,
    color: "#03FFD1",
    fontVariant: ["tabular-nums"],
    fontFamily: FONTS.ORBITRON_BOLD,
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginLeft: 16,
  },
  scoreUnit: {
    fontSize: 32,
    color: "#03FFD1",
    fontFamily: FONTS.ORBITRON_BOLD,
    marginLeft: 12,
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  rankText: {
    fontSize: 48,
    marginTop: 8,
    fontFamily: FONTS.ORBITRON_BOLD,
  },
  messageText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 16,
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  imageSection: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  comparisonImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: 13,
    color: "#6B7280",
  },
  footer: {
    padding: 16,
  },
  backButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
