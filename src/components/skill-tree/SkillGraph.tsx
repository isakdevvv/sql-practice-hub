/**
 * <SkillGraph> — interaktiv cytoscape-graf over ferdighets-treet.
 *
 * Inputs:
 *  - skills:        listen av Skill-objekter som skal vises
 *  - estimates:     bruker-state per skill (rating + mastery)
 *  - nextUnlocked:  id-er som er klare til læring nå
 *  - filterOmrade:  begrens til ett fag-område, eller null for alle
 *  - onlyUnlocked:  vis bare nextUnlocked-noder (+ deres prereqs)
 *  - onlyRusty:     vis bare skills brukeren har lært, men hvor det er en stund siden
 *  - selectedId:    valgt skill (vises som highlightet)
 *  - onSelect:      callback når bruker klikker en node
 *
 * Komponenten laster cytoscape dynamisk for å unngå SSR-problemer.
 */

import { useEffect, useMemo, useRef } from "react";
import type {
  Skill,
  SkillId,
  FagOmrade,
} from "@/lib/skill-tree/skills";
import type { SkillEstimate, Mastery } from "@/lib/skill-tree/engine";

export interface SkillGraphProps {
  skills: Skill[];
  estimates: Map<SkillId, SkillEstimate>;
  nextUnlocked: Set<SkillId>;
  filterOmrade: FagOmrade | null;
  onlyUnlocked: boolean;
  onlyRusty: boolean;
  selectedId: SkillId | null;
  onSelect: (id: SkillId) => void;
}

/** Farger per fag-område. Tailwind-aktige hex-verdier. */
export const OMRADE_FARGE: Record<FagOmrade, string> = {
  math: "#3b82f6", // blå
  programming: "#10b981", // grønn
  "data-structures": "#14b8a6", // teal
  os: "#f97316", // oransje
  networks: "#06b6d4", // cyan
  databases: "#a855f7", // lilla
  web: "#ec4899", // pink
  "ml-classical": "#eab308", // gul
  "ml-deep": "#facc15", // lys gul
  security: "#ef4444", // rød
  "engineering-practice": "#6b7280", // grå
};

export const OMRADE_LABEL: Record<FagOmrade, string> = {
  math: "Matematikk",
  programming: "Programmering",
  "data-structures": "Datastrukturer",
  os: "Operativsystemer",
  networks: "Nettverk",
  databases: "Databaser",
  web: "Web",
  "ml-classical": "ML (klassisk)",
  "ml-deep": "Dyp læring",
  security: "Sikkerhet",
  "engineering-practice": "Ingeniørpraksis",
};

const MASTERY_OPACITY: Record<Mastery, number> = {
  ukjent: 0.15,
  lærer: 0.55,
  kan: 0.95,
  mester: 1,
};

const RUSTY_DAYS_THRESHOLD = 14;

export function isRusty(est: SkillEstimate | undefined): boolean {
  if (!est || est.sistTrent == null) return false;
  if (est.mastery !== "kan" && est.mastery !== "mester") return false;
  const days = (Date.now() - est.sistTrent) / 86_400_000;
  return days > RUSTY_DAYS_THRESHOLD;
}

function filterSkills(props: SkillGraphProps): Skill[] {
  let out = props.skills;
  if (props.filterOmrade) {
    out = out.filter((s) => s.omrade === props.filterOmrade);
  }
  if (props.onlyUnlocked) {
    const include = new Set<SkillId>(props.nextUnlocked);
    // ta også med direkte prereqs så grafen henger sammen visuelt
    for (const id of props.nextUnlocked) {
      const s = props.skills.find((x) => x.id === id);
      if (s) for (const p of s.prereqs) include.add(p);
    }
    out = out.filter((s) => include.has(s.id));
  }
  if (props.onlyRusty) {
    out = out.filter((s) => isRusty(props.estimates.get(s.id)));
  }
  return out;
}

export function SkillGraph(props: SkillGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<{ destroy(): void; on?: unknown } | null>(null);

  // Den faktiske subset som skal tegnes
  const visibleSkills = useMemo(() => filterSkills(props), [props]);

  // Init cytoscape én gang
  useEffect(() => {
    let disposed = false;
    let listener: ((evt: { target: { id(): string } }) => void) | null = null;
    let cy: any = null;
    (async () => {
      if (!containerRef.current) return;
      const mod = await import("cytoscape");
      if (disposed || !containerRef.current) return;
      const cytoscape = mod.default;
      cy = cytoscape({
        container: containerRef.current,
        elements: buildElements(visibleSkills, props),
        style: buildStyle(),
        layout: { name: "cose", animate: false, padding: 40 },
        wheelSensitivity: 0.3,
        minZoom: 0.2,
        maxZoom: 2.5,
      });
      listener = (evt) => props.onSelect(evt.target.id());
      cy.on("tap", "node", listener);
      cyRef.current = cy;
    })();
    return () => {
      disposed = true;
      if (cy) {
        try {
          cy.destroy();
        } catch {
          /* noop */
        }
      }
      cyRef.current = null;
    };
    // Vi rebuilder grafen i en annen effekt — init kjører kun én gang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild når data eller filtre endres
  useEffect(() => {
    const cy: any = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(buildElements(visibleSkills, props));
    cy.style(buildStyle());
    cy.layout({ name: "cose", animate: false, padding: 40 }).run();
  }, [visibleSkills, props.estimates, props.nextUnlocked]);

  // Highlight valgt node
  useEffect(() => {
    const cy: any = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass("selected");
    if (props.selectedId) {
      const n = cy.getElementById(props.selectedId);
      if (n) {
        n.addClass("selected");
        try {
          cy.animate({ center: { eles: n }, zoom: Math.max(cy.zoom(), 1) }, { duration: 250 });
        } catch {
          /* noop */
        }
      }
    }
  }, [props.selectedId]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-md border bg-background"
      role="img"
      aria-label="Interaktiv graf over ferdighets-treet"
    />
  );
}

function buildElements(skills: Skill[], props: SkillGraphProps) {
  const ids = new Set(skills.map((s) => s.id));
  const nodes = skills.map((s) => {
    const est = props.estimates.get(s.id);
    const mastery: Mastery = est?.mastery ?? "ukjent";
    const rating = est?.rating ?? 0;
    // node-størrelse: 24..60 px basert på rating
    const size = Math.round(24 + Math.max(0, Math.min(6, rating + 3)) * 6);
    const farge = OMRADE_FARGE[s.omrade];
    const isNext = props.nextUnlocked.has(s.id);
    return {
      data: {
        id: s.id,
        label: s.navn,
        farge,
        opacity: MASTERY_OPACITY[mastery],
        size,
        mastery,
        next: isNext,
        glow: mastery === "mester" ? 1 : 0,
      },
      classes: [
        `omrade-${s.omrade}`,
        `mastery-${mastery}`,
        isNext ? "next-unlocked" : "",
        mastery === "mester" ? "glow" : "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  });
  const edges: Array<{ data: { id: string; source: string; target: string } }> = [];
  for (const s of skills) {
    for (const p of s.prereqs) {
      if (!ids.has(p)) continue;
      edges.push({ data: { id: `${p}->${s.id}`, source: p, target: s.id } });
    }
  }
  return [...nodes, ...edges];
}

function buildStyle() {
  return [
    {
      selector: "node",
      style: {
        "background-color": "data(farge)",
        "background-opacity": "data(opacity)",
        "border-width": 2,
        "border-color": "data(farge)",
        "border-opacity": 0.9,
        width: "data(size)",
        height: "data(size)",
        label: "data(label)",
        color: "#1f2937",
        "font-size": 10,
        "font-weight": 500,
        "text-valign": "bottom",
        "text-margin-y": 4,
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.75,
        "text-background-padding": 2,
        "text-background-shape": "roundrectangle",
      },
    },
    {
      selector: "node.next-unlocked",
      style: {
        "border-width": 4,
        "border-color": "#facc15", // gul ring
        "border-opacity": 1,
      },
    },
    {
      selector: "node.glow",
      style: {
        "shadow-blur": 18,
        "shadow-color": "data(farge)",
        "shadow-opacity": 0.7,
        "shadow-offset-x": 0,
        "shadow-offset-y": 0,
      },
    },
    {
      selector: "node.selected",
      style: {
        "border-width": 5,
        "border-color": "#111827",
        "border-opacity": 1,
      },
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": "#9ca3af",
        "target-arrow-color": "#9ca3af",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        opacity: 0.7,
      },
    },
  ] as unknown as any;
}
