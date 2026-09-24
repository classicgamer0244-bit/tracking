import { z } from "zod";

export const merchantStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]);

/** Super Admin merchant creation — intentionally just credentials. Everything
 * else is filled in later by the merchant from their own dashboard. */
export const createMerchantSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm the password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;

const optionalStr = () => z.string().optional().or(z.literal(""));

/** Super Admin edit — and the merchant's own "complete your profile" form —
 * share this shape. Every field is optional since a merchant may not have
 * filled anything in yet. */
export const updateMerchantSchema = z.object({
  id: z.string().min(1),
  businessName: optionalStr(),
  merchantName: optionalStr(),
  email: z.string().email(),
  phone: optionalStr(),
  businessAddress: optionalStr(),
  country: optionalStr(),
  city: optionalStr(),
  status: merchantStatusEnum.default("ACTIVE"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;

/** The merchant's own profile form omits `status` (only Super Admin can change that). */
export const merchantProfileSchema = updateMerchantSchema.omit({ id: true, status: true });
export type MerchantProfileInput = z.infer<typeof merchantProfileSchema>;

export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm the password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
