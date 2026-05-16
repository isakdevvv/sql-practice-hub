import { useEffect, useMemo, useState } from "react";
import { Eye, Palette, RefreshCw, ArrowRight } from "lucide-react";
import { Tex, TexBlock } from "@/components/Tex";

/**
 * Diffie-Hellman key exchange — visualized two ways:
 *   1. Paint mixing analogy with three RGB-sliders per party
 *   2. Real DH numerical example (p=23, g=5) with all computations shown
 *
 * Why this works: mixing colors is easy one way (combine), hard to reverse
 * (un-mix). DH does the same with modular exponentiation: A = g^a mod p is
 * easy, but recovering a from A is the discrete-log problem.
 */

type RGB = { r: number; g: number; b: number };

function clamp(n: number, lo = 0, hi = 255) {
  return Math.max(lo, Math.min(hi, n));
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Average-mix: simple, intuitive, and visually obvious. */
function mix(a: RGB, b: RGB): RGB {
  return {
    r: (a.r + b.r) / 2,
    g: (a.g + b.g) / 2,
    b: (a.b + b.b) / 2,
  };
}

/** Big-int safe modular exponentiation (small numbers here, but explicit). */
function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    e >>>= 1;
    b = (b * b) % mod;
  }
  return result;
}

const COMMON_PAINT: RGB = { r: 240, g: 200, b: 30 }; // public "yellow"

function Swatch({
  color,
  label,
  size = 80,
  withRing,
}: {
  color: RGB;
  label?: string;
  size?: number;
  withRing?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`rounded-lg border border-border shadow-inner ${
          withRing ? "ring-2 ring-brand ring-offset-2 ring-offset-background" : ""
        }`}
        style={{
          backgroundColor: rgbToHex(color),
          width: size,
          height: size,
        }}
        aria-label={label ?? "color swatch"}
      />
      {label ? (
        <div className="text-[10px] font-mono text-muted-foreground text-center max-w-[100px]">
          {label}
        </div>
      ) : null}
    </div>
  );
}

function RGBSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RGB;
  onChange: (v: RGB) => void;
}) {
  const channels = [
    { key: "r" as const, name: "R", color: "#ef4444" },
    { key: "g" as const, name: "G", color: "#22c55e" },
    { key: "b" as const, name: "B", color: "#3b82f6" },
  ];
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-semibold mb-2">{label}</div>
      <div className="space-y-1.5">
        {channels.map((c) => (
          <div key={c.key} className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono w-3"
              style={{ color: c.color }}
            >
              {c.name}
            </span>
            <input
              type="range"
              min={0}
              max={255}
              value={Math.round(value[c.key])}
              onChange={(ev) =>
                onChange({ ...value, [c.key]: Number(ev.target.value) })
              }
              className="flex-1 h-1.5 accent-brand"
            />
            <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
              {Math.round(value[c.key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiffieHellmanColors() {
  // ───────── Paint-mix panel ─────────
  const [alicePrivate, setAlicePrivate] = useState<RGB>({ r: 30, g: 80, b: 220 });
  const [bobPrivate, setBobPrivate] = useState<RGB>({ r: 220, g: 40, b: 60 });
  const [step, setStep] = useState<0 | 1 | 2 | 3>(3);

  // Auto-advance the mixing animation when colors change.
  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 250);
    const t2 = setTimeout(() => setStep(2), 700);
    const t3 = setTimeout(() => setStep(3), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [alicePrivate, bobPrivate]);

  const aliceTransit = useMemo(
    () => mix(COMMON_PAINT, alicePrivate),
    [alicePrivate],
  );
  const bobTransit = useMemo(() => mix(COMMON_PAINT, bobPrivate), [bobPrivate]);
  const aliceShared = useMemo(
    () => mix(bobTransit, alicePrivate),
    [bobTransit, alicePrivate],
  );
  const bobShared = useMemo(
    () => mix(aliceTransit, bobPrivate),
    [aliceTransit, bobPrivate],
  );

  // ───────── Number-DH panel ─────────
  const P = 23;
  const G = 5;
  const [a, setA] = useState(6);
  const [b, setB] = useState(15);
  const A = modPow(G, a, P);
  const B = modPow(G, b, P);
  const sharedFromA = modPow(B, a, P);
  const sharedFromB = modPow(A, b, P);

  function newRandomKeys() {
    // pick a, b in [2..p-2]
    setA(2 + Math.floor(Math.random() * (P - 3)));
    setB(2 + Math.floor(Math.random() * (P - 3)));
  }

  return (
    <div className="space-y-6">
      {/* PAINT panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <Palette className="h-4 w-4 text-brand" />
          Maling-blanding-analogi
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Mikse to malingsfarger er enkelt; å «un-mikse» en blanding tilbake til
          komponentene er praktisk talt umulig. Akkurat denne asymmetrien er
          fundamentet for Diffie-Hellman.
        </p>

        <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-4 items-start">
          {/* Alice column */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand">
              Alice (privat)
            </div>
            <RGBSlider
              label="Alice sin private farge"
              value={alicePrivate}
              onChange={setAlicePrivate}
            />
            <div className="flex items-center gap-3 justify-center">
              <Swatch color={alicePrivate} label="privat (hemmelig)" size={64} />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div
                className="transition-opacity duration-500"
                style={{ opacity: step >= 1 ? 1 : 0.15 }}
              >
                <Swatch color={aliceTransit} label="A: privat + felles" size={64} />
              </div>
            </div>
          </div>

          {/* Center: wire / common */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Offentlig kanal
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <div className="text-[10px] text-muted-foreground mb-2">
                Felles offentlig farge
              </div>
              <Swatch color={COMMON_PAINT} label="alle ser denne" size={56} />
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              <div className="flex items-start gap-2">
                <Eye className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-amber-700 dark:text-amber-400">Eve avlytter:</strong>{" "}
                  Eve ser felles + A + B men kan ikke utlede den hemmelige
                  delte fargen uten å gjette en av de private.
                </div>
              </div>
              <div className="flex items-center justify-around mt-2">
                <Swatch color={aliceTransit} size={36} />
                <Swatch color={COMMON_PAINT} size={36} />
                <Swatch color={bobTransit} size={36} />
              </div>
            </div>
            <div
              className="rounded-lg border-2 border-success/40 bg-success/5 p-3 text-center transition-opacity duration-500"
              style={{ opacity: step >= 3 ? 1 : 0.15 }}
            >
              <div className="text-[10px] font-semibold text-success uppercase tracking-wider mb-1">
                Delt hemmelig farge
              </div>
              <div className="flex justify-center">
                <Swatch color={aliceShared} size={56} withRing />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Begge sider beregner samme farge
              </div>
            </div>
          </div>

          {/* Bob column */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand">
              Bob (privat)
            </div>
            <RGBSlider
              label="Bob sin private farge"
              value={bobPrivate}
              onChange={setBobPrivate}
            />
            <div className="flex items-center gap-3 justify-center">
              <Swatch color={bobPrivate} label="privat (hemmelig)" size={64} />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div
                className="transition-opacity duration-500"
                style={{ opacity: step >= 1 ? 1 : 0.15 }}
              >
                <Swatch color={bobTransit} label="B: privat + felles" size={64} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: cross-mix arrows */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
          <div
            className="rounded-lg border border-brand/30 bg-brand/5 p-3 transition-opacity duration-500"
            style={{ opacity: step >= 2 ? 1 : 0.2 }}
          >
            <div className="font-semibold mb-1">Alice mottar B og mikser med privat</div>
            <div className="flex items-center gap-2">
              <Swatch color={bobTransit} size={32} />
              <span className="text-muted-foreground">+</span>
              <Swatch color={alicePrivate} size={32} />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Swatch color={aliceShared} size={32} />
            </div>
          </div>
          <div
            className="rounded-lg border border-brand/30 bg-brand/5 p-3 transition-opacity duration-500"
            style={{ opacity: step >= 2 ? 1 : 0.2 }}
          >
            <div className="font-semibold mb-1">Bob mottar A og mikser med privat</div>
            <div className="flex items-center gap-2">
              <Swatch color={aliceTransit} size={32} />
              <span className="text-muted-foreground">+</span>
              <Swatch color={bobPrivate} size={32} />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Swatch color={bobShared} size={32} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          <strong>Hvorfor virker det?</strong> Maling-blanding er
          kommutativ:{" "}
          <em>(felles + a) + b = (felles + b) + a</em>. Alice og Bob ender opp i
          samme blanding selv om de gjør operasjonene i forskjellig rekkefølge.
          Eve ser bare de tre offentlige fargene, og må «un-mikse» — ikke mulig.
        </p>
      </div>

      {/* Numerical DH panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-brand" />
            Ekte DH med tall — p = 23, g = 5
          </h3>
          <button
            onClick={newRandomKeys}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" />
            Nye tilfeldige a, b
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Samme idé, nå med modulær eksponentiasjon. Eve ser p, g, A og B, men
          må løse <Tex>{"a = \\log_g A \\pmod p"}</Tex> for å bryte — kjent som
          diskrét-logaritme-problemet, intraktabelt for store p.
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">
              Alice sin private a
            </div>
            <input
              type="range"
              min={2}
              max={P - 2}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="text-sm mt-1">
              <Tex>{`a = ${a}`}</Tex>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">
              Bob sin private b
            </div>
            <input
              type="range"
              min={2}
              max={P - 2}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="text-sm mt-1">
              <Tex>{`b = ${b}`}</Tex>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-semibold px-3 py-2 w-40">Steg</th>
                <th className="text-left font-semibold px-3 py-2">Formel</th>
                <th className="text-left font-semibold px-3 py-2 w-32">Verdi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Offentlige parametere</td>
                <td className="px-3 py-2">
                  <Tex>{"p, g"}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs">p=23, g=5</td>
              </tr>
              <tr className="border-t border-border bg-amber-500/5">
                <td className="px-3 py-2">Alice (hemmelig)</td>
                <td className="px-3 py-2">
                  <Tex>{`a`}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{a}</td>
              </tr>
              <tr className="border-t border-border bg-amber-500/5">
                <td className="px-3 py-2">Bob (hemmelig)</td>
                <td className="px-3 py-2">
                  <Tex>{`b`}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{b}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Alice publiserer</td>
                <td className="px-3 py-2">
                  <Tex>{`A = g^a \\bmod p = 5^{${a}} \\bmod 23`}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-brand font-semibold">
                  A = {A}
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Bob publiserer</td>
                <td className="px-3 py-2">
                  <Tex>{`B = g^b \\bmod p = 5^{${b}} \\bmod 23`}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-brand font-semibold">
                  B = {B}
                </td>
              </tr>
              <tr className="border-t border-border bg-success/5">
                <td className="px-3 py-2 font-semibold">Alice beregner s</td>
                <td className="px-3 py-2">
                  <Tex>{`s = B^a \\bmod p = ${B}^{${a}} \\bmod 23`}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-success font-semibold">
                  s = {sharedFromA}
                </td>
              </tr>
              <tr className="border-t border-border bg-success/5">
                <td className="px-3 py-2 font-semibold">Bob beregner s</td>
                <td className="px-3 py-2">
                  <Tex>{`s = A^b \\bmod p = ${A}^{${b}} \\bmod 23`}</Tex>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-success font-semibold">
                  s = {sharedFromB}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border-2 border-success/40 bg-success/5 p-4">
          <div className="text-xs font-semibold text-success uppercase tracking-wider mb-2">
            Algebraisk forklaring
          </div>
          <TexBlock>
            {`s_A = B^a = (g^b)^a = g^{ab} = (g^a)^b = A^b = s_B \\pmod p`}
          </TexBlock>
          <p className="text-xs text-muted-foreground mt-1">
            Begge sider regner ut <Tex>{"g^{ab} \\bmod p"}</Tex> — bare via to
            forskjellige veier. Eve har <Tex>{"g, p, A, B"}</Tex> men ingen{" "}
            <em>effektiv</em> algoritme for å finne <Tex>{"a"}</Tex> eller{" "}
            <Tex>{"b"}</Tex> når p er stor (typisk 2048 bit).
          </p>
        </div>

        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <strong className="text-amber-700 dark:text-amber-400">
            Caveat — MITM:
          </strong>{" "}
          Vanilje-DH autentiserer ikke partene. En aktiv angriper kan kjøre
          DH separat med begge sider. Derfor brukes DH alltid kombinert med
          signaturer eller sertifikater (det er det TLS gjør).
        </div>
      </div>
    </div>
  );
}
