import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../components/AuthContext";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { TravelRoute } from "../types";
import { fetchTravels } from "../services/travelService";

const ProfileHeader = ({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) => {
  const defaultAvatar = require("../../assets/neko.png");
  const avatarSource: ImageSourcePropType = user?.avatarUrl
    ? { uri: user.avatarUrl }
    : defaultAvatar;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfoSection}>
        <View style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatarImage} />
        </View>
        <Text style={styles.userName}>{user?.name || "Yuki Tanaka"}</Text>
        <Text style={styles.userId}>ID: {user?.id || "user_001"}</Text>
      </View>
    </View>
  );
};

const RouteCard = ({
  route,
  onPress,
}: {
  route: TravelRoute;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
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
          source={require("../../assets/neko.png")}
          style={styles.authorAvatar}
        />
        <Text style={styles.authorName}>{route.authorName}</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* Likes removed */}
        <View style={styles.stats}>
          <Feather name="users" size={14} color="#6B7280" />
          <Text style={styles.statText}>{route.syncAttempts}</Text>
        </View>

      </View>
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"root" | "sync">("root");
  const [routes, setRoutes] = useState<TravelRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTravels();
  }, []);

  const loadTravels = async () => {
    try {
      setLoading(true);
      const data = await fetchTravels();
      setRoutes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: "/detail",
      params: { routeId: route.id },
    });
  };

  const myRoutes = routes.filter((route) => route.userId === user?.id);
  const rootRoutes = myRoutes.filter((route) => !route.originTravelId);
  const syncRoutes = myRoutes.filter((route) => !!route.originTravelId);

  const displayRoutes = activeTab === "root" ? rootRoutes : syncRoutes;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ProfileHeader user={user} onLogout={logout} />

        <View style={styles.tabs}>
          <TabButton
            label="ルート"
            isActive={activeTab === "root"}
            onPress={() => setActiveTab("root")}
          />
          <TabButton
            label="シンクロ履歴"
            isActive={activeTab === "sync"}
            onPress={() => setActiveTab("sync")}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#03FFD1" />
          </View>
        ) : (
          <FlatList
            data={displayRoutes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RouteCard route={item} onPress={() => handleRouteSelect(item)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>ルートがありません</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const TabButton = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.tabActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerContainer: {
    backgroundColor: "transparent",
    paddingTop: 10,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#03FFD1",
    textShadowColor: "#03FFD1",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EF4444",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  userInfoSection: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#192130",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userId: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#03FFD1",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#03FFD1",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
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
  card: {
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
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  spotBadge: {
    position: "absolute",
    top: 12,
    right: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  spotBadgeText: {
    fontSize: 18,
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
  distanceText: {
    fontSize: 11,
    color: "#6B7280",
  },
});
