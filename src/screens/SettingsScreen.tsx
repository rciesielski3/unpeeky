import { useEffect, useState } from "react";
import { Switch, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../components/Button";
import type { AppSettings } from "../domain/goal";
import { strings } from "../i18n/strings";
import { parseNotificationTime, scheduleDaily } from "../notifications/scheduleDaily";
import { colors, spacing } from "../ui/theme";

type SettingsScreenProps = {
  onBack: () => void;
  onResetGoals: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
};

export function SettingsScreen({ onBack, onResetGoals, onSettingsChange, settings }: SettingsScreenProps) {
  const [notificationTimeDraft, setNotificationTimeDraft] = useState(settings.notificationTime);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const isNotificationTimeValid = parseNotificationTime(notificationTimeDraft) !== null;

  useEffect(() => {
    setNotificationTimeDraft(settings.notificationTime);
  }, [settings.notificationTime]);

  function updateSettings(nextSettings: Partial<AppSettings>) {
    onSettingsChange({
      ...settings,
      ...nextSettings
    });
  }

  async function handleNotificationTimeBlur() {
    if (isNotificationTimeValid) {
      updateSettings({ notificationTime: notificationTimeDraft });
      const scheduleResult = await scheduleDaily(notificationTimeDraft);

      setNotificationMessage(getNotificationMessage(scheduleResult));
      return;
    }

    setNotificationTimeDraft(settings.notificationTime);
    setNotificationMessage(null);
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
          maxLength={5}
          onBlur={() => void handleNotificationTimeBlur()}
          onChangeText={(text) => {
            setNotificationTimeDraft(text);
            setNotificationMessage(null);
          }}
          placeholder={strings.settings.notificationTimePlaceholder}
          style={[styles.timeInput, !isNotificationTimeValid && styles.invalidTimeInput]}
          value={notificationTimeDraft}
        />
      </View>
      {!isNotificationTimeValid ? <Text style={styles.errorText}>{strings.settings.notificationTimeError}</Text> : null}
      {notificationMessage ? <Text style={styles.statusText}>{notificationMessage}</Text> : null}

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
  invalidTimeInput: {
    borderColor: colors.warning
  },
  errorText: {
    color: colors.warning,
    fontSize: 13,
    marginTop: -spacing.sm
  },
  statusText: {
    color: colors.accent,
    fontSize: 13,
    marginTop: -spacing.sm
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

function getNotificationMessage(scheduleResult: Awaited<ReturnType<typeof scheduleDaily>>): string {
  if (scheduleResult === "scheduled") {
    return strings.settings.notificationScheduled;
  }

  if (scheduleResult === "denied") {
    return strings.settings.notificationDenied;
  }

  return strings.settings.notificationError;
}
