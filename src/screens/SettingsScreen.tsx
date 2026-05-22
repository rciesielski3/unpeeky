import { Switch, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../components/Button";
import type { AppSettings } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type SettingsScreenProps = {
  onBack: () => void;
  onResetGoals: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
};

export function SettingsScreen({ onBack, onResetGoals, onSettingsChange, settings }: SettingsScreenProps) {
  function updateSettings(nextSettings: Partial<AppSettings>) {
    onSettingsChange({
      ...settings,
      ...nextSettings
    });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{strings.settings.title}</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.premiumTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.premiumMeta}</Text>
        </View>
        <Switch onValueChange={(isPremium) => updateSettings({ isPremium })} value={settings.isPremium} />
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.notificationTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.notificationMeta}</Text>
        </View>
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={(notificationTime) => updateSettings({ notificationTime })}
          placeholder={strings.settings.notificationTimePlaceholder}
          style={styles.timeInput}
          value={settings.notificationTime}
        />
      </View>

      <View style={styles.resetRow}>
        <View style={styles.resetCopy}>
          <Text style={styles.rowTitle}>{strings.settings.resetTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.resetMeta}</Text>
        </View>
        <Button label={strings.settings.resetButton} onPress={onResetGoals} variant="ghost" />
      </View>

      <Button label={strings.settings.backButton} onPress={onBack} variant="ghost" />
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
  },
  timeInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 92,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: "center"
  },
  resetRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  resetCopy: {
    gap: spacing.xs
  }
});
