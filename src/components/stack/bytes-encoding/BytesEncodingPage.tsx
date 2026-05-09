import { StackPageShell } from "@/components/stack/StackPageShell";
import { Prerequisites } from "@/components/stack/Prerequisites";
import { Badge } from "@/components/ui/badge";
import { BitsToByte } from "./BitsToByte";
import { AsciiTable } from "./AsciiTable";
import { EncodingConverter } from "./EncodingConverter";

export function BytesEncodingPage() {
  return (
    <StackPageShell title="Bytes & encoding" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="secondary" className="text-[10px]">Grunnmur</Badge>
            <Badge variant="secondary" className="text-[10px]">UTF-8</Badge>
            <Badge variant="secondary" className="text-[10px]">ASCII</Badge>
            <Badge variant="secondary" className="text-[10px]">str vs bytes</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Bytes &amp; encoding
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En byte er bare et tall mellom 0 og 255. Tegn — som{" "}
            <code className="font-mono">'A'</code>,{" "}
            <code className="font-mono">'ø'</code> og{" "}
            <code className="font-mono">'🇳🇴'</code> — finnes ikke i datamaskinen
            før vi har blitt enige om hvordan de skal kodes som bytes. Det vi
            har blitt enige om, heter UTF-8.
          </p>
        </header>

        <Prerequisites items={[]} />

        {/* 1. HVA ER EN BYTE */}
        <Section
          number="1"
          title="Hva er en byte?"
          lede="Åtte bits. Hver bit er 0 eller 1. Til sammen et tall fra 0 til 255 — ingenting mer."
        >
          <BitsToByte />
        </Section>

        {/* 2. ASCII */}
        <Section
          number="2"
          title="ASCII — én byte per tegn"
          lede="Den eldste avtalen om tegn → tall. Bruker bare 7 bits, så bare 128 tegn passer. Engelsk fungerer. Norsk gjør det ikke."
        >
          <AsciiTable />
        </Section>

        {/* 3. UTF-8 */}
        <Section
          number="3"
          title="UTF-8 — flere bytes for ikke-engelske tegn"
          lede="UTF-8 utvider ASCII: ASCII-tegn er fortsatt én byte, men alt annet bruker 2, 3 eller 4 bytes per tegn."
        >
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-sm leading-relaxed">
            <p>
              Alle ASCII-tegn (0–127) ser ut nøyaktig likt i UTF-8 — én byte
              hver. Men så snart du skriver en{" "}
              <code className="font-mono">ø</code>, en{" "}
              <code className="font-mono">é</code> eller en emoji, trenger
              UTF-8 flere bytes for det ene tegnet:
            </p>

            <ul className="space-y-2 font-mono text-xs sm:text-sm">
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="inline-block min-w-[2.5rem] text-base font-bold">
                  ø
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-brand">0xC3 0xB8</span>
                <span className="text-muted-foreground">(2 bytes)</span>
              </li>
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="inline-block min-w-[2.5rem] text-base font-bold">
                  å
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-brand">0xC3 0xA5</span>
                <span className="text-muted-foreground">(2 bytes)</span>
              </li>
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="inline-block min-w-[2.5rem] text-base font-bold">
                  é
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-brand">0xC3 0xA9</span>
                <span className="text-muted-foreground">(2 bytes)</span>
              </li>
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="inline-block min-w-[2.5rem] text-base font-bold">
                  漢
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-brand">0xE6 0xBC 0xA2</span>
                <span className="text-muted-foreground">(3 bytes)</span>
              </li>
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="inline-block min-w-[2.5rem] text-base font-bold">
                  🚀
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-brand">0xF0 0x9F 0x9A 0x80</span>
                <span className="text-muted-foreground">(4 bytes)</span>
              </li>
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="inline-block min-w-[2.5rem] text-base font-bold">
                  🇳🇴
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-brand">8 bytes</span>
                <span className="text-muted-foreground">
                  (et flagg er to kodepunkter — N + O som regional indicators)
                </span>
              </li>
            </ul>

            <p className="text-muted-foreground">
              Poenget er ikke å pugge bit-mønstrene. Poenget er at{" "}
              <strong className="text-foreground">
                ett tegn ≠ én byte i UTF-8
              </strong>
              . Det vil bite deg i Python når du regner med at{" "}
              <code className="font-mono">len(s)</code> er det samme som
              antall bytes — det er det ikke.
            </p>
          </div>
        </Section>

        {/* 4. KONVERTER */}
        <Section
          number="4"
          title="Prøv selv: tekst ↔ bytes"
          lede="Skriv tekst og se UTF-8-bytene. Eller lim inn hex-bytes og se hvilken tekst de blir til."
        >
          <EncodingConverter />
        </Section>

        {/* 5. STR VS BYTES I PYTHON */}
        <Section
          number="5"
          title="str vs bytes i Python"
          lede="Python skiller hardt mellom tekst (str) og rå bytes (bytes). Det er ikke det samme — selv om de ser likt ut når du printer dem."
        >
          <div className="space-y-4">
            <CodeBlock
              caption="To forskjellige typer."
              code={`s = "hello"          # str — en sekvens av tegn
b = b"hello"         # bytes — en sekvens av tall 0–255

type(s)              # <class 'str'>
type(b)              # <class 'bytes'>

s == b               # False — ulike typer kan ikke sammenlignes likt
b[0]                 # 104  ← du får et tall, ikke 'h'`}
            />

            <CodeBlock
              caption="Lengden er antall TEGN for str, antall BYTES for bytes."
              code={`len("ø")                       # 1   ← ett tegn
len("ø".encode("utf-8"))       # 2   ← to bytes (0xc3 0xb8)

len("hei 🚀")                  # 5   ← fem tegn
len("hei 🚀".encode("utf-8"))  # 8   ← åtte bytes (rakett alene = 4)`}
            />

            <CodeBlock
              caption="Konvertering mellom dem skjer alltid med en encoding (nesten alltid UTF-8)."
              code={`# str → bytes
"blåbær".encode("utf-8")
# b'bl\\xc3\\xa5b\\xc3\\xa6r'

# bytes → str
b"bl\\xc3\\xa5b\\xc3\\xa6r".decode("utf-8")
# 'blåbær'

# Glemmer du encoding? Python forsøker å hjelpe, men feiler hardt
# på rare bytes. Skriv "utf-8" eksplisitt — alltid.`}
            />

            <CodeBlock
              caption="Hvorfor det betyr noe: HTTP er bytes, ikke tekst."
              code={`# Det som faktisk sendes på nettverkskabelen:
request = b"GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n"

# Sockets, filer åpnet i binær modus, og HTTP-bibliotek
# leverer bytes. Du må selv bestemme: "skal jeg dekode dette
# som UTF-8 for å få en str jeg kan jobbe med?"

import socket
sock = socket.socket()
sock.send(request)              # bytes inn
data = sock.recv(4096)          # bytes ut
text = data.decode("utf-8")     # nå er det en str`}
            />
          </div>
        </Section>

        {/* 6. HVORFOR DETTE BETYR NOE */}
        <Section
          number="6"
          title="Hvorfor dette er viktig for web"
          lede="Alt som krysser nettverket er bytes. Alt som leses fra disk er bytes. Tekst eksisterer bare inne i programmet — på begge sider av kabelen står det noen som må kode og dekode."
        >
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm leading-relaxed">
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>HTTP-request-bodies er bytes.</strong> Når en bruker
                sender skjema med <code className="font-mono">æøå</code>,
                kommer det inn som en byte-strøm. Flask gir deg det rå via{" "}
                <code className="font-mono">request.data</code> (bytes) og
                ferdig dekodet via <code className="font-mono">
                  request.form
                </code>{" "}
                (str — Flask har gjort{" "}
                <code className="font-mono">.decode("utf-8")</code> for deg).
              </li>
              <li>
                <strong>Templates rendrer til bytes.</strong> Jinja gir deg en
                str, men Flask koder den til UTF-8 og sender bytes ut på
                socketen.
              </li>
              <li>
                <strong>
                  Feil encoding = <code className="font-mono">UnicodeDecodeError</code>{" "}
                  eller mojibake.
                </strong>{" "}
                Du har sett{" "}
                <code className="font-mono">blÃ¥bÃ¦r</code> i stedet for{" "}
                <code className="font-mono">blåbær</code>? Det er UTF-8-bytes
                tolket som om de var Latin-1.
              </li>
            </ul>
            <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
              <strong className="text-brand">Neste steg:</strong> i{" "}
              <em>HTTP-anatomi</em> ser du nøyaktig hva en HTTP-request er:
              en strøm av bytes med en bestemt struktur. Og i{" "}
              <em>Flask-livssyklus</em> ser du hvordan Flask plukker bytene fra
              socketen, parser dem, og leverer dem til funksjonen din.
            </div>
          </div>
        </Section>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  title,
  lede,
  children,
}: {
  number: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground text-[10px]">
            {number}
          </span>
          Trinn {number}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {lede}
        </p>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ caption, code }: { caption?: string; code: string }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {caption && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          {caption}
        </div>
      )}
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
