import { supabase } from '../lib/supabase';
import { TravelRoute, TravelSpot } from '../types';

export const fetchTravels = async (): Promise<TravelRoute[]> => {
  try {
    // 1. Fetch travels with user info (assuming a relation or basic join if foreign key exists)
    // defined constraint: travels_user_id_fkey foreign KEY (user_id) references users (id)
    const { data: travels, error: travelError } = await supabase
      .from('travels')
      .select(`
        *,
        users (
          name
        )
      `)
      .order('started_at', { ascending: false });

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
    const pointIds = travel.points || [];

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
    };
  } catch (error) {
    console.error('Unexpected error in fetchTravelById:', error);
    return null;
  }
};
