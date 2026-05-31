import { StyleSheet, Text, View } from "react-native";

import { getAvatar } from "../domain/avatar";
import { strings } from "../i18n/strings";
import { colors } from "../ui/theme";

type AvatarBadgeSize = "sm" | "md" | "lg";

type AvatarBadgeProps = {
  avatarId: string;
  size?: AvatarBadgeSize;
};

const SIZE_STYLES: Record<AvatarBadgeSize, { box: number; font: number; border: number }> = {
  sm: { box: 36, font: 18, border: 0 },
  md: { box: 42, font: 21, border: 0 },
  lg: { box: 76, font: 38, border: 4 }
};

export function AvatarBadge({ avatarId, size = "md" }: AvatarBadgeProps) {
  const avatar = getAvatar(avatarId);
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      accessibilityLabel={strings.avatars[avatar.labelKey]}
      accessibilityRole="image"
      style={[
        styles.badge,
        {
          borderWidth: sizeStyle.border,
          height: sizeStyle.box,
          width: sizeStyle.box
        }
      ]}
    >
      <Text style={[styles.emoji, { fontSize: sizeStyle.font }]}>{avatar.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.surface,
    borderRadius: 999,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    justifyContent: "center"
  },
  emoji: {
    textAlign: "center"
  }
});
