import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
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
import { Button } from "../components/Button";
import { AVATARS, DEFAULT_AVATAR_ID } from "../domain/avatar";
import type { AvatarId } from "../domain/avatar";
import { DEFAULT_TILE_COUNT, TILE_OPTIONS } from "../domain/goal";
import type { GoalDraft, TileCount } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type ImageSource = "camera" | "gallery";

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
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const canSave = childName.trim().length > 0 && rewardName.trim().length > 0 && imageUri !== null;

  async function pickImage(source: ImageSource) {
    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setImageError(
          source === "camera" ? strings.addGoal.cameraPermissionDenied : strings.addGoal.galleryPermissionDenied
        );
        return;
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync({
              ...pickerOptions,
              mediaTypes: ImagePicker.MediaTypeOptions.Images
            });

      savePickedImage(result);
    } catch {
      setImageError(strings.addGoal.imagePickerError);
    }
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
      avatarId
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={spacing.lg}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{strings.addGoal.title}</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>{strings.addGoal.photoStepLabel}</Text>
            <View style={styles.photoBox}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photoPreview} />
              ) : (
                <Text style={styles.photoIcon}>{strings.addGoal.photoEmptyLabel}</Text>
              )}
              <Text style={styles.photoText}>{strings.addGoal.photoPlaceholder}</Text>
              <View style={styles.photoActions}>
                <Button label={strings.addGoal.cameraButton} onPress={() => void pickImage("camera")} variant="ghost" />
                <Button
                  label={strings.addGoal.galleryButton}
                  onPress={() => void pickImage("gallery")}
                  variant="ghost"
                />
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
            <Text style={styles.label}>{strings.addGoal.avatarLabel}</Text>
            <View style={styles.avatarOptions}>
              {AVATARS.map((avatar) => (
                <Pressable
                  accessibilityLabel={strings.avatars[avatar.labelKey]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: avatar.id === avatarId }}
                  key={avatar.id}
                  onPress={() => setAvatarId(avatar.id)}
                  style={[styles.avatarOption, avatar.id === avatarId && styles.selectedAvatar]}
                >
                  <AvatarBadge avatarId={avatar.id} size="sm" />
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.label}>{strings.addGoal.tileCountLabel}</Text>
            <View style={styles.tileOptions}>
              {TILE_OPTIONS.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: option === totalTasks }}
                  key={option}
                  onPress={() => setTotalTasks(option)}
                  style={[styles.tileOption, option === totalTasks && styles.selectedTile]}
                >
                  <Text style={[styles.tileOptionText, option === totalTasks && styles.selectedTileText]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button disabled={!canSave} label={strings.addGoal.saveButton} onPress={handleSave} variant="secondary" />
          <Button label={strings.addGoal.backButton} onPress={onBack} variant="ghost" />
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
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontFamily: "sans-serif-rounded",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
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
  avatarOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  avatarOption: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  selectedAvatar: {
    borderColor: colors.primary,
    borderWidth: 2
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
