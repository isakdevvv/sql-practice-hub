import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, GitBranch } from "lucide-react";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  TimestepIcon,
  InputXIcon,
  HiddenHIcon,
  RnnCellIcon,
  WeightsIcon,
  OutputYIcon,
  VanishingGradIcon,
} from "@/components/stack/mlIcons";

type Tab = "intro" | "live";

export function RnnIntroPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">RNN-intro — hidden state over tid</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Hvorfor og hvordan nevrale nett kan «huske». Goodfellow kap. 10 + intuisjonen fra
            Nielsen kap. 6. Bygger på nn-intro og backprop-dyp.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<GitBranch className="h-3.5 w-3.5" />}
          >
            1. Hidden state live
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <LiveModule />}

        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Nevrale nett basics</strong> (<code>nn-intro</code>
            ): et nevron er <code>output = σ(w·input + b)</code>, σ = aktiverings-funksjon, w =
            vekter, b = bias.
          </li>
          <li>
            <strong className="text-foreground">Feed-forward</strong>: data flyter forover gjennom
            lag, ingen tilbakekoblinger. Bra for «klassifiser ett bilde» — men har ingen hukommelse.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor trenger vi hukommelse?</h2>
        <p className="text-muted-foreground">
          Tenk på setningen «Hunden bjeffer på _____». For å gjette neste ord må vi <em>huske</em>{" "}
          alle tidligere ordene. Et feed-forward nett som bare ser ett ord om gangen vet ingenting.
          Vi trenger en bro mellom tidsstegene.
        </p>
        <p className="text-muted-foreground mt-2">
          Løsningen: la nettet ha en <em>hidden state</em> — et lite minne-vektor som overføres fra
          ett tidssteg til neste. Det er kjernen i en{" "}
          <strong className="text-foreground">RNN</strong> (Recurrent Neural Network).
        </p>
      </div>

      <VisualDefs
        title="Ordbok"
        items={[
          {
            term: "Tidssteg t",
            icon: <TimestepIcon />,
            body: "Ett trinn i en sekvens. For tekst er hvert ord (eller bokstav) ett tidssteg. For lyd er hvert sample. Vi indekserer t = 1, 2, 3, ...",
          },
          {
            term: "Input x_t",
            icon: <InputXIcon />,
            body: "Det vi mater inn ved tidssteg t. F.eks. det t-te ordet i setningen, kodet som en vektor (one-hot eller embedding).",
          },
          {
            term: "Hidden state h_t",
            icon: <HiddenHIcon />,
            body: (
              <>
                Nettets «minne» ved tidssteg t. En vektor med faste lengder. Den oppdateres ved
                hvert tidssteg basert på h_{`{t−1}`} og x_t.
              </>
            ),
          },
          {
            term: "RNN-oppdaterings-regel",
            icon: <RnnCellIcon />,
            body: (
              <>
                <code>h_t = tanh(W_xh·x_t + W_hh·h_{`{t−1}`} + b_h)</code>. Lest: «den nye
                hukommelsen er en blanding av (forrige hukommelse) og (ny input), kjørt gjennom en
                aktivering».
              </>
            ),
          },
          {
            term: "W_xh, W_hh, b_h",
            icon: <WeightsIcon />,
            body: (
              <>
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    <code>W_xh</code>: vekt-matrise fra input til hidden.
                  </li>
                  <li>
                    <code>W_hh</code>: vekt-matrise fra forrige hidden til ny hidden («loopen»).
                  </li>
                  <li>
                    <code>b_h</code>: bias-vektor.
                  </li>
                </ul>
                Disse er like for alle tidssteg — det er det som gjør RNN «recurrent».
              </>
            ),
          },
          {
            term: "Output y_t",
            icon: <OutputYIcon />,
            body: (
              <>
                Hva vi spår ved tidssteg t. F.eks. neste ord, eller en klassifisering av hele
                sekvensen. <code>y_t = W_hy·h_t + b_y</code>.
              </>
            ),
          },
          {
            term: "Vanishing gradient",
            icon: <VanishingGradIcon />,
            body: "Når vi trener RNN over LANGE sekvenser, kan gradientene bli astronomisk små bakover i tid — modellen klarer ikke å lære lange sammenhenger. Det er DET LSTM/GRU prøver å løse (komplett i en senere modul).",
          },
        ]}
      />

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MODUL 1 — Hidden state visualisert over tid
// ============================================================

const H_SIZE = 6; // hidden-vektor lengde

// En liten håndlaget RNN som teller «hvor mange a-er har jeg sett».
// Vi bruker faste vekter for å gjøre det forutsigbart og illustrativt.
function rnnStep(prev: number[], inputChar: string): number[] {
  // Input encoding: vi koder hver bokstav som en 4D vektor (a=første dim,
  // b=andre, c=tredje, mellomrom=fjerde).
  const x = [0, 0, 0, 0];
  if (inputChar === "a") x[0] = 1;
  else if (inputChar === "b") x[1] = 1;
  else if (inputChar === "c") x[2] = 1;
  else x[3] = 1;

  // W_xh er 6×4, W_hh er 6×6, alt valgt for å gjøre tellingen synlig.
  // Cell 0: kumulativ teller for "a" (skrudd opp via W_xh[0][0] = 1, og
  // W_hh[0][0] = 0.95 så den ikke forsvinner)
  // Andre celler får forskjellige roller for visualisering.
  const newH = new Array(H_SIZE).fill(0);
  // Celle 0: teller a
  newH[0] = 0.95 * prev[0] + 1.0 * x[0];
  // Celle 1: teller b
  newH[1] = 0.95 * prev[1] + 1.0 * x[1];
  // Celle 2: teller c
  newH[2] = 0.95 * prev[2] + 1.0 * x[2];
  // Celle 3: «sist sett a» — 1 hvis sist input var a, ellers decay
  newH[3] = x[0] === 1 ? 1 : 0.5 * prev[3];
  // Celle 4: forskjell mellom a-er og b-er
  newH[4] = newH[0] - newH[1];
  // Celle 5: total lengde-counter
  newH[5] = prev[5] + 1;

  // Aktivering — tanh klemmer mellom -1 og 1
  return newH.map((v) => Math.tanh(v / 5));
}

function LiveModule() {
  const [sekvens, setSekvens] = useState("abacab");
  const [t, setT] = useState(0);

  const chars = useMemo(() => sekvens.toLowerCase().slice(0, 12).split(""), [sekvens]);
  const states = useMemo(() => {
    const list: number[][] = [new Array(H_SIZE).fill(0)];
    for (const c of chars) list.push(rnnStep(list[list.length - 1], c));
    return list;
  }, [chars]);

  const cur = states[Math.min(t, states.length - 1)];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Forsøk:</strong> vi har en liten RNN som mater inn
        bokstaver én etter én. Hidden state er en 6-element vektor som oppdateres ved hvert
        tidssteg. Vi har valgt vektene manuelt så hver celle har en synlig rolle — i en ekte RNN
        ville vektene blitt LÆRT, og hver celle hadde fått en mer abstrakt rolle.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <input
          value={sekvens}
          onChange={(e) => {
            setSekvens(e.target.value);
            setT(0);
          }}
          maxLength={12}
          className="w-full rounded border border-border bg-background p-2 font-mono text-sm"
          placeholder="abacab"
        />

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={t === 0} onClick={() => setT(t - 1)}>
            ← Forrige t
          </Button>
          <Button size="sm" disabled={t >= states.length - 1} onClick={() => setT(t + 1)}>
            Neste t →
          </Button>
          <span className="text-xs text-muted-foreground ml-2">t = {t}</span>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Sekvens
          </div>
          <div className="flex gap-1">
            {chars.map((c, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded flex items-center justify-center font-mono font-semibold border ${
                  i === t - 1
                    ? "border-brand bg-brand/10 text-brand"
                    : i < t
                      ? "border-border bg-card"
                      : "border-dashed border-border text-muted-foreground"
                }`}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Hidden state h<sub>{t}</sub> (6 dimensjoner)
          </div>
          <div className="space-y-1.5">
            {cur.map((v, i) => {
              const labels = [
                "teller-a",
                "teller-b",
                "teller-c",
                "sist-var-a",
                "a−b diff",
                "lengde",
              ];
              const pct = Math.abs(v) * 100;
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-20 text-muted-foreground">{labels[i]}</div>
                  <div className="flex-1 h-4 rounded bg-muted relative overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                    <div
                      className={`absolute top-0 bottom-0 ${v >= 0 ? "bg-brand" : "bg-amber-500"}`}
                      style={{
                        left: v >= 0 ? "50%" : `${50 - pct / 2}%`,
                        width: `${pct / 2}%`,
                      }}
                    />
                  </div>
                  <div className="font-mono w-14 text-right">{v.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Legg merke til:</strong>
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          <li>«teller-a», «teller-b», «teller-c» vokser når den respektive bokstaven kommer.</li>
          <li>«sist-var-a» er høy rett etter «a» og avtar når andre bokstaver kommer.</li>
          <li>«lengde» øker monotont — det er en intern tids-teller.</li>
          <li>
            Alt skjer ved å bare bruke{" "}
            <code>
              h_t = f(h_<sub>{`{t−1}`}</sub>, x_t)
            </code>{" "}
            — samme funksjon hvert tidssteg, det er «recurrence».
          </li>
        </ul>
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          En RNN er bare «samme nevron-funksjon, kjørt på nytt for hver tidssteg, med forrige output
          som ekstra input». Det er hele trikset.
        </li>
        <li>
          Trening: vi «brett ut» (unfold) RNN-en til en lang feed-forward kjede og bruker vanlig
          backprop — kalt <em>Backpropagation Through Time (BPTT)</em>.
        </li>
        <li>
          Begrensning: gradientene «forsvinner» bakover i tid. Derfor kom LSTM (Hochreiter &
          Schmidhuber, 1997) og GRU (Cho, 2014) med gates som lar gradienter strømme fritt over
          lange sekvenser. Senere modul.
        </li>
        <li>
          Moderne tekstmodeller (Transformer) erstatter recurrence med attention — men forståelsen
          av hidden state er fortsatt fundamentet.
        </li>
      </ul>
    </section>
  );
}
