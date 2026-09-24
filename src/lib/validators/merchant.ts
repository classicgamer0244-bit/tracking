import { z } from "zod";

export const merchantStatusEnum = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);

export const createMerchantSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  merchantName: z.string().min(2, "Merchant contact name is required"),
  email: z.string().email(),
  phone: z.string().min(5, "Phone number is required"),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dots, dashes and underscores only"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessAddress: z.string().min(3),
  country: z.string().min(2),
  city: z.string().min(1),
  status: merchantStatusEnum.default("ACTIVE"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateMerchantSchema = createMerchantSchema
  .omit({ password: true })
  .extend({
    id: z.string().min(1),
  });

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
