import { StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { TileGrid } from "../components/TileGrid";
import { Goal, getGoalProgress } from "../domain/goal";
import { colors, spacing } from "../ui/theme";

type ChildScreenProps = {
  goal: Goal;
  onBack: () => void;
};

export function ChildScreen({ goal, onBack }: ChildScreenProps) {
  return (
    <View style={styles.screen}>
      <View>
        <Text style={styles.greeting}>Hej, {goal.childName}!</Text>
        <Text style={styles.subtitle}>Nagroda: {goal.rewardName}</Text>
      </View>

      <TileGrid imageUri={goal.imageUri} totalTiles={goal.totalTasks} revealedCount={goal.completedTasks} />

      <View style={styles.progressBlock}>
        <ProgressBar progress={getGoalProgress(goal)} />
        <Text style={styles.progressText}>
          {goal.completedTasks} z {goal.totalTasks} kafelkow odkrytych
        </Text>
      </View>

      <Button label="Wroc do rodzica" onPress={onBack} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    padding: spacing.lg
  },
  greeting: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs,
    textAlign: "center"
  },
  progressBlock: {
    gap: spacing.sm
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center"
  }
});
