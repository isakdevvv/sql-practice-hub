// Route /er-tegner — interactive ER-diagram builder.
//
// Layout: SiteHeader on top, two-column main area:
//   - Left (sidebar): forms for entities + relationships, plus reset/buttons.
//   - Right (main):   live SVG diagram + generated CREATE TABLE SQL beneath.
//
// The whole model lives in one useState; svgLayout.ts and sqlGen.ts are
// pure derivations of it. No persistence — refresh = back to demo.

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  Eye,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EntityForm } from "@/components/er-tegner/EntityForm";
import { ErCanvas } from "@/components/er-tegner/ErCanvas";
import { generateSql } from "@/lib/er-tegner/sqlGen";
import { ER_EXERCISES, type ErExercise } from "@/lib/er-tegner/exercises";
import type {
  CfEnd,
  Entity,
  ErModel,
  ErRelationship,
} from "@/lib/er-tegner/types";
import { cn } from "@/lib/utils";

/** Normalize SQL for comparison: trim each line, drop blank lines and comments. */
function normalizeSql(sql: string): string[] {
  return sql
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("--"));
}

/** How many target lines have an exact match in user — out of all target lines. */
function compareSql(user: string, target: string): { matched: number; total: number } {
  const userLines = new Set(normalizeSql(user));
  const targetLines = normalizeSql(target);
  const matched = targetLines.filter((line) => userLines.has(line)).length;
  return { matched, total: targetLines.length };
}

export const Route = createFileRoute("/er-tegner")({
  head: () => ({
    meta: [
      { title: "ER-tegner — SQL Sandbox" },
      {
        name: "description",
        content:
          "Bygg ER-diagram med entiteter, attributter og kråkefot-relasjoner. Få live SVG og generert CREATE TABLE-SQL.",
      },
    ],
  }),
  component: ErTegnerPage,
});

let _seq = 0;
function nid(prefix: string): string {
  _seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${_seq}`;
}

// Pre-loaded demo: KUNDE 1—N BESTILLING.
function demoModel(): ErModel {
  const kundenrId = "k-pk";
  const navnId = "k-navn";
  const epostId = "k-epost";
  const bestnrId = "b-pk";
  const bDatoId = "b-dato";
  const kunde: Entity = {
    id: "kunde",
    name: "kunde",
    attributes: [
      { id: kundenrId, name: "kundenr", type: "INTEGER", notNull: true },
      { id: navnId, name: "navn", type: "TEXT", notNull: true },
      { id: epostId, name: "epost", type: "TEXT", notNull: false },
    ],
    pkAttributeId: kundenrId,
  };
  const bestilling: Entity = {
    id: "bestilling",
    name: "bestilling",
    attributes: [
      { id: bestnrId, name: "bestnr", type: "INTEGER", notNull: true },
      { id: bDatoId, name: "dato", type: "TEXT", notNull: true },
      // No explicit kundenr-FK column — sqlGen injects it from the rel.
    ],
    pkAttributeId: bestnrId,
  };
  const rel: ErRelationship = {
    id: "rel-kunde-bestilling",
    fromEntityId: "kunde",
    toEntityId: "bestilling",
    fromEnd: "||", // én og bare én kunde per bestilling
    toEnd: "O<", // null-eller-mange bestillinger per kunde
    label: "har",
  };
  return { entities: [kunde, bestilling], relationships: [rel] };
}

const CF_ENDS: { value: CfEnd; label: string; meaning: string }[] = [
  { value: "||", label: "||", meaning: "én og bare én (1)" },
  { value: "O|", label: "O|", meaning: "valgfri én (0..1)" },
  { value: "|<", label: "|<", meaning: "én eller flere (1..N)" },
  { value: "O<", label: "O<", meaning: "null eller flere (0..N)" },
];

function ErTegnerPage() {
  const [model, setModel] = useState<ErModel>(() => demoModel());
  const [copied, setCopied] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  const sql = useMemo(() => generateSql(model), [model]);

  const activeExercise = useMemo<ErExercise | null>(
    () => ER_EXERCISES.find((e) => e.id === activeExerciseId) ?? null,
    [activeExerciseId],
  );

  const targetSql = useMemo(
    () => (activeExercise ? generateSql(activeExercise.target) : ""),
    [activeExercise],
  );

  const matchInfo = useMemo(
    () => (activeExercise ? compareSql(sql, targetSql) : null),
    [activeExercise, sql, targetSql],
  );

  function pickExercise(exId: string) {
    setActiveExerciseId(exId);
    setShowHints(false);
    // Start with a blank model so the user builds it themselves.
    setModel({ entities: [], relationships: [] });
  }

  function goExerciseDelta(delta: number) {
    if (!ER_EXERCISES.length) return;
    const currentIdx = activeExerciseId
      ? ER_EXERCISES.findIndex((e) => e.id === activeExerciseId)
      : -1;
    // If no exercise active, "Neste" picks the first; "Forrige" picks the last.
    const baseIdx = currentIdx === -1 ? (delta > 0 ? -1 : 0) : currentIdx;
    const nextIdx = (baseIdx + delta + ER_EXERCISES.length) % ER_EXERCISES.length;
    pickExercise(ER_EXERCISES[nextIdx].id);
  }

  function loadFasit() {
    if (!activeExercise) return;
    setModel(activeExercise.target);
  }

  function setEntity(updated: Entity) {
    setModel((m) => ({
      ...m,
      entities: m.entities.map((e) => (e.id === updated.id ? updated : e)),
    }));
  }

  function addEntity() {
    const id = nid("ent");
    const pkId = nid("attr");
    const newE: Entity = {
      id,
      name: `entitet${model.entities.length + 1}`,
      attributes: [{ id: pkId, name: "id", type: "INTEGER", notNull: true }],
      pkAttributeId: pkId,
    };
    setModel((m) => ({ ...m, entities: [...m.entities, newE] }));
  }

  function deleteEntity(id: string) {
    setModel((m) => ({
      entities: m.entities.filter((e) => e.id !== id),
      // cascade: drop any rel that referenced this entity
      relationships: m.relationships.filter(
        (r) => r.fromEntityId !== id && r.toEntityId !== id,
      ),
    }));
  }

  function addRelationship() {
    if (model.entities.length < 2) return;
    const r: ErRelationship = {
      id: nid("rel"),
      fromEntityId: model.entities[0].id,
      toEntityId: model.entities[1].id,
      fromEnd: "||",
      toEnd: "O<",
      label: "",
    };
    setModel((m) => ({ ...m, relationships: [...m.relationships, r] }));
  }

  function updateRel(id: string, patch: Partial<ErRelationship>) {
    setModel((m) => ({
      ...m,
      relationships: m.relationships.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    }));
  }

  function deleteRel(id: string) {
    setModel((m) => ({
      ...m,
      relationships: m.relationships.filter((r) => r.id !== id),
    }));
  }

  function resetDemo() {
    if (
      model.entities.length > 0 &&
      !confirm("Erstatt nåværende modell med demo (kunde + bestilling)?")
    )
      return;
    setModel(demoModel());
  }

  function clearAll() {
    if (!confirm("Tøm hele modellen?")) return;
    setModel({ entities: [], relationships: [] });
  }

  async function copySql() {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard might not be available in some sandboxes
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ER-tegner</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bygg en ER-modell med entiteter og kråkefot-relasjoner. Diagrammet
              og CREATE TABLE-SQL oppdateres mens du skriver.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={resetDemo}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Tilbakestill demo
            </Button>
            <Button size="sm" variant="ghost" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Tøm
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          {/* Sidebar: exercises + forms */}
          <aside className="space-y-5 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-2">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  Oppgaver
                </h2>
                {activeExercise && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveExerciseId(null)}
                    className="text-[10px] h-6"
                  >
                    Lukk oppgave
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {ER_EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => pickExercise(ex.id)}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2 text-xs transition-colors",
                      ex.id === activeExerciseId
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <div className="font-medium truncate">{ex.title}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                      Nivå {ex.level}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <Button size="sm" variant="ghost" onClick={() => goExerciseDelta(-1)}>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
                </Button>
                <span>
                  {activeExerciseId
                    ? `${ER_EXERCISES.findIndex((e) => e.id === activeExerciseId) + 1} av ${ER_EXERCISES.length}`
                    : `${ER_EXERCISES.length} oppgaver`}
                </span>
                <Button size="sm" variant="ghost" onClick={() => goExerciseDelta(1)}>
                  Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </section>

            {activeExercise && (
              <section className="rounded-lg border border-brand/40 bg-brand/5 p-3 space-y-2.5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-brand mb-1">
                    Aktiv oppgave
                  </div>
                  <h3 className="text-sm font-semibold">{activeExercise.title}</h3>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {activeExercise.description}
                </p>
                <div className="text-[11px] text-muted-foreground italic leading-relaxed">
                  <strong className="not-italic text-foreground/80">Mål:</strong>{" "}
                  {activeExercise.goal}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setShowHints((s) => !s)}>
                    <Lightbulb className="h-3.5 w-3.5 mr-1" />
                    {showHints ? "Skjul hint" : "Hint"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={loadFasit}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Last fasit
                  </Button>
                </div>
                {showHints && (
                  <ul className="text-xs text-foreground/85 space-y-1 pt-1 list-disc pl-5">
                    {activeExercise.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
                {matchInfo && (
                  <div
                    className={cn(
                      "rounded-md px-3 py-2 text-xs font-medium flex items-center justify-between",
                      matchInfo.matched === matchInfo.total && matchInfo.total > 0
                        ? "bg-success/15 text-success border border-success/40"
                        : "bg-muted/40 text-muted-foreground border border-border",
                    )}
                  >
                    <span>
                      {matchInfo.matched === matchInfo.total && matchInfo.total > 0
                        ? "✓ Riktig — din SQL matcher fasit"
                        : `${matchInfo.matched} av ${matchInfo.total} fasit-linjer matcher`}
                    </span>
                    {matchInfo.total > 0 && (
                      <span>
                        {Math.round((matchInfo.matched / matchInfo.total) * 100)}%
                      </span>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Entiteter ({model.entities.length})
                </h2>
                <Button size="sm" variant="outline" onClick={addEntity}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Ny entitet
                </Button>
              </div>
              {model.entities.length === 0 && (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground text-center">
                  Ingen entiteter — legg til én eller bruk demo-modellen.
                </div>
              )}
              {model.entities.map((e) => (
                <EntityForm
                  key={e.id}
                  entity={e}
                  onChange={setEntity}
                  onDelete={() => deleteEntity(e.id)}
                />
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Relasjoner ({model.relationships.length})
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addRelationship}
                  disabled={model.entities.length < 2}
                  title={
                    model.entities.length < 2
                      ? "Krever minst 2 entiteter"
                      : "Legg til relasjon"
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Ny relasjon
                </Button>
              </div>
              {model.relationships.map((r) => (
                <RelationshipForm
                  key={r.id}
                  rel={r}
                  entities={model.entities}
                  onChange={(patch) => updateRel(r.id, patch)}
                  onDelete={() => deleteRel(r.id)}
                />
              ))}
              {model.relationships.length === 0 && model.entities.length >= 2 && (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground text-center">
                  Ingen relasjoner.
                </div>
              )}
            </section>
          </aside>

          {/* Main: diagram + SQL */}
          <div className="space-y-5 min-w-0">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Diagram
              </h2>
              <ErCanvas model={model} />
            </section>

            {activeExercise ? (
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Din SQL
                    </h2>
                    <Button size="sm" variant="ghost" onClick={copySql} disabled={!sql}>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copied ? "Kopiert" : "Kopier"}
                    </Button>
                  </div>
                  <pre className="rounded-lg border border-border bg-card p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre min-h-[120px]">
                    {sql || "-- Tom modell — start å legge til entiteter"}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Fasit-SQL
                    </h2>
                    <span className="text-[10px] text-muted-foreground">
                      bygg modellen så denne matcher
                    </span>
                  </div>
                  <pre className="rounded-lg border border-success/30 bg-success/5 p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre min-h-[120px]">
                    {targetSql}
                  </pre>
                </div>
              </section>
            ) : (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Generert SQL
                  </h2>
                  <Button size="sm" variant="ghost" onClick={copySql} disabled={!sql}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    {copied ? "Kopiert" : "Kopier"}
                  </Button>
                </div>
                <pre className="rounded-lg border border-border bg-card p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
                  {sql || "-- Tom modell — legg til entiteter for å se SQL"}
                </pre>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function RelationshipForm({
  rel,
  entities,
  onChange,
  onDelete,
}: {
  rel: ErRelationship;
  entities: Entity[];
  onChange: (patch: Partial<ErRelationship>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={rel.label ?? ""}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="label (valgfri)"
          className="font-mono text-sm flex-1"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive h-9 w-9 p-0"
          title="Slett relasjon"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Fra
          </Label>
          <Select
            value={rel.fromEntityId}
            onValueChange={(v) => onChange({ fromEntityId: v })}
          >
            <SelectTrigger className="h-8 text-xs font-mono mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.id} className="font-mono text-xs">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={rel.fromEnd}
            onValueChange={(v) => onChange({ fromEnd: v as CfEnd })}
          >
            <SelectTrigger className="h-8 text-xs font-mono mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CF_ENDS.map((c) => (
                <SelectItem key={c.value} value={c.value} className="font-mono text-xs">
                  {c.label} — {c.meaning}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Til
          </Label>
          <Select
            value={rel.toEntityId}
            onValueChange={(v) => onChange({ toEntityId: v })}
          >
            <SelectTrigger className="h-8 text-xs font-mono mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.id} className="font-mono text-xs">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={rel.toEnd}
            onValueChange={(v) => onChange({ toEnd: v as CfEnd })}
          >
            <SelectTrigger className="h-8 text-xs font-mono mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CF_ENDS.map((c) => (
                <SelectItem key={c.value} value={c.value} className="font-mono text-xs">
                  {c.label} — {c.meaning}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
