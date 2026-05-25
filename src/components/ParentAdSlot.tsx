import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

import { getParentBannerAdUnitId } from "../ads/adMob";
import { strings } from "../i18n/strings";
import { colors, spacing } from "../ui/theme";

type ParentAdSlotProps = {
  isPremium: boolean;
};

export function ParentAdSlot({ isPremium }: ParentAdSlotProps) {
  const [hasAdError, setHasAdError] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (isPremium) {
    return null;
  }

  return (
    <View accessibilityLabel={strings.ads.placeholderLabel} accessibilityRole="summary" style={styles.slot}>
      {hasAdError ? (
        <>
          <Text style={styles.label}>{strings.ads.placeholderTitle}</Text>
          <Text style={styles.text}>{strings.ads.placeholderText}</Text>
        </>
      ) : (
        <>
          {!isAdLoaded ? <Text style={styles.label}>{strings.ads.loadingTitle}</Text> : null}
          <BannerAd
            onAdLoaded={() => setIsAdLoaded(true)}
            onAdFailedToLoad={() => setHasAdError(true)}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            unitId={getParentBannerAdUnitId()}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 72,
    padding: spacing.md
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  text: {
    color: colors.text,
    fontSize: 13,
    textAlign: "center"
  }
});
