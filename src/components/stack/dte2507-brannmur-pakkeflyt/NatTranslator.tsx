import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw, ArrowRight, AlertTriangle, Repeat } from "lucide-react";

// ---------------------------------------------------------------------------
// NAT-translator — side-ved-side
// ---------------------------------------------------------------------------
// Pedagogisk poeng (Kurose 4.3.4 / RFC 3022):
//   - Intern host bruker privat IP (RFC 1918) som ikke kan rutes på internett.
//     Brannmuren/NAT-en bytter ut src-IP og src-port på vei ut, og husker en
//     mapping i conntrack. Svar fra internet matches mot mappingen og rutes
//     tilbake til riktig intern host.
//   - PAT (Port Address Translation): hvis to interne hoster bruker samme
//     src-port (54321), velger NAT-en en ny ekstern src-port for én av dem.
//   - Hairpin NAT: intern host vil nå et annet internt subnett via firmaets
//     offentlige IP. Uten hairpin-støtte feiler dette.
// ---------------------------------------------------------------------------

type Scenario = "http" | "pat-collision" | "hairpin" | "p2p";

type Mapping = {
  id: string;
  intIp: string;
  intPort: number;
  natIp: string;
  natPort: number;
  dstIp: string;
  dstPort: number;
  proto: "TCP" | "UDP";
  note?: string;
};

type Step = {
  desc: string;
  direction: "out" | "in" | "fail";
  pre: { ip: string; port: number };
  post: { ip: string; port: number };
  highlight: string; // hvilken kolonne som endrer seg
};

const SCENARIOS: Record<Scenario, { label: string; blurb: string; build: () => { mappings: Mapping[]; steps: Step[] } }> = {
  http: {
    label: "HTTP-forespørsel ut",
    blurb:
      "Intern host vil hente en webside. NAT bytter src 192.168.1.10:54321 → 203.0.113.5:40001. Svaret tilbake matches mot tabellen.",
    build: () => ({
      mappings: [
        {
          id: "m1",
          intIp: "192.168.1.10",
          intPort: 54321,
          natIp: "203.0.113.5",
          natPort: 40001,
          dstIp: "93.184.216.34",
          dstPort: 80,
          proto: "TCP",
        },
      ],
      steps: [
        {
          desc: "1. Intern → ekstern: SRC=192.168.1.10:54321, DST=93.184.216.34:80",
          direction: "out",
          pre: { ip: "192.168.1.10", port: 54321 },
          post: { ip: "203.0.113.5", port: 40001 },
          highlight: "src",
        },
        {
          desc: "2. NAT lagrer mapping og forwarder pakken ut",
          direction: "out",
          pre: { ip: "203.0.113.5", port: 40001 },
          post: { ip: "203.0.113.5", port: 40001 },
          highlight: "stored",
        },
        {
          desc: "3. Svar ekstern → NAT: SRC=93.184.216.34:80, DST=203.0.113.5:40001",
          direction: "in",
          pre: { ip: "203.0.113.5", port: 40001 },
          post: { ip: "192.168.1.10", port: 54321 },
          highlight: "dst",
        },
        {
          desc: "4. NAT slår opp tabellen, reverserer mapping, sender til intern host",
          direction: "in",
          pre: { ip: "192.168.1.10", port: 54321 },
          post: { ip: "192.168.1.10", port: 54321 },
          highlight: "stored",
        },
      ],
    }),
  },
  "pat-collision": {
    label: "PAT-kollisjon (to interne, samme port)",
    blurb:
      "192.168.1.10 og 192.168.1.11 vil begge bruke src-port 54321 mot samme ekstern host. NAT må gi den andre en ny port — ellers kan svar ikke rutes tilbake entydig.",
    build: () => ({
      mappings: [
        {
          id: "m1",
          intIp: "192.168.1.10",
          intPort: 54321,
          natIp: "203.0.113.5",
          natPort: 40001,
          dstIp: "93.184.216.34",
          dstPort: 80,
          proto: "TCP",
        },
        {
          id: "m2",
          intIp: "192.168.1.11",
          intPort: 54321,
          natIp: "203.0.113.5",
          natPort: 40002,
          dstIp: "93.184.216.34",
          dstPort: 80,
          proto: "TCP",
          note: "Port 40001 var tatt → NAT valgte 40002.",
        },
      ],
      steps: [
        {
          desc: "1. Host A (192.168.1.10:54321) → 93.184.216.34:80 — NAT velger src-port 40001",
          direction: "out",
          pre: { ip: "192.168.1.10", port: 54321 },
          post: { ip: "203.0.113.5", port: 40001 },
          highlight: "src",
        },
        {
          desc: "2. Host B (192.168.1.11:54321) → 93.184.216.34:80 — kollisjon! NAT velger 40002 i stedet",
          direction: "out",
          pre: { ip: "192.168.1.11", port: 54321 },
          post: { ip: "203.0.113.5", port: 40002 },
          highlight: "src",
        },
        {
          desc: "3. Svar inn på port 40002 → rutes til host B; svar på 40001 → host A. Entydig.",
          direction: "in",
          pre: { ip: "203.0.113.5", port: 40002 },
          post: { ip: "192.168.1.11", port: 54321 },
          highlight: "dst",
        },
      ],
    }),
  },
  hairpin: {
    label: "Hairpin NAT — intern → egen offentlige IP",
    blurb:
      "Host i LAN slår opp firmaets webserver via offentlig DNS, får 203.0.113.5 (NAT-IP), pakker dst=203.0.113.5:443. NAT må snu (hairpin) trafikken tilbake til DMZ uten å gå ut på internet.",
    build: () => ({
      mappings: [
        {
          id: "m1",
          intIp: "192.168.1.10",
          intPort: 58210,
          natIp: "203.0.113.5",
          natPort: 50010,
          dstIp: "10.0.0.50",
          dstPort: 443,
          proto: "TCP",
          note: "Hairpin: src oversettes, dst oversettes også — to substitusjoner.",
        },
      ],
      steps: [
        {
          desc: "1. Klient slår opp web.firma.no → 203.0.113.5 (NAT-IP)",
          direction: "out",
          pre: { ip: "192.168.1.10", port: 58210 },
          post: { ip: "192.168.1.10", port: 58210 },
          highlight: "stored",
        },
        {
          desc: "2. Klient → 203.0.113.5:443 — pakken treffer NAT på inside-grensesnittet",
          direction: "out",
          pre: { ip: "192.168.1.10", port: 58210 },
          post: { ip: "203.0.113.5", port: 50010 },
          highlight: "src",
        },
        {
          desc: "3. NAT må dobbel-oversette: src (klient → NAT) OG dst (NAT → DMZ-server)",
          direction: "out",
          pre: { ip: "203.0.113.5", port: 443 },
          post: { ip: "10.0.0.50", port: 443 },
          highlight: "dst",
        },
        {
          desc: "4. DMZ-server svarer — uten hairpin ville den sett klient som offentlig IP, ikke 192.168.1.10",
          direction: "in",
          pre: { ip: "10.0.0.50", port: 443 },
          post: { ip: "192.168.1.10", port: 58210 },
          highlight: "stored",
        },
      ],
    }),
  },
  p2p: {
    label: "P2P-problemet — to NAT-er bak hver sin",
    blurb:
      "To klienter bak hver sin NAT vil koble til hverandre. Ingen ekstern part kan initiere — begge må «punche hull» samtidig via STUN/TURN. Klassisk NAT-traversal-problem.",
    build: () => ({
      mappings: [
        {
          id: "m1",
          intIp: "192.168.1.10",
          intPort: 33000,
          natIp: "203.0.113.5",
          natPort: 49120,
          dstIp: "198.51.100.7",
          dstPort: 49210,
          proto: "UDP",
          note: "STUN-server lærer Klient A sin ekstern adresse: 203.0.113.5:49120",
        },
        {
          id: "m2",
          intIp: "10.0.0.10",
          intPort: 33000,
          natIp: "198.51.100.7",
          natPort: 49210,
          dstIp: "203.0.113.5",
          dstPort: 49120,
          proto: "UDP",
          note: "STUN-server lærer Klient B sin ekstern adresse: 198.51.100.7:49210",
        },
      ],
      steps: [
        {
          desc: "1. Klient A og B kontakter felles STUN-server — lærer egen ekstern adresse",
          direction: "out",
          pre: { ip: "192.168.1.10", port: 33000 },
          post: { ip: "203.0.113.5", port: 49120 },
          highlight: "src",
        },
        {
          desc: "2. A sender pakke til B sin externe (203 → 198). NAT-A åpner hull i conntrack.",
          direction: "out",
          pre: { ip: "192.168.1.10", port: 33000 },
          post: { ip: "203.0.113.5", port: 49120 },
          highlight: "stored",
        },
        {
          desc: "3. Symmetric NAT (gjerne i mobil) bytter port for hver dst — da feiler hole-punching → bruk TURN-relay",
          direction: "fail",
          pre: { ip: "203.0.113.5", port: 49120 },
          post: { ip: "203.0.113.5", port: 49333 },
          highlight: "src",
        },
      ],
    }),
  },
};

export function NatTranslator() {
  const [scenario, setScenario] = useState<Scenario>("http");
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);

  const { mappings, steps } = useMemo(() => SCENARIOS[scenario].build(), [scenario]);

  useEffect(() => {
    if (!running) return;
    if (stepIdx >= steps.length - 1) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [running, stepIdx, steps]);

  function run() {
    setStepIdx(0);
    setRunning(true);
  }

  function reset() {
    setStepIdx(0);
    setRunning(false);
  }

  useEffect(() => {
    reset();
  }, [scenario]);

  const visibleMappings = useMemo(() => {
    // For PAT vises mapping 2 først etter step 2; for andre vises alle.
    if (scenario === "pat-collision") {
      return mappings.slice(0, stepIdx >= 1 ? 2 : 1);
    }
    return mappings;
  }, [scenario, stepIdx, mappings]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Repeat className="h-4 w-4 text-brand" />
            NAT — kilde-IP/port-omskriving
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Velg et scenario, kjør animasjonen, og se hvordan src og dst omskrives på vei ut/inn.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør scenario
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

      {/* Scenario-velger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(Object.keys(SCENARIOS) as Scenario[]).map((id) => {
          const s = SCENARIOS[id];
          const selected = id === scenario;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setScenario(id)}
              className={`text-left rounded-md border p-2 text-xs ${
                selected
                  ? "border-brand bg-brand/10"
                  : "border-border bg-background/40 hover:bg-muted/40"
              }`}
            >
              <div className="font-medium text-foreground">
                {id === "p2p" && <AlertTriangle className="inline h-3 w-3 mr-1 text-amber-500" />}
                {s.label}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.blurb}</div>
            </button>
          );
        })}
      </div>

      {/* Diagram: intern | NAT | internet */}
      <div className="grid grid-cols-3 gap-2">
        <NetworkBox label="LAN (intern)" subtitle="RFC 1918 privat" color="cyan">
          <div className="font-mono text-[10px] space-y-1">
            <div>192.168.1.10</div>
            {scenario === "pat-collision" && <div>192.168.1.11</div>}
            {scenario === "p2p" && <div>10.0.0.10 (annet LAN)</div>}
          </div>
        </NetworkBox>
        <NetworkBox label="NAT / firewall" subtitle="oversetter src/dst" color="brand">
          <div className="font-mono text-[10px]">
            <div>ekstern: 203.0.113.5</div>
            <div className="text-muted-foreground">conntrack-tabell</div>
          </div>
        </NetworkBox>
        <NetworkBox label="Internett" subtitle="offentlige IP-er" color="amber">
          <div className="font-mono text-[10px] space-y-1">
            <div>93.184.216.34 (web)</div>
            {scenario === "p2p" && <div>198.51.100.7 (B sin NAT)</div>}
            {scenario === "hairpin" && <div>10.0.0.50 (DMZ-server)</div>}
          </div>
        </NetworkBox>
      </div>

      {/* Mapping-tabell */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          NAT-mapping-tabell
        </div>
        <div className="rounded-md border border-border bg-background/40 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-1.5 px-2">Intern (src)</th>
                <th className="py-1.5 px-2"></th>
                <th className="py-1.5 px-2">Ekstern (NAT-src)</th>
                <th className="py-1.5 px-2">Mål</th>
                <th className="py-1.5 px-2">Proto</th>
              </tr>
            </thead>
            <tbody>
              {visibleMappings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 px-2 text-center text-muted-foreground italic">
                    Tom — kjør scenario for å se mapping bli til
                  </td>
                </tr>
              )}
              {visibleMappings.map((m) => (
                <tr key={m.id} className="border-b border-border/40 last:border-0 font-mono">
                  <td className="py-1.5 px-2">{m.intIp}:{m.intPort}</td>
                  <td className="py-1.5 px-2 text-brand">
                    <ArrowRight className="h-3 w-3" />
                  </td>
                  <td className="py-1.5 px-2">{m.natIp}:{m.natPort}</td>
                  <td className="py-1.5 px-2">{m.dstIp}:{m.dstPort}</td>
                  <td className="py-1.5 px-2">{m.proto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleMappings.some((m) => m.note) && (
          <div className="mt-2 space-y-1">
            {visibleMappings
              .filter((m) => m.note)
              .map((m) => (
                <div key={m.id} className="text-[11px] text-muted-foreground">
                  <span className="font-mono text-foreground">{m.intIp}:{m.intPort}</span> — {m.note}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Steg-by-steg */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Pakke-flyt
        </div>
        <ol className="space-y-1.5">
          {steps.map((s, idx) => {
            const active = idx === stepIdx;
            const past = idx < stepIdx;
            const failed = s.direction === "fail";
            return (
              <li
                key={idx}
                className={`rounded-md border p-2 text-xs transition-colors ${
                  active
                    ? failed
                      ? "border-red-500/60 bg-red-500/10"
                      : "border-brand bg-brand/10"
                    : past
                      ? "border-border bg-background/40 opacity-60"
                      : "border-border bg-background/40 opacity-40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-mono mt-0.5">{idx + 1}</span>
                  <span className="flex-1">{s.desc}</span>
                  {failed && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                </div>
                {active && (
                  <div className="mt-2 grid grid-cols-3 items-center gap-2 font-mono text-[10px]">
                    <div className="rounded border border-border bg-background px-2 py-1 text-center">
                      <div className="text-[9px] uppercase text-muted-foreground">før</div>
                      {s.pre.ip}:{s.pre.port}
                    </div>
                    <div className="text-center text-brand">
                      <ArrowRight className="inline h-3 w-3" />
                    </div>
                    <div
                      className={`rounded border bg-background px-2 py-1 text-center ${
                        failed ? "border-red-500/60" : "border-brand/60"
                      }`}
                    >
                      <div className="text-[9px] uppercase text-muted-foreground">etter</div>
                      {s.post.ip}:{s.post.port}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function NetworkBox({
  label,
  subtitle,
  color,
  children,
}: {
  label: string;
  subtitle: string;
  color: "cyan" | "brand" | "amber";
  children: React.ReactNode;
}) {
  const cls = {
    cyan: "border-cyan-500/40 bg-cyan-500/5",
    brand: "border-brand/60 bg-brand/10",
    amber: "border-amber-500/40 bg-amber-500/5",
  }[color];
  return (
    <div className={`rounded-md border ${cls} p-2`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground mb-1">{subtitle}</div>
      {children}
    </div>
  );
}
