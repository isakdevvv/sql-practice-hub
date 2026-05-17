import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ChevronRight, Lock, KeyRound } from "lucide-react";

// ---------------------------------------------------------------------------
// TlsHandshakeAnimator — TLS 1.3 1-RTT handshake i 5 logiske faser.
//
// Mønsteret er hentet fra SharedMemorySim: to aktører (Klient C, Server S),
// en logg, step + auto-modus, og klikkbare faser med detalj-popup.
//
// Hver fase viser:
//   - hvilke felter som ligger i meldingens bytestream
//   - hva slags kryptografisk operasjon som skjer (sym/asym/KDF)
//   - hva som nå er kjent på hver side (state-tracking)
//
// Etter fase 2 sier vi tydelig at både C og S kommer fram til samme
// handshake_secret via HKDF(ECDHE_shared_secret) — uten å sende det.
// ---------------------------------------------------------------------------

type ActorId = "C" | "S" | "Both";

type PhaseId = 1 | 2 | 3 | 4 | 5;

type Phase = {
  id: PhaseId;
  who: ActorId;
  to: ActorId | null;
  title: string;
  message: string; // wire-record-navn
  direction: string; // arrow string i UI
  encrypted: boolean;
  shortDesc: string;
  fields: { name: string; value: string; comment: string }[];
  cryptoNote: string;
  /** Hva som er "kjent" på hver side ETTER denne fasen kjørt. */
  clientKnows: string[];
  serverKnows: string[];
};

const PHASES: Phase[] = [
  {
    id: 1,
    who: "C",
    to: "S",
    title: "ClientHello",
    message: "ClientHello",
    direction: "C ──▶ S",
    encrypted: false,
    shortDesc:
      "Klienten åpner: foreslår TLS-versjoner, cipher suites og sender allerede sitt ECDHE-key-share. Ingen krypto enda — alt i klartekst.",
    fields: [
      { name: "legacy_version", value: "0x0303 (TLS 1.2)", comment: "kompatibilitet — ekte versjon i extension" },
      { name: "random", value: "32 byte tilfeldig (C_random)", comment: "nonce inn i transcript-hash" },
      { name: "cipher_suites", value: "[AES_128_GCM_SHA256, CHACHA20_POLY1305_SHA256, AES_256_GCM_SHA384]", comment: "AEAD-only i TLS 1.3" },
      { name: "extensions.supported_versions", value: "[0x0304 (TLS 1.3)]", comment: "ekte versjons-signalering" },
      { name: "extensions.supported_groups", value: "[x25519, secp256r1, secp384r1]", comment: "ECDHE-kurver klient takler" },
      { name: "extensions.key_share", value: "x25519: g^c (32 byte public)", comment: "klientens halvdel av ECDHE — uten denne ville vi trengt 2 RTT" },
      { name: "extensions.signature_algorithms", value: "[rsa_pss_rsae_sha256, ecdsa_secp256r1_sha256, ed25519]", comment: "hva klienten godtar at server signerer med" },
      { name: "extensions.server_name (SNI)", value: "shop.example.no", comment: "lekker — derfor finnes ECH" },
      { name: "extensions.alpn", value: "[h2, http/1.1]", comment: "protokoll-forhandling" },
    ],
    cryptoNote:
      "Ingen kryptering. Klienten har generert et ephemeral ECDHE-keypair (c privat, g^c public) og sender bare det offentlige halve sammen med en 32-byte random. Alt er ennå synlig for passive avlyttere.",
    clientKnows: ["c (egen privat ECDHE)", "g^c (egen public)", "C_random", "valgliste av suites"],
    serverKnows: [],
  },
  {
    id: 2,
    who: "S",
    to: "C",
    title: "ServerHello + key_share",
    message: "ServerHello",
    direction: "C ◀── S",
    encrypted: false,
    shortDesc:
      "Server velger cipher, genererer sitt eget ephemeral ECDHE, og sender g^s tilbake. Nå kan begge regne ECDHE — alt etter denne meldingen er kryptert.",
    fields: [
      { name: "legacy_version", value: "0x0303", comment: "samme kompat-felt" },
      { name: "random", value: "32 byte (S_random)", comment: "siste 8 byte avslører om server downgrader (downgrade-protection-sentinel)" },
      { name: "cipher_suite", value: "TLS_AES_128_GCM_SHA256", comment: "ett valgt fra klientens liste" },
      { name: "extensions.supported_versions", value: "0x0304", comment: "bekrefter TLS 1.3" },
      { name: "extensions.key_share", value: "x25519: g^s (32 byte public)", comment: "serverens ECDHE-halvdel" },
    ],
    cryptoNote:
      "ECDHE-fasen ferdig. Begge regner shared_secret = ECDH(c, g^s) = ECDH(s, g^c). Deretter HKDF-Extract + HKDF-Expand-Label gir handshake_secret og videre client_handshake_traffic_secret og server_handshake_traffic_secret. Selve verdiene sendes ALDRI over kabelen.",
    clientKnows: ["g^s mottatt", "shared_secret = ECDH(c, g^s)", "handshake_secret via HKDF", "[c_hs_traffic, s_hs_traffic] avledet"],
    serverKnows: ["g^c mottatt", "shared_secret = ECDH(s, g^c)", "handshake_secret via HKDF", "[c_hs_traffic, s_hs_traffic] avledet"],
  },
  {
    id: 3,
    who: "S",
    to: "C",
    title: "EncryptedExtensions + Certificate + CertificateVerify + Finished",
    message: "{Server flight}",
    direction: "C ◀══ S",
    encrypted: true,
    shortDesc:
      "Alt fra server er nå kryptert med server_handshake_traffic_secret. Server identifiserer seg, beviser eierskap til private key, og signerer transcript hittil.",
    fields: [
      { name: "EncryptedExtensions", value: "ALPN: h2, SNI ACK, …", comment: "alt som ikke trenger å være i klartekst" },
      { name: "Certificate.certificate_list", value: "[server.crt, intermediate.crt]", comment: "X.509-kjede uten root (root antas i klient-store)" },
      { name: "CertificateVerify.algorithm", value: "rsa_pss_rsae_sha256", comment: "signaturalgoritme" },
      { name: "CertificateVerify.signature", value: "Sign(privkey, transcript_hash || context)", comment: "beviser at server EIER private-key som passer til cert" },
      { name: "Finished.verify_data", value: "HMAC(finished_key, transcript_hash)", comment: "binder alle tidligere meldinger" },
    ],
    cryptoNote:
      "CertificateVerify er den asymmetriske kjernen: serveren signerer hele handshake-transkriptet med privat-nøkkelen som hører til sertifikatet. Hvis MITM bytter ut cert med sitt eget, fungerer ikke signaturen fordi MITM mangler den private nøkkelen som passer til ekte CA-signert cert.",
    clientKnows: ["server-cert", "transcript-signatur verifisert", "server bekreftet eier av private key", "Finished mottatt"],
    serverKnows: ["sin egen flight sendt"],
  },
  {
    id: 4,
    who: "C",
    to: "S",
    title: "Client Finished",
    message: "{Finished}",
    direction: "C ══▶ S",
    encrypted: true,
    shortDesc:
      "Klienten har validert cert-kjede + signatur + Finished. Sender sitt eget Finished, kryptert med client_handshake_traffic_secret.",
    fields: [
      { name: "Finished.verify_data", value: "HMAC(c_finished_key, transcript_hash)", comment: "klientens kvittering — handshake forseglet" },
    ],
    cryptoNote:
      "Etter denne meldingen avleder begge sider master_secret og deretter application traffic secrets (client_application_traffic_secret_0 / server_application_traffic_secret_0). Resumption-master-secret beregnes også her for fremtidige 0-RTT.",
    clientKnows: ["application_traffic_secrets avledet", "klar for app-data"],
    serverKnows: ["client Finished verifisert", "application_traffic_secrets avledet", "klar for app-data"],
  },
  {
    id: 5,
    who: "Both",
    to: null,
    title: "Application Data",
    message: "[Application Data]",
    direction: "C ⇄ S",
    encrypted: true,
    shortDesc:
      "1-RTT oppnådd: klienten kan sende den første HTTP-request-en allerede sammen med sin Finished. All trafikk fra nå krypteres med AES-128-GCM (eller hva som ble valgt).",
    fields: [
      { name: "AEAD.cipher", value: "AES-128-GCM", comment: "valgt suite" },
      { name: "AEAD.nonce", value: "client_iv ⊕ sequence_number", comment: "ingen IV på wiren" },
      { name: "AEAD.aad", value: "TLSPlaintext.type || version || length", comment: "binder header til ciphertext" },
      { name: "AEAD.tag", value: "16 byte auth-tag", comment: "integritet — endring detekteres" },
      { name: "payload", value: "GET / HTTP/2 …", comment: "selve HTTP-meldingen" },
    ],
    cryptoNote:
      "Forward secrecy oppnådd: når denne sesjonen er over, slettes c og s. Selv om server-privatnøkkelen senere lekkes, kan ikke historikken dekrypteres — den var bundet til ephemerale ECDHE-nøkler.",
    clientKnows: ["sender/mottar app-data"],
    serverKnows: ["sender/mottar app-data"],
  },
];

type LogEntry = { t: number; who: ActorId; text: string; tone: "info" | "good" | "crypto" };

export function TlsHandshakeAnimator() {
  const [current, setCurrent] = useState<number>(-1); // -1 = før alt
  const [running, setRunning] = useState(false);
  const [openPhase, setOpenPhase] = useState<PhaseId | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tickFn = () => {
      setCurrent((prev) => {
        const next = prev + 1;
        if (next >= PHASES.length) {
          setRunning(false);
          return prev;
        }
        const phase = PHASES[next];
        appendLog(phase.who, `${phase.direction}  ${phase.message}${phase.encrypted ? " (kryptert)" : ""}`, "info");
        if (next === 1) {
          appendLog("Both", "HKDF: derive handshake_secret + traffic secrets fra ECDHE shared_secret", "crypto");
        }
        if (next === 3) {
          appendLog("Both", "HKDF: derive application_traffic_secrets fra master_secret", "crypto");
        }
        return next;
      });
      timerRef.current = window.setTimeout(tickFn, 1100);
    };
    timerRef.current = window.setTimeout(tickFn, 600);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [running]);

  function appendLog(who: ActorId, text: string, tone: LogEntry["tone"]) {
    setLog((prev) => [{ t: prev.length, who, text, tone }, ...prev].slice(0, 14));
  }

  function reset() {
    setRunning(false);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    setCurrent(-1);
    setOpenPhase(null);
    setLog([]);
  }

  function stepOne() {
    if (running) return;
    setCurrent((prev) => {
      const next = prev + 1;
      if (next >= PHASES.length) return prev;
      const phase = PHASES[next];
      appendLog(phase.who, `${phase.direction}  ${phase.message}${phase.encrypted ? " (kryptert)" : ""}`, "info");
      if (next === 1) {
        appendLog("Both", "HKDF: derive handshake_secret + traffic secrets fra ECDHE shared_secret", "crypto");
      }
      if (next === 3) {
        appendLog("Both", "HKDF: derive application_traffic_secrets fra master_secret", "crypto");
      }
      return next;
    });
  }

  const phaseOpen = openPhase ? PHASES.find((p) => p.id === openPhase) : null;
  const cumulativeClientKnows = PHASES.slice(0, current + 1).flatMap((p) => p.clientKnows);
  const cumulativeServerKnows = PHASES.slice(0, current + 1).flatMap((p) => p.serverKnows);

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="TLS 1.3 handshake animator"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interaktiv simulator</div>
        <div className="text-sm font-semibold">TLS 1.3 handshake — 1-RTT, 5 faser</div>
        <div className="text-xs text-muted-foreground mt-1">
          Klikk en fase for full bytestream. Auto-modus kjører hele handshaken; «steg» kjører én fase om gangen.
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={running ? () => setRunning(false) : () => setRunning(true)}
            disabled={current >= PHASES.length - 1 && !running}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "pause" : current < 0 ? "start" : current >= PHASES.length - 1 ? "ferdig" : "fortsett"}
          </button>
          <button
            type="button"
            onClick={stepOne}
            disabled={running || current >= PHASES.length - 1}
            className="px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted inline-flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" /> steg
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> reset
          </button>
          <div className="ml-auto text-[11px] font-mono text-muted-foreground">
            fase {Math.max(0, current + 1)} / {PHASES.length}
          </div>
        </div>

        {/* Klient ↔ Server-tidslinje */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 font-mono mb-2">
              Klient (C)
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mb-1">vet:</div>
            <ul className="text-[10px] font-mono space-y-0.5 max-h-32 overflow-y-auto">
              {cumulativeClientKnows.length === 0 ? (
                <li className="italic text-muted-foreground">— (før handshake)</li>
              ) : (
                cumulativeClientKnows.map((k, i) => <li key={i}>· {k}</li>)
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-1 justify-center min-w-[28px] items-center">
            <div className="text-[10px] text-muted-foreground font-mono">RTT</div>
            <div className="h-full w-px bg-border" />
          </div>

          <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-300 font-mono mb-2">
              Server (S)
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mb-1">vet:</div>
            <ul className="text-[10px] font-mono space-y-0.5 max-h-32 overflow-y-auto">
              {cumulativeServerKnows.length === 0 ? (
                <li className="italic text-muted-foreground">— (lytter)</li>
              ) : (
                cumulativeServerKnows.map((k, i) => <li key={i}>· {k}</li>)
              )}
            </ul>
          </div>
        </div>

        {/* Faseboks-rad */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {PHASES.map((p, i) => {
            const active = i === current;
            const passed = i < current;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpenPhase(openPhase === p.id ? null : p.id)}
                className={`text-left rounded-lg border p-2 transition-colors ${
                  active
                    ? "border-brand bg-brand/10 ring-2 ring-brand/50"
                    : passed
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-border bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{p.id}</span>
                  {p.encrypted && <Lock className="h-3 w-3 text-emerald-600" />}
                </div>
                <div className="text-xs font-semibold leading-tight">{p.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{p.direction}</div>
              </button>
            );
          })}
        </div>

        {/* HKDF-illustrasjon */}
        {current >= 1 && (
          <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <KeyRound className="h-3.5 w-3.5 text-violet-700 dark:text-violet-300" />
              <div className="text-[11px] uppercase tracking-wider text-violet-700 dark:text-violet-300 font-semibold">
                HKDF — begge sider regner samtidig, ingenting sendes
              </div>
            </div>
            <pre className="text-[10px] font-mono leading-snug overflow-x-auto">{`shared_secret  = ECDH(c, g^s) == ECDH(s, g^c)
early_secret   = HKDF-Extract(salt=0, IKM=0)              ← før handshake
handshake_secret = HKDF-Extract(salt=Derive(early), IKM=shared_secret)
c_hs_traffic   = HKDF-Expand-Label(handshake_secret, "c hs traffic", transcript_hash)
s_hs_traffic   = HKDF-Expand-Label(handshake_secret, "s hs traffic", transcript_hash)
${current >= 3 ? `master_secret  = HKDF-Extract(salt=Derive(handshake), IKM=0)
c_ap_traffic   = HKDF-Expand-Label(master_secret, "c ap traffic", transcript_hash)
s_ap_traffic   = HKDF-Expand-Label(master_secret, "s ap traffic", transcript_hash)` : "(application secrets venter til fase 4)"}`}</pre>
          </div>
        )}

        {/* Detalj-popup for valgt fase */}
        {phaseOpen && (
          <div className="rounded-xl border-2 border-brand bg-card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  fase {phaseOpen.id} · {phaseOpen.direction}
                </div>
                <div className="text-sm font-bold">{phaseOpen.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpenPhase(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                lukk ×
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{phaseOpen.shortDesc}</p>
            <div className="rounded-md border border-border overflow-hidden mb-3">
              <table className="w-full text-[11px]">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-2 py-1 font-mono w-1/3">felt</th>
                    <th className="text-left px-2 py-1 font-mono w-1/3">verdi</th>
                    <th className="text-left px-2 py-1 w-1/3">kommentar</th>
                  </tr>
                </thead>
                <tbody>
                  {phaseOpen.fields.map((f, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-2 py-1 font-mono text-brand">{f.name}</td>
                      <td className="px-2 py-1 font-mono break-all">{f.value}</td>
                      <td className="px-2 py-1 text-muted-foreground">{f.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-[11px]">
              <strong>Krypto:</strong> {phaseOpen.cryptoNote}
            </div>
          </div>
        )}

        {/* Logg */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Handshake-logg</div>
          {log.length === 0 ? (
            <div className="text-[11px] italic text-muted-foreground">
              Klikk «start» eller «steg» for å spille handshaken.
            </div>
          ) : (
            <div className="space-y-0.5 font-mono text-[11px] max-h-40 overflow-y-auto">
              {log.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.tone === "crypto"
                      ? "text-violet-700 dark:text-violet-300"
                      : l.tone === "good"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-foreground"
                  }
                >
                  <span className="opacity-50">t={l.t}</span>{" "}
                  <span className="text-muted-foreground">[{l.who}]</span> {l.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> TLS 1.3 oppnår 1-RTT fordi klienten allerede i ClientHello sender sitt
          ECDHE-key-share. Server kan svare med sitt key-share + cert + Finished i én tur. Det shared_secret
          som begge regner ut sendes <em>aldri</em> — det utledes lokalt på hver side via HKDF. Det er det som
          gir forward secrecy: ephemerale c, s slettes etter sesjonen.
        </div>
      </div>
    </div>
  );
}
