import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Interaktiv visualisering av seksjon 3.3 — UDP.
// To paneler:
//   1) UDP-header (8 bytes) lagt ved siden av TCP-header (20+ bytes) for å vise
//      forskjellen i kompleksitet. Hover/klikk på felt for forklaring.
//   2) DNS-oppslag: klient sender en spørring (én pakke), server svarer (én pakke).
//      Total: 1 RTT, ingen handshake. Animasjon viser tidslinjen.

type Tab = "header" | "dns";

export function Section32Live() {
  const [tab, setTab] = useState<Tab>("header");
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/30">
        <TabBtn active={tab === "header"} onClick={() => setTab("header")}>
          UDP-header vs TCP-header
        </TabBtn>
        <TabBtn active={tab === "dns"} onClick={() => setTab("dns")}>
          DNS-oppslag på UDP
        </TabBtn>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Klikk på felt for forklaring · Spill av tidslinjen i DNS-fanen
        </span>
      </div>

      {tab === "header" && <HeaderPanel />}
      {tab === "dns" && <DnsPanel />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand/15 text-brand"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// PANEL 1: UDP-header vs TCP-header
// ============================================================

type FieldId =
  | "udp-src"
  | "udp-dst"
  | "udp-len"
  | "udp-chk"
  | "udp-data"
  | "tcp-src"
  | "tcp-dst"
  | "tcp-seq"
  | "tcp-ack"
  | "tcp-flags"
  | "tcp-win"
  | "tcp-chk"
  | "tcp-urg"
  | "tcp-opt"
  | "tcp-data";

const FIELD_INFO: Record<FieldId, { name: string; bytes: string; body: string }> = {
  "udp-src": {
    name: "Source port",
    bytes: "2 bytes (16 bits)",
    body: "Avsenderens portnummer. Valgfritt i UDP — kan settes til 0 hvis svaret ikke forventes (eks. ren broadcast). Brukes typisk av server til å finne hvor svaret skal tilbake.",
  },
  "udp-dst": {
    name: "Destination port",
    bytes: "2 bytes (16 bits)",
    body: "Mottakerens portnummer. Dette er det eneste feltet demultiplekseren MÅ ha — den slår opp i socket-tabellen (dest-IP, dest-port) for å finne riktig lytter.",
  },
  "udp-len": {
    name: "Length",
    bytes: "2 bytes (16 bits)",
    body: "Total lengde på UDP-datagrammet i bytes: header + data. Minimum 8 (tom payload), maks 65535. Litt redundant siden IP-headeren også har lengde — ble tatt med fordi UDP var ment å være selvstendig.",
  },
  "udp-chk": {
    name: "Checksum",
    bytes: "2 bytes (16 bits)",
    body: "16-bits one's-complement-sum over pseudo-header (kilde-IP, dest-IP, protokoll, UDP-lengde) + UDP-header + data. Frivillig på IPv4 (kan være 0), obligatorisk på IPv6. Detekterer feil, korrigerer ikke.",
  },
  "udp-data": {
    name: "Data (payload)",
    bytes: "0–65527 bytes",
    body: "Selve applikasjonsdataene. UDP bevarer melding-grenser — hvert sendto() blir én pakke. Mottaker får hele meldingen eller ingenting; aldri en halv.",
  },
  "tcp-src": {
    name: "Source port",
    bytes: "2 bytes",
    body: "Som UDP. Men obligatorisk — TCP-demultiplekseren bruker 4-tuppel.",
  },
  "tcp-dst": {
    name: "Destination port",
    bytes: "2 bytes",
    body: "Som UDP. Del av 4-tuppelen.",
  },
  "tcp-seq": {
    name: "Sequence number",
    bytes: "4 bytes (32 bits)",
    body: "Byte-offset for første byte i denne segmentet. Hjertet i pålitelighet og rekkefølge. UDP har ingen tilsvarende — derfor kan UDP-pakker komme i feil rekkefølge.",
  },
  "tcp-ack": {
    name: "Acknowledgment",
    bytes: "4 bytes (32 bits)",
    body: "«Jeg har mottatt alle bytes opp til (men ikke inkludert) dette nummeret.» Kumulativ ACK. UDP har ikke ACK — sender vet aldri om noe kom fram.",
  },
  "tcp-flags": {
    name: "Flags",
    bytes: "1 byte",
    body: "SYN, ACK, FIN, RST, PSH, URG. Styrer forbindelses-livssyklus. UDP har ingen flags — er forbindelsesløs.",
  },
  "tcp-win": {
    name: "Window size",
    bytes: "2 bytes",
    body: "rwnd — ledig plass i mottakers buffer. Driver flow control. UDP har ingen flow control; sender kan oversvømme mottaker.",
  },
  "tcp-chk": {
    name: "Checksum",
    bytes: "2 bytes",
    body: "Tilsvarende UDP. Pseudo-header + TCP-header + data.",
  },
  "tcp-urg": {
    name: "Urgent pointer",
    bytes: "2 bytes",
    body: "Peker til ende av «haste-data». I praksis nesten ubrukt.",
  },
  "tcp-opt": {
    name: "Options",
    bytes: "0–40 bytes",
    body: "MSS, Window Scale, SACK, Timestamps. Forhandles ved handshake. UDP har ingen opsjoner.",
  },
  "tcp-data": {
    name: "Data (payload)",
    bytes: "0–MSS bytes (~1460)",
    body: "Bytestrøm-fragment. TCP bevarer ikke melding-grenser — recv() kan returnere halve meldinger.",
  },
};

function HeaderPanel() {
  const [picked, setPicked] = useState<FieldId>("udp-dst");
  const info = FIELD_INFO[picked];

  return (
    <div className="p-4 space-y-4 text-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            UDP — 8 bytes header
          </div>
          <UdpHeaderGrid picked={picked} onPick={setPicked} />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Fire 16-bits felt. Det er hele headeren. Etter checksum kommer applikasjonsdata direkte.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            TCP — 20+ bytes header
          </div>
          <TcpHeaderGrid picked={picked} onPick={setPicked} />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Minst 20 bytes — opp til 60 med opsjoner. To og en halv ganger så stor for samme jobb,
            men gir til gjengjeld pålitelig, ordnet, flow- og congestion-kontrollert strøm.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-foreground">{info.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{info.bytes}</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">{info.body}</p>
      </div>

      <div className="rounded-md border border-dashed border-border p-3 text-[12px] text-muted-foreground">
        <span className="font-semibold text-foreground">Poenget:</span> UDP-headeren har akkurat det
        som trengs for å levere pakken til riktig socket (dest-port) og oppdage korrupsjon (checksum).
        Alt annet — pålitelighet, ordnet leveranse, flow/congestion control — er applikasjonens ansvar
        (eller utelatt helt). Det er hvorfor UDP er rask, men ubeskyttet.
      </div>
    </div>
  );
}

function UdpHeaderGrid({
  picked,
  onPick,
}: {
  picked: FieldId;
  onPick: (f: FieldId) => void;
}) {
  // Grid: 2 columns × 16 bits per kolonne, 2 rader for headeren + 1 rad for data.
  // Vi tegner med SVG for kontroll.
  const W = 360;
  const ROW_H = 32;
  const cellW = W / 2;
  const fields: Array<{ id: FieldId; row: number; col: 0 | 1; label: string }> = [
    { id: "udp-src", row: 0, col: 0, label: "Source port" },
    { id: "udp-dst", row: 0, col: 1, label: "Dest port" },
    { id: "udp-len", row: 1, col: 0, label: "Length" },
    { id: "udp-chk", row: 1, col: 1, label: "Checksum" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${ROW_H * 3 + 18}`} className="w-full h-auto">
      {/* bit-akse */}
      <g>
        {[0, 16, 32].map((b, i) => (
          <text
            key={b}
            x={i === 2 ? W : (b / 32) * W}
            y={10}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            className="fill-muted-foreground text-[9px] font-mono"
          >
            {b}
          </text>
        ))}
      </g>
      {fields.map((f) => (
        <HeaderCell
          key={f.id}
          x={f.col * cellW}
          y={14 + f.row * ROW_H}
          w={cellW}
          h={ROW_H}
          label={f.label}
          fieldId={f.id}
          picked={picked === f.id}
          onPick={() => onPick(f.id)}
          tone="udp"
        />
      ))}
      {/* Data-rad */}
      <HeaderCell
        x={0}
        y={14 + 2 * ROW_H}
        w={W}
        h={ROW_H}
        label="Data (payload)"
        fieldId="udp-data"
        picked={picked === "udp-data"}
        onPick={() => onPick("udp-data")}
        tone="data"
      />
    </svg>
  );
}

function TcpHeaderGrid({
  picked,
  onPick,
}: {
  picked: FieldId;
  onPick: (f: FieldId) => void;
}) {
  const W = 360;
  const ROW_H = 24;
  const cellW = W / 2;
  // Forenklet TCP-header layout
  const rows: Array<
    | { kind: "split"; left: { id: FieldId; label: string }; right: { id: FieldId; label: string } }
    | { kind: "full"; id: FieldId; label: string }
    | { kind: "three"; cells: Array<{ id: FieldId; label: string; weight: number }> }
  > = [
    {
      kind: "split",
      left: { id: "tcp-src", label: "Source port" },
      right: { id: "tcp-dst", label: "Dest port" },
    },
    { kind: "full", id: "tcp-seq", label: "Sequence number" },
    { kind: "full", id: "tcp-ack", label: "Acknowledgment number" },
    {
      kind: "three",
      cells: [
        { id: "tcp-flags", label: "Flags", weight: 1 },
        { id: "tcp-win", label: "Window", weight: 1 },
      ],
    },
    {
      kind: "split",
      left: { id: "tcp-chk", label: "Checksum" },
      right: { id: "tcp-urg", label: "Urgent ptr" },
    },
    { kind: "full", id: "tcp-opt", label: "Options (0–40 B)" },
    { kind: "full", id: "tcp-data", label: "Data (payload)" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${ROW_H * rows.length + 18}`} className="w-full h-auto">
      <g>
        {[0, 16, 32].map((b, i) => (
          <text
            key={b}
            x={i === 2 ? W : (b / 32) * W}
            y={10}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            className="fill-muted-foreground text-[9px] font-mono"
          >
            {b}
          </text>
        ))}
      </g>
      {rows.map((r, idx) => {
        const y = 14 + idx * ROW_H;
        if (r.kind === "split") {
          return (
            <g key={idx}>
              <HeaderCell
                x={0}
                y={y}
                w={cellW}
                h={ROW_H}
                label={r.left.label}
                fieldId={r.left.id}
                picked={picked === r.left.id}
                onPick={() => onPick(r.left.id)}
                tone="tcp"
              />
              <HeaderCell
                x={cellW}
                y={y}
                w={cellW}
                h={ROW_H}
                label={r.right.label}
                fieldId={r.right.id}
                picked={picked === r.right.id}
                onPick={() => onPick(r.right.id)}
                tone="tcp"
              />
            </g>
          );
        }
        if (r.kind === "three") {
          const total = r.cells.reduce((a, c) => a + c.weight, 0);
          let acc = 0;
          return (
            <g key={idx}>
              {r.cells.map((c) => {
                const w = (c.weight / total) * W;
                const x = acc;
                acc += w;
                return (
                  <HeaderCell
                    key={c.id}
                    x={x}
                    y={y}
                    w={w}
                    h={ROW_H}
                    label={c.label}
                    fieldId={c.id}
                    picked={picked === c.id}
                    onPick={() => onPick(c.id)}
                    tone="tcp"
                  />
                );
              })}
            </g>
          );
        }
        return (
          <HeaderCell
            key={idx}
            x={0}
            y={y}
            w={W}
            h={ROW_H}
            label={r.label}
            fieldId={r.id}
            picked={picked === r.id}
            onPick={() => onPick(r.id)}
            tone={r.id === "tcp-data" ? "data" : "tcp"}
          />
        );
      })}
    </svg>
  );
}

function HeaderCell({
  x,
  y,
  w,
  h,
  label,
  fieldId,
  picked,
  onPick,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fieldId: FieldId;
  picked: boolean;
  onPick: () => void;
  tone: "udp" | "tcp" | "data";
}) {
  void fieldId;
  const fill =
    tone === "udp"
      ? picked
        ? "fill-cyan-500/25"
        : "fill-cyan-500/10"
      : tone === "tcp"
        ? picked
          ? "fill-amber-500/25"
          : "fill-amber-500/10"
        : picked
          ? "fill-muted-foreground/20"
          : "fill-muted-foreground/5";
  const stroke =
    tone === "udp"
      ? picked
        ? "stroke-cyan-600"
        : "stroke-cyan-500/50"
      : tone === "tcp"
        ? picked
          ? "stroke-amber-600"
          : "stroke-amber-500/50"
        : picked
          ? "stroke-muted-foreground"
          : "stroke-muted-foreground/30";
  return (
    <g style={{ cursor: "pointer" }} onClick={onPick}>
      <rect
        x={x + 0.5}
        y={y + 0.5}
        width={w - 1}
        height={h - 1}
        rx={3}
        className={`${fill} ${stroke}`}
        strokeWidth={picked ? 2 : 1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        className={`text-[10px] font-medium ${
          picked ? "fill-foreground" : "fill-foreground/70"
        }`}
      >
        {label}
      </text>
    </g>
  );
}

// ============================================================
// PANEL 2: DNS-oppslag på UDP
// ============================================================

type DnsStep = {
  title: string;
  body: string;
  /** Hvor er pakken i forhold til klient (0) og server (1)? null = ingen pakke i lufta. */
  pos: number | null;
  /** Hva slags pakke vises */
  kind: "none" | "query" | "response";
  /** Tidsmerke for tidslinjen (ms) */
  t: number;
};

const DNS_STEPS: DnsStep[] = [
  {
    title: "Start: klient vil slå opp nrk.no",
    body: "Klienten (din maskin, 10.0.0.50) trenger IP-adressen til nrk.no. Den åpner en UDP-socket på en ephemeral port, f.eks. 51234, og lager en DNS-spørringspakke på ca. 30 bytes: header (12 B) + spørsmål («A nrk.no IN»). Ingen handshake. Ingen forbindelse å åpne.",
    pos: null,
    kind: "none",
    t: 0,
  },
  {
    title: "Klient → server: spørring sendes",
    body: "UDP-header settes på: src=51234, dst=53, length=58, checksum. IP-laget pakker det inn med (src=10.0.0.50, dst=8.8.8.8). Sendt. Total tid på klienten: < 1 ms.",
    pos: 0.5,
    kind: "query",
    t: 5,
  },
  {
    title: "Server mottar og slår opp",
    body: "DNS-server 8.8.8.8 mottar UDP-pakken på port 53, leser spørsmålet, slår opp i sin sone-fil eller cache, og finner svaret: nrk.no = 195.88.55.16. Behandlingstid: ~1 ms ved cache-treff.",
    pos: 1,
    kind: "query",
    t: 30,
  },
  {
    title: "Server → klient: svar sendes",
    body: "Server bygger en svarpakke: kopierer spørsmålet og legger til svar-sekjon. UDP-header: src=53, dst=51234. Sendes tilbake direkte — ingen forbindelse å lukke.",
    pos: 0.5,
    kind: "response",
    t: 35,
  },
  {
    title: "Klient mottar svaret",
    body: "Klienten leser pakken på sin ephemeral-port 51234 (UDP demuxer på 2-tuppelen (10.0.0.50, 51234)). Den parser DNS-svaret og leverer IP-adressen til appen som kalte gethostbyname(). Total: 1 RTT, ingen setup, ingen teardown.",
    pos: 0,
    kind: "response",
    t: 60,
  },
  {
    title: "Sammenligning: hvis dette hadde vært TCP",
    body: "Med TCP måtte vi først bruke 1 RTT på 3-veis handshake (SYN/SYN-ACK/ACK), så 1 RTT på selve oppslaget, og til slutt 4 segmenter for å lukke (FIN/ACK/FIN/ACK). Total: minst 2 RTT + bokføring. For en webside med 30 ulike hosts blir det 30 ekstra RTT bare på DNS. UDP er åpenbart valg.",
    pos: null,
    kind: "none",
    t: 60,
  },
];

function DnsPanel() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = DNS_STEPS[stepIdx];
  const nextStep = DNS_STEPS[Math.min(stepIdx + 1, DNS_STEPS.length - 1)];

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 1600;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const np = p + dt * SPEED;
        if (np >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= DNS_STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return np;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Pakke-posisjon: interpolér fra step.pos til nextStep.pos basert på progress.
  const packetPos = useMemo(() => {
    if (step.pos === null) return null;
    const from = step.pos;
    const to = nextStep.pos ?? step.pos;
    return from + (to - from) * progress;
  }, [step.pos, nextStep.pos, progress]);

  function go(delta: number) {
    setStepIdx((i) => Math.max(0, Math.min(DNS_STEPS.length - 1, i + delta)));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  return (
    <div>
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {DNS_STEPS.length}
          {" · t ≈ "}
          {step.t}
          {" ms"}
        </span>
      </div>

      <svg viewBox="0 0 800 280" className="w-full h-auto bg-muted/10">
        {/* Klient */}
        <EndpointBox x={20} y={60} label="Klient" sub="10.0.0.50:51234" tone="brand" />
        {/* Server */}
        <EndpointBox
          x={620}
          y={60}
          label="DNS-server"
          sub="8.8.8.8:53"
          tone="success"
          align="right"
        />

        {/* Lenkelinje */}
        <line
          x1={180}
          y1={100}
          x2={620}
          y2={100}
          className="stroke-muted-foreground/40"
          strokeWidth={2}
          strokeDasharray="5 4"
        />

        {/* Tidslinje under */}
        <line
          x1={40}
          y1={220}
          x2={760}
          y2={220}
          className="stroke-muted-foreground/40"
          strokeWidth={1}
        />
        {DNS_STEPS.map((s, i) => {
          const x = 40 + (s.t / 60) * 720;
          const active = i <= stepIdx;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={216}
                x2={x}
                y2={224}
                className={active ? "stroke-foreground" : "stroke-muted-foreground/40"}
                strokeWidth={1.5}
              />
              {(i === 0 || i === 4 || i === 5) && (
                <text
                  x={x}
                  y={240}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  {s.t} ms
                </text>
              )}
            </g>
          );
        })}
        <text
          x={40}
          y={210}
          className="fill-muted-foreground text-[9px] font-semibold uppercase"
        >
          tidslinje
        </text>

        {/* Pakke i lufta */}
        {packetPos !== null && step.kind !== "none" && (
          <Packet
            x={180 + packetPos * (620 - 180)}
            y={100}
            kind={step.kind}
          />
        )}

        {/* Side-pile-indikatorer (statiske) — viser hvilken retning som er aktiv */}
        <text
          x={400}
          y={70}
          textAnchor="middle"
          className={`text-[10px] font-semibold ${
            step.kind === "query"
              ? "fill-brand"
              : step.kind === "response"
                ? "fill-success"
                : "fill-muted-foreground/40"
          }`}
        >
          {step.kind === "query"
            ? "→ DNS-spørring (UDP src=51234, dst=53)"
            : step.kind === "response"
              ? "← DNS-svar (UDP src=53, dst=51234)"
              : "(ingen pakke i lufta)"}
        </text>

        {/* TCP-sammenligning på siste steg */}
        {step.kind === "none" && stepIdx === DNS_STEPS.length - 1 && (
          <g transform="translate(60, 130)">
            <rect
              x={0}
              y={0}
              width={680}
              height={60}
              rx={4}
              className="fill-amber-500/10 stroke-amber-500/50"
              strokeWidth={1}
            />
            <text x={340} y={18} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
              TCP-versjon (kontrast)
            </text>
            <text x={340} y={34} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">
              SYN → SYN-ACK → ACK | Spørring → Svar | FIN → ACK → FIN → ACK
            </text>
            <text x={340} y={50} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              ≈ 2 RTT + setup/teardown. Mot 1 RTT for UDP.
            </text>
          </g>
        )}
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.body}
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => go(-1)}
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
          onClick={() => go(1)}
          disabled={stepIdx === DNS_STEPS.length - 1}
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
        <div className="ml-2 flex gap-1">
          {DNS_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-3 rounded-full ${
                i === stepIdx
                  ? "bg-brand"
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EndpointBox({
  x,
  y,
  label,
  sub,
  tone,
  align = "left",
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: "brand" | "success";
  align?: "left" | "right";
}) {
  const w = 160;
  const h = 80;
  void align;
  const stroke = tone === "brand" ? "stroke-brand" : "stroke-success";
  const fill = tone === "brand" ? "fill-brand/10" : "fill-success/10";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        className={`${fill} ${stroke}`}
        strokeWidth={1.5}
      />
      <text x={x + w / 2} y={y + 26} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        {label}
      </text>
      <text x={x + w / 2} y={y + 44} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">
        {sub}
      </text>
      <circle
        cx={x + w}
        cy={y + h / 2}
        r={5}
        className={tone === "brand" ? "fill-brand stroke-background" : "fill-success stroke-background"}
        strokeWidth={1.5}
      />
    </g>
  );
}

function Packet({
  x,
  y,
  kind,
}: {
  x: number;
  y: number;
  kind: "query" | "response";
}) {
  const color = kind === "query" ? "fill-brand stroke-background" : "fill-success stroke-background";
  const label = kind === "query" ? "DNS Q" : "DNS R";
  return (
    <g>
      <rect
        x={x - 28}
        y={y - 12}
        width={56}
        height={24}
        rx={4}
        className={color}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className="fill-background text-[10px] font-semibold pointer-events-none"
      >
        {label}
      </text>
    </g>
  );
}
