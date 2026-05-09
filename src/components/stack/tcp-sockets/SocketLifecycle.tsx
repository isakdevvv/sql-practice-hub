import { useState } from "react";

interface Stage {
  key: string;
  label: string;
  pyCall: string;
  what: string;
  why: string;
}

const STAGES: Stage[] = [
  {
    key: "bind",
    label: "bind",
    pyCall: 'sock.bind(("0.0.0.0", 5000))',
    what: "Reserverer en port på maskinen din.",
    why: "OS-en vet nå: «alle pakker som kommer til port 5000 skal til denne prosessen». 0.0.0.0 betyr 'alle nettverksgrensesnitt'.",
  },
  {
    key: "listen",
    label: "listen",
    pyCall: "sock.listen()",
    what: "Sier til OS at sockens skal ta imot innkommende tilkoblinger.",
    why: "Før dette kallet er sockens 'død' — etter er den en lyttende socket. OS lager en kø for ventende klienter.",
  },
  {
    key: "accept",
    label: "accept",
    pyCall: "client, addr = sock.accept()",
    what: "Blokkerer til en klient kobler til. Returnerer en NY socket.",
    why: "Den lyttende socket-en fortsetter å lytte. Den nye 'client'-socket-en er røret til akkurat denne ene klienten.",
  },
  {
    key: "recv",
    label: "recv",
    pyCall: "data = client.recv(4096)",
    what: "Leser opptil 4096 bytes fra klienten.",
    why: "Returnerer bytes — ikke string. Du kan få mindre enn 4096; du kan få 0 (klient lukket); du må kanskje kalle flere ganger for å få hele meldingen.",
  },
  {
    key: "send",
    label: "send",
    pyCall: 'client.send(b"HTTP/1.1 200 OK\\r\\n\\r\\nHello")',
    what: "Skriver bytes tilbake til klienten.",
    why: "Også her: bytes, ikke string. b-prefikset er bytes-literal. \\r\\n\\r\\n er tom linje som skiller HTTP-headere fra body.",
  },
  {
    key: "close",
    label: "close",
    pyCall: "client.close()",
    what: "Lukker tilkoblingen til denne klienten.",
    why: "Sender FIN. Den lyttende socket-en lever videre — vi går tilbake til accept() og venter på neste klient.",
  },
];

export function SocketLifecycle() {
  const [active, setActive] = useState<string>("bind");
  const stage = STAGES.find((s) => s.key === active) ?? STAGES[0];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-1">Server-livssyklus</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Klikk en node for å se hva hvert kall faktisk gjør.
      </p>

      {/* Flyt-diagram */}
      <div className="rounded-lg bg-background border border-border p-4 mb-4 overflow-x-auto">
        <div className="flex items-center justify-between gap-1 min-w-[560px]">
          {STAGES.map((s, i) => {
            const isActive = s.key === active;
            const isLoopBack = s.key === "close";
            return (
              <div key={s.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={`relative px-3 py-2 rounded-md border text-sm font-mono transition-colors ${
                    isActive
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-card hover:border-brand/40 hover:bg-brand/5"
                  }`}
                >
                  {s.label}
                </button>
                {i < STAGES.length - 1 && (
                  <span className="mx-1 text-muted-foreground" aria-hidden>
                    →
                  </span>
                )}
                {isLoopBack && (
                  <span className="ml-1 text-[10px] text-muted-foreground italic" aria-hidden>
                    ↺ accept
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalj for valgt steg */}
      <div className="rounded-md border border-border bg-background p-4 space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Python-kall
          </div>
          <code className="block text-xs sm:text-sm font-mono bg-muted/40 rounded px-2 py-1.5 text-foreground">
            {stage.pyCall}
          </code>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Hva skjer
          </div>
          <p className="text-sm text-foreground/90">{stage.what}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Hvorfor det er sånn
          </div>
          <p className="text-sm text-foreground/80">{stage.why}</p>
        </div>
      </div>
    </div>
  );
}
