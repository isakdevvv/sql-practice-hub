import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb, Dna, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { BinaryEncoding } from "./BinaryEncoding";
import { RealValueEncoding } from "./RealValueEncoding";
import { OrderEncoding } from "./OrderEncoding";
import { TreeEncoding } from "./TreeEncoding";
import { EncodingMatchQuiz } from "./EncodingMatchQuiz";

type Tab = "binary" | "real" | "order" | "tree";

const TABS: { id: Tab; label: string; subtitle: string }[] = [
  { id: "binary", label: "Binary", subtitle: "Knapsack 0/1" },
  { id: "real", label: "Real-value", subtitle: "Kontinuerlig 2D" },
  { id: "order", label: "Order", subtitle: "TSP, 8 byer" },
  { id: "tree", label: "Tree", subtitle: "Symbolic regression" },
];

export function GaEncodingLabPage() {
  const [tab, setTab] = useState<Tab>("binary");

  return (
    <StackPageShell title="GA Encoding Lab" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-6">
          <Link to="/stack" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3 w-3" /> Tilbake til stack
          </Link>
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · GA fortsettelse
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Dna className="h-7 w-7 text-brand" />
            GA Encoding Lab — bytt encoding, se forskjellen
          </h1>
          <p className="mt-3 text-muted-foreground">
            En genetisk algoritme er som et byggesett: samme overordnede løkke (seleksjon →
            crossover → mutation → erstatt), men <em>encoding</em>-strategien bestemmer hva
            kromosomet er og hvordan operatorene må implementeres. Bytt mellom de fire
            klassiske encoding-typene under og se hvordan crossover og mutation må tilpasses
            problemet.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Bygger videre på:</span> "Genetic algorithms, swarm, ACO".
              Den lesjonen lærte deg standard binær GA. Her ser du <em>hvorfor</em> du må
              bruke spesialiserte operatorer for TSP, kontinuerlige funksjoner og
              symbolske formler. Pensum: Grokking AI kapittel 5.
            </div>
          </div>
        </div>

        {/* Quick reference card */}
        <div className="rounded-xl border border-border bg-card p-4 mb-8">
          <div className="text-xs font-semibold mb-3">Encoding-cheatsheet</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <CheatCard color="blue" head="Binary" body="Bit-streng. Crossover = one-point split. Mutation = flip bit. Brukes for ja/nei-valg." />
            <CheatCard color="emerald" head="Real-value" body="Flyttall-vektor. Crossover = aritmetisk blanding α·A+(1−α)·B. Mutation = gaussisk støy." />
            <CheatCard color="purple" head="Order" body="Permutasjon. Crossover = OX/PMX (bevarer permutasjon). Mutation = swap to indekser." />
            <CheatCard color="amber" head="Tree" body="Parse-tre, variabel størrelse. Crossover = bytt subtrær. Mutation = endre én node." />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg border transition ${
                tab === t.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-[10px] opacity-80">{t.subtitle}</div>
            </button>
          ))}
        </div>

        <div className="mb-10">
          {tab === "binary" && <BinaryEncoding />}
          {tab === "real" && <RealValueEncoding />}
          {tab === "order" && <OrderEncoding />}
          {tab === "tree" && <TreeEncoding />}
        </div>

        {/* Comparison summary */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Oppsummering: hvorfor encoding er kritisk</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              <strong className="text-emerald-400">Encoding bestemmer søkerommet.</strong>{" "}
              En 10-bits streng kan bare uttrykke 2¹⁰ = 1024 ulike løsninger. En reell vektor
              har overtellig mange. En permutasjon av 8 byer har 8! = 40320. Et tre kan ha
              uendelig mange former.
            </p>
            <p>
              <strong className="text-emerald-400">Encoding bestemmer hvilke operatorer som gir mening.</strong>{" "}
              One-point bit-flip fungerer for binary, men ødelegger permutasjoner og
              flyttall-koordinater. Aritmetisk blanding fungerer for real-value, men gir ikke
              mening for diskrete valg. Subtre-bytte fungerer for trær fordi strukturen er
              hierarkisk.
            </p>
            <p>
              <strong className="text-emerald-400">Encoding påvirker konvergens.</strong>{" "}
              Dårlig valgt encoding = mange ugyldige løsninger, treg konvergens, eller
              hopping mellom høyt-fitness-områder uten lokal forbedring (no "smooth fitness
              landscape").
            </p>
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs">
              <strong className="text-amber-400">Eksamen-tips:</strong> Når et problem
              presenteres for deg, spør deg selv: <em>Hva er en kandidatløsning?</em>{" "}
              Et sett ja/nei? Tall? En rekkefølge? En struktur? Svaret bestemmer encoding,
              og encoding bestemmer hvilke operatorer du må implementere.
            </div>
          </div>
        </section>

        <section className="mb-10">
          <EncodingMatchQuiz />
        </section>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          Se også: <Link to="/stack" className="text-brand hover:underline">DTE-2501 — Genetic algorithms, swarm, ACO</Link>{" "}
          (grunnlaget for denne lesjonen) og <Link to="/stack" className="text-brand hover:underline">DTE-2501 — Dynamic Programming og TSP</Link>{" "}
          (alternativ tilnærming til TSP via DP — sammenligne).
        </div>
      </div>
    </StackPageShell>
  );
}

function CheatCard({ color, head, body }: { color: "blue" | "emerald" | "purple" | "amber"; head: string; body: string }) {
  const map = {
    blue: "border-blue-400/40 bg-blue-400/5",
    emerald: "border-emerald-400/40 bg-emerald-400/5",
    purple: "border-purple-400/40 bg-purple-400/5",
    amber: "border-amber-400/40 bg-amber-400/5",
  } as const;
  const head_color = {
    blue: "text-blue-300",
    emerald: "text-emerald-300",
    purple: "text-purple-300",
    amber: "text-amber-300",
  } as const;
  return (
    <div className={`rounded-lg border p-3 ${map[color]}`}>
      <div className={`font-semibold mb-1 ${head_color[color]}`}>{head}</div>
      <div className="text-muted-foreground leading-snug">{body}</div>
    </div>
  );
}
