import type { OrderStatus } from "../orders/types";

export const successfulPurchaseWhereSql = `
  status IN ('fulfilled','email_sent','email_failed')
  AND alfa_order_id IS NOT NULL
  AND payment_confirmed_at IS NOT NULL
  AND supplier_purchased_at IS NOT NULL
  AND delivery_code_encrypted IS NOT NULL
`;

export function isSuccessfulPurchase(order: {
  status: OrderStatus;
  alfaOrderId: string | null;
  paymentConfirmedAt: Date | null;
  supplierPurchasedAt: Date | null;
  deliveryCodeEncrypted: string | null;
}): boolean {
  return (
    ["fulfilled", "email_sent", "email_failed"].includes(order.status) &&
    order.alfaOrderId !== null &&
    order.paymentConfirmedAt !== null &&
    order.supplierPurchasedAt !== null &&
    order.deliveryCodeEncrypted !== null
  );
}
