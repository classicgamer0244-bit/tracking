import { z } from "zod";

const optionalStr = () => z.string().optional().or(z.literal(""));

export const CURRENCY_OPTIONS = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "AED", label: "AED — UAE Dirham" },
] as const;

export const CURRENCY_CODES = CURRENCY_OPTIONS.map((c) => c.code);

export const shipmentFormSchema = z.object({
  trackingNumber: optionalStr(),
  referenceId: optionalStr(),
  shipmentType: z.string().min(1, "Shipment type is required"),
  description: z.string().min(1, "Package description is required"),
  quantity: z.coerce.number().int().min(1).default(1),
  weight: z.coerce.number().min(0).optional(),
  dimensions: optionalStr(),
  service: z.string().min(1, "Shipping service is required"),
  cost: z.coerce.number().min(0).optional(),
  currency: z.enum(CURRENCY_CODES as [string, ...string[]]).default("USD"),
  insurance: z.coerce.boolean().default(false),
  estimatedDelivery: optionalStr(),

  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  currentLocation: optionalStr(),
  departureLocation: optionalStr(),
  arrivalLocation: optionalStr(),

  senderName: z.string().min(1, "Sender name is required"),
  senderCompany: optionalStr(),
  senderEmail: z.string().email().optional().or(z.literal("")),
  senderPhone: optionalStr(),
  senderAddress: z.string().min(1, "Sender address is required"),
  senderCity: z.string().min(1, "Sender city is required"),
  senderState: optionalStr(),
  senderCountry: z.string().min(1, "Sender country is required"),
  senderPostal: optionalStr(),

  recipientName: z.string().min(1, "Recipient name is required"),
  recipientCompany: optionalStr(),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  recipientPhone: optionalStr(),
  recipientAddress: z.string().min(1, "Recipient address is required"),
  recipientCity: z.string().min(1, "Recipient city is required"),
  recipientState: optionalStr(),
  recipientCountry: z.string().min(1, "Recipient country is required"),
  recipientPostal: optionalStr(),
});

export type ShipmentFormInput = z.infer<typeof shipmentFormSchema>;

export const trackingEventSchema = z.object({
  shipmentId: z.string().min(1),
  status: z.string().min(1),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().min(1, "Description is required"),
  internalNote: z.string().optional().or(z.literal("")),
  visibility: z.enum(["PUBLIC", "INTERNAL"]).default("PUBLIC"),
});

export type TrackingEventInput = z.infer<typeof trackingEventSchema>;
