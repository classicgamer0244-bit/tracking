"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { Plus, Minus, RotateCcw, Radio, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLiveMapShipments, type MapShipment } from "@/actions/map";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BUCKET_META: Record<
  MapShipment["bucket"],
  { label: string; dot: string; ring: string; pulse: boolean }
> = {
  active: { label: "Active", dot: "#64748b", ring: "#64748b", pulse: false },
  inTransit: { label: "In transit", dot: "var(--cargo)", ring: "var(--cargo)", pulse: true },
  outForDelivery: { label: "Out for delivery", dot: "#3b82f6", ring: "#3b82f6", pulse: true },
  delivered: { label: "Delivered", dot: "#10b981", ring: "#10b981", pulse: false },
  delayed: { label: "Delayed / held", dot: "#ef4444", ring: "#ef4444", pulse: true },
  cancelled: { label: "Returned", dot: "#94a3b8", ring: "#94a3b8", pulse: false },
};

const DEFAULT_CENTER: [number, number] = [10, 20];
const DEFAULT_ZOOM = 1.15;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export function LiveShipmentsMap({ basePath }: { basePath: string }) {
  const { data, isLoading } = useSWR("live-map-shipments", () => getLiveMapShipments(), {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  });

  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [activeFilters, setActiveFilters] = useState<Set<MapShipment["bucket"]>>(
    new Set(["active", "inTransit", "outForDelivery", "delivered", "delayed", "cancelled"]),
  );
  const [selected, setSelected] = useState<MapShipment | null>(null);

  const shipments = useMemo(() => data?.shipments ?? [], [data]);
  const visible = useMemo(
    () => shipments.filter((s) => activeFilters.has(s.bucket)),
    [shipments, activeFilters],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<MapShipment["bucket"], number>> = {};
    for (const s of shipments) c[s.bucket] = (c[s.bucket] ?? 0) + 1;
    return c;
  }, [shipments]);

  function toggleFilter(bucket: MapShipment["bucket"]) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) next.delete(bucket);
      else next.add(bucket);
      return next;
    });
  }

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z * 1.5).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, +(z / 1.5).toFixed(2))), []);
  const reset = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setCenter(DEFAULT_CENTER);
    setSelected(null);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-ink bg-card shadow-cargo-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <h3 className="font-heading text-sm font-bold">Live shipment map</h3>
          <span className="hidden items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground sm:flex">
            <Radio className="h-3 w-3" /> updates every 10s
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(BUCKET_META) as MapShipment["bucket"][])
            .filter((b) => counts[b])
            .map((bucket) => {
              const meta = BUCKET_META[bucket];
              const on = activeFilters.has(bucket);
              return (
                <button
                  key={bucket}
                  onClick={() => toggleFilter(bucket)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    on
                      ? "border-ink bg-secondary text-secondary-foreground"
                      : "border-border bg-transparent text-muted-foreground/50",
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dot }} />
                  {meta.label} ({counts[bucket]})
                </button>
              );
            })}
        </div>
      </div>

      <div className="relative bg-[color-mix(in_oklch,var(--muted),var(--background)_40%)]">
        <ComposableMap
          projection="geoNaturalEarth1"
          width={800}
          height={380}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={({ coordinates, zoom: z }) => {
              if (coordinates) setCenter(coordinates as [number, number]);
              if (z) setZoom(z);
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="fill-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] stroke-[var(--border)] outline-none [stroke-width:0.5px] hover:fill-[color-mix(in_oklch,var(--muted),var(--foreground)_14%)]"
                  />
                ))
              }
            </Geographies>

            {visible.map((s) => {
              const meta = BUCKET_META[s.bucket];
              const isSelected = selected?.id === s.id;
              return (
                <Marker
                  key={s.id}
                  coordinates={s.coords!}
                  onClick={() => setSelected(s)}
                  className="cursor-pointer outline-none"
                >
                  <title>
                    {s.trackingNumber} — {SHIPMENT_STATUS_LABELS[s.status]}
                  </title>
                  {meta.pulse && (
                    <circle r={isSelected ? 9 : 7} fill={meta.ring} opacity={0.35} className="animate-ping" />
                  )}
                  <circle
                    r={isSelected ? 6 : 4.5}
                    fill={meta.dot}
                    stroke="var(--ink)"
                    strokeWidth={1.2}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        <div className="absolute right-3 top-3 flex flex-col gap-1">
          <Button variant="outline" size="icon-sm" className="bg-card" onClick={zoomIn} title="Zoom in">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" className="bg-card" onClick={zoomOut} title="Zoom out">
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" className="bg-card" onClick={reset} title="Reset view">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
            Loading live positions...
          </div>
        )}

        {selected && (
          <div className="absolute bottom-3 left-3 w-64 rounded-lg border-2 border-ink bg-card p-3 text-sm shadow-cargo-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-xs font-bold">{selected.trackingNumber}</p>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {SHIPMENT_STATUS_LABELS[selected.status]}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{selected.merchantName}</p>
            <p className="text-xs text-muted-foreground">
              {selected.origin} → {selected.destination}
            </p>
            <Link
              href={`${basePath}/${selected.id}`}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View shipment <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {(data?.unplottedCount ?? 0) > 0 && (
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          {data?.unplottedCount} shipment{data?.unplottedCount === 1 ? "" : "s"} not shown — location
          couldn&apos;t be resolved to map coordinates.
        </p>
      )}
    </div>
  );
}
