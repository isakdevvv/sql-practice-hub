import { useEffect, useMemo, useState } from "react";
import { Mail, ArrowLeftRight } from "lucide-react";
import { OutcomeRow, Controls } from "./Section82Live";

// Levende versjon av 8.5: PGP — signert + kryptert e-post.
// To moduser:
//   * "send"    — Alice forbereder en PGP-melding til Bob:
//                 1) Hash m og signer hash med d_A → sig
//                 2) Generer engangsnøkkel K_s (session key)
//                 3) Krypter (m + sig) med AES under K_s → c
//                 4) Krypter K_s med Bobs offentlige e_B → K_enc
//                 5) Send (c, K_enc)
//   * "receive" — Bob mottar (c, K_enc):
//                 1) Dekrypter K_enc med sin private d_B → K_s
//                 2) Dekrypter c med K_s → (m, sig)
//                 3) Verifiser sig med Alices offentlige e_A

// ----------------------------------------------------------------------
// Layout — vi bruker en pipeline-visualisering, ikke nodegraf, for å vise
// rekkefølge og dataflyt klart.

type Mode = "send" | "receive";

type Step = {
  title: string;
  text: string;
  /** Hvilke pipeline-bokser som er "aktive" i dette steget. */
  active: PipeId[];
  /** Hvilke artefakter eksisterer på dette steget. */
  exists: Record<Artifact, boolean>;
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
};

type PipeId =
  | "alice-msg"
  | "hash"
  | "sign"
  | "concat"
  | "aes-enc"
  | "rsa-keywrap"
  | "send-line"
  | "rsa-keyunwrap"
  | "aes-dec"
  | "verify"
  | "bob-msg";

type Artifact = "m" | "hash" | "sig" | "ms" | "Ks" | "c" | "Kenc" | "received";

// Pipeline-bokser for SEND og RECEIVE. Hver har (x, y, w, h, label).
const PIPES_SEND: Record<PipeId, { x: number; y: number; w: number; h: number; label: string; sub?: string }> = {
  "alice-msg": { x: 20, y: 30, w: 130, h: 50, label: "m (klartekst)", sub: "«Hei Bob, …»" },
  hash: { x: 170, y: 30, w: 110, h: 50, label: "SHA-256", sub: "h = H(m)" },
  sign: { x: 300, y: 30, w: 130, h: 50, label: "RSA-sign(d_A)", sub: "sig = E_dA(h)" },
  concat: { x: 450, y: 30, w: 110, h: 50, label: "m || sig", sub: "samle" },
  "aes-enc": { x: 580, y: 30, w: 100, h: 50, label: "AES-enc(K_s)", sub: "c" },
  "rsa-keywrap": { x: 580, y: 120, w: 100, h: 50, label: "RSA-enc(e_B)", sub: "K_enc" },
  "send-line": { x: 0, y: 0, w: 0, h: 0, label: "" }, // hidden, used only as flag
  "rsa-keyunwrap": { x: 0, y: 0, w: 0, h: 0, label: "" },
  "aes-dec": { x: 0, y: 0, w: 0, h: 0, label: "" },
  verify: { x: 0, y: 0, w: 0, h: 0, label: "" },
  "bob-msg": { x: 0, y: 0, w: 0, h: 0, label: "" },
};

const PIPES_RECV: Record<PipeId, { x: number; y: number; w: number; h: number; label: string; sub?: string }> = {
  "alice-msg": { x: 0, y: 0, w: 0, h: 0, label: "" },
  hash: { x: 0, y: 0, w: 0, h: 0, label: "" },
  sign: { x: 0, y: 0, w: 0, h: 0, label: "" },
  concat: { x: 0, y: 0, w: 0, h: 0, label: "" },
  "aes-enc": { x: 0, y: 0, w: 0, h: 0, label: "" },
  "rsa-keywrap": { x: 0, y: 0, w: 0, h: 0, label: "" },
  "send-line": { x: 20, y: 30, w: 110, h: 50, label: "(c, K_enc)", sub: "mottatt" },
  "rsa-keyunwrap": { x: 150, y: 120, w: 140, h: 50, label: "RSA-dec(d_B)", sub: "K_s gjenfinnet" },
  "aes-dec": { x: 310, y: 30, w: 130, h: 50, label: "AES-dec(K_s)", sub: "m || sig" },
  verify: { x: 460, y: 30, w: 130, h: 50, label: "RSA-verify(e_A)", sub: "E_eA(sig) = H(m)?" },
  "bob-msg": { x: 610, y: 30, w: 70, h: 50, label: "m", sub: "lest" },
};

// Send-skript
const SCRIPT_SEND: Step[] = [
  {
    title: "1. Alice skriver e-posten m",
    text: "Vanlig klartekst. PGP er agnostisk — det kan være ASCII, MIME, vedlegg.",
    active: ["alice-msg"],
    exists: { m: true, hash: false, sig: false, ms: false, Ks: false, c: false, Kenc: false, received: false },
  },
  {
    title: "2. Hash meldingen med SHA-256",
    text: "h = H(m). Vi signerer hashen, ikke meldingen direkte — det er raskere, og signaturen blir alltid like stor.",
    active: ["alice-msg", "hash"],
    exists: { m: true, hash: true, sig: false, ms: false, Ks: false, c: false, Kenc: false, received: false },
  },
  {
    title: "3. Signer hashen med Alices private nøkkel d_A",
    text: "sig = RSA_dA(h). Bare Alice kan lage dette, fordi bare hun har d_A. Senere kan hvem som helst med e_A verifisere.",
    active: ["hash", "sign"],
    exists: { m: true, hash: true, sig: true, ms: false, Ks: false, c: false, Kenc: false, received: false },
    outcome: { kind: "info", text: "MERK: signering først, så kryptering. Da skjules både m og sig for Eve." },
  },
  {
    title: "4. Konkatener m og sig",
    text: "Vi setter sammen m || sig som én streng. Denne er det vi vil hemmeligholde — Eve skal ikke kunne lese hverken meldingen eller signaturen.",
    active: ["concat"],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: false, c: false, Kenc: false, received: false },
  },
  {
    title: "5. Generer engangs-sessjonsnøkkel K_s (AES-256)",
    text: "K_s er en helt fersk symmetrisk nøkkel — kun for denne e-posten. Hvorfor ikke RSA hele veien? Fordi RSA er ~1000× tregere enn AES og bare egnet til små blokker.",
    active: ["aes-enc"],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: true, c: false, Kenc: false, received: false },
  },
  {
    title: "6. AES-krypter (m || sig) med K_s → c",
    text: "c = AES_Ks(m || sig). Cipher c er stor, men beskyttet. Bob trenger K_s for å lese den.",
    active: ["aes-enc"],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: true, c: true, Kenc: false, received: false },
  },
  {
    title: "7. RSA-krypter K_s med Bobs offentlige e_B → K_enc",
    text: "K_enc = RSA_eB(K_s). Bare Bob kan dekryptere fordi bare han har d_B. Hybrid-kryptering: RSA brukes kun for nøkkel-wrapping, ikke for hele meldingen.",
    active: ["rsa-keywrap"],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: true, c: true, Kenc: true, received: false },
  },
  {
    title: "8. Send (c, K_enc) over SMTP",
    text: "Vanlig e-post på toppen. Selv om SMTP-serveren leser hele pakken, er innholdet uleselig.",
    active: [],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: true, c: true, Kenc: true, received: false },
    outcome: {
      kind: "ok",
      text: "Alice har oppnådd: konfidensialitet (AES + RSA-wrap), integritet (hash + signatur), autentisitet (signatur), og ikke-avvisning (signatur). En e-post.",
    },
  },
];

const SCRIPT_RECV: Step[] = [
  {
    title: "1. Bob mottar (c, K_enc)",
    text: "Pakken kommer i innboksen. To deler: en stor cipher c og en liten K_enc.",
    active: ["send-line"],
    exists: { m: false, hash: false, sig: false, ms: false, Ks: false, c: true, Kenc: true, received: true },
  },
  {
    title: "2. RSA-dekrypter K_enc med d_B → K_s",
    text: "K_s = RSA_dB(K_enc). Bob bruker sin private nøkkel ÉN gang for å hente ut sessjonsnøkkelen. Resten av jobben blir rask AES.",
    active: ["rsa-keyunwrap"],
    exists: { m: false, hash: false, sig: false, ms: false, Ks: true, c: true, Kenc: true, received: true },
    outcome: {
      kind: "info",
      text: "Hvis Eve hadde fanget e-posten, ville hun stoppet her — hun mangler d_B.",
    },
  },
  {
    title: "3. AES-dekrypter c med K_s → m || sig",
    text: "Nå har Bob klartekst m sammen med signaturen. Han kan lese, men han stoler ikke ennå på avsender.",
    active: ["aes-dec"],
    exists: { m: true, hash: false, sig: true, ms: true, Ks: true, c: true, Kenc: true, received: true },
  },
  {
    title: "4. Verifiser sig med Alices offentlige e_A",
    text: "Bob beregner h = SHA-256(m) og sammenligner med RSA_eA(sig). Stemmer → meldingen er ekte og kommer fra Alice. Stemmer ikke → e-posten markeres som suspekt.",
    active: ["verify"],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: true, c: true, Kenc: true, received: true },
  },
  {
    title: "5. Bob leser m og stoler på den",
    text: "Bob har fullført revers-prosessen: pakke ut K_s med d_B, dekryptere innholdet, verifisere signaturen.",
    active: ["bob-msg"],
    exists: { m: true, hash: true, sig: true, ms: true, Ks: true, c: true, Kenc: true, received: true },
    outcome: {
      kind: "ok",
      text: "Samme algoritmer som TLS bruker — men brukt asynkront, e-post-stil. PGP og S/MIME er fortsatt standarden for end-to-end-kryptert mail.",
    },
  },
];

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section85Live() {
  const [mode, setMode] = useState<Mode>("send");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = mode === "send" ? SCRIPT_SEND : SCRIPT_RECV;
  const pipes = mode === "send" ? PIPES_SEND : PIPES_RECV;
  const step = steps[stepIdx];

  useEffect(() => {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2200;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= steps.length) {
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
  }, [playing, steps.length]);

  const visiblePipes = useMemo(() => {
    return (Object.entries(pipes) as [PipeId, (typeof pipes)[PipeId]][])
      .filter(([, p]) => p.w > 0)
      .map(([id, p]) => ({ id, ...p }));
  }, [pipes]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setMode("send")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "send"
                ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-border bg-background text-muted-foreground hover:border-amber-500/40"
            }`}
          >
            <Mail className="h-3 w-3" /> Alice sender
          </button>
          <button
            onClick={() => setMode("receive")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "receive"
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-background text-muted-foreground hover:border-emerald-500/40"
            }`}
          >
            <ArrowLeftRight className="h-3 w-3" /> Bob mottar
          </button>
        </div>
      </div>

      <svg viewBox="0 0 700 200" className="w-full h-auto bg-muted/10">
        {/* Pipeline-bokser */}
        {visiblePipes.map((pipe) => {
          const isActive = step.active.includes(pipe.id);
          return (
            <g key={pipe.id} opacity={isActive ? 1 : 0.55}>
              <rect
                x={pipe.x}
                y={pipe.y}
                width={pipe.w}
                height={pipe.h}
                rx={6}
                className={
                  isActive
                    ? "fill-brand/15 stroke-brand"
                    : "fill-card stroke-muted-foreground/50"
                }
                strokeWidth={isActive ? 2 : 1.4}
              />
              <text
                x={pipe.x + pipe.w / 2}
                y={pipe.y + 22}
                textAnchor="middle"
                className={`${isActive ? "fill-foreground" : "fill-muted-foreground"} text-[10px] font-semibold`}
              >
                {pipe.label}
              </text>
              {pipe.sub && (
                <text
                  x={pipe.x + pipe.w / 2}
                  y={pipe.y + 38}
                  textAnchor="middle"
                  className={`${isActive ? "fill-muted-foreground" : "fill-muted-foreground/60"} text-[9px]`}
                >
                  {pipe.sub}
                </text>
              )}
            </g>
          );
        })}

        {/* Piler mellom bokser (statisk topologi) */}
        {mode === "send" ? (
          <>
            <Arrow from={[150, 55]} to={[170, 55]} />
            <Arrow from={[280, 55]} to={[300, 55]} />
            <Arrow from={[430, 55]} to={[450, 55]} />
            <Arrow from={[560, 55]} to={[580, 55]} />
            <Arrow from={[630, 80]} to={[630, 120]} dashed />
          </>
        ) : (
          <>
            <Arrow from={[130, 55]} to={[310, 55]} dashed />
            <Arrow from={[220, 120]} to={[220, 90]} />
            <Arrow from={[290, 110]} to={[330, 80]} />
            <Arrow from={[440, 55]} to={[460, 55]} />
            <Arrow from={[590, 55]} to={[610, 55]} />
          </>
        )}
      </svg>

      <div className="px-4 py-3 text-sm border-t border-border">
        <p className="text-muted-foreground">{step.text}</p>
        {step.outcome && <OutcomeRow outcome={step.outcome} />}
      </div>

      {/* Artefakt-panel */}
      <div className="px-4 py-2 grid gap-1.5 sm:grid-cols-4 lg:grid-cols-7 border-t border-border text-[10px]">
        <Artifact name="m" label="klartekst" exists={step.exists.m} tone="amber" />
        <Artifact name="h" label="hash" exists={step.exists.hash} tone="slate" />
        <Artifact name="sig" label="signatur" exists={step.exists.sig} tone="violet" />
        <Artifact name="m‖sig" label="samlet" exists={step.exists.ms} tone="amber" />
        <Artifact name="K_s" label="AES-nøkkel" exists={step.exists.Ks} tone="emerald" />
        <Artifact name="c" label="AES-cipher" exists={step.exists.c} tone="cyan" />
        <Artifact name="K_enc" label="wrapped key" exists={step.exists.Kenc} tone="sky" />
      </div>

      <Controls
        stepIdx={stepIdx}
        total={steps.length}
        playing={playing}
        onPrev={() => {
          setStepIdx((i) => Math.max(0, i - 1));
          setProgress(0);
        }}
        onNext={() => {
          setStepIdx((i) => Math.min(steps.length - 1, i + 1));
          setProgress(0);
        }}
        onPlay={() => setPlaying((p) => !p)}
        onReset={() => {
          setStepIdx(0);
          setProgress(0);
          setPlaying(false);
        }}
        onJump={(i) => {
          setStepIdx(i);
          setProgress(0);
        }}
        progress={progress}
      />

      {/* Hvilke nøkler brukes hvor? */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-2 border-t border-border text-[11px]">
        <div className="rounded p-2 bg-muted/20">
          <div className="font-semibold text-foreground">Alice bruker</div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li><strong>d_A</strong>: signere hashen (sig)</li>
            <li><strong>e_B</strong>: kryptere sessjonsnøkkel K_s</li>
            <li><strong>K_s</strong>: kryptere m || sig (AES)</li>
          </ul>
        </div>
        <div className="rounded p-2 bg-muted/20">
          <div className="font-semibold text-foreground">Bob bruker</div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li><strong>d_B</strong>: dekryptere K_enc → K_s</li>
            <li><strong>K_s</strong>: dekryptere c (AES) → m + sig</li>
            <li><strong>e_A</strong>: verifisere signatur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Arrow({ from, to, dashed = false }: { from: [number, number]; to: [number, number]; dashed?: boolean }) {
  return (
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      className="stroke-foreground/60"
      strokeWidth={1.5}
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd="url(#arrowhead)"
    />
  );
}

function Artifact({
  name,
  label,
  exists,
  tone,
}: {
  name: string;
  label: string;
  exists: boolean;
  tone: "amber" | "emerald" | "violet" | "slate" | "cyan" | "sky";
}) {
  const toneMap = {
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/40",
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/40",
    violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/40",
    slate: "bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-500/40",
    cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/40",
    sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/40",
  };
  return (
    <div
      className={`rounded px-1.5 py-0.5 ring-1 ${
        exists ? toneMap[tone] : "bg-muted/20 text-muted-foreground/50 ring-border"
      }`}
    >
      <div className="font-mono font-semibold">{name}</div>
      <div className="opacity-80">{label}</div>
    </div>
  );
}
