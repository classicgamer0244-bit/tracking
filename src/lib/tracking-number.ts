import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nano = customAlphabet(alphabet, 10);

/** Generates a human-friendly tracking number like `STK-7F3K9QP2A1`. */
export function generateTrackingNumber(): string {
  return `STK-${nano()}`;
}

export function generateMerchantCode(): string {
  const nanoShort = customAlphabet(alphabet, 6);
  return `MCH-${nanoShort()}`;
}
