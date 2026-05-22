import { Switch, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type SettingsScreenProps = {
  onBack: () => void;
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{strings.settings.title}</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.premiumTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.premiumMeta}</Text>
        </View>
        <Switch value={false} />
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>{strings.settings.notificationTitle}</Text>
          <Text style={styles.rowMeta}>{strings.settings.notificationMeta}</Text>
        </View>
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
  }
});
