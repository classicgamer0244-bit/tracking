import { requireSuperAdmin } from "@/lib/session";
import { InvoiceView } from "@/components/shipments/invoice-view";

export default async function SuperAdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;

  return <InvoiceView shipmentId={id} basePath="/super-admin/shipments" />;
}
