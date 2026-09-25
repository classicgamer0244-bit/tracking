-- Add currency to Shipment, defaulting existing rows to USD
ALTER TABLE "Shipment" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
