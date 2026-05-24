import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { getGoalProgress } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, fonts, radii, spacing } from "../ui/theme";

type ApproveTaskScreenProps = {
  goal: Goal;
  onApproveTask: () => void;
  onBack: () => void;
  onOpenChildView: () => void;
  parentPin: string;
};

export function ApproveTaskScreen({ goal, onApproveTask, onBack, onOpenChildView, parentPin }: ApproveTaskScreenProps) {
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
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
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
            <Button
              disabled={!canApprove}
              label={strings.approveTask.approveButton}
              onPress={onApproveTask}
              variant="secondary"
            />
          ) : null}
          <Button label={strings.approveTask.childViewButton} onPress={onOpenChildView} />
          <Button label={strings.approveTask.backButton} onPress={onBack} variant="ghost" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  screen: {
    backgroundColor: colors.parentBackground,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
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
    padding: spacing.lg
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
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
    borderRadius: radii.lg,
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
  pinBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  pinTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  pinMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs
  },
  pinInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  }
});
