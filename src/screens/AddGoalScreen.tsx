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
import { AVATARS, DEFAULT_AVATAR_ID } from "../domain/avatar";
import type { AvatarId } from "../domain/avatar";
import { DEFAULT_TILE_COUNT, TILE_OPTIONS } from "../domain/goal";
import type { GoalDraft, TileCount } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, fonts, radii, spacing } from "../ui/theme";

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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={spacing.lg}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" style={styles.scroll}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={strings.addGoal.backButton}
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{strings.addGoal.title}</Text>
          <View accessibilityRole="image" style={styles.starBadge}>
            <Text style={styles.starIcon}>⭐</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.section}>
            <Text style={styles.label}>{strings.addGoal.photoStepLabel}</Text>
            <Pressable
              accessibilityLabel={strings.addGoal.photoPlaceholder}
              accessibilityRole="button"
              onPress={() => void pickImage("camera")}
              style={styles.photoBox}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photoPreview} />
              ) : (
                <Text style={styles.photoIcon}>{strings.addGoal.photoEmptyLabel}</Text>
              )}
              <Text style={styles.photoText}>{strings.addGoal.photoPlaceholder}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={strings.addGoal.galleryButton}
              accessibilityRole="button"
              onPress={() => void pickImage("gallery")}
              style={styles.galleryLink}
            >
              <Text style={styles.galleryLinkText}>{strings.addGoal.galleryButton}</Text>
            </Pressable>
            {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>{strings.addGoal.rewardStepLabel}</Text>
            <TextInput
              onChangeText={setRewardName}
              placeholder={strings.addGoal.rewardNamePlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={rewardName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{strings.addGoal.taskStepLabel}</Text>
            <View style={styles.tileOptions}>
              {TILE_OPTIONS.map((option) => (
                <Pressable
                  accessibilityLabel={`${strings.addGoal.taskStepLabel}: ${option}`}
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

          <View style={styles.section}>
            <Text style={styles.label}>{strings.addGoal.avatarStepLabel}</Text>
            <View style={styles.avatarOptions}>
              {AVATARS.slice(0, 6).map((avatar) => (
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

          <View style={styles.section}>
            <Text style={styles.label}>{strings.addGoal.childStepLabel}</Text>
            <TextInput
              onChangeText={setChildName}
              placeholder={strings.addGoal.childNamePlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={childName}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={handleSave}
            style={[styles.saveButton, !canSave && styles.disabledButton]}
          >
            <Text style={styles.saveButtonText}>{strings.addGoal.saveButton}</Text>
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
    backgroundColor: colors.addBackground
  },
  screen: {
    backgroundColor: colors.addBackground,
    flexGrow: 1,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 84
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 58,
    justifyContent: "center",
    shadowColor: colors.warningDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    width: 58
  },
  backIcon: {
    color: colors.warning,
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 46
  },
  starBadge: {
    alignItems: "center",
    height: 72,
    justifyContent: "center",
    width: 72
  },
  starIcon: {
    fontSize: 56
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center"
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    gap: spacing.xl,
    padding: spacing.xl,
    shadowColor: colors.warningDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 22
  },
  section: {
    gap: spacing.sm
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: "#EFE3D2",
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 60,
    paddingHorizontal: spacing.lg
  },
  label: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  divider: {
    backgroundColor: "#F2E6CA",
    height: 1
  },
  tileOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  tileOption: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "#EFE3D2",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 62,
    width: "21%"
  },
  tileOptionText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center"
  },
  selectedTile: {
    borderColor: colors.warning,
    backgroundColor: "#FFD338"
  },
  selectedTileText: {
    color: colors.text,
    fontWeight: "800"
  },
  avatarOptions: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  avatarOption: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  selectedAvatar: {
    borderColor: colors.warning,
    borderWidth: 2
  },
  photoBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "#F3D36D",
    borderRadius: 26,
    borderStyle: "dashed",
    borderWidth: 2,
    gap: spacing.md,
    justifyContent: "center",
    minHeight: 190,
    padding: spacing.lg
  },
  photoPreview: {
    aspectRatio: 1,
    borderRadius: radii.md,
    width: 112
  },
  photoIcon: {
    fontSize: 44,
    fontWeight: "800"
  },
  photoText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 26,
    textAlign: "center"
  },
  galleryLink: {
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  galleryLinkText: {
    color: colors.primaryDark,
    fontWeight: "800"
  },
  errorText: {
    color: colors.warning,
    fontSize: 13,
    marginTop: spacing.sm
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#FFC20E",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 78,
    shadowColor: colors.warningDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14
  },
  disabledButton: {
    opacity: 0.45
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: "800"
  }
});
