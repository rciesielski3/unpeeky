import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
import { ParentAdSlot } from "../components/ParentAdSlot";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenDecorations } from "../components/ScreenDecorations";
import { getGoalProgress } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import type { AppTheme } from "../ui/appTheme";
import { defaultAppTheme } from "../ui/appTheme";
import { colors, fonts, radii, spacing } from "../ui/theme";

type ApproveTaskScreenProps = {
  goal: Goal;
  onApproveTask: () => void;
  onBack: () => void;
  onOpenChildView: () => void;
  parentPin: string;
  isPremium: boolean;
  theme?: AppTheme;
};

export function ApproveTaskScreen({
  goal,
  onApproveTask,
  onBack,
  onOpenChildView,
  parentPin,
  isPremium,
  theme = defaultAppTheme
}: ApproveTaskScreenProps) {
  const [pinDraft, setPinDraft] = useState("");
  const isComplete = goal.completed;
  const remainingTasks = Math.max(0, goal.totalTasks - goal.completedTasks);
  const canApprove = !isComplete && pinDraft === parentPin;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={spacing.lg}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.screen, { backgroundColor: theme.parentBackground }]}
        keyboardShouldPersistTaps="handled"
        style={[styles.scroll, { backgroundColor: theme.parentBackground }]}
      >
        <View style={[styles.glowTop, { backgroundColor: theme.accentSoft }]} />
        <ScreenDecorations variant="stars" />
        <View style={styles.header}>
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
          <ProgressBar color={theme.accent} progress={getGoalProgress(goal)} />
          <Text style={styles.progressText}>{strings.approveTask.progress(goal.completedTasks, goal.totalTasks)}</Text>
          {!isComplete && <Text style={styles.remainingText}>{strings.approveTask.remaining(remainingTasks)}</Text>}
        </View>

        {!isComplete ? (
          <View style={styles.pinBlock}>
            <View>
              <Text style={styles.pinTitle}>{strings.approveTask.pinTitle}</Text>
              <Text style={styles.pinMeta}>{strings.approveTask.pinMeta}</Text>
            </View>
            <TextInput
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(text) => setPinDraft(text.replace(/\D/g, "").slice(0, 4))}
              placeholder={strings.approveTask.pinPlaceholder}
              secureTextEntry
              style={[styles.pinInput, pinDraft.length === 4 && !canApprove && styles.invalidPinInput]}
              value={pinDraft}
            />
            {pinDraft.length === 4 && !canApprove ? (
              <Text style={styles.errorText}>{strings.approveTask.pinError}</Text>
            ) : null}
          </View>
        ) : null}

        <ParentAdSlot isPremium={isPremium} />

        <View style={styles.actions}>
          {!isComplete ? (
            <Pressable
              accessibilityRole="button"
              disabled={!canApprove}
              onPress={onApproveTask}
              style={[styles.approveButton, !canApprove && styles.disabledButton]}
            >
              <Text style={styles.filledButtonText}>{strings.approveTask.approveButton}</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onOpenChildView}
            style={[styles.childButton, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.childButtonText}>{strings.approveTask.childViewButton}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{strings.approveTask.backButton}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scroll: {
    backgroundColor: colors.parentBackground
  },
  screen: {
    backgroundColor: colors.parentBackground,
    flexGrow: 1,
    gap: spacing.md,
    overflow: "hidden",
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
  },
  glowTop: {
    borderRadius: 180,
    height: 220,
    position: "absolute",
    right: -84,
    top: 96,
    width: 220
  },
  header: {
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 40,
    textAlign: "center"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 18,
    textAlign: "center"
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 124,
    width: 124
  },
  cardCopy: {
    flex: 1,
    gap: spacing.md
  },
  rewardName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800"
  },
  childRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  meta: {
    color: colors.textMuted,
    fontSize: 18
  },
  progressBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 16
  },
  progressText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  remainingText: {
    color: colors.textMuted,
    fontSize: 18
  },
  pinBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 16
  },
  pinTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  pinMeta: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: spacing.xs
  },
  pinInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlign: "center"
  },
  invalidPinInput: {
    borderColor: colors.warning
  },
  errorText: {
    color: colors.warning,
    fontSize: 13
  },
  actions: {
    gap: spacing.sm,
    marginTop: "auto"
  },
  approveButton: {
    alignItems: "center",
    backgroundColor: colors.ctaWarning,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 58,
    shadowColor: colors.warningDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14
  },
  childButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 58,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 14
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 58
  },
  disabledButton: {
    opacity: 0.55
  },
  filledButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  childButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  backButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  }
});
