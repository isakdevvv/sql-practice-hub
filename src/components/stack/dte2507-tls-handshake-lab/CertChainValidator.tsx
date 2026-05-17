import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";

// ---------------------------------------------------------------------------
// CertChainValidator — viser server-cert → intermediate → root, og lar brukeren
// bryte ulike valideringsregler for å se hvilken browser-error som dukker opp.
//
// 6 brudd-moduser:
//   ok           — friskt sertifikat
//   expired      — utløpt
//   wrong-cn     — SAN/CN matcher ikke domenet
//   untrusted    — root finnes ikke i Mozilla trust store
//   revoked      — OCSP-respons sier «revoked»
//   self-signed  — server-cert er ikke signert av en CA
//
// + OCSP stapling-toggle: viser hvordan server kan stable inn OCSP-respons selv,
// uten at klient må kontakte CA separat (sparer RTT + lekkasje).
// ---------------------------------------------------------------------------

type BreakMode = "ok" | "expired" | "wrong-cn" | "untrusted" | "revoked" | "self-signed";

type CertNode = {
  level: "server" | "intermediate" | "root";
  label: string;
  subject: string;
  issuer: string;
  notBefore: string;
  notAfter: string;
  san: string[];
  serial: string;
  sigAlg: string;
  publicKey: string;
  fingerprint: string;
  ocspUrl?: string;
};

const DOMAIN = "shop.example.no";

function buildChain(mode: BreakMode): CertNode[] {
  const root: CertNode = {
    level: "root",
    label: "Root CA",
    subject: "CN=ExampleRoot CA, O=Example Trust, C=NO",
    issuer: "CN=ExampleRoot CA, O=Example Trust, C=NO",
    notBefore: "2020-01-01",
    notAfter: "2040-01-01",
    san: [],
    serial: "0xA1B2C3",
    sigAlg: "ECDSA-with-SHA384 (self-signed)",
    publicKey: "ECDSA P-384",
    fingerprint: "SHA256: 6f:8a:…:d2",
  };
  const intermediate: CertNode = {
    level: "intermediate",
    label: "Intermediate CA",
    subject: "CN=ExampleIssuer R3, O=Example Trust",
    issuer: "CN=ExampleRoot CA, O=Example Trust, C=NO",
    notBefore: "2024-01-01",
    notAfter: "2029-01-01",
    san: [],
    serial: "0xDE2024",
    sigAlg: "ECDSA-with-SHA256",
    publicKey: "ECDSA P-256",
    fingerprint: "SHA256: a3:1c:…:9b",
  };
  const server: CertNode = {
    level: "server",
    label: "Server",
    subject: `CN=${DOMAIN}, O=Example AS, C=NO`,
    issuer: "CN=ExampleIssuer R3, O=Example Trust",
    notBefore: "2026-02-14",
    notAfter: "2026-08-12",
    san: [DOMAIN, `www.${DOMAIN}`, `api.${DOMAIN}`],
    serial: "0x7F23",
    sigAlg: "ECDSA-with-SHA256",
    publicKey: "ECDSA P-256",
    fingerprint: "SHA256: 4d:9e:…:11",
    ocspUrl: "http://ocsp.example-trust.no",
  };

  if (mode === "expired") {
    server.notAfter = "2025-12-01";
  }
  if (mode === "wrong-cn") {
    server.subject = "CN=other-domain.no, O=Example AS, C=NO";
    server.san = ["other-domain.no"];
  }
  if (mode === "self-signed") {
    server.issuer = server.subject;
    server.sigAlg = "RSA-PSS-SHA256 (self-signed)";
    return [server];
  }

  return [server, intermediate, root];
}

type ValidationStep = {
  label: string;
  pass: boolean;
  detail: string;
};

function validate(chain: CertNode[], mode: BreakMode, ocspStapled: boolean): ValidationStep[] {
  const server = chain[0];
  const today = "2026-05-17"; // overensstemmer med currentDate
  const steps: ValidationStep[] = [];

  steps.push({
    label: "1. Kjede komplett (server → intermediate → root)",
    pass: chain.length === 3,
    detail:
      chain.length === 3
        ? "OK — server-cert, intermediate og root tilstede."
        : "FEIL — kjeden mangler intermediate eller root (self-signed eller broken-chain).",
  });

  const rootInStore = mode !== "untrusted" && chain.length === 3;
  steps.push({
    label: "2. Root i klient-trust-store (Mozilla NSS)",
    pass: rootInStore,
    detail: rootInStore
      ? "OK — ExampleRoot CA finnes i klientens innebygde trust store."
      : "FEIL — ingen anker. ERR_CERT_AUTHORITY_INVALID.",
  });

  const sigOk = chain.length === 3;
  steps.push({
    label: "3. Hver signatur verifisert i kjeden",
    pass: sigOk,
    detail: sigOk
      ? "OK — intermediate-signatur av server, root-signatur av intermediate. ECDSA-verifisering passerer."
      : "FEIL — signaturen kan ikke knyttes til en kjent CA.",
  });

  const notExpired = server.notAfter > today && server.notBefore <= today;
  steps.push({
    label: "4. Gyldighetsperiode (notBefore / notAfter)",
    pass: notExpired,
    detail: notExpired
      ? `OK — gyldig fra ${server.notBefore} til ${server.notAfter}. I dag: ${today}.`
      : `FEIL — utløpt ${server.notAfter}. NET::ERR_CERT_DATE_INVALID.`,
  });

  const domainMatch = server.san.includes(DOMAIN);
  steps.push({
    label: `5. SAN inneholder ${DOMAIN}`,
    pass: domainMatch,
    detail: domainMatch
      ? `OK — Subject Alternative Names: [${server.san.join(", ")}]`
      : `FEIL — SAN er [${server.san.join(", ") || "(tom)"}], ikke ${DOMAIN}. NET::ERR_CERT_COMMON_NAME_INVALID.`,
  });

  const revocationOk = mode !== "revoked";
  steps.push({
    label: `6. Revokasjonssjekk (${ocspStapled ? "OCSP stapling" : "OCSP via " + server.ocspUrl})`,
    pass: revocationOk,
    detail: revocationOk
      ? ocspStapled
        ? "OK — server inkluderte stapled OCSP-respons (signert av CA, <7 dager gammel). Ingen ekstra RTT."
        : "OK — klient gjorde online OCSP-spørring og fikk 'good'."
      : "FEIL — OCSP-respons sier 'revoked'. NET::ERR_CERT_REVOKED.",
  });

  return steps;
}

export function CertChainValidator() {
  const [mode, setMode] = useState<BreakMode>("ok");
  const [stapled, setStapled] = useState(true);
  const [expanded, setExpanded] = useState<string | null>("server");

  const chain = useMemo(() => buildChain(mode), [mode]);
  const steps = useMemo(() => validate(chain, mode, stapled), [chain, mode, stapled]);
  const allOk = steps.every((s) => s.pass);
  const firstFail = steps.find((s) => !s.pass);

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Sertifikatkjede-validator"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interaktiv validator</div>
        <div className="text-sm font-semibold">Sertifikatkjede-validator (X.509)</div>
        <div className="text-xs text-muted-foreground mt-1">
          Bryt valideringsreglene én av gangen og se hvilken browser-error som faktisk dukker opp.
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">bryt-modus:</span>
          {(
            [
              ["ok", "frisk"],
              ["expired", "utløpt"],
              ["wrong-cn", "feil CN"],
              ["untrusted", "ukjent root"],
              ["revoked", "revokert"],
              ["self-signed", "self-signed"],
            ] as [BreakMode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                mode === m
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
          <label className="ml-auto inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={stapled}
              onChange={(e) => setStapled(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            <span className="font-mono">OCSP stapling</span>
          </label>
        </div>

        {/* Kjede-visualisering */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {chain.map((cert) => {
            const isOpen = expanded === cert.level;
            const palette =
              cert.level === "server"
                ? "border-emerald-500/40 bg-emerald-500/5"
                : cert.level === "intermediate"
                  ? "border-sky-500/40 bg-sky-500/5"
                  : "border-violet-500/40 bg-violet-500/5";
            return (
              <div key={cert.level} className={`rounded-lg border ${palette}`}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : cert.level)}
                  className="w-full text-left px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{cert.label}</div>
                    <div className="text-xs font-mono break-all">{cert.subject.split(",")[0]}</div>
                  </div>
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 border-t border-border/50 pt-2 text-[10px] font-mono space-y-1">
                    <div>
                      <span className="text-muted-foreground">subject:</span> {cert.subject}
                    </div>
                    <div>
                      <span className="text-muted-foreground">issuer:</span> {cert.issuer}
                    </div>
                    <div>
                      <span className="text-muted-foreground">validity:</span> {cert.notBefore} → {cert.notAfter}
                    </div>
                    {cert.san.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">SAN:</span> {cert.san.join(", ")}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">serial:</span> {cert.serial}
                    </div>
                    <div>
                      <span className="text-muted-foreground">sig:</span> {cert.sigAlg}
                    </div>
                    <div>
                      <span className="text-muted-foreground">pubkey:</span> {cert.publicKey}
                    </div>
                    <div>
                      <span className="text-muted-foreground">fp:</span> {cert.fingerprint}
                    </div>
                    {cert.ocspUrl && (
                      <div>
                        <span className="text-muted-foreground">OCSP:</span> {cert.ocspUrl}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* OCSP-stapling-forklaring */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-[11px]">
          <div className="font-semibold mb-1">OCSP stapling — {stapled ? "PÅ" : "AV"}</div>
          <div className="text-muted-foreground">
            {stapled
              ? "Server inkluderer en CA-signert OCSP-respons (TLS extension status_request) sammen med sertifikatet. Klienten verifiserer signaturen lokalt. Sparer en RTT + ingen lekkasje til CA om hvilke sider du besøker."
              : "Klienten må selv slå opp OCSP-responder for hvert nytt cert. Tregere og lekker hvilke nettsteder du besøker til CA-en."}
          </div>
        </div>

        {/* Valideringsresultat */}
        <div
          className={`rounded-lg border-2 ${
            allOk ? "border-emerald-500 bg-emerald-500/5" : "border-rose-500 bg-rose-500/5"
          } p-3`}
        >
          <div className="flex items-center gap-2 mb-2">
            {allOk ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-600" />
            )}
            <div className="text-sm font-semibold">
              {allOk ? `Lås grønn — ${DOMAIN}` : `Browser-error: ${firstFail?.detail.split(".").pop()?.trim() ?? "ukjent"}`}
            </div>
          </div>
          <div className="space-y-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                {s.pass ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-mono">{s.label}</div>
                  <div className="text-muted-foreground">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> Sertifikatvalidering er ikke ett sjekkpunkt, men en kjede av seks
          uavhengige tester. Hver browser-error-kode peker på nøyaktig ett av disse. «Self-signed» i
          dev-miljø feiler test 1 og 2 samtidig — derfor lar browseren deg legge til unntak, men advarer
          tydelig. Certificate Transparency (CT) er et lag <em>over</em> dette: selv et gyldig cert kan
          bli avvist hvis det ikke ligger i en offentlig CT-logg.
        </div>
      </div>
    </div>
  );
}
