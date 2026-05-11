import { Link } from "@tanstack/react-router";
import { ArrowRight, Network, Server, Lock, Key, Shield } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Network;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "osi-tcpip",
    title: "OSI- og TCP/IP-modellen",
    shortDescription:
      "De fem (eller syv) lagene, top-down: applikasjon → transport → nettverk → lenke → fysisk. Hvilken protokoll bor hvor.",
    Icon: Network,
    status: "ready",
  },
  {
    slug: "transportlag",
    title: "Transportlag — TCP og UDP",
    shortDescription:
      "TCP: pålitelig, tilkoblet, flow control. UDP: enkel, raskt, upålitelig. Når brukes hvilken, og hvorfor.",
    Icon: Server,
    status: "ready",
  },
  {
    slug: "kryptografi",
    title: "Kryptografi-grunnlag",
    shortDescription:
      "Symmetrisk vs asymmetrisk, hash vs MAC, digital signatur, PKI. Hva som beskytter mot hva.",
    Icon: Key,
    status: "ready",
  },
  {
    slug: "tls",
    title: "TLS-håndtrykk",
    shortDescription:
      "Hva som faktisk skjer fra «klikk på https://» til kryptert kanal: ClientHello, sertifikat, nøkkel-utveksling, Finished.",
    Icon: Lock,
    status: "ready",
  },
  {
    slug: "nettverkssikkerhet",
    title: "Nettverkssikkerhet — brannmur, IDS, angrep",
    shortDescription:
      "Stateful vs stateless brannmur, IDS vs IPS, vanlige angrep (sniffing, MITM, DDoS), forsvarsdyp.",
    Icon: Shield,
    status: "ready",
  },
];

export function Dte2507Hub() {
  return (
    <StackPageShell title="DTE-2507 Datakommunikasjon og sikkerhet" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · 10 stp · Teknisk spesialisering
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Datakommunikasjon og sikkerhet
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Fem mini-kurs som dekker pensum fra Kurose & Ross: hele protokoll-stakken
            top-down, kryptografi-grunnlag, TLS, og praktisk nettverkssikkerhet. Hver
            del har teori + drag-oppgaver.
          </p>
        </div>

        {/* Cheatsheet — protokoll-stakken */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Stakken på én side</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver request går ned-gjennom hos sender, opp-gjennom hos mottaker. Lær deg
            «hvilken protokoll bor på hvilket lag» utenat.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Lag</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Ansvar</th>
                  <th className="text-left font-semibold px-4 py-2">Protokoller</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">5. Applikasjon</td>
                  <td className="px-4 py-3">Hva brukeren faktisk gjør</td>
                  <td className="px-4 py-3 text-muted-foreground">HTTP/HTTPS, SMTP, DNS, SSH, FTP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">4. Transport</td>
                  <td className="px-4 py-3">Ende-til-ende, prosesser</td>
                  <td className="px-4 py-3 text-muted-foreground">TCP, UDP, QUIC</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">3. Nettverk</td>
                  <td className="px-4 py-3">Ruting mellom nett</td>
                  <td className="px-4 py-3 text-muted-foreground">IP (v4/v6), ICMP, OSPF, BGP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">2. Lenke</td>
                  <td className="px-4 py-3">Én hopp på samme nett</td>
                  <td className="px-4 py-3 text-muted-foreground">Ethernet, WiFi (802.11), ARP, MAC</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">1. Fysisk</td>
                  <td className="px-4 py-3">Bits over kabel/luft</td>
                  <td className="px-4 py-3 text-muted-foreground">Kobber, fiber, radio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Kurs-grid */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div
                    key={c.slug}
                    className="rounded-xl border border-border bg-card/30 p-5 opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> hvert kurs har
              fyll-inn, match og quiz under sitt emne — sjekk poeng på{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
            <li>
              <strong className="text-foreground">Pre-rekvisitter:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "tcp-sockets" }} className="text-brand hover:underline">
                TCP/sockets
              </Link>{" "}og{" "}
              <Link to="/stack/$slug" params={{ slug: "http-anatomi" }} className="text-brand hover:underline">
                HTTP-anatomi
              </Link>{" "}dekker grunnlaget før du dykker dypere.
            </li>
            <li>
              <strong className="text-foreground">Sikkerhet:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "sikkerhet" }} className="text-brand hover:underline">
                Web-sikkerhet
              </Link>{" "}dekker applikasjonsnivå-angrep (SQLi, XSS, CSRF) som komplement til nettverkssikkerheten her.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
