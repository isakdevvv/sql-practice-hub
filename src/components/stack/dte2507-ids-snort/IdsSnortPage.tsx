import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { IdsRuleSimulator } from "./IdsRuleSimulator";

const STEPS = [
  { title: "Brannmur vs IDS", anchor: "fw-vs-ids" },
  { title: "Signature-based: Snort", anchor: "signature" },
  { title: "Anomaly-based: 0-day-jakt", anchor: "anomaly" },
  { title: "Trade-offs", anchor: "tradeoffs" },
  { title: "DMZ — sone-arkitektur", anchor: "dmz" },
  { title: "IDS-simulator", anchor: "sim" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function IdsSnortPage() {
  return (
    <StackPageShell title="IDS: signature vs anomaly + DMZ" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 8.9.4 (s. 675-679)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            IDS — signature vs anomaly, og hvor DMZ-en hører hjemme
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Brannmuren stenger trafikk-typer; et <strong>Intrusion Detection System</strong>{" "}
            (IDS) ser etter <em>angreps-signaturer</em> i den trafikken som faktisk
            slipper gjennom. To grunnleggende strategier konkurrerer: lete etter kjente
            mønstre (signature-based, som Snort) eller lete etter statistiske avvik
            (anomaly-based). Begge har skarpe svakheter, og moderne sikkerhets-arkitektur
            bruker dem komplementært — gjerne med en <strong>DMZ</strong> som
            sone-buffer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">IDS-simulatoren</a>{" "}
              under viser 6 hendelser. Bytt mellom modi og terskler — se hvilke 0-day
              som glipper i signatur-mode og hvilke false positives som kommer i
              anomaly-mode.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-ids-snort" steps={STEPS} />

        <section id="fw-vs-ids" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Brannmur vs IDS</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Brannmur</th>
                  <th className="text-left font-semibold px-4 py-2">IDS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Inngrep</td>
                  <td className="px-4 py-3">Aktiv — blokkerer pakker</td>
                  <td className="px-4 py-3">Passiv — varsler operatør</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Ser på</td>
                  <td className="px-4 py-3">Header, flagg, 5-tuppel</td>
                  <td className="px-4 py-3">Payload + kontekst</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Plassering</td>
                  <td className="px-4 py-3">In-line</td>
                  <td className="px-4 py-3">Span port / TAP, ofte sniffer</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Eksempel</td>
                  <td className="px-4 py-3">iptables, pf, Cisco ASA</td>
                  <td className="px-4 py-3">Snort, Suricata, Zeek</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <strong>IPS</strong> (Intrusion Prevention System) er et IDS som plasseres
            in-line og kan også blokkere. Skillet «IDS vs IPS» er hovedsakelig om
            systemet sitter på span-port eller in-line.
          </p>
        </section>

        <section id="signature" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Signature-based — Snort som arketype</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Et signatur-IDS har et katalog over kjente angreps-mønstre («signaturer»).
            For hver pakke sjekkes den mot katalogen. Snort, åpen kildekode, er
            kanon-eksempelet — bokens valg. En Snort-regel ser slik ut:
          </p>
          <pre className="rounded-xl border border-border bg-card p-4 text-xs font-mono leading-relaxed overflow-x-auto">
{`alert icmp $EXTERNAL_NET any -> $HOME_NET any \\
   ( msg:"ICMP PING NMAP";
     dsize:0;
     itype:8;
     reference:arachnids,162;
     classtype:attempted-recon;
     sid:469; rev:3; )`}
          </pre>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Felt for felt:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <code className="font-mono">alert icmp</code> — hvis pakka er ICMP, generer
              alarm.
            </li>
            <li>
              <code className="font-mono">$EXTERNAL_NET any -&gt; $HOME_NET any</code> —
              fra alle eksterne, til alle interne.
            </li>
            <li>
              <code className="font-mono">dsize:0; itype:8</code> — Nmap-ping har 0 bytes
              payload og ICMP type 8 (echo request).
            </li>
            <li>
              <code className="font-mono">msg:"ICMP PING NMAP"</code> — tekst som dukker
              opp i alarm-loggen.
            </li>
            <li>
              <code className="font-mono">sid:469</code> — Snort-rule-ID, kobler til
              katalog/CVE.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Etter rekken med felter får man <em>presise</em> alarmer på akkurat det
            angrepet. Snort har titusenvis av slike regler vedlikeholdt av Cisco Talos,
            Emerging Threats osv.
          </p>
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
            <strong className="text-rose-700 dark:text-rose-400">Svakheten:</strong>{" "}
            signaturer er per definisjon <em>retrospektive</em>. Et <strong>0-day</strong>{" "}
            (ukjent angrep) finnes ikke i katalogen og slipper rett gjennom. Mellom 2014
            og 2017 var gjennomsnittlig tid mellom et 0-day blir brukt og signaturer
            publiseres ~9 måneder.
          </div>
        </section>

        <section id="anomaly" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Anomaly-based — leter etter avvik</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Et anomaly-IDS lærer hva som er <em>normalt</em> trafikk-mønster — antall
            forbindelser per sekund, byte-fordelinger, port-bruk, tidsmønstre — og slår
            alarm på avvik. Modellene kan være statistiske (gjennomsnitt + standardavvik)
            eller ML-baserte (autoencodere, isolation forest, klyngeanalyse).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Fordel:</strong> kan oppdage 0-day fordi angrepet ikke ligner normal
            trafikk. <strong>Ulempe:</strong> «normal» varierer over døgnet, ukedag,
            ferier, lansering av nye tjenester. Kalibrering er kontinuerlig hodepine, og
            FP-raten er ofte for høy til å være praktisk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm mt-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Klassiske anomaly-features
            </div>
            <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
              <li>Antall unike destinasjons-IPer per kilde de siste 5 min (port-scan-indikator).</li>
              <li>Forholdet ut/inn-bytes (data-exfiltrering har høyt utgående volum).</li>
              <li>Tid-på-døgnet (back-end-tjenester med trafikk kl 03:00 er mistenkelig).</li>
              <li>DNS-spørringer med ekstrem entropi i navn (DGA — malware C2-kanal).</li>
            </ul>
          </div>
        </section>

        <section id="tradeoffs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Trade-offs</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">Signature</th>
                  <th className="text-left font-semibold px-4 py-2">Anomaly</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">0-day</td>
                  <td className="px-4 py-3">Misser — ikke i katalogen</td>
                  <td className="px-4 py-3">Kan fange — hvis det avviker</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Falsk-positive</td>
                  <td className="px-4 py-3">Få — presise mønstre</td>
                  <td className="px-4 py-3">Mange — modell-feil + drift</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Vedlikehold</td>
                  <td className="px-4 py-3">Oppdater signatur-katalog</td>
                  <td className="px-4 py-3">Re-trening, kalibrering</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Tolkbarhet</td>
                  <td className="px-4 py-3">Direkte — sid + msg</td>
                  <td className="px-4 py-3">Vag — «trafikk-avvik»</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            I praksis: bedrifter kjører <em>begge</em> i lag. Signaturer i frontlinjen
            (lavt støy-nivå, gir actionable alerts) og anomaly som «andre linje» som
            triages av et SOC-team.
          </p>
        </section>

        <section id="dmz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. DMZ — sone-arkitektur</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En <strong>DMZ (DeMilitarized Zone)</strong> er en nettsone <em>mellom</em>{" "}
            internett og det interne nettet, beskyttet av to brannmurer (eller én med
            tre interfaces). Publikum-vendte tjenester (webserver, e-postserver,
            DNS-server) plasseres i DMZ — ikke i det interne nettet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre-soners design
            </div>
            <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto">
{`           ┌───────────────────┐
   internet ──→  ytre brannmur  ─→  DMZ  ─→  indre brannmur  ─→  internt nett
           └───────────────────┘     │                              │
                                     ├─ webserver (HTTP/HTTPS)     ├─ workstations
                                     ├─ SMTP-relay                  ├─ databaser
                                     └─ DNS auth-server             └─ filservere

   Regler:
     ytre brannmur: tillat HTTP/HTTPS/SMTP/DNS → DMZ, ALT annet blokkert
     indre brannmur: aldri direkte tillat utenfra → internt
                     tillat DMZ → internt KUN spesifikke porter (f.eks. DB:5432)
                     tillat internt → DMZ for admin/oppdatering`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Logikken: hvis en angriper kompromitterer en server i DMZ-en, kommer hun bare
            <em> inn i DMZ-en</em> — den indre brannmuren står fortsatt mellom henne og
            de virkelige verdiene (kunde-databaser, kildekode, intern fildeling). IDS-en
            plasseres typisk på span-porter i begge soner: én ser internett-trafikk inn
            til DMZ, én ser DMZ-trafikk inn til internt.
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. IDS-simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            6 nettverks-hendelser kjøres gjennom IDS-en. Bytt deteksjonsmodus og se hva
            som faller i hver TP/FP/FN/TN-bøtte.
          </p>
          <IdsRuleSimulator />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Tre øvelser:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>0-day i signature-mode.</strong> Velg «Signature». Pakke #3
                (zero-day IoT-exploit) slipper gjennom — den finnes ikke i katalogen.
                Bytt til «Anomaly» med terskel 60 — nå fanges den.
              </li>
              <li>
                <strong>False positive i anomaly-mode.</strong> Pakke #4 er en legitim
                cron-backup, men ser ut som exfiltrering. Lavt terskel-tall → flere FP.
                Skyv terskelen opp til 80 — backup-en blir stille, men du risikerer å
                miste angrepet.
              </li>
              <li>
                <strong>Begge i kombinasjon.</strong> Velg «Begge». Du fanger flest TPs,
                men FPs forblir. Det er prisen for å fange 0-day.
              </li>
            </ol>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-quick-ref</h2>
          <ul className="text-sm space-y-2 list-disc pl-5">
            <li>
              <strong>IDS varsler, IPS blokkerer.</strong> Plassering: span-port for IDS,
              in-line for IPS.
            </li>
            <li>
              <strong>Signature:</strong> presise alarmer på kjente angrep; misser 0-day.
              Snort er kanon-eksempel.
            </li>
            <li>
              <strong>Anomaly:</strong> kan fange 0-day; lider av høy FP-rate og krever
              kalibrering.
            </li>
            <li>
              <strong>DMZ:</strong> sone mellom internett og internt nett, med
              publikum-vendte tjenester. To brannmurer (eller én tri-port-brannmur).
            </li>
            <li>
              <strong>Snort-regel-anatomi:</strong> <code className="font-mono">action proto src→dst (options; sid; msg)</code>.
              Husk «alert icmp ... msg: "ICMP PING NMAP"» som eksempel.
            </li>
          </ul>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesning</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-stateful-firewall" }} className="text-brand hover:underline">
                Stateful vs stateless brannmur
              </Link>{" "}
              — komplementært forsvar foran IDS.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-brannmur-vlan" }} className="text-brand hover:underline">
                Brannmur og VLAN
              </Link>{" "}
              — sone-segmentering i praksis.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "nettverkssikkerhet" }} className="text-brand hover:underline">
                Nettverkssikkerhet
              </Link>{" "}
              — helhetsbildet for forsvars-strategi.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
