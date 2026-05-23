import { useEffect, useRef } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Audio } from "expo-av";

import { AvatarBadge } from "../components/AvatarBadge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { TileGrid } from "../components/TileGrid";
import { getGoalProgress, isGoalComplete } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, fonts, spacing } from "../ui/theme";

type ChildScreenProps = {
  goal: Goal;
  onBack: () => void;
  onCompleteTask: () => void;
  tileColor: string;
};

export function ChildScreen({ goal, onBack, onCompleteTask, tileColor }: ChildScreenProps) {
  const isComplete = isGoalComplete(goal);
  const remainingTasks = Math.max(0, goal.totalTasks - goal.completedTasks);
  const hasPlayedCompletionFeedback = useRef(isComplete);
  const lastGoalId = useRef(goal.id);

  if (lastGoalId.current !== goal.id) {
    hasPlayedCompletionFeedback.current = isComplete;
    lastGoalId.current = goal.id;
  }

  useEffect(() => {
    if (isComplete && !hasPlayedCompletionFeedback.current) {
      Vibration.vibrate([0, 120, 80, 160]);
      playCompletionSound();
      hasPlayedCompletionFeedback.current = true;
    }
  }, [isComplete]);

  const playCompletionSound = async () => {
    try {
      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true
      });

      // Create a simple completion sound using expo-av
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { sound } = await Audio.Sound.createAsync(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../../assets/sounds/completion.mp3"),
        { shouldPlay: true }
      );
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch {
      // Fallback: audio not available, continue without sound
      // In production, you would add an actual sound file at assets/sounds/completion.mp3
    }
  };

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
        {isComplete ? <AnimatedConfetti /> : null}
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
    fontFamily: fonts.heading,
    fontSize: 24,
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

function ConfettiDot({ color, delay, from }: { color: string; delay: number; from: "left" | "right" }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withTiming(-60, {
        duration: 1500,
        easing: Easing.out(Easing.ease)
      });
      opacity.value = withTiming(0, {
        duration: 1000,
        easing: Easing.out(Easing.ease)
      });
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

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

function AnimatedConfetti() {
  const confettiPieces: Array<{ color: string; delay: number; from: "left" | "right" }> = [
    { color: colors.confettiYellow, delay: 0, from: "left" },
    { color: colors.confettiBlue, delay: 80, from: "right" },
    { color: colors.confettiPink, delay: 160, from: "left" },
    { color: colors.confettiGreen, delay: 240, from: "right" }
  ];

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {confettiPieces.map((piece, idx) => (
        <ConfettiDot key={idx} color={piece.color} delay={piece.delay} from={piece.from} />
      ))}
    </View>
  );
}
