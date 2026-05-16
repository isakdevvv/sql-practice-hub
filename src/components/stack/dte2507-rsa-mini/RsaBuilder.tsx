import { useMemo, useState } from "react";

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modPow(base: number, exp: number, mod: number): number {
  // Big enough for our toy primes — Number is fine for n up to ~9e15.
  // We use BigInt to be safe.
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    e >>= 1n;
    b = (b * b) % m;
  }
  return Number(result);
}

function modInverse(e: number, phi: number): number | null {
  // Extended Euclidean
  let [old_r, r] = [e, phi];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1) return null;
  return ((old_s % phi) + phi) % phi;
}

const PRIMES_SMALL = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

export function RsaBuilder() {
  const [p, setP] = useState(11);
  const [q, setQ] = useState(13);
  const [e, setE] = useState(7);
  const [stepShown, setStepShown] = useState(0);
  const [msgInput, setMsgInput] = useState("HI");

  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const gcdEPhi = useMemo(() => gcd(e, phi), [e, phi]);
  const d = useMemo(() => (gcdEPhi === 1 ? modInverse(e, phi) : null), [e, phi, gcdEPhi]);

  const messageChars = msgInput.toUpperCase().split("").filter((c) => /[A-Z]/.test(c));
  const ciphers = useMemo(() => {
    if (d === null) return null;
    return messageChars.map((c) => {
      const m = c.charCodeAt(0) - 64; // A=1
      return {
        ch: c,
        m,
        c: modPow(m, e, n),
        back: modPow(modPow(m, e, n), d, n),
      };
    });
  }, [messageChars, d, e, n]);

  const allValid = messageChars.every((c) => c.charCodeAt(0) - 64 < n);

  function showNext() {
    setStepShown((s) => Math.min(s + 1, 5));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Steg 1 — velg primtall p og q</h3>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="text-xs text-muted-foreground">p</label>
            <select
              value={p}
              onChange={(ev) => {
                setP(Number(ev.target.value));
                setStepShown(0);
              }}
              className="block bg-background border border-border rounded-md px-2 py-1 font-mono"
            >
              {PRIMES_SMALL.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">q</label>
            <select
              value={q}
              onChange={(ev) => {
                setQ(Number(ev.target.value));
                setStepShown(0);
              }}
              className="block bg-background border border-border rounded-md px-2 py-1 font-mono"
            >
              {PRIMES_SMALL.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
        {p === q && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">p og q må være FORSKJELLIGE primtall.</p>}
        <button
          onClick={() => setStepShown(Math.max(stepShown, 1))}
          disabled={p === q}
          className="mt-3 text-xs px-2.5 py-1 rounded-md bg-brand text-brand-foreground disabled:opacity-50"
        >
          Compute n →
        </button>
      </div>

      {stepShown >= 1 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-2">Steg 2 — n = p · q</h3>
          <p className="font-mono text-sm">n = {p} · {q} = <span className="text-brand font-bold">{n}</span></p>
          <p className="text-xs text-muted-foreground mt-1">n er moduluset — vises i public key.</p>
          <button
            onClick={() => setStepShown(Math.max(stepShown, 2))}
            className="mt-3 text-xs px-2.5 py-1 rounded-md bg-brand text-brand-foreground"
          >
            Compute φ →
          </button>
        </div>
      )}

      {stepShown >= 2 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-2">Steg 3 — Eulers φ-funksjon</h3>
          <p className="font-mono text-sm">
            φ(n) = (p − 1) · (q − 1) = {p - 1} · {q - 1} = <span className="text-brand font-bold">{phi}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            φ teller hvor mange tall &lt; n som er coprime med n. Brukes til å finne d.
          </p>
          <button
            onClick={() => setStepShown(Math.max(stepShown, 3))}
            className="mt-3 text-xs px-2.5 py-1 rounded-md bg-brand text-brand-foreground"
          >
            Choose e →
          </button>
        </div>
      )}

      {stepShown >= 3 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-2">Steg 4 — velg e</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Krav: 1 &lt; e &lt; φ(n), og gcd(e, φ(n)) = 1. Vanlig valg i praksis: 65537.
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-xs text-muted-foreground">e</label>
            <input
              type="number"
              value={e}
              onChange={(ev) => {
                setE(Number(ev.target.value));
                setStepShown(3);
              }}
              className="font-mono w-20 bg-background border border-border rounded-md px-2 py-1"
            />
            <span className="text-xs font-mono">
              gcd(e, φ) = <span className={gcdEPhi === 1 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{gcdEPhi}</span>
            </span>
            {gcdEPhi === 1 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">OK — coprime</span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300">Velg annen e</span>
            )}
          </div>
          <button
            onClick={() => setStepShown(Math.max(stepShown, 4))}
            disabled={gcdEPhi !== 1}
            className="mt-3 text-xs px-2.5 py-1 rounded-md bg-brand text-brand-foreground disabled:opacity-50"
          >
            Compute d →
          </button>
        </div>
      )}

      {stepShown >= 4 && d !== null && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-2">Steg 5 — d (private exponent)</h3>
          <p className="font-mono text-sm">
            d = e⁻¹ mod φ(n) = {e}⁻¹ mod {phi} = <span className="text-brand font-bold">{d}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            d er den modulære inversen til e mod φ. Beregnes med utvidet Euklid. d er PRIVATE — hold den hemmelig.
          </p>
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border p-2">
              <div className="font-semibold mb-1">Public key</div>
              <div className="font-mono">(n, e) = ({n}, {e})</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="font-semibold mb-1">Private key</div>
              <div className="font-mono">(n, d) = ({n}, {d})</div>
            </div>
          </div>
          <button
            onClick={() => setStepShown(Math.max(stepShown, 5))}
            className="mt-3 text-xs px-2.5 py-1 rounded-md bg-brand text-brand-foreground"
          >
            Krypter en melding →
          </button>
        </div>
      )}

      {stepShown >= 5 && d !== null && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-2">Steg 6 — krypter og dekrypter</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Hver bokstav konverteres til et tall (A=1, B=2, ...). Krypteres med c = m^e mod n.
            Dekrypteres med m = c^d mod n. Krever m &lt; n — derfor er n = {n} for liten for ekte tekst.
          </p>
          <input
            value={msgInput}
            onChange={(ev) => setMsgInput(ev.target.value)}
            maxLength={6}
            className="font-mono text-base bg-background border border-border rounded-md px-2 py-1 mb-3"
            placeholder="HI"
          />
          {!allValid && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
              Bokstaver med verdi ≥ n ({n}) kan ikke krypteres. Velg større primtall.
            </p>
          )}
          {ciphers && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs font-mono">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-2 py-1">tegn</th>
                    <th className="text-left px-2 py-1">m</th>
                    <th className="text-left px-2 py-1">c = m^e mod n</th>
                    <th className="text-left px-2 py-1">m' = c^d mod n</th>
                  </tr>
                </thead>
                <tbody>
                  {ciphers.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-2 py-1.5">{row.ch}</td>
                      <td className="px-2 py-1.5">{row.m}</td>
                      <td className="px-2 py-1.5 text-brand">{row.c}</td>
                      <td className="px-2 py-1.5">{row.back} {row.back === row.m ? "✓" : "✗"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
