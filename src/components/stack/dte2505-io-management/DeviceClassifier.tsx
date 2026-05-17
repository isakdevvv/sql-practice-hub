import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

/**
 * Enhetsklassifisering — block / character / network.
 *
 * Brukeren plasserer 6 enheter i én av tre kolonner ved å klikke. Når en enhet
 * er plassert riktig viser vi den semantiske konsekvensen (random access /
 * streaming / pakker). Feil plassering markeres rødt og kan tilbakestilles.
 */

type DeviceClass = "block" | "char" | "net";

type Device = {
  id: string;
  name: string;
  icon: string;
  cls: DeviceClass;
  consequence: string;
};

const DEVICES: Device[] = [
  {
    id: "disk",
    name: "Disk (HDD/SSD)",
    icon: "DSK",
    cls: "block",
    consequence: "Random access · 4 KB blokker · buffer cache",
  },
  {
    id: "keyboard",
    name: "Tastatur",
    icon: "KBD",
    cls: "char",
    consequence: "Streaming · én byte av gangen · ingen seek",
  },
  {
    id: "mouse",
    name: "Mus",
    icon: "MUS",
    cls: "char",
    consequence: "Streaming · event-pakker · ingen seek",
  },
  {
    id: "nic",
    name: "Nettverkskort",
    icon: "NIC",
    cls: "net",
    consequence: "Pakker · variabel størrelse · MAC/IP-stack over",
  },
  {
    id: "terminal",
    name: "Terminal (tty)",
    icon: "TTY",
    cls: "char",
    consequence: "Streaming · linje/raw modus · ingen seek",
  },
  {
    id: "printer",
    name: "Printer",
    icon: "PRN",
    cls: "char",
    consequence: "Streaming · spool-kø · ingen random access",
  },
];

const CLASS_META: Record<
  DeviceClass,
  { title: string; subtitle: string; color: string; ring: string }
> = {
  block: {
    title: "Block device",
    subtitle: "Random access · faste blokker · buffer cache",
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/40",
    ring: "ring-sky-500/40",
  },
  char: {
    title: "Character device",
    subtitle: "Streaming · byte/event for byte/event · ingen seek",
    color:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40",
    ring: "ring-amber-500/40",
  },
  net: {
    title: "Network device",
    subtitle: "Pakker · L2/L3-stack · sockets, ikke filer",
    color:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    ring: "ring-emerald-500/40",
  },
};

export function DeviceClassifier() {
  // placement[deviceId] = klassen brukeren har plassert den i (eller null)
  const [placement, setPlacement] = useState<Record<string, DeviceClass | null>>(
    () => Object.fromEntries(DEVICES.map((d) => [d.id, null])),
  );
  const [selected, setSelected] = useState<string | null>(null);

  const unplaced = useMemo(
    () => DEVICES.filter((d) => placement[d.id] === null),
    [placement],
  );

  const correct = useMemo(
    () => DEVICES.filter((d) => placement[d.id] === d.cls).length,
    [placement],
  );

  function placeSelectedIn(cls: DeviceClass) {
    if (!selected) return;
    setPlacement((p) => ({ ...p, [selected]: cls }));
    setSelected(null);
  }

  function resetDevice(id: string) {
    setPlacement((p) => ({ ...p, [id]: null }));
  }

  function resetAll() {
    setPlacement(Object.fromEntries(DEVICES.map((d) => [d.id, null])));
    setSelected(null);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          1) Velg en enhet · 2) klikk en klasse · 3) se konsekvensen
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Riktig: <span className="font-mono text-foreground">{correct}</span>
            /{DEVICES.length}
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Upplaced devices */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">
          Uplasserte enheter
        </div>
        <div className="flex flex-wrap gap-2 min-h-[3rem] rounded-lg border border-dashed border-border p-2 bg-background/40">
          {unplaced.length === 0 && (
            <div className="text-xs text-muted-foreground italic px-1 py-1">
              Alle enheter er plassert.
            </div>
          )}
          {unplaced.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelected((s) => (s === d.id ? null : d.id))}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                selected === d.id
                  ? "border-brand bg-brand/10 ring-2 ring-brand/40"
                  : "border-border bg-background hover:border-brand/50"
              }`}
              aria-pressed={selected === d.id}
            >
              <span className="font-mono text-[10px] text-muted-foreground mr-1.5">
                {d.icon}
              </span>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Three target columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["block", "char", "net"] as const).map((cls) => {
          const meta = CLASS_META[cls];
          const placed = DEVICES.filter((d) => placement[d.id] === cls);
          const isActive = selected !== null;
          return (
            <button
              key={cls}
              type="button"
              onClick={() => placeSelectedIn(cls)}
              disabled={!isActive}
              className={`text-left rounded-lg border p-3 min-h-[10rem] transition-all ${
                meta.color
              } ${
                isActive
                  ? `cursor-pointer hover:ring-2 ${meta.ring}`
                  : "cursor-default"
              }`}
            >
              <div className="font-semibold text-sm">{meta.title}</div>
              <div className="text-[11px] opacity-80 mb-3">{meta.subtitle}</div>
              <div className="space-y-1.5">
                {placed.length === 0 && (
                  <div className="text-[11px] opacity-60 italic">
                    {isActive ? "Klikk her for å plassere" : "Tom"}
                  </div>
                )}
                {placed.map((d) => {
                  const ok = d.cls === cls;
                  return (
                    <div
                      key={d.id}
                      className={`flex items-start gap-2 rounded border bg-background/60 p-2 ${
                        ok
                          ? "border-emerald-500/50"
                          : "border-rose-500/50"
                      }`}
                    >
                      {ok ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground">
                          {d.name}
                        </div>
                        {ok ? (
                          <div className="text-[10.5px] text-muted-foreground mt-0.5">
                            {d.consequence}
                          </div>
                        ) : (
                          <div className="text-[10.5px] text-rose-700 dark:text-rose-300 mt-0.5">
                            Feil klasse — riktig er{" "}
                            <span className="font-semibold">
                              {CLASS_META[d.cls].title.toLowerCase()}
                            </span>
                            .
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetDevice(d.id);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                        aria-label={`Fjern ${d.name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        <strong>Hvorfor klassifisering matter:</strong> kernelens device-API
        deler enheter i tre helt ulike interfaces. Block-enheter får{" "}
        <code className="font-mono">read()/write()</code> mot offset+lengde +
        buffer cache. Character-enheter får streaming og er ikke seekbare. Nett
        bruker sockets, ikke filer.
      </div>
    </div>
  );
}
