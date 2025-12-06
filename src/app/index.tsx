import React, { useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Timeline } from "../components/Timeline";
import { LoadingView } from "../components/LoadingView";
import { fetchTravels } from "../services/travelService";
import { TravelRoute } from "../types";
import { sessionState } from "../lib/session";
import { COLORS } from "../constants/colors";

export default function HomeScreen() {
  const router = useRouter();

  if (!sessionState.hasSeenKV) {
    return <Redirect href="/welcome" />;
  }

  const [routes, setRoutes] = React.useState<TravelRoute[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const progressRef = useRef(0);
  const animationTimerRef = React.useRef<any>(null);
  const [activeTab, setActiveTab] = React.useState<"original" | "sync">(
    "original"
  );

  React.useEffect(() => {
    loadTravels();
  }, [activeTab]);

  React.useEffect(() => {
    if (!loading) {
      setLoadingProgress(0);
      progressRef.current = 0;
      return;
    }

    const duration = 2500;
    const steps = 100;
    const increment = 100 / steps;
    const interval = duration / steps;

    let currentStep = 0;
    animationTimerRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        if (progressRef.current < 100) {
          setLoadingProgress(99);
        } else {
          setLoadingProgress(100);
          if (animationTimerRef.current) {
            clearInterval(animationTimerRef.current);
          }
        }
      } else {
        const newProgress = Math.min(increment * currentStep, 99);
        progressRef.current = newProgress;
        setLoadingProgress(newProgress);
      }
    }, interval);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [loading]);

  const loadTravels = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      progressRef.current = 0;
      const data = await fetchTravels(activeTab);
      setRoutes(data);
    } catch (e) {
      console.error(e);
    } finally {
      progressRef.current = 100;
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: "/detail",
      params: { routeId: route.id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Re:Write</Text>
      </View>

      <View style={styles.tabContainer}>
        <Text
          style={[styles.tab, activeTab === "original" && styles.activeTab]}
          onPress={() => setActiveTab("original")}
        >
          みんなの投稿
        </Text>
        <Text
          style={[styles.tab, activeTab === "sync" && styles.activeTab]}
          onPress={() => setActiveTab("sync")}
        >
          みんなのシンクロ
        </Text>
      </View>
      {loading ? (
        <LoadingView progress={loadingProgress} />
      ) : (
        <Timeline routes={routes} onRouteSelect={handleRouteSelect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
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
  tabContainer: {
    flexDirection: "row",
    padding: 10,
    // backgroundColor: "#192130",
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  tab: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  activeTab: {
    color: "#03FFD1",
    borderBottomWidth: 2,
    borderBottomColor: "#03FFD1",
  },
});
