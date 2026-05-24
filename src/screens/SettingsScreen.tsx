import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

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

export function SettingsScreen({ onResetGoals, onSettingsChange, settings }: SettingsScreenProps) {
  const [notificationTimeDraft, setNotificationTimeDraft] = useState(settings.notificationTime);
  const [parentPinDraft, setParentPinDraft] = useState(settings.parentPin);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const isReminderEnabled = notificationTimeDraft.trim().length > 0;
  const isNotificationTimeValid = !isReminderEnabled || parseNotificationTime(notificationTimeDraft) !== null;
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
    if (!isReminderEnabled) {
      updateSettings({ notificationTime: "" });
      setNotificationMessage(null);
      return;
    }

    if (parseNotificationTime(notificationTimeDraft)) {
      updateSettings({ notificationTime: notificationTimeDraft });
      const scheduleResult = await scheduleDaily(notificationTimeDraft);

      setNotificationMessage(getNotificationMessage(scheduleResult));
      return;
    }

    setNotificationTimeDraft(settings.notificationTime);
    setNotificationMessage(null);
  }

  async function handleReminderToggle(isEnabled: boolean) {
    if (!isEnabled) {
      setNotificationTimeDraft("");
      updateSettings({ notificationTime: "" });
      setNotificationMessage(null);
      return;
    }

    const notificationTime = settings.notificationTime || "18:30";

    setNotificationTimeDraft(notificationTime);
    updateSettings({ notificationTime });

    if (parseNotificationTime(notificationTime)) {
      const scheduleResult = await scheduleDaily(notificationTime);

      setNotificationMessage(getNotificationMessage(scheduleResult));
    }
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
      <View style={styles.hero}>
        <Text style={styles.title}>{strings.settings.title}</Text>
        <View style={styles.gearBadge}>
          <Text style={styles.gearIcon}>⚙</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.settingLine}>
          <Text style={styles.settingIcon}>🔔</Text>
          <Text style={styles.lineTitle}>{strings.settings.dailyReminderTitle}</Text>
          <Switch
            onValueChange={(isEnabled) => void handleReminderToggle(isEnabled)}
            thumbColor={colors.surface}
            trackColor={{ false: colors.border, true: colors.accent }}
            value={isReminderEnabled}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingLine}>
          <Text style={styles.settingIcon}>◷</Text>
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
          <Text style={styles.chevron}>›</Text>
        </View>
        {!isNotificationTimeValid ? (
          <Text style={styles.errorText}>{strings.settings.notificationTimeError}</Text>
        ) : null}
        {notificationMessage ? <Text style={styles.statusText}>{notificationMessage}</Text> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.premiumHeader}>
          <Text style={styles.settingIcon}>👑</Text>
          <View style={styles.premiumCopy}>
            <Text style={styles.rowTitle}>{strings.settings.premiumVersionTitle}</Text>
            <Text style={styles.rowMeta}>{strings.settings.premiumVersionMeta}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: settings.isPremium }}
          onPress={() => updateSettings({ isPremium: !settings.isPremium })}
          style={styles.premiumButton}
        >
          <Text style={styles.premiumButtonText}>{strings.settings.premiumUpgradeButton}</Text>
        </Pressable>
        <View style={styles.divider} />
        <SettingsAction icon="↻" label={strings.settings.restorePurchases} />
        <View style={styles.divider} />
        <SettingsAction icon="▢" label={strings.settings.resetTitle} onPress={onResetGoals} />
        <View style={styles.divider} />
        <SettingsAction icon="ⓘ" label={strings.settings.aboutApp} />
      </View>

      <View style={styles.card}>
        <View style={styles.settingLine}>
          <View>
            <Text style={styles.rowTitle}>{strings.settings.parentPinTitle}</Text>
            <Text style={styles.rowMeta}>{strings.settings.parentPinMeta}</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            onBlur={handleParentPinBlur}
            onChangeText={handleParentPinChange}
            placeholder={strings.settings.parentPinPlaceholder}
            style={[styles.pinInput, !isParentPinValid && styles.invalidTimeInput]}
            value={parentPinDraft}
          />
        </View>
        <Pressable accessibilityRole="button" onPress={handleGenerateParentPin} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>{strings.settings.generateParentPinButton}</Text>
        </Pressable>
        {!isParentPinValid ? <Text style={styles.errorText}>{strings.settings.parentPinError}</Text> : null}
      </View>

      <View style={styles.card}>
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

      <View style={styles.card}>
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

      <View pointerEvents="none" style={styles.bearScene}>
        <Text style={styles.cloudLeft}>☁</Text>
        <Text style={styles.cloudRight}>☁</Text>
        <Text style={styles.flowerLeft}>✿</Text>
        <Text style={styles.flowerRight}>✿</Text>
        <Text style={styles.bear}>🐻</Text>
      </View>
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
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 96
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 34,
    fontWeight: "800"
  },
  gearBadge: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    height: 72,
    justifyContent: "center",
    shadowColor: colors.accentDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    width: 72
  },
  gearIcon: {
    color: colors.surface,
    fontSize: 44,
    lineHeight: 48
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    gap: spacing.lg,
    padding: spacing.xl,
    shadowColor: colors.accentDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 22
  },
  settingLine: {
    alignItems: "center",
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  settingIcon: {
    color: colors.accentDark,
    fontSize: 28,
    width: 38
  },
  lineTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "700"
  },
  divider: {
    backgroundColor: colors.border,
    height: 1
  },
  rowTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs
  },
  timeInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    paddingVertical: spacing.xs
  },
  pinInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    minWidth: 122,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  chevron: {
    color: colors.textMuted,
    fontSize: 38,
    lineHeight: 42
  },
  premiumHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md
  },
  premiumCopy: {
    flex: 1
  },
  premiumButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: spacing.xl,
    shadowColor: colors.accentDark,
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    width: "86%"
  },
  premiumButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  actionLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 46
  },
  actionLabel: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "600"
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
    borderColor: colors.accent
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
    backgroundColor: colors.accent,
    borderColor: colors.accent
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
  textButton: {
    alignSelf: "flex-end",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  textButtonLabel: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "800"
  },
  bearScene: {
    alignItems: "center",
    minHeight: 220,
    overflow: "hidden"
  },
  bear: {
    fontSize: 128,
    marginTop: spacing.xl
  },
  cloudLeft: {
    color: colors.surface,
    fontSize: 62,
    left: 36,
    position: "absolute",
    top: 44
  },
  cloudRight: {
    color: colors.surface,
    fontSize: 62,
    position: "absolute",
    right: 28,
    top: 54
  },
  flowerLeft: {
    color: colors.accent,
    fontSize: 42,
    left: 12,
    position: "absolute",
    top: 130
  },
  flowerRight: {
    color: colors.warning,
    fontSize: 38,
    position: "absolute",
    right: 28,
    top: 136
  }
});

function SettingsAction({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress} style={styles.actionLine}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

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
