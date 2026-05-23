import { useEffect, useRef } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
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
  tileColor: string;
};

export function ChildScreen({ goal, onBack, onCompleteTask, tileColor }: ChildScreenProps) {
  const isComplete = goal.completedTasks >= goal.totalTasks;
  const remainingTasks = Math.max(0, goal.totalTasks - goal.completedTasks);
  const hasPlayedCompletionFeedback = useRef(isComplete);

  useEffect(() => {
    if (isComplete && !hasPlayedCompletionFeedback.current) {
      Vibration.vibrate([0, 120, 80, 160]);
      hasPlayedCompletionFeedback.current = true;
    }
  }, [isComplete]);

  return (
    <View style={styles.screen}>
      <View style={styles.profile}>
        <AvatarBadge avatarId={goal.avatarId} size="lg" />
        <Text style={styles.greeting}>{strings.child.greeting(goal.childName)}</Text>
        <Text style={styles.subtitle}>{strings.child.reward(goal.rewardName)}</Text>
      </View>

      <TileGrid
        imageUri={goal.imageUri}
        revealOrder={goal.revealOrder}
        revealedCount={goal.completedTasks}
        tileColor={tileColor}
        totalTiles={goal.totalTasks}
      />

      <View style={styles.progressBlock}>
        <ProgressBar progress={getGoalProgress(goal)} />
        <Text style={styles.progressText}>{strings.child.progress(goal.completedTasks, goal.totalTasks)}</Text>
      </View>

      <View style={[styles.messageCard, isComplete && styles.completedCard]}>
        {isComplete ? <ConfettiDots /> : null}
        <Text style={styles.messageTitle}>
          {isComplete ? strings.child.completedTitle : strings.child.encouragementTitle}
        </Text>
        <Text style={styles.messageBody}>
          {isComplete ? strings.child.completedBody : strings.child.remaining(remainingTasks)}
        </Text>
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
  profile: {
    alignItems: "center"
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
  },
  messageCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    overflow: "hidden",
    padding: spacing.lg
  },
  completedCard: {
    backgroundColor: colors.successSurface,
    borderColor: colors.successBorder
  },
  messageTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  messageBody: {
    color: colors.textMuted,
    fontSize: 14
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject
  },
  confettiDot: {
    borderRadius: 999,
    height: 8,
    position: "absolute",
    width: 8
  }
});

function ConfettiDots() {
  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      <View style={[styles.confettiDot, { backgroundColor: colors.confettiYellow, left: 18, top: 12 }]} />
      <View style={[styles.confettiDot, { backgroundColor: colors.confettiBlue, right: 28, top: 18 }]} />
      <View style={[styles.confettiDot, { backgroundColor: colors.confettiPink, bottom: 14, left: 48 }]} />
      <View style={[styles.confettiDot, { backgroundColor: colors.confettiGreen, bottom: 20, right: 52 }]} />
    </View>
  );
}
