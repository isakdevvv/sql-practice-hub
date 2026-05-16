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
            fill={`color-mix(in oklch, var(--${s.c}) 18%, transparent)`}
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

/* =====================================================================
 * KAP. 24 — HASHING
 * ===================================================================*/

export const HashTableLayout: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 230" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="18" className="text-[10px] fill-current opacity-80">
        nøkkel "Ada" → hash(...) → 3 → tabell[3]
      </text>
      <rect x="10" y="28" width="100" height="24" rx="4" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="60" y="44" textAnchor="middle" className="text-[11px] fill-current font-mono">"Ada"</text>
      <line x1="110" y1="40" x2="150" y2="40" stroke={STROKE} markerEnd="url(#arr-ht)" />
      <rect x="150" y="28" width="80" height="24" rx="4" fill="color-mix(in oklch, var(--warning) 22%, transparent)" stroke={STROKE} />
      <text x="190" y="44" textAnchor="middle" className="text-[10px] fill-current font-mono">hash()</text>
      <line x1="230" y1="40" x2="270" y2="40" stroke={STROKE} markerEnd="url(#arr-ht)" />
      <text x="285" y="44" className="text-[12px] fill-current font-mono">3</text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <rect
            x={10 + i * 48}
            y={90}
            width={44}
            height={36}
            fill={i === 3 ? "color-mix(in oklch, var(--success) 30%, transparent)" : "color-mix(in oklch, var(--muted) 30%, transparent)"}
            stroke={STROKE}
            strokeWidth={i === 3 ? 2 : 1}
          />
          <text x={32 + i * 48} y={113} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {i === 3 ? '"Ada"→30' : i}
          </text>
        </g>
      ))}
      <text x="10" y="160" className="text-[10px] fill-current opacity-80">
        Slå opp "Ada" senere: kjør hash igjen, gå rett til tabell[3]. O(1).
      </text>
      <text x="10" y="180" className="text-[10px] fill-current opacity-80">
        Sammenlign med en liste: måtte gå gjennom alle elementer → O(n).
      </text>
      <defs>
        <marker id="arr-ht" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>En hash-funksjon oversetter nøkkelen til en tabell-indeks — oppslag på konstant tid.</Caption>
  </figure>
);

export const HashCollisionChaining: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="18" className="text-[10px] fill-current opacity-80">
        "Ada" og "Bob" hasher begge til 3 — kollisjon. Lagre begge i samme bøtte.
      </text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={10}
          y={30 + i * 28}
          width={50}
          height={24}
          fill="color-mix(in oklch, var(--muted) 25%, transparent)"
          stroke={STROKE}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <text key={`l-${i}`} x={20} y={47 + i * 28} className="text-[10px] fill-current font-mono">
          {i}
        </text>
      ))}
      {/* Bucket 3 with two entries */}
      <rect x={70} y={86} width={70} height={24} fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} />
      <text x={105} y={102} textAnchor="middle" className="text-[10px] fill-current font-mono">"Ada"→30</text>
      <line x1={140} y1={98} x2={158} y2={98} stroke={STROKE} markerEnd="url(#arr-hc)" />
      <rect x={160} y={86} width={70} height={24} fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} />
      <text x={195} y={102} textAnchor="middle" className="text-[10px] fill-current font-mono">"Bob"→25</text>
      <line x1={230} y1={98} x2={250} y2={98} stroke={STROKE} markerEnd="url(#arr-hc)" />
      <text x={258} y={102} className="text-[10px] fill-current font-mono">∅</text>
      {/* Connector from cell 3 to first chain item */}
      <line x1={60} y1={98} x2={68} y2={98} stroke={STROKE} markerEnd="url(#arr-hc)" />
      <text x="10" y="170" className="text-[10px] fill-current opacity-80">
        For å slå opp "Bob": hash → 3, gå gjennom kjeden, sammenlign nøkler.
      </text>
      <text x="10" y="188" className="text-[10px] fill-current opacity-80">
        Med god hash er kjedene korte, så oppslaget er fortsatt ≈ O(1) i snitt.
      </text>
      <defs>
        <marker id="arr-hc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
    <Caption>Separat chaining: hver bøtte er en liten liste. Kollisjoner havner bak hverandre i kjeden.</Caption>
  </figure>
);

export const HashLinearProbing: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="18" className="text-[10px] fill-current opacity-80">
        Sett inn "Cas" — hash → 3, men 3 er opptatt. Prøv 4. Også opptatt. Prøv 5.
      </text>
      {[
        { v: '"Ada"', filled: true },
        { v: '"Eli"', filled: true },
        { v: "", filled: false },
        { v: '"Bob"', filled: true },
        { v: '"Liv"', filled: true },
        { v: "", filled: false, target: true },
        { v: "", filled: false },
        { v: '"Per"', filled: true },
      ].map((c, i) => (
        <g key={i}>
          <rect
            x={10 + i * 42}
            y={50}
            width={38}
            height={36}
            fill={
              c.target
                ? "color-mix(in oklch, var(--success) 38%, transparent)"
                : c.filled
                  ? "color-mix(in oklch, var(--brand) 22%, transparent)"
                  : "color-mix(in oklch, var(--muted) 25%, transparent)"
            }
            stroke={STROKE}
            strokeWidth={c.target ? 2 : 1}
          />
          <text x={29 + i * 42} y={72} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {c.v}
          </text>
          <text x={29 + i * 42} y={104} textAnchor="middle" className="text-[9px] fill-current opacity-70">
            {i}
          </text>
        </g>
      ))}
      {/* Probe arc from 3 → 4 → 5 */}
      <path d="M 145 50 Q 165 24 185 50" fill="none" stroke="var(--warning)" strokeDasharray="3 2" />
      <path d="M 187 50 Q 207 24 227 50" fill="none" stroke="var(--warning)" strokeDasharray="3 2" />
      <text x={155} y="42" className="text-[9px] fill-current opacity-80">probe</text>
      <text x="10" y="140" className="text-[10px] fill-current opacity-80">
        Cas havner i celle 5. Søker du senere etter "Cas": start på 3, gå framover til treff
      </text>
      <text x="10" y="156" className="text-[10px] fill-current opacity-80">
        eller første tomme celle. Klynger av fulle celler er ulempen — de bremser søk.
      </text>
    </svg>
    <Caption>Lineær probing: ved kollisjon, gå til neste celle. Enkelt — men danner klynger.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 25 — GRAFER
 * ===================================================================*/

export const GraphAdjacencyList: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 230" className="w-full max-w-md mx-auto text-foreground">
      {/* Mini-graph: 4 nodes */}
      {[
        { id: "A", x: 60, y: 40 },
        { id: "B", x: 140, y: 40 },
        { id: "C", x: 60, y: 110 },
        { id: "D", x: 140, y: 110 },
      ].map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={16} fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.id}</text>
        </g>
      ))}
      <line x1={76} y1={40} x2={124} y2={40} stroke={STROKE} />
      <line x1={60} y1={56} x2={60} y2={94} stroke={STROKE} />
      <line x1={140} y1={56} x2={140} y2={94} stroke={STROKE} />
      <line x1={76} y1={110} x2={124} y2={110} stroke={STROKE} />
      <line x1={71} y1={51} x2={129} y2={99} stroke={STROKE} />
      {/* Adjacency list */}
      <text x={200} y={28} className="text-[10px] fill-current opacity-80">nabolister:</text>
      {[
        { node: "A", neigh: "B, C, D" },
        { node: "B", neigh: "A, D" },
        { node: "C", neigh: "A, D" },
        { node: "D", neigh: "A, B, C" },
      ].map((r, i) => (
        <g key={r.node}>
          <text x={200} y={50 + i * 22} className="text-[11px] fill-current font-mono">
            {r.node}: [{r.neigh}]
          </text>
        </g>
      ))}
      <text x={10} y={170} className="text-[10px] fill-current opacity-80">
        4 noder, 5 kanter. Lista lagrer hver node sin liste over naboer.
      </text>
      <text x={10} y={188} className="text-[10px] fill-current opacity-80">
        Plass: O(V + E). For sparse grafer mye billigere enn en V×V-matrise.
      </text>
    </svg>
    <Caption>Nabolisten — en liste per node med dens umiddelbare naboer.</Caption>
  </figure>
);

export const DFSWalk: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      {[
        { id: "A", x: 60, y: 40, order: 1 },
        { id: "B", x: 160, y: 40, order: 2 },
        { id: "D", x: 260, y: 40, order: 3 },
        { id: "C", x: 110, y: 110, order: 4 },
        { id: "E", x: 210, y: 110, order: 5 },
        { id: "F", x: 310, y: 110, order: 6 },
      ].map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={16} fill="color-mix(in oklch, var(--success) 28%, transparent)" stroke={STROKE} strokeWidth={1.5} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.id}</text>
          <text x={n.x + 22} y={n.y - 14} className="text-[10px] fill-current font-mono" fill="var(--brand)">#{n.order}</text>
        </g>
      ))}
      {/* Edges */}
      <line x1={76} y1={40} x2={144} y2={40} stroke="var(--success)" strokeWidth={2} />
      <line x1={176} y1={40} x2={244} y2={40} stroke={STROKE} />
      <line x1={70} y1={54} x2={100} y2={96} stroke={STROKE} />
      <line x1={160} y1={56} x2={120} y2={96} stroke="var(--success)" strokeWidth={2} />
      <line x1={160} y1={56} x2={205} y2={96} stroke="var(--success)" strokeWidth={2} />
      <line x1={260} y1={56} x2={300} y2={96} stroke={STROKE} />
      <line x1={210} y1={56} x2={210} y2={96} stroke={STROKE} />
      <text x={10} y={180} className="text-[10px] fill-current opacity-80">
        Start på A. Gå dypt: A → B → C (blindvei, backtrack) → E (blindvei) → D → F.
      </text>
      <text x={10} y={198} className="text-[10px] fill-current opacity-80">
        DFS bruker rekursjon (eller en stack). Hver kant og hver node besøkes én gang.
      </text>
      <text x={10} y={220} className="text-[10px] fill-current opacity-80 font-mono">
        Rekkefølge: A, B, C, E, D, F
      </text>
    </svg>
    <Caption>DFS dykker så dypt som mulig før den snur. Røde kanter = treet vi følger.</Caption>
  </figure>
);

export const BFSWalk: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      {[
        { id: "A", x: 60, y: 40, level: 0 },
        { id: "B", x: 160, y: 40, level: 1 },
        { id: "D", x: 260, y: 40, level: 2 },
        { id: "C", x: 110, y: 110, level: 1 },
        { id: "E", x: 210, y: 110, level: 2 },
        { id: "F", x: 310, y: 110, level: 3 },
      ].map((n) => {
        const colors = [
          "var(--brand)",
          "var(--success)",
          "var(--warning)",
          "var(--muted)",
        ];
        return (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={16}
              fill={`color-mix(in oklch, ${colors[n.level]} 30%, transparent)`}
              stroke={STROKE}
              strokeWidth={1.5}
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="text-[12px] fill-current font-mono">
              {n.id}
            </text>
            <text x={n.x + 22} y={n.y - 14} className="text-[10px] fill-current opacity-70">
              L{n.level}
            </text>
          </g>
        );
      })}
      <line x1={76} y1={40} x2={144} y2={40} stroke={STROKE} />
      <line x1={176} y1={40} x2={244} y2={40} stroke={STROKE} />
      <line x1={70} y1={54} x2={100} y2={96} stroke={STROKE} />
      <line x1={160} y1={56} x2={120} y2={96} stroke={STROKE} />
      <line x1={160} y1={56} x2={205} y2={96} stroke={STROKE} />
      <line x1={260} y1={56} x2={300} y2={96} stroke={STROKE} />
      <line x1={210} y1={56} x2={210} y2={96} stroke={STROKE} />
      <text x={10} y={180} className="text-[10px] fill-current opacity-80">
        Start på A. Først nivå 0 (A), så nivå 1 (B, C), så nivå 2 (D, E), så nivå 3 (F).
      </text>
      <text x={10} y={198} className="text-[10px] fill-current opacity-80">
        BFS bruker en kø. Avstanden fra start til hver node er nivået den havner på.
      </text>
      <text x={10} y={220} className="text-[10px] fill-current opacity-80 font-mono">
        Rekkefølge: A, B, C, D, E, F
      </text>
    </svg>
    <Caption>BFS sprer seg utover lag for lag. Gir korteste sti (i antall kanter) fra startnoden.</Caption>
  </figure>
);

/* =====================================================================
 * KAP. 26 — VEKTEDE GRAFER (Prim, Dijkstra)
 * ===================================================================*/

export const WeightedGraphExample: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 230" className="w-full max-w-md mx-auto text-foreground">
      {[
        { id: "A", x: 60, y: 50 },
        { id: "B", x: 180, y: 30 },
        { id: "C", x: 300, y: 60 },
        { id: "D", x: 90, y: 160 },
        { id: "E", x: 230, y: 170 },
      ].map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={17} fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.id}</text>
        </g>
      ))}
      {[
        { x1: 77, y1: 50, x2: 163, y2: 32, w: 4, mx: 115, my: 36 },
        { x1: 197, y1: 30, x2: 283, y2: 58, w: 2, mx: 245, my: 38 },
        { x1: 60, y1: 67, x2: 90, y2: 143, w: 1, mx: 64, my: 110 },
        { x1: 180, y1: 47, x2: 100, y2: 145, w: 5, mx: 130, my: 100 },
        { x1: 180, y1: 47, x2: 220, y2: 153, w: 3, mx: 210, my: 100 },
        { x1: 300, y1: 77, x2: 240, y2: 153, w: 6, mx: 280, my: 120 },
        { x1: 108, y1: 160, x2: 213, y2: 170, w: 7, mx: 158, my: 178 },
      ].map((e, i) => (
        <g key={i}>
          <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={STROKE} />
          <rect x={e.mx - 7} y={e.my - 9} width={14} height={14} fill="var(--background)" />
          <text x={e.mx} y={e.my + 2} textAnchor="middle" className="text-[10px] fill-current font-mono" fill="var(--warning)">
            {e.w}
          </text>
        </g>
      ))}
      <text x={10} y={205} className="text-[10px] fill-current opacity-80">
        5 noder, 7 kanter. Tallene er kostnader: kabelpris, reisetid, eller hva du modellerer.
      </text>
    </svg>
    <Caption>Vektet graf: hver kant har et tall. MST og korteste sti bryr seg om summen av disse.</Caption>
  </figure>
);

export const PrimStep: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 230" className="w-full max-w-md mx-auto text-foreground">
      {[
        { id: "A", x: 60, y: 50, in: true },
        { id: "B", x: 180, y: 30, in: true },
        { id: "C", x: 300, y: 60, in: true },
        { id: "D", x: 90, y: 160, in: true },
        { id: "E", x: 230, y: 170, in: false },
      ].map((n) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={17}
            fill={n.in ? "color-mix(in oklch, var(--success) 35%, transparent)" : "color-mix(in oklch, var(--muted) 30%, transparent)"}
            stroke={STROKE}
            strokeWidth={n.in ? 2 : 1}
          />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.id}</text>
        </g>
      ))}
      {[
        { x1: 77, y1: 50, x2: 163, y2: 32, w: 4, picked: true },
        { x1: 197, y1: 30, x2: 283, y2: 58, w: 2, picked: true },
        { x1: 60, y1: 67, x2: 90, y2: 143, w: 1, picked: true },
        { x1: 180, y1: 47, x2: 100, y2: 145, w: 5, picked: false },
        { x1: 180, y1: 47, x2: 220, y2: 153, w: 3, picked: false, candidate: true },
        { x1: 300, y1: 77, x2: 240, y2: 153, w: 6, picked: false, candidate: true },
        { x1: 108, y1: 160, x2: 213, y2: 170, w: 7, picked: false, candidate: true },
      ].map((e, i) => {
        const stroke = e.picked ? "var(--success)" : e.candidate ? "var(--warning)" : STROKE;
        const sw = e.picked ? 2.5 : e.candidate ? 1.5 : 1;
        const dash = e.candidate ? "3 2" : undefined;
        return (
          <g key={i}>
            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
            <text x={(e.x1 + e.x2) / 2} y={(e.y1 + e.y2) / 2 - 2} textAnchor="middle" className="text-[10px] fill-current font-mono">
              {e.w}
            </text>
          </g>
        );
      })}
      <text x={10} y={200} className="text-[10px] fill-current opacity-80">
        Treet T = {`{A, B, C, D}`}. Kandidater til E: B-E (3), C-E (6), D-E (7).
      </text>
      <text x={10} y={216} className="text-[10px] fill-current opacity-80">
        Velg den med lavest vekt → B-E. E havner i treet, total = 4+2+1+3 = 10.
      </text>
    </svg>
    <Caption>Prim under arbeid: ved hvert steg legg til den letteste kanten fra treet til en ny node.</Caption>
  </figure>
);

export const DijkstraTable: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[10px] fill-current opacity-80">
        Korteste sti fra A. Tabellen viser cost[v] etter hvert som noder legges i T.
      </text>
      {/* Table */}
      {["Steg", "T", "A", "B", "C", "D", "E"].map((h, i) => (
        <text key={h} x={20 + i * 50} y={42} className="text-[10px] fill-current font-mono opacity-70">
          {h}
        </text>
      ))}
      {[
        ["1", "{A}", "0", "4", "∞", "1", "∞"],
        ["2", "+D", "0", "4", "∞", "1", "8"],
        ["3", "+B", "0", "4", "∞", "1", "7"],
        ["4", "+E", "0", "4", "13", "1", "7"],
        ["5", "+C", "0", "4", "13", "1", "7"],
      ].map((row, ri) => (
        <g key={ri}>
          {row.map((cell, ci) => (
            <text
              key={ci}
              x={20 + ci * 50}
              y={62 + ri * 22}
              className="text-[10px] fill-current font-mono"
              fill={ri === 4 && ci > 1 ? "var(--success)" : undefined}
            >
              {cell}
            </text>
          ))}
        </g>
      ))}
      <text x={10} y={195} className="text-[10px] fill-current opacity-80">
        Hver runde: ta noden i V−T med lavest cost. Oppdater nabolaget om en kortere
      </text>
      <text x={10} y={211} className="text-[10px] fill-current opacity-80">
        vei dukker opp. Slutt: cost = korteste avstand fra A til hver node.
      </text>
    </svg>
    <Caption>Dijkstra trinn-for-trinn: cost-tabellen krymper mot endelige korteste-sti-avstander.</Caption>
  </figure>
);

/* =====================================================================
 * MEMORY-/ADRESSE-DIAGRAMMER
 * Variabler holder *adresser* til heap-objekter, ikke verdiene selv.
 * Brukes i flere kapitler — Visualizer-panelet viser samme id=… i header.
 * ===================================================================*/

const ARR_ID = "arr-id";
function IdArrowDef() {
  return (
    <defs>
      <marker id={ARR_ID} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
    </defs>
  );
}

/* Kap. 6 — Funksjoner: mutable default arg (én delt liste per def) */
export const MutableDefaultArg: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Function box */}
      <rect x="10" y="10" width="160" height="56" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="20" y="28" className="text-[10px] fill-current opacity-80">funksjons-objekt</text>
      <text x="20" y="48" className="text-[11px] fill-current font-mono">def legg(x, b=[])</text>
      <text x="20" y="62" className="text-[9px] fill-current opacity-70">id=4711</text>
      {/* Default value lives on heap, ONE list */}
      <rect x="200" y="80" width="150" height="56" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="210" y="98" className="text-[10px] fill-current opacity-80">heap-liste (default-arg)</text>
      <text x="210" y="120" className="text-[12px] fill-current font-mono">[1, 2, 3]</text>
      <text x="210" y="132" className="text-[9px] fill-current opacity-70">id=9001</text>
      {/* Two calls — both bind b to the SAME id */}
      <rect x="10" y="100" width="80" height="26" fill="color-mix(in oklch, var(--warning) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="117" textAnchor="middle" className="text-[10px] fill-current font-mono">kall 1: b</text>
      <rect x="10" y="150" width="80" height="26" fill="color-mix(in oklch, var(--warning) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="167" textAnchor="middle" className="text-[10px] fill-current font-mono">kall 2: b</text>
      <path d="M 90 113 Q 145 110 200 105" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 90 163 Q 145 140 200 120" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="200" className="text-[10px] fill-current opacity-80">def-en evalueres én gang. Begge kall ser samme id=9001 →</text>
      <text x="10" y="214" className="text-[10px] fill-current opacity-80">.append() i kall 1 er synlig i kall 2.</text>
      <IdArrowDef />
    </svg>
    <Caption>Mutable default-arg-fellen: parameteren <code>b</code> binder til samme heap-objekt ved hvert kall.</Caption>
  </figure>
);

/* Kap. 7 — Klasser: self er en referanse til heap-instansen */
export const SelfReference: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Two instance heap objects */}
      <rect x="200" y="20" width="150" height="64" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="210" y="38" className="text-[10px] fill-current opacity-80">Hund-instans</text>
      <text x="210" y="58" className="text-[12px] fill-current font-mono">navn = "Rex"</text>
      <text x="210" y="78" className="text-[9px] fill-current opacity-70">id=8200</text>
      <rect x="200" y="120" width="150" height="64" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="210" y="138" className="text-[10px] fill-current opacity-80">Hund-instans</text>
      <text x="210" y="158" className="text-[12px] fill-current font-mono">navn = "Mira"</text>
      <text x="210" y="178" className="text-[9px] fill-current opacity-70">id=8244</text>
      {/* Variable boxes */}
      <rect x="10" y="36" width="80" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="55" textAnchor="middle" className="text-[11px] fill-current font-mono">rex</text>
      <rect x="10" y="136" width="80" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="50" y="155" textAnchor="middle" className="text-[11px] fill-current font-mono">mira</text>
      {/* self labels — what self binds to during method call */}
      <text x="105" y="40" className="text-[9px] fill-current opacity-70">self under rex.bjeff()</text>
      <text x="105" y="140" className="text-[9px] fill-current opacity-70">self under mira.bjeff()</text>
      <path d="M 90 50 L 200 50" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 90 150 L 200 150" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <IdArrowDef />
    </svg>
    <Caption><code>self</code> er en lokal variabel som ved hvert metodekall holder adressen til riktig instans.</Caption>
  </figure>
);

/* Kap. 8 — Strenger: is vs == og interning */
export const IsVsEquals: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      {/* Top: same value, different ids */}
      <text x="10" y="18" className="text-[11px] fill-current font-mono opacity-90">a = "hei verden"; b = "hei verden"</text>
      <rect x="10" y="28" width="60" height="26" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="40" y="46" textAnchor="middle" className="text-[11px] fill-current font-mono">a</text>
      <rect x="10" y="62" width="60" height="26" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="40" y="80" textAnchor="middle" className="text-[11px] fill-current font-mono">b</text>
      <rect x="170" y="22" width="180" height="32" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="42" className="text-[11px] fill-current font-mono">"hei verden"</text>
      <text x="298" y="42" className="text-[9px] fill-current opacity-70">id=51</text>
      <rect x="170" y="60" width="180" height="32" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="80" className="text-[11px] fill-current font-mono">"hei verden"</text>
      <text x="298" y="80" className="text-[9px] fill-current opacity-70">id=72</text>
      <path d="M 70 41 L 170 38" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 70 75 L 170 76" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="108" className="text-[10px] fill-current opacity-80">a == b → True (samme verdi). a is b → False (ulik id).</text>
      {/* Bottom: interned short string — same id */}
      <text x="10" y="138" className="text-[11px] fill-current font-mono opacity-90">x = "ok"; y = "ok"   # kort/identifier-aktig → interned</text>
      <rect x="10" y="148" width="60" height="26" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="40" y="166" textAnchor="middle" className="text-[11px] fill-current font-mono">x</text>
      <rect x="10" y="182" width="60" height="26" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="40" y="200" textAnchor="middle" className="text-[11px] fill-current font-mono">y</text>
      <rect x="170" y="160" width="180" height="32" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="180" className="text-[11px] fill-current font-mono">"ok"</text>
      <text x="298" y="180" className="text-[9px] fill-current opacity-70">id=99</text>
      <path d="M 70 161 Q 120 170 170 175" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 70 195 Q 120 188 170 180" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="226" className="text-[10px] fill-current opacity-80">Her gir x is y → True (samme id, interning).</text>
      <IdArrowDef />
    </svg>
    <Caption><code>==</code> sammenligner verdi. <code>is</code> sammenligner adresse (id). Stol bare på <code>is</code> for <code>None</code>.</Caption>
  </figure>
);

/* Kap. 11 — [[0]*3]*3-fellen: én delt indre liste */
export const NestedListAliasing: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <text x="10" y="18" className="text-[11px] fill-current font-mono">m = [[0]*3] * 3</text>
      {/* Outer list with 3 cells, all pointing to ONE inner list */}
      <rect x="10" y="36" width="160" height="40" fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x="20" y="52" className="text-[10px] fill-current opacity-80">ytre liste id=4001</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={20 + i * 50} y={56} width={40} height={16} fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x={40 + i * 50} y={68} textAnchor="middle" className="text-[9px] fill-current font-mono">m[{i}]</text>
        </g>
      ))}
      <rect x="220" y="46" width="130" height="40" fill="color-mix(in oklch, var(--warning) 18%, transparent)" stroke={STROKE} />
      <text x="230" y="62" className="text-[10px] fill-current opacity-80">indre liste id=4099</text>
      <text x="230" y="80" className="text-[12px] fill-current font-mono">[0, 0, 0]</text>
      <path d="M 60 64 Q 140 48 220 56" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 110 64 Q 165 56 220 64" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 160 64 Q 190 70 220 72" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="106" className="text-[10px] fill-current opacity-80">m[0][0] = 9 endrer alle radene — det finnes bare én indre liste.</text>
      {/* contrast: list-comp version */}
      <text x="10" y="138" className="text-[11px] fill-current font-mono">m = [[0]*3 for _ in range(3)]</text>
      <rect x="10" y="156" width="160" height="40" fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x="20" y="172" className="text-[10px] fill-current opacity-80">ytre liste id=4111</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={20 + i * 50} y={176} width={40} height={16} fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x={40 + i * 50} y={188} textAnchor="middle" className="text-[9px] fill-current font-mono">m[{i}]</text>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={210 + i * 48} y={156 + i * 4} width={40} height={26} fill="color-mix(in oklch, var(--warning) 18%, transparent)" stroke={STROKE} />
          <text x={230 + i * 48} y={172 + i * 4} textAnchor="middle" className="text-[9px] fill-current font-mono">[0,0,0]</text>
          <text x={230 + i * 48} y={184 + i * 4} textAnchor="middle" className="text-[8px] fill-current opacity-70">id={4200 + i}</text>
          <path d={`M ${40 + i * 50} 192 Q ${130 + i * 30} ${200 + i * 4} ${210 + i * 48} ${172 + i * 4}`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
        </g>
      ))}
      <text x="10" y="232" className="text-[10px] fill-current opacity-80">Tre uavhengige indre lister — ulike id-er. Trygg å mutere per rad.</text>
      <IdArrowDef />
    </svg>
    <Caption>Multiplikasjon kopierer <em>referansen</em>, ikke listen. List-comp gir hver rad sin egen id.</Caption>
  </figure>
);

/* Kap. 14 — hashable nøkler: tuple (immutable) ja, list (mutable) nei */
export const HashableKeys: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Dict on the right with two entries */}
      <rect x="160" y="10" width="190" height="200" fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x="170" y="28" className="text-[10px] fill-current opacity-80">dict id=6001</text>
      <text x="170" y="50" className="text-[11px] fill-current font-mono">hash((1,2)) → 5 → bøtte 5</text>
      <rect x="170" y="58" width="160" height="38" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="180" y="78" className="text-[11px] fill-current font-mono">(1,2)</text>
      <text x="220" y="78" className="text-[10px] fill-current opacity-80">→</text>
      <text x="240" y="78" className="text-[11px] fill-current font-mono">"a"</text>
      <text x="180" y="92" className="text-[8px] fill-current opacity-60">tuple id=6111 (immutable, hash stabil)</text>
      {/* Failed key — list */}
      <rect x="170" y="120" width="160" height="42" fill="color-mix(in oklch, var(--warning) 12%, transparent)" stroke={STROKE} strokeDasharray="3,2" />
      <text x="180" y="140" className="text-[11px] fill-current font-mono opacity-70">[1, 2]</text>
      <text x="220" y="140" className="text-[10px] fill-current opacity-70">→</text>
      <text x="240" y="140" className="text-[11px] fill-current font-mono opacity-70">"b" ✗</text>
      <text x="180" y="156" className="text-[8px] fill-current opacity-60">list id=6122 (mutable → unhashable)</text>
      <text x="170" y="186" className="text-[9px] fill-current opacity-80">TypeError: unhashable type: 'list'</text>
      {/* Variable boxes pointing in */}
      <rect x="10" y="60" width="120" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="70" y="78" textAnchor="middle" className="text-[11px] fill-current font-mono">nøkkel = (1,2)</text>
      <path d="M 130 74 L 170 75" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <rect x="10" y="130" width="120" height="28" fill="color-mix(in oklch, var(--warning) 15%, transparent)" stroke={STROKE} strokeDasharray="3,2" />
      <text x="70" y="148" textAnchor="middle" className="text-[11px] fill-current font-mono">nøkkel = [1,2]</text>
      <path d="M 130 144 L 170 140" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} strokeDasharray="3,2" />
      <IdArrowDef />
    </svg>
    <Caption>En dict-nøkkel må ha stabil hash. Tuple er immutable → trygg. Liste er muterbar → forbudt.</Caption>
  </figure>
);

/* Kap. 22 — Lenkede lister: head → Node(id=…) → … */
export const LinkedListNodeIds: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 160" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="50" width="60" height="32" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="40" y="70" textAnchor="middle" className="text-[11px] fill-current font-mono">head</text>
      {[
        { x: 100, label: "A", id: 1001 },
        { x: 195, label: "B", id: 1002 },
        { x: 290, label: "C", id: 1003 },
      ].map((n, i, arr) => (
        <g key={n.id}>
          <rect x={n.x} y={40} width={60} height={50} fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
          <text x={n.x + 30} y={62} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.label}</text>
          <text x={n.x + 30} y={78} textAnchor="middle" className="text-[8px] fill-current opacity-70">id={n.id}</text>
          <text x={n.x + 30} y={104} textAnchor="middle" className="text-[9px] fill-current opacity-70">.neste</text>
          {i > 0 && (
            <path
              d={`M ${arr[i - 1].x + 60} 65 L ${n.x} 65`}
              fill="none"
              stroke={STROKE}
              markerEnd={`url(#${ARR_ID})`}
            />
          )}
        </g>
      ))}
      <path d="M 70 65 L 100 65" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* tail None */}
      <text x="290" y="125" className="text-[10px] fill-current opacity-80">C.neste = None</text>
      <text x="10" y="148" className="text-[10px] fill-current opacity-80">head holder adressen til første Node. Hver .neste er en adresse, ikke en kopi.</text>
      <IdArrowDef />
    </svg>
    <Caption>Pekere er adresser. <code>None</code> betyr "ingen adresse" — slutten på lista.</Caption>
  </figure>
);

/* Kap. 23 — BST: hver node har venstre/høyre adresser */
export const BSTNodeIds: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {[
        { x: 160, y: 20, v: 50, id: 7001, l: 7010, r: 7020 },
        { x: 80, y: 90, v: 30, id: 7010, l: null, r: 7011 },
        { x: 250, y: 90, v: 70, id: 7020, l: null, r: null },
        { x: 130, y: 160, v: 40, id: 7011, l: null, r: null },
      ].map((n) => (
        <g key={n.id}>
          <rect x={n.x - 30} y={n.y} width={60} height={48} fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
          <text x={n.x} y={n.y + 18} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.v}</text>
          <text x={n.x} y={n.y + 32} textAnchor="middle" className="text-[8px] fill-current opacity-70">id={n.id}</text>
          <text x={n.x - 26} y={n.y + 44} className="text-[7px] fill-current opacity-60">L:{n.l ?? "None"}</text>
          <text x={n.x + 4} y={n.y + 44} className="text-[7px] fill-current opacity-60">R:{n.r ?? "None"}</text>
        </g>
      ))}
      {/* arrows */}
      <path d="M 145 68 L 100 90" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 175 68 L 230 90" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 100 138 L 130 160" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="200" className="text-[10px] fill-current opacity-80">venstre/høyre er adresser til andre Node-er (eller None).</text>
      <text x="10" y="214" className="text-[10px] fill-current opacity-80">Sjekk <code>node is None</code> = "har ingen barn-adresse".</text>
      <IdArrowDef />
    </svg>
    <Caption>BST-noder bærer to pekere — hver er en adresse til neste node, ikke en kopi.</Caption>
  </figure>
);

/* Kap. 24 — Hashing: nøkkel-id → hash() → modulo → bucket */
export const HashFromIdToBucket: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Key on heap */}
      <rect x="10" y="20" width="120" height="42" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="20" y="38" className="text-[10px] fill-current opacity-80">streng "Ada"</text>
      <text x="20" y="56" className="text-[10px] fill-current font-mono opacity-70">id=3142</text>
      {/* hash() box */}
      <rect x="150" y="20" width="80" height="42" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="190" y="38" textAnchor="middle" className="text-[11px] fill-current font-mono">hash()</text>
      <text x="190" y="54" textAnchor="middle" className="text-[10px] fill-current opacity-80">→ 84219…</text>
      {/* modulo box */}
      <rect x="250" y="20" width="100" height="42" fill="color-mix(in oklch, var(--warning) 18%, transparent)" stroke={STROKE} />
      <text x="300" y="38" textAnchor="middle" className="text-[11px] fill-current font-mono">% N (=8)</text>
      <text x="300" y="54" textAnchor="middle" className="text-[10px] fill-current opacity-80">→ 3</text>
      {/* arrows */}
      <path d="M 130 41 L 150 41" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 230 41 L 250 41" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Bucket array */}
      <text x="10" y="100" className="text-[10px] fill-current opacity-80">tabell (8 bøtter):</text>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect
            x={10 + i * 42}
            y={110}
            width={40}
            height={36}
            fill={i === 3 ? "color-mix(in oklch, var(--brand) 25%, transparent)" : "color-mix(in oklch, var(--muted) 35%, transparent)"}
            stroke={STROKE}
          />
          <text x={30 + i * 42} y={132} textAnchor="middle" className="text-[10px] fill-current font-mono">{i === 3 ? "Ada→30" : "·"}</text>
          <text x={30 + i * 42} y={158} textAnchor="middle" className="text-[9px] fill-current opacity-70">{i}</text>
        </g>
      ))}
      <path d="M 300 62 L 145 110" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="186" className="text-[10px] fill-current opacity-80">Samme nøkkel-id → samme hash → samme bøtte. Det er hele O(1)-trikset.</text>
      <text x="10" y="200" className="text-[10px] fill-current opacity-80">Mutérbare objekter forbudt: hvis id endret hash, ville bøtta blitt feil.</text>
      <IdArrowDef />
    </svg>
    <Caption>Hashing: regn ut bøtte-indeksen direkte fra nøkkelens identitet — ingen leting.</Caption>
  </figure>
);

/* Kap. 25 — Naboliste lagrer adresser til nabo-noder */
export const GraphAdjAddresses: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Adjacency dict on left */}
      <rect x="10" y="10" width="150" height="200" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <text x="20" y="26" className="text-[10px] fill-current opacity-80">graf id=5001 (dict)</text>
      {[
        { k: "A", v: '["B","C"]', y: 46 },
        { k: "B", v: '["A","D"]', y: 86 },
        { k: "C", v: '["A","D"]', y: 126 },
        { k: "D", v: '["B","C"]', y: 166 },
      ].map((row) => (
        <g key={row.k}>
          <text x={20} y={row.y} className="text-[11px] fill-current font-mono">{row.k}:</text>
          <text x={40} y={row.y} className="text-[11px] fill-current font-mono opacity-80">{row.v}</text>
        </g>
      ))}
      {/* Heap nodes on the right */}
      {[
        { lbl: "A", x: 220, y: 16, id: 5101 },
        { lbl: "B", x: 290, y: 16, id: 5102 },
        { lbl: "C", x: 220, y: 86, id: 5103 },
        { lbl: "D", x: 290, y: 86, id: 5104 },
      ].map((n) => (
        <g key={n.id}>
          <circle cx={n.x + 30} cy={n.y + 30} r={22} fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
          <text x={n.x + 30} y={n.y + 28} textAnchor="middle" className="text-[12px] fill-current font-mono">{n.lbl}</text>
          <text x={n.x + 30} y={n.y + 42} textAnchor="middle" className="text-[8px] fill-current opacity-70">id={n.id}</text>
        </g>
      ))}
      {/* Arrows from A's list to B and C node objects */}
      <path d="M 160 46 L 220 38" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <path d="M 160 46 Q 200 80 220 110" fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x="10" y="200" className="text-[9px] fill-current opacity-80">"B" og "C" er nøkler til samme noder. Endrer du en nodes data, ser alle naboer det.</text>
      <IdArrowDef />
    </svg>
    <Caption>Naboliste-verdier (her strenger) er nøkler/adresser inn i samme graf-dict — ikke kopier av nodene.</Caption>
  </figure>
);

/* Kap. 6 — Foundational: én rad per type med kjennemerke, mutabilitet og størrelse */
export const TypeOverview: FC = () => {
  const rows: Array<{
    type: string;
    example: string;
    mark: string;
    mutable: boolean;
    bytes: number;
  }> = [
    { type: "int",   example: "42",         mark: "(siffer)",  mutable: false, bytes: 28 },
    { type: "float", example: "3.14",       mark: ". (punkt)", mutable: false, bytes: 24 },
    { type: "str",   example: '"hei"',      mark: '"..."',     mutable: false, bytes: 52 },
    { type: "list",  example: "[1, 2, 3]",  mark: "[...]",     mutable: true,  bytes: 88 },
    { type: "tuple", example: "(1, 2)",     mark: "(.., ..)",  mutable: false, bytes: 56 },
    { type: "dict",  example: '{"a": 1}',   mark: "{k: v}",    mutable: true,  bytes: 232 },
    { type: "set",   example: "{1, 2}",     mark: "{..}",      mutable: true,  bytes: 216 },
  ];
  const rowH = 24;
  const headerY = 22;
  const startY = 32;
  const totalH = startY + rows.length * rowH + 32;
  const colType = 12;
  const colExample = 64;
  const colMut = 178;
  const colBytes = 232;
  const colMark = 290;
  return (
    <figure className="my-4">
      <svg
        viewBox={`0 0 360 ${totalH}`}
        className="w-full max-w-md mx-auto text-foreground"
      >
        <text x={colType} y={headerY} className="text-[10px] fill-current opacity-80 font-semibold">type</text>
        <text x={colExample} y={headerY} className="text-[10px] fill-current opacity-80 font-semibold">eksempel</text>
        <text x={colMut} y={headerY} className="text-[10px] fill-current opacity-80 font-semibold">mutabel</text>
        <text x={colBytes} y={headerY} className="text-[10px] fill-current opacity-80 font-semibold">bytes</text>
        <text x={colMark} y={headerY} className="text-[10px] fill-current opacity-80 font-semibold">kjennemerke</text>
        <line x1={8} y1={26} x2={352} y2={26} stroke={STROKE} opacity={0.3} />
        {rows.map((r, i) => {
          const y = startY + i * rowH;
          const rowFill = r.mutable
            ? "color-mix(in oklch, var(--warning) 12%, transparent)"
            : "color-mix(in oklch, var(--success) 12%, transparent)";
          return (
            <g key={r.type}>
              <rect x={8} y={y} width={344} height={rowH - 2} fill={rowFill} stroke={STROKE} strokeOpacity={0.25} />
              <text x={colType} y={y + 15} className="text-[11px] fill-current font-mono font-semibold">{r.type}</text>
              <text x={colExample} y={y + 15} className="text-[11px] fill-current font-mono">{r.example}</text>
              <text x={colMut} y={y + 15} className="text-[10px] fill-current opacity-90">
                {r.mutable ? "ja" : "nei"}
              </text>
              <text x={colBytes} y={y + 15} className="text-[10px] fill-current font-mono opacity-90">{r.bytes} B</text>
              <text x={colMark} y={y + 15} className="text-[10px] fill-current font-mono opacity-90">{r.mark}</text>
            </g>
          );
        })}
        <text x={12} y={totalH - 14} className="text-[9px] fill-current opacity-70">
          Bytes ≈ sys.getsizeof i CPython 3.11 — varierer med versjon og innhold.
        </text>
        <text x={12} y={totalH - 2} className="text-[9px] fill-current opacity-70">
          Grønn = immutable (id stabil). Oransje = mutable (innhold kan endres in-place).
        </text>
      </svg>
      <Caption>
        Hver verdi i Python er et heap-objekt med et <code>id</code>. Type, mutabilitet og syntaktisk kjennemerke avgjør hvordan du leser koden.
      </Caption>
    </figure>
  );
};

/* =====================================================================
 * FIRST-PRINCIPLES FOUNDATION FIGURES
 *
 * Disse figurene viser steg-for-steg hva som faktisk skjer når Python
 * kjører de vanligste konstruksjonene. Mål: gi leseren et mentalt bilde
 * av evaluation order, scope og hvordan syntaks oversettes til runtime-
 * oppførsel.
 * ===================================================================*/

/* Kap. 4 — Hva skjer steg-for-steg i en if/elif/else-kjede */
export const ConditionalAnatomy: FC = () => {
  // Eksempel: temp = 22, viser hvilken grein som vinner.
  const lines: Array<{
    label: string;
    expr: string;
    state: "skip" | "win" | "after-win";
  }> = [
    { label: "if",   expr: "temp > 25",  state: "skip" },
    { label: "elif", expr: "temp > 15",  state: "win" },
    { label: "else", expr: "(uten test)", state: "after-win" },
  ];
  const rowH = 56;
  const startY = 50;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 260" className="w-full max-w-md mx-auto text-foreground">
        {/* Header: starting value */}
        <rect x={10} y={10} width={340} height={28} fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
        <text x={20} y={28} className="text-[11px] fill-current font-mono">temp = 22   ↓ (Python går fra topp til bunn)</text>
        {lines.map((row, i) => {
          const y = startY + i * rowH;
          const isWin = row.state === "win";
          const isSkip = row.state === "skip";
          const isAfter = row.state === "after-win";
          const fill = isWin
            ? "color-mix(in oklch, var(--success) 22%, transparent)"
            : "color-mix(in oklch, var(--muted) 25%, transparent)";
          const opacity = isAfter ? 0.45 : isSkip ? 0.65 : 1;
          return (
            <g key={row.label} opacity={opacity}>
              {/* Condition box */}
              <rect x={10} y={y} width={130} height={42} fill={fill} stroke={STROKE} />
              <text x={20} y={y + 17} className="text-[10px] fill-current opacity-80">{row.label}</text>
              <text x={20} y={y + 33} className="text-[11px] fill-current font-mono">{row.expr}</text>
              {/* Arrow */}
              <path d={`M 140 ${y + 21} L 188 ${y + 21}`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
              {/* Result */}
              {isSkip && (
                <>
                  <rect x={190} y={y + 8} width={70} height={26} fill="color-mix(in oklch, var(--muted) 25%, transparent)" stroke={STROKE} />
                  <text x={225} y={y + 25} textAnchor="middle" className="text-[10px] fill-current">False</text>
                  <text x={270} y={y + 25} className="text-[10px] fill-current opacity-70">→ hopp videre</text>
                </>
              )}
              {isWin && (
                <>
                  <rect x={190} y={y + 8} width={70} height={26} fill="color-mix(in oklch, var(--success) 28%, transparent)" stroke={STROKE} />
                  <text x={225} y={y + 25} textAnchor="middle" className="text-[10px] fill-current font-semibold">True</text>
                  <rect x={190} y={y + 36} width={160} height={18} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
                  <text x={198} y={y + 49} className="text-[10px] fill-current font-mono">melding = "Behagelig."</text>
                </>
              )}
              {isAfter && (
                <>
                  <rect x={190} y={y + 8} width={140} height={26} fill="color-mix(in oklch, var(--muted) 20%, transparent)" stroke={STROKE} strokeDasharray="3,2" />
                  <text x={260} y={y + 25} textAnchor="middle" className="text-[10px] fill-current opacity-70">aldri evaluert</text>
                </>
              )}
            </g>
          );
        })}
        <text x={10} y={235} className="text-[10px] fill-current opacity-80">
          Regel: første True vinner. Resten av kjeden hoppes over.
        </text>
        <text x={10} y={250} className="text-[10px] fill-current opacity-80">
          else kjører kun hvis ingen av de over var True.
        </text>
        <IdArrowDef />
      </svg>
      <Caption>
        En if/elif/else-kjede er en topp-til-bunn-evaluering. Akkurat én blokk kjører — eller ingen, om bare <code>if</code> uten <code>else</code> brukes.
      </Caption>
    </figure>
  );
};

/* Kap. 4 — Truthiness: hva regnes som sant/usant */
export const TruthinessLadder: FC = () => {
  const groups: Array<{ label: string; items: string[]; falsy: boolean }> = [
    { label: "Falsy (regnes som False)", falsy: true,  items: ["False", "None", "0", "0.0", '""', "[]", "{}", "set()"] },
    { label: "Truthy (regnes som True)", falsy: false, items: ["True", "1", "-1", '"hei"', "[0]", "{0:0}", "{1}", "objekt"] },
  ];
  const groupH = 90;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
        {groups.map((g, gi) => {
          const y = 10 + gi * groupH;
          const fill = g.falsy
            ? "color-mix(in oklch, var(--warning) 14%, transparent)"
            : "color-mix(in oklch, var(--success) 14%, transparent)";
          return (
            <g key={g.label}>
              <rect x={10} y={y} width={340} height={groupH - 8} fill={fill} stroke={STROKE} />
              <text x={20} y={y + 18} className="text-[11px] fill-current font-semibold">{g.label}</text>
              {g.items.map((it, i) => (
                <g key={it}>
                  <rect
                    x={20 + (i % 4) * 80}
                    y={y + 28 + Math.floor(i / 4) * 24}
                    width={70}
                    height={20}
                    fill="color-mix(in oklch, var(--background) 80%, transparent)"
                    stroke={STROKE}
                    strokeOpacity={0.3}
                  />
                  <text
                    x={55 + (i % 4) * 80}
                    y={y + 42 + Math.floor(i / 4) * 24}
                    textAnchor="middle"
                    className="text-[10px] fill-current font-mono"
                  >
                    {it}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
        <text x={10} y={203} className="text-[9px] fill-current opacity-70">
          Tomme samlinger og 0-aktige verdier er falsy.
        </text>
        <text x={10} y={215} className="text-[9px] fill-current opacity-70">
          Alt annet — også objekter — er truthy.
        </text>
      </svg>
      <Caption>
        Når <code>if x</code> sjekker en verdi som ikke er bool, oversetter Python via <code>bool(x)</code> etter disse reglene.
      </Caption>
    </figure>
  );
};

/* Kap. 5 — Anatomien av en løkke: 4 steg som gjentas */
export const LoopAnatomy: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 260" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[11px] fill-current font-semibold">while-løkke: 4 steg som gjentas</text>
      {/* Step 1: init (one-time) */}
      <rect x={10} y={28} width={140} height={32} fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x={20} y={42} className="text-[10px] fill-current opacity-80">1. init (én gang)</text>
      <text x={20} y={56} className="text-[11px] fill-current font-mono">i = 0</text>
      <path d={`M 80 60 L 80 78`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Step 2: check */}
      <rect x={10} y={80} width={140} height={36} fill="color-mix(in oklch, var(--success) 16%, transparent)" stroke={STROKE} />
      <text x={20} y={95} className="text-[10px] fill-current opacity-80">2. sjekk betingelse</text>
      <text x={20} y={110} className="text-[11px] fill-current font-mono">i &lt; 3 ?</text>
      {/* False branch out to right */}
      <path d={`M 150 98 L 240 98`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x={156} y={92} className="text-[10px] fill-current opacity-80">False →</text>
      <rect x={240} y={84} width={110} height={28} fill="color-mix(in oklch, var(--muted) 25%, transparent)" stroke={STROKE} />
      <text x={295} y={102} textAnchor="middle" className="text-[10px] fill-current">avslutt løkke</text>
      <path d={`M 80 116 L 80 138`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x={88} y={132} className="text-[10px] fill-current opacity-80">True ↓</text>
      {/* Step 3: body */}
      <rect x={10} y={140} width={140} height={36} fill="color-mix(in oklch, var(--brand) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={155} className="text-[10px] fill-current opacity-80">3. kropp kjører</text>
      <text x={20} y={170} className="text-[11px] fill-current font-mono">print(i)</text>
      <path d={`M 80 176 L 80 196`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Step 4: mutate */}
      <rect x={10} y={198} width={140} height={36} fill="color-mix(in oklch, var(--warning) 16%, transparent)" stroke={STROKE} />
      <text x={20} y={213} className="text-[10px] fill-current opacity-80">4. muter (kritisk!)</text>
      <text x={20} y={228} className="text-[11px] fill-current font-mono">i = i + 1</text>
      {/* Loop back arrow */}
      <path d={`M 150 216 Q 200 216 200 98 L 152 98`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} strokeDasharray="3,2" />
      <text x={206} y={160} className="text-[9px] fill-current opacity-70">tilbake til 2</text>
      {/* Hint */}
      <text x={10} y={252} className="text-[10px] fill-current opacity-80">
        Glem steg 4 og betingelsen blir aldri False → evig løkke.
      </text>
      <IdArrowDef />
    </svg>
    <Caption>
      Hver while-løkke er disse fire stegene. <code>for</code> skjuler steg 1 og 4 i iterator-protokollen — derfor blir den sjelden evig.
    </Caption>
  </figure>
);

/* Kap. 5 — for-løkke desugars til iterator-protokoll */
export const ForLoopDesugar: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[11px] fill-current font-semibold">for x in xs:  ←→  hva Python egentlig gjør</text>
      {/* Source code */}
      <rect x={10} y={30} width={150} height={70} fill="color-mix(in oklch, var(--brand) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={48} className="text-[10px] fill-current opacity-80">Slik du skriver:</text>
      <text x={20} y={66} className="text-[11px] fill-current font-mono">for x in [10, 20]:</text>
      <text x={20} y={82} className="text-[11px] fill-current font-mono">    print(x)</text>
      {/* Arrow */}
      <path d={`M 165 65 L 195 65`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      <text x={170} y={58} className="text-[9px] fill-current opacity-70">tilsvarer</text>
      {/* Desugared */}
      <rect x={200} y={30} width={150} height={140} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x={210} y={48} className="text-[10px] fill-current opacity-80">Det Python gjør:</text>
      <text x={210} y={66} className="text-[10px] fill-current font-mono">it = iter([10,20])</text>
      <text x={210} y={82} className="text-[10px] fill-current font-mono">while True:</text>
      <text x={218} y={96} className="text-[10px] fill-current font-mono">try:</text>
      <text x={226} y={110} className="text-[10px] fill-current font-mono">x = next(it)</text>
      <text x={218} y={124} className="text-[10px] fill-current font-mono">except</text>
      <text x={226} y={138} className="text-[10px] fill-current font-mono">StopIteration:</text>
      <text x={234} y={152} className="text-[10px] fill-current font-mono">break</text>
      <text x={218} y={166} className="text-[10px] fill-current font-mono">print(x)</text>
      {/* Iterator boxes below */}
      <text x={10} y={194} className="text-[10px] fill-current opacity-80">Iteratoren holder en intern posisjon:</text>
      {[0, 1, 2].map((step) => (
        <g key={step}>
          <rect x={10 + step * 115} y={205} width={105} height={30} fill="color-mix(in oklch, var(--warning) 14%, transparent)" stroke={STROKE} />
          <text x={20 + step * 115} y={220} className="text-[9px] fill-current opacity-80">next() #{step + 1}</text>
          <text x={20 + step * 115} y={232} className="text-[10px] fill-current font-mono">
            {step === 0 ? "→ 10" : step === 1 ? "→ 20" : "→ StopIter"}
          </text>
        </g>
      ))}
      <IdArrowDef />
    </svg>
    <Caption>
      <code>for</code> er syntaktisk sukker for en iterator + <code>next()</code>-løkke. Derfor virker den på alt som er itererbart — lister, strenger, generator-funksjoner.
    </Caption>
  </figure>
);

/* Kap. 6 — Anatomien av en funksjon: navn, parametre, body, return */
export const FunctionAnatomy: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 280" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[11px] fill-current font-semibold">def-en, ord for ord</text>
      {/* Top: the def line with labels */}
      <rect x={10} y={30} width={340} height={72} fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <text x={20} y={60} className="text-[14px] fill-current font-mono">def</text>
      <text x={55} y={60} className="text-[14px] fill-current font-mono">hilsen</text>
      <text x={110} y={60} className="text-[14px] fill-current font-mono">(navn, gjest=False):</text>
      {/* Labels with arrows */}
      <path d={`M 30 70 L 30 86`} fill="none" stroke={STROKE} />
      <text x={10} y={97} className="text-[9px] fill-current opacity-80">nøkkelord</text>
      <path d={`M 80 70 L 80 86`} fill="none" stroke={STROKE} />
      <text x={62} y={97} className="text-[9px] fill-current opacity-80">funksjons-navn</text>
      <path d={`M 170 70 L 170 86`} fill="none" stroke={STROKE} />
      <text x={148} y={97} className="text-[9px] fill-current opacity-80">parametre (default)</text>
      {/* Body box */}
      <rect x={10} y={114} width={340} height={70} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={134} className="text-[10px] fill-current opacity-80">kropp — kjøres når funksjonen kalles, ikke ved def</text>
      <text x={36} y={152} className="text-[12px] fill-current font-mono">if gjest: return f"Velkommen, {`{navn}`}!"</text>
      <text x={36} y={170} className="text-[12px] fill-current font-mono">return f"Hei, {`{navn}`}!"</text>
      {/* Bottom: the call */}
      <text x={10} y={206} className="text-[11px] fill-current font-semibold">Kallet, ord for ord</text>
      <rect x={10} y={216} width={340} height={36} fill="color-mix(in oklch, var(--warning) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={240} className="text-[14px] fill-current font-mono">svar = hilsen("Ada", gjest=True)</text>
      {/* Labels under call */}
      <text x={10} y={266} className="text-[9px] fill-current opacity-80">
        navn → "Ada" (posisjonelt). gjest → True (nøkkelord). svar = returverdi.
      </text>
    </svg>
    <Caption>
      <code>def</code> bygger et funksjons-objekt og binder navnet. Kallet binder argumenter til parametre, kjører kroppen, og <code>return</code> gir verdien tilbake til kallstedet.
    </Caption>
  </figure>
);

/* Kap. 6 — Hva en funksjons-kall lager på stacken (frame-detalj) */
export const CallFrameDetail: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[11px] fill-current font-semibold">Kallstack mens hilsen("Ada", True) kjører</text>
      {/* Outer frame */}
      <rect x={10} y={30} width={340} height={70} fill="color-mix(in oklch, var(--muted) 18%, transparent)" stroke={STROKE} />
      <text x={20} y={48} className="text-[10px] fill-current opacity-80">ramme: &lt;modul&gt; (kalleren)</text>
      <text x={20} y={68} className="text-[11px] fill-current font-mono">svar = ?  (venter på return)</text>
      <text x={20} y={86} className="text-[10px] fill-current opacity-70">retur-adresse: linje 12 i hovedprogrammet</text>
      {/* Inner frame */}
      <rect x={10} y={114} width={340} height={84} fill="color-mix(in oklch, var(--success) 16%, transparent)" stroke={STROKE} />
      <text x={20} y={132} className="text-[10px] fill-current opacity-80">ramme: hilsen — NY på toppen</text>
      <text x={20} y={150} className="text-[11px] fill-current font-mono">navn  = "Ada"</text>
      <text x={20} y={166} className="text-[11px] fill-current font-mono">gjest = True</text>
      <text x={20} y={184} className="text-[10px] fill-current opacity-70">linje: 2 (akkurat nå)</text>
      {/* Annotation */}
      <text x={10} y={216} className="text-[10px] fill-current opacity-80">
        Når return kjører: rammen poppes, verdien til kalleren.
      </text>
      <text x={10} y={230} className="text-[10px] fill-current opacity-80">
        Hver kall = én ramme. Rekursjon = mange like rammer.
      </text>
    </svg>
    <Caption>
      En ramme holder lokale variabler + retur-adresse. Stacken vokser ved kall, krymper ved return.
    </Caption>
  </figure>
);

/* Kap. 7 — Metode-kall: obj.m(x) desugars til Klasse.m(obj, x) */
export const MethodVsFunction: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 260" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[11px] fill-current font-semibold">obj.m(x)  →  oversettes til Klasse.m(obj, x)</text>
      {/* Left: how you write */}
      <rect x={10} y={30} width={150} height={56} fill="color-mix(in oklch, var(--brand) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={48} className="text-[10px] fill-current opacity-80">Slik du skriver:</text>
      <text x={20} y={68} className="text-[13px] fill-current font-mono">rex.bjeff()</text>
      <text x={20} y={82} className="text-[9px] fill-current opacity-70">instans . metode-navn</text>
      {/* Right: how Python runs it */}
      <rect x={200} y={30} width={150} height={56} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x={210} y={48} className="text-[10px] fill-current opacity-80">Det Python gjør:</text>
      <text x={210} y={68} className="text-[13px] fill-current font-mono">Hund.bjeff(rex)</text>
      <text x={210} y={82} className="text-[9px] fill-current opacity-70">klasse . metode (instans)</text>
      <path d={`M 165 58 L 195 58`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Two-step lookup */}
      <text x={10} y={110} className="text-[11px] fill-current font-semibold">To-stegs oppslag:</text>
      <rect x={10} y={120} width={340} height={28} fill="color-mix(in oklch, var(--warning) 12%, transparent)" stroke={STROKE} />
      <text x={20} y={138} className="text-[10px] fill-current font-mono">
        1) finn <tspan className="opacity-80">bjeff</tspan> i <tspan className="opacity-80">rex.__class__</tspan> → Hund.bjeff
      </text>
      <rect x={10} y={154} width={340} height={28} fill="color-mix(in oklch, var(--warning) 12%, transparent)" stroke={STROKE} />
      <text x={20} y={172} className="text-[10px] fill-current font-mono">
        2) kall den med <tspan className="opacity-80">rex</tspan> som første argument (selv)
      </text>
      {/* Bottom: definition with self highlighted */}
      <rect x={10} y={194} width={340} height={42} fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
      <text x={20} y={212} className="text-[11px] fill-current font-mono">def bjeff(self):</text>
      <text x={20} y={228} className="text-[11px] fill-current font-mono">    return f"{`{self.navn}`} sier voff!"</text>
      <text x={10} y={252} className="text-[9px] fill-current opacity-80">
        self er ikke magisk — det er bare den lokale variabelen som mottar instansen.
      </text>
      <IdArrowDef />
    </svg>
    <Caption>
      En metode er en funksjon definert inne i en klasse. Punkt-syntaksen sender instansen som første argument automatisk — det vi vanligvis kaller <code>self</code>.
    </Caption>
  </figure>
);

/* Kap. 6 (assignment) — = evaluerer høyre først, så binder navn til adresse */
export const AssignmentSteps: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={18} className="text-[11px] fill-current font-semibold">x = 3 + 4 * 2 — fire steg</text>
      {/* Step 1: evaluate RHS */}
      <rect x={10} y={30} width={340} height={32} fill="color-mix(in oklch, var(--brand) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={48} className="text-[10px] fill-current opacity-80">1. Evaluér høyre side først (her: regn ut uttrykket)</text>
      <text x={20} y={60} className="text-[11px] fill-current font-mono">3 + 4*2  →  3 + 8  →  11</text>
      <path d={`M 175 62 L 175 78`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Step 2: heap object */}
      <rect x={10} y={80} width={340} height={32} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={98} className="text-[10px] fill-current opacity-80">2. Resultatet lever som et objekt på heap-en</text>
      <text x={20} y={110} className="text-[11px] fill-current font-mono">int-objekt 11    id=140234…</text>
      <path d={`M 175 112 L 175 128`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Step 3: bind name */}
      <rect x={10} y={130} width={340} height={32} fill="color-mix(in oklch, var(--warning) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={148} className="text-[10px] fill-current opacity-80">3. Navnet x bindes til adressen til det objektet</text>
      <text x={20} y={160} className="text-[11px] fill-current font-mono">x  →  id=140234…</text>
      <path d={`M 175 162 L 175 178`} fill="none" stroke={STROKE} markerEnd={`url(#${ARR_ID})`} />
      {/* Step 4: future use */}
      <rect x={10} y={180} width={340} height={32} fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
      <text x={20} y={198} className="text-[10px] fill-current opacity-80">4. Senere bruk slår opp adressen og leser verdien (11)</text>
      <text x={20} y={210} className="text-[11px] fill-current font-mono">print(x)  →  les id  →  11</text>
      <IdArrowDef />
    </svg>
    <Caption>
      <code>=</code> i Python er <em>navn → adresse</em>, ikke <em>boks ← verdi</em>. Derfor kan flere navn peke på samme objekt (aliasing).
    </Caption>
  </figure>
);

/* Kap. 5 — Operator-precedence (hva binder strammest) */
export const OperatorPrecedence: FC = () => {
  const rows: Array<{ ops: string; example: string; tier: number }> = [
    { ops: "**",                  example: "2 ** 3",         tier: 1 },
    { ops: "+x  -x  ~x",          example: "-5",             tier: 2 },
    { ops: "*  /  //  %",         example: "6 * 4",          tier: 3 },
    { ops: "+  -",                example: "3 + 4",          tier: 4 },
    { ops: "==  !=  <  >  is",    example: "x == 0",         tier: 5 },
    { ops: "not",                 example: "not done",       tier: 6 },
    { ops: "and",                 example: "a and b",        tier: 7 },
    { ops: "or",                  example: "a or b",         tier: 8 },
    { ops: "=  +=  ...",          example: "x = 11",         tier: 9 },
  ];
  const rowH = 20;
  const totalH = 38 + rows.length * rowH + 28;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 360 ${totalH}`} className="w-full max-w-md mx-auto text-foreground">
        <text x={10} y={18} className="text-[11px] fill-current font-semibold">Hvem binder strammest? (1 = sterkest)</text>
        <text x={10} y={32} className="text-[10px] fill-current opacity-70">Python evaluerer høy prioritet før lav — uten paranteser.</text>
        {rows.map((r, i) => {
          const y = 40 + i * rowH;
          const fill = `color-mix(in oklch, var(--brand) ${18 - r.tier}%, transparent)`;
          return (
            <g key={r.ops}>
              <rect x={10} y={y} width={340} height={rowH - 2} fill={fill} stroke={STROKE} strokeOpacity={0.3} />
              <text x={20} y={y + 14} className="text-[10px] fill-current font-mono font-semibold">{r.tier}</text>
              <text x={50} y={y + 14} className="text-[10px] fill-current font-mono">{r.ops}</text>
              <text x={220} y={y + 14} className="text-[10px] fill-current font-mono opacity-80">{r.example}</text>
            </g>
          );
        })}
        <text x={10} y={totalH - 8} className="text-[9px] fill-current opacity-70">
          aritmetikk &gt; sammenligning &gt; logikk &gt; tilordning.
        </text>
      </svg>
      <Caption>
        Når et uttrykk har flere operatorer, evalueres høy prioritet først. <code>3 + 4 * 2</code> = <code>3 + 8</code> = <code>11</code>, ikke <code>14</code>.
      </Caption>
    </figure>
  );
};

/* Kap. 4 — Indentation: hvordan Python bygger blokker */
export const IndentationBlocks: FC = () => {
  // Visual representation: each indent level is a "stair step"
  // Show same code structured by indentation, with vertical "block boundary" lines.
  const lines: Array<{ indent: number; text: string; tag?: string; highlight?: boolean }> = [
    { indent: 0, text: "if temp > 0:",                tag: "blokk-start (if)", highlight: true },
    { indent: 1, text: "print('over null')",          tag: "i blokken" },
    { indent: 1, text: "if temp > 20:",               tag: "nested blokk-start", highlight: true },
    { indent: 2, text: "print('varmt')",              tag: "indre blokk" },
    { indent: 1, text: "print('uansett positiv')",    tag: "fortsatt i if-blokken" },
    { indent: 0, text: "print('alltid')",             tag: "utenfor if" },
  ];
  const rowH = 26;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
        <text x={10} y={16} className="text-[11px] fill-current font-semibold">Hvert innrykk = ny blokk. Slutt på innrykk = slutt på blokk.</text>
        {/* Indent guide lines */}
        <line x1={28} y1={28} x2={28} y2={28 + lines.length * rowH} stroke={STROKE} strokeOpacity={0.2} strokeDasharray="2,2" />
        <line x1={46} y1={62} x2={46} y2={28 + 5 * rowH} stroke={STROKE} strokeOpacity={0.2} strokeDasharray="2,2" />
        <line x1={64} y1={88} x2={64} y2={28 + 4 * rowH} stroke={STROKE} strokeOpacity={0.2} strokeDasharray="2,2" />
        {lines.map((line, i) => {
          const y = 28 + i * rowH;
          const x = 20 + line.indent * 18;
          const fill = line.highlight
            ? "color-mix(in oklch, var(--brand) 18%, transparent)"
            : "color-mix(in oklch, var(--muted) 18%, transparent)";
          return (
            <g key={i}>
              <rect x={x} y={y} width={140} height={rowH - 4} fill={fill} stroke={STROKE} strokeOpacity={0.4} />
              <text x={x + 6} y={y + 15} className="text-[11px] fill-current font-mono">{line.text}</text>
              {line.tag && (
                <text x={208} y={y + 15} className="text-[9px] fill-current opacity-70">{line.tag}</text>
              )}
            </g>
          );
        })}
        <text x={10} y={210} className="text-[9px] fill-current opacity-70">
          4 mellomrom per nivå er konvensjon. Tab blandet med mellomrom feiler.
        </text>
      </svg>
      <Caption>
        Python har ingen <code>{`{ }`}</code>. Innrykk er språket — alle linjer med samme innrykk hører til samme blokk.
      </Caption>
    </figure>
  );
};

/* Kap. 8 — Slicing: hva s[a:b:c] egentlig betyr */
export const SlicingAnatomy: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 270" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={16} className="text-[11px] fill-current font-mono font-semibold">s = "PYTHON"</text>
      {/* Top: indices */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={`pos-${i}`}>
          <text x={32 + i * 42} y={32} textAnchor="middle" className="text-[9px] fill-current opacity-70">{i}</text>
          <text x={32 + i * 42} y={44} textAnchor="middle" className="text-[8px] fill-current opacity-50">{i - 6}</text>
        </g>
      ))}
      {/* Boxes */}
      {["P", "Y", "T", "H", "O", "N"].map((c, i) => (
        <g key={`c-${i}`}>
          <rect x={14 + i * 42} y={50} width={36} height={32} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
          <text x={32 + i * 42} y={71} textAnchor="middle" className="text-[14px] fill-current font-mono">{c}</text>
        </g>
      ))}
      {/* Edge labels (slice boundaries) */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <text key={`e-${i}`} x={14 + i * 42} y={94} textAnchor="middle" className="text-[8px] fill-current opacity-50">|{i}</text>
      ))}
      <text x={10} y={108} className="text-[9px] fill-current opacity-70">
        Skiver kutter på kantene (|0, |1, …), ikke på selve tegnet. Negativ = teller fra slutten.
      </text>
      {/* Examples */}
      <text x={10} y={132} className="text-[11px] fill-current font-semibold">Eksempler</text>
      {[
        { call: 's[0:3]',  meaning: 'fra |0 til |3 (eks)',     result: '"PYT"' },
        { call: 's[2:]',   meaning: 'fra |2 til slutt',         result: '"THON"' },
        { call: 's[:4]',   meaning: 'fra start til |4',         result: '"PYTH"' },
        { call: 's[-3:]',  meaning: 'siste 3 tegn',             result: '"HON"' },
        { call: 's[::2]',  meaning: 'hvert 2. tegn',            result: '"PTO"' },
        { call: 's[::-1]', meaning: 'baklengs',                 result: '"NOHTYP"' },
      ].map((row, i) => {
        const y = 142 + i * 18;
        return (
          <g key={row.call}>
            <text x={14} y={y} className="text-[10px] fill-current font-mono">{row.call}</text>
            <text x={90} y={y} className="text-[9px] fill-current opacity-70">{row.meaning}</text>
            <text x={250} y={y} className="text-[10px] fill-current font-mono">→ {row.result}</text>
          </g>
        );
      })}
      <text x={10} y={262} className="text-[9px] fill-current opacity-70">
        s[a:b:c] — a er start (inkl.), b er stopp (eksl.), c er steg.
      </text>
    </svg>
    <Caption>
      Slicing snittet på <em>kantene mellom</em> tegn (|0, |1, …) — derfor er stoppen eksklusiv. Det forklarer også at <code>s[:n]</code> og <code>s[n:]</code> sammen gir hele strengen.
    </Caption>
  </figure>
);

/* Kap. 10 — List comprehension som syntaktisk sukker for for+append */
export const ComprehensionDesugar: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 270" className="w-full max-w-md mx-auto text-foreground">
      <text x={10} y={16} className="text-[11px] fill-current font-semibold">List-comprehension ←→ den lange for-løkken</text>
      {/* Left: comprehension form, anatomized */}
      <rect x={10} y={28} width={340} height={48} fill="color-mix(in oklch, var(--brand) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={56} className="text-[13px] fill-current font-mono">[ x*x  for x in xs  if x &gt; 0 ]</text>
      <path d={`M 45 60 L 45 72`} fill="none" stroke={STROKE} />
      <text x={20} y={82} className="text-[8px] fill-current opacity-70">uttrykk</text>
      <path d={`M 120 60 L 120 72`} fill="none" stroke={STROKE} />
      <text x={92} y={82} className="text-[8px] fill-current opacity-70">løkke-variabel</text>
      <path d={`M 215 60 L 215 72`} fill="none" stroke={STROKE} />
      <text x={194} y={82} className="text-[8px] fill-current opacity-70">filter (valgfritt)</text>
      {/* Middle: arrow */}
      <text x={180} y={108} textAnchor="middle" className="text-[10px] fill-current opacity-80">≡ er nøyaktig det samme som</text>
      {/* Right: desugared for-loop */}
      <rect x={10} y={120} width={340} height={108} fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x={20} y={138} className="text-[11px] fill-current font-mono">result = []</text>
      <text x={20} y={156} className="text-[11px] fill-current font-mono">for x in xs:</text>
      <text x={36} y={174} className="text-[11px] fill-current font-mono">if x &gt; 0:</text>
      <text x={52} y={192} className="text-[11px] fill-current font-mono">result.append(x*x)</text>
      <text x={20} y={216} className="text-[10px] fill-current opacity-70">(implisitt returverdi)</text>
      {/* Annotation: order of parts */}
      <text x={10} y={246} className="text-[9px] fill-current opacity-80">
        Rekkefølge: les comp-en fra venstre høyre → for → if → expr.
      </text>
      <text x={10} y={260} className="text-[9px] fill-current opacity-80">
        Tenk: "samle x*x for hver x i xs, der x &gt; 0."
      </text>
    </svg>
    <Caption>
      Comprehensions er ikke magi — bare en kompakt skrivemåte for "lag en liste ved å iterere og samle". Dict- og set-comp følger samme mønster: <code>{`{k: v for ...}`}</code>, <code>{`{x for ...}`}</code>.
    </Caption>
  </figure>
);
