export function VisualizerSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative h-[260px] w-full overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 animate-pulse bg-brand/40" />
      <div className="flex h-full items-center justify-center px-4">
        <span className="text-sm text-muted-foreground">
          laster interaktiv visualisering&hellip;
        </span>
      </div>
    </div>
  );
}
