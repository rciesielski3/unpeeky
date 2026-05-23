import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AddGoalScreen } from "./src/screens/AddGoalScreen";
import { ApproveTaskScreen } from "./src/screens/ApproveTaskScreen";
import { ChildScreen } from "./src/screens/ChildScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { ModeSelectionScreen } from "./src/screens/ModeSelectionScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { completeTask, createGoal, getTileColor, normalizeSettings } from "./src/domain/goal";
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
        setSettings(normalizeSettings(null));
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

  function handleDeleteGoal(goalId: string) {
    const goal = goals.find((currentGoal) => currentGoal.id === goalId);

    if (!goal) {
      return;
    }

    Alert.alert(strings.goals.deleteTitle, strings.goals.deleteMeta(goal.rewardName), [
      { text: strings.settings.backButton, style: "cancel" },
      {
        text: strings.goals.deleteButton,
        style: "destructive",
        onPress: () => {
          setGoals((currentGoals) => currentGoals.filter((currentGoal) => currentGoal.id !== goalId));

          if (selectedGoalId === goalId) {
            setSelectedGoalId(null);
          }
        }
      }
    ]);
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

  function handleSelectMode(appMode: AppSettings["appMode"]) {
    if (!appMode) {
      return;
    }

    setSettings((currentSettings) => (currentSettings ? { ...currentSettings, appMode } : currentSettings));
    setRoute("goals");
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

  const screen = !settings.appMode ? (
    <ModeSelectionScreen initialMode={settings.appMode} onSelectMode={handleSelectMode} />
  ) : (
    <>
      {route === "goals" ? (
        <GoalsScreen
          goals={goals}
          isPremium={settings.isPremium}
          onAddGoal={() => setRoute("addGoal")}
          onDeleteGoal={handleDeleteGoal}
          onOpenGoal={handleOpenGoal}
          onOpenSettings={() => setRoute("settings")}
        />
      ) : null}
      {route === "addGoal" ? <AddGoalScreen onBack={() => setRoute("goals")} onSave={handleCreateGoal} /> : null}
      {route === "approveTask" && activeGoal ? (
        <ApproveTaskScreen
          goal={activeGoal}
          onApproveTask={() => {
            handleCompleteTask(activeGoal.id);
            setRoute("child");
          }}
          onBack={() => setRoute("goals")}
          onOpenChildView={() => setRoute("child")}
          parentPin={settings.parentPin}
        />
      ) : null}
      {route === "child" && activeGoal ? (
        <ChildScreen
          goal={activeGoal}
          onBack={() => setRoute("approveTask")}
          onCompleteTask={() => setRoute("approveTask")}
          tileColor={getTileColor(settings.tileColorId)}
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
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>{screen}</View>
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
