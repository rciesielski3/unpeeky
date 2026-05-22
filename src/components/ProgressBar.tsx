import { StyleSheet, View } from "react-native";

import { colors } from "../ui/theme";

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(1, Math.max(0, progress)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: "100%"
  }
});
