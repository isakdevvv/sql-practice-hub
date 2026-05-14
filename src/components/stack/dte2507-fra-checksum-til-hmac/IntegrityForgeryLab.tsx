import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";

type Mode = "checksum" | "naive-hash" | "mac" | "hmac";

// Pedagogisk forenklet checksum: summer ASCII-koder mod 1000.
// Konstruert slik at bokens kollisjon faktisk inntreffer.
function ascciSum(s: string): number {
  let n = 0;
  for (const c of s) n += c.charCodeAt(0);
  return n % 1000;
}

// Pedagogisk forenklet hash: 32-bit FNV-1a.
// Deterministisk og kollisjonsresistent for våre formål — Trudy kan IKKE
// finne kollisjoner, men hun kan RE-HASHE en endret melding.
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// MAC = H(m ‖ s). HMAC bruker inner + outer pad.
// Begge er pedagogiske — vi viser at uten å vite hemmeligheten s
// kan ikke Trudy lage gyldig tag.
function mac(message: string, secret: string): string {
  return fnv1a(message + "||" + secret);
}

function hmac(message: string, secret: string): string {
  const ipad = "\x36\x36\x36\x36";
  const opad = "\x5c\x5c\x5c\x5c";
  const inner = fnv1a((secret + ipad) + message);
  return fnv1a((secret + opad) + inner);
}

function computeTag(mode: Mode, message: string, secret: string): string {
  switch (mode) {
    case "checksum":
      return String(ascciSum(message)).padStart(3, "0");
    case "naive-hash":
      return fnv1a(message);
    case "mac":
      return mac(message, secret);
    case "hmac":
      return hmac(message, secret);
  }
}

const MODE_LABEL: Record<Mode, string> = {
  checksum: "Klassisk checksum",
  "naive-hash": "Naiv H(m)",
  mac: "MAC = H(m ‖ s)",
  hmac: "HMAC",
};

const MODE_EXPLAIN: Record<Mode, string> = {
  checksum:
    "Summer ASCII-verdiene mod 1000. Snill mot bit-feil, men gir INGEN integritet — Trudy kan bytte ut bytes så summen står likt.",
  "naive-hash":
    "Kryptografisk hash (FNV-1a her, SHA-256 i virkeligheten). Vanskelig å finne kollisjon — men Trudy ser ikke hindret av det. Hun bare endrer m og re-hasher: ny gyldig (m', H(m')).",
  mac:
    "Hemmelig delt nøkkel s. Trudy kjenner ikke s, så hun kan ikke regne H(m' ‖ s). Den enkle konkatenasjonen er sårbar for length-extension-angrep mot Merkle-Damgård-hashes.",
  hmac:
    "Wrappet med inner pad og outer pad: H((s⊕opad) ‖ H((s⊕ipad) ‖ m)). Beskytter mot length-extension. Standardisert i RFC 2104. SHA-256-HMAC er fundamentet i TLS-record og JWT.",
};

export function IntegrityForgeryLab() {
  const [mode, setMode] = useState<Mode>("checksum");
  const [secret, setSecret] = useState("nordlys42");

  // Original-melding (Alice → Bob)
  const original = "IOU100.99BOB";
  const originalTag = useMemo(
    () => computeTag(mode, original, secret),
    [mode, secret],
  );

  // Trudys forfalskning
  const [forged, setForged] = useState("IOU900.19BOB");
  const [trudysGuess, setTrudysGuess] = useState("");
  // For "checksum" forhåndsutfyller vi bokens berømte gyldige forfalskning.
  // For naiv-hash kan Trudy bare regne den selv.
  const trudysTag = useMemo(() => {
    if (mode === "checksum") {
      // For bokens eksempel matcher allerede summen — vi viser fasiten direkte
      return String(ascciSum(forged)).padStart(3, "0");
    }
    if (mode === "naive-hash") {
      return fnv1a(forged);
    }
    // For MAC/HMAC: Trudy må gjette tag-en — hun kjenner ikke s.
    return trudysGuess || "(ikke gjettet)";
  }, [mode, forged, trudysGuess]);

  const bobAccepts =
    mode === "checksum" || mode === "naive-hash"
      ? trudysTag === originalTag.replace(/^/, "") || trudysTag === computeTag(mode, forged, secret)
      : trudysTag === computeTag(mode, forged, secret);

  // Forenklet sjekk: Bob aksepterer hvis den medsendte tag-en stemmer med
  // tag-en som Bob selv ville regnet ut av meldingen han mottok.
  const bobsRecomputedTag = useMemo(
    () => computeTag(mode, forged, secret),
    [mode, forged, secret],
  );
  const accepted = trudysTag === bobsRecomputedTag;

  function reset() {
    setForged("IOU900.19BOB");
    setTrudysGuess("");
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Forfalsknings-laben
        </div>
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setTrudysGuess("");
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === m
                  ? "bg-brand text-brand-foreground"
                  : "border border-border bg-card hover:border-brand/40 text-foreground"
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
            Alice sender til Bob
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Melding m</div>
              <div className="font-mono bg-background border border-border rounded px-2 py-1">
                {original}
              </div>
            </div>
            {(mode === "mac" || mode === "hmac") && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Delt hemmelighet s (kjent kun av Alice og Bob)
                </div>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full font-mono bg-background border border-border rounded px-2 py-1 text-sm"
                />
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Tag som sendes med
              </div>
              <div className="font-mono text-brand bg-background border border-border rounded px-2 py-1">
                {originalTag}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
          <div className="text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Trudy forfalsker
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Endret m'</div>
              <input
                type="text"
                value={forged}
                onChange={(e) => setForged(e.target.value)}
                className="w-full font-mono bg-background border border-border rounded px-2 py-1 text-sm"
              />
            </div>
            {(mode === "mac" || mode === "hmac") && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Trudys gjettede tag (hun kjenner ikke s)
                </div>
                <input
                  type="text"
                  value={trudysGuess}
                  onChange={(e) => setTrudysGuess(e.target.value)}
                  placeholder="8 hex-tegn"
                  className="w-full font-mono bg-background border border-border rounded px-2 py-1 text-sm"
                />
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Tag som følger med m'
              </div>
              <div className="font-mono text-rose-600 dark:text-rose-400 bg-background border border-border rounded px-2 py-1">
                {trudysTag}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Bob verifiserer mottatt (m', tag')
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-xs text-muted-foreground">Bob regner ut</div>
            <div className="font-mono text-foreground">{bobsRecomputedTag}</div>
            <div className="text-xs text-muted-foreground mt-1">
              ut fra mottatt m'{(mode === "mac" || mode === "hmac") && " og delt s"}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-xs text-muted-foreground">Sammenligner med tag fra Trudy</div>
            <div className="font-mono text-foreground">{trudysTag}</div>
          </div>
        </div>
        <div
          className={`mt-3 flex items-start gap-2 rounded-md border p-3 text-sm ${
            accepted
              ? "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          {accepted ? (
            <>
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <strong>Bob aksepterer m' som ekte.</strong> Forfalskningen slipper
                gjennom — denne mekanismen gir ikke integritet.
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <strong>Bob avviser m'.</strong> Tag-ene matcher ikke — Trudy
                klarer ikke å forfalske uten å kjenne hemmeligheten.
              </div>
            </>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          {MODE_EXPLAIN[mode]}
        </p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-3 py-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill Trudy
          </button>
        </div>
      </div>
    </div>
  );
}
