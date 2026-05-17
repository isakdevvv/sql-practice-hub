// Sentral fag-katalog: SEKTORER, EXAM_META, SUBJECT_BY_SLUG.
//
// Hentet ut fra `src/routes/index.tsx` så `/mine-fag` og forsiden deler
// samme kilde. Ikke duplisér disse listene i andre filer — importér
// herfra. Hvis du legger til et nytt fag, gjør det her.

import {
  Database,
  Network,
  Brain,
  TerminalSquare,
  Smartphone,
  Workflow,
  Globe,
  Layers,
  Boxes,
  Sigma,
} from "lucide-react";

export type Subject = {
  slug: string;
  code: string;
  navn: string;
  blurb: string;
  Icon: typeof Database;
};

export type Sektor = {
  navn: string;
  beskrivelse: string;
  accent: string;
  subjects: Subject[];
};

// Ekstra metadata for fag som inngår i høst 2026 — vises kun hvis brukeren
// pinner et av disse fagene. Andre pinnede fag viser bare basis-info.
export const EXAM_META: Record<string, { stp: number; eksamen: string }> = {
  "tek-1501": { stp: 5, eksamen: "14.12.2026 (3t skriftlig)" },
  "dte-2505": { stp: 5, eksamen: "02.12.2026 (2t skriftlig)" },
  "dte-2501": { stp: 10, eksamen: "Hjemmeeksamen + mappe (3t × 2)" },
  "dte-2507": { stp: 10, eksamen: "30.11.2026 (2 × 2t)" },
  "dte-2602": { stp: 10, eksamen: "09.12.2026 (3t hjemme) + mappe 16.12" },
};

export const SEKTORER: Sektor[] = [
  {
    navn: "Databaser og web",
    beskrivelse: "SQL, Flask, MySQL, autentisering, web-sikkerhet, og full-stack Web 2.",
    accent: "from-blue-500/30 to-cyan-500/20",
    subjects: [
      {
        slug: "dte-2509",
        code: "DTE-2509",
        navn: "Databaser og webapplikasjoner 1",
        blurb:
          "Seks moduler som dekker hele pensumet: HTML/CSS+Git, Flask Basics, Database, User Management, API/HTTP, og Web-sikkerhet.",
        Icon: Database,
      },
      {
        slug: "dte-2802",
        code: "DTE-2802",
        navn: "Web Applikasjoner 2",
        blurb:
          "Fem mini-kurs: C#, ASP.NET MVC, Web API, EF Core og Blazor.",
        Icon: Globe,
      },
    ],
  },
  {
    navn: "AI og maskinlæring",
    beskrivelse: "Klassisk AI, supervised/unsupervised ML, og dyplæring.",
    accent: "from-violet-500/30 to-fuchsia-500/20",
    subjects: [
      {
        slug: "dte-2501",
        code: "DTE-2501",
        navn: "AI Methods and Applications",
        blurb:
          "Fem mini-kurs: søk, CSP, logikk, planlegging og Bayes — klassisk AI før ML tok over.",
        Icon: Brain,
      },
      {
        slug: "dte-2602",
        code: "DTE-2602",
        navn: "Introduksjon maskinlæring og AI",
        blurb:
          "Fire mini-kurs: ML-grunnlag, supervised, unsupervised, og nevrale nett.",
        Icon: Layers,
      },
      {
        slug: "dte-2502",
        code: "DTE-2502",
        navn: "Neural Networks",
        blurb:
          "Dyplæring som bygger på DTE-2602: backpropagation dypt, CNN, regularisering, optimerere, PyTorch/TF.",
        Icon: Workflow,
      },
    ],
  },
  {
    navn: "Systemnær og infrastruktur",
    beskrivelse: "Operativsystemer, Linux, nettverk og sikkerhet på lavt nivå.",
    accent: "from-emerald-500/30 to-teal-500/20",
    subjects: [
      {
        slug: "dte-2505",
        code: "DTE-2505",
        navn: "Operativsystemer",
        blurb:
          "Fem mini-kurs: OS-grunnlag, Linux-bruk, shell scripting, brukere og rettigheter, virtualisering.",
        Icon: TerminalSquare,
      },
      {
        slug: "dte-2507",
        code: "DTE-2507",
        navn: "Datakommunikasjon og sikkerhet",
        blurb:
          "Fem mini-kurs: OSI/TCP-IP, transport, kryptografi, TLS og nettverkssikkerhet.",
        Icon: Network,
      },
    ],
  },
  {
    navn: "Matematikk og statistikk",
    beskrivelse: "Matematiske grunnpilarer for ingeniør- og data-fag.",
    accent: "from-rose-500/30 to-pink-500/20",
    subjects: [
      {
        slug: "tek-1501",
        code: "TEK-1501",
        navn: "Sannsynlighet og statistikk for ingeniører",
        blurb:
          "Åtte mini-kurs: deskriptiv statistikk, sannsynlighet, kombinatorikk, diskrete + kontinuerlige fordelinger, CLT, konfidensintervall, hypotesetest og regresjon — med live-visualiseringer og scipy.stats i nettleseren.",
        Icon: Sigma,
      },
    ],
  },
  {
    navn: "Mobil og prosessverktøy",
    beskrivelse: "Android-utvikling og hvordan team faktisk leverer programvare.",
    accent: "from-amber-500/30 to-orange-500/20",
    subjects: [
      {
        slug: "dte-2603",
        code: "DTE-2603",
        navn: "Programmering for mobil",
        blurb:
          "Seks mini-kurs: Kotlin, Android-livssyklus, MVVM, korutiner, Room/RecyclerView og Retrofit.",
        Icon: Smartphone,
      },
      {
        slug: "dte-2604",
        code: "DTE-2604",
        navn: "Systemutvikling",
        blurb:
          "Fire mini-kurs: smidige metodikker, brukerhistorier, UML, og prosjekt-praksis.",
        Icon: Boxes,
      },
    ],
  },
];

export const SUBJECT_BY_SLUG: Record<string, Subject> = (() => {
  const map: Record<string, Subject> = {};
  for (const sektor of SEKTORER) {
    for (const s of sektor.subjects) map[s.slug] = s;
  }
  return map;
})();
