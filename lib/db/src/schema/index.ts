import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "created",
  "payment_pending",
  "payment_confirmed",
  "supplier_processing",
  "fulfilled",
  "email_sent",
  "failed",
  "cancelled",
  "refunded",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull(),
    checkoutKey: uuid("checkout_key").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    productSlug: text("product_slug").notNull(),
    supplierProductId: text("supplier_product_id").notNull(),
    supplierOfferId: text("supplier_offer_id").notNull(),
    productName: text("product_name").notNull(),
    nominalLabel: text("nominal_label").notNull(),
    email: text("email").notNull(),
    customerPriceRub: integer("customer_price_rub").notNull(),
    status: orderStatusEnum("status").notNull().default("created"),
    alfaOrderId: text("alfa_order_id"),
    alfaPaymentUrl: text("alfa_payment_url"),
    supplierOrderId: text("supplier_order_id"),
    supplierIdempotencyKey: text("supplier_idempotency_key").notNull(),
    deliveryCodeEncrypted: text("delivery_code_encrypted"),
    paymentConfirmedAt: timestamp("payment_confirmed_at", { withTimezone: true }),
    supplierPurchasedAt: timestamp("supplier_purchased_at", { withTimezone: true }),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    notificationViewedAt: timestamp("notification_viewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    errorCode: text("error_code"),
    errorMessageSafe: text("error_message_safe"),
  },
  (table) => [
    uniqueIndex("orders_public_id_uidx").on(table.publicId),
    uniqueIndex("orders_checkout_key_uidx").on(table.checkoutKey),
    uniqueIndex("orders_alfa_order_id_uidx").on(table.alfaOrderId),
    uniqueIndex("orders_supplier_order_id_uidx").on(table.supplierOrderId),
    uniqueIndex("orders_supplier_idempotency_key_uidx").on(
      table.supplierIdempotencyKey,
    ),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
  ],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
