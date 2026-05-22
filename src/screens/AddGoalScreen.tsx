import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../components/Button";
import { assets } from "../config/assets";
import { DEFAULT_TILE_COUNT, TILE_OPTIONS } from "../domain/goal";
import type { GoalDraft, TileCount } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

const DEFAULT_AVATAR_ID = "dino";

type AddGoalScreenProps = {
  onBack: () => void;
  onSave: (draft: GoalDraft) => void;
};

export function AddGoalScreen({ onBack, onSave }: AddGoalScreenProps) {
  const [childName, setChildName] = useState("");
  const [rewardName, setRewardName] = useState("");
  const [totalTasks, setTotalTasks] = useState<TileCount>(DEFAULT_TILE_COUNT);
  const canSave = childName.trim().length > 0 && rewardName.trim().length > 0;

  function handleSave() {
    if (!canSave) {
      return;
    }

    onSave({
      childName: childName.trim(),
      rewardName: rewardName.trim(),
      imageUri: assets.placeholderRewardImageUri,
      totalTasks,
      avatarId: DEFAULT_AVATAR_ID
    });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{strings.addGoal.title}</Text>

      <View style={styles.form}>
        <TextInput
          onChangeText={setChildName}
          placeholder={strings.addGoal.childNamePlaceholder}
          style={styles.input}
          value={childName}
        />
        <TextInput
          onChangeText={setRewardName}
          placeholder={strings.addGoal.rewardNamePlaceholder}
          style={styles.input}
          value={rewardName}
        />
        <View>
          <Text style={styles.label}>{strings.addGoal.tileCountLabel}</Text>
          <View style={styles.tileOptions}>
            {TILE_OPTIONS.map((option) => (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => setTotalTasks(option)}
                style={[styles.tileOption, option === totalTasks && styles.selectedTile]}
              >
                <Text style={[styles.tileOptionText, option === totalTasks && styles.selectedTileText]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.photoBox}>
          <Text style={styles.photoText}>{strings.addGoal.photoPlaceholder}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button disabled={!canSave} label={strings.addGoal.saveButton} onPress={handleSave} variant="secondary" />
        <Button label={strings.addGoal.backButton} onPress={onBack} variant="ghost" />
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
  form: {
    gap: spacing.md
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm
  },
  tileOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tileOption: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minWidth: 48,
    padding: spacing.sm
  },
  tileOptionText: {
    color: colors.text,
    textAlign: "center"
  },
  selectedTile: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  selectedTileText: {
    color: colors.surface,
    fontWeight: "800"
  },
  photoBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    minHeight: 96,
    justifyContent: "center",
    padding: spacing.md
  },
  photoText: {
    color: colors.primaryDark,
    textAlign: "center"
  },
  actions: {
    gap: spacing.sm,
    marginTop: "auto"
  }
});
