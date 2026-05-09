// Form for adding/editing one entity. The parent owns the entity object and
// passes onChange — this component is "controlled". Attribute order is
// stable: we generate ids when rows are added, never reuse, never resort.

import { useState } from "react";
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
import { Plus, Trash2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attribute, Entity, SqlType } from "@/lib/er-tegner/types";

const TYPES: SqlType[] = ["INTEGER", "TEXT", "REAL", "BLOB"];

let _attrSeq = 0;
function newAttrId(): string {
  _attrSeq += 1;
  return `attr-${Date.now().toString(36)}-${_attrSeq}`;
}

export function EntityForm({
  entity,
  onChange,
  onDelete,
}: {
  entity: Entity;
  onChange: (e: Entity) => void;
  onDelete?: () => void;
}) {
  const [newAttrName, setNewAttrName] = useState("");

  function update<K extends keyof Entity>(key: K, value: Entity[K]) {
    onChange({ ...entity, [key]: value });
  }

  function updateAttr(id: string, patch: Partial<Attribute>) {
    onChange({
      ...entity,
      attributes: entity.attributes.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    });
  }

  function addAttribute(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const a: Attribute = {
      id: newAttrId(),
      name: trimmed,
      type: "TEXT",
      notNull: false,
    };
    onChange({ ...entity, attributes: [...entity.attributes, a] });
    setNewAttrName("");
  }

  function removeAttribute(id: string) {
    const next = entity.attributes.filter((a) => a.id !== id);
    onChange({
      ...entity,
      attributes: next,
      pkAttributeId: entity.pkAttributeId === id ? null : entity.pkAttributeId,
    });
  }

  function setPk(id: string) {
    onChange({ ...entity, pkAttributeId: entity.pkAttributeId === id ? null : id });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Entitet
          </Label>
          <Input
            value={entity.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="navn"
            className="font-mono mt-1"
          />
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            title="Slett entitet"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div>
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Attributter
        </Label>
        <div className="space-y-1.5 mt-1.5">
          {entity.attributes.length === 0 && (
            <div className="text-xs text-muted-foreground italic px-1">
              Ingen attributter ennå.
            </div>
          )}
          {entity.attributes.map((a) => {
            const isPk = a.id === entity.pkAttributeId;
            return (
              <div key={a.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPk(a.id)}
                  title={isPk ? "Primærnøkkel — klikk for å fjerne" : "Sett som PK"}
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center w-7 h-9 rounded border transition-colors",
                    isPk
                      ? "border-amber-500/60 bg-amber-500/15 text-amber-500"
                      : "border-border text-muted-foreground hover:border-amber-500/40",
                  )}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
                <Input
                  value={a.name}
                  onChange={(e) => updateAttr(a.id, { name: e.target.value })}
                  className={cn(
                    "font-mono text-sm flex-1",
                    isPk && "underline decoration-amber-500/70 underline-offset-4",
                  )}
                />
                <Select
                  value={a.type}
                  onValueChange={(v) => updateAttr(a.id, { type: v as SqlType })}
                >
                  <SelectTrigger className="w-[110px] h-9 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="font-mono text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center w-9 h-9 rounded border text-[10px] font-semibold cursor-pointer select-none transition-colors",
                    a.notNull
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:border-brand/40",
                    isPk && "opacity-50 cursor-not-allowed",
                  )}
                  title={isPk ? "PK er alltid NOT NULL" : "NOT NULL"}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={a.notNull || isPk}
                    disabled={isPk}
                    onChange={(e) => updateAttr(a.id, { notNull: e.target.checked })}
                  />
                  NN
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttribute(a.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive h-9 w-9 p-0"
                  title="Slett attributt"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
        <form
          className="flex gap-1.5 mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            addAttribute(newAttrName);
          }}
        >
          <Input
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="ny attributt-navn…"
            className="font-mono text-sm"
          />
          <Button type="submit" size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Legg til
          </Button>
        </form>
      </div>
    </div>
  );
}
