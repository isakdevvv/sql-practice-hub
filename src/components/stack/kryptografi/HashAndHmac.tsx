import { useEffect, useState } from "react";
import { Hash, AlertTriangle, ShieldAlert, ShieldCheck, KeyRound } from "lucide-react";

type ForgeModule = typeof import("node-forge");

async function loadForge(): Promise<ForgeModule> {
  const mod = await import("node-forge");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mod as any).default ?? mod;
}

type Hashes = {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
};

const EMPTY_HASHES: Hashes = { md5: "", sha1: "", sha256: "", sha512: "" };

function computeHashes(f: ForgeModule, input: string): Hashes {
  const bytes = f.util.encodeUtf8(input);

  const md5 = f.md.md5.create();
  md5.update(bytes);

  const sha1 = f.md.sha1.create();
  sha1.update(bytes);

  const sha256 = f.md.sha256.create();
  sha256.update(bytes);

  const sha512 = f.md.sha512.create();
  sha512.update(bytes);

  return {
    md5: md5.digest().toHex(),
    sha1: sha1.digest().toHex(),
    sha256: sha256.digest().toHex(),
    sha512: sha512.digest().toHex(),
  };
}

function computeHmacSha256(f: ForgeModule, key: string, message: string): string {
  const hmac = f.hmac.create();
  hmac.start("sha256", f.util.encodeUtf8(key));
  hmac.update(f.util.encodeUtf8(message));
  return hmac.digest().toHex();
}

function HashRow({
  label,
  hex,
  badge,
  badgeColor,
  badgeText,
}: {
  label: string;
  hex: string;
  badge: "broken" | "deprecated" | "ok";
  badgeColor: string;
  badgeText: string;
}) {
  const Icon = badge === "ok" ? ShieldCheck : badge === "deprecated" ? AlertTriangle : ShieldAlert;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${badgeColor}`} />
          <span className="font-mono text-xs font-semibold">{label}</span>
          <span className="text-[10px] text-muted-foreground">({hex.length / 2} byte)</span>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <code className="font-mono text-[10px] break-all block bg-background border border-border rounded p-2">
        {hex || "—"}
      </code>
    </div>
  );
}

export function HashAndHmac() {
  const [forge, setForge] = useState<ForgeModule | null>(null);
  const [input, setInput] = useState("DTE-2507 hash-demo");
  const [hashes, setHashes] = useState<Hashes>(EMPTY_HASHES);

  const [hmacKey, setHmacKey] = useState("super-hemmelig-nokkel");
  const [hmacMessage, setHmacMessage] = useState("Overfør 1000 kr til konto 12345");
  const [hmacHex, setHmacHex] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const f = forge ?? (await loadForge());
      if (cancelled) return;
      if (!forge) setForge(f);
      setHashes(computeHashes(f, input));
    })();
    return () => {
      cancelled = true;
    };
  }, [input, forge]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const f = forge ?? (await loadForge());
      if (cancelled) return;
      if (!forge) setForge(f);
      setHmacHex(computeHmacSha256(f, hmacKey, hmacMessage));
    })();
    return () => {
      cancelled = true;
    };
  }, [hmacKey, hmacMessage, forge]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4 text-brand" />
          Live hash — fire familier samtidig
        </h3>
        <label className="text-xs text-muted-foreground">Input</label>
        <input
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
          className="w-full font-mono text-sm bg-background border border-border rounded-md px-2 py-1.5 mb-3"
        />
        <div className="space-y-2">
          <HashRow
            label="MD5"
            hex={hashes.md5}
            badge="broken"
            badgeColor="text-destructive"
            badgeText="BRUTT — ikke bruk"
          />
          <HashRow
            label="SHA-1"
            hex={hashes.sha1}
            badge="deprecated"
            badgeColor="text-amber-600 dark:text-amber-400"
            badgeText="Foreldet"
          />
          <HashRow
            label="SHA-256"
            hex={hashes.sha256}
            badge="ok"
            badgeColor="text-success"
            badgeText="Anbefalt"
          />
          <HashRow
            label="SHA-512"
            hex={hashes.sha512}
            badge="ok"
            badgeColor="text-success"
            badgeText="Anbefalt"
          />
        </div>
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <strong className="text-brand">Avalanche-effekt:</strong> bytt ut én bokstav i
          input over (f.eks. siste tegn) og se at ALLE fire hashene endrer seg fullstendig —
          ikke bare litt. Det er en av kjernekravene til en kryptografisk hash.
        </div>
        <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <strong className="text-amber-700 dark:text-amber-400">MD5 + SHA-1:</strong> begge
          har dokumenterte kollisjoner (Wang 2004, SHAttered 2017). Bruk dem ALDRI til
          signaturer eller integritet. SHA-1 lever fortsatt i HMAC-SHA-1 fordi HMAC
          tolererer svakere hash — men nye systemer skal bruke SHA-256+.
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand" />
          HMAC-SHA-256 — integritet MED nøkkel
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          En vanlig hash beviser ingenting om opphav: hvem som helst kan beregne den. HMAC
          bruker en delt hemmelig nøkkel slik at bare den med nøkkelen kan lage gyldig tag.
          Brukes i JWT-tokens, API-signering (AWS, Stripe), TLS-record-MAC.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-muted-foreground">Hemmelig nøkkel</label>
            <input
              value={hmacKey}
              onChange={(ev) => setHmacKey(ev.target.value)}
              className="w-full font-mono text-sm bg-background border border-border rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Melding</label>
            <input
              value={hmacMessage}
              onChange={(ev) => setHmacMessage(ev.target.value)}
              className="w-full font-mono text-sm bg-background border border-border rounded-md px-2 py-1.5"
            />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">HMAC-SHA-256 (hex)</div>
          <code className="font-mono text-[10px] break-all block bg-background border border-border rounded p-2">
            {hmacHex || "—"}
          </code>
        </div>
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
          Endre nøkkelen så vidt — HELE tagen endrer seg. Det er det som gjør at en mottaker
          som har samme nøkkel kan stole på at en mottatt tag bare kan komme fra noen som
          også kjenner nøkkelen.
        </div>
      </div>
    </div>
  );
}
