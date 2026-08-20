import { z } from "zod";

const unsafeControlCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

function normalizedText(min: number, max: number) {
  return z.string().transform((value, context) => {
    const normalized = value.normalize("NFKC").trim();
    if (unsafeControlCharacters.test(normalized)) {
      context.addIssue({
        code: "custom",
        message: "Недопустимые управляющие символы",
      });
      return z.NEVER;
    }
    if (normalized.length < min || normalized.length > max) {
      context.addIssue({
        code: "custom",
        message: `Допустимая длина: ${min}–${max} символов`,
      });
      return z.NEVER;
    }
    return normalized;
  });
}

export const createReviewInputSchema = z
  .object({
    name: normalizedText(2, 50),
    rating: z.number().int().min(1).max(5),
    text: normalizedText(5, 500),
    website: z.string().max(0).optional().default(""),
    formStartedAt: z.number().int().nonnegative(),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
