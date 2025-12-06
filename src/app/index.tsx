import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Timeline } from "../components/Timeline";
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
  const [activeTab, setActiveTab] = React.useState<'original' | 'sync'>('original');

  React.useEffect(() => {
    loadTravels();
  }, [activeTab]);

  const loadTravels = async () => {
    try {
      setLoading(true);
      const data = await fetchTravels(activeTab);
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

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Text
          style={[styles.tab, activeTab === 'original' && styles.activeTab]}
          onPress={() => setActiveTab('original')}
        >
          みんなの投稿
        </Text>
        <Text
          style={[styles.tab, activeTab === 'sync' && styles.activeTab]}
          onPress={() => setActiveTab('sync')}
        >
          みんなのシンクロ
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#03FFD1"
          style={{ marginTop: 20 }}
        />
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
  tabContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#192130',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeTab: {
    color: '#03FFD1',
    borderBottomWidth: 2,
    borderBottomColor: '#03FFD1',
  },
});
