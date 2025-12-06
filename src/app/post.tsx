import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ScreenWrapper from "../components/ScreenWrapper";
import { COLORS } from "../constants/colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTravel, createPoint, uploadPointImage } from '../services/travelService';


const { width } = Dimensions.get("window");

export default function PostScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  // 各画像に対応する位置情報 (画像と同じインデックスで管理)
  const [imageLocations, setImageLocations] = useState<
    ({
      latitude: number;
      longitude: number;
      name?: string;
    } | null)[]
  >([]);
  // 各画像に対応する名前 (画像と同じインデックスで管理)
  const [imageNames, setImageNames] = useState<string[]>([]);
  // マップモーダル制御
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapTargetIndex, setMapTargetIndex] = useState<number | null>(null);
  const [tempCoord, setTempCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // debounce: 検索キーワード入力に対して遅延検索を行う
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const id = setTimeout(() => {
      searchPlace();
    }, 500);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // tempCoordが変わったらマップをその位置にアニメーションする
  useEffect(() => {
    if (
      tempCoord &&
      mapRef.current &&
      typeof mapRef.current.animateToRegion === "function"
    ) {
      try {
        mapRef.current.animateToRegion(
          {
            latitude: tempCoord.latitude,
            longitude: tempCoord.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      } catch (e) {
        // 一部環境では animateToRegion が Promise を返すなど差異があるため安全に
        console.warn("animateToRegion failed", e);
      }
    }
  }, [tempCoord]);
  // 写真に位置情報が付与されるため、ルートの位置選択は不要
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "権限が必要です",
        "画像を選択するには、フォトライブラリへのアクセス権限が必要です。"
      );
      return false;
    }
    return true;
  };

  const handlePickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      console.log("ImagePicker result:", result);

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        console.log("Picked URIs:", newImages);
        setImages([...images, ...newImages]);
        // 画像に対応する位置配列を拡張（初期は null）
        setImageLocations((prev) => [...prev, ...newImages.map(() => null)]);
        // 画像に対応する名前配列を拡張（初期は空文字）
        setImageNames((prev) => [...prev, ...newImages.map(() => "")]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("エラー", "画像の選択に失敗しました。");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageLocations(imageLocations.filter((_, i) => i !== index));
    setImageNames(imageNames.filter((_, i) => i !== index));
  };

  const openMapForImage = (index: number) => {
    setMapTargetIndex(index);
    // 初期位置は既存の位置、なければ中心座標
    const existing = imageLocations[index];
    setTempCoord(
      existing
        ? { latitude: existing.latitude, longitude: existing.longitude }
        : { latitude: 35.6762, longitude: 139.6503 }
    );
    setMapModalVisible(true);
  };

  const saveImageLocation = () => {
    if (mapTargetIndex === null || !tempCoord) {
      setMapModalVisible(false);
      return;
    }
    const newLoc = {
      latitude: tempCoord.latitude,
      longitude: tempCoord.longitude,
      name: imageNames[mapTargetIndex] || "",
    };
    setImageLocations((prev) => {
      const next = [...prev];
      next[mapTargetIndex] = newLoc;
      return next;
    });
    setMapModalVisible(false);
  };

  const searchPlace = async (query?: string) => {
    const q = query !== undefined ? query : searchQuery;
    if (!q || q.trim().length === 0) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
        q
      )}`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "ja",
          "User-Agent": "2512-main-app",
        },
      });
      const data = await res.json();
      setSearchResults(data || []);
    } catch (e) {
      console.error("Place search error:", e);
      setSearchResults([]);
    }
  };

  const selectSearchResult = (item: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setTempCoord({ latitude: lat, longitude: lon });
    if (mapTargetIndex !== null) {
      setImageNames((prev) => {
        const next = [...prev];
        next[mapTargetIndex] = item.display_name;
        return next;
      });
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("入力エラー", "タイトルを入力してください。");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("入力エラー", "説明を入力してください。");
      return false;
    }
    if (images.length === 0) {
      Alert.alert("入力エラー", "画像を1枚以上選択してください。");
      return false;
    }
    // Validate dates
    if (endDate < startDate) {
      Alert.alert("入力エラー", "終了日は開始日より後の日付にしてください。");
      return false;
    }
    // Validate image locations
    for (let i = 0; i < images.length; i++) {
      if (!imageLocations[i]) {
        Alert.alert("入力エラー", `画像 ${i + 1} の位置情報を設定してください。`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const pointIds: string[] = [];

      // Process each image
      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        const location = imageLocations[i];

        if (!location) continue; // Should be caught by validateForm

        // 1. Upload image
        const imagePath = await uploadPointImage(uri);
        if (!imagePath) {
          throw new Error(`画像 ${i + 1} のアップロードに失敗しました。`);
        }

        // 2. Create point
        const pointId = await createPoint(location.latitude, location.longitude, imagePath);
        if (!pointId) {
          throw new Error(`地点 ${i + 1} の作成に失敗しました。`);
        }

        pointIds.push(pointId);
      }

      // 3. Create Travel
      const travelId = await createTravel(
        title,
        description,
        startDate.toISOString(),
        endDate.toISOString(),
        pointIds
      );

      if (!travelId) {
        throw new Error("旅行の作成に失敗しました。");
      }

      Alert.alert("投稿完了", "ルートを投稿しました。", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert("エラー", error.message || "投稿中にエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>投稿</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.formSection}>
              <Text style={styles.label}>タイトル</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="タイトル"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }, 100);
                }}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>説明</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="説明"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                  }, 100);
                }}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>期間</Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>開始日</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                      }}
                    />
                  )}
                </View>
                <View style={styles.dateArrow}>
                  <Feather name="arrow-right" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>終了日</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      minimumDate={startDate}
                      onChange={(event, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>画像（1枚以上）</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handlePickImages}
              >
                <Feather name="image" size={24} color="#2563EB" />
                <Text style={styles.imagePickerText}>画像を選択</Text>
              </TouchableOpacity>

              {images.length > 0 && (
                <View style={styles.imageCardsContainer}>
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageCard}>
                      <View style={styles.spotNumber}>
                        <Text style={styles.spotNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.spotInfo}>
                        <TextInput
                          style={styles.spotNameInput}
                          placeholder="場所名を入力"
                          placeholderTextColor="#9CA3AF"
                          value={imageNames[index] || ""}
                          onChangeText={(text) => {
                            setImageNames((prev) => {
                              const next = [...prev];
                              next[index] = text;
                              return next;
                            });
                          }}
                          onFocus={() => {
                            setTimeout(() => {
                              scrollViewRef.current?.scrollToEnd({
                                animated: true,
                              });
                            }, 100);
                          }}
                        />
                        <TouchableOpacity
                          style={styles.locationButton}
                          onPress={() => openMapForImage(index)}
                        >
                          <Feather
                            name="map-pin"
                            size={14}
                            color={
                              imageLocations[index] ? "#10B981" : "#6B7280"
                            }
                          />
                          <Text
                            style={[
                              styles.locationButtonText,
                              imageLocations[index] &&
                              styles.locationButtonTextActive,
                            ]}
                          >
                            {imageLocations[index]
                              ? `${imageLocations[index].latitude.toFixed(
                                4
                              )}, ${imageLocations[index].longitude.toFixed(
                                4
                              )}`
                              : "位置を選択"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.spotImageContainer}>
                        <Image
                          source={{ uri }}
                          style={styles.spotImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Feather name="x" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "送信中..." : "投稿"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <View
            style={{
              height: 56,
              marginTop: 48,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={{ padding: 8 }}
            >
              <Feather name="x" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>位置を選択</Text>
            <TouchableOpacity
              onPress={saveImageLocation}
              style={{ padding: 8 }}
            >
              <Text style={{ color: "#2563EB", fontWeight: "600" }}>保存</Text>
            </TouchableOpacity>
          </View>

          {/* 検索 */}
          <View style={styles.searchContainer}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="場所を検索（例: 東京駅）"
              returnKeyType="search"
              onSubmitEditing={() => searchPlace()}
              style={styles.searchInput}
            />
          </View>

          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.searchResultItem}
                  onPress={() => {
                    selectSearchResult(item);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.searchResultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1, marginVertical: 48 }}
            region={
              tempCoord
                ? {
                  latitude: tempCoord.latitude,
                  longitude: tempCoord.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
                : {
                  latitude: 35.6762,
                  longitude: 139.6503,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
            }
            onPress={(e) => setTempCoord(e.nativeEvent.coordinate)}
          >
            {tempCoord && <Marker coordinate={tempCoord} />}
          </MapView>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    backgroundColor: "#192130",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  descriptionInput: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B5563",
    minHeight: 120,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#4B5563",
    borderStyle: "dashed",
  },
  imagePickerText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },
  imageCardsContainer: {
    marginTop: 16,
    gap: 12,
  },
  imageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  spotNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  spotNumberText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  spotInfo: {
    flex: 1,
    marginRight: 12,
  },
  spotNameInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationButtonText: {
    fontSize: 13,
    color: "#6B7280",
  },
  locationButtonTextActive: {
    color: "#10B981",
    fontWeight: "500",
  },
  spotImageContainer: {
    position: "relative",
  },
  spotImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    backgroundColor: "#192130",
  },
  submitButton: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchResults: {
    maxHeight: 160,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  searchResultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchResultText: {
    color: "#374151",
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  dateButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  dateArrow: {
    paddingBottom: 12,
  },
});
