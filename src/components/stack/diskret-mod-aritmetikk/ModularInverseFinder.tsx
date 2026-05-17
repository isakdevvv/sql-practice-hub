import { useMemo, useState } from "react";
import { extendedEuclid, gcd, mod, modInverse } from "./modUtils";

/**
 * Finn a^(-1) mod n via Extended Euclidean.
 *  - Sjekker gcd(a, n) = 1 (nødvendig betingelse).
 *  - Viser Bezouts identitet og hvordan x mod n er inversen.
 *  - Verifiserer: a · a^(-1) ≡ 1 (mod n).
 *  - Liten RSA-koblings-boks: hvordan d er invers av e mod φ(n).
 */
export function ModularInverseFinder() {
  const [a, setA] = useState(7);
  const [n, setN] = useState(40);

  const g = useMemo(() => gcd(a, n), [a, n]);
  const exists = g === 1;
  const ext = useMemo(() => extendedEuclid(a, n), [a, n]);
  const inv = useMemo(() => modInverse(a, n), [a, n]);
  const verify = inv === null ? null : mod(a * inv, n);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Modulær invers — a⁻¹ mod n
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label className="block space-y-1">
          <span className="text-muted-foreground">a</span>
          <input
            type="number"
            value={a}
            onChange={(e) =>
              setA(Math.max(1, Number.parseInt(e.target.value || "1", 10)))
            }
            className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-muted-foreground">n (modulus)</span>
          <input
            type="number"
            value={n}
            onChange={(e) =>
              setN(Math.max(2, Number.parseInt(e.target.value || "2", 10)))
            }
            className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
      </div>

      <div
        className={`rounded-md border p-3 text-[11px] font-mono space-y-1.5 ${
          exists
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-rose-500/40 bg-rose-500/5"
        }`}
      >
        <div>
          gcd({a}, {n}) ={" "}
          <span className={exists ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
            {g}
          </span>
        </div>
        {exists ? (
          <>
            <div className="text-emerald-600 dark:text-emerald-400">
              Invers eksisterer.
            </div>
            <div className="text-muted-foreground border-t border-emerald-500/20 pt-1.5">
              Bezout: {a} · ({ext.x}) + {n} · ({ext.y}) = 1
            </div>
            <div>
              Reduser mod {n}:&nbsp; {a} · ({ext.x}) ≡ 1 (mod {n})
            </div>
            <div>
              ⇒ a⁻¹ = ({ext.x}) mod {n} ={" "}
              <span className="text-emerald-600 dark:text-emerald-400 text-base">
                {inv}
              </span>
            </div>
          </>
        ) : (
          <div className="text-rose-600 dark:text-rose-400">
            Invers eksisterer IKKE — a og n er ikke koprime (de deler faktor {g}).
            Endre a eller n så gcd blir 1.
          </div>
        )}
      </div>

      {exists && inv !== null && (
        <div className="rounded-md border border-border bg-background p-3 text-[11px] font-mono">
          <div className="text-muted-foreground mb-1">Verifisering:</div>
          <div>
            {a} · {inv} = {a * inv}
          </div>
          <div>
            {a * inv} mod {n} ={" "}
            <span
              className={
                verify === 1
                  ? "text-emerald-500 text-base"
                  : "text-rose-500"
              }
            >
              {verify}
            </span>
            {verify === 1 && (
              <span className="text-emerald-500 ml-1">
                ✓ inversen sjekker ut.
              </span>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px] leading-relaxed">
        <div className="font-semibold text-foreground mb-1">RSA-koblingen</div>
        I RSA velger man en offentlig eksponent <span className="font-mono">e</span> (ofte 65537) og en
        modulus <span className="font-mono">N = p·q</span>. Den private dekrypterings-eksponenten{" "}
        <span className="font-mono">d</span> er nettopp den modulære inversen:{" "}
        <span className="font-mono text-foreground">d ≡ e⁻¹ (mod φ(N))</span> der{" "}
        <span className="font-mono">φ(N) = (p-1)(q-1)</span>. Uten Extended Euclidean kunne vi ikke
        bygd RSA effektivt. Prøv: <span className="font-mono">a = 17, n = 3120</span>{" "}
        (det er e = 17 mod φ(53·61)).
      </div>
    </div>
  );
}
