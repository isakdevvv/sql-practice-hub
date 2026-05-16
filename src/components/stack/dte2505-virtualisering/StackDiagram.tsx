import { useState } from "react";

type Mode = "baremetal" | "type2" | "type1" | "container";

const MODES: Record<
  Mode,
  { label: string; layers: { name: string; shared?: boolean; tone: string }[] }
> = {
  baremetal: {
    label: "Bare metal",
    layers: [
      { name: "App", tone: "brand" },
      { name: "Kernel", tone: "muted" },
      { name: "Hardware", tone: "border" },
    ],
  },
  type2: {
    label: "Type 2 VM",
    layers: [
      { name: "App", tone: "brand" },
      { name: "Gjest-kernel", tone: "violet" },
      { name: "Hypervisor (app)", tone: "sky" },
      { name: "Host-kernel", shared: true, tone: "muted" },
      { name: "Hardware", shared: true, tone: "border" },
    ],
  },
  type1: {
    label: "Type 1 VM",
    layers: [
      { name: "App", tone: "brand" },
      { name: "Gjest-kernel", tone: "violet" },
      { name: "Hypervisor (bare-metal)", tone: "sky" },
      { name: "Hardware", shared: true, tone: "border" },
    ],
  },
  container: {
    label: "Container",
    layers: [
      { name: "App", tone: "brand" },
      { name: "Container-runtime (runc)", tone: "amber" },
      { name: "Host-kernel (delt!)", shared: true, tone: "muted" },
      { name: "Hardware", shared: true, tone: "border" },
    ],
  },
};

const TONE_CLASS: Record<string, string> = {
  brand: "bg-brand/15 border-brand/40 text-brand",
  muted: "bg-muted border-border text-foreground",
  border: "bg-card border-border text-muted-foreground",
  violet: "bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300",
  sky: "bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300",
  amber: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
};

export function StackDiagram() {
  const [active, setActive] = useState<Mode>("container");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(MODES) as Mode[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActive(k)}
            className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
              active === k
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {MODES[k].label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        {MODES[active].layers.map((layer, i) => (
          <div
            key={i}
            className={`rounded-md border-2 px-3 py-2.5 text-sm font-medium text-center flex items-center justify-center gap-2 ${TONE_CLASS[layer.tone]}`}
          >
            {layer.name}
            {layer.shared && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-foreground/10 font-mono">
                delt
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        Lag merket <span className="font-mono">delt</span> deles mellom alle
        gjester / containere på samme vert.
      </div>
    </div>
  );
}
