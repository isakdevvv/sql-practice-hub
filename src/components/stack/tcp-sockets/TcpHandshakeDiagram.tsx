import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight } from "lucide-react";

interface Step {
  arrow: "client-to-server" | "server-to-client" | "client-to-server-final" | "established" | "fin";
  label: string;
  detail: string;
  clientKnows: string;
  serverKnows: string;
}

const STEPS: Step[] = [
  {
    arrow: "client-to-server",
    label: "1. SYN",
    detail: "Klienten sender SYN (synchronize) — «hei, jeg vil koble til. Mitt startnummer er X.»",
    clientKnows: "Har sendt SYN. Venter på svar.",
    serverKnows: "Har mottatt SYN. Vet hvor klienten er.",
  },
  {
    arrow: "server-to-client",
    label: "2. SYN-ACK",
    detail: "Serveren svarer SYN-ACK — «jeg er her. Jeg bekrefter X. Mitt startnummer er Y.»",
    clientKnows: "Vet at serveren er klar. Har Y.",
    serverKnows: "Har sendt SYN-ACK. Venter på siste bekreftelse.",
  },
  {
    arrow: "client-to-server-final",
    label: "3. ACK",
    detail: "Klienten bekrefter Y. Begge sider har nå avtalt sekvensnumrene.",
    clientKnows: "Tilkobling etablert.",
    serverKnows: "Tilkobling etablert.",
  },
  {
    arrow: "established",
    label: "4. Bytes flyter",
    detail: "Nå kan begge sider sende bytes til hverandre. HTTP-request, HTTP-response — alt går gjennom denne ene tilkoblingen.",
    clientKnows: "Sender HTTP-request. Leser HTTP-response.",
    serverKnows: "Leser HTTP-request. Sender HTTP-response.",
  },
  {
    arrow: "fin",
    label: "5. FIN",
    detail: "En av sidene sender FIN for å stenge. Andre siden bekrefter. Tilkoblingen er borte.",
    clientKnows: "Tilkobling lukket.",
    serverKnows: "Tilkobling lukket.",
  },
];

export function TcpHandshakeDiagram() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">TCP-håndtrykket — steg for steg</h3>
        <div className="text-xs text-muted-foreground tabular-nums">
          Steg {step + 1} / {STEPS.length}
        </div>
      </div>

      {/* SVG sequence diagram */}
      <div className="rounded-lg bg-background border border-border p-4 mb-4">
        <svg viewBox="0 0 400 260" className="w-full h-auto" role="img" aria-label="TCP håndtrykk sekvensdiagram">
          {/* Klient-kolonne */}
          <rect x="40" y="10" width="100" height="28" rx="4" fill="var(--brand)" opacity="0.15" stroke="var(--brand)" />
          <text x="90" y="29" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Klient</text>

          {/* Server-kolonne */}
          <rect x="260" y="10" width="100" height="28" rx="4" fill="var(--brand)" opacity="0.15" stroke="var(--brand)" />
          <text x="310" y="29" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Server</text>

          {/* Livslinjer */}
          <line x1="90" y1="40" x2="90" y2="240" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 3" />
          <line x1="310" y1="40" x2="310" y2="240" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 3" />

          {/* SYN-pil */}
          <Arrow
            from={{ x: 90, y: 65 }}
            to={{ x: 310, y: 75 }}
            label="SYN (seq=X)"
            active={step >= 0}
            highlight={step === 0}
          />

          {/* SYN-ACK-pil */}
          <Arrow
            from={{ x: 310, y: 105 }}
            to={{ x: 90, y: 115 }}
            label="SYN-ACK (seq=Y, ack=X+1)"
            active={step >= 1}
            highlight={step === 1}
            reverse
          />

          {/* ACK-pil */}
          <Arrow
            from={{ x: 90, y: 145 }}
            to={{ x: 310, y: 155 }}
            label="ACK (ack=Y+1)"
            active={step >= 2}
            highlight={step === 2}
          />

          {/* ESTABLISHED-bånd */}
          {step >= 3 && (
            <g opacity={step === 3 ? 1 : 0.6}>
              <rect x="50" y="175" width="300" height="22" rx="11" fill="var(--success)" opacity="0.18" stroke="var(--success)" />
              <text x="200" y="190" textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">
                ESTABLISHED — bytes flyter begge veier
              </text>
            </g>
          )}

          {/* FIN-pil */}
          {step >= 4 && (
            <Arrow
              from={{ x: 90, y: 215 }}
              to={{ x: 310, y: 225 }}
              label="FIN → ACK"
              active
              highlight={step === 4}
            />
          )}
        </svg>
      </div>

      {/* Steg-info */}
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
          {current.label}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{current.detail}</p>
      </div>

      {/* Hva sidene vet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Klient vet
          </div>
          <div className="text-sm">{current.clientKnows}</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Server vet
          </div>
          <div className="text-sm">{current.serverKnows}</div>
        </div>
      </div>

      {/* Knapper */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
          disabled={isLast}
        >
          Steg fram <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setStep(0)}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}

function Arrow({
  from,
  to,
  label,
  active,
  highlight,
  reverse,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
  active: boolean;
  highlight?: boolean;
  reverse?: boolean;
}) {
  const opacity = active ? (highlight ? 1 : 0.45) : 0.1;
  const stroke = highlight ? "var(--brand)" : "currentColor";
  const arrowId = reverse ? "arrow-rev" : "arrow-fwd";
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <g opacity={opacity}>
      <defs>
        <marker
          id={`${arrowId}-${label.replace(/[^a-z0-9]/gi, "")}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
        </marker>
      </defs>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={stroke}
        strokeWidth={highlight ? 2 : 1.4}
        markerEnd={`url(#${arrowId}-${label.replace(/[^a-z0-9]/gi, "")})`}
      />
      <text
        x={midX}
        y={midY - 6}
        textAnchor="middle"
        fontSize="10.5"
        fontWeight={highlight ? 600 : 500}
        fill="currentColor"
      >
        {label}
      </text>
    </g>
  );
}
