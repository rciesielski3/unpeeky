import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "../ui/theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.lg,
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.warning
  },
  ghost: {
    backgroundColor: colors.surface
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
  },
  disabled: {
    opacity: 0.45
  }
});
