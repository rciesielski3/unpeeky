import { StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { TileGrid } from "../components/TileGrid";
import { getGoalProgress } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type ChildScreenProps = {
  goal: Goal;
  onBack: () => void;
  onCompleteTask: () => void;
};

export function ChildScreen({ goal, onBack, onCompleteTask }: ChildScreenProps) {
  const isComplete = goal.completedTasks >= goal.totalTasks;

  return (
    <View style={styles.screen}>
      <View>
        <Text style={styles.greeting}>{strings.child.greeting(goal.childName)}</Text>
        <Text style={styles.subtitle}>{strings.child.reward(goal.rewardName)}</Text>
      </View>

      <TileGrid
        imageUri={goal.imageUri}
        revealOrder={goal.revealOrder}
        revealedCount={goal.completedTasks}
        totalTiles={goal.totalTasks}
      />

      <View style={styles.progressBlock}>
        <ProgressBar progress={getGoalProgress(goal)} />
        <Text style={styles.progressText}>{strings.child.progress(goal.completedTasks, goal.totalTasks)}</Text>
      </View>

      <Button
        disabled={isComplete}
        label={isComplete ? strings.child.completeButton : strings.child.approveTaskButton}
        onPress={onCompleteTask}
        variant="secondary"
      />
      <Button label={strings.child.backToParentButton} onPress={onBack} variant="ghost" />
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
