import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Tag } from "lucide-react";

// Levende seksjon 6.6 — MPLS label-switching + L3VPN
//
// Vi følger én pakke fra Customer A inn på ingress-LER, gjennom 3 LSR-er, og ut
// igjen på egress-LER til Customer A's andre site. På samme nett har vi også en
// kunde B med overlappende IP-adresser. Brukeren kan toggle "kunde-skille" for å
// se hvordan en outer-label (VPN-label) holder kunder adskilt selv om transport-
// labelen byttes hopp-for-hopp.
//
// Steg:
//   1) Pakke ankommer ingress LER fra kunde A (rå IP).
//   2) LER lookup FEC → push label X (og outer VPN-label for L3VPN-modus).
//   3) LSR 1 swap X → Y (les kun label, ikke IP).
//   4) LSR 2 swap Y → Z.
//   5) Egress LER pop label(s), lever rå IP til kundens andre site.
//
// For å vise “samme IP, ulik kunde” bruker vi 10.0.0.5 hos begge.

type StepKind = "ingress" | "swap" | "egress" | "delivered";

type Step = {
  kind: StepKind;
  /** Hvilken router er aktiv. */
  router: string;
  /** Label-stack på pakken etter at dette steget er utført. Topp = først i array. */
  stackAfter: { label: string; kind: "outer" | "transport" }[];
  /** Action-tekst i forklaringsstripe. */
  action: string;
  /** Mer detalj. */
  detail: string;
};

// Routere på sti — visualisert vannrett
type Router = {
  id: string;
  kind: "LER" | "LSR";
  label: string;
  x: number;
  y: number;
};

const ROUTERS: Router[] = [
  { id: "ler-in", kind: "LER", label: "Ingress LER\n(PE1)", x: 100, y: 220 },
  { id: "lsr-1", kind: "LSR", label: "LSR 1\n(P1)", x: 290, y: 220 },
  { id: "lsr-2", kind: "LSR", label: "LSR 2\n(P2)", x: 480, y: 220 },
  { id: "ler-out", kind: "LER", label: "Egress LER\n(PE2)", x: 670, y: 220 },
];

const CUSTOMERS: { id: string; site: string; x: number; y: number; ip: string }[] = [
  { id: "A1", site: "Kunde A — Site 1", x: 100, y: 100, ip: "10.0.0.5" },
  { id: "A2", site: "Kunde A — Site 2", x: 670, y: 100, ip: "10.0.0.5" },
  { id: "B1", site: "Kunde B — Site 1", x: 100, y: 340, ip: "10.0.0.5" },
  { id: "B2", site: "Kunde B — Site 2", x: 670, y: 340, ip: "10.0.0.5" },
];

function steps(l3vpn: boolean, customer: "A" | "B"): Step[] {
  const vpnLabel = customer === "A" ? "vA42" : "vB17";
  // To labels per kunde — ulik transport-label på hver kunde-flow også, slik at vi ser at de er adskilt.
  const tCustomer = customer === "A" ? ["L101", "L202", "L303"] : ["L501", "L602", "L703"];
  const outer = l3vpn
    ? [{ label: vpnLabel, kind: "outer" as const }]
    : [];

  const stack0: { label: string; kind: "outer" | "transport" }[] = []; // rå IP
  const stack1 = [...outer, { label: tCustomer[0], kind: "transport" as const }];
  const stack2 = [...outer, { label: tCustomer[1], kind: "transport" as const }];
  const stack3 = [...outer, { label: tCustomer[2], kind: "transport" as const }];
  const stack4 = outer; // bare VPN-label igjen (penultimate hop pop ofte fjerner transport)
  const stack5: { label: string; kind: "outer" | "transport" }[] = []; // rå IP til kunden

  void stack0;

  return [
    {
      kind: "ingress",
      router: "ler-in",
      stackAfter: stack1,
      action: `Ingress LER: klassifiser pakka (FEC), PUSH label ${tCustomer[0]}${l3vpn ? ` + VPN-label ${vpnLabel}` : ""}`,
      detail: l3vpn
        ? `LER kjenner igjen pakka som tilhørende kunde ${customer}'s VRF, legger på VPN-label ${vpnLabel} for å identifisere kunden og transport-label ${tCustomer[0]} for første hopp. To labels totalt — VPN-label "innerst", transport-label "ytterst" (på toppen).`
        : `LER slår opp destinasjonen i FEC-tabellen og legger på transport-label ${tCustomer[0]}. Innenfor MPLS-domenet ser ingen router på IP-headeren igjen.`,
    },
    {
      kind: "swap",
      router: "lsr-1",
      stackAfter: stack2,
      action: `LSR 1: SWAP ${tCustomer[0]} → ${tCustomer[1]} (label-switching)`,
      detail: `LSR 1 leser toppen av label-stacken (${tCustomer[0]}), slår opp i sin LFIB (label forwarding information base), og bytter den ut med ${tCustomer[1]} basert på ut-porten. Ingen IP-lookup — bare label-swap.`,
    },
    {
      kind: "swap",
      router: "lsr-2",
      stackAfter: stack3,
      action: `LSR 2: SWAP ${tCustomer[1]} → ${tCustomer[2]}`,
      detail: `Samme prinsipp: les label, slå opp, bytt. Dette er hvorfor MPLS-forwarding er så kjapp — én label-lookup vs flere IP-prefix-matches.`,
    },
    {
      kind: l3vpn ? "swap" : "egress",
      router: "ler-out",
      stackAfter: stack4,
      action: l3vpn
        ? `Egress LER: POP transport-label, behold VPN-label ${vpnLabel}`
        : `Egress LER: POP transport-label, lever rå IP-pakke`,
      detail: l3vpn
        ? `Egress LER ser at neste skritt er ut til kunde ${customer}'s site. Transport-label fjernes (penultimate hop popping ville gjort dette på forrige hopp i ekte nett). VPN-label er fortsatt der så LER vet hvilken VRF pakka tilhører.`
        : `Egress LER popper transport-label og leverer den rå IP-pakka til kunden — som om MPLS-domenet aldri hadde eksistert.`,
    },
    {
      kind: "delivered",
      router: "ler-out",
      stackAfter: stack5,
      action: l3vpn
        ? `Egress LER: slå opp ${vpnLabel} i kunde ${customer}'s VRF, POP, lever til kunde ${customer} site 2`
        : `Levert til ${customer === "A" ? "A2" : "B2"}`,
      detail: l3vpn
        ? `Selv om begge kundene har 10.0.0.5, holder VPN-label-en dem adskilt: LER vet at ${vpnLabel} = kunde ${customer}'s VRF, og leverer kun til kunde ${customer}'s site 2. Kunde B's 10.0.0.5 er en helt annen maskin.`
        : `Pakka leveres rått ut til kundens andre site. I et nett uten L3VPN ville to kunder med samme IP ikke kunne dele LER — derfor er L3VPN nyttig.`,
    },
  ];
}

export function Section66Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [l3vpn, setL3vpn] = useState(true);
  const [customer, setCustomer] = useState<"A" | "B">("A");
  const [progress, setProgress] = useState(0);

  const STEPS = useMemo(() => steps(l3vpn, customer), [l3vpn, customer]);
  const step = STEPS[stepIdx];

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2600;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, STEPS.length]);

  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  // Pakke-posisjon
  const router = ROUTERS.find((r) => r.id === step.router)!;
  const prevRouter =
    stepIdx === 0
      ? CUSTOMERS.find((c) => c.id === (customer === "A" ? "A1" : "B1"))!
      : ROUTERS.find((r) => r.id === STEPS[stepIdx - 1].router)!;
  const px = prevRouter.x + (router.x - prevRouter.x) * progress;
  const py = prevRouter.y + (router.y - prevRouter.y) * progress;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.action}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      {/* Mode-toggles */}
      <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap items-center gap-3 text-xs">
        <label className="inline-flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={l3vpn}
            onChange={(e) => {
              setL3vpn(e.target.checked);
              reset();
            }}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">L3VPN-modus (push VPN-label)</span>
        </label>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Aktiv kunde:</span>
          <button
            onClick={() => {
              setCustomer("A");
              reset();
            }}
            className={`rounded px-2 py-1 text-xs border ${
              customer === "A"
                ? "border-brand bg-brand/10 text-brand font-medium"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            Kunde A
          </button>
          <button
            onClick={() => {
              setCustomer("B");
              reset();
            }}
            className={`rounded px-2 py-1 text-xs border ${
              customer === "B"
                ? "border-amber-500 bg-amber-500/10 text-amber-600 font-medium"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            Kunde B
          </button>
        </div>
        {l3vpn && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            Begge kunder har <span className="font-mono text-foreground">10.0.0.5</span> — VPN-label
            holder dem adskilt.
          </span>
        )}
      </div>

      {/* SVG-topologi */}
      <svg viewBox="0 0 800 440" className="w-full h-auto bg-muted/5">
        {/* MPLS-domene-bakgrunn */}
        <rect
          x={70}
          y={180}
          width={650}
          height={80}
          rx={6}
          className="fill-brand/5 stroke-brand/30"
          strokeDasharray="4 4"
        />
        <text x={395} y={175} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
          MPLS-domene — label-forwarding kun, ingen IP-lookup
        </text>

        {/* Kabler mellom routere */}
        {ROUTERS.map((r, i) => {
          if (i === ROUTERS.length - 1) return null;
          const next = ROUTERS[i + 1];
          return (
            <line
              key={r.id}
              x1={r.x + 28}
              y1={r.y}
              x2={next.x - 28}
              y2={next.y}
              className="stroke-muted-foreground/40"
              strokeWidth={2}
            />
          );
        })}

        {/* Kunde-tilkoblinger */}
        {CUSTOMERS.map((c) => {
          const linkedRouter = ROUTERS.find((r) =>
            c.id.endsWith("1") ? r.id === "ler-in" : r.id === "ler-out",
          )!;
          const isActive =
            (customer === "A" && (c.id === "A1" || c.id === "A2")) ||
            (customer === "B" && (c.id === "B1" || c.id === "B2"));
          return (
            <g key={c.id}>
              <line
                x1={c.x}
                y1={c.y + 18}
                x2={linkedRouter.x}
                y2={linkedRouter.y - 22}
                className={
                  isActive ? "stroke-brand" : "stroke-muted-foreground/30"
                }
                strokeWidth={isActive ? 1.5 : 1}
                strokeDasharray={isActive ? "" : "3 3"}
              />
              <rect
                x={c.x - 60}
                y={c.y - 18}
                width={120}
                height={36}
                rx={4}
                className={
                  isActive
                    ? customer === "A"
                      ? "fill-card stroke-brand"
                      : "fill-card stroke-amber-500"
                    : "fill-card stroke-border"
                }
                strokeWidth={1.5}
              />
              <text
                x={c.x}
                y={c.y - 4}
                textAnchor="middle"
                className={`text-[10px] font-semibold ${
                  isActive
                    ? customer === "A"
                      ? "fill-brand"
                      : "fill-amber-500"
                    : "fill-muted-foreground"
                }`}
              >
                {c.site}
              </text>
              <text x={c.x} y={c.y + 10} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
                {c.ip}
              </text>
            </g>
          );
        })}

        {/* Routere */}
        {ROUTERS.map((r) => (
          <g key={r.id}>
            <rect
              x={r.x - 38}
              y={r.y - 22}
              width={76}
              height={44}
              rx={6}
              className={`fill-card ${
                r.kind === "LER" ? "stroke-purple-500" : "stroke-brand"
              }`}
              strokeWidth={1.8}
            />
            {r.label.split("\n").map((line, i) => (
              <text
                key={i}
                x={r.x}
                y={r.y - 4 + i * 12}
                textAnchor="middle"
                className={`text-[10px] font-semibold ${
                  r.kind === "LER" ? "fill-purple-500" : "fill-brand"
                }`}
              >
                {line}
              </text>
            ))}
          </g>
        ))}

        {/* Animasjon: pakka beveger seg */}
        <PacketWithStack
          x={px}
          y={py}
          stack={
            stepIdx === 0 && progress < 0.6
              ? [] // før push: rå IP
              : step.stackAfter
          }
          ip={CUSTOMERS.find((c) => c.id === (customer === "A" ? "A1" : "B1"))!.ip}
          customer={customer}
        />

        {/* Forklarings-tekst nederst */}
        <text x={400} y={420} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
          {step.action}
        </text>
      </svg>

      {/* Detalj */}
      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.detail}
      </div>

      {/* Label-tabell */}
      <div className="px-4 py-2 border-t border-border bg-muted/10">
        <div className="text-xs font-semibold mb-1.5">Label-stack akkurat nå</div>
        <div className="flex items-center gap-1 flex-wrap">
          {step.stackAfter.length === 0 && (
            <span className="text-[11px] text-muted-foreground italic">
              (ingen labels — rå IP)
            </span>
          )}
          {step.stackAfter.map((l, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono ${
                l.kind === "outer"
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                  : "bg-brand/15 text-brand border border-brand/40"
              }`}
            >
              <Tag className="h-3 w-3" />
              {l.label}
              <span className="text-[9px] uppercase opacity-70">{l.kind === "outer" ? "VPN" : "transport"}</span>
            </span>
          ))}
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-[11px] font-mono bg-muted text-muted-foreground border border-border">
            IP {CUSTOMERS.find((c) => c.id === (customer === "A" ? "A1" : "B1"))!.ip} (innerst)
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => {
            setStepIdx((i) => Math.max(0, i - 1));
            setProgress(0);
          }}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <SkipBack className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Spill av"}
        </button>
        <button
          onClick={() => {
            setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
            setProgress(0);
          }}
          disabled={stepIdx === STEPS.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <div className="flex gap-1 ml-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-5 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PacketWithStack({
  x,
  y,
  stack,
  ip,
  customer,
}: {
  x: number;
  y: number;
  stack: { label: string; kind: "outer" | "transport" }[];
  ip: string;
  customer: "A" | "B";
}) {
  // Pakke: serie av små rektangler — øverste label til venstre, IP-blob til høyre
  const w = 28;
  const ipW = 64;
  const totalW = stack.length * w + ipW;
  const startX = x - totalW / 2;
  return (
    <g>
      {stack.map((l, i) => (
        <g key={i}>
          <rect
            x={startX + i * w}
            y={y - 12}
            width={w}
            height={24}
            rx={2}
            className={
              l.kind === "outer"
                ? "fill-amber-500 stroke-amber-600"
                : "fill-brand stroke-brand"
            }
            fillOpacity={0.9}
          />
          <text
            x={startX + i * w + w / 2}
            y={y + 4}
            textAnchor="middle"
            className="fill-background text-[8px] font-bold font-mono"
          >
            {l.label}
          </text>
        </g>
      ))}
      <rect
        x={startX + stack.length * w}
        y={y - 12}
        width={ipW}
        height={24}
        rx={2}
        className={customer === "A" ? "fill-purple-500 stroke-purple-500" : "fill-orange-500 stroke-orange-500"}
        fillOpacity={0.85}
      />
      <text
        x={startX + stack.length * w + ipW / 2}
        y={y + 4}
        textAnchor="middle"
        className="fill-background text-[9px] font-bold font-mono"
      >
        IP {ip}
      </text>
    </g>
  );
}
