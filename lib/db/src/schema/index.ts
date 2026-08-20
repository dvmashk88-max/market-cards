import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
  "payment_failed",
  "supplier_failed",
  "email_failed",
  "manual_review",
]);

export const orderTypeEnum = pgEnum("order_type", [
  "gift_card",
  "steam_topup",
  "telegram_stars",
  "telegram_premium",
  "game_topup",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull(),
    checkoutKey: uuid("checkout_key").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    productSlug: text("product_slug").notNull(),
    orderType: orderTypeEnum("order_type").notNull().default("gift_card"),
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
    fulfillmentDataEncrypted: text("fulfillment_data_encrypted"),
    supplierRequestStartedAt: timestamp("supplier_request_started_at", {
      withTimezone: true,
    }),
    paymentConfirmedAt: timestamp("payment_confirmed_at", {
      withTimezone: true,
    }),
    supplierPurchasedAt: timestamp("supplier_purchased_at", {
      withTimezone: true,
    }),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    notificationViewedAt: timestamp("notification_viewed_at", {
      withTimezone: true,
    }),
    processingOwner: text("processing_owner"),
    processingLeaseUntil: timestamp("processing_lease_until", {
      withTimezone: true,
    }),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    attemptCount: integer("attempt_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
    index("orders_processing_idx").on(table.status, table.nextAttemptAt),
  ],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;

export const siteVisits = pgTable(
  "site_visits",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    visitorTokenHash: text("visitor_token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("site_visits_visitor_token_hash_uidx").on(
      table.visitorTokenHash,
    ),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    visitId: bigint("visit_id", { mode: "number" })
      .notNull()
      .references(() => siteVisits.id),
    name: varchar("name", { length: 50 }).notNull(),
    rating: smallint("rating").notNull(),
    text: varchar("text", { length: 500 }).notNull(),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("reviews_visit_id_uidx").on(table.visitId),
    index("reviews_public_created_idx")
      .on(table.createdAt)
      .where(sql`${table.isVisible} = true`),
    check(
      "reviews_name_length_check",
      sql`char_length(${table.name}) BETWEEN 2 AND 50`,
    ),
    check("reviews_rating_check", sql`${table.rating} BETWEEN 1 AND 5`),
    check(
      "reviews_text_length_check",
      sql`char_length(${table.text}) BETWEEN 5 AND 500`,
    ),
  ],
);

export type SiteVisitRow = typeof siteVisits.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
