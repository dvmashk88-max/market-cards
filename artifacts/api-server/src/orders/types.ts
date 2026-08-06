export type OrderStatus =
  | "created"
  | "payment_pending"
  | "payment_confirmed"
  | "supplier_processing"
  | "fulfilled"
  | "email_sent"
  | "payment_failed"
  | "supplier_failed"
  | "email_failed"
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
  processingOwner: string | null;
  processingLeaseUntil: Date | null;
  nextAttemptAt: Date;
  attemptCount: number;
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
  | "processingOwner"
  | "processingLeaseUntil"
  | "nextAttemptAt"
  | "attemptCount"
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
    status: "payment_failed" | "failed" | "cancelled" | "refunded",
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
  claimNextProcessable(workerId: string, leaseMs: number): Promise<OrderRecord | null>;
  releaseProcessing(
    id: string,
    workerId: string,
    delayMs: number,
    clearError?: boolean,
  ): Promise<void>;
  recordProcessingError(
    id: string,
    workerId: string,
    status: OrderStatus | null,
    code: string,
    message: string,
    delayMs: number,
  ): Promise<void>;
}
