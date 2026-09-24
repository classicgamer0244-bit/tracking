import { ShipmentForm } from "@/components/shipments/shipment-form";
import { createShipmentAction } from "@/actions/shipments";

export default function NewShipmentPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create shipment</h1>
        <p className="text-muted-foreground">
          Fill in the details below. A tracking number is generated automatically if you leave it blank.
        </p>
      </div>
      <ShipmentForm mode="create" action={createShipmentAction} />
    </div>
  );
}
