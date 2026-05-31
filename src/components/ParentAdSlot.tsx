import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

import { getParentBannerAdUnitId } from "../ads/adMob";

type ParentAdSlotProps = {
  isPremium: boolean;
};

export function ParentAdSlot({ isPremium }: ParentAdSlotProps) {
  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.slot}>
      <BannerAd
        unitId={getParentBannerAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72
  }
});
