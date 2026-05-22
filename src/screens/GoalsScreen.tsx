import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { AvatarBadge } from "../components/AvatarBadge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { getGoalProgress } from "../domain/goal";
import type { Goal } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type GoalsScreenProps = {
  goals: Goal[];
  onAddGoal: () => void;
  onOpenGoal: (goalId: string) => void;
  onOpenSettings: () => void;
};

export function GoalsScreen({ goals, onAddGoal, onOpenGoal, onOpenSettings }: GoalsScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{strings.goals.title}</Text>
          <Text style={styles.subtitle}>{strings.goals.subtitle}</Text>
        </View>
        <Button label={strings.goals.settingsButton} onPress={onOpenSettings} variant="ghost" />
      </View>

      <FlatList
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{strings.goals.emptyTitle}</Text>
            <Text style={styles.emptyText}>{strings.goals.emptyText}</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        data={goals}
        keyExtractor={(goal) => goal.id}
        renderItem={({ item }) => {
          return (
            <Pressable accessibilityRole="button" onPress={() => onOpenGoal(item.id)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  accessibilityLabel={strings.goals.thumbnailLabel(item.rewardName)}
                  accessibilityRole="image"
                  source={{ uri: item.imageUri }}
                  style={styles.thumbnail}
                />
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.rewardName}</Text>
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
          );
        }}
      />

      <View style={styles.footer}>
        <Button label={strings.goals.newGoalButton} onPress={onAddGoal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs
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
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 84,
    width: 84
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs
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
  footer: {
    paddingTop: spacing.md
  }
});
