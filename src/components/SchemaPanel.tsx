import { SCHEMA_REFERENCE } from "@/lib/db/schema";

export function SchemaPanel() {
  return (
    <div className="space-y-3 text-sm">
      <h3 className="font-semibold text-foreground">Schema</h3>
      {SCHEMA_REFERENCE.map((t) => (
        <div key={t.name} className="rounded-lg border border-border bg-card p-3">
          <div className="font-mono text-brand text-sm font-semibold mb-1.5">{t.name}</div>
          <ul className="space-y-0.5">
            {t.columns.map((c) => (
              <li
                key={c.name}
                className="flex justify-between gap-2 font-mono text-xs text-muted-foreground"
              >
                <span className="text-foreground/90">{c.name}</span>
                <span>{c.type}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
