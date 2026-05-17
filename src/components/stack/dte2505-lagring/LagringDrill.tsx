import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, Calculator, Activity, Cpu, HardDrive, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DrillShell,
  DrillPrompt,
  DrillHint,
  DrillStepCard,
  type DrillStep,
  type DrillStepCtx,
} from "@/components/learn/DrillShell";

// ---------------------------------------------------------------------------
// LagringDrill — fem-stegs drill om lagringsmedier. Bygd på DrillShell-mønsteret
// (lær først → test deg selv) som vi har for andre fag. Hvert steg har sin
// egen "fasit + forklaring" som synes i lær-modus.
// ---------------------------------------------------------------------------

type Option = { id: string; label: string; why?: string };

// ----- Steg 1: HDD seek + rot ---------------------------------------------
const STEP1_OPTIONS: Option[] = [
  { id: "a", label: "≈ 4 ms", why: "Det er rotasjons-latency alene. Du må også legge til seek." },
  { id: "b", label: "≈ 8 ms", why: "Det er nær seek alene for en lang seek, men ikke totalen." },
  { id: "c", label: "≈ 12 ms" },
  { id: "d", label: "≈ 60 ms", why: "For mye — du har sannsynligvis brukt full rotasjon i stedet for snitt-rotasjon." },
];
const STEP1_CORRECT = "c";

// ----- Steg 2: SSD-levetid ------------------------------------------------
const STEP2_OPTIONS: Option[] = [
  { id: "a", label: "ca. 1 år", why: "Du har sannsynligvis brukt total kapasitet i stedet for TBW-budsjett." },
  { id: "b", label: "ca. 33 år", why: "Det er 600/(0.05 × 365) hvis vi ignorerer WA — men WA på 1.5 gjør at hver logisk write koster mer." },
  { id: "c", label: "ca. 22 år" },
  { id: "d", label: "ca. 600 år", why: "Du har glemt at det er TBW per dag som teller, ikke per måned." },
];
const STEP2_CORRECT = "c";

// ----- Steg 3: Write amplification ---------------------------------------
const STEP3_OPTIONS: Option[] = [
  { id: "a", label: "0.4×", why: "Du har snudd brøken — fysisk dividert på logisk, ikke omvendt." },
  { id: "b", label: "1.0×", why: "Det ville bety ingen amplification — men 250/100 er ikke 1." },
  { id: "c", label: "2.5×" },
  { id: "d", label: "5.0×", why: "Du har lagt sammen i stedet for å dele." },
];
const STEP3_CORRECT = "c";

// ----- Steg 4: Velg disk for write-tung workload --------------------------
const STEP4_OPTIONS: Option[] = [
  { id: "a", label: "HDD 7200 RPM", why: "Random write fsync på HDD koster én full rotasjon per commit (~4 ms snitt) — 250 TPS er taket. For en write-tung DB er det dødfødt." },
  { id: "b", label: "QLC NVMe", why: "QLC har lav endurance (~100–1000 PE-sykler) og ville slites raskt under tung write." },
  { id: "c", label: "TLC NVMe med PLP (power-loss protection)" },
  { id: "d", label: "Optane (3D XPoint)", why: "Best ytelse, men prisen er ~20× høyere enn TLC NVMe. Riktig om budsjettet tillater det, men ikke det vanlige valget." },
];
const STEP4_CORRECT = "c";

// ----- Steg 5: Velg disk for kald arkiv ----------------------------------
const STEP5_OPTIONS: Option[] = [
  { id: "a", label: "HDD" },
  { id: "b", label: "TLC NVMe", why: "Overkill og dyr. Du leser arkivet sjelden — IOPS-en bare står ubrukt." },
  { id: "c", label: "Optane", why: "Helt feil prisklasse for kalt arkiv. Optane er for hot write cache, ikke kald lagring." },
  { id: "d", label: "RAM", why: "RAM glemmer alt når strømmen går. Du må ha persistent lagring." },
];
const STEP5_CORRECT = "a";

export function LagringDrill() {
  const steps: DrillStep[] = [
    {
      id: "hdd-seek",
      title: "Steg 1 — beregn HDD-aksess-tid",
      pillLabel: "HDD-tid",
      render: (ctx) => (
        <MCQStep
          ctx={ctx}
          icon={<HardDrive className="h-4 w-4" />}
          prompt={
            <>
              En HDD spinner på <strong>7200 RPM</strong>. Hodet er på spor 100 og må flyttes til spor 400.
              Anta seek-modell: <code className="font-mono text-xs">3 ms + 0.01 ms/spor</code>.
              Hva er forventet total aksess-tid (seek + snitt-rotasjons-latency)?
            </>
          }
          options={STEP1_OPTIONS}
          correct={STEP1_CORRECT}
          learnHint={
            <>
              Seek-tid: 3 + 0.01 × 300 = <strong>6 ms</strong>.
              Snitt-rotasjons-latency: 60 000 / 7200 / 2 = <strong>4.17 ms</strong>.
              Totalt: 6 + 4.17 ≈ <strong>10–12 ms</strong>. Det runder til "≈ 12 ms".
            </>
          }
          correctHint="6 ms seek + 4.17 ms rotasjon = ca. 10–12 ms. Det er typisk HDD-random-latency."
        />
      ),
      summary: "HDD random aksess = seek + halv rotasjon. På 7200 RPM blir det ~10 ms.",
    },
    {
      id: "ssd-levetid",
      title: "Steg 2 — anslå SSD-levetid",
      pillLabel: "Levetid",
      render: (ctx) => (
        <MCQStep
          ctx={ctx}
          icon={<Calculator className="h-4 w-4" />}
          prompt={
            <>
              En TLC NVMe SSD er rated for <strong>600 TBW</strong> (total bytes written).
              Workload: <strong>50 GB logiske writes per dag</strong>.
              Write amplification (WA) er <strong>1.5×</strong>.
              Hvor lenge holder disken før den når TBW-grensen?
            </>
          }
          options={STEP2_OPTIONS}
          correct={STEP2_CORRECT}
          learnHint={
            <>
              Fysiske writes per dag: 50 GB × 1.5 = <strong>75 GB/dag</strong>.
              Totalt budsjett: 600 TB = 600 000 GB.
              Levetid: 600 000 / 75 = <strong>8000 dager ≈ 22 år</strong>.
              Vær obs: TBW er garantert minimum — typisk holder den lenger. Men en WA på 3× ville halvert tallet.
            </>
          }
          correctHint="50 × 1.5 = 75 GB/dag fysisk. 600 000 / 75 = 8000 dager ≈ 22 år."
        />
      ),
      summary: "SSD-levetid = TBW / (daglig writes × WA). WA er en hard multiplikator.",
    },
    {
      id: "wa",
      title: "Steg 3 — write amplification",
      pillLabel: "WA",
      render: (ctx) => (
        <MCQStep
          ctx={ctx}
          icon={<Activity className="h-4 w-4" />}
          prompt={
            <>
              En SSD-controller logger: brukeren skrev <strong>100 MB</strong> logisk,
              men telleren for fysiske writes økte med <strong>250 MB</strong> (på grunn av
              garbage collection og pakke-headers). Hva er write amplification?
            </>
          }
          options={STEP3_OPTIONS}
          correct={STEP3_CORRECT}
          learnHint={
            <>
              WA = fysiske writes / logiske writes = 250 / 100 = <strong>2.5×</strong>.
              Det er på den høye siden — sunne consumer-disker holder seg under 2.0 i normal bruk.
              Tung random write på en nesten-full SSD kan dytte WA over 4 — derfor er det viktig å ikke
              fylle SSD-en helt opp.
            </>
          }
          correctHint="WA = fysiske / logiske = 250 / 100 = 2.5×."
        />
      ),
      summary: "WA = fysiske writes / logiske writes. Påvirker både levetid og ytelse.",
    },
    {
      id: "valg-write-tung",
      title: "Steg 4 — velg disk: write-tung database",
      pillLabel: "Write-tung",
      render: (ctx) => (
        <MCQStep
          ctx={ctx}
          icon={<Database className="h-4 w-4" />}
          prompt={
            <>
              Du skal sette opp en OLTP-database med <strong>~10 000 commits per sekund</strong>,
              hver med fsync til disk. Du har budsjett. Hvilken lagring velger du?
            </>
          }
          options={STEP4_OPTIONS}
          correct={STEP4_CORRECT}
          learnHint={
            <>
              TLC NVMe med PLP er industri-standard for OLTP. PLP (power-loss protection) betyr at
              kondensatorer holder strømmen lenge nok til at controlleren skriver write-bufferen til
              flash når strømmen går. Det lar fsync returnere når data er i SSD-controlleren (microsekunder)
              i stedet for når de er i flash-cellene (millisekunder) — 10× høyere throughput.
            </>
          }
          correctHint="TLC NVMe med PLP gir 100k+ IOPS og trygg fsync uten store kost-overskridelser."
        />
      ),
      summary: "OLTP = NVMe med PLP. HDD/QLC er ute, Optane er overkill med mindre du virkelig trenger sub-µs.",
    },
    {
      id: "valg-arkiv",
      title: "Steg 5 — velg disk: kald arkiv",
      pillLabel: "Arkiv",
      render: (ctx) => (
        <MCQStep
          ctx={ctx}
          icon={<Cpu className="h-4 w-4" />}
          prompt={
            <>
              Du skal arkivere <strong>100 TB</strong> overvåkningsvideo. Lesefrekvens er
              <strong> "kanskje én gang i året"</strong> for compliance-audits. Hva velger du?
            </>
          }
          options={STEP5_OPTIONS}
          correct={STEP5_CORRECT}
          learnHint={
            <>
              HDD er fortsatt 3–5× billigere per GB enn SSD. Når dataene leses sjelden er den lave
              IOPS-en irrelevant. Kald-arkiv-tier hos cloud-leverandører (S3 Glacier, Azure Archive)
              er HDD eller tape under panseret. Tape kan være enda billigere for {">"}PB-skala.
            </>
          }
          correctHint="Sjelden-lest, stor kapasitet = HDD (eller tape). SSD-er sin ytelse er bortkastet penger her."
        />
      ),
      summary: "Kaldt arkiv = HDD/tape. Velg disk etter access-frekvens og kost/GB, ikke etter hype.",
    },
  ];

  return (
    <DrillShell
      id="drill"
      storageId="dte2505-lagring"
      title="Prøv selv — fem drill-oppgaver"
      intro={
        <>
          Fem oppgaver fra tre vinkler: <strong>regn på fysikk</strong> (HDD aksess-tid, SSD-levetid,
          WA) og <strong>velg riktig disk for use-case</strong>. Bruk{" "}
          <span className="text-foreground">Lær først</span> for å se hele utregningen, eller{" "}
          <span className="text-foreground">Test deg selv</span> for å svare blindt.
        </>
      }
      steps={steps}
      finalSummary={
        <>
          Du har trent på <strong>hvor HDD-tiden går</strong> (seek + rotasjon),
          <strong> hvordan SSD-levetid regnes ut</strong> (TBW / (writes × WA)), og
          <strong> hvilken disk som passer hvilken workload</strong>. På eksamen er det vanlig
          å få spørsmål av typen "her er en workload — hvilken disk og hvorfor?" — øv på å resonnere
          om <em>access-mønster</em>, <em>access-frekvens</em>, <em>endurance-krav</em> og <em>kost/GB</em>.
        </>
      }
      finalTitle="Bra!"
    />
  );
}

// ===========================================================================
// MCQStep — flervalg med "lær først / test deg selv" semantikk
// ===========================================================================

function MCQStep({
  ctx,
  prompt,
  icon,
  options,
  correct,
  learnHint,
  correctHint,
}: {
  ctx: DrillStepCtx;
  prompt: React.ReactNode;
  icon: React.ReactNode;
  options: Option[];
  correct: string;
  learnHint: React.ReactNode;
  correctHint: React.ReactNode;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPick(null);
    setStatus("idle");
  }, [ctx.resetToken]);

  function onPick(id: string) {
    if (learnMode) return;
    setPick(id);
    const ok = id === correct;
    setStatus(ok ? "correct" : "wrong");
    ctx.setDone(ok);
  }

  const correctOption = options.find((o) => o.id === correct);
  const effectivePick = learnMode ? correct : pick;
  const wrongOption = !learnMode && pick && pick !== correct ? options.find((o) => o.id === pick) : null;

  return (
    <DrillStepCard>
      <DrillPrompt icon={icon} text={prompt} />

      <div className="mt-2 grid sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const isPicked = effectivePick === opt.id;
          const isCorrectOpt = opt.id === correct;
          const showCorrect = learnMode && isCorrectOpt;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "text-left rounded-lg border px-3 py-2 transition-colors flex items-center justify-between gap-2",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect && !showWrong && !showRight && "border-border bg-background hover:bg-accent",
                learnMode && !isCorrectOpt && "opacity-50",
              )}
            >
              <span className="text-sm">{opt.label}</span>
              {(showCorrect || showRight) && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
            </button>
          );
        })}
      </div>

      {learnMode && (
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title={`Fasit: ${correctOption?.label ?? ""}`}
          body={learnHint}
        />
      )}
      {!learnMode && status === "wrong" && wrongOption?.why && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt:"
          body={wrongOption.why}
        />
      )}
      {!learnMode && status === "correct" && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Korrekt!"
          body={correctHint}
        />
      )}
    </DrillStepCard>
  );
}
