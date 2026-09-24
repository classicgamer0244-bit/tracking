"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
  Line,
} from "react-simple-maps";
import { Plus, Minus, RotateCcw, MapPin, Package, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export function ShipmentRouteMap({
  origin,
  destination,
  current,
  isDelivered,
}: {
  origin: [number, number] | null;
  destination: [number, number] | null;
  current: [number, number] | null;
  isDelivered: boolean;
}) {
  const points = [origin, destination, current].filter(Boolean) as [number, number][];

  const defaultCenter = useMemo<[number, number]>(() => {
    if (points.length === 0) return [10, 20];
    const lng = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const lat = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    return [lng, lat];
  }, [points]);

  const defaultZoom = useMemo(() => {
    if (origin && destination) {
      const dx = Math.abs(origin[0] - destination[0]);
      const dy = Math.abs(origin[1] - destination[1]);
      const span = Math.max(dx, dy);
      if (span > 120) return 1.1;
      if (span > 60) return 1.6;
      if (span > 20) return 2.5;
      return 4;
    }
    return 1.5;
  }, [origin, destination]);

  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z * 1.5).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, +(z / 1.5).toFixed(2))), []);
  const reset = useCallback(() => {
    setCenter(defaultCenter);
    setZoom(defaultZoom);
  }, [defaultCenter, defaultZoom]);

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground">
        Map location unavailable for this shipment.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[color-mix(in_oklch,var(--muted),var(--background)_40%)]">
      <ComposableMap
        projection="geoNaturalEarth1"
        width={800}
        height={340}
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
                  className="fill-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] stroke-[var(--border)] outline-none [stroke-width:0.5px]"
                />
              ))
            }
          </Geographies>

          {origin && destination && (
            <Line
              from={origin}
              to={destination}
              stroke="var(--cargo)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {origin && (
            <Marker coordinates={origin}>
              <title>Origin</title>
              <circle r={4} fill="var(--background)" stroke="var(--ink)" strokeWidth={1.5} />
            </Marker>
          )}

          {destination && (
            <Marker coordinates={destination}>
              <title>Destination</title>
              <circle r={4} fill={isDelivered ? "#10b981" : "var(--background)"} stroke="var(--ink)" strokeWidth={1.5} />
            </Marker>
          )}

          {current && (
            <Marker coordinates={current}>
              <title>Current location</title>
              {!isDelivered && (
                <circle r={9} fill="var(--cargo)" opacity={0.35} className="animate-ping" />
              )}
              <circle r={5.5} fill={isDelivered ? "#10b981" : "var(--cargo)"} stroke="var(--ink)" strokeWidth={1.5} />
            </Marker>
          )}
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

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-md border border-border bg-card/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Origin
        </span>
        <span className="flex items-center gap-1">
          <Package className="h-3 w-3 text-primary" /> Current
        </span>
        <span className="flex items-center gap-1">
          <Flag className="h-3 w-3" /> Destination
        </span>
      </div>
    </div>
  );
}
