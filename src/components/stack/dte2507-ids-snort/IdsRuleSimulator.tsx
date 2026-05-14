import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

type Detection = "signature" | "anomaly" | "both";

type Event = {
  id: number;
  description: string;
  payload: string;
  // matching kjente Snort-regler
  matchesSignature: boolean;
  signatureName?: string;
  // statistisk avvik (anomaly score)
  anomalyScore: number; // 0..100
  isAttack: boolean;
};

// Pedagogisk forenklet — modellerer prinsippet, ikke faktiske Snort-engines.
const EVENTS: Event[] = [
  {
    id: 1,
    description: "ICMP echo med Nmap-signaturpayload",
    payload: "icmp echo, len=8, content=|08 00 67 67|",
    matchesSignature: true,
    signatureName: "ICMP PING NMAP",
    anomalyScore: 35,
    isAttack: true,
  },
  {
    id: 2,
    description: "Vanlig HTTP-forespørsel til webserver",
    payload: "GET /index.html HTTP/1.1",
    matchesSignature: false,
    anomalyScore: 5,
    isAttack: false,
  },
  {
    id: 3,
    description: "Zero-day exploit i ny IoT-protokoll",
    payload: "binary blob, ukjent men avvikende lengde og frekvens",
    matchesSignature: false,
    anomalyScore: 85,
    isAttack: true,
  },
  {
    id: 4,
    description: "Cron-jobb som tar backup midt på natta",
    payload: "ssh tunneling, ~200MB ut, kl 03:17",
    matchesSignature: false,
    anomalyScore: 72, // høyt fordi det ligner exfiltrering
    isAttack: false,
  },
  {
    id: 5,
    description: "Kjent SQL-injection-mønster",
    payload: "GET /search?q=' OR '1'='1",
    matchesSignature: true,
    signatureName: "SQL_INJECTION_UNION_OR",
    anomalyScore: 50,
    isAttack: true,
  },
  {
    id: 6,
    description: "Vanlig DNS-query",
    payload: "A? example.com",
    matchesSignature: false,
    anomalyScore: 3,
    isAttack: false,
  },
];

export function IdsRuleSimulator() {
  const [mode, setMode] = useState<Detection>("signature");
  const [threshold, setThreshold] = useState(60);

  const results = useMemo(() => {
    return EVENTS.map((e) => {
      const sigAlert = e.matchesSignature;
      const anomalyAlert = e.anomalyScore >= threshold;
      const alerted =
        mode === "signature"
          ? sigAlert
          : mode === "anomaly"
          ? anomalyAlert
          : sigAlert || anomalyAlert;
      const tp = alerted && e.isAttack;
      const fp = alerted && !e.isAttack;
      const fn = !alerted && e.isAttack;
      const tn = !alerted && !e.isAttack;
      return { ...e, sigAlert, anomalyAlert, alerted, tp, fp, fn, tn };
    });
  }, [mode, threshold]);

  const summary = useMemo(() => {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const r of results) {
      if (r.tp) tp++;
      if (r.fp) fp++;
      if (r.fn) fn++;
      if (r.tn) tn++;
    }
    return { tp, fp, fn, tn };
  }, [results]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          IDS-simulator
        </div>
        <div className="flex gap-1.5">
          {(["signature", "anomaly", "both"] as Detection[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                mode === m
                  ? "bg-brand text-brand-foreground"
                  : "border border-border bg-card hover:border-brand/40 text-foreground"
              }`}
            >
              {m === "signature" ? "Signature" : m === "anomaly" ? "Anomaly" : "Begge"}
            </button>
          ))}
        </div>
      </div>

      {(mode === "anomaly" || mode === "both") && (
        <div className="border-b border-border bg-background px-4 py-3 flex items-center gap-3">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            Anomaly-terskel
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <span className="text-xs font-mono w-10 text-right">{threshold}</span>
        </div>
      )}

      <div className="p-4 space-y-2">
        {results.map((r) => (
          <div
            key={r.id}
            className={`rounded-md border p-3 text-xs ${
              r.tp
                ? "border-emerald-500/40 bg-emerald-500/5"
                : r.fp
                ? "border-amber-500/40 bg-amber-500/5"
                : r.fn
                ? "border-rose-500/40 bg-rose-500/5"
                : "border-border bg-background"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-brand">#{r.id}</span>
                  <span className="font-medium">{r.description}</span>
                  {r.isAttack && (
                    <span className="text-[10px] uppercase tracking-wider bg-rose-500/20 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded">
                      angrep
                    </span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {r.payload}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                  <span>
                    signature: {r.sigAlert ? `match (${r.signatureName})` : "ingen"}
                  </span>
                  <span>anomaly-score: {r.anomalyScore}</span>
                </div>
              </div>
              <div className="text-right">
                {r.alerted ? (
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    <ShieldAlert className="h-3.5 w-3.5" /> ALERT
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> stille
                  </div>
                )}
                <div className="text-[10px] mt-1">
                  {r.tp && <span className="text-emerald-700 dark:text-emerald-400">true positive</span>}
                  {r.fp && <span className="text-amber-700 dark:text-amber-400">false positive</span>}
                  {r.fn && <span className="text-rose-700 dark:text-rose-400">false negative</span>}
                  {r.tn && <span className="text-muted-foreground">true negative</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-muted/20 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Konfusjons-oppsummering
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-2">
            <div className="text-emerald-700 dark:text-emerald-400 font-semibold">TP</div>
            <div className="text-lg font-mono">{summary.tp}</div>
            <div className="text-[10px] text-muted-foreground">angrep fanget</div>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2">
            <div className="text-amber-700 dark:text-amber-400 font-semibold">FP</div>
            <div className="text-lg font-mono">{summary.fp}</div>
            <div className="text-[10px] text-muted-foreground">falsk alarm</div>
          </div>
          <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-2">
            <div className="text-rose-700 dark:text-rose-400 font-semibold">FN</div>
            <div className="text-lg font-mono">{summary.fn}</div>
            <div className="text-[10px] text-muted-foreground">angrep glipp</div>
          </div>
          <div className="rounded-md border border-border bg-background p-2">
            <div className="text-muted-foreground font-semibold">TN</div>
            <div className="text-lg font-mono">{summary.tn}</div>
            <div className="text-[10px] text-muted-foreground">normal stille</div>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <div>
            Senker du terskelen i anomaly-mode, fanger du flere angrep (færre FN), men
            får flere falske alarmer (flere FP). Det er klassisk presisjon/recall-tradeoff —
            den ekte hodepinen for IDS-team i drift.
          </div>
        </div>
      </div>
    </div>
  );
}
