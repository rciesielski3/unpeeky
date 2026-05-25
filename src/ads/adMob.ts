import { TestIds } from "react-native-google-mobile-ads";

export const ADMOB_TEST_APP_IDS = {
  android: "ca-app-pub-3940256099942544~3347511713",
  ios: "ca-app-pub-3940256099942544~1458002511"
} as const;

export function getParentBannerAdUnitId(): string {
  return TestIds.BANNER;
}
