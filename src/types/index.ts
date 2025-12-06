export interface TravelSpot {
  id: string;
  name: string;
  imageUrl: string;
  lat: number;
  lng: number;
  order: number;
}

export interface TravelRoute {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string;
  coverImage: string;
  spots: TravelSpot[];
  likes: number;
  syncAttempts: number;
  createdAt: string;
  description: string;
  totalDistance: string;
  duration: string;
  originTravelId?: string;
  userId: string;
}

export interface SyncProgress {
  routeId: string;
  currentSpotIndex: number;
  completedSpots: CompletedSpot[];
  startedAt: string;
}

export interface CompletedSpot {
  spotId: string;
  userImageUrl?: string;
  syncRate: number;
  timestamp: string;
  createdPointId?: string;
}
