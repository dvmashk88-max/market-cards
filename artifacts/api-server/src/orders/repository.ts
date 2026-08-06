import { pool } from "@workspace/db";
import type { NewOrder, OrderRecord, OrderRepository } from "./types";

function map(row: Record<string, unknown>): OrderRecord {
  return {
    id: String(row.id),
    publicId: String(row.public_id),
    checkoutKey: String(row.checkout_key),
    accessTokenHash: String(row.access_token_hash),
    productSlug: String(row.product_slug),
    orderType: (row.order_type ?? "gift_card") as OrderRecord["orderType"],
    supplierProductId: String(row.supplier_product_id),
    supplierOfferId: String(row.supplier_offer_id),
    productName: String(row.product_name),
    nominalLabel: String(row.nominal_label),
    email: String(row.email),
    customerPriceRub: Number(row.customer_price_rub),
    status: row.status as OrderRecord["status"],
    alfaOrderId: row.alfa_order_id ? String(row.alfa_order_id) : null,
    alfaPaymentUrl: row.alfa_payment_url ? String(row.alfa_payment_url) : null,
    supplierOrderId: row.supplier_order_id ? String(row.supplier_order_id) : null,
    supplierIdempotencyKey: String(row.supplier_idempotency_key),
    deliveryCodeEncrypted: row.delivery_code_encrypted ? String(row.delivery_code_encrypted) : null,
    fulfillmentDataEncrypted: row.fulfillment_data_encrypted ? String(row.fulfillment_data_encrypted) : null,
    paymentConfirmedAt: row.payment_confirmed_at as Date | null,
    supplierPurchasedAt: row.supplier_purchased_at as Date | null,
    emailSentAt: row.email_sent_at as Date | null,
    notificationViewedAt: row.notification_viewed_at as Date | null,
    processingOwner: row.processing_owner ? String(row.processing_owner) : null,
    processingLeaseUntil: row.processing_lease_until as Date | null,
    nextAttemptAt: row.next_attempt_at as Date,
    attemptCount: Number(row.attempt_count),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    errorCode: row.error_code ? String(row.error_code) : null,
    errorMessageSafe: row.error_message_safe ? String(row.error_message_safe) : null,
  };
}

async function one(sql: string, params: unknown[]): Promise<OrderRecord | null> {
  const result = await pool.query(sql, params);
  return result.rows[0] ? map(result.rows[0]) : null;
}

export const orderRepository: OrderRepository = {
  findByCheckoutKey: (key) => one("SELECT * FROM orders WHERE checkout_key = $1", [key]),
  findByPublicId: (id) => one("SELECT * FROM orders WHERE public_id = $1", [id]),
  async create(input: NewOrder) {
    const result = await one(
      `INSERT INTO orders (
        public_id, checkout_key, access_token_hash, product_slug, order_type,
        supplier_product_id, supplier_offer_id, product_name, nominal_label,
        email, customer_price_rub, supplier_idempotency_key, fulfillment_data_encrypted
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        input.publicId,
        input.checkoutKey,
        input.accessTokenHash,
        input.productSlug,
        input.orderType,
        input.supplierProductId,
        input.supplierOfferId,
        input.productName,
        input.nominalLabel,
        input.email,
        input.customerPriceRub,
        input.supplierIdempotencyKey,
        input.fulfillmentDataEncrypted,
      ],
    );
    if (!result) throw new Error("ORDER_CREATE_FAILED");
    return result;
  },
  async savePayment(id, alfaOrderId, paymentUrl) {
    const result = await one(
      `UPDATE orders SET alfa_order_id=$2, alfa_payment_url=$3,
       status='payment_pending', updated_at=now() WHERE id=$1 RETURNING *`,
      [id, alfaOrderId, paymentUrl],
    );
    if (!result) throw new Error("ORDER_NOT_FOUND");
    return result;
  },
  async fail(id, code, message) {
    await pool.query(
      "UPDATE orders SET status='failed', error_code=$2, error_message_safe=$3, updated_at=now() WHERE id=$1",
      [id, code, message],
    );
  },
  async setTerminalStatus(id, status, code, message) {
    const result = await one(
      `UPDATE orders SET status=$2::order_status, error_code=$3,
       error_message_safe=$4, updated_at=now() WHERE id=$1 RETURNING *`,
      [id, status, code, message],
    );
    if (!result) throw new Error("ORDER_NOT_FOUND");
    return result;
  },
  async confirmPayment(id) {
    const result = await one(
      `UPDATE orders SET status='payment_confirmed', payment_confirmed_at=COALESCE(payment_confirmed_at,now()), updated_at=now()
       WHERE id=$1 AND status IN ('payment_pending','payment_confirmed') RETURNING *`,
      [id],
    );
    if (!result) throw new Error("ORDER_STATE_CONFLICT");
    return result;
  },
  async claimSupplierPurchase(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const locked = await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [id]);
      const row = locked.rows[0];
      if (!row || row.status !== "payment_confirmed") {
        await client.query("COMMIT");
        return null;
      }
      const updated = await client.query(
        "UPDATE orders SET status='supplier_processing', updated_at=now() WHERE id=$1 RETURNING *",
        [id],
      );
      await client.query("COMMIT");
      return map(updated.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
  async saveSupplierProcessing(id, supplierOrderId) {
    const result = await one(
      "UPDATE orders SET supplier_order_id=$2, supplier_purchased_at=COALESCE(supplier_purchased_at,now()), updated_at=now() WHERE id=$1 RETURNING *",
      [id, supplierOrderId],
    );
    if (!result) throw new Error("ORDER_NOT_FOUND");
    return result;
  },
  async saveFulfilled(id, supplierOrderId, encryptedCode) {
    const result = await one(
      `UPDATE orders SET supplier_order_id=$2, delivery_code_encrypted=$3,
       supplier_purchased_at=COALESCE(supplier_purchased_at,now()), status='fulfilled', updated_at=now()
       WHERE id=$1 RETURNING *`,
      [id, supplierOrderId, encryptedCode],
    );
    if (!result) throw new Error("ORDER_NOT_FOUND");
    return result;
  },
  async markEmailSent(id) {
    const result = await one(
      "UPDATE orders SET status='email_sent', email_sent_at=COALESCE(email_sent_at,now()), updated_at=now() WHERE id=$1 RETURNING *",
      [id],
    );
    if (!result) throw new Error("ORDER_NOT_FOUND");
    return result;
  },
  async markNotificationViewed(id) {
    const result = await one(
      "UPDATE orders SET notification_viewed_at=COALESCE(notification_viewed_at,now()), updated_at=now() WHERE id=$1 RETURNING *",
      [id],
    );
    if (!result) throw new Error("ORDER_NOT_FOUND");
    return result;
  },
  async claimNextProcessable(workerId, leaseMs) {
    const result = await one(
      `WITH candidate AS (
         SELECT id FROM orders
         WHERE status IN ('payment_pending','payment_confirmed','supplier_processing','fulfilled','email_failed')
           AND next_attempt_at <= now()
           AND (processing_lease_until IS NULL OR processing_lease_until < now())
         ORDER BY next_attempt_at, created_at
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       UPDATE orders AS target
       SET processing_owner=$1,
           processing_lease_until=now() + ($2::text || ' milliseconds')::interval,
           updated_at=now()
       FROM candidate
       WHERE target.id=candidate.id
       RETURNING target.*`,
      [workerId, leaseMs],
    );
    return result;
  },
  async releaseProcessing(id, workerId, delayMs, clearError = true) {
    await pool.query(
      `UPDATE orders
       SET processing_owner=NULL, processing_lease_until=NULL,
           next_attempt_at=now() + ($3::text || ' milliseconds')::interval,
           attempt_count=0,
           error_code=CASE WHEN $4::boolean THEN NULL ELSE error_code END,
           error_message_safe=CASE WHEN $4::boolean THEN NULL ELSE error_message_safe END,
           updated_at=now()
       WHERE id=$1 AND processing_owner=$2`,
      [id, workerId, delayMs, clearError],
    );
  },
  async recordProcessingError(id, workerId, status, code, message, delayMs) {
    await pool.query(
      `UPDATE orders
       SET status=COALESCE($3::order_status,status), processing_owner=NULL, processing_lease_until=NULL,
           next_attempt_at=now() + ($6::text || ' milliseconds')::interval,
           attempt_count=attempt_count+1, error_code=$4, error_message_safe=$5, updated_at=now()
       WHERE id=$1 AND processing_owner=$2`,
      [id, workerId, status, code, message, delayMs],
    );
  },
};
