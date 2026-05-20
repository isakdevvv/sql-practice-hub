import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Server, Home, Globe } from "lucide-react";

// MobilitetsTracer — fullskala interaktiv for 7.4.
// En pakke reiser fra en "Correspondent" (f.eks. Teams-server) til en mobil
// host som befinner seg på et fremmed nett. Bruker kan flytte hosten mellom
// hjem-nett og to fremmed-nett, og toggle indirekt (via HA) vs direkte
// (route-optimization) ruting.
//
// Pedagogisk hovedpoeng:
//   - hjem-IP står stille selv om hosten flytter seg
//   - HA pakker inn pakker med ny ytre IP = COA (tunneling)
//   - direkte ruting fjerner triangelet, men krever at korrespondenten kjenner COA

type Network = "home" | "fA" | "fB";

const NET_LABEL: Record<Network, string> = {
  home: "Hjem-nett (10.0.0.0/24)",
  fA: "Foreign A (192.168.5.0/24)",
  fB: "Foreign B (192.168.9.0/24)",
};

const COA: Record<Network, string> = {
  home: "10.0.0.15",
  fA: "192.168.5.42",
  fB: "192.168.9.77",
};

const HOME_IP = "10.0.0.15";

type NodePos = { x: number; y: number };

const NODES: Record<string, NodePos & { label: string; sub?: string }> = {
  correspondent: { x: 60, y: 60, label: "Korrespondent", sub: "vg.no · 195.88.55.16" },
  internet: { x: 280, y: 60, label: "Internett" },
  ha: { x: 280, y: 200, label: "Home Agent", sub: "10.0.0.1" },
  fa_a: { x: 480, y: 60, label: "Foreign Agent A", sub: "192.168.5.1" },
  fa_b: { x: 480, y: 340, label: "Foreign Agent B", sub: "192.168.9.1" },
  home_host: { x: 280, y: 340, label: "Mobile host @ hjem", sub: HOME_IP },
  fA_host: { x: 660, y: 60, label: "Mobile host @ A", sub: HOME_IP },
  fB_host: { x: 660, y: 340, label: "Mobile host @ B", sub: HOME_IP },
};

type Mode = "indirect" | "direct";

export function MobilitetsTracer() {
  const [location, setLocation] = useState<Network>("fA");
  const [mode, setMode] = useState<Mode>("indirect");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 langs valgt path
  const rafRef = useRef<number | null>(null);

  const hostKey = location === "home" ? "home_host" : location === "fA" ? "fA_host" : "fB_host";

  // Bygg path: list av node-IDer som pakken hopper gjennom
  const path = (() => {
    if (location === "home") return ["correspondent", "internet", "ha", "home_host"];
    if (mode === "indirect") {
      return [
        "correspondent",
        "internet",
        "ha",
        location === "fA" ? "fa_a" : "fa_b",
        hostKey,
      ];
    }
    // direct
    return ["correspondent", "internet", location === "fA" ? "fa_a" : "fa_b", hostKey];
  })();

  // hvilke segmenter er "tunneled" (ytre IP = COA)?
  // i indirect: HA → FA er tunnel; alt før HA er "vanlig" til hjem-IP; etter FA er det inner pakke til hjem-IP
  const tunneledSegments = new Set<number>();
  if (location !== "home" && mode === "indirect") {
    const haIdx = path.indexOf("ha");
    const faIdx = path.indexOf(location === "fA" ? "fa_a" : "fa_b");
    if (haIdx >= 0 && faIdx > haIdx) tunneledSegments.add(haIdx); // segment after HA
  }

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const dur = 4000; // ms total
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, path.length]);

  // Pakke-posisjon
  const segCount = path.length - 1;
  const segIdx = Math.min(segCount - 1, Math.floor(progress * segCount));
  const segLocal = progress * segCount - segIdx;
  const a = NODES[path[segIdx]];
  const b = NODES[path[segIdx + 1]];
  const px = a.x + (b.x - a.x) * segLocal;
  const py = a.y + (b.y - a.y) * segLocal;
  const isTunnel = tunneledSegments.has(segIdx);

  const play = () => {
    setProgress(0);
    setPlaying(true);
  };
  const reset = () => {
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">MobilitetsTracer — pakker til en host som flytter seg</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Velg hvor mobilen er, og hvordan pakkene skal rute. Spill av og se IP-headerene endre seg
            underveis.
          </p>
        </div>
        <div className="inline-flex gap-2">
          <button
            onClick={play}
            disabled={playing}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted disabled:opacity-40"
          >
            <Play className="h-3 w-3" /> Send pakke
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Kontroller */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mobil host er på
          </span>
          <div className="mt-1 inline-flex rounded-md border border-border text-xs w-full">
            {(["home", "fA", "fB"] as Network[]).map((n) => (
              <button
                key={n}
                onClick={() => {
                  setLocation(n);
                  reset();
                }}
                className={`flex-1 px-2 py-1.5 ${
                  location === n ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                } ${n !== "home" ? "border-l border-border" : ""}`}
              >
                {n === "home" ? (
                  <Home className="h-3 w-3 inline" />
                ) : (
                  <Globe className="h-3 w-3 inline" />
                )}{" "}
                {n === "home" ? "Hjem" : n === "fA" ? "Foreign A" : "Foreign B"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rute-strategi
          </span>
          <div className="mt-1 inline-flex rounded-md border border-border text-xs w-full">
            <button
              onClick={() => {
                setMode("indirect");
                reset();
              }}
              disabled={location === "home"}
              className={`flex-1 px-2 py-1.5 disabled:opacity-40 ${
                mode === "indirect" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Indirect (via HA)
            </button>
            <button
              onClick={() => {
                setMode("direct");
                reset();
              }}
              disabled={location === "home"}
              className={`flex-1 px-2 py-1.5 border-l border-border disabled:opacity-40 ${
                mode === "direct" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Direct (route-optimization)
            </button>
          </div>
        </div>
      </div>

      {/* Hovedplot */}
      <div className="rounded-md border border-border bg-background p-2 overflow-x-auto">
        <svg viewBox="0 0 720 400" className="w-full h-auto min-w-[640px]">
          {/* Nettverks-bakgrunner */}
          <rect x={20} y={20} width={160} height={80} rx={6} fill="#3b82f6" fillOpacity={0.06} stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="4 3" />
          <text x={30} y={36} fontSize={9} fill="#3b82f6" opacity={0.7}>
            Korrespondent-nett
          </text>

          <rect x={220} y={160} width={160} height={80} rx={6} fill="#10b981" fillOpacity={0.06} stroke="#10b981" strokeOpacity={0.3} strokeDasharray="4 3" />
          <text x={230} y={176} fontSize={9} fill="#10b981" opacity={0.7}>
            {NET_LABEL.home}
          </text>

          <rect x={420} y={20} width={260} height={80} rx={6} fill="#f59e0b" fillOpacity={0.06} stroke="#f59e0b" strokeOpacity={0.3} strokeDasharray="4 3" />
          <text x={430} y={36} fontSize={9} fill="#f59e0b" opacity={0.7}>
            {NET_LABEL.fA}
          </text>

          <rect x={420} y={300} width={260} height={80} rx={6} fill="#8b5cf6" fillOpacity={0.06} stroke="#8b5cf6" strokeOpacity={0.3} strokeDasharray="4 3" />
          <text x={430} y={316} fontSize={9} fill="#8b5cf6" opacity={0.7}>
            {NET_LABEL.fB}
          </text>

          {/* Linker mellom noder (visualiser path) */}
          {path.slice(0, -1).map((id, i) => {
            const from = NODES[id];
            const to = NODES[path[i + 1]];
            const tun = tunneledSegments.has(i);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={tun ? "#10b981" : "#3b82f6"}
                strokeWidth={2.5}
                strokeOpacity={0.4}
                strokeDasharray={tun ? "6 3" : ""}
              />
            );
          })}

          {/* Noder */}
          {Object.entries(NODES).map(([key, n]) => {
            // Hide host nodes that aren't the current location
            if (key === "home_host" && location !== "home") return null;
            if (key === "fA_host" && location !== "fA") return null;
            if (key === "fB_host" && location !== "fB") return null;
            if (key === "fa_a" && location === "fB") return null;
            if (key === "fa_b" && location !== "fB") return null;
            const isHost = key.endsWith("_host");
            return (
              <g key={key} transform={`translate(${n.x},${n.y})`}>
                <circle r={18} fill="#fff" stroke="#374151" strokeWidth={1.5} />
                {isHost ? (
                  <rect x={-6} y={-9} width={12} height={18} fill="#3b82f6" rx={2} />
                ) : key === "correspondent" ? (
                  <Server className="h-3 w-3" x={-6} y={-6} />
                ) : key === "internet" ? (
                  <Globe className="h-3 w-3" x={-6} y={-6} />
                ) : key === "ha" ? (
                  <text x={0} y={4} fontSize={11} textAnchor="middle" fontWeight="bold">
                    HA
                  </text>
                ) : (
                  <text x={0} y={4} fontSize={10} textAnchor="middle" fontWeight="bold">
                    FA
                  </text>
                )}
                <text x={0} y={32} fontSize={9} textAnchor="middle" fontWeight="bold">
                  {n.label}
                </text>
                {n.sub && (
                  <text x={0} y={43} fontSize={8} textAnchor="middle" opacity={0.6}>
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}

          {/* Pakken */}
          {progress > 0 && progress < 1 && (
            <g transform={`translate(${px},${py})`}>
              <rect
                x={-18}
                y={-10}
                width={36}
                height={20}
                rx={3}
                fill={isTunnel ? "#10b981" : "#3b82f6"}
                stroke="white"
                strokeWidth={1.5}
              />
              <text x={0} y={3} fontSize={8} fill="white" textAnchor="middle" fontWeight="bold">
                PKT
              </text>
              {isTunnel && (
                <rect
                  x={-12}
                  y={-6}
                  width={24}
                  height={12}
                  rx={2}
                  fill="#3b82f6"
                  fillOpacity={0.9}
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Pakke-headers */}
      <div className="rounded-md border border-border p-3 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          IP-headere på dette segmentet
        </div>
        {progress === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Trykk «Send pakke» for å se headerene endre seg underveis.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 text-xs font-mono">
            {isTunnel ? (
              <>
                <div className="rounded border border-emerald-500/40 bg-emerald-500/5 p-2 space-y-0.5">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Ytre header (tunnel)
                  </div>
                  <div>
                    src: <span className="font-bold">10.0.0.1</span>{" "}
                    <span className="opacity-60">(HA)</span>
                  </div>
                  <div>
                    dst: <span className="font-bold">{COA[location]}</span>{" "}
                    <span className="opacity-60">(COA via FA)</span>
                  </div>
                </div>
                <div className="rounded border border-border bg-muted/30 p-2 space-y-0.5">
                  <div className="font-semibold">Indre header</div>
                  <div>
                    src: <span className="font-bold">195.88.55.16</span>
                  </div>
                  <div>
                    dst: <span className="font-bold">{HOME_IP}</span>{" "}
                    <span className="opacity-60">(hjem-IP)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded border border-border bg-muted/30 p-2 space-y-0.5 sm:col-span-2">
                <div className="font-semibold">Vanlig IP-header</div>
                <div>
                  src: <span className="font-bold">195.88.55.16</span>{" "}
                  <span className="opacity-60">(korrespondent)</span>
                </div>
                <div>
                  dst:{" "}
                  <span className="font-bold">
                    {mode === "direct" && location !== "home" ? COA[location] : HOME_IP}
                  </span>{" "}
                  <span className="opacity-60">
                    {mode === "direct" && location !== "home"
                      ? "(direkte til COA)"
                      : "(hjem-IP)"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Triangelruting-forklaring */}
      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Triangelruting og hvorfor det er en kostnad
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            I <strong>indirect</strong>-modus må alle pakker fra korrespondenten først innom Home
            Agent, selv om mobil-hosten geografisk sett er rett ved siden av korrespondenten.
            Pakkene gjør altså en omvei via hjem-nettet. Det er kostnaden for at korrespondenten
            ikke trenger å vite at hosten flytter seg — hosten ser fortsatt sitt eget hjem-IP, og
            TCP-forbindelsen brytes ikke.
          </p>
          <p>
            Bytt til <strong>direct</strong>: Korrespondenten cacher COA og sender rett dit. Ingen
            triangel, men nå må korrespondent-stacken forstå Mobile IP, og pakkene har ny
            destinasjons-IP — hosten må selv stelle med å gjenkjenne at COA og hjem-IP refererer
            samme TCP-forbindelse.
          </p>
          <p>
            I 4G/5G er triangelet skjult lokalt i mobilkjernen: telefonen har et statisk IP eid av
            gatewayen, og en GTP-tunnel oppdateres for hvert celle-bytte uten at korrespondenten
            merker noe.
          </p>
        </div>
      </details>
    </div>
  );
}
