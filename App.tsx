import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { AppLoader } from "./src/components/AppLoader";
import { BottomNav } from "./src/components/BottomNav";
import { AddGoalScreen } from "./src/screens/AddGoalScreen";
import { ApproveTaskScreen } from "./src/screens/ApproveTaskScreen";
import { ChildScreen } from "./src/screens/ChildScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { ModeSelectionScreen } from "./src/screens/ModeSelectionScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { completeTask, createGoal, normalizeSettings, updateGoal } from "./src/domain/goal";
import type { AppSettings, Goal, GoalDraft } from "./src/domain/goal";
import { strings } from "./src/i18n/strings";
import type { AppRoute } from "./src/navigation/routes";
import { loadGoals, loadSettings, saveGoals, saveSettings } from "./src/storage/appStorage";
import { getAppTheme } from "./src/ui/appTheme";
import { colors, fonts, radii, spacing } from "./src/ui/theme";

export default function App() {
  const [route, setRoute] = useState<AppRoute>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [pendingRevealGoalId, setPendingRevealGoalId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [goalIdPendingDelete, setGoalIdPendingDelete] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const shouldSkipNextGoalsSave = useRef(true);
  const shouldSkipNextSettingsSave = useRef(true);
  const activeGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId), [goals, selectedGoalId]);
  const goalPendingDelete = useMemo(
    () => goals.find((goal) => goal.id === goalIdPendingDelete) ?? null,
    [goalIdPendingDelete, goals]
  );

  useEffect(() => {
    async function hydrateApp() {
      try {
        const [storedGoals, storedSettings] = await Promise.all([loadGoals(), loadSettings()]);

        setGoals(storedGoals);
        setSettings(normalizeSettings(storedSettings));
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

  function handleSaveGoal(draft: GoalDraft) {
    if (activeGoal && route === "addGoal") {
      setGoals((currentGoals) =>
        currentGoals.map((goal) => (goal.id === activeGoal.id ? updateGoal(goal, draft) : goal))
      );
      setRoute("goals");
      return;
    }

    handleCreateGoal(draft);
  }

  function handleStartAddGoal() {
    setSelectedGoalId(null);
    setRoute("addGoal");
  }

  function handleStartEditGoal(goalId: string) {
    setSelectedGoalId(goalId);
    setRoute("addGoal");
  }

  function handleOpenGoal(goalId: string) {
    setSelectedGoalId(goalId);
    setRoute("approveTask");
  }

  function handleApproveTask(goalId: string) {
    setPendingRevealGoalId(goalId);
    setRoute("child");
  }

  function handleRevealTile(goalId: string, tileId: number) {
    setGoals((currentGoals) => currentGoals.map((goal) => (goal.id === goalId ? completeTask(goal, tileId) : goal)));
    setPendingRevealGoalId(null);
  }

  function handleDeleteGoal(goalId: string) {
    setGoalIdPendingDelete(goalId);
  }

  function handleCancelDeleteGoal() {
    setGoalIdPendingDelete(null);
  }

  function handleConfirmDeleteGoal() {
    if (!goalPendingDelete) {
      setGoalIdPendingDelete(null);
      return;
    }

    const goalId = goalPendingDelete.id;

    setGoals((currentGoals) => currentGoals.filter((currentGoal) => currentGoal.id !== goalId));

    if (selectedGoalId === goalId) {
      setSelectedGoalId(null);
    }

    setGoalIdPendingDelete(null);
  }

  function handleResetGoals() {
    setIsResetConfirmOpen(true);
  }

  function handleConfirmResetGoals() {
    setGoals([]);
    setSelectedGoalId(null);
    setIsResetConfirmOpen(false);
    setRoute("goals");
  }

  function handleSelectMode(appMode: AppSettings["appMode"]) {
    if (!appMode) {
      return;
    }

    setSettings((currentSettings) => (currentSettings ? { ...currentSettings, appMode } : currentSettings));
    setRoute("goals");
  }

  function handleOpenChildTab() {
    setRoute("child");
  }

  if (!isHydrated || !settings) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.parentBackground }]}>
        <StatusBar style="dark" />
        <AppLoader />
      </SafeAreaView>
    );
  }

  const appTheme = getAppTheme(settings.tileColorId);
  const screen = !settings.appMode ? (
    <ModeSelectionScreen initialMode={settings.appMode} onSelectMode={handleSelectMode} />
  ) : (
    <>
      {route === "goals" ? (
        <GoalsScreen
          goals={goals}
          isPremium={settings.isPremium}
          onAddGoal={handleStartAddGoal}
          onDeleteGoal={handleDeleteGoal}
          onEditGoal={handleStartEditGoal}
          onOpenGoal={handleOpenGoal}
          onOpenSettings={() => setRoute("settings")}
          theme={appTheme}
        />
      ) : null}
      {route === "addGoal" ? (
        <AddGoalScreen
          initialGoal={activeGoal ?? null}
          isPremium={settings.isPremium}
          onBack={() => setRoute("goals")}
          onSave={handleSaveGoal}
          theme={appTheme}
        />
      ) : null}
      {route === "approveTask" && activeGoal ? (
        <ApproveTaskScreen
          goal={activeGoal}
          onApproveTask={() => {
            handleApproveTask(activeGoal.id);
          }}
          onBack={() => setRoute("goals")}
          onOpenChildView={() => setRoute("child")}
          parentPin={settings.parentPin}
          isPremium={settings.isPremium}
          theme={appTheme}
        />
      ) : null}
      {route === "child" && activeGoal ? (
        <ChildScreen
          canRevealTile={pendingRevealGoalId === activeGoal.id}
          goal={activeGoal}
          onBack={() => setRoute("approveTask")}
          onCompleteTask={() => setRoute("approveTask")}
          onRevealTile={(tileId) => handleRevealTile(activeGoal.id, tileId)}
          theme={appTheme}
          tileColor={appTheme.tile}
        />
      ) : null}
      {route === "settings" ? (
        <SettingsScreen
          onBack={() => setRoute("goals")}
          onResetGoals={handleResetGoals}
          onSettingsChange={setSettings}
          settings={settings}
          theme={appTheme}
        />
      ) : null}
    </>
  );
  const shouldShowBottomNav = Boolean(settings.appMode) && route !== "approveTask";
  const routeBackground = getRouteBackground(route, appTheme);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: routeBackground }]}>
      <StatusBar style="dark" />
      <View style={[styles.app, { backgroundColor: routeBackground }]}>
        <View style={styles.screenSlot}>{screen}</View>
        {shouldShowBottomNav ? (
          <BottomNav
            activeRoute={route}
            hasChildView={Boolean(activeGoal)}
            onAddGoal={handleStartAddGoal}
            onOpenChild={handleOpenChildTab}
            onOpenGoals={() => setRoute("goals")}
            onOpenSettings={() => setRoute("settings")}
            theme={appTheme}
          />
        ) : null}
        <ResetConfirmModal
          onCancel={() => setIsResetConfirmOpen(false)}
          onConfirm={handleConfirmResetGoals}
          themeAccent={appTheme.accent}
          themeAccentSoft={appTheme.accentSoft}
          visible={isResetConfirmOpen}
        />
        <GoalDeleteConfirmModal
          goal={goalPendingDelete}
          onCancel={handleCancelDeleteGoal}
          onConfirm={handleConfirmDeleteGoal}
          themeAccent={appTheme.accent}
          themeAccentSoft={appTheme.accentSoft}
          visible={goalPendingDelete !== null}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? NativeStatusBar.currentHeight : 0
  },
  app: {
    flex: 1
  },
  screenSlot: {
    flex: 1
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  resetCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%"
  },
  resetIconBubble: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 64,
    justifyContent: "center",
    width: 64
  },
  resetIcon: {
    fontFamily: fonts.heading,
    fontSize: 36,
    fontWeight: "900"
  },
  resetTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  resetMeta: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  resetActions: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  resetCancelButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 52
  },
  resetConfirmButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1.25,
    justifyContent: "center",
    minHeight: 52
  },
  resetCancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "800"
  },
  resetConfirmText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  }
});

function getRouteBackground(route: AppRoute, appTheme: ReturnType<typeof getAppTheme>): string {
  switch (route) {
    case "addGoal":
      return appTheme.addBackground;
    case "child":
      return appTheme.childBackground;
    case "settings":
      return appTheme.settingsBackground;
    case "approveTask":
    case "goals":
    default:
      return appTheme.parentBackground;
  }
}

function ResetConfirmModal({
  onCancel,
  onConfirm,
  themeAccent,
  themeAccentSoft,
  visible
}: {
  onCancel: () => void;
  onConfirm: () => void;
  themeAccent: string;
  themeAccentSoft: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.resetCard}>
          <View style={[styles.resetIconBubble, { backgroundColor: themeAccentSoft }]}>
            <Text style={[styles.resetIcon, { color: themeAccent }]}>!</Text>
          </View>
          <Text style={styles.resetTitle}>{strings.settings.resetTitle}</Text>
          <Text style={styles.resetMeta}>{strings.settings.resetMeta}</Text>
          <View style={styles.resetActions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.resetCancelButton}>
              <Text style={styles.resetCancelText}>{strings.settings.backButton}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.resetConfirmButton, { backgroundColor: themeAccent }]}
            >
              <Text style={styles.resetConfirmText}>{strings.settings.resetButton}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GoalDeleteConfirmModal({
  goal,
  onCancel,
  onConfirm,
  themeAccent,
  themeAccentSoft,
  visible
}: {
  goal: Goal | null;
  onCancel: () => void;
  onConfirm: () => void;
  themeAccent: string;
  themeAccentSoft: string;
  visible: boolean;
}) {
  if (!goal) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.resetCard}>
          <View style={[styles.resetIconBubble, { backgroundColor: themeAccentSoft }]}>
            <Text style={[styles.resetIcon, { color: themeAccent }]}>×</Text>
          </View>
          <Text style={styles.resetTitle}>{strings.goals.deleteTitle}</Text>
          <Text style={styles.resetMeta}>{strings.goals.deleteMeta(goal.rewardName)}</Text>
          <View style={styles.resetActions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.resetCancelButton}>
              <Text style={styles.resetCancelText}>{strings.settings.backButton}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.resetConfirmButton, { backgroundColor: themeAccent }]}
            >
              <Text style={styles.resetConfirmText}>{strings.goals.deleteButton}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
