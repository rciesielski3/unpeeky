export const PREMIUM_PRODUCT_ID = "unpeeky_premium_lifetime";

export type PremiumPurchaseResult =
  | {
      status: "activated";
    }
  | {
      message: string;
      status: "unavailable";
    };

export async function purchasePremium(): Promise<PremiumPurchaseResult> {
  return { status: "activated" };
}
