import { MerchantForm } from "@/components/merchants/merchant-form";
import { createMerchantAction } from "@/actions/merchants";

export default function NewMerchantPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create merchant</h1>
        <p className="text-muted-foreground">
          This creates the merchant account and an owner login for them to sign in with.
        </p>
      </div>
      <MerchantForm mode="create" action={createMerchantAction} />
    </div>
  );
}
