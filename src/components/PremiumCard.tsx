import { Pressable, StyleSheet, Text, View } from "react-native";

import { strings } from "../i18n/strings";
import { colors, fonts, spacing } from "../ui/theme";

type PremiumCardProps = {
  isPremium: boolean;
  onPress: () => void;
};

export function PremiumCard({ isPremium, onPress }: PremiumCardProps) {
  const statusText = isPremium ? strings.premium.activeBadge : strings.premium.inactiveBadge;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isPremium }}
      accessibilityLabel={isPremium ? strings.premium.activeTitle : strings.premium.inactiveTitle}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusText}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{isPremium ? strings.premium.activeTitle : strings.premium.inactiveTitle}</Text>
          <Text style={styles.meta}>{isPremium ? strings.premium.activeMeta : strings.premium.inactiveMeta}</Text>
        </View>
      </View>

      <View style={styles.benefits}>
        {strings.premium.benefits.map((benefit) => (
          <BenefitRow active={isPremium} key={benefit} text={benefit} />
        ))}
      </View>

      {!isPremium && (
        <View style={styles.footer}>
          <Text style={styles.price}>{strings.premium.price}</Text>
          <Text style={styles.priceMeta}>{strings.premium.priceMeta}</Text>
        </View>
      )}
    </Pressable>
  );
}

function BenefitRow({ active, text }: { active: boolean; text: string }) {
  return (
    <View style={styles.benefit}>
      <Text style={[styles.benefitIcon, { opacity: active ? 1 : 0.5 }]}>{active ? "+" : "-"}</Text>
      <Text style={[styles.benefitText, !active && styles.benefitTextMuted]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
    borderRadius: 12,
    borderWidth: 2,
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg
  },
  cardPressed: {
    opacity: 0.9
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  badgeText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "800"
  },
  headerText: {
    flex: 1
  },
  title: {
    color: colors.surface,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: "800"
  },
  meta: {
    color: colors.surface,
    fontSize: 13,
    marginTop: spacing.xs,
    opacity: 0.8
  },
  benefits: {
    gap: spacing.sm
  },
  benefit: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  benefitIcon: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    width: 20
  },
  benefitText: {
    color: colors.surface,
    flex: 1,
    fontSize: 14,
    fontWeight: "500"
  },
  benefitTextMuted: {
    opacity: 0.7
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.surface,
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.md
  },
  price: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "800"
  },
  priceMeta: {
    color: colors.surface,
    fontSize: 12,
    marginTop: spacing.xs,
    opacity: 0.8
  }
});
