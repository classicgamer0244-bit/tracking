import { CreateMerchantForm } from "@/components/merchants/create-merchant-form";

export default function NewMerchantPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create merchant</h1>
        <p className="text-muted-foreground">
          Just an email and password — the merchant can complete their business profile later.
        </p>
      </div>
      <CreateMerchantForm />
    </div>
  );
}
