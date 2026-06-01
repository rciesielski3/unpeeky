import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PURCHASE_TYPE, type CustomerInfo } from "react-native-purchases";

export const PREMIUM_PRODUCT_ID = "unpeeky_premium_lifetime";
export const PREMIUM_ENTITLEMENT_ID = "premium";

const REVENUECAT_API_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
} as const;

const REVENUECAT_UNAVAILABLE_MESSAGE =
  "RevenueCat nie jest skonfigurowany. Dodaj EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY.";
const PREMIUM_NOT_ACTIVE_MESSAGE = "Nie znaleziono aktywnego Premium dla tego konta.";
const PURCHASE_CANCELLED_MESSAGE = "Zakup został anulowany.";

let isRevenueCatConfigured = false;

export type PremiumActivationSource = "purchase" | "restore" | "sync";

export type PremiumPurchaseResult =
  | {
      source: PremiumActivationSource;
      status: "activated";
    }
  | {
      message: string;
      status: "not_active";
    }
  | {
      message: string;
      status: "unavailable";
    };

export async function purchasePremium(): Promise<PremiumPurchaseResult> {
  const configurationError = configureRevenueCatIfNeeded();

  if (configurationError) {
    return configurationError;
  }

  try {
    const purchaseResult = await Purchases.purchaseProduct(PREMIUM_PRODUCT_ID, null, PURCHASE_TYPE.INAPP);

    return getActivationResult(purchaseResult.customerInfo, "purchase");
  } catch (error) {
    return {
      message: isPurchaseCancelled(error) ? PURCHASE_CANCELLED_MESSAGE : REVENUECAT_UNAVAILABLE_MESSAGE,
      status: "unavailable"
    };
  }
}

export async function restorePremiumPurchase(): Promise<PremiumPurchaseResult> {
  const configurationError = configureRevenueCatIfNeeded();

  if (configurationError) {
    return configurationError;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();

    return getActivationResult(customerInfo, "restore");
  } catch {
    return { message: REVENUECAT_UNAVAILABLE_MESSAGE, status: "unavailable" };
  }
}

export async function syncPremiumEntitlement(): Promise<PremiumPurchaseResult> {
  const configurationError = configureRevenueCatIfNeeded();

  if (configurationError) {
    return configurationError;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();

    return getActivationResult(customerInfo, "sync");
  } catch {
    return { message: REVENUECAT_UNAVAILABLE_MESSAGE, status: "unavailable" };
  }
}

function configureRevenueCatIfNeeded(): PremiumPurchaseResult | null {
  if (isRevenueCatConfigured) {
    return null;
  }

  const apiKey = getRevenueCatApiKey();

  if (!apiKey) {
    return { message: REVENUECAT_UNAVAILABLE_MESSAGE, status: "unavailable" };
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({ apiKey });
  isRevenueCatConfigured = true;

  return null;
}

function getRevenueCatApiKey(): string | undefined {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return REVENUECAT_API_KEYS[Platform.OS];
  }

  return undefined;
}

function getActivationResult(customerInfo: CustomerInfo, source: PremiumActivationSource): PremiumPurchaseResult {
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]
    ? { source, status: "activated" }
    : { message: PREMIUM_NOT_ACTIVE_MESSAGE, status: "not_active" };
}

function isPurchaseCancelled(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "userCancelled" in error &&
    (error as { userCancelled?: boolean }).userCancelled
  );
}
