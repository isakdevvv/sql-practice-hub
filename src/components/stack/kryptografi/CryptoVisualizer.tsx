import { useEffect, useMemo, useState } from "react";
import { RotateCcw, KeyRound, Hash, Lock, Wand2, Network } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for kryptografi-grunnlag.
// Fem moduser:
//   1) Caesar  — bokstav-rotasjon på alfabet-hjul
//   2) XOR     — byte-for-byte XOR med gjentakende nøkkel (binær)
//   3) Hash    — SHA-256 live, side-ved-side for avalanche-effekt
//   4) RSA-mini — håndregning med små primtall (n, φ, e, d, m^e, c^d)
//   5) Diffie-Hellman — g^a mod p, g^b mod p, delt nøkkel
// All Norsk-tekst. Tailwind + lucide-react.
// --------------------------------------------------------------------------

type Mode = "caesar" | "xor" | "hash" | "rsa" | "dh";

const MODES: { id: Mode; label: string; sub: string; icon: typeof KeyRound }[] = [
  { id: "caesar", label: "Caesar", sub: "skift hver bokstav", icon: Wand2 },
  { id: "xor", label: "XOR", sub: "byte ⊕ nøkkelbyte", icon: KeyRound },
  { id: "hash", label: "Hash (SHA-256)", sub: "avalanche-effekt", icon: Hash },
  { id: "rsa", label: "RSA-mini", sub: "håndregning med små primtall", icon: Lock },
  { id: "dh", label: "Diffie-Hellman", sub: "delt nøkkel uten å lekke", icon: Network },
];

export function CryptoVisualizer() {
  const [mode, setMode] = useState<Mode>("caesar");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Kryptografi">
      {/* Modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                title={m.sub}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground italic">
          {MODES.find((m) => m.id === mode)?.sub}
        </div>
      </div>

      <div className="p-4">
        {mode === "caesar" && <CaesarMode />}
        {mode === "xor" && <XorMode />}
        {mode === "hash" && <HashMode />}
        {mode === "rsa" && <RsaMode />}
        {mode === "dh" && <DiffieHellmanMode />}
      </div>
    </div>
  );
}

// ============================================================================
// 1) CAESAR
// ============================================================================

function CaesarMode() {
  const [text, setText] = useState("HEI VERDEN");
  const [shift, setShift] = useState(3);

  const cipher = useMemo(() => caesarShift(text, shift), [text, shift]);

  const reset = () => {
    setText("HEI VERDEN");
    setShift(3);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
            Klartekst
          </span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
            maxLength={40}
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
            Skift: <span className="text-brand font-mono">{shift >= 0 ? `+${shift}` : shift}</span>
          </span>
          <input
            type="range"
            min={-25}
            max={25}
            step={1}
            value={shift}
            onChange={(e) => setShift(Number.parseInt(e.target.value, 10))}
            className="w-full accent-brand"
          />
        </label>
      </div>

      <CaesarWheel shift={shift} />

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Bokstav-for-bokstav
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from(text).map((ch, i) => {
            const c = cipher[i] ?? "";
            const isLetter = /[A-Z]/.test(ch);
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 text-center">
                <div
                  className={`w-7 h-7 rounded border flex items-center justify-center font-mono text-sm ${
                    isLetter
                      ? "border-border bg-card text-foreground"
                      : "border-dashed border-border bg-transparent text-muted-foreground"
                  }`}
                >
                  {ch === " " ? "·" : ch}
                </div>
                <div className="text-muted-foreground text-[10px]">↓</div>
                <div
                  className={`w-7 h-7 rounded border flex items-center justify-center font-mono text-sm ${
                    isLetter
                      ? "border-brand/50 bg-brand/10 text-brand"
                      : "border-dashed border-border bg-transparent text-muted-foreground"
                  }`}
                >
                  {c === " " ? "·" : c}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs">
        <strong className="text-success">Chiffer:</strong>{" "}
        <span className="font-mono">{cipher}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Caesar er en <em>monoalfabetisk substitusjon</em>. Knust av frekvensanalyse: «E» er
          vanligst på norsk og engelsk.
        </span>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted text-xs"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );
}

function caesarShift(text: string, shift: number): string {
  const A = "A".charCodeAt(0);
  const s = ((shift % 26) + 26) % 26;
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - A + s) % 26) + A);
      }
      return ch;
    })
    .join("");
}

function CaesarWheel({ shift }: { shift: number }) {
  // To konsentriske hjul: ytre = klartekst, indre = chiffer (rotert).
  const N = 26;
  const outerR = 95;
  const innerR = 65;
  const size = 230;
  const cx = size / 2;
  const cy = size / 2;
  const A = "A".charCodeAt(0);
  const s = ((shift % 26) + 26) % 26;

  const angleFor = (i: number) => (i * 360) / N - 90; // A på topp

  return (
    <div className="flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-56 h-56">
        <circle cx={cx} cy={cy} r={outerR + 12} fill="none" className="stroke-border" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={innerR - 12} fill="none" className="stroke-border" strokeWidth={1} />
        {/* Ytre bokstaver — klartekst */}
        {Array.from({ length: N }, (_, i) => {
          const a = (angleFor(i) * Math.PI) / 180;
          const x = cx + outerR * Math.cos(a);
          const y = cy + outerR * Math.sin(a);
          return (
            <text
              key={`o-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              {String.fromCharCode(A + i)}
            </text>
          );
        })}
        {/* Indre bokstaver — chiffer, rotert */}
        {Array.from({ length: N }, (_, i) => {
          const a = (angleFor(i) * Math.PI) / 180;
          const x = cx + innerR * Math.cos(a);
          const y = cy + innerR * Math.sin(a);
          const ch = String.fromCharCode(A + ((i + s) % N));
          return (
            <text
              key={`i-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-brand"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}
            >
              {ch}
            </text>
          );
        })}
        {/* Markør på topp */}
        <line
          x1={cx}
          y1={cy - innerR - 18}
          x2={cx}
          y2={cy - outerR - 6}
          className="stroke-brand"
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy - outerR - 22}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}
        >
          A → {String.fromCharCode(A + s)}
        </text>
      </svg>
    </div>
  );
}

// ============================================================================
// 2) XOR
// ============================================================================

function XorMode() {
  const [text, setText] = useState("HEI");
  const [key, setKey] = useState("K");
  const [showRoundtrip, setShowRoundtrip] = useState(true);

  const textBytes = useMemo(() => new TextEncoder().encode(text), [text]);
  const keyBytes = useMemo(() => new TextEncoder().encode(key || " "), [key]);

  const rows = useMemo(() => {
    return Array.from(textBytes).map((b, i) => {
      const kb = keyBytes[i % keyBytes.length] ?? 0;
      const c = b ^ kb;
      const back = c ^ kb;
      return { i, b, kb, c, back };
    });
  }, [textBytes, keyBytes]);

  const reset = () => {
    setText("HEI");
    setKey("K");
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
            Klartekst
          </span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 16))}
            className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
            Nøkkel (gjentas)
          </span>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.slice(0, 8))}
            className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
          />
        </label>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left">i</th>
              <th className="px-2 py-2 text-left">tegn</th>
              <th className="px-2 py-2 text-left">klartekst-byte</th>
              <th className="px-2 py-2 text-left">⊕ nøkkel-byte</th>
              <th className="px-2 py-2 text-left">= chiffer-byte</th>
              {showRoundtrip && (
                <th className="px-2 py-2 text-left">⊕ samme nøkkel = klar</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.i} className="border-t border-border">
                <td className="px-2 py-1.5 text-muted-foreground">{r.i}</td>
                <td className="px-2 py-1.5">
                  '{String.fromCharCode(r.b)}' / '
                  {String.fromCharCode(keyBytes[r.i % keyBytes.length] ?? 0)}'
                </td>
                <td className="px-2 py-1.5 text-foreground">
                  {bin8(r.b)}{" "}
                  <span className="text-muted-foreground">(0x{hex2(r.b)})</span>
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">
                  {bin8(r.kb)} <span>(0x{hex2(r.kb)})</span>
                </td>
                <td className="px-2 py-1.5 text-brand">
                  {bin8(r.c)} <span className="text-muted-foreground">(0x{hex2(r.c)})</span>
                </td>
                {showRoundtrip && (
                  <td className="px-2 py-1.5 text-success">
                    {bin8(r.back)} = '{String.fromCharCode(r.back)}'
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-3 text-center text-muted-foreground">
                  Skriv noe i klartekst-feltet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={showRoundtrip}
            onChange={(e) => setShowRoundtrip(e.target.checked)}
            className="accent-brand"
          />
          Vis roundtrip-kolonne (XOR to ganger = original)
        </label>
        <button
          type="button"
          onClick={reset}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong className="text-amber-600 dark:text-amber-400">Hvorfor symmetrisk:</strong> XOR er
        sin egen inverse — <code>(p ⊕ k) ⊕ k = p</code>. Samme nøkkel både krypterer og dekrypterer.
        Det er prinsippet bak One-Time Pad og strømchiffer som ChaCha20.
      </div>
    </div>
  );
}

const bin8 = (b: number) => b.toString(2).padStart(8, "0");
const hex2 = (b: number) => b.toString(16).padStart(2, "0").toUpperCase();

// ============================================================================
// 3) HASH (SHA-256)
// ============================================================================

function HashMode() {
  const [a, setA] = useState("Den kvikke brune reven hopper over den late hunden");
  const [b, setB] = useState("Den kvikke brune reven hopper over den late hunde2");
  const [hashA, setHashA] = useState("");
  const [hashB, setHashB] = useState("");

  useEffect(() => {
    let cancelled = false;
    sha256Hex(a).then((h) => {
      if (!cancelled) setHashA(h);
    });
    return () => {
      cancelled = true;
    };
  }, [a]);

  useEffect(() => {
    let cancelled = false;
    sha256Hex(b).then((h) => {
      if (!cancelled) setHashB(h);
    });
    return () => {
      cancelled = true;
    };
  }, [b]);

  const diff = useMemo(() => bitDiff(hashA, hashB), [hashA, hashB]);
  const totalBits = hashA && hashB ? 256 : 0;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs space-y-1 block">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
              Streng A
            </span>
            <textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm font-mono resize-none"
            />
          </label>
          <HashBlock hash={hashA} label="SHA-256(A)" highlight="a" peer={hashB} />
        </div>
        <div className="space-y-2">
          <label className="text-xs space-y-1 block">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
              Streng B
            </span>
            <textarea
              value={b}
              onChange={(e) => setB(e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm font-mono resize-none"
            />
          </label>
          <HashBlock hash={hashB} label="SHA-256(B)" highlight="b" peer={hashA} />
        </div>
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs space-y-1">
        <div>
          <strong className="text-brand">Avalanche-effekt:</strong>{" "}
          {totalBits > 0 ? (
            <>
              {diff} av 256 bits er forskjellig (
              <span className="font-mono">{((diff / 256) * 100).toFixed(1)}%</span>). Ideelt skal
              en kryptografisk hash gi ~50% selv om input bare endres med én bit.
            </>
          ) : (
            "regner …"
          )}
        </div>
        <div className="text-muted-foreground">
          Endre én bokstav i en av strengene — observer hvordan hele utdataen omkalfatres.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => {
            setA("hei");
            setB("hei.");
          }}
          className="px-2 py-1 rounded border border-border hover:bg-muted"
        >
          Eksempel: «hei» vs «hei.»
        </button>
        <button
          type="button"
          onClick={() => {
            setA("Passord123");
            setB("Passord124");
          }}
          className="px-2 py-1 rounded border border-border hover:bg-muted"
        >
          «Passord123» vs «Passord124»
        </button>
        <button
          type="button"
          onClick={() => setB(a)}
          className="px-2 py-1 rounded border border-border hover:bg-muted"
        >
          Sett B = A (determinisme-sjekk)
        </button>
      </div>
    </div>
  );
}

function HashBlock({
  hash,
  label,
  peer,
}: {
  hash: string;
  label: string;
  highlight: "a" | "b";
  peer: string;
}) {
  if (!hash) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono text-muted-foreground">
        regner …
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono break-all leading-relaxed">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-sans">
        {label}
      </div>
      <div>
        {Array.from(hash).map((ch, i) => {
          const peerCh = peer[i];
          const differs = peerCh !== undefined && peerCh !== ch;
          return (
            <span
              key={i}
              className={
                differs
                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-foreground"
              }
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bitDiff(hexA: string, hexB: string): number {
  if (!hexA || !hexB || hexA.length !== hexB.length) return 0;
  let diff = 0;
  for (let i = 0; i < hexA.length; i += 2) {
    const a = parseInt(hexA.slice(i, i + 2), 16);
    const b = parseInt(hexB.slice(i, i + 2), 16);
    let x = a ^ b;
    while (x) {
      diff += x & 1;
      x >>>= 1;
    }
  }
  return diff;
}

// ============================================================================
// 4) RSA-mini
// ============================================================================

const SMALL_PRIMES = [3, 5, 7, 11, 13, 17, 19, 23];

function RsaMode() {
  const [p, setP] = useState(5);
  const [q, setQ] = useState(11);
  const [m, setM] = useState(9);

  const params = useMemo(() => computeRsa(p, q), [p, q]);

  // hold m i gyldig område
  useEffect(() => {
    if (m >= params.n) setM(params.n - 1);
    if (m < 0) setM(0);
  }, [params.n, m]);

  if (!params.ok) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
        Velg to <em>ulike</em> primtall.
      </div>
    );
  }

  const { n, phi, e, d } = params;
  const c = m >= 0 && m < n ? modPow(m, e, n) : 0;
  const decrypted = modPow(c, d, n);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Primtall p
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SMALL_PRIMES.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setP(x)}
                className={`px-2 py-1 rounded text-xs font-mono border ${
                  p === x
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Primtall q
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SMALL_PRIMES.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setQ(x)}
                className={`px-2 py-1 rounded text-xs font-mono border ${
                  q === x
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1.5 leading-relaxed">
        <div>
          <span className="text-muted-foreground">n</span> = p · q = {p} · {q} ={" "}
          <span className="text-brand">{n}</span>
        </div>
        <div>
          <span className="text-muted-foreground">φ(n)</span> = (p−1)(q−1) = {p - 1} · {q - 1} ={" "}
          <span className="text-brand">{phi}</span>
        </div>
        <div>
          <span className="text-muted-foreground">e</span> = minste{" "}
          <em className="not-italic text-muted-foreground/80">odde tall &gt; 1 med gcd(e, φ) = 1</em>{" "}
          = <span className="text-brand">{e}</span>
        </div>
        <div>
          <span className="text-muted-foreground">d</span> = e<sup>−1</sup> mod φ = e·d ≡ 1 (mod{" "}
          {phi}) ⇒ <span className="text-brand">{d}</span>{" "}
          <span className="text-muted-foreground">
            (sjekk: {e}·{d} = {e * d} ≡ {(e * d) % phi} mod {phi})
          </span>
        </div>
        <div className="pt-1 border-t border-border/60">
          <span className="text-success">public  =</span> (e={e}, n={n})
          <br />
          <span className="text-destructive">private = </span> (d={d}, n={n})
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
            Klartekst m (heltall, 0 ≤ m &lt; n = {n})
          </span>
          <input
            type="number"
            min={0}
            max={n - 1}
            value={m}
            onChange={(e) => {
              const v = Number.parseInt(e.target.value, 10);
              setM(Number.isFinite(v) ? Math.max(0, Math.min(n - 1, v)) : 0);
            }}
            className="w-32 px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
          />
        </label>

        <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1.5 leading-relaxed">
          <div>
            <span className="text-muted-foreground">Krypter:</span> c = m
            <sup>e</sup> mod n = {m}
            <sup>{e}</sup> mod {n} = <span className="text-brand">{c}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Dekrypter:</span> m = c
            <sup>d</sup> mod n = {c}
            <sup>{d}</sup> mod {n} ={" "}
            <span className={decrypted === m ? "text-success" : "text-destructive"}>
              {decrypted}
            </span>
            {decrypted === m ? " ✓" : " ✗"}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong className="text-amber-600 dark:text-amber-400">Hvorfor det er trygt i ekte
        RSA:</strong> her er n så lite at hvem som helst faktoriserer det i hodet. I praksis brukes
        2048- eller 4096-bit n. Å finne p og q fra en 2048-bit n er beregningsmessig umulig — det
        er hele sikkerheten.
      </div>
    </div>
  );
}

function computeRsa(p: number, q: number) {
  if (p === q || !isPrime(p) || !isPrime(q)) {
    return { ok: false as const, n: 0, phi: 0, e: 0, d: 0 };
  }
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 3;
  while (e < phi) {
    if (gcd(e, phi) === 1) break;
    e += 2;
  }
  const d = modInverse(e, phi);
  return { ok: true as const, n, phi, e, d };
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function modInverse(a: number, m: number): number {
  // Brute force er fint for små m
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return 0;
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1 % mod;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    e = Math.floor(e / 2);
    b = (b * b) % mod;
  }
  return result;
}

// ============================================================================
// 5) DIFFIE-HELLMAN
// ============================================================================

const DH_PRESETS = [
  { p: 23, g: 5 },
  { p: 17, g: 3 },
  { p: 29, g: 2 },
  { p: 41, g: 6 },
];

function DiffieHellmanMode() {
  const [preset, setPreset] = useState(0);
  const [a, setA] = useState(6);
  const [b, setB] = useState(15);

  const { p, g } = DH_PRESETS[preset];

  // Klampe secrets til [1, p-2]
  useEffect(() => {
    if (a >= p - 1) setA(p - 2);
    if (a < 1) setA(1);
  }, [p, a]);
  useEffect(() => {
    if (b >= p - 1) setB(p - 2);
    if (b < 1) setB(1);
  }, [p, b]);

  const A = modPow(g, a, p); // Alice sender
  const B = modPow(g, b, p); // Bob sender
  const sA = modPow(B, a, p); // Alice regner
  const sB = modPow(A, b, p); // Bob regner

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Offentlige parametre (g, p)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DH_PRESETS.map((dp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPreset(i)}
              className={`px-2 py-1 rounded text-xs font-mono border ${
                preset === i
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              g={dp.g}, p={dp.p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="text-xs font-semibold text-brand">Alice</div>
          <label className="text-xs block">
            <span className="text-muted-foreground">Hemmelig a (1 ≤ a &lt; {p - 1})</span>
            <input
              type="number"
              min={1}
              max={p - 2}
              value={a}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                setA(Number.isFinite(v) ? v : 1);
              }}
              className="mt-1 w-24 px-2 py-1 rounded border border-border bg-card text-sm font-mono"
            />
          </label>
          <div className="text-xs font-mono space-y-0.5">
            <div>
              A = g<sup>a</sup> mod p = {g}
              <sup>{a}</sup> mod {p} = <span className="text-brand">{A}</span>
            </div>
            <div className="text-muted-foreground text-[11px]">→ sendes til Bob</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="text-xs font-semibold text-success">Bob</div>
          <label className="text-xs block">
            <span className="text-muted-foreground">Hemmelig b (1 ≤ b &lt; {p - 1})</span>
            <input
              type="number"
              min={1}
              max={p - 2}
              value={b}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                setB(Number.isFinite(v) ? v : 1);
              }}
              className="mt-1 w-24 px-2 py-1 rounded border border-border bg-card text-sm font-mono"
            />
          </label>
          <div className="text-xs font-mono space-y-0.5">
            <div>
              B = g<sup>b</sup> mod p = {g}
              <sup>{b}</sup> mod {p} = <span className="text-success">{B}</span>
            </div>
            <div className="text-muted-foreground text-[11px]">→ sendes til Alice</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs font-mono space-y-1 leading-relaxed">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
          Begge regner ut samme delte nøkkel
        </div>
        <div>
          <span className="text-brand">Alice:</span> s = B<sup>a</sup> mod p = {B}
          <sup>{a}</sup> mod {p} = <span className="text-brand font-semibold">{sA}</span>
        </div>
        <div>
          <span className="text-success">Bob:</span> s = A<sup>b</sup> mod p = {A}
          <sup>{b}</sup> mod {p} = <span className="text-success font-semibold">{sB}</span>
        </div>
        <div className="pt-1 text-foreground">
          {sA === sB ? (
            <>
              ✓ Begge fikk <span className="font-semibold">{sA}</span> — det er g
              <sup>ab</sup> mod p = {g}
              <sup>{a * b}</sup> mod {p}. Eve ser bare g, p, A og B, og kan ikke regne ut a eller
              b (diskret logaritme).
            </>
          ) : (
            <>✗ Avvik — sjekk inputs.</>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong className="text-amber-600 dark:text-amber-400">Hva Eve ser:</strong> g={g}, p={p},
        A={A}, B={B}. For å finne <code>a</code> må hun løse {g}
        <sup>a</sup> mod {p} = {A}. Med p i 2048-bit-klassen er det praktisk umulig — sikkerheten
        står på <em>Diskret Logaritme-Problemet</em>.
      </div>
    </div>
  );
}
