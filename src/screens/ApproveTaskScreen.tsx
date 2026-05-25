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
import { ProgressBar } from "../components/ProgressBar";
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
  theme?: AppTheme;
};

export function ApproveTaskScreen({
  goal,
  onApproveTask,
  onBack,
  onOpenChildView,
  parentPin,
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
            <Text style={styles.filledButtonText}>{strings.approveTask.childViewButton}</Text>
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
  },
  header: {
    alignItems: "center",
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 28,
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    height: 112,
    width: 112
  },
  cardCopy: {
    flex: 1,
    gap: spacing.md
  },
  rewardName: {
    color: colors.text,
    fontSize: 22,
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
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
    backgroundColor: "#FFD483",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 62
  },
  childButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 62
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 62
  },
  disabledButton: {
    opacity: 0.55
  },
  filledButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  backButtonText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "800"
  }
});
