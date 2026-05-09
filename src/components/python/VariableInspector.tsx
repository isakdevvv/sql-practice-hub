import type { PyVarValue } from "@/lib/python/types";
import { cn } from "@/lib/utils";

interface Props {
  current: Record<string, PyVarValue> | null;
  /** Previous snapshot for diffing — variables that changed are highlighted. */
  previous?: Record<string, PyVarValue> | null;
}

export function VariableInspector({ current, previous = null }: Props) {
  if (!current || Object.keys(current).length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic px-3 py-2">
        Ingen variabler ennå. Kjør koden eller bruk «Steg».
      </div>
    );
  }

  const keys = Object.keys(current).sort();
  return (
    <div className="text-xs font-mono">
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 px-3 py-2">
        {keys.map((k) => {
          const v = current[k];
          const prev = previous?.[k];
          const changed = previous !== null && JSON.stringify(prev) !== JSON.stringify(v);
          const isNew = previous !== null && !(k in previous);
          return (
            <div
              key={k}
              className={cn(
                "contents",
                changed && !isNew && "[&>*]:bg-warning/10",
                isNew && "[&>*]:bg-success/10",
              )}
            >
              <div className="text-brand">{k}</div>
              <div className="text-foreground/90 break-all">{formatValue(v)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatValue(v: PyVarValue): string {
  if (v === null) return "None";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
