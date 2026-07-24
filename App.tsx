import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AppLoader } from "./src/components/AppLoader";
import { BottomNav } from "./src/components/BottomNav";
import { AddGoalScreen } from "./src/screens/AddGoalScreen";
import { ApproveTaskScreen } from "./src/screens/ApproveTaskScreen";
import { ChildScreen } from "./src/screens/ChildScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { ModeSelectionScreen } from "./src/screens/ModeSelectionScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import {
  completeTask,
  createGoal,
  normalizeSettings,
  resolveReminderTimeForActiveChild,
  updateGoal
} from "./src/domain/goal";
import type { AppSettings, Goal, GoalDraft } from "./src/domain/goal";
import { strings } from "./src/i18n/strings";
import type { AppRoute } from "./src/navigation/routes";
import { cancelDailyReminder, scheduleDaily } from "./src/notifications/scheduleDaily";
import { syncPremiumEntitlement } from "./src/premium/premiumPurchase";
import {
  loadGoals,
  loadSettings,
  saveGoals,
  saveSettings,
  migrateGoalsV1ToV2,
  removeOrphanedGoals
} from "./src/storage/appStorage";
import { getAppTheme } from "./src/ui/appTheme";
import { colors, fonts, radii, spacing } from "./src/ui/theme";
import MobileAds from "react-native-google-mobile-ads";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [route, setRoute] = useState<AppRoute>("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeChildId, setActiveChildId] = useState<string>(() => {
    // Initialize to first child; will be overridden by AsyncStorage load
    return "default";
  });
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
    MobileAds().initialize();
    console.log("Google Mobile Ads SDK initialized");
  }, []);

  useEffect(() => {
    async function hydrateApp() {
      try {
        const [storedGoals, storedSettings, storedActiveChildId] = await Promise.all([
          loadGoals(),
          loadSettings(),
          AsyncStorage.getItem("activeChildId")
        ]);

        const normalizedSettings = normalizeSettings(storedSettings);

        // Migrate goals (assign childId if missing)
        const migratedGoals = migrateGoalsV1ToV2(storedGoals, normalizedSettings.children[0]?.id || "child-default");

        // Remove orphaned goals
        const cleanedGoals = removeOrphanedGoals(migratedGoals, normalizedSettings.children);

        setGoals(cleanedGoals);
        setSettings(normalizedSettings);

        // Restore activeChildId if valid
        if (storedActiveChildId && normalizedSettings.children.some((c) => c.id === storedActiveChildId)) {
          setActiveChildId(storedActiveChildId);
        } else if (normalizedSettings.children.length > 0) {
          setActiveChildId(normalizedSettings.children[0]!.id);
        }

        if (!normalizedSettings.globalSettings.isReminderEnabled) {
          void cancelDailyReminder();
        }

        void syncPremiumEntitlement().then((premiumResult) => {
          if (premiumResult.status === "activated") {
            setSettings((currentSettings) =>
              currentSettings && !currentSettings.globalSettings.isPremium
                ? { ...currentSettings, globalSettings: { ...currentSettings.globalSettings, isPremium: true } }
                : currentSettings
            );
          } else if (premiumResult.status === "not_active") {
            setSettings((currentSettings) =>
              currentSettings && currentSettings.globalSettings.isPremium
                ? { ...currentSettings, globalSettings: { ...currentSettings.globalSettings, isPremium: false } }
                : currentSettings
            );
          }
        });
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
    if (activeChildId) {
      AsyncStorage.setItem("activeChildId", activeChildId).catch((err) =>
        console.error("Failed to persist activeChildId", err)
      );
    }
  }, [activeChildId]);

  // The OS holds a single "daily-reminder", so keep it in sync with the active
  // child's notification time. Recomputes whenever the active child changes,
  // reminders are toggled, or the active child's notification time is edited.
  const activeReminderTime = settings ? resolveReminderTimeForActiveChild(settings, activeChildId) : null;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (activeReminderTime) {
      void scheduleDaily(activeReminderTime);
    } else {
      void cancelDailyReminder();
    }
  }, [activeReminderTime, isHydrated]);

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
    const goal = createGoal(draft, activeChildId);

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

  function handleSelectMode(appMode: AppSettings["globalSettings"]["appMode"]) {
    if (!appMode) {
      return;
    }

    setSettings((currentSettings) =>
      currentSettings
        ? { ...currentSettings, globalSettings: { ...currentSettings.globalSettings, appMode } }
        : currentSettings
    );
    setRoute("goals");
  }

  function handleOpenChildTab() {
    setRoute("child");
  }

  if (!isHydrated || !settings) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={[styles.safeArea, { backgroundColor: colors.parentBackground }]}>
        <StatusBar style="dark" />
        <AppLoader />
      </SafeAreaView>
    );
  }

  const activeChild = settings.children.find((c) => c.id === activeChildId) ?? settings.children[0]!;
  const appTheme = getAppTheme(activeChild.settings.tileColorId);
  // Mode selection is shown when appMode is null.
  // Users can reset mode via Settings → "Change Mode" button,
  // which sets appMode to null and returns to goals screen.
  // This triggers ModeSelectionScreen on next render.
  const screen = !settings.globalSettings.appMode ? (
    <ModeSelectionScreen initialMode={settings.globalSettings.appMode} onSelectMode={handleSelectMode} />
  ) : (
    <>
      {route === "goals" ? (
        <GoalsScreen
          activeChildId={activeChildId}
          goals={goals}
          isPremium={settings.globalSettings.isPremium}
          onAddGoal={handleStartAddGoal}
          onDeleteGoal={handleDeleteGoal}
          onEditGoal={handleStartEditGoal}
          onOpenGoal={handleOpenGoal}
          onOpenSettings={() => setRoute("settings")}
          onSelectChild={setActiveChildId}
          parentLabel={activeChild.settings.parentLabel}
          childrenList={settings.children}
          theme={appTheme}
        />
      ) : null}
      {route === "addGoal" ? (
        <AddGoalScreen
          initialGoal={activeGoal ?? null}
          isPremium={settings.globalSettings.isPremium}
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
          parentPin={settings.globalSettings.pin}
          isPremium={settings.globalSettings.isPremium}
          theme={appTheme}
        />
      ) : null}
      {route === "child" && activeGoal ? (
        <ChildScreen
          activeChildId={activeChildId}
          canRevealTile={pendingRevealGoalId === activeGoal.id}
          goal={activeGoal}
          onAddGoal={handleStartAddGoal}
          onBack={() => setRoute("approveTask")}
          onCompleteTask={() => setRoute("approveTask")}
          onRevealTile={(tileId) => handleRevealTile(activeGoal.id, tileId)}
          onViewGoals={() => setRoute("goals")}
          theme={appTheme}
          tileColor={appTheme.tile}
        />
      ) : null}
      {route === "settings" ? (
        <SettingsScreen
          activeChildId={activeChildId}
          onBack={() => setRoute("goals")}
          onResetGoals={handleResetGoals}
          onSelectChild={setActiveChildId}
          onSettingsChange={setSettings}
          settings={settings}
          childrenList={settings.children}
          theme={appTheme}
        />
      ) : null}
    </>
  );
  const shouldShowBottomNav =
    Boolean(settings.globalSettings.appMode) && route !== "addGoal" && route !== "approveTask";
  const routeBackground = getRouteBackground(route, appTheme);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safeArea, { backgroundColor: routeBackground }]}>
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
    backgroundColor: colors.background
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
  const lastGoal = useRef<Goal | null>(null);

  if (goal) {
    lastGoal.current = goal;
  }

  const activeGoal = goal ?? lastGoal.current;

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        {activeGoal ? (
          <View style={styles.resetCard}>
            <View style={[styles.resetIconBubble, { backgroundColor: themeAccentSoft }]}>
              <Text style={[styles.resetIcon, { color: themeAccent }]}>×</Text>
            </View>
            <Text style={styles.resetTitle}>{strings.goals.deleteTitle}</Text>
            <Text style={styles.resetMeta}>{strings.goals.deleteMeta(activeGoal.rewardName)}</Text>
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
        ) : null}
      </View>
    </Modal>
  );
}
