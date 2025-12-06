import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TravelRoute, CompletedSpot } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

interface ResultViewProps {
  route: TravelRoute;
  completedSpots: CompletedSpot[];
  onBack: () => void;
}

const { width } = Dimensions.get('window');

export function ResultView({ route, completedSpots, onBack }: ResultViewProps) {
  const averageSyncRate =
    completedSpots.reduce((sum, spot) => sum + spot.syncRate, 0) /
    completedSpots.length;

  const getRankMessage = (rate: number) => {
    if (rate >= 95)
      return { rank: 'S', message: '完璧なシンクロ！', color: '#FBBF24' };
    if (rate >= 85)
      return { rank: 'A', message: '素晴らしい！', color: '#3B82F6' };
    if (rate >= 75)
      return { rank: 'B', message: 'よくできました！', color: '#10B981' };
    if (rate >= 60)
      return { rank: 'C', message: 'もう少し！', color: '#F97316' };
    return { rank: 'D', message: '再チャレンジ！', color: '#6B7280' };
  };

  const result = getRankMessage(averageSyncRate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>リザルト</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share-2" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scoreCard}>
          <View style={styles.trophyIcon}>
            <Feather name="award" size={48} color={result.color} />
          </View>
          <Text style={styles.completionText}>シンクロ完了！</Text>
          <Text style={styles.routeTitle}>{route.title}</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>
              {averageSyncRate.toFixed(1)}
              <Text style={styles.scoreUnit}>%</Text>
            </Text>
            <Text style={[styles.rankText, { color: result.color }]}>
              {result.rank}
            </Text>
          </View>

          <Text style={styles.messageText}>{result.message}</Text>

          <View style={styles.badgesContainer}>
            {averageSyncRate >= 90 && (
              <View style={styles.badge}>
                <LinearGradient
                  colors={['#FBBF24', '#F59E0B']}
                  style={styles.badgeIcon}
                >
                  <Feather name="star" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.badgeLabel}>完璧主義者</Text>
              </View>
            )}
            {completedSpots.length === route.spots.length && (
              <View style={styles.badge}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.badgeIcon}
                >
                  <Feather name="map-pin" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.badgeLabel}>全制覇</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.spotsSection}>
          <Text style={styles.sectionTitle}>スポット別結果</Text>
          {completedSpots.map((completed) => {
            const spot = route.spots.find((s) => s.id === completed.spotId);
            if (!spot) return null;

            const spotResult = getRankMessage(completed.syncRate);

            return (
              <View key={completed.spotId} style={styles.spotResultCard}>
                <View style={styles.spotImages}>
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>元の写真</Text>
                    <Image
                      source={{ uri: spot.imageUrl }}
                      style={styles.spotImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>あなたの写真</Text>
                    <Image
                      source={{
                        uri: completed.userImageUrl || spot.imageUrl,
                      }}
                      style={styles.spotImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                <View style={styles.spotResultInfo}>
                  <View>
                    <Text style={styles.spotResultName}>{spot.name}</Text>
                    <Text style={styles.spotResultTime}>
                      {new Date(completed.timestamp).toLocaleTimeString(
                        'ja-JP',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </Text>
                  </View>
                  <View style={styles.spotResultScore}>
                    <Text style={styles.spotResultRate}>
                      {completed.syncRate}%
                    </Text>
                    <Text
                      style={[
                        styles.spotResultRank,
                        { color: spotResult.color },
                      ]}
                    >
                      ランク {spotResult.rank}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.shareButtonLarge}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              style={styles.shareButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.shareButtonText}>結果をシェアする</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>タイムラインに戻る</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  scoreUnit: {
    fontSize: 32,
    color: '#6B7280',
  },
  rankText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8,
  },
  messageText: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 32,
  },
  badge: {
    alignItems: 'center',
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  spotsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  spotResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  spotImages: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  imageContainer: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  spotImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  spotResultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  spotResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  spotResultTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  spotResultScore: {
    alignItems: 'flex-end',
  },
  spotResultRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  spotResultRank: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  shareButtonLarge: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButtonLarge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
