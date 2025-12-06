import React from "react";
import { useRouter } from "expo-router";
import { Timeline } from "../components/Timeline";
import { mockRoutes } from "../data/mockData";
import { TravelRoute } from "../types";

export default function TimelinePage() {
  const router = useRouter();

  const handleRouteSelect = (route: TravelRoute) => {
    router.push({
      pathname: "/detail",
      params: { routeId: route.id },
    });
  };

  return <Timeline routes={mockRoutes} onRouteSelect={handleRouteSelect} />;
}
