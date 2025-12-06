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
  ActivityIndicator,
  Keyboard,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ScreenWrapper from "../components/ScreenWrapper";

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width - 32; // padding 16 * 2を引いた幅
const IMAGE_HEIGHT = 200; // 例: 高さを200pxに固定

export default function PostScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
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
  // マップモーダル制御
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapTargetIndex, setMapTargetIndex] = useState<number | null>(null);
  const [tempCoord, setTempCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tempName, setTempName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

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
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("エラー", "画像の選択に失敗しました。");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageLocations(imageLocations.filter((_, i) => i !== index));
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
    setTempName(existing?.name || "");
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
      name: tempName || "",
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
      setIsSearching(true);
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
    } finally {
      setIsSearching(false);
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
    setTempName(item.display_name);
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
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert("投稿完了", "ルートを投稿しました。", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>投稿</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.label}>タイトル</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="タイトル"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
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
            />
          </View>

          {/* 写真に位置情報が付与されるため、ルート位置選択UIは不要になりました */}

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
              <View>
                <View style={styles.imageGrid}>
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image
                        source={{ uri }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Feather name="x" size={16} color="#FFFFFF" />
                      </TouchableOpacity>

                      {/* Pin ボタン: 画像ごとに位置を割り当て */}
                      <TouchableOpacity
                        style={styles.imagePinButton}
                        onPress={() => openMapForImage(index)}
                      >
                        <Feather
                          name="map-pin"
                          size={16}
                          color={imageLocations[index] ? "#10B981" : "#FFFFFF"}
                        />
                      </TouchableOpacity>

                      {/* 小さなラベル: 位置がある場合は表示 */}
                      {imageLocations[index] && (
                        <View style={styles.imagePinLabel}>
                          <Text style={styles.imagePinLabelText}>位置あり</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {/* Debug: show selected URIs to help troubleshoot display issues */}
                <View style={styles.debugUriList}>
                  {images.map((u, i) => (
                    <Text key={i} style={styles.debugUriText} numberOfLines={1}>
                      {u}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>投稿</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                // 手動検索（デバウンスとは別に即時検索したい場合）
                searchPlace(searchQuery);
                Keyboard.dismiss();
              }}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.searchButtonText}>検索</Text>
              )}
            </TouchableOpacity>
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

          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>
              場所名（任意）
            </Text>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              placeholder="例: 渋谷駅前"
              style={styles.modalInput}
            />
          </View>

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

// Map modal is declared after component return so we need to export a separate render for it.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
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
    color: "#374151",
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  descriptionInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 120,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  imagePickerText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },
  imageGrid: {
    // flexDirection: "row", // 削除
    // flexWrap: "wrap",     // 削除
    gap: 16, // 縦の隙間を16pxに
    marginTop: 16,
  },
  imageContainer: {
    position: "relative",
    width: IMAGE_WIDTH, // 修正
    height: IMAGE_HEIGHT, // 修正
    marginBottom: 8, // 各コンテナの下に少しスペースを追加
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
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
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
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

  debugUriList: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  debugUriText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  imagePinButton: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePinLabel: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imagePinLabelText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
  },
  modalInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
});
