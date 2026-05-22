import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import type { AppMode } from "../domain/goal";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type ModeSelectionScreenProps = {
  initialMode: AppMode | null;
  onSelectMode: (appMode: AppMode) => void;
};

const MODE_OPTIONS: AppMode[] = ["singleDevice", "twoDevices"];

export function ModeSelectionScreen({ initialMode, onSelectMode }: ModeSelectionScreenProps) {
  const [selectedMode, setSelectedMode] = useState<AppMode>(initialMode ?? "singleDevice");

  return (
    <View style={styles.screen}>
      <View>
        <Text style={styles.title}>{strings.modeSelection.title}</Text>
        <Text style={styles.subtitle}>{strings.modeSelection.subtitle}</Text>
      </View>

      <View style={styles.options}>
        {MODE_OPTIONS.map((appMode) => {
          const isSelected = appMode === selectedMode;

          return (
            <Pressable
              accessibilityRole="button"
              key={appMode}
              onPress={() => setSelectedMode(appMode)}
              style={[styles.option, isSelected && styles.selectedOption]}
            >
              <Text style={[styles.optionTitle, isSelected && styles.selectedOptionText]}>{getModeTitle(appMode)}</Text>
              <Text style={[styles.optionMeta, isSelected && styles.selectedOptionMeta]}>{getModeMeta(appMode)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.note}>{strings.modeSelection.note}</Text>

      <View style={styles.actions}>
        <Button label={strings.modeSelection.continueButton} onPress={() => onSelectMode(selectedMode)} />
      </View>
    </View>
  );
}

function getModeTitle(appMode: AppMode): string {
  return appMode === "singleDevice" ? strings.modeSelection.singleDeviceTitle : strings.modeSelection.twoDevicesTitle;
}

function getModeMeta(appMode: AppMode): string {
  return appMode === "singleDevice" ? strings.modeSelection.singleDeviceMeta : strings.modeSelection.twoDevicesMeta;
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
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs
  },
  options: {
    gap: spacing.md
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  optionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  optionMeta: {
    color: colors.textMuted,
    fontSize: 14
  },
  selectedOptionText: {
    color: colors.surface
  },
  selectedOptionMeta: {
    color: colors.surfaceMuted
  },
  note: {
    color: colors.textMuted,
    fontSize: 13
  },
  actions: {
    marginTop: "auto"
  }
});
