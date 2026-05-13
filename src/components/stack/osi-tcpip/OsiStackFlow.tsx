import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";

type Mode = "osi" | "tcpip";

type LayerInfo = {
  id: string;
  num: number;
  osi: string;
  tcpip: string | null;
  pdu: string;
  protocols: string[];
  notes: string;
  examples: string;
};

const LAYERS: LayerInfo[] = [
  {
    id: "physical",
    num: 1,
    osi: "1. Fysisk",
    tcpip: "1. Fysisk",
    pdu: "bits",
    protocols: ["Ethernet PHY", "10BASE-T", "WiFi (radio)", "Fiber/SFP"],
    notes:
      "Hardware-laget. Spenning på kobber, lyspuls i fiber, radiobølger i luft.",
    examples: "RJ-45-port, SFP-modul, antenne",
  },
  {
    id: "link",
    num: 2,
    osi: "2. Lenke (Data Link)",
    tcpip: "2. Lenke",
    pdu: "frames",
    protocols: ["Ethernet", "WiFi (802.11)", "ARP", "PPP"],
    notes:
      "Én hopp på samme nettverk. Adressering via MAC. CRC/FCS for feildeteksjon.",
    examples: "aa:bb:cc:dd:ee:ff (MAC), switch, hub",
  },
  {
    id: "network",
    num: 3,
    osi: "3. Nettverk",
    tcpip: "3. Nettverk",
    pdu: "packets",
    protocols: ["IPv4", "IPv6", "ICMP", "OSPF", "BGP"],
    notes:
      "Ruting mellom nettverk. Forbindelsesløs og best-effort — TCP fikser pålitelighet.",
    examples: "93.184.216.34, traceroute, ping",
  },
  {
    id: "transport",
    num: 4,
    osi: "4. Transport",
    tcpip: "4. Transport",
    pdu: "segments / datagrams",
    protocols: ["TCP", "UDP", "QUIC"],
    notes:
      "Ende-til-ende mellom prosesser via portnummer. TCP = pålitelig, UDP = rå.",
    examples: "Port 80, 443, 53; 3-veis håndtrykk",
  },
  {
    id: "session",
    num: 5,
    osi: "5. Sesjon",
    tcpip: null, // slått sammen
    pdu: "data",
    protocols: ["NetBIOS", "RPC", "Cookies/sessions"],
    notes:
      "Holder kommunikasjons-kontekst mellom to endepunkter. Sjelden eget lag i praksis — slått sammen med 6 og 7 i TCP/IP.",
    examples: "Login-state, session-id i cookie",
  },
  {
    id: "presentation",
    num: 6,
    osi: "6. Presentasjon",
    tcpip: null,
    pdu: "data",
    protocols: ["TLS/SSL", "JSON", "ASN.1", "MIME"],
    notes:
      "Konverterer mellom intern app-representasjon og linje-format. TLS bor formelt her (men sklir mellom 4 og 7).",
    examples: "TLS-handshake, JSON-encoding, UTF-8",
  },
  {
    id: "application",
    num: 7,
    osi: "7. Applikasjon",
    tcpip: "5. Applikasjon",
    pdu: "data",
    protocols: ["HTTP", "HTTPS", "DNS", "SMTP", "SSH", "FTP", "DHCP"],
    notes:
      "Der sluttbrukeren er. Alle protokollene du møter når du programmerer bor her.",
    examples: "GET /index.html, dig example.com",
  },
];

type LayerNodeData = {
  label: string;
  num: number;
  pdu: string;
  selected: boolean;
  merged: boolean;
};

function LayerNode({ data }: NodeProps<Node<LayerNodeData>>) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-sm transition-colors ${
        data.selected
          ? "border-brand bg-brand/10 text-foreground"
          : "border-border bg-card text-foreground hover:border-brand/40"
      } ${data.merged ? "ring-1 ring-brand/30" : ""}`}
      style={{ width: 260 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Lag {data.num}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {data.pdu}
        </span>
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = { layer: LayerNode };

export function OsiStackFlow() {
  const [mode, setMode] = useState<Mode>("osi");
  const [selectedId, setSelectedId] = useState<string>("application");

  const visibleLayers = useMemo(() => {
    if (mode === "osi") return LAYERS;
    // TCP/IP: kombiner sesjon + presentasjon inn i applikasjon
    return LAYERS.filter(
      (l) => l.id !== "session" && l.id !== "presentation"
    );
  }, [mode]);

  const nodes = useMemo<Node<LayerNodeData>[]>(() => {
    return visibleLayers
      .slice()
      .reverse() // Topp = applikasjon (lag 7), bunn = fysisk (lag 1)
      .map((l, idx) => ({
        id: l.id,
        type: "layer",
        position: { x: 0, y: idx * 92 },
        data: {
          label: mode === "osi" ? l.osi : l.tcpip ?? l.osi,
          num: l.num,
          pdu: l.pdu,
          selected: l.id === selectedId,
          merged:
            mode === "tcpip" &&
            l.id === "application" /* slått sammen 5/6/7 */,
        },
      }));
  }, [visibleLayers, selectedId, mode]);

  const edges = useMemo<Edge[]>(() => {
    const ordered = visibleLayers
      .slice()
      .sort((a, b) => b.num - a.num);
    const result: Edge[] = [];
    for (let i = 0; i < ordered.length - 1; i++) {
      const from = ordered[i].id;
      const to = ordered[i + 1].id;
      result.push({
        id: `${from}-down-${to}`,
        source: from,
        target: to,
        animated: true,
        label: "encap ↓",
        labelStyle: { fontSize: 10, fill: "var(--color-brand, #f97316)" },
        style: { stroke: "var(--color-brand, #f97316)", strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--color-brand, #f97316)",
        },
      });
    }
    return result;
  }, [visibleLayers]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const selected = LAYERS.find((l) => l.id === selectedId) ?? LAYERS[6];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Interaktiv stakk
        </div>
        <div
          role="tablist"
          aria-label="OSI vs TCP/IP"
          className="inline-flex rounded-md border border-border bg-background p-0.5 text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "osi"}
            onClick={() => setMode("osi")}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              mode === "osi"
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            OSI (7 lag)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "tcpip"}
            onClick={() => setMode("tcpip")}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              mode === "tcpip"
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            TCP/IP (5 lag)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="h-[520px] bg-background" style={{ touchAction: "none" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            zoomOnScroll
            panOnDrag
          >
            <Background gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              maskColor="rgba(0,0,0,0.1)"
              style={{
                background: "var(--color-card)",
              }}
            />
          </ReactFlow>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Lag {selected.num} · PDU: {selected.pdu}
          </div>
          <h3 className="mt-1 text-base font-semibold leading-tight">
            {mode === "osi" ? selected.osi : selected.tcpip ?? selected.osi}
          </h3>
          <p className="mt-2 text-muted-foreground text-[13px] leading-relaxed">
            {selected.notes}
          </p>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Protokoller
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selected.protocols.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Eksempel
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {selected.examples}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Klikk på et lag i diagrammet for detaljer. Animasjonen viser{" "}
            <em>encapsulation</em> nedover stakken på sender.
          </p>
        </aside>
      </div>
    </div>
  );
}
