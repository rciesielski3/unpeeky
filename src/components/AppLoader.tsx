import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

import { strings } from "../i18n/strings";
import { defaultAppTheme } from "../ui/appTheme";
import { colors, fonts, radii, spacing } from "../ui/theme";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const splashLogo = require("../../assets/images/Unpeeky_splash.png");

const TILE_COLORS = ["#c5b8ff", "#9b8af5", "#7c6fe0"];

function TileLoader() {
  const anims = useRef(TILE_COLORS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(anim, {
            toValue: 1.75,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(480),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [anims]);

  return (
    <View style={tileStyles.row}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            tileStyles.tile,
            { backgroundColor: TILE_COLORS[i], transform: [{ scaleY: anim }] },
          ]}
        />
      ))}
    </View>
  );
}

const tileStyles = StyleSheet.create({
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
  },
  tile: {
    borderRadius: 6,
    height: 20,
    width: 20,
  },
});

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
      <TileLoader />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  logoCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    elevation: 8,
    height: 152,
    justifyContent: "center",
    shadowColor: defaultAppTheme.accentDark,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    width: 152,
  },
  logo: {
    height: 128,
    width: 128,
  },
  copy: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: "800",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
});