import { z } from "zod";

export const contactMerchantSchema = z.object({
  trackingNumber: z.string().min(3, "Tracking number is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(3, "Message is too short").max(2000),
});

export type ContactMerchantInput = z.infer<typeof contactMerchantSchema>;

export const replySchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1, "Message cannot be empty").max(4000),
});
