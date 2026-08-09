// ---------------------------------------------------------------------------
// core/registry.ts — felles register over alle øvingsmoduler.
//
// Problemet dette løser: hver øvingsform (flashcards, drag, JOIN, SQL) har
// sin egen FSRS-store, sin egen tittel-oppslagslogikk og sine egne deep-links,
// og hver overflate (repetisjon, dashboards, fag-sider) hardkoder listen over
// dem. Registeret samler alt per modul på ett sted, slik at overflater kan
// iterere over PRACTICE_MODULES i stedet for å kjenne hver silo.
//
// En modul registrerer:
//  - FSRS-storen sin (spaced repetition-tilstand)
//  - resolve(id): tittel + deep-link + fag-tilhørighet for ett item
//  - metadata for UI (label, ikon, farge, startside)
//
// Fag-tilhørighet (subjectSlug) er best-effort: flashcards avledes fra
// category, drag fra topic-nøkkelord, JOIN/SQL er DTE-2509. Den driver
// per-fag-filteret i due-køen og due-tallene på fag-sidene.
// ---------------------------------------------------------------------------

import { Brain, Code2, GitMerge, Layers, Library, type LucideIcon } from "lucide-react";

import { flashcardFsrs, type FsrsStore } from "@/lib/learn/fsrs";
import { MODUL_KORT_KILDER, finnModulKort } from "@/lib/learn/modulKort";
import { dragFsrs } from "@/lib/learn/dragProgress";
import { joinFsrs } from "@/lib/learn/joinProgress";
import { problemFsrs } from "@/lib/progress/storage";
import { FLASHCARDS } from "@/lib/learn/flashcards";
import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import { JOIN_EXERCISES } from "@/lib/learn/joinExercises";
import { PROBLEMS } from "@/lib/problems/data";

export interface PracticeItemRef {
  id: string;
  title: string;
  /** TanStack-rute for deep-link til itemet (eller modulens studiemodus). */
  to: string;
  search?: Record<string, string>;
  /** Fag-slug fra subjects/catalog når den kan avledes. */
  subjectSlug?: string;
}

export interface PracticeModule {
  id: string;
  label: string;
  Icon: LucideIcon;
  /** Tailwind tekstfarge-klasse for modulens aksent i UI. */
  color: string;
  /** Modulens startside — brukes i tomtilstander og oversikter. */
  href: string;
  fsrs: FsrsStore;
  resolve(id: string): PracticeItemRef;
}

// --- Fag-avledning ---------------------------------------------------------

// Drag-temaer → fag. Første regel som matcher vinner; rekkefølgen går fra
// mest spesifikk til mest generell. Temaer uten match (algoritmer, matte,
// hardware, FP) er bevisst fag-løse — de er tverrgående.
const DRAG_TOPIC_RULES: [RegExp, string][] = [
  [
    /^DTE-2505|^(OS-grunnlag|Linux|Shell|Brukere & rettigheter|Virtualisering|Systemd|Pakkebehandling|Boot)/i,
    "dte-2505",
  ],
  [
    /^DTE-2507|OSI|Transportlag|Kryptografi|Nettverkssikkerhet|TLS|Wireshark|Socket|Brannmur|Routing|DNS/i,
    "dte-2507",
  ],
  [/Backpropagation|CNN|Regularisering \(NN\)|NN-optimering|PyTorch/i, "dte-2502"],
  [
    /^DTE-2602|^ML|Modellevaluering|Supervised|Unsupervised|Nevrale nett|k-NN|k-Means|PCA|GMM|Ensemble|Reinforcement|LDA|CV-varianter|Logistisk regresjon|Regresjon-diagnostikk/i,
    "dte-2602",
  ],
  [
    /Søk \(AI\)|^CSP$|Logisk resonnering|Planlegging|^Bayes$|Minimax|Bandits|MDP|AI-etikk|Genetic|NLP/i,
    "dte-2501",
  ],
  [/statistikk|Sannsynlighet|fordelinger|ANOVA|Proporsjoner|Kombinatorikk/i, "tek-1501"],
  [/C#|LINQ|ASP\.NET|EF Core|Blazor/i, "dte-2802"],
  [/Kotlin|Android|MVVM|Korutiner|Room|RecyclerView|Retrofit/i, "dte-2603"],
  [/Scrum|Smidig|UML|Brukerhistorier|Estimering|Code review/i, "dte-2604"],
  [
    /SQL|JOIN|Normalisering|Transaksjoner|Flask|HTTP|Jinja|Database|DDL|DML|GROUP BY|NULL|ER-modell|Nøkler|Indeks|Underspørringer|Integritet|Relasjonsalgebra|Sikkerhet|Hashing|JWT|CORS|HTML|CSS|Git|Python kap/i,
    "dte-2509",
  ],
];

export function subjectForDragTopic(topic: string): string | undefined {
  for (const [re, slug] of DRAG_TOPIC_RULES) {
    if (re.test(topic)) return slug;
  }
  return undefined;
}

function subjectForCardCategory(category: string): string {
  return category === "statistikk" ? "tek-1501" : "dte-2509";
}

// --- Modulene --------------------------------------------------------------

export const PRACTICE_MODULES: PracticeModule[] = [
  {
    id: "flashcards",
    label: "Flashcard",
    Icon: Brain,
    color: "text-brand",
    href: "/cards",
    fsrs: flashcardFsrs,
    resolve(id) {
      const c = FLASHCARDS.find((x) => x.id === id);
      return {
        id,
        title: c?.question ?? id,
        to: "/cards",
        search: { mode: "study" },
        subjectSlug: c ? subjectForCardCategory(c.category) : undefined,
      };
    },
  },
  {
    id: "drag",
    label: "Drag",
    Icon: Layers,
    color: "text-success",
    href: "/drag",
    fsrs: dragFsrs,
    resolve(id) {
      const e = DRAG_EXERCISES.find((x) => x.id === id);
      return {
        id,
        title: e?.title ?? id,
        to: "/drag",
        subjectSlug: e ? subjectForDragTopic(e.topic) : undefined,
      };
    },
  },
  {
    id: "join",
    label: "JOIN",
    Icon: GitMerge,
    color: "text-warning",
    href: "/joins",
    fsrs: joinFsrs,
    resolve(id) {
      const e = JOIN_EXERCISES.find((x) => x.id === id);
      return {
        id,
        title: e?.title ?? id,
        to: "/joins",
        subjectSlug: "dte-2509",
      };
    },
  },
  {
    id: "sql",
    label: "SQL",
    Icon: Code2,
    color: "text-info",
    href: "/practice",
    fsrs: problemFsrs,
    resolve(id) {
      const p = PROBLEMS.find((x) => x.id === id);
      return {
        id,
        title: p?.title ?? id,
        to: "/practice",
        search: { id },
        subjectSlug: "dte-2509",
      };
    },
  },
  // Modulenes recall-kort (PLAN-HOST26-MODULER.md §3.4). Én oppføring per
  // kortsamling, avledet av registeret i learn/modulKort.ts — nye moduler
  // dukker opp her av seg selv når de melder inn kortene sine, uten at denne
  // fila må røres igjen. Hver kilde beholder sin egen FSRS-store, så due-tall
  // her og framdriften på modulsiden er samme tilstand.
  //
  // Grupperingen går på FSRS-store, ikke på kilde: to moduler i samme fag kan
  // dele store, og da ville én oppføring per kilde talt de samme kortene to
  // ganger i due-køen.
  ...[...new Map(MODUL_KORT_KILDER.map((k) => [k.fsrs.storageKey, k])).values()].map(
    (kilde): PracticeModule => ({
      id: `modulkort-${kilde.fagSlug}`,
      label: kilde.fagKode,
      Icon: Library,
      color: "text-brand",
      href: "/repetisjon/kort",
      fsrs: kilde.fsrs,
      resolve(id) {
        const kort = finnModulKort(id);
        return {
          id,
          title: kort?.forside ?? id,
          to: "/repetisjon/kort",
          subjectSlug: kort?.kilde.fagSlug ?? kilde.fagSlug,
        };
      },
    }),
  ),
];

export function getModule(id: string): PracticeModule | undefined {
  return PRACTICE_MODULES.find((m) => m.id === id);
}
