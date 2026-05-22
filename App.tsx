import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AddGoalScreen } from "./src/screens/AddGoalScreen";
import { ChildScreen } from "./src/screens/ChildScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { completeTask, createGoal } from "./src/domain/goal";
import type { Goal, GoalDraft } from "./src/domain/goal";
import type { AppRoute } from "./src/navigation/routes";
import { loadGoals, saveGoals } from "./src/storage/appStorage";
import { colors } from "./src/ui/theme";

export default function App() {
  const [route, setRoute] = useState<AppRoute>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const activeGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId), [goals, selectedGoalId]);

  useEffect(() => {
    loadGoals()
      .then(setGoals)
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void saveGoals(goals);
    }
  }, [goals, isHydrated]);

  function handleCreateGoal(draft: GoalDraft) {
    const goal = createGoal(draft);

    setGoals((currentGoals) => [goal, ...currentGoals]);
    setSelectedGoalId(goal.id);
    setRoute("child");
  }

  function handleOpenGoal(goalId: string) {
    setSelectedGoalId(goalId);
    setRoute("child");
  }

  function handleCompleteTask(goalId: string) {
    setGoals((currentGoals) => currentGoals.map((goal) => (goal.id === goalId ? completeTask(goal) : goal)));
  }

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Ladowanie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        {route === "goals" ? (
          <GoalsScreen
            goals={goals}
            onAddGoal={() => setRoute("addGoal")}
            onOpenGoal={handleOpenGoal}
            onOpenSettings={() => setRoute("settings")}
          />
        ) : null}
        {route === "addGoal" ? <AddGoalScreen onBack={() => setRoute("goals")} onSave={handleCreateGoal} /> : null}
        {route === "child" && activeGoal ? (
          <ChildScreen
            goal={activeGoal}
            onBack={() => setRoute("goals")}
            onCompleteTask={() => handleCompleteTask(activeGoal.id)}
          />
        ) : null}
        {route === "settings" ? <SettingsScreen onBack={() => setRoute("goals")} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  app: {
    flex: 1
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 16
  }
});
