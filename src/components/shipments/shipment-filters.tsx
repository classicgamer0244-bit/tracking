"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";

export function ShipmentFilters({
  merchants,
}: {
  merchants?: { id: string; businessName: string | null }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

  function update(params: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value && value !== "ALL") next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ search });
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracking #, customer, email..."
          className="w-64"
        />
        <Button type="submit" size="icon" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <Select defaultValue={searchParams.get("status") ?? "ALL"} onValueChange={(v) => update({ status: v ?? undefined })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        defaultValue={searchParams.get("country") ?? ""}
        placeholder="Country"
        className="w-36"
        onBlur={(e) => update({ country: e.target.value })}
      />

      {merchants && (
        <Select defaultValue={searchParams.get("merchantId") ?? "ALL"} onValueChange={(v) => update({ merchantId: v ?? undefined })}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Merchant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All merchants</SelectItem>
            {merchants.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.businessName ?? "(no business name)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input
        type="date"
        defaultValue={searchParams.get("from") ?? ""}
        className="w-40"
        onChange={(e) => update({ from: e.target.value })}
      />
      <Input
        type="date"
        defaultValue={searchParams.get("to") ?? ""}
        className="w-40"
        onChange={(e) => update({ to: e.target.value })}
      />

      {(searchParams.size > 0) && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
