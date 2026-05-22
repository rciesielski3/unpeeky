import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../components/Button";
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [totalTasks, setTotalTasks] = useState<TileCount>(DEFAULT_TILE_COUNT);
  const canSave = childName.trim().length > 0 && rewardName.trim().length > 0 && imageUri !== null;

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setImageError(strings.addGoal.cameraPermissionDenied);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    savePickedImage(result);
  }

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setImageError(strings.addGoal.galleryPermissionDenied);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    savePickedImage(result);
  }

  function savePickedImage(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) {
      return;
    }

    const [asset] = result.assets;

    if (asset) {
      setImageUri(asset.uri);
      setImageError(null);
    }
  }

  function handleSave() {
    if (!canSave || !imageUri) {
      return;
    }

    onSave({
      childName: childName.trim(),
      rewardName: rewardName.trim(),
      imageUri,
      totalTasks,
      avatarId: DEFAULT_AVATAR_ID
    });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{strings.addGoal.title}</Text>

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>{strings.addGoal.photoStepLabel}</Text>
          <View style={styles.photoBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <Text style={styles.photoIcon}>PHOTO</Text>
            )}
            <Text style={styles.photoText}>{strings.addGoal.photoPlaceholder}</Text>
            <View style={styles.photoActions}>
              <Button label={strings.addGoal.cameraButton} onPress={pickFromCamera} variant="ghost" />
              <Button label={strings.addGoal.galleryButton} onPress={pickFromGallery} variant="ghost" />
            </View>
          </View>
          {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}
        </View>
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
    backgroundColor: "#FFFBEB",
    borderColor: colors.warning,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 168,
    padding: spacing.md
  },
  photoPreview: {
    aspectRatio: 1,
    borderRadius: 8,
    width: 112
  },
  photoIcon: {
    color: colors.warning,
    fontSize: 18,
    fontWeight: "800"
  },
  photoText: {
    color: colors.text,
    fontWeight: "700",
    textAlign: "center"
  },
  photoActions: {
    gap: spacing.sm,
    width: "100%"
  },
  errorText: {
    color: colors.warning,
    fontSize: 13,
    marginTop: spacing.sm
  },
  actions: {
    gap: spacing.sm,
    marginTop: "auto"
  }
});
