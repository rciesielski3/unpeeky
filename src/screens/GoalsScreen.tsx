import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { Goal, getGoalProgress } from "../domain/goal";
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
          <Text style={styles.title}>Unpeeky</Text>
          <Text style={styles.subtitle}>Cele i postepy</Text>
        </View>
        <Button label="Ustawienia" onPress={onOpenSettings} variant="ghost" />
      </View>

      <FlatList
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Brak celow</Text>
            <Text style={styles.emptyText}>Dodaj pierwszy cel i sprawdz pelna petle lokalnie.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        data={goals}
        keyExtractor={(goal) => goal.id}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => onOpenGoal(item.id)} style={styles.card}>
            <Text style={styles.cardTitle}>{item.rewardName}</Text>
            <Text style={styles.meta}>
              {item.childName} - {item.completedTasks}/{item.totalTasks}
            </Text>
            <ProgressBar progress={getGoalProgress(item)} />
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Button label="Nowy cel" onPress={onAddGoal} />
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
