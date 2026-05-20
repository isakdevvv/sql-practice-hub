import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Layers, ShieldCheck, ShieldAlert, KeyRound, Network, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { SEC_FASER, SEC_BITS, getBitsInPhase, type SecBit } from "./bits";

export function SikkerhetHub() {
  return (
    <StackPageShell title="Sikkerhet" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Header />
        <KonvergensIntro />
        {SEC_FASER.map((f) => (
          <Fase key={f.id} fase={f} bits={getBitsInPhase(f.id)} />
        ))}
        <KoblingsKart />
      </article>
    </StackPageShell>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        DTE-2507 · Sikkerhetsdelen
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Fra CIA til OWASP — sikkerhetssporet
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        21 biter på fire faser. Du starter med <strong>kryptografiens prinsipper</strong> (CIA, symmetrisk, asymmetrisk, hash, signatur, PKI), bygger opp til <strong>sikker kommunikasjon</strong> (TLS, passord), graver i <strong>trusler og angrep</strong> (sniffing, DoS, spoofing, malware), og lander i <strong>anvendt sikring</strong> (brannmur, DMZ, VLAN, OS-herding, IDS, wifi, web).
      </p>
      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <span className="font-medium">Dette sporet konvergerer</span> — sikkerhet er ikke et eget tema, men der OS-sporet og DK-sporet møtes. Du finner cross-refs til OS-rettigheter, DK-pakker og forkurs-krypto-intuisjon i hver bit.
        </div>
      </div>
    </header>
  );
}

function KonvergensIntro() {
  return (
    <div className="mb-10 grid sm:grid-cols-3 gap-3">
      <KonvBoks
        farge="brand"
        Icon={ShieldCheck}
        tittel="Bygger på OS (DTE-2505)"
        tekst="Rettigheter, tjeneste-styring, logger, brukere — alt OS-en gjør for å holde maskinen din i orden, er også verktøyene for sikring."
      />
      <KonvBoks
        farge="purple"
        Icon={Network}
        tittel="Bygger på DK (DTE-2507 a)"
        tekst="TCP-håndtrykk, IP-pakker, ARP, svitsjer — alt nettet gjør, er også de flatene angripere går mot."
      />
      <KonvBoks
        farge="green"
        Icon={KeyRound}
        tittel="Bygger på krypto-intuisjon"
        tekst="F-11 ga deg ideene. Her møter du detaljene — symmetrisk, asymmetrisk, hash, signatur, PKI — i klar pedagogisk progresjon."
      />
    </div>
  );
}

function KonvBoks({
  farge,
  Icon,
  tittel,
  tekst,
}: {
  farge: "brand" | "purple" | "green";
  Icon: typeof ShieldCheck;
  tittel: string;
  tekst: string;
}) {
  const fargeKlass =
    farge === "brand"
      ? "border-brand/30 bg-brand/5"
      : farge === "purple"
        ? "border-purple-500/30 bg-purple-500/5"
        : "border-green-500/30 bg-green-500/5";
  const ikonKlass =
    farge === "brand"
      ? "text-brand"
      : farge === "purple"
        ? "text-purple-300"
        : "text-green-300";
  return (
    <div className={`rounded-lg border p-4 ${fargeKlass}`}>
      <div className={`flex items-center gap-2 font-semibold text-sm mb-2 ${ikonKlass}`}>
        <Icon className="h-4 w-4" /> {tittel}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{tekst}</p>
    </div>
  );
}

function Fase({ fase, bits }: { fase: (typeof SEC_FASER)[number]; bits: SecBit[] }) {
  return (
    <section className="mt-12">
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-brand">
            {fase.id.replace("SEC", "SEC-")}
          </span>
          <h2 className="text-xl font-semibold">{fase.tittel}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{fase.blurb}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {bits.map((b) => (
          <BitKort key={b.slug} bit={b} />
        ))}
      </div>
    </section>
  );
}

function BitKort({ bit }: { bit: SecBit }) {
  const tilgjengelig = bit.implementert;
  const innhold = (
    <>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-xs font-mono text-brand">{bit.bitId}</div>
        <div className="text-[10px] text-muted-foreground">{bit.estimertTid}</div>
      </div>
      <div className="font-semibold text-sm mb-1 flex items-center gap-2">
        {bit.tittel}
        {tilgjengelig ? (
          <ArrowRight className="h-3 w-3 text-brand group-hover:translate-x-0.5 transition" />
        ) : (
          <Lock className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{bit.blurb}</p>
      <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
        {bit.forutsetninger.length > 0 && (
          <span className="rounded bg-muted/40 px-1.5 py-0.5">
            krever {bit.forutsetninger.join(", ")}
          </span>
        )}
        {bit.bygger_paa.length > 0 && (
          <span className="rounded bg-purple-500/15 text-purple-300 px-1.5 py-0.5">
            bygger på {bit.bygger_paa[0]}
            {bit.bygger_paa.length > 1 ? ` +${bit.bygger_paa.length - 1}` : ""}
          </span>
        )}
        {!tilgjengelig && (
          <span className="rounded bg-orange-500/15 text-orange-300 px-1.5 py-0.5">
            kommer
          </span>
        )}
      </div>
    </>
  );

  if (!tilgjengelig) {
    return (
      <div className="group rounded-lg border p-4 border-border/50 bg-card/20 opacity-60">
        {innhold}
      </div>
    );
  }
  return (
    <Link
      to="/sikkerhet/$slug"
      params={{ slug: bit.slug }}
      className="group rounded-lg border p-4 transition border-border bg-card/40 hover:bg-card/70 hover:border-brand/50"
    >
      {innhold}
    </Link>
  );
}

function KoblingsKart() {
  return (
    <section className="mt-16 rounded-xl border border-border bg-card/30 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Layers className="h-4 w-4 text-brand" />
        Hvor sikkerheten henger sammen — tre konvergenspunkter
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        SEC-sporet er ikke et selvstendig tema, men der OS-sporet og DK-sporet smelter sammen i bruk. De tre tyngste konvergenspunktene:
      </p>
      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <KonvergensKort
          tittel="TLS"
          bit="SEC-07"
          fra={["DK-14 TCP-håndtrykk", "SEC-03 asymmetrisk", "SEC-05 signatur"]}
          forklaring="HTTPS er TCP-håndtrykket + asymmetrisk øktnøkkel-utveksling + sertifikat-verifisering kombinert."
        />
        <KonvergensKort
          tittel="Brannmur"
          bit="SEC-14"
          fra={["DK-21 IP-header", "OS-31 tjenester"]}
          forklaring="Du må forstå hva en pakke ER (IP/TCP) og hvordan tjenester startes på en Linux-server for å skrive et regelsett som henger sammen."
        />
        <KonvergensKort
          tittel="Herding"
          bit="SEC-17"
          fra={["OS-11/14 rettigheter", "OS-29 pakker", "OS-31 tjenester"]}
          forklaring="Ren OS-kunnskap i sikkerhetsbriller — minste privilegium, lukk porter, oppdatering."
        />
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs">
        <ShieldAlert className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          Full atomliste i{" "}
          <code className="text-brand">plan-laereplan-os-datakomm.md</code>
        </span>
      </div>
    </section>
  );
}

function KonvergensKort({
  tittel,
  bit,
  fra,
  forklaring,
}: {
  tittel: string;
  bit: string;
  fra: string[];
  forklaring: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-foreground">{tittel}</div>
        <div className="font-mono text-[10px] text-brand">{bit}</div>
      </div>
      <div className="text-[10px] text-muted-foreground mb-2">
        Krever: {fra.map((f, i) => (
          <span key={i} className="inline-block mr-1">
            <span className="text-purple-300">{f}</span>
            {i < fra.length - 1 ? "," : ""}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">{forklaring}</p>
    </div>
  );
}
