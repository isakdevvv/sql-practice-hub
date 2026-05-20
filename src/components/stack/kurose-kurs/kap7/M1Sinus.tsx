import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// M1 SinusLab — bygger opp den ene byggesteinen all trådløs kommunikasjon
// hviler på: én ren sinusbølge. Brukeren leker med frekvens, amplitude og
// fase, og ser i sanntid hvordan bølgen i tidsdomene og i frekvensdomene
// henger sammen. Slutten kobler frekvens til bølgelengde — som er hvorfor
// 2.4 GHz WiFi (λ ≈ 12.5 cm) stoppes av en hånd, men 100 MHz radio (λ ≈ 3 m)
// gjør ikke.

const c = 3e8; // lysets fart, m/s

type Mode = "laer" | "test";

export function M1Sinus() {
  const [freq, setFreq] = useState(2); // Hz på plottet (visuelt)
  const [amp, setAmp] = useState(1); // 0..1
  const [phase, setPhase] = useState(0); // radianer
  const [realFreq, setRealFreq] = useState(2.4e9); // Hz, ekte
  const [mode, setMode] = useState<Mode>("laer");
  const [answer, setAnswer] = useState("");
  const [showAns, setShowAns] = useState(false);

  // bølgelengde i meter, for "ekte" frekvens
  const lambda = c / realFreq;
  const lambdaPretty =
    lambda >= 1
      ? `${lambda.toFixed(2)} m`
      : lambda >= 0.01
      ? `${(lambda * 100).toFixed(1)} cm`
      : `${(lambda * 1000).toFixed(1)} mm`;

  const correctLambda = lambda;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">M1 — SinusLab</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Én bølge. Tre knapper. All trådløs kommunikasjon starter her.
          </p>
        </div>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      {/* Plott + frekvensdomene */}
      <div className="grid gap-3 md:grid-cols-2">
        <Plot title="Tidsdomene" subtitle="Hva radio-mottakeren faktisk ser">
          <SinusSvg freq={freq} amp={amp} phase={phase} />
        </Plot>
        <Plot title="Frekvensdomene" subtitle="Hvilke frekvenser er til stede">
          <SpectrumSvg freq={freq} amp={amp} />
        </Plot>
      </div>

      {/* Slidere */}
      <div className="grid gap-3 md:grid-cols-3 text-sm">
        <Slider
          label="Frekvens (visuelt)"
          value={freq}
          min={0.5}
          max={6}
          step={0.1}
          onChange={setFreq}
          unit="Hz"
          help="Hvor raskt bølgen svinger. Flere topper = høyere frekvens."
        />
        <Slider
          label="Amplitude"
          value={amp}
          min={0.1}
          max={1}
          step={0.05}
          onChange={setAmp}
          unit=""
          help="Hvor høyt bølgen slår ut. Tilsvarer styrken på radio-signalet."
        />
        <Slider
          label="Fase"
          value={phase}
          min={0}
          max={2 * Math.PI}
          step={0.1}
          onChange={setPhase}
          unit="rad"
          help="Forskyver hele bølgen i tid. To bølger som ankommer i motfase utsletter hverandre — det er multipath-fading."
        />
      </div>

      {/* Lær-modus: forklaring synlig */}
      {mode === "laer" && (
        <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
          <p>
            <strong>Tre tall beskriver bølgen fullstendig:</strong> frekvens (Hz), amplitude og fase
            (rad). Tidsdomenet til venstre viser hvordan signalet svinger over tid.
            Frekvensdomenet til høyre viser at en ren sinus har all sin energi konsentrert i
            <em> én</em> frekvens — én strek.
          </p>
          <p className="text-muted-foreground">
            Virkelige radiosendere blander mange slike sinusbølger sammen. Modulasjon (M2) handler
            om å bevisst endre én av disse tre tallene for å bære data.
          </p>
        </div>
      )}

      {/* Knytt til virkelighet: bølgelengde */}
      <div className="rounded-md border border-border p-3 space-y-3">
        <div className="text-sm font-medium">Fra Hz til meter: bølgelengde</div>
        <p className="text-xs text-muted-foreground">
          En radiobølge brer seg med lysets fart <em>c</em> = 3·10⁸ m/s. Bølgelengden er hvor langt
          én svingning rekker:
          <code className="ml-1 px-1 rounded bg-muted">λ = c / f</code>. Stor λ trenger gjennom
          vegger; liten λ stoppes av hindringer på centimeter-skala.
        </p>

        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="flex-1 min-w-[180px]">
            <span className="text-xs text-muted-foreground">Ekte frekvens</span>
            <select
              className="block w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm"
              value={realFreq}
              onChange={(e) => {
                setRealFreq(Number(e.target.value));
                setShowAns(false);
                setAnswer("");
              }}
            >
              <option value={100e6}>100 MHz — FM-radio</option>
              <option value={433e6}>433 MHz — garasjeport-fjernkontroll</option>
              <option value={900e6}>900 MHz — gammelt GSM</option>
              <option value={2.4e9}>2.4 GHz — WiFi/Bluetooth</option>
              <option value={5e9}>5 GHz — WiFi 5/6</option>
              <option value={28e9}>28 GHz — 5G mmWave</option>
              <option value={60e9}>60 GHz — WiGig</option>
            </select>
          </label>

          {mode === "laer" ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Bølgelengde: </span>
              <span className="font-mono font-semibold">{lambdaPretty}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="λ = ? (i meter eller cm)"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="px-2 py-1 rounded border border-border bg-background text-sm w-44"
              />
              <button
                onClick={() => setShowAns(true)}
                className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:opacity-90"
              >
                Sjekk
              </button>
              {showAns && (
                <span className="text-sm font-mono">
                  Fasit: <span className="font-semibold">{lambdaPretty}</span>{" "}
                  <span className="text-muted-foreground">
                    ({correctLambda.toExponential(2)} m)
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {mode === "laer" && (
          <p className="text-xs text-muted-foreground">
            Legg merke til: 2.4 GHz WiFi har λ ≈ 12.5 cm — på størrelse med en hånd. Det er derfor
            kroppen din blokkerer signalet. 100 MHz FM-radio har λ ≈ 3 m og går rett gjennom deg.
          </p>
        )}
      </div>

      {/* Sjekkpunkt */}
      <Checkpoint mode={mode} />
    </div>
  );
}

// ---------- Subkomponenter ----------

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-md border border-border text-xs">
      <button
        onClick={() => setMode("laer")}
        className={`px-3 py-1.5 inline-flex items-center gap-1 rounded-l-md ${
          mode === "laer" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
      >
        <Eye className="h-3 w-3" /> Lær
      </button>
      <button
        onClick={() => setMode("test")}
        className={`px-3 py-1.5 inline-flex items-center gap-1 rounded-r-md border-l border-border ${
          mode === "test" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
      >
        <EyeOff className="h-3 w-3" /> Test meg
      </button>
    </div>
  );
}

function Plot({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-semibold">{title}</span>
        <span className="text-[10px] text-muted-foreground">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function SinusSvg({ freq, amp, phase }: { freq: number; amp: number; phase: number }) {
  const W = 320;
  const H = 120;
  const midY = H / 2;
  const maxAmp = (H / 2) * 0.85;

  const path = useMemo(() => {
    const pts: string[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI; // 0..2π over hele bredden, ganger freq for antall svingninger
      const x = (i / steps) * W;
      const y = midY - amp * maxAmp * Math.sin(freq * t + phase);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [freq, amp, phase, midY, maxAmp]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* akser */}
      <line x1={0} y1={midY} x2={W} y2={midY} stroke="currentColor" strokeWidth={0.5} opacity={0.3} />
      {/* amplitude-referanselinjer */}
      <line
        x1={0}
        y1={midY - maxAmp}
        x2={W}
        y2={midY - maxAmp}
        stroke="currentColor"
        strokeWidth={0.3}
        strokeDasharray="2 2"
        opacity={0.2}
      />
      <line
        x1={0}
        y1={midY + maxAmp}
        x2={W}
        y2={midY + maxAmp}
        stroke="currentColor"
        strokeWidth={0.3}
        strokeDasharray="2 2"
        opacity={0.2}
      />
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
      <text x={4} y={11} fontSize={9} fill="currentColor" opacity={0.6}>
        tid →
      </text>
    </svg>
  );
}

function SpectrumSvg({ freq, amp }: { freq: number; amp: number }) {
  const W = 320;
  const H = 120;
  const midY = H - 14;
  // Mapper freq (0.5..6) til x i [40..W-20]
  const x = 40 + ((freq - 0.5) / 5.5) * (W - 60);
  const spikeH = amp * (H - 30);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* x-akse */}
      <line x1={20} y1={midY} x2={W - 10} y2={midY} stroke="currentColor" strokeWidth={0.5} opacity={0.4} />
      {/* y-akse */}
      <line x1={20} y1={6} x2={20} y2={midY} stroke="currentColor" strokeWidth={0.5} opacity={0.4} />
      {/* spike */}
      <line
        x1={x}
        y1={midY}
        x2={x}
        y2={midY - spikeH}
        stroke="#10b981"
        strokeWidth={2.5}
      />
      <circle cx={x} cy={midY - spikeH} r={3} fill="#10b981" />
      <text x={x + 5} y={midY - spikeH - 3} fontSize={9} fill="currentColor">
        f = {freq.toFixed(1)} Hz
      </text>
      <text x={W - 30} y={midY + 10} fontSize={9} fill="currentColor" opacity={0.6}>
        Hz
      </text>
      <text x={4} y={11} fontSize={9} fill="currentColor" opacity={0.6}>
        energi
      </text>
    </svg>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  help,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit: string;
  help: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium">{label}</label>
        <span className="text-xs font-mono">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{help}</p>
    </div>
  );
}

function Checkpoint({ mode }: { mode: Mode }) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = "12.5 cm";

  const options = [
    { id: "a", label: "1.25 m", why: "Det ville svart til 240 MHz, ikke 2.4 GHz." },
    {
      id: "b",
      label: "12.5 cm",
      why: "Riktig. λ = (3·10⁸ m/s) / (2.4·10⁹ Hz) ≈ 0.125 m. Derfor stopper hånden din signalet.",
    },
    { id: "c", label: "1.25 mm", why: "For lite — det er nær 240 GHz, i mmWave-området." },
  ];

  return (
    <div className="rounded-md border border-dashed border-border p-3 space-y-2 text-sm">
      <div className="font-medium">Sjekkpunkt</div>
      <p>Hva er bølgelengden til en 2.4 GHz WiFi-bølge?</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const isPicked = picked === o.label;
          const isCorrect = o.label === correct;
          const showColor = picked !== null;
          return (
            <button
              key={o.id}
              onClick={() => setPicked(o.label)}
              className={`px-3 py-1.5 rounded border text-sm transition ${
                !showColor
                  ? "border-border hover:bg-muted"
                  : isPicked && isCorrect
                  ? "border-emerald-500 bg-emerald-500/10"
                  : isPicked && !isCorrect
                  ? "border-red-500 bg-red-500/10"
                  : isCorrect && mode === "laer"
                  ? "border-emerald-500/40"
                  : "border-border opacity-60"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {picked && (
        <p className="text-xs text-muted-foreground">
          {options.find((o) => o.label === picked)?.why}
        </p>
      )}
      {!picked && mode === "laer" && (
        <p className="text-[11px] text-muted-foreground italic">
          Tips: bruk λ = c / f. c = 3·10⁸ m/s, f = 2.4·10⁹ Hz.
        </p>
      )}
    </div>
  );
}
