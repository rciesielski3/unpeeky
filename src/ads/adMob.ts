import { TestIds } from "react-native-google-mobile-ads";

export const ADMOB_APP_IDS = {
  android: "ca-app-pub-4185040274135926~7754563632",
  ios: "ca-app-pub-3940256099942544~1458002511"
} as const;

export const ADMOB_AD_UNIT_IDS = {
  android: {
    banner: "ca-app-pub-4185040274135926/3438398739",
    interstitial: "ca-app-pub-4185040274135926/8499153727"
  }
} as const;

export const ADMOB_TEST_APP_IDS = {
  android: "ca-app-pub-3940256099942544~3347511713",
  ios: "ca-app-pub-3940256099942544~1458002511"
} as const;

export function getParentBannerAdUnitId(): string {
  return __DEV__ ? TestIds.BANNER : ADMOB_AD_UNIT_IDS.android.banner;
}

export function getInterstitialAdUnitId(): string {
  return __DEV__ ? TestIds.INTERSTITIAL : ADMOB_AD_UNIT_IDS.android.interstitial;
}
