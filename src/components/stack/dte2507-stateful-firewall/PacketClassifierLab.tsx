import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

type Mode = "stateless" | "stateful";
type Verdict = "allow" | "block";

type Packet = {
  id: number;
  src: string;
  srcPort: number;
  dst: string;
  dstPort: number;
  flags: string; // "SYN" | "SYN,ACK" | "ACK" | "ACK + payload" | "ACK from outside (no connection)"
  fromInside: boolean; // sendt fra innsiden av nettet
  note: string;
  expectedStateless: Verdict;
  expectedStateful: Verdict;
};

// Pakketabell bygget på Kurose-Ross Table 8.6 / 8.8 (s. 669-673)
const PACKETS: Packet[] = [
  {
    id: 1,
    src: "10.0.1.5",
    srcPort: 51200,
    dst: "93.184.216.34",
    dstPort: 80,
    flags: "SYN",
    fromInside: true,
    note: "Intern bruker åpner TCP til webserver",
    expectedStateless: "allow",
    expectedStateful: "allow",
  },
  {
    id: 2,
    src: "93.184.216.34",
    srcPort: 80,
    dst: "10.0.1.5",
    dstPort: 51200,
    flags: "SYN,ACK",
    fromInside: false,
    note: "Server svarer på handshake",
    expectedStateless: "allow",
    expectedStateful: "allow",
  },
  {
    id: 3,
    src: "203.0.113.7",
    srcPort: 31337,
    dst: "10.0.1.5",
    dstPort: 51201,
    flags: "ACK",
    fromInside: false,
    note: "Random ACK fra utsiden — ingen åpen forbindelse på port 51201",
    expectedStateless: "allow", // stateless slipper ACK gjennom (hullet!)
    expectedStateful: "block",
  },
  {
    id: 4,
    src: "10.0.1.5",
    srcPort: 51200,
    dst: "93.184.216.34",
    dstPort: 80,
    flags: "ACK + payload",
    fromInside: true,
    note: "Intern bruker sender HTTP-request",
    expectedStateless: "allow",
    expectedStateful: "allow",
  },
  {
    id: 5,
    src: "198.51.100.9",
    srcPort: 44444,
    dst: "10.0.1.5",
    dstPort: 23,
    flags: "SYN",
    fromInside: false,
    note: "Innkommende Telnet-forsøk — ikke initiert av oss",
    expectedStateless: "block",
    expectedStateful: "block",
  },
  {
    id: 6,
    src: "203.0.113.99",
    srcPort: 12345,
    dst: "10.0.1.5",
    dstPort: 80,
    flags: "ACK",
    fromInside: false,
    note: "Malformed ACK — angriper prøver port-scan via ACK-pakker",
    expectedStateless: "allow", // ACK=1-regelen slipper dem inn
    expectedStateful: "block",
  },
];

const RULES_STATELESS = [
  "Tillat: utgående TCP fra 10.0.1.0/24 til hvilken som helst destinasjon",
  "Tillat: innkommende TCP der ACK = 1 (antakelse: del av etablert forbindelse)",
  "Blokker: alt annet, særlig SYN-only fra utsiden",
];

const RULES_STATEFUL = [
  "Bygg connection table fra 3-veis-handshake (SYN, SYN-ACK, ACK)",
  "Tillat: innkommende pakke kun hvis (src, srcPort, dst, dstPort) matcher etablert forbindelse",
  "Marker som ESTABLISHED når handshake er fullført; fjern ved FIN/timeout",
];

export function PacketClassifierLab() {
  const [mode, setMode] = useState<Mode>("stateless");
  const [verdicts, setVerdicts] = useState<Record<number, Verdict | null>>({});

  // Connection table — bygget opp under stateful-mode
  const connTable = useMemo(() => {
    const out = new Set<string>();
    for (const p of PACKETS) {
      if (p.fromInside && p.flags === "SYN") {
        out.add(`${p.src}:${p.srcPort}↔${p.dst}:${p.dstPort}`);
      }
    }
    return Array.from(out);
  }, []);

  function setVerdict(id: number, v: Verdict) {
    setVerdicts((prev) => ({ ...prev, [id]: v }));
  }

  function reset() {
    setVerdicts({});
  }

  const correct = PACKETS.filter((p) => {
    const expected = mode === "stateless" ? p.expectedStateless : p.expectedStateful;
    return verdicts[p.id] === expected;
  }).length;
  const answered = Object.values(verdicts).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Pakke-klassifisering: tillat eller blokker?
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Riktig: {correct}/{PACKETS.length}
          </div>
          <div className="flex gap-1.5">
            {(["stateless", "stateful"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setVerdicts({});
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  mode === m
                    ? "bg-brand text-brand-foreground"
                    : "border border-border bg-card hover:border-brand/40 text-foreground"
                }`}
              >
                {m === "stateless" ? "Stateless" : "Stateful"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px]">
        <div className="p-4 space-y-2">
          {PACKETS.map((p) => {
            const expected = mode === "stateless" ? p.expectedStateless : p.expectedStateful;
            const chosen = verdicts[p.id];
            const isCorrect = chosen && chosen === expected;
            const isWrong = chosen && chosen !== expected;
            return (
              <div
                key={p.id}
                className={`rounded-md border p-3 text-xs grid grid-cols-[auto_1fr_auto] gap-3 items-center ${
                  isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : isWrong
                    ? "border-rose-500/40 bg-rose-500/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="font-mono font-semibold text-brand">#{p.id}</div>
                <div className="space-y-0.5">
                  <div className="font-mono">
                    {p.src}:{p.srcPort} → {p.dst}:{p.dstPort}
                    <span className="ml-2 text-brand">[{p.flags}]</span>
                  </div>
                  <div className="text-muted-foreground text-[11px]">{p.note}</div>
                  {chosen && (
                    <div className={`text-[11px] mt-1 flex items-center gap-1 ${isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Riktig: {mode}-regelen sier <strong className="ml-1">{expected}</strong>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Feil — {mode} skulle gi <strong className="ml-1">{expected}</strong>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setVerdict(p.id, "allow")}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                      chosen === "allow"
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-card hover:border-emerald-500/40"
                    }`}
                  >
                    Tillat
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerdict(p.id, "block")}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                      chosen === "block"
                        ? "bg-rose-500/20 border-rose-500/60 text-rose-700 dark:text-rose-300"
                        : "border-border bg-card hover:border-rose-500/40"
                    }`}
                  >
                    Blokker
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-muted-foreground">
              Svart: {answered}/{PACKETS.length}
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2.5 py-1.5"
            >
              <RotateCcw className="h-3 w-3" /> Nullstill
            </button>
          </div>
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-border bg-muted/20 p-4 text-xs space-y-3">
          <div>
            <div className="font-semibold mb-1 text-foreground">
              {mode === "stateless" ? "Stateless ACL" : "Stateful regler"}
            </div>
            <ul className="space-y-1 list-disc pl-4 text-muted-foreground">
              {(mode === "stateless" ? RULES_STATELESS : RULES_STATEFUL).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          {mode === "stateful" && (
            <div>
              <div className="font-semibold mb-1 text-foreground">Connection table</div>
              <ul className="space-y-0.5 text-muted-foreground font-mono text-[10px]">
                {connTable.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="text-[10px] text-muted-foreground mt-1">
                Bygget fra observerte handshake-initieringer.
              </div>
            </div>
          )}
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-900 dark:text-amber-200">
            <strong>Hint:</strong> i stateless ser regelen bare på pakkens egne felter
            (src/dst/port/flags), aldri på historikk. ACK=1-regelen er det berømte hullet
            — angripere sender ACK-pakker uten å først ha gjort handshake, og slipper inn.
          </div>
        </aside>
      </div>
    </div>
  );
}
