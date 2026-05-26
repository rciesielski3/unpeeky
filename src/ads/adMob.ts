// AdMob configuration - stub for MVP (ads deferred to post-MVP monetization)
// Will be properly configured with react-native-google-mobile-ads when monetization is planned

export const ADMOB_TEST_APP_IDS = {
  android: "ca-app-pub-3940256099942544~3347511713",
  ios: "ca-app-pub-3940256099942544~1458002511"
} as const;

export function getParentBannerAdUnitId(): string {
  // Stub: return empty string for MVP
  return "";
}
