export type OrderStatus =
  | "created"
  | "payment_pending"
  | "payment_confirmed"
  | "supplier_processing"
  | "fulfilled"
  | "email_sent"
  | "failed"
  | "cancelled"
  | "refunded";

export type OrderRecord = {
  id: string;
  publicId: string;
  checkoutKey: string;
  accessTokenHash: string;
  productSlug: string;
  supplierProductId: string;
  supplierOfferId: string;
  productName: string;
  nominalLabel: string;
  email: string;
  customerPriceRub: number;
  status: OrderStatus;
  alfaOrderId: string | null;
  alfaPaymentUrl: string | null;
  supplierOrderId: string | null;
  supplierIdempotencyKey: string;
  deliveryCodeEncrypted: string | null;
  paymentConfirmedAt: Date | null;
  supplierPurchasedAt: Date | null;
  emailSentAt: Date | null;
  notificationViewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  errorCode: string | null;
  errorMessageSafe: string | null;
};

export type NewOrder = Omit<
  OrderRecord,
  | "id"
  | "status"
  | "alfaOrderId"
  | "alfaPaymentUrl"
  | "supplierOrderId"
  | "deliveryCodeEncrypted"
  | "paymentConfirmedAt"
  | "supplierPurchasedAt"
  | "emailSentAt"
  | "notificationViewedAt"
  | "createdAt"
  | "updatedAt"
  | "errorCode"
  | "errorMessageSafe"
>;

export interface OrderRepository {
  findByCheckoutKey(checkoutKey: string): Promise<OrderRecord | null>;
  findByPublicId(publicId: string): Promise<OrderRecord | null>;
  create(input: NewOrder): Promise<OrderRecord>;
  savePayment(
    id: string,
    alfaOrderId: string,
    paymentUrl: string,
  ): Promise<OrderRecord>;
  fail(id: string, code: string, message: string): Promise<void>;
  setTerminalStatus(
    id: string,
    status: "failed" | "cancelled" | "refunded",
    code: string,
    message: string,
  ): Promise<OrderRecord>;
  confirmPayment(id: string): Promise<OrderRecord>;
  claimSupplierPurchase(id: string): Promise<OrderRecord | null>;
  saveSupplierProcessing(id: string, supplierOrderId: string): Promise<OrderRecord>;
  saveFulfilled(
    id: string,
    supplierOrderId: string,
    encryptedCode: string,
  ): Promise<OrderRecord>;
  markEmailSent(id: string): Promise<OrderRecord>;
  markNotificationViewed(id: string): Promise<OrderRecord>;
}
