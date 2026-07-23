import { useEffect, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { AvatarBadge } from "../components/AvatarBadge";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenDecorations } from "../components/ScreenDecorations";
import { TileGrid } from "../components/TileGrid";
import { playCompletionSound } from "../audio/playCompletionSound";
import { getGoalProgress, isGoalComplete } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import type { AppTheme } from "../ui/appTheme";
import { defaultAppTheme } from "../ui/appTheme";
import { colors, fonts, radii, spacing } from "../ui/theme";

type ChildScreenProps = {
  activeChildId?: string;
  canRevealTile: boolean;
  goal: Goal | null;
  onAddGoal?: () => void;
  onBack: () => void;
  onCompleteTask: () => void;
  onRevealTile: (tileId: number) => void;
  onViewGoals?: () => void;
  theme?: AppTheme;
  tileColor: string;
};

export function ChildScreen({
  activeChildId,
  canRevealTile,
  goal,
  onAddGoal,
  onBack,
  onCompleteTask,
  onRevealTile,
  onViewGoals,
  theme = defaultAppTheme,
  tileColor
}: ChildScreenProps) {
  // Safety check: ensure goal belongs to active child
  if (!goal || goal.childId !== activeChildId) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.childBackground }]}>
        <Text style={styles.errorText}>Goal not found</Text>
      </View>
    );
  }

  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const isComplete = isGoalComplete(goal);
  const remainingTasks = Math.max(0, goal.totalTasks - goal.completedTasks);
  const progress = getGoalProgress(goal);
  const hasPlayedCompletionFeedback = useRef(isComplete);
  const lastGoalId = useRef(goal.id);

  if (lastGoalId.current !== goal.id) {
    hasPlayedCompletionFeedback.current = isComplete;
    lastGoalId.current = goal.id;
  }

  useEffect(() => {
    setIsCelebrationOpen(false);
  }, [goal.id]);

  useEffect(() => {
    if (isComplete) {
      if (!hasPlayedCompletionFeedback.current) {
        Vibration.vibrate([0, 120, 80, 160]);
        void playCompletionSound();
        hasPlayedCompletionFeedback.current = true;
        setIsCelebrationOpen(true);
      }
    } else {
      hasPlayedCompletionFeedback.current = false;
    }
  }, [isComplete]);

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.screen, { backgroundColor: theme.childBackground }]}
        style={[styles.scroll, { backgroundColor: theme.childBackground }]}
      >
        <ScreenDecorations variant="clouds" />
        <View style={styles.cloudLeft} />
        <View style={styles.cloudRight} />
        <Text style={styles.sparkleLeft}>✦</Text>
        <Text style={styles.sparkleRight}>⭐</Text>

        <View style={styles.childHeader}>
          <View style={styles.avatarHalo}>
            <AvatarBadge avatarId={goal.avatarId} size="md" />
          </View>
          <View style={styles.childCopy}>
            <Text style={styles.childSubtitle}>{strings.child.subtitle}</Text>
            <Text style={styles.greeting}>{goal.childName}</Text>
          </View>
          <Pressable
            accessibilityLabel={strings.child.backToParentButton}
            accessibilityRole="button"
            onPress={onBack}
            style={[styles.circleButton, { backgroundColor: theme.accentSoft }]}
          >
            <Text style={[styles.closeIcon, { color: theme.accent }]}>×</Text>
          </Pressable>
        </View>

        <View style={styles.gridWrap}>
          <TileGrid
            imageUri={goal.imageUri}
            onTilePress={canRevealTile ? onRevealTile : undefined}
            revealOrder={goal.revealOrder}
            revealedCount={goal.completedTasks}
            tileColor={tileColor}
            totalTiles={goal.totalTasks}
          />
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressText}>
              {strings.approveTask.progress(goal.completedTasks, goal.totalTasks)}
            </Text>
            <ProgressBar color={theme.accent} progress={progress} />
          </View>
          <Text style={styles.progressStar}>⭐</Text>
        </View>

        <View style={[styles.messageCard, isComplete && styles.completedCard]}>
          {isComplete ? <AnimatedConfetti /> : <StaticConfetti />}
          <View>
            <Text style={styles.messageTitle}>
              {isComplete ? strings.child.completedTitle : strings.child.encouragementTitle}
            </Text>
            <Text style={styles.messageBody}>
              {isComplete
                ? strings.child.completedBody
                : canRevealTile
                  ? strings.child.pickTileHint
                  : strings.child.remaining(remainingTasks)}
            </Text>
          </View>
          <Text style={styles.cloudEmoji}>☁️</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>× {strings.child.rejectButton}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isComplete}
            onPress={onCompleteTask}
            style={[styles.approveButton, { backgroundColor: theme.accent }, isComplete && styles.disabledButton]}
          >
            <Text style={styles.approveButtonText}>
              {isComplete ? strings.child.completeButton : `✓ ${strings.child.approveTaskButton} ✨`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <CompletionCelebrationModal
        goal={goal}
        onAddGoal={onAddGoal}
        onClose={() => setIsCelebrationOpen(false)}
        onViewGoals={onViewGoals}
        theme={theme}
        visible={isCelebrationOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600"
  },
  scroll: {
    backgroundColor: colors.childBackground
  },
  screen: {
    backgroundColor: colors.childBackground,
    flexGrow: 1,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md
  },
  cloudLeft: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: radii.pill,
    height: 48,
    left: 44,
    position: "absolute",
    top: 156,
    width: 112
  },
  cloudRight: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: radii.pill,
    height: 36,
    position: "absolute",
    right: 54,
    top: 186,
    width: 92
  },
  sparkleLeft: {
    color: colors.surface,
    fontSize: 20,
    left: 34,
    position: "absolute",
    top: 132
  },
  sparkleRight: {
    fontSize: 32,
    position: "absolute",
    right: 74,
    top: 162
  },
  childHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 58
  },
  circleButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    height: 44,
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    width: 44
  },
  closeIcon: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 36
  },
  avatarHalo: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.decorationPrimary,
    borderRadius: radii.pill,
    borderWidth: 4,
    height: 58,
    justifyContent: "center",
    width: 58
  },
  childCopy: {
    flex: 1
  },
  childSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  greeting: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30
  },
  gridWrap: {
    alignSelf: "center",
    borderRadius: radii.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    width: "88%"
  },
  progressBlock: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
    padding: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 20
  },
  progressCopy: {
    flex: 1,
    gap: spacing.sm
  },
  progressText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  progressStar: {
    fontSize: 42
  },
  messageCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 104,
    overflow: "hidden",
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 20
  },
  completedCard: {
    backgroundColor: colors.successSurface,
    borderColor: colors.successBorder
  },
  messageTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800"
  },
  messageBody: {
    color: colors.text,
    fontSize: 14,
    marginTop: spacing.sm
  },
  cloudEmoji: {
    fontSize: 42
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  rejectButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 0.9,
    justifyContent: "center",
    minHeight: 52
  },
  rejectButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  approveButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    flex: 1.7,
    justifyContent: "center",
    minHeight: 52
  },
  disabledButton: {
    opacity: 0.45
  },
  approveButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject
  },
  confettiDot: {
    borderRadius: 999,
    height: 8,
    position: "absolute",
    width: 8
  },
  staticConfetti: {
    position: "absolute"
  },
  celebrationBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(33, 27, 54, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  celebrationCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    maxWidth: 420,
    overflow: "hidden",
    padding: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 30,
    width: "100%"
  },
  celebrationBurst: {
    fontSize: 44,
    letterSpacing: 2
  },
  celebrationImage: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    width: "72%"
  },
  celebrationTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center"
  },
  celebrationBody: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center"
  },
  celebrationReward: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center"
  },
  celebrationActions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    width: "100%"
  },
  celebrationPrimaryButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg
  },
  celebrationSecondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg
  },
  celebrationPrimaryText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "800"
  },
  celebrationSecondaryText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  }
});

function CompletionCelebrationModal({
  goal,
  onAddGoal,
  onClose,
  onViewGoals,
  theme,
  visible
}: {
  goal: Goal;
  onAddGoal?: () => void;
  onClose: () => void;
  onViewGoals?: () => void;
  theme: AppTheme;
  visible: boolean;
}) {
  function handleViewGoals() {
    onClose();
    onViewGoals?.();
  }

  function handleAddGoal() {
    onClose();
    onAddGoal?.();
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.celebrationBackdrop}>
        <View style={styles.celebrationCard}>
          <Text
            accessibilityLabel={strings.child.completedTitle}
            accessibilityRole="image"
            style={styles.celebrationBurst}
          >
            🎉 ⭐ 🎉
          </Text>
          <Image
            accessibilityLabel={strings.goals.thumbnailLabel(goal.rewardName)}
            source={{ uri: goal.imageUri }}
            style={styles.celebrationImage}
          />
          <Text style={styles.celebrationTitle}>{strings.child.celebrationTitle(goal.childName)}</Text>
          <Text style={styles.celebrationReward}>{goal.rewardName}</Text>
          <Text style={styles.celebrationBody}>{strings.child.celebrationBody}</Text>
          <View style={styles.celebrationActions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleViewGoals}
              style={[styles.celebrationPrimaryButton, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.celebrationPrimaryText}>{strings.child.celebrationViewGoalsButton}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleAddGoal} style={styles.celebrationSecondaryButton}>
              <Text style={styles.celebrationSecondaryText}>{strings.child.celebrationAddGoalButton}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ConfettiDot({ color, delay, from }: { color: string; delay: number; from: "left" | "right" }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(-60, {
        duration: 1500,
        easing: Easing.out(Easing.ease)
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration: 1000,
        easing: Easing.out(Easing.ease)
      })
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[styles.confettiDot, { backgroundColor: color, [from]: from === "left" ? 18 : 28 }, animatedStyle]}
    />
  );
}

const CONFETTI_PIECES: Array<{ color: string; delay: number; from: "left" | "right" }> = [
  { color: colors.confettiYellow, delay: 0, from: "left" },
  { color: colors.confettiBlue, delay: 80, from: "right" },
  { color: colors.confettiPink, delay: 160, from: "left" },
  { color: colors.confettiGreen, delay: 240, from: "right" }
];

function AnimatedConfetti() {
  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {CONFETTI_PIECES.map((piece, idx) => (
        <ConfettiDot key={idx} color={piece.color} delay={piece.delay} from={piece.from} />
      ))}
    </View>
  );
}

function StaticConfetti() {
  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      <View
        style={[styles.confettiDot, styles.staticConfetti, { backgroundColor: colors.confettiBlue, left: 12, top: 8 }]}
      />
      <View
        style={[
          styles.confettiDot,
          styles.staticConfetti,
          { backgroundColor: colors.confettiYellow, left: 72, bottom: 10 }
        ]}
      />
      <View
        style={[
          styles.confettiDot,
          styles.staticConfetti,
          { backgroundColor: colors.confettiGreen, right: 86, top: 12 }
        ]}
      />
      <View
        style={[
          styles.confettiDot,
          styles.staticConfetti,
          { backgroundColor: colors.confettiPink, right: 18, bottom: 18 }
        ]}
      />
    </View>
  );
}
