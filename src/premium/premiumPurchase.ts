export const PREMIUM_PRODUCT_ID = "unpeeky_premium_lifetime";

export type PremiumActivationSource = "purchase" | "restore";

export type PremiumPurchaseResult =
  | {
      source: PremiumActivationSource;
      status: "activated";
    }
  | {
      message: string;
      status: "unavailable";
    };

export async function purchasePremium(): Promise<PremiumPurchaseResult> {
  return activatePremiumLocally("purchase");
}

export async function restorePremiumPurchase(): Promise<PremiumPurchaseResult> {
  return activatePremiumLocally("restore");
}

async function activatePremiumLocally(source: PremiumActivationSource): Promise<PremiumPurchaseResult> {
  return { source, status: "activated" };
}
