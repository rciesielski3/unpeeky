import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../components/Button";
import { generateParentPin, isParentPinValid as validateParentPin, TILE_COLOR_OPTIONS } from "../domain/goal";
import type { AppMode, AppSettings, TileColorId } from "../domain/goal";
import { strings } from "../i18n/strings";
import { parseNotificationTime, scheduleDaily } from "../notifications/scheduleDaily";
import { colors, fonts, radii, spacing } from "../ui/theme";

type SettingsScreenProps = {
  onBack: () => void;
  onResetGoals: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
};

const MODE_OPTIONS: AppMode[] = ["singleDevice", "twoDevices"];

export function SettingsScreen({ onBack, onResetGoals, onSettingsChange, settings }: SettingsScreenProps) {
  const [notificationTimeDraft, setNotificationTimeDraft] = useState(settings.notificationTime);
  const [parentPinDraft, setParentPinDraft] = useState(settings.parentPin);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const isNotificationTimeValid = parseNotificationTime(notificationTimeDraft) !== null;
  const isParentPinValid = validateParentPin(parentPinDraft);

  useEffect(() => {
    setNotificationTimeDraft(settings.notificationTime);
  }, [settings.notificationTime]);

  useEffect(() => {
    setParentPinDraft(settings.parentPin);
  }, [settings.parentPin]);

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

  function handleParentPinBlur() {
    if (isParentPinValid) {
      updateSettings({ parentPin: parentPinDraft });
      return;
    }

    setParentPinDraft(settings.parentPin);
  }

  function handleParentPinChange(text: string) {
    const parentPin = text.replace(/\D/g, "").slice(0, 4);

    setParentPinDraft(parentPin);

    if (validateParentPin(parentPin)) {
      updateSettings({ parentPin });
    }
  }

  function handleGenerateParentPin() {
    const parentPin = generateParentPin();

    setParentPinDraft(parentPin);
    updateSettings({ parentPin });
  }

  function handleChangeMode(appMode: AppMode) {
    updateSettings({ appMode });
  }

  function handleChangeTileColor(tileColorId: TileColorId) {
    updateSettings({ tileColorId });
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" style={styles.container}>
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

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.parentPinTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.parentPinMeta}</Text>
        </View>
        <View style={styles.pinControls}>
          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            onBlur={handleParentPinBlur}
            onChangeText={handleParentPinChange}
            placeholder={strings.settings.parentPinPlaceholder}
            style={[styles.timeInput, !isParentPinValid && styles.invalidTimeInput]}
            value={parentPinDraft}
          />
          <Button label={strings.settings.generateParentPinButton} onPress={handleGenerateParentPin} variant="ghost" />
        </View>
      </View>
      {!isParentPinValid ? <Text style={styles.errorText}>{strings.settings.parentPinError}</Text> : null}

      <View style={styles.resetRow}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.appModeTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.appModeMeta}</Text>
        </View>
        <View style={styles.modeOptions}>
          {MODE_OPTIONS.map((appMode) => {
            const isSelected = settings.appMode === appMode;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={appMode}
                onPress={() => handleChangeMode(appMode)}
                style={[styles.modeOption, isSelected && styles.selectedModeOption]}
              >
                <Text style={[styles.modeTitle, isSelected && styles.selectedModeText]}>{getModeTitle(appMode)}</Text>
                <Text style={[styles.modeMeta, isSelected && styles.selectedModeMeta]}>{getModeMeta(appMode)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.resetRow}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.tileColorTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.tileColorMeta}</Text>
        </View>
        <View style={styles.tileColorOptions}>
          {TILE_COLOR_OPTIONS.map((tileColor) => {
            const isSelected = settings.tileColorId === tileColor.id;

            return (
              <Pressable
                accessibilityLabel={strings.tileColors[tileColor.labelKey]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={tileColor.id}
                onPress={() => handleChangeTileColor(tileColor.id)}
                style={[styles.tileColorOption, isSelected && styles.selectedTileColorOption]}
              >
                <View style={[styles.tileColorSwatch, { backgroundColor: tileColor.color }]} />
                <Text style={styles.tileColorLabel}>{strings.tileColors[tileColor.labelKey]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.resetRow}>
        <View style={styles.resetCopy}>
          <Text style={styles.rowTitle}>{strings.settings.resetTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.resetMeta}</Text>
        </View>
        <Button label={strings.settings.resetButton} onPress={onResetGoals} variant="ghost" />
      </View>

      <Button label={strings.settings.backButton} onPress={onBack} variant="ghost" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  screen: {
    backgroundColor: colors.settingsBackground,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
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
    borderRadius: radii.md,
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
  pinControls: {
    gap: spacing.sm
  },
  modeOptions: {
    gap: spacing.sm
  },
  tileColorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  tileColorOption: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 2,
    gap: spacing.xs,
    minWidth: 64,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    width: "22.5%"
  },
  selectedTileColorOption: {
    borderColor: colors.primary
  },
  tileColorSwatch: {
    borderColor: colors.surface,
    borderRadius: 999,
    borderWidth: 2,
    height: 22,
    width: 22
  },
  tileColorLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700"
  },
  modeOption: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  selectedModeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modeTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  modeMeta: {
    color: colors.textMuted,
    fontSize: 13
  },
  selectedModeText: {
    color: colors.surface
  },
  selectedModeMeta: {
    color: colors.surfaceMuted
  },
  resetRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  resetCopy: {
    gap: spacing.xs
  }
});

function getModeTitle(appMode: AppMode): string {
  return appMode === "singleDevice" ? strings.settings.appModeSingleDevice : strings.settings.appModeTwoDevices;
}

function getModeMeta(appMode: AppMode): string {
  return appMode === "singleDevice" ? strings.settings.appModeSingleDeviceMeta : strings.settings.appModeTwoDevicesMeta;
}

function getNotificationMessage(scheduleResult: Awaited<ReturnType<typeof scheduleDaily>>): string {
  if (scheduleResult === "scheduled") {
    return strings.settings.notificationScheduled;
  }

  if (scheduleResult === "denied") {
    return strings.settings.notificationDenied;
  }

  return strings.settings.notificationError;
}
