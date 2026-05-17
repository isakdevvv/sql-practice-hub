import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Eye, KeyRound, ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// MitmAttackSimulator — brukeren spiller MITM mellom klient og server.
// Tre angrep:
//   1. passive  — bare sniffing, ECDHE blokkerer alt nyttig
//   2. active   — eget cert / hijack — fanges av cert-validering med mindre
//                 angriper har en trustet CA (vis hvorfor pinning + CT hjelper)
//   3. downgrade — forsøk på å presse ned til TLS 1.0 / null cipher
// ---------------------------------------------------------------------------

type Attack = "passive" | "active" | "downgrade";

type DefenseFlag = {
  id: "ct" | "pinning" | "fallback-scsv" | "rogue-ca";
  label: string;
  desc: string;
};

const DEFENSE_DESCRIPTIONS: Record<DefenseFlag["id"], string> = {
  ct: "Certificate Transparency: alle CA-utstedte sertifikater må ligge i offentlig logg. Et rogue-cert for ditt domene oppdages av domain-eier.",
  pinning: "HTTP Public Key Pinning / mobile pinning: app/browser pinner ekspekterte public-key-hashen. Cert som matcher CA, men ikke pinningen, avvises.",
  "fallback-scsv": "TLS_FALLBACK_SCSV: hvis klient prøver å re-koble på lavere versjon, sender den et signal. Server avviser fallback hvis den støtter høyere.",
  "rogue-ca": "MITM kontrollerer en CA som finnes i klientens trust store (organisasjonsproxy, statsaktør, malware).",
};

type Outcome = {
  blocked: boolean;
  description: string;
  detail: string[];
};

function evaluate(attack: Attack, flags: Record<DefenseFlag["id"], boolean>): Outcome {
  if (attack === "passive") {
    return {
      blocked: true,
      description: "Passiv avlytting fanger 0 bytes nyttig data.",
      detail: [
        "MITM ser ClientHello (SNI, cipher-liste) og ServerHello — alt før ECDHE.",
        "Selve g^c, g^s er offentlige, men shared_secret = ECDH(c, g^s) finnes aldri på kabelen.",
        "Application data fra fase 5 er AES-128-GCM-kryptert. Uten den ephemerale c eller s er ciphertekst støy.",
        "Selv om MITM logger alt og senere lekker server-private-key, klarer den ikke retroaktiv dekryptering — ECDHE-nøklene ble slettet etter sesjonen (forward secrecy).",
      ],
    };
  }

  if (attack === "active") {
    if (flags["rogue-ca"]) {
      // MITM har en CA i klientens trust store
      if (flags.pinning) {
        return {
          blocked: true,
          description: "Active MITM med rogue CA, men key pinning stopper det.",
          detail: [
            "MITM oppretter eget cert for shop.example.no signert av sin rogue CA.",
            "Klient validerer cert-kjede → OK (rogue CA er i trust store).",
            "MEN: HPKP / mobile pinning sjekker SPKI-hashen mot pinnet liste.",
            "Pinnet hash matcher ikke MITM-public-key. Klient avbryter koblingen.",
            "Bruker ser feil før noe sensitivt sendes.",
          ],
        };
      }
      if (flags.ct) {
        return {
          blocked: true,
          description: "Active MITM med rogue CA, men Certificate Transparency avslører cert-en innen 24t.",
          detail: [
            "Browser krever at cert har minst 2 signed certificate timestamps (SCT) fra CT-logger.",
            "Hvis MITM logger sitt rogue cert: domain-owner ser det i CT-monitor og varsler.",
            "Hvis MITM IKKE logger: browser avviser cert (mangler SCT) → ERR_CERTIFICATE_TRANSPARENCY_REQUIRED.",
            "Begge veier lekker angrepet.",
          ],
        };
      }
      return {
        blocked: false,
        description: "Active MITM lykkes — rogue CA + ingen pinning + ingen CT-håndhevelse.",
        detail: [
          "Dette er det «organisasjonsproxy» scenario: bedrifts-AV installerte en CA i alle ansatt-laptoper.",
          "MITM presenterer eget cert. Klient validerer mot rogue CA → grønn lås.",
          "Hele TLS-tunnelen termineres hos MITM, alt klartekst der.",
          "Forsvar: pinning + CT + bruker-årvåkenhet (cert-fingerprint).",
        ],
      };
    }
    return {
      blocked: true,
      description: "Active MITM med eget cert mislykkes — klient finner ingen trustet CA.",
      detail: [
        "MITM lager self-signed eller egen-CA-signert cert for shop.example.no.",
        "Klient bygger kjede: server-cert → ukjent CA. Ingen anker i trust store.",
        "ERR_CERT_AUTHORITY_INVALID — klient avbryter.",
        "Eneste vei videre: MITM må enten ha en faktisk CA i klientens store (rogue-ca), eller bryte ECDHE matematisk (ikke realistisk).",
      ],
    };
  }

  // downgrade
  if (flags["fallback-scsv"]) {
    return {
      blocked: true,
      description: "Downgrade-forsøk blokkeres av TLS_FALLBACK_SCSV.",
      detail: [
        "MITM blokkerer alle TLS 1.3 ClientHello — klient prøver re-koble med lavere versjon.",
        "Klient sender TLS_FALLBACK_SCSV i cipher-listen for å si «dette er en fallback».",
        "Server støtter TLS 1.3 og ser SCSV → svarer inappropriate_fallback alert → kobler ned.",
        "Ingen sårbar versjon i bruk.",
      ],
    };
  }
  return {
    blocked: false,
    description: "Downgrade lykkes — klient prøver TLS 1.0 og MITM utnytter gammelt cipher.",
    detail: [
      "Klient og server burde begge ha hardkodet minimum TLS 1.2/1.3 — men hvis ikke …",
      "MITM klipper TLS 1.3-koblingen, klient retter ned til TLS 1.0 uten SCSV.",
      "Nå er BEAST/POODLE-angrep mulig (CBC-IV-prediksjon).",
      "Moderne servere skrur av <TLS 1.2 og dette feiler — historiens lærepenge.",
    ],
  };
}

export function MitmAttackSimulator() {
  const [attack, setAttack] = useState<Attack>("passive");
  const [flags, setFlags] = useState<Record<DefenseFlag["id"], boolean>>({
    ct: true,
    pinning: false,
    "fallback-scsv": true,
    "rogue-ca": false,
  });
  const [expandedFlag, setExpandedFlag] = useState<DefenseFlag["id"] | null>(null);

  const outcome = useMemo(() => evaluate(attack, flags), [attack, flags]);

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="MITM-angreps-simulator"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interaktiv simulator</div>
        <div className="text-sm font-semibold">MITM-angrep mellom klient og server</div>
        <div className="text-xs text-muted-foreground mt-1">
          Du spiller mannen-i-midten. Velg angrepstype og hvilke forsvar som er på — se om angrepet lykkes.
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Nettverks-topologi */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-1 items-center">
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">klient</div>
            <div className="text-xs font-mono">browser</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-1">trust-store: Mozilla NSS</div>
          </div>
          <div className="text-xs font-mono text-muted-foreground px-1">─▶</div>
          <div className="rounded-lg border-2 border-rose-500 bg-rose-500/10 p-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300 font-semibold">
              MITM (du)
            </div>
            <div className="text-xs font-mono">{attack === "passive" ? "sniffer" : attack === "active" ? "egen cert" : "downgrade"}</div>
            <div className="text-[10px] font-mono text-rose-700 dark:text-rose-300 mt-1">
              {attack === "passive" ? "kan bare LESE" : attack === "active" ? "klipper + erstatter" : "klipper TLS 1.3"}
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground px-1">─▶</div>
          <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">server</div>
            <div className="text-xs font-mono">shop.example.no</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-1">cert fra Example CA</div>
          </div>
        </div>

        {/* Angrepsvalg */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">angrep:</span>
          {(
            [
              ["passive", "1. passiv sniffing"],
              ["active", "2. aktiv MITM (eget cert)"],
              ["downgrade", "3. nedgradering TLS 1.0"],
            ] as [Attack, string][]
          ).map(([a, label]) => (
            <button
              key={a}
              type="button"
              onClick={() => setAttack(a)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                attack === a
                  ? "border-rose-500 bg-rose-500/10 text-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Defense-flagg */}
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            forsvar / forutsetninger
          </div>
          <div className="space-y-1.5">
            {(
              [
                { id: "ct" as const, label: "Certificate Transparency-håndhevelse" },
                { id: "pinning" as const, label: "Public key pinning (HPKP / mobile)" },
                { id: "fallback-scsv" as const, label: "TLS_FALLBACK_SCSV i klient" },
                { id: "rogue-ca" as const, label: "MITM har rogue CA i klient-trust-store" },
              ]
            ).map((f) => {
              const isOpen = expandedFlag === f.id;
              return (
                <div key={f.id} className="rounded-md border border-border bg-background">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={flags[f.id]}
                      onChange={(e) =>
                        setFlags((prev) => ({ ...prev, [f.id]: e.target.checked }))
                      }
                      className="h-3.5 w-3.5"
                      id={`flag-${f.id}`}
                    />
                    <label htmlFor={`flag-${f.id}`} className="text-[11px] font-mono cursor-pointer flex-1">
                      {f.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => setExpandedFlag(isOpen ? null : f.id)}
                      className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                    >
                      info <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-2 py-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
                      {DEFENSE_DESCRIPTIONS[f.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resultat */}
        <div
          className={`rounded-lg border-2 ${
            outcome.blocked
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-rose-500 bg-rose-500/5"
          } p-3`}
        >
          <div className="flex items-center gap-2 mb-2">
            {outcome.blocked ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-600" />
            )}
            <div className="text-sm font-semibold">
              {outcome.blocked ? "Angrep blokkert" : "Angrep lykkes — TLS-tunnelen er kompromittert"}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-2">{outcome.description}</div>
          <ul className="text-[11px] space-y-1 list-disc pl-5">
            {outcome.detail.map((d, i) => (
              <li key={i} className="text-foreground/80">
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Hva-nå-tips */}
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="rounded-md border border-border bg-muted/20 p-2 text-[11px]">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">Passiv:</span>
            </div>
            <span className="text-muted-foreground">
              ECDHE + forward secrecy gjør at sniffing aldri lønner seg på TLS 1.3.
            </span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-2 text-[11px]">
            <div className="flex items-center gap-1 mb-1">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">Aktiv:</span>
            </div>
            <span className="text-muted-foreground">
              Krever cert-svindel. Pinning + CT er forsvar; rogue-CA er svakhet.
            </span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-2 text-[11px]">
            <div className="flex items-center gap-1 mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">Downgrade:</span>
            </div>
            <span className="text-muted-foreground">
              SCSV beskytter klient som beholder versjon-info under retry.
            </span>
          </div>
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> TLS 1.3 er ikke kryptografisk knust — angrepsoverflaten er i{" "}
          <em>identitets-/trust-laget</em>. Hvis MITM klarer å bli en trustet CA, vinner hen. Pinning +
          CT + minimums-versjon på server er forsvarsdypde. Forward secrecy gjør i tillegg historiske
          opptak verdiløse, selv om server-private-key senere lekkes.
        </div>
      </div>
    </div>
  );
}
