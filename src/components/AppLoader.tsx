import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import { strings } from "../i18n/strings";
import { defaultAppTheme } from "../ui/appTheme";
import { colors, fonts, radii, spacing } from "../ui/theme";

// React Native bundles static image assets through require().
// eslint-disable-next-line @typescript-eslint/no-var-requires
const splashLogo = require("../../assets/images/splash.png");

export function AppLoader() {
  return (
    <View style={[styles.screen, { backgroundColor: defaultAppTheme.parentBackground }]}>
      <View style={styles.logoCard}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={strings.app.loadingTitle}
          accessibilityRole="image"
          source={splashLogo}
          style={styles.logo}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{strings.app.loadingTitle}</Text>
        <Text style={styles.meta}>{strings.app.loadingMeta}</Text>
      </View>
      <ActivityIndicator color={defaultAppTheme.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl
  },
  logoCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    height: 152,
    justifyContent: "center",
    shadowColor: defaultAppTheme.accentDark,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    width: 152
  },
  logo: {
    height: 128,
    width: 128
  },
  copy: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.lg
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.xs
  }
});
