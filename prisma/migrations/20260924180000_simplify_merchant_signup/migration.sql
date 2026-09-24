-- Merchant profile fields become optional (merchant can fill them in later)
ALTER TABLE "Merchant" ALTER COLUMN "businessName" DROP NOT NULL;
ALTER TABLE "Merchant" ALTER COLUMN "merchantName" DROP NOT NULL;
ALTER TABLE "Merchant" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "Merchant" ALTER COLUMN "businessAddress" DROP NOT NULL;
ALTER TABLE "Merchant" ALTER COLUMN "country" DROP NOT NULL;
ALTER TABLE "Merchant" ALTER COLUMN "city" DROP NOT NULL;

-- Merchant.username was never used for authentication (User.username/email is) — drop it.
DROP INDEX IF EXISTS "Merchant_username_key";
ALTER TABLE "Merchant" DROP COLUMN "username";

-- Track last successful sign-in per user.
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- MerchantStatus: rename INACTIVE -> DISABLED (no existing rows use INACTIVE).
CREATE TYPE "MerchantStatus_new" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');
ALTER TABLE "Merchant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Merchant" ALTER COLUMN "status" TYPE "MerchantStatus_new" USING ("status"::text::"MerchantStatus_new");
ALTER TYPE "MerchantStatus" RENAME TO "MerchantStatus_old";
ALTER TYPE "MerchantStatus_new" RENAME TO "MerchantStatus";
DROP TYPE "MerchantStatus_old";
ALTER TABLE "Merchant" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
