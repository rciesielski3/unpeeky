import { Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing } from "../ui/theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
};

export function Button({ label, onPress, variant = "primary" }: ButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}>
      <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.accent
  },
  ghost: {
    backgroundColor: colors.surfaceMuted
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  },
  ghostLabel: {
    color: colors.primaryDark
  },
  pressed: {
    opacity: 0.78
  }
});
