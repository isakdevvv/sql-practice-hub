// Original SVG figures for the Python chapter pages.
// Every figure here is hand-drawn from scratch using the same theme tokens
// (--brand, --success, --warning, --muted, etc.) as the rest of the app's
// visual library. Concepts depicted are universal CS idioms — control-flow
// flowcharts, list cells, call stacks, binary trees — drawn in our own style.

import type { FC } from "react";

const STROKE = "currentColor";

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      {children}
    </figcaption>
  );
}

/* =====================================================================
 * KAP. 4 — VALG (if / elif / else)
 * ===================================================================*/

export const IfElseFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      {/* Start */}
      <ellipse cx="180" cy="22" rx="34" ry="14" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="180" y="26" textAnchor="middle" className="text-[10px] fill-current font-mono">start</text>
      <line x1="180" y1="36" x2="180" y2="60" stroke={STROKE} markerEnd="url(#arr-ie)" />
      {/* Decision diamond */}
      <polygon points="180,60 250,100 180,140 110,100" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="180" y="104" textAnchor="middle" className="text-[11px] fill-current font-mono">x &gt; 0?</text>
      {/* True branch */}
      <line x1="250" y1="100" x2="300" y2="100" stroke={STROKE} markerEnd="url(#arr-ie)" />
      <text x="262" y="92" className="text-[9px] fill-current opacity-80">True</text>
      <rect x="300" y="80" width="50" height="40" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="325" y="105" textAnchor="middle" className="text-[10px] fill-current font-mono">positiv</text>
      {/* False branch */}
      <line x1="110" y1="100" x2="60" y2="100" stroke={STROKE} markerEnd="url(#arr-ie)" />
      <text x="78" y="92" className="text-[9px] fill-current opacity-80">False</text>
      <rect x="10" y="80" width="50" height="40" fill="color-mix(in oklch, var(--warning) 18%, transparent)" stroke={STROKE} />
      <text x="35" y="105" textAnchor="middle" className="text-[10px] fill-current font-mono">null/neg</text>
      {/* Join */}
      <line x1="325" y1="120" x2="325" y2="180" stroke={STROKE} />
      <line x1="35" y1="120" x2="35" y2="180" stroke={STROKE} />
      <line x1="35" y1="180" x2="325" y2="180" stroke={STROKE} />
      <line x1="180" y1="180" x2="180" y2="210" stroke={STROKE} markerEnd="url(#arr-ie)" />
      <ellipse cx="180" cy="222" rx="34" ry="14" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="180" y="226" textAnchor="middle" className="text-[10px] fill-current font-mono">slutt</text>
      <defs>
        <marker id="arr-ie" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Flytdiagram for et if/else — bare én av greinene kjører.</Caption>
  </figure>
);

export const TruthTable: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 170" className="w-full max-w-md mx-auto text-foreground">
      {/* Header row */}
      {["A", "B", "A and B", "A or B", "not A"].map((h, i) => (
        <g key={h}>
          <rect x={10 + i * 60} y={10} width={60} height={28} fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x={40 + i * 60} y={28} textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">{h}</text>
        </g>
      ))}
      {/* Data rows */}
      {[
        ["T", "T", "T", "T", "F"],
        ["T", "F", "F", "T", "F"],
        ["F", "T", "F", "T", "T"],
        ["F", "F", "F", "F", "T"],
      ].map((row, r) => (
        <g key={r}>
          {row.map((cell, c) => (
            <g key={c}>
              <rect
                x={10 + c * 60}
                y={38 + r * 30}
                width={60}
                height={30}
                fill={cell === "T" ? "color-mix(in oklch, var(--success) 12%, transparent)" : "color-mix(in oklch, var(--muted) 40%, transparent)"}
                stroke={STROKE}
              />
              <text
                x={40 + c * 60}
                y={58 + r * 30}
                textAnchor="middle"
                className={`text-[11px] fill-current font-mono ${cell === "T" ? "font-semibold" : "opacity-60"}`}
              >
                {cell}
              </text>
            </g>
          ))}
        </g>
      ))}
    </svg>
    <Caption>Sannhetstabell for <code>and</code>, <code>or</code> og <code>not</code>.</Caption>
  </figure>
);

export const ComparisonOps: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
      {[
        { op: "==", desc: "lik", ex: "3 == 3", res: "True" },
        { op: "!=", desc: "ulik", ex: "3 != 4", res: "True" },
        { op: "<", desc: "mindre enn", ex: "3 < 4", res: "True" },
        { op: ">=", desc: "større/lik", ex: "4 >= 4", res: "True" },
      ].map((row, i) => (
        <g key={row.op}>
          <rect x="10" y={10 + i * 38} width="60" height="32" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x="40" y={31 + i * 38} textAnchor="middle" className="text-[12px] fill-current font-mono font-semibold">{row.op}</text>
          <text x="80" y={31 + i * 38} className="text-[11px] fill-current">{row.desc}</text>
          <rect x="170" y={10 + i * 38} width="100" height="32" fill="color-mix(in oklch, var(--muted) 30%, transparent)" stroke={STROKE} />
          <text x="220" y={31 + i * 38} textAnchor="middle" className="text-[11px] fill-current font-mono">{row.ex}</text>
          <text x="280" y={31 + i * 38} className="text-[11px] fill-current font-mono text-emerald-500">→ {row.res}</text>
        </g>
      ))}
    </svg>
    <Caption>Sammenligningsoperatorene returnerer alltid <code>True</code> eller <code>False</code>.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 5 — LØKKER (while / for / break / continue)
 * ===================================================================*/

export const WhileFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <ellipse cx="180" cy="22" rx="34" ry="14" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="180" y="26" textAnchor="middle" className="text-[10px] fill-current font-mono">start</text>
      <line x1="180" y1="36" x2="180" y2="58" stroke={STROKE} markerEnd="url(#arr-w)" />
      <polygon points="180,60 250,95 180,130 110,95" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="180" y="99" textAnchor="middle" className="text-[10px] fill-current font-mono">betingelse?</text>
      <line x1="250" y1="95" x2="310" y2="95" stroke={STROKE} markerEnd="url(#arr-w)" />
      <text x="266" y="86" className="text-[9px] fill-current">False</text>
      <ellipse cx="335" cy="95" rx="22" ry="14" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="335" y="99" textAnchor="middle" className="text-[9px] fill-current font-mono">slutt</text>
      <line x1="180" y1="130" x2="180" y2="155" stroke={STROKE} markerEnd="url(#arr-w)" />
      <text x="192" y="146" className="text-[9px] fill-current">True</text>
      <rect x="120" y="155" width="120" height="32" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="175" textAnchor="middle" className="text-[11px] fill-current font-mono">kjør kroppen</text>
      {/* loop back */}
      <path d="M 120 171 Q 40 171 40 95 Q 40 60 110 60" fill="none" stroke={STROKE} markerEnd="url(#arr-w)" />
      <defs>
        <marker id="arr-w" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption><code>while</code>: kropp kjører så lenge betingelsen evaluerer til <code>True</code>.</Caption>
  </figure>
);

export const ForRangeStrip: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 130" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="22" className="text-[11px] fill-current font-mono">for i in range(5):</text>
      {[0, 1, 2, 3, 4].map((n, i) => (
        <g key={n}>
          <rect
            x={10 + i * 66}
            y={36}
            width={60}
            height={40}
            fill="color-mix(in oklch, var(--brand) 15%, transparent)"
            stroke={STROKE}
          />
          <text x={40 + i * 66} y={60} textAnchor="middle" className="text-[11px] fill-current font-mono">iter {i}</text>
          <text x={40 + i * 66} y={92} textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">i = {n}</text>
          {i < 4 && (
            <line
              x1={70 + i * 66}
              y1={56}
              x2={76 + i * 66}
              y2={56}
              stroke={STROKE}
              markerEnd="url(#arr-fr)"
            />
          )}
        </g>
      ))}
      <text x="10" y="120" className="text-[10px] fill-current opacity-70 font-mono">range(start=0, stop=5, step=1) → 0,1,2,3,4 (stop er eksklusiv)</text>
      <defs>
        <marker id="arr-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Iterasjon over <code>range(5)</code> — 5 gjennomløp, <code>i</code> tar verdiene 0..4.</Caption>
  </figure>
);

export const BreakContinue: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* loop body box */}
      <rect x="20" y="20" width="320" height="160" fill="color-mix(in oklch, var(--muted) 18%, transparent)" stroke={STROKE} strokeDasharray="4 3" />
      <text x="30" y="35" className="text-[10px] fill-current font-mono opacity-80">for x in data:</text>
      {/* statement 1 */}
      <rect x="40" y="48" width="280" height="26" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="65" className="text-[10px] fill-current font-mono">behandle x</text>
      {/* continue arrow back to top */}
      <path d="M 40 100 Q 10 100 10 60 Q 10 35 30 35" fill="none" stroke={STROKE} markerEnd="url(#arr-bc)" />
      <text x="0" y="55" className="text-[9px] fill-current opacity-80">continue</text>
      {/* statement that may continue */}
      <rect x="40" y="86" width="280" height="26" fill="color-mix(in oklch, var(--warning) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="103" className="text-[10px] fill-current font-mono">if hopp_over: continue</text>
      {/* statement that may break */}
      <rect x="40" y="124" width="280" height="26" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="141" className="text-[10px] fill-current font-mono">if ferdig: break</text>
      {/* break arrow exiting */}
      <path d="M 320 137 L 348 137" fill="none" stroke={STROKE} markerEnd="url(#arr-bc)" />
      <text x="324" y="130" className="text-[9px] fill-current opacity-80">break</text>
      <defs>
        <marker id="arr-bc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption><code>continue</code> hopper til neste iterasjon; <code>break</code> hopper helt ut av løkka.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 6 — FUNKSJONER
 * ===================================================================*/

export const FunctionCallDiagram: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Caller block */}
      <rect x="10" y="20" width="150" height="60" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <text x="20" y="38" className="text-[10px] fill-current font-mono opacity-80">kaller</text>
      <text x="20" y="58" className="text-[11px] fill-current font-mono">svar = sum(3, 4)</text>
      {/* Callee block */}
      <rect x="200" y="20" width="150" height="100" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
      <text x="210" y="38" className="text-[10px] fill-current font-mono opacity-80">def sum(a, b):</text>
      <text x="220" y="60" className="text-[11px] fill-current font-mono">a = 3</text>
      <text x="220" y="78" className="text-[11px] fill-current font-mono">b = 4</text>
      <text x="220" y="100" className="text-[11px] fill-current font-mono">return a + b</text>
      {/* call arrow */}
      <path d="M 160 45 L 200 45" stroke={STROKE} markerEnd="url(#arr-fc)" />
      <text x="165" y="38" className="text-[9px] fill-current">kall</text>
      {/* return arrow */}
      <path d="M 200 100 L 160 100" stroke={STROKE} markerEnd="url(#arr-fc)" />
      <text x="160" y="93" className="text-[9px] fill-current">return 7</text>
      {/* Result back in caller */}
      <text x="20" y="100" className="text-[11px] fill-current font-mono">svar == 7</text>
      <text x="10" y="170" className="text-[10px] fill-current opacity-80">Argumenter (3, 4) blir til parametre (a, b). Returverdi erstatter selve kallet.</text>
      <defs>
        <marker id="arr-fc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Funksjonskall: argumenter bindes til parametre, returverdien tas tilbake.</Caption>
  </figure>
);

export const ScopeDiagram: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Global scope */}
      <rect x="10" y="10" width="340" height="180" fill="color-mix(in oklch, var(--brand) 5%, transparent)" stroke={STROKE} strokeDasharray="4 3" />
      <text x="20" y="28" className="text-[10px] fill-current font-mono opacity-80">globalt scope</text>
      <text x="20" y="48" className="text-[11px] fill-current font-mono">total = 0</text>
      {/* Local scope inside */}
      <rect x="30" y="60" width="320" height="120" fill="color-mix(in oklch, var(--success) 10%, transparent)" stroke={STROKE} />
      <text x="40" y="78" className="text-[10px] fill-current font-mono opacity-80">lokalt scope: def regn(x):</text>
      <text x="50" y="100" className="text-[11px] fill-current font-mono">y = x * 2</text>
      <text x="50" y="120" className="text-[11px] fill-current font-mono">total = total + y  # NameError uten 'global'</text>
      <text x="50" y="140" className="text-[11px] fill-current font-mono opacity-70"># y finnes bare her inne</text>
      <text x="50" y="165" className="text-[10px] fill-current opacity-80">⟵ lokal variabel <code>y</code> dør når funksjonen returnerer</text>
    </svg>
    <Caption>Lokale variabler eksisterer kun i sin egen ramme. Globale leses fritt, men endring krever <code>global</code>.</Caption>
  </figure>
);

export const CallStackGrowth: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {[
        { label: "main", x: 20 },
        { label: "main → a()", x: 130 },
        { label: "main → a() → b()", x: 240 },
      ].map((col, i) => (
        <g key={col.label}>
          <text x={col.x + 50} y={18} textAnchor="middle" className="text-[10px] fill-current opacity-80">{col.label}</text>
          {/* frames bottom-up */}
          {i >= 0 && (
            <g>
              <rect x={col.x} y={170} width={100} height={36} fill="color-mix(in oklch, var(--muted) 40%, transparent)" stroke={STROKE} />
              <text x={col.x + 50} y={192} textAnchor="middle" className="text-[11px] fill-current font-mono">main</text>
            </g>
          )}
          {i >= 1 && (
            <g>
              <rect x={col.x} y={130} width={100} height={36} fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
              <text x={col.x + 50} y={152} textAnchor="middle" className="text-[11px] fill-current font-mono">a()</text>
            </g>
          )}
          {i >= 2 && (
            <g>
              <rect x={col.x} y={90} width={100} height={36} fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
              <text x={col.x + 50} y={112} textAnchor="middle" className="text-[11px] fill-current font-mono">b()</text>
            </g>
          )}
        </g>
      ))}
      <line x1="10" y1="206" x2="350" y2="206" stroke={STROKE} />
      <text x="180" y="218" textAnchor="middle" className="text-[10px] fill-current opacity-80">tid → (rammer push'es på når funksjoner kalles)</text>
    </svg>
    <Caption>Kallstacken vokser oppover for hvert nested kall, og krymper igjen ved <code>return</code>.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 7 — OBJEKTER & KLASSER
 * ===================================================================*/

export const ClassAnatomy: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      <rect x="20" y="10" width="320" height="200" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} />
      <text x="30" y="30" className="text-[12px] fill-current font-mono font-semibold">class Hund:</text>
      {/* __init__ */}
      <rect x="40" y="42" width="290" height="56" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="60" className="text-[10px] fill-current font-mono opacity-80">konstruktør (__init__)</text>
      <text x="50" y="76" className="text-[11px] fill-current font-mono">def __init__(self, navn):</text>
      <text x="60" y="92" className="text-[11px] fill-current font-mono">self.navn = navn  # attributt</text>
      {/* method */}
      <rect x="40" y="108" width="290" height="56" fill="color-mix(in oklch, var(--warning) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="126" className="text-[10px] fill-current font-mono opacity-80">metode</text>
      <text x="50" y="142" className="text-[11px] fill-current font-mono">def bjeff(self):</text>
      <text x="60" y="158" className="text-[11px] fill-current font-mono">return f"&#123;self.navn&#125; sier voff!"</text>
      <text x="40" y="184" className="text-[10px] fill-current opacity-80">Hund er en mal. <code>r = Hund("Rex")</code> lager en instans.</text>
      <text x="40" y="200" className="text-[10px] fill-current opacity-80">Instans har sin egen <code>self.navn</code>.</text>
    </svg>
    <Caption>Anatomi av en klasse: konstruktør setter attributter, metoder bruker dem.</Caption>
  </figure>
);

export const InstanceVsClass: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* class blueprint */}
      <rect x="10" y="20" width="120" height="100" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="70" y="40" textAnchor="middle" className="text-[12px] fill-current font-mono font-semibold">class Hund</text>
      <text x="70" y="60" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">malen</text>
      <text x="70" y="84" textAnchor="middle" className="text-[10px] fill-current">attributter: navn</text>
      <text x="70" y="102" textAnchor="middle" className="text-[10px] fill-current">metoder: bjeff()</text>
      {/* arrows */}
      <line x1="130" y1="60" x2="200" y2="40" stroke={STROKE} markerEnd="url(#arr-ic)" />
      <line x1="130" y1="80" x2="200" y2="100" stroke={STROKE} markerEnd="url(#arr-ic)" />
      <line x1="130" y1="100" x2="200" y2="160" stroke={STROKE} markerEnd="url(#arr-ic)" />
      {/* instances */}
      {[
        { y: 22, name: "Rex" },
        { y: 82, name: "Bella" },
        { y: 142, name: "Buddy" },
      ].map((inst) => (
        <g key={inst.name}>
          <rect x={210} y={inst.y} width={140} height={42} fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
          <text x={280} y={inst.y + 18} textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">instans</text>
          <text x={280} y={inst.y + 35} textAnchor="middle" className="text-[11px] fill-current font-mono">navn = "{inst.name}"</text>
        </g>
      ))}
      <defs>
        <marker id="arr-ic" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Én klasse, mange instanser — hver med sine egne attributtverdier.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 8 — STRENGER
 * ===================================================================*/

export const StringIndex: FC = () => {
  const s = "Python";
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 160" className="w-full max-w-md mx-auto text-foreground">
        {[...s].map((ch, i) => (
          <g key={i}>
            <rect x={20 + i * 50} y={50} width={50} height={50} fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
            <text x={45 + i * 50} y={82} textAnchor="middle" className="text-[18px] fill-current font-mono">{ch}</text>
            <text x={45 + i * 50} y={42} textAnchor="middle" className="text-[10px] fill-current opacity-80">{i}</text>
            <text x={45 + i * 50} y={120} textAnchor="middle" className="text-[10px] fill-current opacity-60">{i - s.length}</text>
          </g>
        ))}
        <text x="20" y="35" className="text-[10px] fill-current opacity-80">indeks (fra venstre):</text>
        <text x="20" y="140" className="text-[10px] fill-current opacity-60">indeks (fra høyre):</text>
        <text x="20" y="155" className="text-[10px] fill-current">s[0] == "P" · s[-1] == "n" · s[1:4] == "yth"</text>
      </svg>
      <Caption>Strenger har to indekseringer: positiv fra venstre, negativ fra høyre.</Caption>
    </figure>
  );
};

export const SliceDiagram: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 130" className="w-full max-w-md mx-auto text-foreground">
      {/* tick marks 0..6 between letters of HELLO */}
      {["H", "E", "L", "L", "O"].map((ch, i) => (
        <g key={i}>
          <rect x={40 + i * 50} y={40} width={50} height={40} fill="color-mix(in oklch, var(--muted) 30%, transparent)" stroke={STROKE} />
          <text x={65 + i * 50} y={67} textAnchor="middle" className="text-[16px] fill-current font-mono">{ch}</text>
        </g>
      ))}
      {/* slice tick positions: 0..5 (boundaries) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1={40 + i * 50} y1={30} x2={40 + i * 50} y2={92} stroke={STROKE} strokeDasharray="2 2" />
          <text x={40 + i * 50} y={26} textAnchor="middle" className="text-[10px] fill-current opacity-80">{i}</text>
        </g>
      ))}
      {/* slice highlight 1..4 */}
      <rect x="90" y="38" width="150" height="44" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke="var(--success)" strokeWidth="1.5" />
      <text x="165" y="110" textAnchor="middle" className="text-[11px] fill-current font-mono">"HELLO"[1:4] == "ELL"</text>
    </svg>
    <Caption>Slicing bruker tick-posisjoner mellom tegnene: start inkluderes, stopp ekskluderes.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 9 — GUI (TKINTER)
 * ===================================================================*/

export const WidgetTree: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* root */}
      <rect x="130" y="10" width="100" height="36" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="180" y="32" textAnchor="middle" className="text-[11px] fill-current font-mono">Tk() root</text>
      <line x1="160" y1="46" x2="80" y2="78" stroke={STROKE} />
      <line x1="200" y1="46" x2="280" y2="78" stroke={STROKE} />
      {/* mid level */}
      <rect x="30" y="80" width="100" height="36" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="80" y="102" textAnchor="middle" className="text-[11px] fill-current font-mono">Frame</text>
      <rect x="230" y="80" width="100" height="36" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="280" y="102" textAnchor="middle" className="text-[11px] fill-current font-mono">Frame</text>
      {/* leaves */}
      <line x1="60" y1="116" x2="40" y2="150" stroke={STROKE} />
      <line x1="100" y1="116" x2="120" y2="150" stroke={STROKE} />
      <line x1="260" y1="116" x2="240" y2="150" stroke={STROKE} />
      <line x1="300" y1="116" x2="320" y2="150" stroke={STROKE} />
      {["Label", "Entry", "Button", "Listbox"].map((w, i) => {
        const xs = [10, 90, 210, 290];
        return (
          <g key={w}>
            <rect x={xs[i]} y={150} width={60} height={32} fill="color-mix(in oklch, var(--warning) 20%, transparent)" stroke={STROKE} />
            <text x={xs[i] + 30} y={170} textAnchor="middle" className="text-[10px] fill-current font-mono">{w}</text>
          </g>
        );
      })}
    </svg>
    <Caption>Et GUI er et tre av widgets — hver widget er barn av et annet.</Caption>
  </figure>
);

export const EventLoop: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      <circle cx="180" cy="100" r="70" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} strokeDasharray="4 3" />
      <text x="180" y="35" textAnchor="middle" className="text-[10px] fill-current opacity-80">event-løkke</text>
      {/* 4 phases as labels around */}
      {[
        { x: 180, y: 60, label: "1. vent på event" },
        { x: 245, y: 100, label: "2. dispatch" },
        { x: 180, y: 145, label: "3. kjør handler" },
        { x: 115, y: 100, label: "4. tegn på nytt" },
      ].map((p) => (
        <text key={p.label} x={p.x} y={p.y} textAnchor="middle" className="text-[10px] fill-current font-mono">{p.label}</text>
      ))}
      {/* round arrows */}
      <path d="M 220 65 A 60 60 0 0 1 220 135" stroke={STROKE} fill="none" markerEnd="url(#arr-el)" />
      <path d="M 140 135 A 60 60 0 0 1 140 65" stroke={STROKE} fill="none" markerEnd="url(#arr-el)" />
      <defs>
        <marker id="arr-el" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <text x="180" y="190" textAnchor="middle" className="text-[10px] fill-current opacity-80">mainloop() kjører dette i evig sirkel til vinduet lukkes.</text>
    </svg>
    <Caption>GUI-programmer er event-drevne: hovedløkken venter på input og kaller handlere.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 10 — LISTER
 * ===================================================================*/

export const ListBoxes: FC = () => {
  const items = [10, 20, 30, 40];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 130" className="w-full max-w-md mx-auto text-foreground">
        <text x="20" y="22" className="text-[11px] fill-current font-mono">tall = [10, 20, 30, 40]</text>
        {items.map((v, i) => (
          <g key={i}>
            <rect x={20 + i * 80} y={40} width={70} height={50} fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
            <text x={55 + i * 80} y={70} textAnchor="middle" className="text-[14px] fill-current font-mono">{v}</text>
            <text x={55 + i * 80} y={108} textAnchor="middle" className="text-[10px] fill-current opacity-80">indeks {i}</text>
          </g>
        ))}
      </svg>
      <Caption>En liste er en ordnet sekvens. <code>tall[0] == 10</code>, <code>tall[-1] == 40</code>.</Caption>
    </figure>
  );
};

export const AliasingDiagram: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* heap object */}
      <rect x="170" y="60" width="170" height="60" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="78" className="text-[10px] fill-current opacity-80">heap-objekt</text>
      <g fontFamily="monospace" className="text-[12px] fill-current">
        <text x="190" y="105">[1, 2, 3, 99]</text>
      </g>
      {/* two variables */}
      <rect x="10" y="30" width="70" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="45" y="48" textAnchor="middle" className="text-[11px] fill-current font-mono">a</text>
      <rect x="10" y="120" width="70" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="45" y="138" textAnchor="middle" className="text-[11px] fill-current font-mono">b</text>
      <path d="M 80 44 Q 130 60 170 80" fill="none" stroke={STROKE} markerEnd="url(#arr-al)" />
      <path d="M 80 134 Q 130 120 170 100" fill="none" stroke={STROKE} markerEnd="url(#arr-al)" />
      <text x="20" y="180" className="text-[10px] fill-current opacity-80">a = [1,2,3]; b = a; b.append(99) — begge ser endringen</text>
      <defs>
        <marker id="arr-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Aliasing: to navn på samme listeobjekt. Endring via det ene navnet ses av det andre.</Caption>
  </figure>
);

export const ListMethods: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {[
        { m: "append(x)", e: "[1,2] → [1,2,x]" },
        { m: "insert(i,x)", e: "[1,2] → [x,1,2] (i=0)" },
        { m: "pop()", e: "[1,2,3] → [1,2] (returnerer 3)" },
        { m: "remove(x)", e: "[1,2,3] → [1,3] (x=2)" },
        { m: "len(lst)", e: "[1,2,3] → 3" },
      ].map((row, i) => (
        <g key={row.m}>
          <rect x="10" y={10 + i * 36} width="120" height="30" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
          <text x="70" y={30 + i * 36} textAnchor="middle" className="text-[11px] fill-current font-mono">{row.m}</text>
          <rect x="140" y={10 + i * 36} width="210" height="30" fill="color-mix(in oklch, var(--muted) 30%, transparent)" stroke={STROKE} />
          <text x="245" y={30 + i * 36} textAnchor="middle" className="text-[11px] fill-current font-mono">{row.e}</text>
        </g>
      ))}
    </svg>
    <Caption>De vanligste listemetodene. Alle muterer listen direkte (bortsett fra <code>len</code>).</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 11 — MULTIDIMENSJONALE LISTER
 * ===================================================================*/

export const Grid2D: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="20" className="text-[11px] fill-current font-mono">grid = [[1,2,3], [4,5,6], [7,8,9]]</text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => {
          const v = r * 3 + c + 1;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={70 + c * 60}
                y={40 + r * 50}
                width={56}
                height={46}
                fill="color-mix(in oklch, var(--brand) 15%, transparent)"
                stroke={STROKE}
              />
              <text x={98 + c * 60} y={65 + r * 50} textAnchor="middle" className="text-[14px] fill-current font-mono">{v}</text>
              <text x={98 + c * 60} y={80 + r * 50} textAnchor="middle" className="text-[9px] fill-current opacity-70">[{r}][{c}]</text>
            </g>
          );
        })
      )}
      {/* labels */}
      <text x="40" y="65" className="text-[10px] fill-current opacity-80">rad 0</text>
      <text x="40" y="115" className="text-[10px] fill-current opacity-80">rad 1</text>
      <text x="40" y="165" className="text-[10px] fill-current opacity-80">rad 2</text>
      <text x="98" y="200" textAnchor="middle" className="text-[10px] fill-current opacity-80">kol 0</text>
      <text x="158" y="200" textAnchor="middle" className="text-[10px] fill-current opacity-80">kol 1</text>
      <text x="218" y="200" textAnchor="middle" className="text-[10px] fill-current opacity-80">kol 2</text>
    </svg>
    <Caption>En 2D-liste er en liste av lister. <code>grid[rad][kol]</code> plukker ett element.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 12 — ARV & POLYMORFI
 * ===================================================================*/

export const InheritanceTree: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      <rect x="140" y="10" width="80" height="36" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="180" y="32" textAnchor="middle" className="text-[12px] fill-current font-mono">Dyr</text>
      <line x1="180" y1="46" x2="80" y2="90" stroke={STROKE} markerEnd="url(#arr-ih)" />
      <line x1="180" y1="46" x2="280" y2="90" stroke={STROKE} markerEnd="url(#arr-ih)" />
      <rect x="30" y="90" width="100" height="36" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="80" y="112" textAnchor="middle" className="text-[12px] fill-current font-mono">Hund(Dyr)</text>
      <rect x="230" y="90" width="100" height="36" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="280" y="112" textAnchor="middle" className="text-[12px] fill-current font-mono">Katt(Dyr)</text>
      <line x1="80" y1="126" x2="50" y2="170" stroke={STROKE} markerEnd="url(#arr-ih)" />
      <line x1="80" y1="126" x2="110" y2="170" stroke={STROKE} markerEnd="url(#arr-ih)" />
      <rect x="5" y="170" width="90" height="32" fill="color-mix(in oklch, var(--warning) 20%, transparent)" stroke={STROKE} />
      <text x="50" y="190" textAnchor="middle" className="text-[11px] fill-current font-mono">Puddel</text>
      <rect x="80" y="170" width="90" height="32" fill="color-mix(in oklch, var(--warning) 20%, transparent)" stroke={STROKE} />
      <text x="125" y="190" textAnchor="middle" className="text-[11px] fill-current font-mono">Schäfer</text>
      <defs>
        <marker id="arr-ih" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Arvshierarki: hver subklasse arver attributter og metoder fra superklassen.</Caption>
  </figure>
);

export const MethodOverride: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="10" width="160" height="86" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <text x="20" y="30" className="text-[11px] fill-current font-mono font-semibold">class Dyr:</text>
      <text x="30" y="50" className="text-[11px] fill-current font-mono">def lyd(self):</text>
      <text x="40" y="68" className="text-[11px] fill-current font-mono">return "..."</text>
      <text x="30" y="86" className="text-[10px] fill-current opacity-80">(default)</text>

      <line x1="170" y1="50" x2="200" y2="50" stroke={STROKE} markerEnd="url(#arr-ov)" />
      <text x="175" y="42" className="text-[9px] fill-current">override</text>

      <rect x="200" y="10" width="150" height="86" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="210" y="30" className="text-[11px] fill-current font-mono font-semibold">class Hund(Dyr):</text>
      <text x="220" y="50" className="text-[11px] fill-current font-mono">def lyd(self):</text>
      <text x="230" y="68" className="text-[11px] fill-current font-mono">return "voff"</text>

      <rect x="10" y="120" width="340" height="64" fill="color-mix(in oklch, var(--muted) 30%, transparent)" stroke={STROKE} />
      <text x="20" y="140" className="text-[11px] fill-current font-mono">h = Hund(); h.lyd()  →  "voff"</text>
      <text x="20" y="160" className="text-[10px] fill-current opacity-80">Hund.lyd skygger over Dyr.lyd for instanser av Hund.</text>
      <defs>
        <marker id="arr-ov" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>En metode i subklassen overstyrer (overrider) den med samme navn i superklassen.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 13 — FILER & UNNTAK
 * ===================================================================*/

export const FileLifecycle: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {[
        { label: "open()", x: 20, c: "brand" },
        { label: "read() / write()", x: 110, c: "success" },
        { label: "close()", x: 260, c: "warning" },
      ].map((s, i) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y={60}
            width={i === 1 ? 130 : 80}
            height={50}
            fill={`hsl(var(--${s.c}) / 0.18)`}
            stroke={STROKE}
          />
          <text
            x={s.x + (i === 1 ? 65 : 40)}
            y={90}
            textAnchor="middle"
            className="text-[11px] fill-current font-mono"
          >
            {s.label}
          </text>
          {i < 2 && (
            <line
              x1={s.x + (i === 1 ? 130 : 80) + 2}
              y1={85}
              x2={s.x + (i === 1 ? 130 : 80) + 18}
              y2={85}
              stroke={STROKE}
              markerEnd="url(#arr-fl)"
            />
          )}
        </g>
      ))}
      <text x="20" y="40" className="text-[10px] fill-current opacity-80">f = open("data.txt", "r")</text>
      <text x="20" y="135" className="text-[10px] fill-current opacity-80">data = f.read()</text>
      <text x="20" y="155" className="text-[10px] fill-current opacity-80">f.close()</text>
      <text x="20" y="180" className="text-[10px] fill-current">Bruker du <code>with open(...) as f:</code> kalles <code>close()</code> automatisk.</text>
      <defs>
        <marker id="arr-fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>En fil må åpnes, brukes, og lukkes. <code>with</code>-blokk håndterer det automatisk.</Caption>
  </figure>
);

export const TryExceptFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <rect x="20" y="10" width="320" height="60" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
      <text x="30" y="30" className="text-[10px] fill-current font-mono opacity-80">try:</text>
      <text x="40" y="52" className="text-[11px] fill-current font-mono">x = int(brukerinput)  # kan kaste ValueError</text>
      <line x1="180" y1="70" x2="180" y2="90" stroke={STROKE} markerEnd="url(#arr-te)" />
      {/* split */}
      <line x1="180" y1="90" x2="80" y2="115" stroke={STROKE} markerEnd="url(#arr-te)" />
      <line x1="180" y1="90" x2="280" y2="115" stroke={STROKE} markerEnd="url(#arr-te)" />
      <rect x="20" y="115" width="130" height="60" fill="color-mix(in oklch, var(--muted) 30%, transparent)" stroke={STROKE} />
      <text x="85" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-80">ingen feil</text>
      <text x="85" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono">fortsett</text>
      <rect x="210" y="115" width="130" height="60" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" stroke={STROKE} />
      <text x="275" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-80">except ValueError:</text>
      <text x="275" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono">vis feilmelding</text>
      <line x1="85" y1="175" x2="180" y2="210" stroke={STROKE} />
      <line x1="275" y1="175" x2="180" y2="210" stroke={STROKE} />
      <ellipse cx="180" cy="220" rx="40" ry="14" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="180" y="224" textAnchor="middle" className="text-[10px] fill-current font-mono">finally</text>
      <defs>
        <marker id="arr-te" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Try/except: hvis koden i <code>try</code> kaster et unntak, hopper kjøringen til matchende <code>except</code>.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 14 — TUPLER, SETS, DICTS
 * ===================================================================*/

export const TupleVsList: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
      {/* list */}
      <rect x="20" y="20" width="150" height="120" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <text x="95" y="40" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">list (muterbar)</text>
      <text x="95" y="65" textAnchor="middle" className="text-[11px] fill-current font-mono">[1, 2, 3]</text>
      <text x="95" y="90" textAnchor="middle" className="text-[10px] fill-current opacity-80">.append(4)</text>
      <text x="95" y="108" textAnchor="middle" className="text-[10px] fill-current opacity-80">.pop()</text>
      <text x="95" y="128" textAnchor="middle" className="text-[10px] fill-current opacity-80">lst[0] = 99 ✓</text>

      {/* tuple */}
      <rect x="190" y="20" width="150" height="120" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
      <text x="265" y="40" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">tuple (immutabel)</text>
      <text x="265" y="65" textAnchor="middle" className="text-[11px] fill-current font-mono">(1, 2, 3)</text>
      <text x="265" y="90" textAnchor="middle" className="text-[10px] fill-current opacity-80">— ingen append</text>
      <text x="265" y="108" textAnchor="middle" className="text-[10px] fill-current opacity-80">— ingen pop</text>
      <text x="265" y="128" textAnchor="middle" className="text-[10px] fill-current opacity-80">t[0] = 99 ✗ TypeError</text>

      <text x="180" y="165" textAnchor="middle" className="text-[10px] fill-current opacity-80">Tupler kan brukes som dict-nøkler; lister kan ikke.</text>
    </svg>
    <Caption>Tupler er lister som er fastsydd: rekkefølgen er bevart, men ingenting kan endres etterpå.</Caption>
  </figure>
);

export const SetOps: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 160" className="w-full max-w-md mx-auto text-foreground">
      <defs>
        <clipPath id="setA"><circle cx="130" cy="80" r="50" /></clipPath>
        <clipPath id="setB"><circle cx="220" cy="80" r="50" /></clipPath>
      </defs>
      {/* Intersection */}
      <circle cx="130" cy="80" r="50" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <circle cx="220" cy="80" r="50" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <g clipPath="url(#setA)"><circle cx="220" cy="80" r="50" fill="color-mix(in oklch, var(--success) 50%, transparent)" /></g>
      <text x="105" y="84" textAnchor="middle" className="text-[11px] fill-current font-mono">A</text>
      <text x="245" y="84" textAnchor="middle" className="text-[11px] fill-current font-mono">B</text>
      <text x="175" y="84" textAnchor="middle" className="text-[10px] fill-current font-mono">A ∩ B</text>
      {/* legends */}
      <text x="20" y="30" className="text-[11px] fill-current font-mono">{"{1,2,3} | {2,3,4} == {1,2,3,4}"}</text>
      <text x="20" y="142" className="text-[11px] fill-current font-mono">{"{1,2,3} & {2,3,4} == {2,3}"}</text>
      <text x="20" y="155" className="text-[10px] fill-current opacity-80">| = union · &amp; = snitt · - = differanse</text>
    </svg>
    <Caption>Sets er uordnede samlinger av unike elementer, med matematiske mengdeoperasjoner.</Caption>
  </figure>
);

export const DictStructure: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      <text x="20" y="22" className="text-[11px] fill-current font-mono">priser = {"{ \"eple\": 12, \"banan\": 8, \"melk\": 25 }"}</text>
      {[
        { k: "\"eple\"", v: "12" },
        { k: "\"banan\"", v: "8" },
        { k: "\"melk\"", v: "25" },
      ].map((row, i) => (
        <g key={row.k}>
          <rect x={20} y={40 + i * 42} width={120} height={36} fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
          <text x={80} y={62 + i * 42} textAnchor="middle" className="text-[11px] fill-current font-mono">{row.k}</text>
          <line x1={140} y1={58 + i * 42} x2={170} y2={58 + i * 42} stroke={STROKE} markerEnd="url(#arr-d)" />
          <rect x={170} y={40 + i * 42} width={80} height={36} fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
          <text x={210} y={62 + i * 42} textAnchor="middle" className="text-[11px] fill-current font-mono">{row.v}</text>
        </g>
      ))}
      <text x="20" y="190" className="text-[10px] fill-current opacity-80">priser["eple"] → 12 (O(1) oppslag via hash av nøkkelen)</text>
      <defs>
        <marker id="arr-d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>En dict mapper nøkler til verdier. Oppslag og oppdatering er konstant tid.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 19 — REKURSJON
 * ===================================================================*/

export const RecursionStack: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <text x="20" y="20" className="text-[11px] fill-current font-mono">def fak(n): return 1 if n == 0 else n * fak(n-1)</text>
      {[
        { label: "fak(3) → 3 * fak(2)", y: 200 },
        { label: "fak(2) → 2 * fak(1)", y: 160 },
        { label: "fak(1) → 1 * fak(0)", y: 120 },
        { label: "fak(0) → 1  (base case)", y: 80 },
      ].map((row, i) => (
        <g key={row.label}>
          <rect
            x="40"
            y={row.y}
            width="280"
            height="32"
            fill={
              i === 3 ? "color-mix(in oklch, var(--success) 22%, transparent)" : "color-mix(in oklch, var(--brand) 15%, transparent)"
            }
            stroke={STROKE}
          />
          <text x="180" y={row.y + 20} textAnchor="middle" className="text-[11px] fill-current font-mono">{row.label}</text>
        </g>
      ))}
      <text x="40" y="56" className="text-[10px] fill-current opacity-80">stacken vokser nedover →</text>
    </svg>
    <Caption>Hvert rekursivt kall legger en ny ramme på stacken. Base case stopper veksten.</Caption>
  </figure>
);

export const RecursionTree: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* fib(4) tree */}
      <g fontFamily="monospace" className="text-[10px] fill-current">
        {[
          { x: 170, y: 20, label: "fib(4)" },
          { x: 90, y: 70, label: "fib(3)" },
          { x: 250, y: 70, label: "fib(2)" },
          { x: 50, y: 120, label: "fib(2)" },
          { x: 130, y: 120, label: "fib(1)" },
          { x: 210, y: 120, label: "fib(1)" },
          { x: 290, y: 120, label: "fib(0)" },
          { x: 20, y: 170, label: "fib(1)" },
          { x: 80, y: 170, label: "fib(0)" },
        ].map((n) => (
          <g key={`${n.x}-${n.y}`}>
            <rect x={n.x - 28} y={n.y - 12} width={56} height={22} fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
            <text x={n.x} y={n.y + 4} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </g>
      {/* edges */}
      {[
        [170, 30, 90, 60],
        [170, 30, 250, 60],
        [90, 80, 50, 110],
        [90, 80, 130, 110],
        [250, 80, 210, 110],
        [250, 80, 290, 110],
        [50, 130, 20, 160],
        [50, 130, 80, 160],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} />
      ))}
      <text x="180" y="210" textAnchor="middle" className="text-[10px] fill-current opacity-80">Rekursjonstreet for naiv fib(4) — merk hvor mye gjentagelse.</text>
    </svg>
    <Caption>Rekursjonen kan visualiseres som et tre: hver node forgrener seg i to nye kall.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 21 — SORTERING
 * ===================================================================*/

export const SelectionSortSteps: FC = () => {
  const steps = [
    [5, 2, 4, 6, 1, 3],
    [1, 2, 4, 6, 5, 3],
    [1, 2, 4, 6, 5, 3],
    [1, 2, 3, 6, 5, 4],
    [1, 2, 3, 4, 5, 6],
  ];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 230" className="w-full max-w-md mx-auto text-foreground">
        {steps.map((arr, s) => (
          <g key={s}>
            <text x="10" y={20 + s * 42} className="text-[10px] fill-current opacity-80">steg {s}:</text>
            {arr.map((v, i) => (
              <g key={i}>
                <rect
                  x={60 + i * 45}
                  y={6 + s * 42}
                  width={40}
                  height={28}
                  fill={i < s ? "color-mix(in oklch, var(--success) 25%, transparent)" : "color-mix(in oklch, var(--brand) 15%, transparent)"}
                  stroke={STROKE}
                />
                <text x={80 + i * 45} y={25 + s * 42} textAnchor="middle" className="text-[11px] fill-current font-mono">{v}</text>
              </g>
            ))}
          </g>
        ))}
      </svg>
      <Caption>Selection sort: i hvert steg flyttes det minste element fra usortert del til ferdig del.</Caption>
    </figure>
  );
};

export const InsertionSortSteps: FC = () => {
  const steps = [
    [5, 2, 4, 6, 1, 3],
    [2, 5, 4, 6, 1, 3],
    [2, 4, 5, 6, 1, 3],
    [2, 4, 5, 6, 1, 3],
    [1, 2, 4, 5, 6, 3],
    [1, 2, 3, 4, 5, 6],
  ];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 270" className="w-full max-w-md mx-auto text-foreground">
        {steps.map((arr, s) => (
          <g key={s}>
            <text x="10" y={20 + s * 42} className="text-[10px] fill-current opacity-80">steg {s}:</text>
            {arr.map((v, i) => (
              <g key={i}>
                <rect
                  x={60 + i * 45}
                  y={6 + s * 42}
                  width={40}
                  height={28}
                  fill={i <= s ? "color-mix(in oklch, var(--success) 25%, transparent)" : "color-mix(in oklch, var(--brand) 15%, transparent)"}
                  stroke={STROKE}
                />
                <text x={80 + i * 45} y={25 + s * 42} textAnchor="middle" className="text-[11px] fill-current font-mono">{v}</text>
              </g>
            ))}
          </g>
        ))}
      </svg>
      <Caption>Insertion sort: hvert nytt element settes inn på riktig plass i den allerede sorterte delen.</Caption>
    </figure>
  );
};

/* =====================================================================
 * KAP. 22 — LENKEDE LISTER
 * ===================================================================*/

export const LinkedListSingly: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 130" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="20" className="text-[10px] fill-current opacity-80">head</text>
      <line x1="40" y1="20" x2="40" y2="50" stroke={STROKE} markerEnd="url(#arr-ll)" />
      {[
        { v: "A", x: 30 },
        { v: "B", x: 130 },
        { v: "C", x: 230 },
      ].map((n, i, all) => (
        <g key={n.v}>
          <rect x={n.x} y={55} width={50} height={40} fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
          <text x={n.x + 25} y={80} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.v}</text>
          <rect x={n.x + 50} y={55} width={30} height={40} fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
          {i < all.length - 1 && (
            <line x1={n.x + 80} y1={75} x2={n.x + 105} y2={75} stroke={STROKE} markerEnd="url(#arr-ll)" />
          )}
          {i === all.length - 1 && (
            <text x={n.x + 65} y={80} textAnchor="middle" className="text-[12px] fill-current font-mono">∅</text>
          )}
        </g>
      ))}
      <text x="10" y="120" className="text-[10px] fill-current opacity-80">Hver node holder en verdi + peker til neste. Siste peker er <code>None</code>.</text>
      <defs>
        <marker id="arr-ll" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Enkelt-lenket liste: noder peker bare framover. Innsetting/sletting krever ikke flytting.</Caption>
  </figure>
);

export const LinkedListInsert: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Before */}
      <text x="10" y="22" className="text-[10px] fill-current opacity-80">FØR (sett X mellom A og B):</text>
      <rect x="40" y="32" width="60" height="32" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="70" y="54" textAnchor="middle" className="text-[12px] fill-current font-mono">A</text>
      <line x1="100" y1="48" x2="135" y2="48" stroke={STROKE} markerEnd="url(#arr-li)" />
      <rect x="140" y="32" width="60" height="32" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="170" y="54" textAnchor="middle" className="text-[12px] fill-current font-mono">B</text>

      {/* After */}
      <text x="10" y="100" className="text-[10px] fill-current opacity-80">ETTER:</text>
      <rect x="20" y="110" width="60" height="32" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="132" textAnchor="middle" className="text-[12px] fill-current font-mono">A</text>
      <line x1="80" y1="126" x2="115" y2="126" stroke={STROKE} markerEnd="url(#arr-li)" />
      <rect x="120" y="110" width="60" height="32" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} />
      <text x="150" y="132" textAnchor="middle" className="text-[12px] fill-current font-mono">X</text>
      <line x1="180" y1="126" x2="215" y2="126" stroke={STROKE} markerEnd="url(#arr-li)" />
      <rect x="220" y="110" width="60" height="32" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="250" y="132" textAnchor="middle" className="text-[12px] fill-current font-mono">B</text>
      <text x="10" y="180" className="text-[10px] fill-current opacity-80">2 peker-endringer: A.next = X, X.next = B. Konstant tid.</text>
      <defs>
        <marker id="arr-li" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Innsetting i lenket liste: bare to pekere endres, ingen elementer flyttes.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 23 — SØKETRÆR (BST)
 * ===================================================================*/

export const BSTStructure: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {[
        { x: 180, y: 30, v: 8 },
        { x: 90, y: 80, v: 3 },
        { x: 270, y: 80, v: 12 },
        { x: 40, y: 130, v: 1 },
        { x: 140, y: 130, v: 5 },
        { x: 230, y: 130, v: 10 },
        { x: 310, y: 130, v: 14 },
        { x: 110, y: 180, v: 4 },
        { x: 170, y: 180, v: 6 },
      ].map((n) => (
        <g key={`${n.x}-${n.v}`}>
          <circle cx={n.x} cy={n.y} r={16} fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" className="text-[11px] fill-current font-mono">{n.v}</text>
        </g>
      ))}
      {[
        [180, 46, 90, 64],
        [180, 46, 270, 64],
        [90, 96, 40, 114],
        [90, 96, 140, 114],
        [270, 96, 230, 114],
        [270, 96, 310, 114],
        [140, 146, 110, 164],
        [140, 146, 170, 164],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} />
      ))}
      <text x="180" y="210" textAnchor="middle" className="text-[10px] fill-current opacity-80">Invariant: alle verdier i venstre subtre &lt; node &lt; alle i høyre.</text>
    </svg>
    <Caption>Binært søketre — sortert struktur som gir O(log n) oppslag i balansert tilfelle.</Caption>
  </figure>
);

export const BSTSearchPath: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {[
        { x: 180, y: 30, v: 8, hit: true },
        { x: 90, y: 80, v: 3, hit: false },
        { x: 270, y: 80, v: 12, hit: true },
        { x: 40, y: 130, v: 1, hit: false },
        { x: 140, y: 130, v: 5, hit: false },
        { x: 230, y: 130, v: 10, hit: true },
        { x: 310, y: 130, v: 14, hit: false },
      ].map((n) => (
        <g key={`${n.x}-${n.v}`}>
          <circle
            cx={n.x}
            cy={n.y}
            r={16}
            fill={n.hit ? "color-mix(in oklch, var(--success) 40%, transparent)" : "color-mix(in oklch, var(--muted) 40%, transparent)"}
            stroke={STROKE}
            strokeWidth={n.hit ? 2 : 1}
          />
          <text x={n.x} y={n.y + 5} textAnchor="middle" className="text-[11px] fill-current font-mono">{n.v}</text>
        </g>
      ))}
      {[
        [180, 46, 270, 64, true],
        [270, 96, 230, 114, true],
        [180, 46, 90, 64, false],
        [270, 96, 310, 114, false],
        [90, 96, 40, 114, false],
        [90, 96, 140, 114, false],
      ].map(([x1, y1, x2, y2, hit], i) => (
        <line
          key={i}
          x1={x1 as number}
          y1={y1 as number}
          x2={x2 as number}
          y2={y2 as number}
          stroke={hit ? "var(--success)" : STROKE}
          strokeWidth={hit ? 2 : 1}
        />
      ))}
      <text x="20" y="205" className="text-[10px] fill-current">Søk etter 10: 10 &gt; 8 (høyre) → 10 &lt; 12 (venstre) → treff. 3 sammenligninger.</text>
    </svg>
    <Caption>Søket følger én sti fra rot til løv — antall sammenligninger er ≤ treets høyde.</Caption>
  </figure>
);
