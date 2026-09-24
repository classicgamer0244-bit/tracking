export function RouteStrip() {
  const stops = [
    { label: "Order placed", city: "Seattle" },
    { label: "Departed hub", city: "Denver" },
    { label: "In transit", city: "Chicago" },
    { label: "Out for delivery", city: "Austin" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4">
      <div className="flex items-start justify-between">
        {stops.map((stop, i) => (
          <div key={stop.label} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <div className="absolute right-1/2 top-2 h-px w-full -translate-y-1/2 border-t border-dashed border-border" />
            )}
            <div
              className={
                "relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card " +
                (i === stops.length - 1 ? "bg-primary" : "bg-muted-foreground/40")
              }
            />
            <p className="mt-3 text-xs font-semibold text-foreground">{stop.city}</p>
            <p className="text-[11px] text-muted-foreground">{stop.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
