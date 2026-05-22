import { Switch, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { colors, spacing } from "../ui/theme";

type SettingsScreenProps = {
  onBack: () => void;
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ustawienia</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>Premium</Text>
          <Text style={styles.rowMeta}>Reklamy beda tylko w widoku rodzica</Text>
        </View>
        <Switch value={false} />
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>Powiadomienie</Text>
          <Text style={styles.rowMeta}>18:00 codziennie</Text>
        </View>
      </View>

      <Button label="Wroc" onPress={onBack} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs
  }
});
