import { useState } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";

// Source-NAT (NAPT / PAT) demo:
// To interne hosts (10.0.0.5 og 10.0.0.6) treffer 1.2.3.4:80 (samme eksterne
// server). Uten NAT kolliderer svar-pakkene på ruteren — den vet ikke hvilken
// intern host som skal motta. NAT løser det ved å omskrive (src-IP, src-port)
// utgående og slå opp i tabellen for å reversere på vei inn.

type Mode = "uten-nat" | "med-nat";

type Direction = "out" | "in";

type Host = {
  id: "A" | "B";
  name: string;
  ip: string;
  port: number;
  /** Static Tailwind classes — must be present as literal strings for JIT. */
  cardClass: string;
};

const HOSTS: Host[] = [
  {
    id: "A",
    name: "Host A",
    ip: "10.0.0.5",
    port: 3345,
    cardClass: "border-sky-500/40 bg-sky-500/5",
  },
  {
    id: "B",
    name: "Host B",
    ip: "10.0.0.6",
    port: 3345,
    cardClass: "border-amber-500/40 bg-amber-500/5",
  },
];

const PUBLIC_IP = "138.40.50.60"; // ruterens WAN-IP
const SERVER = { ip: "1.2.3.4", port: 80 };

type NatRow = {
  hostId: "A" | "B";
  internalIp: string;
  internalPort: number;
  externalIp: string;
  externalPort: number; // tildelt portnummer på ruteren
};

type LogEntry = {
  step: number;
  hostId: "A" | "B";
  direction: Direction;
  beforeSrc: string;
  beforeDst: string;
  afterSrc: string;
  afterDst: string;
  ok: boolean;
  note: string;
};

const NEXT_EXTERNAL_PORTS = [50001, 50002];

export function NatTableDemo() {
  const [mode, setMode] = useState<Mode>("med-nat");
  const [table, setTable] = useState<NatRow[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [step, setStep] = useState(0);

  function reset() {
    setTable([]);
    setLog([]);
    setStep(0);
  }

  function sendOutgoing(hostId: "A" | "B") {
    const host = HOSTS.find((h) => h.id === hostId)!;
    const nextStep = step + 1;

    if (mode === "uten-nat") {
      // Uten NAT: src-IP er den private 10.0.0.x — ruteren sender ut, men
      // svaret kommer aldri tilbake (eller kolliderer fordi privatadressen
      // ikke er rutbar på det offentlige Internett).
      setLog((l) => [
        ...l,
        {
          step: nextStep,
          hostId,
          direction: "out",
          beforeSrc: `${host.ip}:${host.port}`,
          beforeDst: `${SERVER.ip}:${SERVER.port}`,
          afterSrc: `${host.ip}:${host.port}`,
          afterDst: `${SERVER.ip}:${SERVER.port}`,
          ok: false,
          note:
            "Privatadressen er ikke rutbar på Internett — pakken kastes av første ISP-ruter (RFC 1918).",
        },
      ]);
      setStep(nextStep);
      return;
    }

    // Med NAT: opprett eller gjenbruk en mapping
    let row = table.find(
      (r) => r.internalIp === host.ip && r.internalPort === host.port,
    );
    if (!row) {
      const usedPorts = new Set(table.map((r) => r.externalPort));
      const extPort =
        NEXT_EXTERNAL_PORTS.find((p) => !usedPorts.has(p)) ??
        50000 + table.length + 1;
      row = {
        hostId,
        internalIp: host.ip,
        internalPort: host.port,
        externalIp: PUBLIC_IP,
        externalPort: extPort,
      };
      setTable((t) => [...t, row!]);
    }

    setLog((l) => [
      ...l,
      {
        step: nextStep,
        hostId,
        direction: "out",
        beforeSrc: `${host.ip}:${host.port}`,
        beforeDst: `${SERVER.ip}:${SERVER.port}`,
        afterSrc: `${row!.externalIp}:${row!.externalPort}`,
        afterDst: `${SERVER.ip}:${SERVER.port}`,
        ok: true,
        note: `Ruteren omskriver kilde til ${row!.externalIp}:${row!.externalPort} og lagrer mapping i tabellen.`,
      },
    ]);
    setStep(nextStep);
  }

  function sendIncomingReply(hostId: "A" | "B") {
    const host = HOSTS.find((h) => h.id === hostId)!;
    const nextStep = step + 1;

    if (mode === "uten-nat") {
      setLog((l) => [
        ...l,
        {
          step: nextStep,
          hostId,
          direction: "in",
          beforeSrc: `${SERVER.ip}:${SERVER.port}`,
          beforeDst: `${host.ip}:${host.port}`,
          afterSrc: `${SERVER.ip}:${SERVER.port}`,
          afterDst: `${host.ip}:${host.port}`,
          ok: false,
          note:
            "Det er ingen utgående pakke å svare på — uten NAT er privatadressen usynlig fra internett.",
        },
      ]);
      setStep(nextStep);
      return;
    }

    // Finn mapping basert på ekstern port — svar-pakken bruker (PUBLIC_IP:extPort)
    const row = table.find((r) => r.hostId === hostId);
    if (!row) {
      setLog((l) => [
        ...l,
        {
          step: nextStep,
          hostId,
          direction: "in",
          beforeSrc: `${SERVER.ip}:${SERVER.port}`,
          beforeDst: `${PUBLIC_IP}:?`,
          afterSrc: `${SERVER.ip}:${SERVER.port}`,
          afterDst: "—",
          ok: false,
          note:
            "Ingen mapping i NAT-tabellen for denne hosten ennå — send en utgående pakke først.",
        },
      ]);
      setStep(nextStep);
      return;
    }

    setLog((l) => [
      ...l,
      {
        step: nextStep,
        hostId,
        direction: "in",
        beforeSrc: `${SERVER.ip}:${SERVER.port}`,
        beforeDst: `${row.externalIp}:${row.externalPort}`,
        afterSrc: `${SERVER.ip}:${SERVER.port}`,
        afterDst: `${row.internalIp}:${row.internalPort}`,
        ok: true,
        note: `Ruteren slår opp dst-port ${row.externalPort} i tabellen og restituerer destinasjon til ${row.internalIp}:${row.internalPort}.`,
      },
    ]);
    setStep(nextStep);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          NAT-tabell — interaktiv demo
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
      </div>

      <div className="border-b border-border bg-muted/10 px-4 py-2 flex gap-1.5 flex-wrap items-center">
        <span className="text-xs text-muted-foreground mr-2">Modus:</span>
        {(
          [
            { id: "med-nat", label: "Med NAT" },
            { id: "uten-nat", label: "Uten NAT (sammenlikning)" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              reset();
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === m.id
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40 text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="p-4 grid lg:grid-cols-2 gap-4">
        {/* Topology + controls */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Topologi
            </div>
            <div className="space-y-2 text-sm">
              {HOSTS.map((h) => (
                <div
                  key={h.id}
                  className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 ${h.cardClass}`}
                >
                  <div>
                    <div className="font-semibold">{h.name}</div>
                    <div className="font-mono text-[12px] text-muted-foreground">
                      {h.ip}:{h.port}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => sendOutgoing(h.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
                    >
                      <ArrowRight className="h-3 w-3" /> Send ut
                    </button>
                    <button
                      type="button"
                      onClick={() => sendIncomingReply(h.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
                    >
                      <ArrowLeft className="h-3 w-3" /> Svar inn
                    </button>
                  </div>
                </div>
              ))}
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <div className="font-semibold text-sm">NAT-ruter</div>
                <div className="font-mono text-[12px] text-muted-foreground">
                  LAN: 10.0.0.1 · WAN: {PUBLIC_IP}
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <div className="font-semibold text-sm">Server (offentlig)</div>
                <div className="font-mono text-[12px] text-muted-foreground">
                  {SERVER.ip}:{SERVER.port}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              NAT-tabell på ruteren
            </div>
            {table.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground italic">
                Tabellen er tom. Klikk "Send ut" for å se en mapping bli
                opprettet.
              </div>
            ) : (
              <table className="w-full text-[12px]">
                <thead className="bg-muted/10">
                  <tr>
                    <th className="text-left font-semibold px-3 py-2">Host</th>
                    <th className="text-left font-semibold px-3 py-2">
                      Intern (privat)
                    </th>
                    <th className="text-left font-semibold px-3 py-2">
                      Ekstern (omskrevet)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.hostId} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold">{r.hostId}</td>
                      <td className="px-3 py-2 font-mono">
                        {r.internalIp}:{r.internalPort}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {r.externalIp}:{r.externalPort}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {mode === "uten-nat" && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Uten NAT:</strong> begge hostene har private adresser
                (RFC 1918). Disse er ikke rutbare på det offentlige Internett.
                Pakker kastes; svar kommer aldri tilbake. NAT er "limet" som
                gjør privatnett-til-Internett-trafikk mulig.
              </div>
            </div>
          )}
        </div>

        {/* Pakke-logg */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Pakke-logg
          </div>
          {log.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground italic">
              Trykk "Send ut" fra en host for å starte. Prøv begge hostene etter
              hverandre — se hva som skjer når de bruker samme srcPort.
            </div>
          ) : (
            <ul className="space-y-2">
              {log.map((e) => (
                <li
                  key={e.step}
                  className={`rounded-md border p-3 text-xs ${
                    e.ok
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold">
                      #{e.step} · Host {e.hostId} ·{" "}
                      {e.direction === "out" ? "utgående" : "innkommende"}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        e.ok ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {e.ok ? "OK" : "Fail"}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5">
                    <div>
                      <span className="text-muted-foreground">før: </span>
                      src={e.beforeSrc} → dst={e.beforeDst}
                    </div>
                    <div>
                      <span className="text-muted-foreground">etter:</span>{" "}
                      src={e.afterSrc} → dst={e.afterDst}
                    </div>
                  </div>
                  <div className="mt-1.5 text-[11px] text-foreground/80 leading-relaxed">
                    {e.note}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
