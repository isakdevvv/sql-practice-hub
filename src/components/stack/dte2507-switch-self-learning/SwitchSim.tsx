import { useMemo, useState } from "react";
import { Play, RotateCcw, Trash2 } from "lucide-react";

type Host = { name: string; mac: string; port: number };

type SwitchEntry = {
  mac: string;
  port: number;
  // Slot index when entry was inserted/refreshed; aging = currentSlot - addedAt.
  addedAt: number;
};

type FrameEvent = {
  slot: number;
  fromMac: string;
  toMac: string;
  fromPort: number;
  action: "learn-and-broadcast" | "learn-and-forward" | "learn-and-filter";
  forwardedToPorts: number[];
  note: string;
};

const HOSTS: Host[] = [
  { name: "A", mac: "AA:AA", port: 1 },
  { name: "B", mac: "BB:BB", port: 2 },
  { name: "C", mac: "CC:CC", port: 3 },
  { name: "D", mac: "DD:DD", port: 3 }, // D is on same port as C (via a small hub or switch downstream)
];

const AGING_TIMEOUT = 5; // slots; aggressive for demo purposes

type SimState = {
  table: SwitchEntry[];
  events: FrameEvent[];
  slot: number;
};

function processFrame(state: SimState, from: Host, to: Host): SimState {
  const slot = state.slot + 1;
  // Step 1: age out old entries
  const aged = state.table.filter((e) => slot - e.addedAt < AGING_TIMEOUT);
  // Step 2: learn / refresh source
  const refreshed: SwitchEntry[] = [
    ...aged.filter((e) => e.mac !== from.mac),
    { mac: from.mac, port: from.port, addedAt: slot },
  ];
  // Step 3: lookup destination
  const dest = refreshed.find((e) => e.mac === to.mac);
  let action: FrameEvent["action"];
  let forwardedToPorts: number[];
  let note: string;
  if (!dest) {
    action = "learn-and-broadcast";
    forwardedToPorts = [1, 2, 3].filter((p) => p !== from.port);
    note = `Switchen kjenner ikke ${to.mac} → broadcast til alle andre porter.`;
  } else if (dest.port === from.port) {
    action = "learn-and-filter";
    forwardedToPorts = [];
    note = `Destinasjonen ${to.mac} er på samme port som senderen (${from.port}) → drop (filter). Hostene snakker via samme link allerede.`;
  } else {
    action = "learn-and-forward";
    forwardedToPorts = [dest.port];
    note = `Switchen vet ${to.mac} sitter på port ${dest.port} → kun den porten.`;
  }
  const event: FrameEvent = {
    slot,
    fromMac: from.mac,
    toMac: to.mac,
    fromPort: from.port,
    action,
    forwardedToPorts,
    note,
  };
  return {
    table: refreshed.sort((a, b) => a.port - b.port || a.mac.localeCompare(b.mac)),
    events: [...state.events, event],
    slot,
  };
}

function emptyState(): SimState {
  return { table: [], events: [], slot: 0 };
}

export function SwitchSim() {
  const [state, setState] = useState<SimState>(emptyState());
  const [fromName, setFromName] = useState("A");
  const [toName, setToName] = useState("B");

  const fromHost = HOSTS.find((h) => h.name === fromName)!;
  const toHost = HOSTS.find((h) => h.name === toName)!;

  function send() {
    if (fromHost.mac === toHost.mac) return;
    setState((s) => processFrame(s, fromHost, toHost));
  }

  function reset() {
    setState(emptyState());
  }

  function skipAging() {
    // Force aging by advancing slot counter by AGING_TIMEOUT without sending a frame.
    setState((s) => ({
      ...s,
      slot: s.slot + AGING_TIMEOUT,
      table: s.table.filter((e) => s.slot + AGING_TIMEOUT - e.addedAt < AGING_TIMEOUT),
      events: [
        ...s.events,
        {
          slot: s.slot + AGING_TIMEOUT,
          fromMac: "—",
          toMac: "—",
          fromPort: 0,
          action: "learn-and-forward",
          forwardedToPorts: [],
          note: `Tid hopper ${AGING_TIMEOUT} slots fram — gamle oppføringer slettes av aging-timeren.`,
        },
      ],
    }));
  }

  const lastEvent = state.events[state.events.length - 1];

  const tableEntries = useMemo(() => state.table, [state.table]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Selvlærende switch · aging = {AGING_TIMEOUT} slots
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={skipAging}
            className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
          >
            Hopp {AGING_TIMEOUT} slots (test aging)
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" /> Nullstill
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="p-4 border-b md:border-b-0 md:border-r border-border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Topologi
          </div>
          <NetworkDiagram lastEvent={lastEvent} />
          <div className="mt-4 flex items-end gap-2 flex-wrap">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Fra</label>
              <select
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="bg-background border border-border rounded-md px-2 py-1.5 text-sm font-mono"
              >
                {HOSTS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} ({h.mac}, port {h.port})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Til</label>
              <select
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                className="bg-background border border-border rounded-md px-2 py-1.5 text-sm font-mono"
              >
                {HOSTS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} ({h.mac}, port {h.port})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={send}
              disabled={fromHost.mac === toHost.mac}
              className="inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-40 text-xs font-medium px-3 py-2"
            >
              <Play className="h-3.5 w-3.5" /> Send ramme
            </button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Tips: C og D deler port 3 (som om en mini-switch henger der). En ramme fra C
            til D blir filtrert.
          </div>
        </div>

        <aside className="p-4 bg-background">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Switch-tabell (slot {state.slot})
          </div>
          {tableEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">Tom — switchen vet ingenting ennå.</div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left font-semibold px-2 py-1">MAC</th>
                    <th className="text-left font-semibold px-2 py-1">Port</th>
                    <th className="text-left font-semibold px-2 py-1">Alder</th>
                  </tr>
                </thead>
                <tbody>
                  {tableEntries.map((e) => {
                    const age = state.slot - e.addedAt;
                    const aboutToExpire = age >= AGING_TIMEOUT - 2;
                    return (
                      <tr key={e.mac + e.port} className="border-t border-border">
                        <td className="px-2 py-1 font-mono">{e.mac}</td>
                        <td className="px-2 py-1 font-mono">{e.port}</td>
                        <td className={`px-2 py-1 font-mono ${aboutToExpire ? "text-amber-500" : ""}`}>
                          {age}/{AGING_TIMEOUT}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </div>

      <div className="border-t border-border bg-muted/10">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
          <span>Hendelseslogg</span>
          {state.events.length > 0 && (
            <button
              type="button"
              onClick={() => setState((s) => ({ ...s, events: [] }))}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> Tøm logg
            </button>
          )}
        </div>
        <div className="max-h-[260px] overflow-y-auto p-3 space-y-1.5">
          {state.events.length === 0 && (
            <div className="text-xs text-muted-foreground italic">Send en ramme for å begynne.</div>
          )}
          {state.events.map((ev, i) => (
            <EventRow key={i} event={ev} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: FrameEvent }) {
  const cls =
    event.action === "learn-and-broadcast"
      ? "border-amber-500/40 bg-amber-500/5"
      : event.action === "learn-and-filter"
      ? "border-blue-500/40 bg-blue-500/5"
      : event.fromMac === "—"
      ? "border-border bg-muted/20"
      : "border-emerald-500/40 bg-emerald-500/5";

  const tag =
    event.action === "learn-and-broadcast"
      ? "BROADCAST"
      : event.action === "learn-and-filter"
      ? "FILTER (drop)"
      : event.fromMac === "—"
      ? "AGING"
      : "FORWARD";

  return (
    <div className={`rounded-md border px-2.5 py-1.5 text-[12px] ${cls}`}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">#{event.slot}</span>
        <span className="font-semibold text-[10px] uppercase tracking-wider">{tag}</span>
        {event.fromMac !== "—" && (
          <span className="font-mono text-[11px]">
            {event.fromMac} → {event.toMac}
          </span>
        )}
        {event.forwardedToPorts.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            ut på port {event.forwardedToPorts.join(", ")}
          </span>
        )}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{event.note}</div>
    </div>
  );
}

function NetworkDiagram({ lastEvent }: { lastEvent: FrameEvent | undefined }) {
  const isActive = (port: number) =>
    !!lastEvent && (lastEvent.fromPort === port || lastEvent.forwardedToPorts.includes(port));

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <HostBox
          name="A"
          mac="AA:AA"
          port={1}
          active={!!lastEvent && (lastEvent.fromMac === "AA:AA" || lastEvent.forwardedToPorts.includes(1))}
        />
        <HostBox
          name="B"
          mac="BB:BB"
          port={2}
          active={!!lastEvent && (lastEvent.fromMac === "BB:BB" || lastEvent.forwardedToPorts.includes(2))}
        />
        <div className="flex flex-col gap-1.5">
          <HostBox
            name="C"
            mac="CC:CC"
            port={3}
            active={!!lastEvent && (lastEvent.fromMac === "CC:CC" || lastEvent.forwardedToPorts.includes(3))}
            small
          />
          <HostBox
            name="D"
            mac="DD:DD"
            port={3}
            active={!!lastEvent && (lastEvent.fromMac === "DD:DD" || lastEvent.forwardedToPorts.includes(3))}
            small
          />
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1">
        {[1, 2, 3].map((p) => (
          <div key={p} className={`h-1.5 w-12 rounded-full ${isActive(p) ? "bg-brand" : "bg-border"}`} />
        ))}
      </div>
      <div className="mt-2 rounded-md border border-brand/40 bg-brand/5 text-center py-2 text-sm font-semibold">
        Switch
        <div className="text-[10px] font-normal text-muted-foreground">
          port 1 · port 2 · port 3
        </div>
      </div>
    </div>
  );
}

function HostBox({
  name,
  mac,
  port,
  active,
  small,
}: {
  name: string;
  mac: string;
  port: number;
  active: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-md border ${
        active ? "border-brand bg-brand/10" : "border-border bg-card"
      } ${small ? "py-1" : "py-2"} text-center transition-colors`}
    >
      <div className={`${small ? "text-xs" : "text-sm"} font-semibold`}>Host {name}</div>
      <div className="text-[10px] font-mono text-muted-foreground">{mac}</div>
      <div className="text-[10px] text-muted-foreground">port {port}</div>
    </div>
  );
}

// Internal helpers exposed in case future tests want to call them.
export const _internal = { AGING_TIMEOUT, HOSTS };
