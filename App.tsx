import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AddGoalScreen } from "./src/screens/AddGoalScreen";
import { ApproveTaskScreen } from "./src/screens/ApproveTaskScreen";
import { ChildScreen } from "./src/screens/ChildScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { completeTask, createGoal, DEFAULT_APP_SETTINGS } from "./src/domain/goal";
import type { AppSettings, Goal, GoalDraft } from "./src/domain/goal";
import { strings } from "./src/i18n/strings";
import type { AppRoute } from "./src/navigation/routes";
import { loadGoals, loadSettings, saveGoals, saveSettings } from "./src/storage/appStorage";
import { colors } from "./src/ui/theme";

export default function App() {
  const [route, setRoute] = useState<AppRoute>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const shouldSkipNextGoalsSave = useRef(true);
  const shouldSkipNextSettingsSave = useRef(true);
  const activeGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId), [goals, selectedGoalId]);

  useEffect(() => {
    async function hydrateApp() {
      try {
        const [storedGoals, storedSettings] = await Promise.all([loadGoals(), loadSettings()]);

        setGoals(storedGoals);
        setSettings(storedSettings);
      } catch {
        setGoals([]);
        setSettings(DEFAULT_APP_SETTINGS);
      } finally {
        setIsHydrated(true);
      }
    }

    void hydrateApp();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (shouldSkipNextGoalsSave.current) {
        shouldSkipNextGoalsSave.current = false;
        return;
      }

      void saveGoals(goals);
    }
  }, [goals, isHydrated]);

  useEffect(() => {
    if (isHydrated && settings) {
      if (shouldSkipNextSettingsSave.current) {
        shouldSkipNextSettingsSave.current = false;
        return;
      }

      void saveSettings(settings);
    }
  }, [isHydrated, settings]);

  function handleCreateGoal(draft: GoalDraft) {
    const goal = createGoal(draft);

    setGoals((currentGoals) => [goal, ...currentGoals]);
    setSelectedGoalId(goal.id);
    setRoute("approveTask");
  }

  function handleOpenGoal(goalId: string) {
    setSelectedGoalId(goalId);
    setRoute("approveTask");
  }

  function handleCompleteTask(goalId: string) {
    setGoals((currentGoals) => currentGoals.map((goal) => (goal.id === goalId ? completeTask(goal) : goal)));
  }

  function handleResetGoals() {
    Alert.alert(strings.settings.resetTitle, strings.settings.resetMeta, [
      { text: strings.settings.backButton, style: "cancel" },
      {
        text: strings.settings.resetButton,
        style: "destructive",
        onPress: () => {
          setGoals([]);
          setSelectedGoalId(null);
          setRoute("goals");
        }
      }
    ]);
  }

  if (!isHydrated || !settings) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{strings.app.loading}</Text>
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
        {route === "approveTask" && activeGoal ? (
          <ApproveTaskScreen
            goal={activeGoal}
            onApproveTask={() => handleCompleteTask(activeGoal.id)}
            onBack={() => setRoute("goals")}
            onOpenChildView={() => setRoute("child")}
          />
        ) : null}
        {route === "child" && activeGoal ? (
          <ChildScreen
            goal={activeGoal}
            onBack={() => setRoute("approveTask")}
            onCompleteTask={() => handleCompleteTask(activeGoal.id)}
          />
        ) : null}
        {route === "settings" ? (
          <SettingsScreen
            onBack={() => setRoute("goals")}
            onResetGoals={handleResetGoals}
            onSettingsChange={setSettings}
            settings={settings}
          />
        ) : null}
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
