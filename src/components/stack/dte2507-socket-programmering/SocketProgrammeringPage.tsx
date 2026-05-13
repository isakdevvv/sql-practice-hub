import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva en socket er", anchor: "intro" },
  { title: "TCP-server-skjelett", anchor: "tcp-server" },
  { title: "TCP-klient-skjelett", anchor: "tcp-klient" },
  { title: "UDP — sendto / recvfrom", anchor: "udp" },
  { title: "Concurrent server — threading", anchor: "threading" },
  { title: "select og asyncio", anchor: "async" },
  { title: "SSL / TLS-wrapping", anchor: "tls" },
  { title: "Vanlige feil og fallgruver", anchor: "feil" },
  { title: "Praksis — kjorbare oppgaver", anchor: "praksis" },
];

export function SocketProgrammeringPage() {
  return (
    <StackPageShell title="Socket-programmering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Praksis
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Socket-programmering — TCP og UDP i Python
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sockets er det Python-API-et OS-en gir deg til a snakke pa nettet. Naar du har
            forstatt en TCP-server-loop pa fem linjer, er HTTP, SMTP og SSH bare
            «hva du sender etterpa». Pensum krever at du kan skrive bade server og
            klient — bade TCP og UDP — og forsta hvordan TLS legges oppa.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Pyodide-merk:</span> Nettleseren har
              ikke ekte sockets — vi bruker en{" "}
              <strong>socket-shim</strong> som simulerer TCP/UDP in-memory.
              Kjor oppgavene under <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              med topic «Sockets».
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2507-socket-programmering" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva en socket er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En socket er en file descriptor som OS gir deg for a sende og motta
            bytes over et nettverk. Du trenger fire ting for a apne en:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`socket.socket(family, type)

family =
  AF_INET   — IPv4
  AF_INET6  — IPv6
  AF_UNIX   — lokale (samme maskin)
type =
  SOCK_STREAM — TCP (palitelig, tilkoblet)
  SOCK_DGRAM  — UDP (best-effort, tilkoblings-los)

En socket adresseres med (host, port) — port = hvilken tjeneste pa
maskinen. Veldig brukte:
  20, 21 FTP   22 SSH    25 SMTP   53 DNS
  80 HTTP      143 IMAP  443 HTTPS 5432 Postgres`}</pre>
          </div>
        </section>

        <section id="tcp-server" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. TCP-server-skjelett</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Server-loop-en har alltid samme fem skritt: socket → bind → listen
            → accept → recv/send. Kjor det utenat.
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`import socket

HOST = "0.0.0.0"   # alle interfaces
PORT = 8080

# 1. Lag en lyttende socket
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # tillat raskt restart

# 2. Bind til adressen
srv.bind((HOST, PORT))

# 3. Begynn aa lytte (kø-størrelse 5)
srv.listen(5)
print(f"Lytter pa {HOST}:{PORT}")

while True:
    # 4. Aksepter — blokkerer til en klient kobler til.
    #    Returnerer (klient-socket, klient-adresse).
    conn, addr = srv.accept()
    print(f"Tilkobling fra {addr}")

    # 5. Snakk med klienten.
    data = conn.recv(4096)         # bytes, ikke str
    print("Mottok:", data)
    conn.sendall(b"Echo: " + data)
    conn.close()                   # graceful FIN`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Viktig:</strong> <code>recv(n)</code> garanterer ikke at du faar
            <em> n</em> bytes — bare opptil n. TCP er en byte-strøm, ikke
            meldinger. For ekte protokoller maa du selv definere
            «meldings-grense» (lengde-prefiks eller newline-terminert).
          </p>
        </section>

        <section id="tcp-klient" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. TCP-klient-skjelett</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klient-koden er enklere: socket → connect → send/recv → close.
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`import socket

c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c.connect(("example.com", 80))

c.sendall(b"GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n")

# Les hele responsen — server lukker etter Connection: close.
chunks = []
while True:
    chunk = c.recv(4096)
    if not chunk:
        break
    chunks.append(chunk)
response = b"".join(chunks)
c.close()

print(response.decode("utf-8", errors="replace"))`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Dette ER en HTTP-klient — uten <code>requests</code>-biblioteket. Bra
            øvelse for a forsta hva «høyere-nivå»-bibliotek faktisk gjor: skrive
            riktige headers, lese byte-strøm, parse statuslinjen.
          </p>
        </section>

        <section id="udp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. UDP — sendto / recvfrom</h2>
          <p className="text-sm text-muted-foreground mb-4">
            UDP har ingen tilkobling — hver pakke er selvstendig. Ikke{" "}
            <code>accept()</code>, ikke <code>connect()</code> (kan brukes, men
            er bare optimering). I stedet: <code>sendto(data, addr)</code> og{" "}
            <code>recvfrom(n)</code> som ogsa returnerer avsender-adresse.
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`# === SERVER ===
import socket, time

srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
srv.bind(("0.0.0.0", 1234))

while True:
    data, addr = srv.recvfrom(1024)
    print(f"Fra {addr}: {data}")
    now = str(int(time.time())).encode()
    srv.sendto(now, addr)

# === KLIENT ===
c = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
c.sendto(b"TID?", ("server", 1234))
data, _ = c.recvfrom(1024)
print("Server-tid:", data)`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Bruk UDP for DNS, NTP, videostreaming — det vil si naar lite-overhead
            og lav latens er viktigere enn at hver pakke kommer fram.
          </p>
        </section>

        <section id="threading" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Concurrent server — threading</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En naiv server bare aksepterer ÉN klient om gangen. Vil du betjene
            flere parallelt, mater du hver tilkobling i en egen trad:
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`import socket, threading

def handle(conn, addr):
    with conn:
        while True:
            data = conn.recv(4096)
            if not data:
                break
            conn.sendall(b"echo " + data)

srv = socket.socket()
srv.bind(("", 8080))
srv.listen()

while True:
    conn, addr = srv.accept()
    t = threading.Thread(target=handle, args=(conn, addr), daemon=True)
    t.start()`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Trade-off:</strong> en trad per tilkobling skalerer ikke til
            10000 samtidige klienter (RAM, kontekst-bytte). Da bruker man heller{" "}
            <code>select()</code> / <code>epoll</code> / asyncio — alle hander
            mange sockets pa én trad.
          </p>
        </section>

        <section id="async" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. select og asyncio</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>select()</code> tar en liste sockets og forteller deg hvilke
            som er klare for I/O — så du slipper aa blokkere paa én av dem mens
            de andre venter.
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`import socket, select

srv = socket.socket()
srv.bind(("", 8080))
srv.listen()
srv.setblocking(False)

sockets = [srv]
while True:
    readable, _, _ = select.select(sockets, [], [], 1.0)
    for s in readable:
        if s is srv:
            conn, addr = s.accept()
            conn.setblocking(False)
            sockets.append(conn)
        else:
            data = s.recv(4096)
            if not data:
                sockets.remove(s); s.close()
            else:
                s.sendall(b"echo " + data)`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            asyncio er moderne abstraksjon over det samme:
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`import asyncio

async def handle(reader, writer):
    data = await reader.read(4096)
    writer.write(b"echo " + data)
    await writer.drain()
    writer.close()

async def main():
    srv = await asyncio.start_server(handle, "", 8080)
    async with srv:
        await srv.serve_forever()

asyncio.run(main())`}</pre>
        </section>

        <section id="tls" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. SSL / TLS-wrapping</h2>
          <p className="text-sm text-muted-foreground mb-4">
            TLS legges OPPÅ en TCP-socket. Python-modulen <code>ssl</code> tar
            en raw socket og returnerer en wrapped variant som kjorer
            haandtrykk automatisk i forste lese/skrive.
          </p>
          <pre className="rounded-xl border border-border bg-card p-5 font-mono text-xs overflow-x-auto whitespace-pre">{`import socket, ssl

# === KLIENT — koble til HTTPS-server ===
ctx = ssl.create_default_context()       # bruker systemets CA-bunt
ctx.check_hostname = True
ctx.verify_mode = ssl.CERT_REQUIRED

raw = socket.create_connection(("example.com", 443))
tls = ctx.wrap_socket(raw, server_hostname="example.com")  # SNI

tls.sendall(b"GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n")
print(tls.recv(4096))
tls.close()

# === SERVER — ha sertifikat + private key klar ===
srv_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
srv_ctx.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

raw = socket.socket()
raw.bind(("", 8443))
raw.listen()

while True:
    conn, addr = raw.accept()
    with srv_ctx.wrap_socket(conn, server_side=True) as tls:
        # her er trafikken kryptert
        tls.sendall(b"hello\\n")`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Hva sertifikatvalidering faktisk gjor:</strong>{" "}
            <code>check_hostname=True</code> verifiserer at sertifikatets CN/SAN
            matcher server-navnet du forventet.{" "}
            <code>verify_mode=CERT_REQUIRED</code> bygger en signatur-kjede fra
            sertifikatet opp til en betrodd Root CA i systemets trust store.
          </p>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Vanlige feil og fallgruver</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <h3 className="font-semibold mb-1">«Address already in use»</h3>
              <p className="text-muted-foreground">
                Forrige server-prosess satt sin TCP-tilkobling i{" "}
                <code>TIME_WAIT</code>-state (60-120 sek). Fiks:{" "}
                <code>setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)</code> for restart.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <h3 className="font-semibold mb-1">ConnectionResetError</h3>
              <p className="text-muted-foreground">
                Den andre siden sendte RST — typisk fordi vi prøver a skrive
                etter at de stengte med <code>close()</code>. Sjekk om
                ditt protokoll-design forutsetter at andre siden venter pa{" "}
                <code>shutdown(SHUT_WR)</code>.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <h3 className="font-semibold mb-1">«Min recv ga bare halvparten»</h3>
              <p className="text-muted-foreground">
                TCP er byte-strøm. <code>recv(4096)</code> kan returnere 1 byte
                eller 4096. Loop til du har all data — bruk lengde-prefiks eller
                en avgrenser.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <h3 className="font-semibold mb-1">«Send funket men ingen mottok»</h3>
              <p className="text-muted-foreground">
                <code>send()</code> kan ogsa være kort — bruk{" "}
                <code>sendall()</code> som looper. Eller sjekk om brannmuren
                stenger porten (se neste leksjon).
              </p>
            </div>
          </div>
        </section>

        <section id="praksis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Praksis — kjorbare oppgaver</h2>
          <p className="text-sm text-muted-foreground mb-4">
            15 oppgaver under <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
            med topic «Sockets» — alt fra echo-server til HTTP-klient via raw
            sockets, til TLS-handshake-skritt og crypto-primitiver.
          </p>
          <Link
            to="/python"
            className="inline-flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/15 transition-colors"
          >
            Apne socket-oppgaver →
          </Link>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm mt-10">
          <h2 className="font-semibold mb-2">Etter dette skal du kunne</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Skrive en TCP-server-loop pa 6 linjer fra hukommelsen.</li>
            <li>Forklare forskjellen mellom <code>recv</code> og <code>recvfrom</code>.</li>
            <li>Si hvorfor sendall finnes naar send finnes.</li>
            <li>Forklare hva <code>ssl.wrap_socket</code> faktisk gjor pa en eksisterende TCP-socket.</li>
            <li>Identifisere TIME_WAIT-årsak naar Address already in use dukker opp.</li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2507" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2507-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
