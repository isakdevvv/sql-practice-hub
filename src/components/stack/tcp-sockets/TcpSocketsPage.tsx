import { Link } from "@tanstack/react-router";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { TcpHandshakeDiagram } from "./TcpHandshakeDiagram";
import { SocketLifecycle } from "./SocketLifecycle";
import { StreamVsMessage } from "./StreamVsMessage";

const SERVER_PSEUDOCODE = `import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind(("0.0.0.0", 5000))
sock.listen()
while True:
    client, addr = sock.accept()
    data = client.recv(4096)   # bytes!
    client.send(b"HTTP/1.1 200 OK\\r\\n\\r\\nHello")
    client.close()`;

export function TcpSocketsPage() {
  return (
    <StackPageShell title="TCP & sockets (kort)" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-[10px]">Eksamensforberedelse</Badge>
            <Badge variant="outline" className="text-[10px]">Kort versjon</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">TCP & sockets</h1>
          <p className="text-muted-foreground mt-2 text-base leading-relaxed">
            Hvor kommer egentlig en HTTP-request fra? Før Flask «mottar» noe, har OS-en allerede
            gjort jobben med å åpne en TCP-tilkobling og levere bytes. Dette er den korte
            forklaringen på hvordan.
          </p>
        </header>

        {/* 1. IP & port */}
        <Section
          number={1}
          title="IP & port — adressen"
          intro="For å snakke med en bestemt prosess på en bestemt maskin trenger du to ting."
        >
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>
              <strong>IP-adressen</strong> identifiserer maskinen i nettverket
              (f.eks. <code>127.0.0.1</code>, <code>192.168.1.42</code>, <code>10.0.0.5</code>).
            </li>
            <li>
              <strong>Porten</strong> identifiserer hvilken prosess på maskinen som skal motta
              (f.eks. <code>80</code>, <code>443</code>, <code>5000</code>).
            </li>
          </ul>
          <p className="text-sm mt-3">
            Når du skriver <code>localhost:5000</code> i nettleseren mener du{" "}
            <code>127.0.0.1</code> port <code>5000</code> — altså «denne maskinen, prosessen som
            lytter på 5000». <code>localhost</code> er bare et alias for IP-en{" "}
            <code>127.0.0.1</code>.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <AddrCard ip="127.0.0.1" port="5000" what="Flask dev-server" />
            <AddrCard ip="0.0.0.0" port="80" what="HTTP, alle grensesnitt" />
            <AddrCard ip="10.0.0.5" port="443" what="HTTPS, en annen maskin" />
          </div>
        </Section>

        {/* 2. TCP-håndtrykket */}
        <Section
          number={2}
          title="TCP-håndtrykket"
          intro="Før noen bytes kan flyte må klient og server bli enige om at de snakker sammen. Dette skjer med tre meldinger."
        >
          <TcpHandshakeDiagram />
          <p className="text-sm text-muted-foreground mt-3">
            Resultatet er en <em>etablert tilkobling</em> — et virtuelt rør som lever til en av
            sidene sender FIN.
          </p>
        </Section>

        {/* 3. Hva er en socket? */}
        <Section
          number={3}
          title="Hva er en socket?"
          intro="En socket er endepunktet for det røret. Hver side av tilkoblingen har sin egen socket."
        >
          <p className="text-sm">
            Tenk på det som et rør mellom to maskiner. Når håndtrykket er ferdig kan du skrive bytes
            inn på én side og lese dem ut i andre enden — i riktig rekkefølge. På serversiden er det
            faktisk to slags sockets:
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-md border border-border bg-card p-3">
              <strong>Lyttende socket</strong> — én per port. Tar imot nye tilkoblinger.
              Den er ikke koblet til noen klient direkte.
            </li>
            <li className="rounded-md border border-border bg-card p-3">
              <strong>Akseptert socket</strong> — én per klient. Det faktiske røret. Du leser og
              skriver bytes på denne. Når klienten er ferdig lukker du den.
            </li>
          </ul>
        </Section>

        {/* 4. Server-livssyklus */}
        <Section
          number={4}
          title="Server-livssyklus"
          intro="Hver gang en server tar imot en tilkobling går den gjennom denne sekvensen."
        >
          <SocketLifecycle />
          <div className="mt-4 rounded-lg bg-background border border-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Python-pseudokode
              </span>
              <span className="text-[10px] text-muted-foreground">tcp_echo_server.py</span>
            </div>
            <pre className="text-xs sm:text-sm font-mono p-4 overflow-x-auto leading-relaxed">
              {SERVER_PSEUDOCODE}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dette er en server som tar imot én klient om gangen. En ekte HTTP-server (eller Flask)
            håndterer mange parallelt med tråder eller event loops — men sekvensen{" "}
            <code>bind → listen → accept → recv → send → close</code> er den samme.
          </p>
        </Section>

        {/* 5. Stream — viktig */}
        <Section
          number={5}
          title="TCP er en stream — viktig!"
          intro="Dette punktet er der mange snubler."
        >
          <StreamVsMessage />
        </Section>

        {/* 6. Hvorfor for Flask */}
        <Section
          number={6}
          title="Hvorfor dette er viktig for Flask"
          intro="Når du leser «Flask mottar en request», er det dette som faktisk skjer."
        >
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>OS-kjernen ser at en TCP-pakke kommer til port 5000 — der prosessen din lytter.</li>
            <li>
              Kjernen fullfører håndtrykket og legger den nye tilkoblingen i køen til den lyttende
              socket-en.
            </li>
            <li>
              Werkzeug (HTTP-serveren under Flask) kaller <code>accept()</code> og får en socket
              tilbake.
            </li>
            <li>
              Werkzeug kaller <code>recv()</code> i loop til den har lest en hel HTTP-request
              (header-blokk + eventuell body-lengde).
            </li>
            <li>
              Bytene parses til et <code>Request</code>-objekt — metode, sti, headere, body — og
              sendes inn i Flasks routing.
            </li>
            <li>
              Din view-funksjon kjører, returnerer en respons, Werkzeug serialiserer til bytes og
              kaller <code>send()</code>, så <code>close()</code>.
            </li>
          </ol>
          <p className="text-sm mt-4 text-foreground/90">
            «Request-objektet» i Flask er altså et resultat av byte-parsing fra en socket — ikke
            magi. Det er denne reisen vi går dypere inn på i{" "}
            <Link to="/stack/$slug" params={{ slug: "flask-livssyklus" }} className="text-brand hover:underline">
              Flask-livssyklusen
            </Link>
            .
          </p>
        </Section>

        {/* Vil du gå dypere */}
        <div className="mt-10 rounded-xl border border-brand/40 bg-brand/5 p-5">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Vil du gå dypere?
          </div>
          <h3 className="font-semibold text-foreground">Hva skjer egentlig i kjernen?</h3>
          <p className="text-sm text-foreground/85 mt-1">
            Etter eksamen tar vi syscalls, fildeskriptorer, epoll og hvordan kjernen styrer disse
            rørene under panseret.
          </p>
          <Link
            to="/stack/$slug"
            params={{ slug: "trinn-9-syscalls-dyp" }}
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-brand hover:underline"
          >
            Trinn 9 — syscalls (kommer etter eksamen)
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Neste */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/stack" className="text-muted-foreground hover:text-foreground">
            ← Tilbake til oversikten
          </Link>
          <Link
            to="/stack/$slug"
            params={{ slug: "flask-livssyklus" }}
            className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
          >
            Neste: Flask-livssyklus <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  title,
  intro,
  children,
}: {
  number: number;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 scroll-mt-20" id={`del-${number}`}>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-semibold text-brand tabular-nums">Del {number}</span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{intro}</p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function AddrCard({ ip, port, what }: { ip: string; port: string; what: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="font-mono text-[13px]">
        <span className="text-foreground">{ip}</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-brand">{port}</span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{what}</div>
    </div>
  );
}
