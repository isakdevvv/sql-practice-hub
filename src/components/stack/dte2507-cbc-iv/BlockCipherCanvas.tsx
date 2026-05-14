import { useMemo, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";

type Mode = "ecb" | "cbc";

// Pedagogisk forenklet "block cipher": deterministisk pseudo-tilfeldig
// permutering av en 4-tegn-blokk basert på nøkkel. Vi gir det samme
// utseendet som AES vil ha for våre formål: lik input → lik output (ECB-lekkasje),
// helt forskjellig output etter ett bit-skifte.
function pseudoCipherBlock(block: string, key: number): string {
  let h = key;
  for (let i = 0; i < block.length; i++) {
    h ^= block.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // Returner som 4-tegn hex (2 bytes pr "block" — kun visuelt)
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 8);
}

function xorStrings(a: string, b: string): string {
  // XOR-er to like-lange ASCII-strenger og returnerer ASCII-stil
  let out = "";
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ca = a.charCodeAt(i) || 0;
    const cb = b.charCodeAt(i) || 0;
    // Sikre printable mellom 33-126
    let xored = (ca ^ cb) % 94;
    out += String.fromCharCode(33 + xored);
  }
  return out;
}

function chunkBlocks(message: string, size = 4): string[] {
  const padded = message.padEnd(Math.ceil(message.length / size) * size, " ");
  const out: string[] = [];
  for (let i = 0; i < padded.length; i += size) out.push(padded.slice(i, i + size));
  return out;
}

function colorFromCipher(c: string): string {
  // Hash → HSL — like blokker får samme farge
  let h = 0;
  for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 60%, 55%)`;
}

export function BlockCipherCanvas() {
  const [mode, setMode] = useState<Mode>("ecb");
  const [message, setMessage] = useState("ATTACK ATTACK ATTACK ATTACK");
  const [iv, setIv] = useState("R7q!");
  const [key] = useState(0xc0ffee);

  const blocks = useMemo(() => chunkBlocks(message, 4), [message]);

  const ciphertext = useMemo(() => {
    const out: { plain: string; cipher: string }[] = [];
    let prev = iv;
    for (const blk of blocks) {
      if (mode === "ecb") {
        out.push({ plain: blk, cipher: pseudoCipherBlock(blk, key) });
      } else {
        const xored = xorStrings(blk, prev.slice(0, 4));
        const c = pseudoCipherBlock(xored, key);
        out.push({ plain: blk, cipher: c });
        prev = c;
      }
    }
    return out;
  }, [blocks, mode, iv, key]);

  function newIV() {
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    setIv(r);
  }
  function reset() {
    setMessage("ATTACK ATTACK ATTACK ATTACK");
    setIv("R7q!");
  }

  // Tell unike cipher-blokker for å vise lekkasje
  const uniqueCount = new Set(ciphertext.map((c) => c.cipher)).size;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Blokk-chiffer visualisering
        </div>
        <div className="flex gap-1.5">
          {(["ecb", "cbc"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors uppercase ${
                mode === m
                  ? "bg-brand text-brand-foreground"
                  : "border border-border bg-card hover:border-brand/40 text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Klartekst (4-tegns blokker)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full font-mono bg-background border border-border rounded px-2 py-1.5 text-sm"
            />
          </div>
          {mode === "cbc" && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">IV</label>
              <input
                type="text"
                value={iv}
                maxLength={4}
                onChange={(e) => setIv(e.target.value)}
                className="w-20 font-mono bg-background border border-border rounded px-2 py-1.5 text-sm"
              />
            </div>
          )}
          <div className="flex gap-2">
            {mode === "cbc" && (
              <button
                type="button"
                onClick={newIV}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2.5 py-1.5"
              >
                <Shuffle className="h-3 w-3" /> Ny IV
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2.5 py-1.5"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Klartekst-blokker
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ciphertext.map((c, i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 font-mono text-xs border border-border bg-background rounded"
              >
                {c.plain.replace(/ /g, "·")}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center justify-between">
            <span>Cipher-blokker ({mode.toUpperCase()})</span>
            <span className="text-[10px] normal-case font-normal text-muted-foreground">
              {uniqueCount} unike av {ciphertext.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ciphertext.map((c, i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 font-mono text-xs border rounded text-white shadow-sm"
                style={{ backgroundColor: colorFromCipher(c.cipher), borderColor: colorFromCipher(c.cipher) }}
                title={c.cipher}
              >
                {c.cipher.slice(0, 4)}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-md border p-3 text-sm ${
            mode === "ecb"
              ? "border-rose-500/40 bg-rose-500/5 text-rose-800 dark:text-rose-200"
              : "border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          {mode === "ecb" ? (
            <>
              <strong>ECB lekker mønstre.</strong> Like klartekst-blokker gir identiske
              cipher-blokker — du ser samme farge gjenta seg. På et bilde betyr det at
              omriss og områder med ensfarget bakgrunn lekker gjennom (det berømte
              «pingvinen i ECB»-bildet).
            </>
          ) : (
            <>
              <strong>CBC skjuler mønsteret.</strong> Hver blokk XOR-es med forrige
              cipher før kryptering, og en tilfeldig IV starter kjeden — like
              klartekst-blokker gir forskjellige cipher-blokker. Bytt IV og hele
              outputen endrer seg uten å endre meldingen.
            </>
          )}
        </div>

        {mode === "cbc" && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
            <div className="font-semibold mb-1">Kjeden i CBC</div>
            <div className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              C₁ = E(P₁ ⊕ IV)
              <br />
              C₂ = E(P₂ ⊕ C₁)
              <br />
              C₃ = E(P₃ ⊕ C₂)
              <br />
              ... Cᵢ = E(Pᵢ ⊕ Cᵢ₋₁)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
