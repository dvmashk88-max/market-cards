import type { StorefrontProduct } from "./catalog";

export function isTelegramCheckout(orderType: StorefrontProduct["checkout"]["orderType"]): boolean {
  return orderType === "telegram_stars" || orderType === "telegram_premium";
}

export function isCheckoutReady(input: {
  supported: boolean;
  selectionReady: boolean;
  requiredFieldsReady: boolean;
  emailValid: boolean;
  telegram: boolean;
  recipientConfirmed: boolean;
}): boolean {
  return input.supported
    && input.selectionReady
    && input.requiredFieldsReady
    && input.emailValid
    && (!input.telegram || input.recipientConfirmed);
}
