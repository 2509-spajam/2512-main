import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelRoute, TravelSpot } from '../types';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';

// Helper to get authenticated user ID from AsyncStorage
const getUserId = async (): Promise<string | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem('@auth_user');
    if (jsonValue != null) {
      const user = JSON.parse(jsonValue);
      return user.id;
    }
    return null;
  } catch (e) {
    console.error("Failed to get user ID", e);
    return null;
  }
};

export const fetchTravels = async (type: 'all' | 'original' | 'sync' = 'all'): Promise<TravelRoute[]> => {
  try {
    // 1. Fetch travels with user info (assuming a relation or basic join if foreign key exists)
    // defined constraint: travels_user_id_fkey foreign KEY (user_id) references users (id)
    let query = supabase
      .from('travels')
      .select(`
        *,
        users (
          name
        )
      `)
      .order('started_at', { ascending: false });

    // Apply filters
    if (type === 'original') {
      // Original travels have null origin_travel_id
      query = query.is('origin_travel_id', null);
    } else if (type === 'sync') {
      // Sync travels have a non-null origin_travel_id
      query = query.not('origin_travel_id', 'is', null);
    }

    const { data: travels, error: travelError } = await query;

    if (travelError) {
      console.error('Error fetching travels:', travelError);
      throw travelError;
    }

    if (!travels) return [];

    // 2. Fetch all points for efficiency (or could fetch per travel, but batch is better)
    // Since we lack a direct "travel_id" on points in the schema provided by user?
    // User schema for points: id, created_at, lat, lng, visited_at.
    // Wait, the `travels` table has `points uuid[]`. So we have the IDs of points in the travel row.

    // Let's gather all point IDs from all travels
    const allPointIds = travels.flatMap(t => t.points || []);

    let pointsMap: Record<string, any> = {};

    if (allPointIds.length > 0) {
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('*')
        .in('id', allPointIds);

      if (pointsError) {
        console.error('Error fetching points:', pointsError);
        // Continue without points or throw? Let's continue with empty points to show the travel at least.
      } else {
        pointsData?.forEach(p => {
          pointsMap[p.id] = p;
        });
      }
    }

    // 3. Map to TravelRoute
    const routes: TravelRoute[] = travels.map(travel => {
      // Resolve points
      const travelPoints: TravelSpot[] = (travel.points || []).map((pointId: string, index: number) => {
        const p = pointsMap[pointId];
        if (!p) return null;

        // Generate Public URL for the image
        const imageUrl = p.filepath
          ? supabase.storage.from('points').getPublicUrl(p.filepath.trim()).data.publicUrl
          : 'https://placehold.co/600x400?text=No+Image';

        return {
          id: p.id,
          name: `Spot ${index + 1}`, // Placeholder as per plan
          imageUrl: imageUrl,
          lat: p.lat,
          lng: p.lng,
          order: index + 1
        };
      }).filter((p: any): p is TravelSpot => p !== null);

      // Duration calculation
      const start = new Date(travel.started_at);
      const end = new Date(travel.finished_at);
      const diffMs = end.getTime() - start.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const durationStr = `${diffHrs}時間`;

      // Use the first spot's image as the cover image, or a placeholder
      const coverImage = travelPoints.length > 0
        ? travelPoints[0].imageUrl
        : 'https://placehold.co/600x400?text=Cover';

      return {
        id: travel.id,
        title: travel.title,
        authorName: travel.users?.name || 'Unknown User',
        authorAvatar: 'https://placehold.co/150?text=User', // Placeholder
        coverImage: coverImage,
        spots: travelPoints,
        likes: 0, // Placeholder
        syncAttempts: 0, // Placeholder
        createdAt: travel.started_at,
        description: travel.description || '',
        totalDistance: '--- km', // Placeholder, calculation would need lat/lng math
        duration: durationStr,
        originTravelId: travel.origin_travel_id
      };
    });

    return routes;
  } catch (error) {
    console.error('Unexpected error in fetchTravels:', error);
    return [];
  }
};

export const fetchTravelById = async (id: string): Promise<TravelRoute | null> => {
  try {
    const { data: travels, error: travelError } = await supabase
      .from('travels')
      .select(`
        *,
        users (
          name
        )
      `)
      .eq('id', id)
      .limit(1);

    if (travelError) {
      console.error('Error fetching travel:', travelError);
      throw travelError;
    }

    if (!travels || travels.length === 0) return null;

    const travel = travels[0];
    let pointIds = travel.points || [];

    // NOTE: Previously we swapped points with origin points here.
    // We removed that to allow the detail view of a Sync travel to show the USER'S photos.
    // If the original route is needed, client should request it via origin_travel_id.

    let pointsMap: Record<string, any> = {};

    if (pointIds.length > 0) {
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('*')
        .in('id', pointIds);

      if (pointsError) {
        console.error('Error fetching points:', pointsError);
      } else {
        pointsData?.forEach(p => {
          pointsMap[p.id] = p;
        });
      }
    }

    // Map to TravelRoute
    const travelPoints: TravelSpot[] = pointIds.map((pointId: string, index: number) => {
      const p = pointsMap[pointId];
      if (!p) return null;

      // Generate Public URL for the image
      const imageUrl = p.filepath
        ? supabase.storage.from('points').getPublicUrl(p.filepath.trim()).data.publicUrl
        : 'https://placehold.co/600x400?text=No+Image';

      return {
        id: p.id,
        name: `Spot ${index + 1}`,
        imageUrl: imageUrl,
        lat: p.lat,
        lng: p.lng,
        order: index + 1
      };
    }).filter((p: any): p is TravelSpot => p !== null);

    // Duration calculation
    const start = new Date(travel.started_at);
    const end = new Date(travel.finished_at);
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const durationStr = `${diffHrs}時間`;

    const coverImage = travelPoints.length > 0
      ? travelPoints[0].imageUrl
      : 'https://placehold.co/600x400?text=Cover';

    return {
      id: travel.id,
      title: travel.title,
      authorName: travel.users?.name || 'Unknown User',
      authorAvatar: 'https://placehold.co/150?text=User',
      coverImage: coverImage,
      spots: travelPoints,
      likes: 0,
      syncAttempts: 0,
      createdAt: travel.started_at,
      description: travel.description || '',
      totalDistance: '--- km',
      duration: durationStr,
      originTravelId: travel.origin_travel_id
    };
  } catch (error) {
    console.error('Unexpected error in fetchTravelById:', error);
    return null;
  }
};

// --- Sync & Camera Integration ---

export const saveSynchroTravel = async (originTravelId: string, pointIds: string[]): Promise<string | null> => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Get origin travel title to append (Sync)
    const { data: origin } = await supabase
      .from('travels')
      .select('title')
      .eq('id', originTravelId)
      .single();

    const newTitle = origin ? `${origin.title} (Sync)` : 'Synchro Travel';
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('travels')
      .insert({
        user_id: userId,
        origin_travel_id: originTravelId,
        started_at: now,
        finished_at: now, // Set finished_at as we are saving at the end
        title: newTitle,
        points: pointIds
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving synchro travel:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Unexpected error in saveSynchroTravel:', error);
    return null;
  }
};



export const uploadPointImage = async (uri: string): Promise<string | null> => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const ext = uri.split('.').pop() || 'jpg';
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    const filename = `${userId}/${timestamp}.${ext}`;

    // Use FileSystem and Buffer for reliable upload in Expo/RN
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    const buffer = Buffer.from(base64, 'base64');

    const { data, error } = await supabase.storage
      .from('points')
      .upload(filename, buffer, {
        contentType: `image/${ext}`,
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    return data.path;
  } catch (error) {
    console.error('Error in uploadPointImage:', error);
    return null;
  }
};

export const createPoint = async (lat: number, lng: number, filepath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('points')
      .insert({
        lat,
        lng,
        filepath,
        visited_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating point:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in createPoint:', error);
    return null;
  }
};
