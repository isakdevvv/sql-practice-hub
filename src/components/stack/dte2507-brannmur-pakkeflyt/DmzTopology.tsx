import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ServerCog,
  Globe,
  Shield,
  Database,
  Mail,
  FolderLock,
  KeyRound,
} from "lucide-react";

// ---------------------------------------------------------------------------
// DMZ-topologi — interaktivt nettverksdiagram
// ---------------------------------------------------------------------------
// Pedagogisk poeng: DMZ er en sone mellom internett og indre LAN. Tjenester
// som MA være tilgjengelige utenfra (web, mail-MX) bor i DMZ; alt sensitivt
// (DB, intern dokumentstore, AD) bor i indre LAN. To brannmurer reduserer
// blast-radius: et brudd pa webserveren gir ikke direkte tilgang til DB.
//
// Brukeren drar 5 tjenester inn i én av tre soner. «Valider» evaluerer
// plasseringen mot best practice — kort regel-sett, ingen overraskelser:
//   - webserver, mailserver  → DMZ (eller LAN m/ reverse proxy, ikke testet her)
//   - database, intern dokumentstore, AD-controller → LAN (aldri DMZ, aldri internet)
//   - ingen tjeneste skal i «internet»-sonen — den er for ekstern trafikk
// ---------------------------------------------------------------------------

type Zone = "internet" | "dmz" | "lan" | "unplaced";

type ServiceId = "web" | "mail" | "db" | "docs" | "ad";

type Service = {
  id: ServiceId;
  label: string;
  blurb: string;
  Icon: React.ComponentType<{ className?: string }>;
  ideal: Zone[]; // best place
  forbidden: Zone[]; // alvorlig feil
};

const SERVICES: Service[] = [
  {
    id: "web",
    label: "Webserver",
    blurb: "Tar inn HTTPS-trafikk fra hele internett.",
    Icon: Globe,
    ideal: ["dmz"],
    forbidden: ["internet"],
  },
  {
    id: "mail",
    label: "Mailserver (MX)",
    blurb: "Mottar SMTP fra fremmede mail-servere.",
    Icon: Mail,
    ideal: ["dmz"],
    forbidden: ["internet"],
  },
  {
    id: "db",
    label: "Database (PostgreSQL)",
    blurb: "Holder kundedata, transaksjoner — skal ALDRI nås direkte fra internet.",
    Icon: Database,
    ideal: ["lan"],
    forbidden: ["internet", "dmz"],
  },
  {
    id: "docs",
    label: "Intern dokumentstore",
    blurb: "Fildelings-share for ansatte. Bare brukere innenfra leser.",
    Icon: FolderLock,
    ideal: ["lan"],
    forbidden: ["internet", "dmz"],
  },
  {
    id: "ad",
    label: "AD-controller",
    blurb: "Active Directory — autentiserer alle interne brukere. Kritisk.",
    Icon: KeyRound,
    ideal: ["lan"],
    forbidden: ["internet", "dmz"],
  },
];

type Verdict =
  | { kind: "ok"; note: string }
  | { kind: "warn"; note: string }
  | { kind: "bad"; note: string };

function judge(service: Service, zone: Zone): Verdict {
  if (zone === "unplaced") return { kind: "warn", note: "Ikke plassert ennå." };
  if (service.forbidden.includes(zone)) {
    if (zone === "internet") {
      return {
        kind: "bad",
        note: `${service.label} kan ikke bo «på internett» — den er en av VÅRE tjenester. Dra inn i LAN eller DMZ.`,
      };
    }
    if (zone === "dmz" && service.ideal.includes("lan")) {
      return {
        kind: "bad",
        note: `${service.label} eksponert i DMZ er en alvorlig sikkerhetsrisiko. Et brudd på webserveren ville da gi direkte tilgang.`,
      };
    }
    return { kind: "bad", note: "Forbudt plassering." };
  }
  if (service.ideal.includes(zone)) {
    return { kind: "ok", note: "Best practice." };
  }
  return {
    kind: "warn",
    note: `Akseptabelt, men ${service.ideal[0]?.toUpperCase()} er normalvalget.`,
  };
}

export function DmzTopology() {
  const [placements, setPlacements] = useState<Record<ServiceId, Zone>>({
    web: "unplaced",
    mail: "unplaced",
    db: "unplaced",
    docs: "unplaced",
    ad: "unplaced",
  });
  const [validated, setValidated] = useState(false);

  function place(id: ServiceId, zone: Zone) {
    setPlacements((cur) => ({ ...cur, [id]: zone }));
    setValidated(false);
  }

  function reset() {
    setPlacements({
      web: "unplaced",
      mail: "unplaced",
      db: "unplaced",
      docs: "unplaced",
      ad: "unplaced",
    });
    setValidated(false);
  }

  const verdicts = useMemo(() => {
    const out: Record<ServiceId, Verdict> = {} as Record<ServiceId, Verdict>;
    for (const s of SERVICES) {
      out[s.id] = judge(s, placements[s.id]);
    }
    return out;
  }, [placements]);

  const summary = useMemo(() => {
    const allPlaced = SERVICES.every((s) => placements[s.id] !== "unplaced");
    const allGood = SERVICES.every((s) => verdicts[s.id].kind === "ok");
    const anyBad = SERVICES.some((s) => verdicts[s.id].kind === "bad");
    return { allPlaced, allGood, anyBad };
  }, [placements, verdicts]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand" />
            Plasser tjenestene i riktig sone
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Klikk en tjeneste, så på sonen den skal bo i. «Valider» avslører feil med forklaring.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setValidated(true)}
            disabled={!summary.allPlaced}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Valider plassering
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nullstill
          </button>
        </div>
      </div>

      {/* Topologi-diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 items-stretch">
        <ZoneBox
          zone="lan"
          label="LAN (intern)"
          sub="ansatte + sensitive systemer"
          color="cyan"
          services={SERVICES.filter((s) => placements[s.id] === "lan")}
          verdicts={verdicts}
          validated={validated}
          onDrop={place}
        />
        <FirewallBar label="FW 1" sub="LAN ↔ DMZ" />
        <ZoneBox
          zone="dmz"
          label="DMZ"
          sub="eksponerte tjenester"
          color="brand"
          services={SERVICES.filter((s) => placements[s.id] === "dmz")}
          verdicts={verdicts}
          validated={validated}
          onDrop={place}
        />
        <FirewallBar label="FW 2" sub="DMZ ↔ Internet" />
        <ZoneBox
          zone="internet"
          label="Internet"
          sub="utenfor våre nett"
          color="amber"
          services={SERVICES.filter((s) => placements[s.id] === "internet")}
          verdicts={verdicts}
          validated={validated}
          onDrop={place}
        />
      </div>

      {/* Liste over uplasserte tjenester */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Tjenester å plassere
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SERVICES.map((s) => {
            const placed = placements[s.id];
            const Icon = s.Icon;
            return (
              <div
                key={s.id}
                className={`rounded-md border p-2 text-xs ${
                  placed === "unplaced"
                    ? "border-border bg-background/40"
                    : "border-brand/30 bg-brand/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span className="font-medium">{s.label}</span>
                  {placed !== "unplaced" && (
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                      i {placed}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.blurb}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(["lan", "dmz", "internet"] as Zone[]).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => place(s.id, z)}
                      className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                        placements[s.id] === z
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border bg-background/40 hover:bg-muted/60"
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                  {placements[s.id] !== "unplaced" && (
                    <button
                      type="button"
                      onClick={() => place(s.id, "unplaced")}
                      className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/60"
                    >
                      fjern
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validerings-rapport */}
      {validated && (
        <div className="rounded-md border border-border bg-background/40 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {summary.allGood ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Alt på riktig plass — modell-DMZ.</span>
              </>
            ) : summary.anyBad ? (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Sikkerhetsbrudd funnet</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-500">Akseptabelt, men ikke ideelt</span>
              </>
            )}
          </div>
          <ul className="space-y-1 text-xs">
            {SERVICES.map((s) => {
              const v = verdicts[s.id];
              const Icon = v.kind === "ok" ? CheckCircle2 : v.kind === "bad" ? XCircle : AlertTriangle;
              const color =
                v.kind === "ok" ? "text-emerald-500" : v.kind === "bad" ? "text-red-500" : "text-amber-500";
              return (
                <li key={s.id} className="flex items-start gap-2">
                  <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${color}`} />
                  <span>
                    <span className="font-medium">{s.label}</span> i{" "}
                    <span className="font-mono text-[10px] uppercase">
                      {placements[s.id]}
                    </span>{" "}
                    — <span className="text-muted-foreground">{v.note}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function FirewallBar({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-brand/60 bg-brand/5 p-2">
      <Shield className="h-5 w-5 text-brand" />
      <div className="text-[10px] uppercase tracking-wider text-brand mt-1">{label}</div>
      <div className="text-[9px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function ZoneBox({
  zone,
  label,
  sub,
  color,
  services,
  verdicts,
  validated,
  onDrop,
}: {
  zone: Zone;
  label: string;
  sub: string;
  color: "cyan" | "brand" | "amber";
  services: Service[];
  verdicts: Record<ServiceId, Verdict>;
  validated: boolean;
  onDrop: (id: ServiceId, zone: Zone) => void;
}) {
  const cls = {
    cyan: "border-cyan-500/40 bg-cyan-500/5",
    brand: "border-brand/60 bg-brand/10",
    amber: "border-amber-500/40 bg-amber-500/5",
  }[color];
  return (
    <div
      className={`rounded-md border ${cls} p-2 min-h-[160px] flex flex-col`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData("text/plain") as ServiceId;
        if (id) onDrop(id, zone);
      }}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground mb-2">{sub}</div>
      <div className="flex flex-col gap-1 flex-1">
        {services.length === 0 && (
          <div className="text-[10px] text-muted-foreground italic">tom</div>
        )}
        {services.map((s) => {
          const v = verdicts[s.id];
          const ringCls =
            !validated || v.kind === "warn"
              ? ""
              : v.kind === "ok"
                ? "ring-1 ring-emerald-500/60"
                : "ring-1 ring-red-500/60";
          const Icon = s.Icon;
          return (
            <div
              key={s.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", s.id)}
              className={`rounded border border-border bg-background/60 px-2 py-1 text-[11px] flex items-center gap-1.5 cursor-grab ${ringCls}`}
              title={v.note}
            >
              <Icon className="h-3 w-3 text-brand" />
              <span className="truncate">{s.label}</span>
              {validated && v.kind === "bad" && (
                <XCircle className="h-3 w-3 text-red-500 ml-auto shrink-0" />
              )}
              {validated && v.kind === "ok" && (
                <CheckCircle2 className="h-3 w-3 text-emerald-500 ml-auto shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      <ServerCog className="h-3 w-3 text-muted-foreground/40 ml-auto mt-1" />
    </div>
  );
}
