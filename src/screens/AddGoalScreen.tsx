import { StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "../components/Button";
import { TILE_OPTIONS } from "../domain/goal";
import { colors, spacing } from "../ui/theme";

type AddGoalScreenProps = {
  onBack: () => void;
};

export function AddGoalScreen({ onBack }: AddGoalScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Nowy cel</Text>

      <View style={styles.form}>
        <TextInput placeholder="Imie dziecka" style={styles.input} />
        <TextInput placeholder="Nazwa nagrody" style={styles.input} />
        <View>
          <Text style={styles.label}>Liczba kafelkow</Text>
          <View style={styles.tileOptions}>
            {TILE_OPTIONS.slice(0, 5).map((option) => (
              <Text key={option} style={[styles.tileOption, option === 16 && styles.selectedTile]}>
                {option}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.photoBox}>
          <Text style={styles.photoText}>Zdjecie nagrody dodamy w kolejnym kroku</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Zapisz szkic" onPress={onBack} variant="secondary" />
        <Button label="Wroc" onPress={onBack} variant="ghost" />
      </View>
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
  form: {
    gap: spacing.md
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm
  },
  tileOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tileOption: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minWidth: 48,
    padding: spacing.sm,
    textAlign: "center"
  },
  selectedTile: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.surface,
    fontWeight: "800"
  },
  photoBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    minHeight: 96,
    justifyContent: "center",
    padding: spacing.md
  },
  photoText: {
    color: colors.primaryDark,
    textAlign: "center"
  },
  actions: {
    gap: spacing.sm,
    marginTop: "auto"
  }
});
