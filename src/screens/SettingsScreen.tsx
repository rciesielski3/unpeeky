import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { ParentAdSlot } from "../components/ParentAdSlot";
import { ScreenDecorations } from "../components/ScreenDecorations";
import { generateParentPin, isParentPinValid as validateParentPin, TILE_COLOR_OPTIONS } from "../domain/goal";
import type { AppMode, AppSettings, TileColorId } from "../domain/goal";
import { strings } from "../i18n/strings";
import { parseNotificationTime, scheduleDaily } from "../notifications/scheduleDaily";
import type { AppTheme } from "../ui/appTheme";
import { defaultAppTheme } from "../ui/appTheme";
import { colors, fonts, radii, spacing } from "../ui/theme";

type SettingsScreenProps = {
  onBack: () => void;
  onResetGoals: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
  theme?: AppTheme;
};

const MODE_OPTIONS: AppMode[] = ["singleDevice", "twoDevices"];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTE_OPTIONS = [0, 15, 30, 45];

export function SettingsScreen({
  onResetGoals,
  onSettingsChange,
  settings,
  theme = defaultAppTheme
}: SettingsScreenProps) {
  const [notificationTimeDraft, setNotificationTimeDraft] = useState(settings.notificationTime);
  const [parentPinDraft, setParentPinDraft] = useState(settings.parentPin);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
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

  async function handleReminderToggle(isEnabled: boolean) {
    if (!isEnabled) {
      setNotificationTimeDraft("");
      updateSettings({ notificationTime: "" });
      setNotificationMessage(null);
      return;
    }

    const notificationTime = settings.notificationTime || "18:30";

    setNotificationTimeDraft(notificationTime);
    setIsTimePickerOpen(true);
    void saveNotificationTime(notificationTime);
  }

  async function saveNotificationTime(notificationTime: string) {
    if (!parseNotificationTime(notificationTime)) {
      return;
    }

    updateSettings({ notificationTime });
    const scheduleResult = await scheduleDaily(notificationTime);

    setNotificationMessage(getNotificationMessage(scheduleResult));
  }

  function handleChangeNotificationTime(hour: number, minute: number) {
    const notificationTime = `${formatTimePart(hour)}:${formatTimePart(minute)}`;

    setNotificationTimeDraft(notificationTime);
    void saveNotificationTime(notificationTime);
  }

  function handleOpenTimePicker() {
    if (!isReminderEnabled) {
      setNotificationTimeDraft(settings.notificationTime || "18:30");
      void saveNotificationTime(settings.notificationTime || "18:30");
    }

    setIsTimePickerOpen(true);
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
    <ScrollView
      contentContainerStyle={[styles.screen, { backgroundColor: theme.settingsBackground }]}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
    >
      <ScreenDecorations variant="garden" />
      <View style={styles.hero}>
        <Text style={styles.title}>{strings.settings.title}</Text>
        <Text style={styles.subtitle}>{strings.settings.subtitle}</Text>
      </View>

      <View style={[styles.premiumCard, { backgroundColor: theme.accent }]}>
        <View style={styles.premiumHeader}>
          <Text style={[styles.settingIcon, styles.premiumIcon]}>♕</Text>
          <View style={styles.premiumCopy}>
            <Text style={styles.premiumTitle}>{strings.settings.premiumVersionTitle}</Text>
            <Text style={styles.premiumMeta}>{strings.settings.premiumVersionMeta}</Text>
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
                style={[styles.tileColorOption, isSelected && { borderColor: theme.accent }]}
              >
                <View style={[styles.tileColorSwatch, { backgroundColor: tileColor.color }]} />
                <Text style={styles.tileColorLabel}>{strings.tileColors[tileColor.labelKey]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.settingLine}>
          <Text style={styles.settingIcon}>🔔</Text>
          <Text style={styles.lineTitle}>{strings.settings.dailyReminderTitle}</Text>
          <Switch
            onValueChange={(isEnabled) => void handleReminderToggle(isEnabled)}
            style={styles.notificationSwitch}
            thumbColor={colors.surface}
            trackColor={{ false: colors.border, true: theme.accent }}
            value={isReminderEnabled}
          />
        </View>
        <View style={styles.divider} />
        <Pressable accessibilityRole="button" onPress={handleOpenTimePicker} style={styles.settingLine}>
          <Text style={styles.settingIcon}>◷</Text>
          <Text style={[styles.timeValue, !isNotificationTimeValid && styles.invalidTimeText]}>
            {notificationTimeDraft || strings.settings.notificationTimePlaceholder}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        {!isNotificationTimeValid ? (
          <Text style={styles.errorText}>{strings.settings.notificationTimeError}</Text>
        ) : null}
        {notificationMessage ? <Text style={styles.statusText}>{notificationMessage}</Text> : null}
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
                style={[styles.modeOption, isSelected && { backgroundColor: theme.accent, borderColor: theme.accent }]}
              >
                <Text style={[styles.modeTitle, isSelected && styles.selectedModeText]}>{getModeTitle(appMode)}</Text>
                <Text style={[styles.modeMeta, isSelected && styles.selectedModeMeta]}>{getModeMeta(appMode)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SettingsAction icon="▢" label={strings.settings.resetTitle} onPress={onResetGoals} />
        <View style={styles.divider} />
        <SettingsAction icon="ⓘ" label={strings.settings.aboutApp} onPress={() => setIsAboutOpen(true)} />
      </View>

      <ParentAdSlot isPremium={settings.isPremium} />

      <AboutModal onClose={() => setIsAboutOpen(false)} visible={isAboutOpen} />
      <TimePickerModal
        notificationTime={notificationTimeDraft || "18:30"}
        onClose={() => setIsTimePickerOpen(false)}
        onSelect={handleChangeNotificationTime}
        visible={isTimePickerOpen}
      />
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
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: 96
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.xs
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.accentDark,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 22
  },
  premiumCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
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
  notificationSwitch: {
    transform: [{ scaleX: 1.18 }, { scaleY: 1.18 }]
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
  timeValue: {
    color: colors.text,
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    paddingVertical: spacing.xs
  },
  invalidTimeText: {
    color: colors.warningDark
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
  premiumIcon: {
    color: colors.warning
  },
  premiumTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  premiumMeta: {
    color: colors.primarySoft,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: spacing.xs
  },
  premiumButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.warning,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: spacing.xl,
    shadowColor: colors.warningDark,
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14
  },
  premiumButtonText: {
    color: colors.text,
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
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(16, 24, 40, 0.28)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  timePickerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    maxHeight: "86%",
    padding: spacing.lg,
    shadowColor: colors.accentDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%"
  },
  timePickerTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  timePickerColumns: {
    flexDirection: "row",
    gap: spacing.md,
    height: 310,
    justifyContent: "center"
  },
  timePickerColumn: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flex: 1
  },
  timePickerOptions: {
    gap: spacing.sm,
    padding: spacing.sm
  },
  timePickerOption: {
    alignItems: "center",
    borderRadius: radii.md,
    minHeight: 48,
    justifyContent: "center"
  },
  selectedTimePickerOption: {
    backgroundColor: colors.accent
  },
  timePickerOptionText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  selectedTimePickerText: {
    color: colors.surface
  },
  timeSeparator: {
    alignSelf: "center",
    color: colors.text,
    fontSize: 32,
    fontWeight: "800"
  },
  timePickerDoneButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 56
  },
  timePickerDoneText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800"
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.xl,
    shadowColor: colors.accentDark,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%"
  },
  aboutTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  aboutBody: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  aboutOwner: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center"
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

function TimePickerModal({
  notificationTime,
  onClose,
  onSelect,
  visible
}: {
  notificationTime: string;
  onClose: () => void;
  onSelect: (hour: number, minute: number) => void;
  visible: boolean;
}) {
  const parsedTime = parseNotificationTime(notificationTime) ?? { hour: 18, minute: 30 };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.timePickerCard}>
          <Text style={styles.timePickerTitle}>{strings.settings.notificationTimePickerTitle}</Text>
          <View style={styles.timePickerColumns}>
            <ScrollView contentContainerStyle={styles.timePickerOptions} style={styles.timePickerColumn}>
              {HOUR_OPTIONS.map((hour) => {
                const isSelected = parsedTime.hour === hour;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={hour}
                    onPress={() => onSelect(hour, parsedTime.minute)}
                    style={[styles.timePickerOption, isSelected && styles.selectedTimePickerOption]}
                  >
                    <Text style={[styles.timePickerOptionText, isSelected && styles.selectedTimePickerText]}>
                      {formatTimePart(hour)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={styles.timeSeparator}>:</Text>
            <ScrollView contentContainerStyle={styles.timePickerOptions} style={styles.timePickerColumn}>
              {MINUTE_OPTIONS.map((minute) => {
                const isSelected = parsedTime.minute === minute;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={minute}
                    onPress={() => onSelect(parsedTime.hour, minute)}
                    style={[styles.timePickerOption, isSelected && styles.selectedTimePickerOption]}
                  >
                    <Text style={[styles.timePickerOptionText, isSelected && styles.selectedTimePickerText]}>
                      {formatTimePart(minute)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.timePickerDoneButton}>
            <Text style={styles.timePickerDoneText}>{strings.settings.notificationTimePickerClose}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AboutModal({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>{strings.settings.aboutTitle}</Text>
          <Text style={styles.aboutBody}>{strings.settings.aboutBody}</Text>
          <Text style={styles.aboutOwner}>{strings.settings.aboutOwner}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.timePickerDoneButton}>
            <Text style={styles.timePickerDoneText}>{strings.settings.aboutClose}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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

function formatTimePart(timePart: number): string {
  return `${timePart}`.padStart(2, "0");
}
