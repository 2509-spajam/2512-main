import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
} from "react-native";
import {
  CameraView as ExpoCameraView,
  useCameraPermissions,
} from "expo-camera";
import { Feather, Entypo } from "@expo/vector-icons";
import { TravelRoute } from "../types";
import { LinearGradient } from "expo-linear-gradient";

interface CameraViewProps {
  route: TravelRoute;
  currentSpotIndex: number;
  onCapture: (spotId: string, uri: string) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");
const SLIDER_HEIGHT = 200;

export function CameraView({
  route,
  currentSpotIndex,
  onCapture,
  onClose,
}: CameraViewProps) {
  const [opacity, setOpacity] = useState(0.5);
  const [showGuide, setShowGuide] = useState(true);
  const [distance] = useState(120);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<ExpoCameraView>(null);
  const currentSpot = route.spots[currentSpotIndex];

  const opacityRef = useRef(opacity);
  const startOpacityRef = useRef(opacity);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startOpacityRef.current = opacityRef.current;
      },
      onPanResponderMove: (_evt, gestureState) => {
        const moveRatio = -gestureState.dy / SLIDER_HEIGHT;
        let newOpacity = startOpacityRef.current + moveRatio;
        newOpacity = Math.max(0, Math.min(1, newOpacity));
        setOpacity(newOpacity);
      },
    })
  ).current;

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        onCapture(currentSpot.id, photo.uri);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>カメラの権限を確認中...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>カメラの権限が必要です</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>権限を許可</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back">
        {showGuide && (
          <View style={[styles.guideOverlay, { opacity }]} pointerEvents="none">
            <Image
              source={{ uri: currentSpot.imageUrl }}
              style={styles.guideImage}
              resizeMode="contain"
            />
          </View>
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={styles.topGradient}
        >
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {currentSpotIndex + 1} / {route.spots.length}
              </Text>
            </View>
          </View>

          <View style={styles.spotInfoCard}>
            <View style={styles.spotInfoHeader}>
              <Text style={styles.spotName}>{currentSpot.name}</Text>
              <View style={styles.distanceBadge}>
                <Feather name="navigation" size={14} color="#FFFFFF" />
                <Text style={styles.distanceText}>{distance}m</Text>
              </View>
            </View>
            <View style={styles.spotLocation}>
              <Feather name="map-pin" size={12} color="#FFFFFF" />
              <Text style={styles.spotLocationText}>
                {currentSpot.lat.toFixed(4)}, {currentSpot.lng.toFixed(4)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.opacityControl}>
          <View style={styles.opacityControlContainer}>
            <Entypo name="light-up" size={24} color="#FFFFFF" />
            <View style={styles.sliderContainer} {...panResponder.panHandlers}>
              <View style={styles.sliderTrack}>
                <View
                  style={[styles.sliderFill, { height: `${opacity * 100}%` }]}
                />
              </View>
              <View
                style={[
                  styles.sliderThumb,
                  { bottom: `${opacity * 100}%` },
                  { marginBottom: -10 },
                ]}
                pointerEvents="none"
              />
            </View>
            <Entypo name="light-down" size={24} color="#FFFFFF" />
          </View>
        </View>

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={styles.bottomGradient}
        >
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[
                styles.guideToggle,
                showGuide && styles.guideToggleActive,
              ]}
              onPress={() => setShowGuide(!showGuide)}
            >
              <Text
                style={[
                  styles.guideToggleText,
                  showGuide && styles.guideToggleTextActive,
                ]}
              >
                ガイド {showGuide ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonInner}>
                <Feather name="camera" size={32} color="#03FFD1" />
              </View>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </View>

          <Text style={styles.hintText}>元の写真に合わせて撮影しましょう</Text>
        </LinearGradient>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  permissionButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  guideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 1,
  },
  guideImage: {
    width: "100%",
    height: "100%",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 20,
    elevation: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  counterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  spotInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  spotInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  spotLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.9,
  },
  spotLocationText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  opacityControl: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -100 }],
    zIndex: 100,
    elevation: 100,
  },
  opacityControlContainer: {
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  sliderContainer: {
    width: 30,
    height: SLIDER_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sliderTrack: {
    width: 4,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    position: "absolute",
    left: 13,
  },
  sliderFill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#03FFD1",
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    left: 5,
    borderWidth: 2,
    borderColor: "#03FFD1",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 44,
    paddingTop: 24,
    paddingHorizontal: 16,
    zIndex: 20,
    elevation: 20,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  guideToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  guideToggleActive: {
    backgroundColor: "#FFFFFF",
  },
  guideToggleText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  guideToggleTextActive: {
    color: "#000000",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    borderWidth: 4,
    borderColor: "#03FFD1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacer: {
    width: 80,
  },
  hintText: {
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
  },
});
