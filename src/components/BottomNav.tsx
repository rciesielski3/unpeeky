import { Pressable, StyleSheet, Text, View } from "react-native";

import { strings } from "../i18n/strings";
import type { AppRoute } from "../navigation/routes";
import { colors, fonts, radii, spacing } from "../ui/theme";

type BottomNavProps = {
  activeRoute: AppRoute;
  hasChildView: boolean;
  onAddGoal: () => void;
  onOpenChild: () => void;
  onOpenGoals: () => void;
  onOpenSettings: () => void;
};

type NavItem = {
  id: AppRoute;
  icon: string;
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

export function BottomNav({
  activeRoute,
  hasChildView,
  onAddGoal,
  onOpenChild,
  onOpenGoals,
  onOpenSettings
}: BottomNavProps) {
  const items: NavItem[] = [
    { id: "goals", icon: "▣", label: strings.navigation.goals, onPress: onOpenGoals },
    { id: "addGoal", icon: "+", label: strings.navigation.add, onPress: onAddGoal },
    { id: "child", disabled: !hasChildView, icon: "♟", label: strings.navigation.child, onPress: onOpenChild },
    { id: "settings", icon: "⚙", label: strings.navigation.settings, onPress: onOpenSettings }
  ];

  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const isActive = activeRoute === item.id;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: item.disabled, selected: isActive }}
            disabled={item.disabled}
            key={item.id}
            onPress={item.onPress}
            style={[styles.item, isActive && styles.activeItem, item.disabled && styles.disabledItem]}
          >
            <Text style={[styles.icon, isActive && styles.activeText]}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeText]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 24
  },
  item: {
    alignItems: "center",
    borderRadius: radii.md,
    flex: 1,
    gap: 2,
    paddingVertical: spacing.sm
  },
  activeItem: {
    backgroundColor: colors.primarySoft
  },
  disabledItem: {
    opacity: 0.35
  },
  icon: {
    color: colors.textMuted,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 26
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },
  activeText: {
    color: colors.primaryDark
  }
});
