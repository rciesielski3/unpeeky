import { StyleSheet, Text, View } from "react-native";

import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type ParentAdSlotProps = {
  isPremium: boolean;
};

export function ParentAdSlot({ isPremium }: ParentAdSlotProps) {
  // Hide ads for premium users
  if (isPremium) {
    return null;
  }

  // MVP: Show placeholder for ad slot (actual ads deferred to post-MVP monetization)
  return (
    <View accessibilityLabel={strings.ads.placeholderLabel} accessibilityRole="summary" style={styles.slot}>
      <Text style={styles.label}>{strings.ads.placeholderTitle}</Text>
      <Text style={styles.text}>{strings.ads.placeholderText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 72,
    padding: spacing.md
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  text: {
    color: colors.text,
    fontSize: 13,
    textAlign: "center"
  }
});
