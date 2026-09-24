import { z } from "zod";

export const staffRoleEnum = z.enum(["MANAGER", "SHIPMENT_MANAGER", "CUSTOMER_SUPPORT"]);

export const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dots, dashes and underscores only"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  staffRole: staffRoleEnum,
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
