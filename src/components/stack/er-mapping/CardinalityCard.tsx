export function CardinalityCard({
  type,
  diagram,
  description,
  mapping,
}: {
  type: string;
  diagram: string;
  description: string;
  mapping: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        {type}
      </div>
      <pre className="rounded-md bg-muted/40 px-3 py-2 font-mono text-sm overflow-x-auto mb-3">
        {diagram}
      </pre>
      <p className="text-sm text-foreground mb-3">{description}</p>
      <div className="text-xs">
        <span className="font-semibold text-muted-foreground uppercase tracking-wide">
          Mapping:{" "}
        </span>
        <span className="text-foreground">{mapping}</span>
      </div>
    </div>
  );
}
