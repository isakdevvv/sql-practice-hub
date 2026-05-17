// FormBuilder: studenten klikker for å legge til skjema-felter, ser
// (a) live preview av skjemaet, (b) generert HTML-kildekode.
//
// Læringsmål: hvordan <label for="…"> kobles til <input id="…">, hvilke
// type-attributter som finnes, og at hvert felt trenger name= for å havne
// i request.form.

import { useMemo, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldKind = "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox";

interface Field {
  id: string;
  kind: FieldKind;
  label: string;
  name: string;
  required: boolean;
  options?: string[];
}

const DEFAULTS: Record<FieldKind, Omit<Field, "id">> = {
  text:     { kind: "text",     label: "Navn",     name: "navn",     required: false },
  email:    { kind: "email",    label: "E-post",   name: "epost",    required: true  },
  password: { kind: "password", label: "Passord",  name: "passord",  required: true  },
  number:   { kind: "number",   label: "Alder",    name: "alder",    required: false },
  textarea: { kind: "textarea", label: "Melding",  name: "melding",  required: false },
  select:   { kind: "select",   label: "Farge",    name: "farge",    required: false, options: ["rød", "blå", "grønn"] },
  checkbox: { kind: "checkbox", label: "Godta vilkår", name: "godta", required: true  },
};

let nextId = 1;
function mk(kind: FieldKind): Field {
  return { ...DEFAULTS[kind], id: `f${nextId++}` };
}

const initialFields: Field[] = [mk("text"), mk("password")];

export function FormBuilder() {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [action, setAction] = useState("/login");
  const [method, setMethod] = useState<"GET" | "POST">("POST");

  const html = useMemo(() => generateHtml(fields, action, method), [fields, action, method]);
  const srcdoc = useMemo(() => buildSrcdoc(html), [html]);

  function update(id: string, patch: Partial<Field>) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function remove(id: string) { setFields((fs) => fs.filter((f) => f.id !== id)); }
  function move(id: string, dir: -1 | 1) {
    setFields((fs) => {
      const i = fs.findIndex((f) => f.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= fs.length) return fs;
      const copy = [...fs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  function add(kind: FieldKind) { setFields((fs) => [...fs, mk(kind)]); }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Skjema-bygger
        </span>
        <button
          type="button"
          onClick={() => setFields([mk("text"), mk("password")])}
          className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          tilbakestill
        </button>
      </div>

      <div className="px-4 py-3 border-b border-border bg-muted/10 flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">action:</span>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="font-mono rounded border border-border bg-background px-2 py-0.5 w-32"
          />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">method:</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
            className="font-mono rounded border border-border bg-background px-2 py-0.5"
          >
            <option>GET</option>
            <option>POST</option>
          </select>
        </label>
      </div>

      <div className="px-4 py-3 border-b border-border space-y-2">
        {fields.length === 0 && (
          <div className="text-xs text-muted-foreground italic">Ingen felter ennå — legg til ett under.</div>
        )}
        {fields.map((f, i) => (
          <div key={f.id} className="rounded-md border border-border bg-background p-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand bg-brand/10 px-1.5 py-0.5 rounded">
              {f.kind}
            </span>
            <label className="flex items-center gap-1">
              <span className="text-muted-foreground">label:</span>
              <input
                value={f.label}
                onChange={(e) => update(f.id, { label: e.target.value })}
                className="rounded border border-border bg-background px-1.5 py-0.5 w-24"
              />
            </label>
            <label className="flex items-center gap-1">
              <span className="text-muted-foreground">name:</span>
              <input
                value={f.name}
                onChange={(e) => update(f.id, { name: e.target.value.replace(/\s+/g, "_") })}
                className="font-mono rounded border border-border bg-background px-1.5 py-0.5 w-24"
              />
            </label>
            {f.kind === "select" && (
              <label className="flex items-center gap-1">
                <span className="text-muted-foreground">opts (komma):</span>
                <input
                  value={(f.options ?? []).join(",")}
                  onChange={(e) => update(f.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className="font-mono rounded border border-border bg-background px-1.5 py-0.5 w-40"
                />
              </label>
            )}
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => update(f.id, { required: e.target.checked })}
              />
              <span className="text-muted-foreground">required</span>
            </label>
            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(f.id, -1)}
                disabled={i === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                aria-label="flytt opp"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => move(f.id, 1)}
                disabled={i === fields.length - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                aria-label="flytt ned"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                aria-label="fjern felt"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(Object.keys(DEFAULTS) as FieldKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => add(k)}
              className={cn(
                "text-[11px] font-mono rounded-md px-2 py-1 border border-border bg-background",
                "hover:border-brand hover:bg-brand/5 flex items-center gap-1",
              )}
            >
              <Plus className="h-3 w-3" />
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="bg-white">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Rendret skjema
          </div>
          <iframe
            title="Form preview"
            srcDoc={srcdoc}
            sandbox=""
            className="w-full block bg-white"
            style={{ height: "260px", border: 0 }}
          />
        </div>
        <div>
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Generert HTML
          </div>
          <pre className="font-mono text-[11px] p-3 overflow-auto bg-background text-foreground" style={{ height: "260px", margin: 0 }}>{html}</pre>
        </div>
      </div>
    </div>
  );
}

function generateHtml(fields: Field[], action: string, method: string): string {
  const escAttr = (s: string) => s.replace(/"/g, "&quot;");
  const lines: string[] = [];
  lines.push(`<form action="${escAttr(action)}" method="${method}">`);
  for (const f of fields) {
    const req = f.required ? " required" : "";
    if (f.kind === "checkbox") {
      lines.push(`  <label><input type="checkbox" name="${escAttr(f.name)}"${req} /> ${f.label}</label>`);
    } else if (f.kind === "textarea") {
      lines.push(`  <label for="${escAttr(f.name)}">${f.label}:</label>`);
      lines.push(`  <textarea id="${escAttr(f.name)}" name="${escAttr(f.name)}"${req}></textarea>`);
    } else if (f.kind === "select") {
      lines.push(`  <label for="${escAttr(f.name)}">${f.label}:</label>`);
      lines.push(`  <select id="${escAttr(f.name)}" name="${escAttr(f.name)}"${req}>`);
      for (const o of f.options ?? []) lines.push(`    <option value="${escAttr(o)}">${o}</option>`);
      lines.push(`  </select>`);
    } else {
      lines.push(`  <label for="${escAttr(f.name)}">${f.label}:</label>`);
      lines.push(`  <input type="${f.kind}" id="${escAttr(f.name)}" name="${escAttr(f.name)}"${req} />`);
    }
  }
  lines.push(`  <button type="submit">Send</button>`);
  lines.push(`</form>`);
  return lines.join("\n");
}

function buildSrcdoc(html: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; }
  body { padding: 14px; background: #ffffff; }
  form { display: flex; flex-direction: column; gap: 8px; max-width: 360px; }
  label { font-weight: 500; font-size: 13px; }
  input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select {
    padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font: inherit; width: 100%;
  }
  textarea { min-height: 60px; resize: vertical; }
  label > input[type="checkbox"] { margin-right: 6px; }
  button[type="submit"] {
    margin-top: 6px; padding: 8px 14px; background: #2563eb; color: white;
    border: 0; border-radius: 4px; font: inherit; cursor: pointer; align-self: flex-start;
  }
  button[type="submit"]:hover { background: #1d4ed8; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}
