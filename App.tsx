import { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AddGoalScreen } from "./src/screens/AddGoalScreen";
import { ChildScreen } from "./src/screens/ChildScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { createDemoGoal, Goal } from "./src/domain/goal";
import { AppRoute } from "./src/navigation/routes";
import { colors } from "./src/ui/theme";

export default function App() {
  const [route, setRoute] = useState<AppRoute>("goals");
  const demoGoals = useMemo<Goal[]>(() => [createDemoGoal()], []);
  const activeGoal = demoGoals[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        {route === "goals" ? (
          <GoalsScreen goals={demoGoals} onAddGoal={() => setRoute("addGoal")} onOpenGoal={() => setRoute("child")} onOpenSettings={() => setRoute("settings")} />
        ) : null}
        {route === "addGoal" ? <AddGoalScreen onBack={() => setRoute("goals")} /> : null}
        {route === "child" && activeGoal ? <ChildScreen goal={activeGoal} onBack={() => setRoute("goals")} /> : null}
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
  }
});
