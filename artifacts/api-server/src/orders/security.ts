import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name}_MISSING`);
  return value;
}

export function createPublicId(): string {
  return `mc_${randomBytes(12).toString("base64url")}`;
}

export function deriveAccessToken(checkoutKey: string): string {
  return createHmac("sha256", required("ORDER_ACCESS_TOKEN_SECRET"))
    .update(`order-access:${checkoutKey}`)
    .digest("base64url");
}

export function hashAccessToken(token: string): string {
  return createHmac("sha256", required("ORDER_ACCESS_TOKEN_SECRET"))
    .update(token)
    .digest("hex");
}

export function verifyAccessToken(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function encryptionKey(): Buffer {
  const key = Buffer.from(required("ORDER_DATA_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("ORDER_DATA_ENCRYPTION_KEY_INVALID");
  return key;
}

export function encryptOrderData(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptOrderData(payload: string): string {
  const [ivRaw, tagRaw, encryptedRaw] = payload.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("INVALID_ENCRYPTED_CODE");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivRaw, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export const encryptDeliveryCode = encryptOrderData;
export const decryptDeliveryCode = decryptOrderData;

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 2)}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}
