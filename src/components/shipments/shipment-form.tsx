"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ActionResult } from "@/actions/shipments";

export type ShipmentFormValues = {
  trackingNumber?: string;
  referenceId?: string;
  shipmentType?: string;
  description?: string;
  quantity?: number;
  weight?: number | null;
  dimensions?: string;
  service?: string;
  cost?: number | null;
  insurance?: boolean;
  estimatedDelivery?: string;
  origin?: string;
  destination?: string;
  currentLocation?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  senderName?: string;
  senderCompany?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderCity?: string;
  senderState?: string;
  senderCountry?: string;
  senderPostal?: string;
  recipientName?: string;
  recipientCompany?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientCountry?: string;
  recipientPostal?: string;
};

const initialState: ActionResult = { success: false };

export function ShipmentForm({
  mode,
  action,
  defaultValues,
}: {
  mode: "create" | "edit";
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValues?: ShipmentFormValues;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const dv = defaultValues ?? {};

  useEffect(() => {
    if (state.success) {
      toast.success(mode === "create" ? "Shipment created" : "Shipment updated");
      if (mode === "create" && state.id) router.push(`/merchant/shipments/${state.id}`);
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Shipment information" description="Core details about the package being shipped.">
        <Field label="Tracking number" name="trackingNumber" defaultValue={dv.trackingNumber} placeholder="Auto-generated if left blank" disabled={mode === "edit"} />
        <Field label="Reference / order ID" name="referenceId" defaultValue={dv.referenceId} />
        <Field label="Shipment type" name="shipmentType" defaultValue={dv.shipmentType} required placeholder="Parcel, Document, Freight..." />
        <Field label="Shipping service" name="service" defaultValue={dv.service} required placeholder="Standard, Express..." />
        <Field label="Package description" name="description" defaultValue={dv.description} required className="sm:col-span-2" />
        <Field label="Quantity" name="quantity" type="number" min={1} defaultValue={dv.quantity ?? 1} />
        <Field label="Weight (kg)" name="weight" type="number" step="0.01" defaultValue={dv.weight ?? undefined} />
        <Field label="Dimensions" name="dimensions" defaultValue={dv.dimensions} placeholder="L x W x H (cm)" />
        <Field label="Shipping cost" name="cost" type="number" step="0.01" defaultValue={dv.cost ?? undefined} />
        <Field label="Estimated delivery" name="estimatedDelivery" type="date" defaultValue={dv.estimatedDelivery} />
        <div className="flex items-center gap-2 pt-6">
          <Switch id="insurance" name="insurance" defaultChecked={dv.insurance} />
          <Label htmlFor="insurance">Insured shipment</Label>
        </div>
      </Section>

      <Section title="Route" description="Where this shipment is coming from and going to.">
        <Field label="Origin" name="origin" defaultValue={dv.origin} required />
        <Field label="Destination" name="destination" defaultValue={dv.destination} required />
        <Field label="Current location" name="currentLocation" defaultValue={dv.currentLocation} placeholder="Defaults to origin" />
        <Field label="Departure location" name="departureLocation" defaultValue={dv.departureLocation} />
        <Field label="Arrival location" name="arrivalLocation" defaultValue={dv.arrivalLocation} />
      </Section>

      <Section title="Sender information">
        <Field label="Sender name" name="senderName" defaultValue={dv.senderName} required />
        <Field label="Company" name="senderCompany" defaultValue={dv.senderCompany} />
        <Field label="Email" name="senderEmail" type="email" defaultValue={dv.senderEmail} />
        <Field label="Phone" name="senderPhone" defaultValue={dv.senderPhone} />
        <Field label="Address" name="senderAddress" defaultValue={dv.senderAddress} required className="sm:col-span-2" />
        <Field label="City" name="senderCity" defaultValue={dv.senderCity} required />
        <Field label="State / Region" name="senderState" defaultValue={dv.senderState} />
        <Field label="Country" name="senderCountry" defaultValue={dv.senderCountry} required />
        <Field label="Postal code" name="senderPostal" defaultValue={dv.senderPostal} />
      </Section>

      <Section title="Recipient information">
        <Field label="Recipient name" name="recipientName" defaultValue={dv.recipientName} required />
        <Field label="Company" name="recipientCompany" defaultValue={dv.recipientCompany} />
        <Field label="Email" name="recipientEmail" type="email" defaultValue={dv.recipientEmail} />
        <Field label="Phone" name="recipientPhone" defaultValue={dv.recipientPhone} />
        <Field label="Address" name="recipientAddress" defaultValue={dv.recipientAddress} required className="sm:col-span-2" />
        <Field label="City" name="recipientCity" defaultValue={dv.recipientCity} required />
        <Field label="State / Region" name="recipientState" defaultValue={dv.recipientState} />
        <Field label="Country" name="recipientCountry" defaultValue={dv.recipientCountry} required />
        <Field label="Postal code" name="recipientPostal" defaultValue={dv.recipientPostal} />
      </Section>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create shipment" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  className,
  disabled,
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  step?: string;
}) {
  const isTextarea = name === "description";
  return (
    <div className={className}>
      <Label htmlFor={name} className="mb-2 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {isTextarea ? (
        <Textarea id={name} name={name} defaultValue={defaultValue as string} required={required} placeholder={placeholder} rows={2} />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          step={step}
        />
      )}
    </div>
  );
}
