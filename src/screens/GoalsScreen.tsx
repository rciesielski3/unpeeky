import { useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { FREE_GOAL_LIMIT, getGoalProgress, isGoalComplete } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, fonts, radii, spacing } from "../ui/theme";

type GoalsScreenProps = {
  goals: Goal[];
  isPremium: boolean;
  onAddGoal: () => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenGoal: (goalId: string) => void;
  onOpenSettings: () => void;
};

export function GoalsScreen({
  goals,
  isPremium,
  onAddGoal,
  onDeleteGoal,
  onOpenGoal,
  onOpenSettings
}: GoalsScreenProps) {
  const activeGoalsCount = goals.filter((goal) => !isGoalComplete(goal)).length;
  const hasReachedFreeLimit = !isPremium && activeGoalsCount >= FREE_GOAL_LIMIT;
  const sortedGoals = useMemo(() => [...goals].sort(compareGoalsByStatus), [goals]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <View style={styles.headerCopy}>
          <Text style={styles.hello}>{strings.goals.greeting}</Text>
          <Text style={styles.title}>{strings.goals.title}</Text>
          <Text style={styles.subtitle}>{strings.goals.subtitle}</Text>
        </View>
        <View style={[styles.headerSide, styles.headerAction]}>
          <Button label={strings.goals.settingsButton} onPress={onOpenSettings} variant="ghost" />
        </View>
      </View>

      <FlatList
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{strings.goals.emptyTitle}</Text>
            <Text style={styles.emptyText}>{strings.goals.emptyText}</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        data={sortedGoals}
        keyExtractor={(goal) => goal.id}
        renderItem={({ item }) => {
          const isCompleted = isGoalComplete(item);

          return (
            <View style={[styles.card, isCompleted && styles.completedCard]}>
              <Pressable accessibilityRole="button" onPress={() => onOpenGoal(item.id)} style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Image
                    accessibilityLabel={strings.goals.thumbnailLabel(item.rewardName)}
                    accessibilityRole="image"
                    source={{ uri: item.imageUri }}
                    style={styles.thumbnail}
                  />
                  <View style={styles.cardCopy}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{item.rewardName}</Text>
                      {isCompleted ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>{strings.goals.completedBadge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.childRow}>
                      <AvatarBadge avatarId={item.avatarId} size="sm" />
                      <Text style={styles.meta}>
                        {strings.goals.cardProgress(item.childName, item.completedTasks, item.totalTasks)}
                      </Text>
                    </View>
                  </View>
                </View>
                <ProgressBar progress={getGoalProgress(item)} />
              </Pressable>
              <Button label={strings.goals.deleteButton} onPress={() => onDeleteGoal(item.id)} variant="ghost" />
            </View>
          );
        }}
      />

      {hasReachedFreeLimit ? (
        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>{strings.goals.freeLimitTitle}</Text>
          <Text style={styles.limitText}>{strings.goals.freeLimitText(FREE_GOAL_LIMIT)}</Text>
          <Button label={strings.goals.freeLimitButton} onPress={onOpenSettings} variant="ghost" />
        </View>
      ) : null}

      <View style={styles.footer}>
        <Button disabled={hasReachedFreeLimit} label={strings.goals.newGoalButton} onPress={onAddGoal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.parentBackground,
    padding: spacing.lg
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
    minHeight: 72
  },
  headerSide: {
    flexBasis: 112,
    flexShrink: 0
  },
  headerCopy: {
    alignItems: "center",
    flex: 1
  },
  headerAction: {
    alignItems: "flex-end"
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center"
  },
  hello: {
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.xs,
    textAlign: "center"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  list: {
    flexGrow: 1,
    gap: spacing.md
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 220,
    padding: spacing.lg
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center"
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16
  },
  cardContent: {
    alignSelf: "stretch",
    gap: spacing.sm
  },
  completedCard: {
    backgroundColor: colors.successSurface,
    borderColor: colors.successBorder
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    height: 84,
    width: 84
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  childRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14
  },
  completedBadge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  completedBadgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800"
  },
  footer: {
    paddingTop: spacing.md
  },
  limitCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  limitTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  limitText: {
    color: colors.textMuted,
    fontSize: 13
  }
});

function compareGoalsByStatus(firstGoal: Goal, secondGoal: Goal): number {
  return Number(isGoalComplete(firstGoal)) - Number(isGoalComplete(secondGoal));
}
