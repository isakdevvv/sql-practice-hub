import { useState } from "react";

type Stage = {
  id: string;
  label: string;
  short: string;
  detail: string;
  layer: "client" | "network" | "server" | "framework" | "app";
};

const STAGES: Stage[] = [
  {
    id: "browser",
    label: "Browser",
    short: "Brukeren trykker enter på en URL.",
    detail:
      "Browseren bygger en HTTP-melding (tekst-bytes med metode, sti, headere og evt. body) og må først finne en TCP-forbindelse å sende den over.",
    layer: "client",
  },
  {
    id: "dns",
    label: "DNS-oppslag",
    short: "Domenenavn → IP-adresse.",
    detail:
      "Browseren spør operativsystemet, som spør DNS-resolveren: «hva er IP-en til example.no?». Svar: f.eks. 93.184.216.34. Først nå kan TCP starte.",
    layer: "network",
  },
  {
    id: "tcp",
    label: "TCP-socket",
    short: "Treveis håndhilsen, så en åpen kanal.",
    detail:
      "Browseren åpner en TCP-socket mot (IP, port 80/443). SYN → SYN-ACK → ACK. Etterpå kan begge sider sende strøm av bytes frem og tilbake.",
    layer: "network",
  },
  {
    id: "kernel",
    label: "Kernel",
    short: "OS leverer bytes til riktig prosess.",
    detail:
      "Operativsystemet vet at port 5000 (eller 80) tilhører Flask-prosessen din, og legger HTTP-bytes inn i socket-buffer som prosessen leser fra.",
    layer: "network",
  },
  {
    id: "werkzeug",
    label: "Werkzeug (WSGI-server)",
    short: "Parser HTTP, bygger environ.",
    detail:
      "Werkzeug er bare en Python-prosess som kaller socket.accept() i loop. Den leser rå HTTP-bytes, parser dem til en environ-dict, og kaller Flask-applikasjonen.",
    layer: "server",
  },
  {
    id: "environ",
    label: "WSGI environ",
    short: "Dict med alt om requesten.",
    detail:
      "REQUEST_METHOD, PATH_INFO, QUERY_STRING, HTTP_HOST, CONTENT_TYPE, wsgi.input (en file-like for body). Dette er kontrakten mellom server og rammeverk.",
    layer: "server",
  },
  {
    id: "flask",
    label: "Flask app",
    short: "WSGI-applikasjonen __call__(environ, start_response).",
    detail:
      "Flask er bare et callable. Den pakker environ inn i et Request-objekt, kjører before_request-hooks, ruter til riktig view-funksjon og bygger en Response.",
    layer: "framework",
  },
  {
    id: "before",
    label: "before_request",
    short: "Hooks som kjører først.",
    detail:
      "F.eks. å hente innlogget bruker fra session, åpne en DB-tilkobling, sjekke CSRF-token. Returnerer du en Response her, hopper Flask over view-funksjonen.",
    layer: "framework",
  },
  {
    id: "routing",
    label: "Routing",
    short: "PATH_INFO → view-funksjon.",
    detail:
      "url_map matcher /users/42 mot regelen /users/<int:id>, finner endpoint='show_user' og kaller show_user(id=42).",
    layer: "framework",
  },
  {
    id: "view",
    label: "View-funksjon",
    short: "Din @app.route-funksjon.",
    detail:
      "Her bruker du request.form, kjører DB-spørringer, render_template(...). Du returnerer en streng, en tuple, eller et Response-objekt.",
    layer: "app",
  },
  {
    id: "response",
    label: "Response",
    short: "Statuslinje, headere, body.",
    detail:
      "Flask normaliserer det du returnerte til et Response. Den koder body til UTF-8 bytes, setter Content-Length, Content-Type, Set-Cookie osv.",
    layer: "framework",
  },
  {
    id: "back",
    label: "Bytes til browser",
    short: "Werkzeug skriver til socket. Browseren parser.",
    detail:
      "HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\n\\r\\n<html>...</html> går tilbake samme TCP-socket. Browseren parser bytes til DOM.",
    layer: "client",
  },
];

const LAYER_COLOR: Record<Stage["layer"], string> = {
  client: "fill-blue-500/15 stroke-blue-500",
  network: "fill-purple-500/15 stroke-purple-500",
  server: "fill-amber-500/15 stroke-amber-500",
  framework: "fill-emerald-500/15 stroke-emerald-500",
  app: "fill-pink-500/15 stroke-pink-500",
};

const LAYER_LABEL: Record<Stage["layer"], string> = {
  client: "Klient",
  network: "Nettverk / OS",
  server: "WSGI-server",
  framework: "Flask-rammeverk",
  app: "Din kode",
};

export function LifecycleDiagram() {
  const [selected, setSelected] = useState<string>("werkzeug");
  const stage = STAGES.find((s) => s.id === selected)!;

  // Layout: 4 columns × 3 rows.
  const cols = 4;
  const cellW = 170;
  const cellH = 64;
  const gap = 14;
  const padX = 16;
  const padY = 16;

  const positions = STAGES.map((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      ...s,
      x: padX + col * (cellW + gap),
      y: padY + row * (cellH + gap),
    };
  });

  const width = padX * 2 + cols * cellW + (cols - 1) * gap;
  const rows = Math.ceil(STAGES.length / cols);
  const height = padY * 2 + rows * cellH + (rows - 1) * gap;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[640px]"
          role="img"
          aria-label="Flask request-livssyklus diagram"
        >
          {/* Connector arrows between stages in reading order */}
          {positions.slice(0, -1).map((p, i) => {
            const next = positions[i + 1];
            const sameRow = p.y === next.y;
            const x1 = p.x + cellW;
            const y1 = p.y + cellH / 2;
            const x2 = next.x;
            const y2 = next.y + cellH / 2;
            if (sameRow) {
              return (
                <line
                  key={`a-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2 - 4}
                  y2={y2}
                  className="stroke-muted-foreground/40"
                  strokeWidth={1.2}
                  markerEnd="url(#arrow)"
                />
              );
            }
            // Wrap line: down from end of row, then back to start of next row.
            const downX = p.x + cellW + gap / 2;
            const downY1 = p.y + cellH / 2;
            const downY2 = next.y + cellH / 2;
            const backX = next.x;
            return (
              <g key={`a-${i}`} className="stroke-muted-foreground/40" fill="none" strokeWidth={1.2}>
                <line x1={x1} y1={y1} x2={downX} y2={downY1} />
                <line x1={downX} y1={downY1} x2={downX} y2={downY2} />
                <line x1={downX} y1={downY2} x2={backX - 4} y2={downY2} markerEnd="url(#arrow)" />
              </g>
            );
          })}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground/60" />
            </marker>
          </defs>

          {positions.map((p) => {
            const isSel = p.id === selected;
            return (
              <g
                key={p.id}
                onClick={() => setSelected(p.id)}
                className="cursor-pointer"
                role="button"
                aria-label={p.label}
              >
                <rect
                  x={p.x}
                  y={p.y}
                  width={cellW}
                  height={cellH}
                  rx={8}
                  className={`${LAYER_COLOR[p.layer]} ${
                    isSel ? "stroke-[2.5]" : "stroke-[1]"
                  } transition-all`}
                />
                <text
                  x={p.x + cellW / 2}
                  y={p.y + 26}
                  textAnchor="middle"
                  className="fill-foreground text-[12px] font-semibold"
                >
                  {p.label}
                </text>
                <text
                  x={p.x + cellW / 2}
                  y={p.y + 44}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {p.short.length > 32 ? p.short.slice(0, 30) + "…" : p.short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        {(["client", "network", "server", "framework", "app"] as const).map((l) => (
          <span key={l} className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-sm ${LAYER_COLOR[l]
                .replace("fill-", "bg-")
                .replace("stroke-", "ring-1 ring-")}`}
            />
            {LAYER_LABEL[l]}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          {stage.label} · {LAYER_LABEL[stage.layer]}
        </div>
        <div className="mt-1 text-sm font-medium">{stage.short}</div>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{stage.detail}</p>
      </div>
    </div>
  );
}
