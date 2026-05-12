import { useState } from "react";

interface Step {
  from: "client" | "server";
  label: string;
  desc: string;
  /** Which crypto is in use here: asymmetric (slow), symmetric (fast), hash, etc. */
  crypto?: { kind: "asym" | "sym" | "hash" | "kdf"; note: string };
}

const STEPS_TLS12: Step[] = [
  {
    from: "client",
    label: "ClientHello",
    desc:
      "Klienten åpner: «her er versjon-listen min, cipher-suites jeg støtter, random-tall, og evt. SNI (hvilket domene)». Ingen kryptering ennå — sendes i klartekst.",
  },
  {
    from: "server",
    label: "ServerHello",
    desc:
      "Serveren velger versjon + cipher suite fra klientens liste, sender sitt eget random-tall.",
  },
  {
    from: "server",
    label: "Certificate",
    desc:
      "Serveren sender X.509-sertifikatet. Klienten verifiserer signaturen mot rota-CA-er i trust store, sjekker utløpsdato og at common-name matcher domenet.",
    crypto: { kind: "asym", note: "Validering av signaturkjede med CA-ens public key." },
  },
  {
    from: "server",
    label: "ServerKeyExchange (kun visse cipher-suites)",
    desc:
      "Ved (EC)DHE: serveren sender sin (ephemerale) Diffie-Hellman public key, signert med sin private RSA/ECDSA-nøkkel.",
    crypto: { kind: "asym", note: "Signaturen verifiseres med public key fra sertifikatet." },
  },
  {
    from: "server",
    label: "ServerHelloDone",
    desc: "«Jeg er ferdig. Din tur.»",
  },
  {
    from: "client",
    label: "ClientKeyExchange",
    desc:
      "Ved RSA-key-transport: klienten genererer pre-master-secret, krypterer med serverens public key og sender. Ved (EC)DHE: klienten sender sin DH public key, og begge regner ut pre-master lokalt.",
    crypto: { kind: "asym", note: "Asymmetrisk kun for å etablere felles shared secret." },
  },
  {
    from: "client",
    label: "Compute master secret",
    desc:
      "Begge sider regner master-secret fra (client_random, server_random, pre_master). Fra master-secret avledes symmetriske sesjonsnøkler.",
    crypto: { kind: "kdf", note: "PRF / HKDF gir 4 nøkler: client-mac, server-mac, client-enc, server-enc." },
  },
  {
    from: "client",
    label: "ChangeCipherSpec + Finished",
    desc:
      "«Nå krypterer jeg.» Finished-meldingen er en hash av alt som er sendt så langt, kryptert symmetrisk. Beviser at både handshake-historien og krypteringen virker.",
    crypto: { kind: "sym", note: "AES-GCM eller lignende — første kryptert melding." },
  },
  {
    from: "server",
    label: "ChangeCipherSpec + Finished",
    desc: "Server speiler. Begge har nå bevist at handshake-historien er intakt og at symmetriske nøkler funker.",
    crypto: { kind: "sym", note: "Samme kryptering motsatt vei." },
  },
  {
    from: "client",
    label: "Application Data",
    desc:
      "Faktisk HTTP-trafikk begynner. Alt går nå kryptert med symmetriske sesjonsnøkler — raskt.",
    crypto: { kind: "sym", note: "AES-GCM, ChaCha20-Poly1305, e.l." },
  },
];

const STEPS_TLS13: Step[] = [
  {
    from: "client",
    label: "ClientHello (med key_share)",
    desc:
      "Klienten gjetter cipher-suite og legger ved sin DH-public allerede. Sparer en round-trip.",
    crypto: { kind: "asym", note: "(EC)DHE er obligatorisk i TLS 1.3 — RSA-key-transport fjernet." },
  },
  {
    from: "server",
    label: "ServerHello (med key_share)",
    desc: "Serveren sender sin DH-public. Begge kan nå regne ut shared secret.",
    crypto: { kind: "asym", note: "Begge sider har nok til å avlede sesjonsnøkler." },
  },
  {
    from: "server",
    label: "{EncryptedExtensions, Certificate, CertVerify, Finished}",
    desc:
      "Alt etter ServerHello er KRYPTERT med tidlige sesjonsnøkler. Sertifikat eksponeres ikke i klartekst lenger.",
    crypto: { kind: "sym", note: "Handshake-traffic-keys (avledet fra DH-resultatet)." },
  },
  {
    from: "client",
    label: "{Finished}",
    desc: "Klienten verifiserer cert og signaturen, sender sin Finished.",
    crypto: { kind: "sym", note: "Klient sender første applikasjons-data umiddelbart." },
  },
  {
    from: "client",
    label: "Application Data (1-RTT)",
    desc:
      "Handshake er ferdig på én round-trip. 0-RTT er mulig med PSK fra forrige sesjon.",
    crypto: { kind: "sym", note: "Application-traffic-keys." },
  },
];

function StepRow({ s, n, active }: { s: Step; n: number; active: boolean }) {
  const isClient = s.from === "client";
  return (
    <div
      className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 border-l-2 pl-3 transition-colors ${
        active ? "border-brand bg-brand/5" : "border-transparent"
      }`}
    >
      <div className={`text-right text-xs ${isClient ? "" : "text-muted-foreground"}`}>
        {isClient && <span className="font-semibold">Klient</span>}
      </div>
      <div className="text-center font-mono text-xs text-brand">
        {isClient ? "→" : "←"} {n}
      </div>
      <div className={`text-xs ${isClient ? "text-muted-foreground" : ""}`}>
        {!isClient && <span className="font-semibold">Server</span>}
      </div>
      <div />
      <div className="col-span-2">
        <div className="font-mono text-xs font-semibold">{s.label}</div>
        {active && (
          <>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
            {s.crypto && (
              <div className="mt-1.5 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border">
                <span
                  className={
                    s.crypto.kind === "asym"
                      ? "text-amber-700 dark:text-amber-300"
                      : s.crypto.kind === "sym"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-sky-700 dark:text-sky-300"
                  }
                >
                  {s.crypto.kind.toUpperCase()}
                </span>
                <span className="text-muted-foreground"> · {s.crypto.note}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function HandshakeDiagram() {
  const [version, setVersion] = useState<"1.2" | "1.3">("1.3");
  const [active, setActive] = useState(0);
  const steps = version === "1.3" ? STEPS_TLS13 : STEPS_TLS12;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 text-sm">
          <button
            onClick={() => {
              setVersion("1.2");
              setActive(0);
            }}
            className={`px-2.5 py-1 rounded-md border ${version === "1.2" ? "bg-brand text-brand-foreground border-brand" : "border-border"}`}
          >
            TLS 1.2
          </button>
          <button
            onClick={() => {
              setVersion("1.3");
              setActive(0);
            }}
            className={`px-2.5 py-1 rounded-md border ${version === "1.3" ? "bg-brand text-brand-foreground border-brand" : "border-border"}`}
          >
            TLS 1.3
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Klikk en melding for detaljer
        </div>
      </div>

      <div className="space-y-0.5">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="w-full text-left hover:bg-muted/30 rounded-md"
          >
            <StepRow s={s} n={i + 1} active={active === i} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
          <span className="font-mono font-semibold">ASYM</span> · brukes BARE for å etablere shared secret + autentisering.
        </div>
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
          <span className="font-mono font-semibold">SYM</span> · raskt — alle Application Data går her.
        </div>
        <div className="rounded-md border border-sky-500/30 bg-sky-500/10 p-2 text-sky-700 dark:text-sky-300">
          <span className="font-mono font-semibold">KDF</span> · PRF/HKDF: avled flere nøkler fra ett shared secret.
        </div>
      </div>
    </div>
  );
}
