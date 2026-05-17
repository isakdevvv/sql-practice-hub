import { useState } from "react";
import { ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// CipherSuiteCompare — fem cipher suites side om side. Markerer hvilke som er
// godkjent i TLS 1.3 og hvilke som er knust eller fjernet. Forklarer Forward
// Secrecy (ECDHE) vs ikke-FS (RSA key transport — fjernet i 1.3).
// ---------------------------------------------------------------------------

type Status = "tls13" | "weak" | "broken";

type Suite = {
  name: string;
  status: Status;
  kdf: string;
  kex: "ECDHE" | "RSA-transport" | "ECDHE/PSK";
  auth: string;
  cipher: string;
  mode: string;
  mac: string;
  keyBits: number;
  fs: boolean;
  rationale: string;
  attacks: string[];
};

const SUITES: Suite[] = [
  {
    name: "TLS_AES_128_GCM_SHA256",
    status: "tls13",
    kdf: "HKDF-SHA256",
    kex: "ECDHE",
    auth: "valgt separat (signature_algorithms)",
    cipher: "AES",
    mode: "GCM (AEAD)",
    mac: "innebygd i GCM",
    keyBits: 128,
    fs: true,
    rationale:
      "Default-anbefalt i TLS 1.3. Rask på Intel/AMD med AES-NI-instruksjoner. GCM gir AEAD (kryptering + autentisering i ett).",
    attacks: ["ingen kjente svakheter — kun nonce-reuse er en lokal feil"],
  },
  {
    name: "TLS_CHACHA20_POLY1305_SHA256",
    status: "tls13",
    kdf: "HKDF-SHA256",
    kex: "ECDHE",
    auth: "valgt separat",
    cipher: "ChaCha20",
    mode: "Poly1305 (AEAD)",
    mac: "innebygd i Poly1305",
    keyBits: 256,
    fs: true,
    rationale:
      "Foretrukket på mobil og IoT uten AES-akselerasjon — softwareimplementasjon er konstant-tid og raskere enn programvare-AES.",
    attacks: ["ingen kjente — Bernstein-design med stort sikkerhetsmarg"],
  },
  {
    name: "TLS_AES_256_GCM_SHA384",
    status: "tls13",
    kdf: "HKDF-SHA384",
    kex: "ECDHE",
    auth: "valgt separat",
    cipher: "AES",
    mode: "GCM (AEAD)",
    mac: "innebygd i GCM",
    keyBits: 256,
    fs: true,
    rationale:
      "Brukes der policy krever 256-bit (myndigheter, langtidshemmeligheter). Marginalt tregere enn 128-bit-varianten, men også godkjent i TLS 1.3.",
    attacks: ["ingen kjente"],
  },
  {
    name: "TLS_RSA_WITH_RC4_128_SHA",
    status: "broken",
    kdf: "TLS 1.2 PRF-SHA1",
    kex: "RSA-transport",
    auth: "RSA (samme nøkkel)",
    cipher: "RC4",
    mode: "stream",
    mac: "HMAC-SHA1",
    keyBits: 128,
    fs: false,
    rationale:
      "Knust. RFC 7465 forbyr RC4 i alle TLS-versjoner. RSA key transport gir ikke forward secrecy. Fjernet helt i TLS 1.3.",
    attacks: [
      "RC4-biases: tidlige bytes i keystream er statistisk skjeve — gjenoppretting av cookies på <2^30 sessions.",
      "Ingen FS: hvis server-private-key lekker, kan all historisk trafikk dekrypteres.",
    ],
  },
  {
    name: "TLS_RSA_WITH_3DES_EDE_CBC_SHA",
    status: "weak",
    kdf: "TLS 1.2 PRF-SHA1",
    kex: "RSA-transport",
    auth: "RSA",
    cipher: "3DES (TripleDES)",
    mode: "CBC",
    mac: "HMAC-SHA1",
    keyBits: 112, // effektiv mot meet-in-the-middle
    fs: false,
    rationale:
      "Svak. 64-bit blokkstørrelse gjør den sårbar for SWEET32 (kollisjon etter ~32 GB trafikk). Treg (3× DES). Bare 112-bit reell sikkerhet.",
    attacks: [
      "SWEET32: bursdagsangrep på 64-bit blokk — kollisjon ⇒ XOR-relasjon ⇒ klartekst-gjenoppretting.",
      "Ingen FS: RSA-transport gir samme retroaktiv-dekrypteringsrisiko.",
    ],
  },
];

function statusBadge(s: Status) {
  if (s === "tls13") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
        <ShieldCheck className="h-3 w-3" /> TLS 1.3 OK
      </span>
    );
  }
  if (s === "weak") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
        <AlertTriangle className="h-3 w-3" /> svak — fjernet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40">
      <ShieldX className="h-3 w-3" /> knust — fjernet
    </span>
  );
}

export function CipherSuiteCompare() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const selected = SUITES[selectedIdx];

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Cipher suite-sammenligning"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interaktiv sammenligning</div>
        <div className="text-sm font-semibold">Cipher suites — godkjent, svak, knust</div>
        <div className="text-xs text-muted-foreground mt-1">
          Klikk en suite for å se sammensetningen og hvorfor den ble fjernet (eller anbefalt).
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Kort-rad */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {SUITES.map((s, i) => {
            const active = i === selectedIdx;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`text-left rounded-lg border p-2 transition-colors ${
                  active
                    ? "border-brand bg-brand/10 ring-2 ring-brand/40"
                    : s.status === "tls13"
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : s.status === "weak"
                        ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10"
                        : "border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10"
                }`}
              >
                <div className="mb-1">{statusBadge(s.status)}</div>
                <div className="text-[11px] font-mono break-all">{s.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {s.fs ? "✓ forward secrecy" : "✗ ingen FS"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Anatomi-panel */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Anatomi</div>
          <div className="font-mono text-xs break-all mb-3">{selected.name}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">key exchange</div>
              <div className="font-mono">{selected.kex}</div>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">autentisering</div>
              <div className="font-mono">{selected.auth}</div>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">symmetrisk</div>
              <div className="font-mono">
                {selected.cipher}-{selected.keyBits}
              </div>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">modus</div>
              <div className="font-mono">{selected.mode}</div>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">MAC / integritet</div>
              <div className="font-mono">{selected.mac}</div>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">KDF</div>
              <div className="font-mono">{selected.kdf}</div>
            </div>
          </div>
        </div>

        {/* Begrunnelse + angrep */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Hvorfor {selected.status === "tls13" ? "anbefalt" : "fjernet"}
            </div>
            <div className="text-xs text-foreground/90">{selected.rationale}</div>
          </div>
          <div
            className={`rounded-lg border p-3 ${
              selected.attacks.length > 0 && selected.status !== "tls13"
                ? "border-rose-500/40 bg-rose-500/5"
                : "border-emerald-500/40 bg-emerald-500/5"
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Kjente angrep
            </div>
            <ul className="text-[11px] space-y-1 list-disc pl-5">
              {selected.attacks.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Forward Secrecy-forklaring */}
        <div className="rounded-lg border border-violet-500/40 bg-violet-500/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-violet-700 dark:text-violet-300 font-semibold mb-2">
            Forward Secrecy — det viktigste skillet
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="font-semibold mb-1">Med ECDHE (alle TLS 1.3-suites):</div>
              <ol className="list-decimal pl-5 space-y-0.5 text-muted-foreground">
                <li>Klient og server genererer EPHEMERALE (c, g^c) og (s, g^s) for HVER sesjon.</li>
                <li>shared_secret avledes via ECDH. Sendes aldri på nettet.</li>
                <li>Etter sesjonen slettes c og s.</li>
                <li>Selv om server-langtidsnøkkelen senere lekkes: gamle opptak kan ikke dekrypteres.</li>
              </ol>
            </div>
            <div>
              <div className="font-semibold mb-1">Uten FS (RSA-transport, fjernet i 1.3):</div>
              <ol className="list-decimal pl-5 space-y-0.5 text-muted-foreground">
                <li>Klient krypterer pre-master-secret med servers RSA-public-key.</li>
                <li>Server dekrypterer med RSA-private-key.</li>
                <li>Hvis angriper logger trafikken NÅ og bryter inn på serveren OM 5 ÅR, kan all gammel trafikk dekrypteres.</li>
                <li>Dette er hvorfor TLS 1.3 fjernet RSA key transport helt.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> TLS 1.3 har bare 5 cipher suites totalt — alle AEAD, alle med ECDHE,
          alle med HKDF. Dette er bevisst: hver «konfig-knapp» i TLS 1.2 var en angrepsflate (RC4, 3DES,
          CBC-mode-padding, RSA-transport, kompresjon). TLS 1.3 standardiserer bort valgene.
        </div>
      </div>
    </div>
  );
}
