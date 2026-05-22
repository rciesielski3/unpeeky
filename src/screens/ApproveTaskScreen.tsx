import { Image, StyleSheet, Text, View } from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { getGoalProgress } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type ApproveTaskScreenProps = {
  goal: Goal;
  onApproveTask: () => void;
  onBack: () => void;
  onOpenChildView: () => void;
};

export function ApproveTaskScreen({ goal, onApproveTask, onBack, onOpenChildView }: ApproveTaskScreenProps) {
  const isComplete = goal.completedTasks >= goal.totalTasks;
  const remainingTasks = Math.max(0, goal.totalTasks - goal.completedTasks);

  return (
    <View style={styles.screen}>
      <View>
        <Text style={styles.title}>{strings.approveTask.title}</Text>
        <Text style={styles.subtitle}>{strings.approveTask.subtitle}</Text>
      </View>

      <View style={styles.card}>
        <Image
          accessibilityLabel={strings.goals.thumbnailLabel(goal.rewardName)}
          accessibilityRole="image"
          source={{ uri: goal.imageUri }}
          style={styles.thumbnail}
        />
        <View style={styles.cardCopy}>
          <Text style={styles.rewardName}>{goal.rewardName}</Text>
          <View style={styles.childRow}>
            <AvatarBadge avatarId={goal.avatarId} size="sm" />
            <Text style={styles.meta}>{goal.childName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <ProgressBar progress={getGoalProgress(goal)} />
        <Text style={styles.progressText}>{strings.approveTask.progress(goal.completedTasks, goal.totalTasks)}</Text>
        <Text style={styles.remainingText}>{strings.approveTask.remaining(remainingTasks)}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          disabled={isComplete}
          label={isComplete ? strings.approveTask.completeButton : strings.approveTask.approveButton}
          onPress={onApproveTask}
          variant="secondary"
        />
        <Button label={strings.approveTask.childViewButton} onPress={onOpenChildView} />
        <Button label={strings.approveTask.backButton} onPress={onBack} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 96,
    width: 96
  },
  cardCopy: {
    flex: 1,
    gap: spacing.sm
  },
  rewardName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  childRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  meta: {
    color: colors.textMuted,
    fontSize: 15
  },
  progressBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  progressText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  remainingText: {
    color: colors.textMuted,
    fontSize: 14
  },
  actions: {
    gap: spacing.sm,
    marginTop: "auto"
  }
});
