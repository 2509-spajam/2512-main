import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { FONTS } from "../constants/fonts";
import { COLORS } from "../constants/colors";

interface LoadingViewProps {
  progress?: number;
  showProgress?: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  progress,
  showProgress = true,
}) => {
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const progressRef = React.useRef(0);
  const animationTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (progress !== undefined) {
      setLoadingProgress(progress);
      progressRef.current = progress;
      return;
    }

    if (!showProgress) {
      setLoadingProgress(0);
      progressRef.current = 0;
      return;
    }

    const duration = 2500;
    const steps = 100;
    const increment = 100 / steps;
    const interval = duration / steps;

    let currentStep = 0;
    animationTimerRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        if (progressRef.current < 100) {
          setLoadingProgress(99);
        } else {
          setLoadingProgress(100);
          if (animationTimerRef.current) {
            clearInterval(animationTimerRef.current);
          }
        }
      } else {
        const newProgress = Math.min(increment * currentStep, 99);
        progressRef.current = newProgress;
        setLoadingProgress(newProgress);
      }
    }, interval);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [progress, showProgress]);

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
      </View>
      {showProgress && (
        <Text style={styles.progressText}>{loadingProgress.toFixed(0)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
    backgroundColor: "transparent",
  },
  progressBarContainer: {
    width: "100%",
    maxWidth: 300,
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#03FFD1",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 16,
    color: "#03FFD1",
    fontFamily: FONTS.ORBITRON_BOLD,
  },
});
