import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { AvatarBadge } from "../components/AvatarBadge";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenDecorations } from "../components/ScreenDecorations";
import { TileGrid } from "../components/TileGrid";
import { getGoalProgress, isGoalComplete } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, fonts, radii, spacing } from "../ui/theme";

type ChildScreenProps = {
  goal: Goal;
  onBack: () => void;
  onCompleteTask: () => void;
  tileColor: string;
};

export function ChildScreen({ goal, onBack, onCompleteTask, tileColor }: ChildScreenProps) {
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
    if (isComplete && !hasPlayedCompletionFeedback.current) {
      Vibration.vibrate([0, 120, 80, 160]);
      hasPlayedCompletionFeedback.current = true;
    }
  }, [isComplete]);

  return (
    <ScrollView contentContainerStyle={styles.screen} style={styles.scroll}>
      <ScreenDecorations variant="clouds" />
      <View style={styles.cloudLeft} />
      <View style={styles.cloudRight} />
      <Text style={styles.sparkleLeft}>✦</Text>
      <Text style={styles.sparkleRight}>⭐</Text>

      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel={strings.child.backToParentButton}
          accessibilityRole="button"
          onPress={onBack}
          style={styles.circleButton}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={strings.child.soundButton}
          accessibilityRole="button"
          style={styles.circleButton}
        >
          <Text style={styles.soundIcon}>♬</Text>
        </Pressable>
      </View>

      <View style={styles.profile}>
        <View style={styles.avatarHalo}>
          <AvatarBadge avatarId={goal.avatarId} size="lg" />
        </View>
        <Text style={styles.greeting}>{goal.childName}</Text>
      </View>

      <View style={styles.gridWrap}>
        <TileGrid
          imageUri={goal.imageUri}
          revealOrder={goal.revealOrder}
          revealedCount={goal.completedTasks}
          tileColor={tileColor}
          totalTiles={goal.totalTasks}
        />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressCopy}>
          <Text style={styles.progressText}>{strings.approveTask.progress(goal.completedTasks, goal.totalTasks)}</Text>
          <ProgressBar color={colors.accent} progress={progress} />
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
            {isComplete ? strings.child.completedBody : strings.child.remaining(remainingTasks)}
          </Text>
        </View>
        <Text style={styles.cloudEmoji}>☁️</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isComplete}
        onPress={onCompleteTask}
        style={[styles.approveButton, isComplete && styles.disabledButton]}
      >
        <Text style={styles.approveButtonText}>
          {isComplete ? strings.child.completeButton : strings.child.approveTaskButton}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.childBackground
  },
  screen: {
    backgroundColor: colors.childBackground,
    flexGrow: 1,
    gap: spacing.lg,
    overflow: "hidden",
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  circleButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 60,
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    width: 60
  },
  backIcon: {
    color: colors.primary,
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 46
  },
  soundIcon: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800"
  },
  profile: {
    alignItems: "center",
    marginTop: -spacing.md
  },
  avatarHalo: {
    alignItems: "center",
    backgroundColor: "#F9D7F0",
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 12,
    height: 132,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 132
  },
  greeting: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
    textAlign: "center"
  },
  gridWrap: {
    borderRadius: radii.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24
  },
  progressBlock: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
    padding: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 20
  },
  progressCopy: {
    flex: 1,
    gap: spacing.md
  },
  progressText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  progressStar: {
    fontSize: 52
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
    minHeight: 150,
    overflow: "hidden",
    padding: spacing.xl,
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
    fontSize: 22,
    fontWeight: "800"
  },
  messageBody: {
    color: colors.text,
    fontSize: 16,
    marginTop: spacing.sm
  },
  cloudEmoji: {
    fontSize: 58
  },
  approveButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 62
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
  }
});

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
