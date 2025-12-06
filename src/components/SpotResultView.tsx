import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TravelSpot, CompletedSpot } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

interface SpotResultViewProps {
  spot: TravelSpot;
  completedSpot: CompletedSpot;
  onBackToMap: () => void;
}

const { width } = Dimensions.get('window');

export function SpotResultView({
  spot,
  completedSpot,
  onBackToMap,
}: SpotResultViewProps) {
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

  const result = getRankMessage(completedSpot.syncRate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>撮影結果</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.scoreCard}>
          <View style={styles.trophyIcon}>
            <Feather name="award" size={40} color={result.color} />
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
            {new Date(completedSpot.timestamp).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToMap}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2563EB', '#3B82F6']}
            style={styles.backButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="map" size={20} color="#FFFFFF" />
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
    backgroundColor: '#F0F9FF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  scoreUnit: {
    fontSize: 28,
    color: '#6B7280',
  },
  rankText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageSection: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
