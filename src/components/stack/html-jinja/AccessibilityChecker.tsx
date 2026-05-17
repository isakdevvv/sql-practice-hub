// AccessibilityChecker: vis samme HTML i to ruter side-ved-side:
//   (1) "som seende ser den" — vanlig iframe-rendering
//   (2) "som skjermleser leser den" — a11y-tre med rolle + accessible name
// pluss en liste over detekterte issues (manglende alt, label-kobling, etc.).
//
// Læringsmål: studenten ser i sanntid at <div onclick> ikke gir noe i
// a11y-treet, mens <button> blir announcert. Eller at et <img> uten alt blir
// flagget.

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeLine { role: string; name: string; extra?: string; depth: number; }
interface Issue { tag: string; message: string; }

interface Props {
  initial: string;
  title?: string;
  hint?: string;
}

export function AccessibilityChecker({ initial, title, hint }: Props) {
  const [code, setCode] = useState(initial.trimEnd());
  const [debounced, setDebounced] = useState(code);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(code), 200);
    return () => clearTimeout(t);
  }, [code]);

  const srcdoc = useMemo(() => buildSrcdoc(debounced), [debounced]);
  // Defer analyse til client-mount så DOMParser er tilgjengelig og vi
  // unngår SSR/hydration-uoverensstemmelser i a11y-treet.
  const [analysis, setAnalysis] = useState<{ tree: TreeLine[]; issues: Issue[] }>({ tree: [], issues: [] });
  useEffect(() => {
    setAnalysis(analyze(debounced));
  }, [debounced]);
  const { tree, issues } = analysis;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      {title && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </span>
          <button
            type="button"
            onClick={() => setCode(initial.trimEnd())}
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            tilbakestill
          </button>
        </div>
      )}
      <div className="border-b border-border">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
          HTML
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className={cn("w-full font-mono text-xs p-3 bg-background text-foreground outline-none resize-none border-0")}
          style={{ height: "160px" }}
        />
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="bg-white">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Som seende ser den
          </div>
          <iframe
            title="visual"
            srcDoc={srcdoc}
            sandbox=""
            className="w-full block bg-white"
            style={{ height: "220px", border: 0 }}
          />
        </div>
        <div className="bg-card">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
            Som skjermleser leser den
          </div>
          <div className="p-3 overflow-auto" style={{ height: "220px" }}>
            {tree.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">Skjermleseren finner ingenting å announcere.</div>
            ) : (
              <ul className="font-mono text-xs space-y-1">
                {tree.map((line, i) => (
                  <li key={i} style={{ paddingLeft: `${line.depth * 12}px` }} className="text-foreground">
                    <span className="text-brand">{line.role}</span>
                    {line.name && <span className="text-muted-foreground"> "{line.name}"</span>}
                    {line.extra && <span className="text-amber-600 dark:text-amber-400"> {line.extra}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border bg-muted/20">
          A11y-sjekk
        </div>
        <div className="p-3 space-y-1.5">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Ingen åpenbare a11y-problemer i denne markupen.
            </div>
          ) : (
            issues.map((iss, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-mono text-amber-700 dark:text-amber-400">{iss.tag}</span>
                  <span className="text-muted-foreground"> — {iss.message}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {hint && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
}

const LANDMARK_TAGS: Record<string, string> = {
  header: "banner",
  nav: "navigation",
  main: "main",
  footer: "contentinfo",
  aside: "complementary",
  section: "region",
  article: "article",
  form: "form",
};

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function analyze(html: string): { tree: TreeLine[]; issues: Issue[] } {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return { tree: [], issues: [] };
  }
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, "text/html");
  } catch {
    return { tree: [], issues: [] };
  }

  const tree: TreeLine[] = [];
  const issues: Issue[] = [];

  function accessibleName(el: Element): string {
    const aria = el.getAttribute("aria-label");
    if (aria) return aria.trim();
    const alt = el.getAttribute("alt");
    if (alt != null) return alt.trim();
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    return text;
  }

  function walk(el: Element, depth: number) {
    const tag = el.tagName.toLowerCase();
    let added = false;

    if (LANDMARK_TAGS[tag]) {
      const name = accessibleName(el).slice(0, 60);
      tree.push({ role: LANDMARK_TAGS[tag], name, depth });
      added = true;
    } else if (HEADING_TAGS.has(tag)) {
      tree.push({ role: `heading level ${tag[1]}`, name: accessibleName(el).slice(0, 80), depth });
      added = true;
    } else if (tag === "a") {
      const href = el.getAttribute("href");
      const name = accessibleName(el).slice(0, 60);
      if (!href) issues.push({ tag: "<a>", message: "lenke uten href — bør være <button> hvis den ikke navigerer" });
      if (!name) issues.push({ tag: "<a>", message: "lenke uten tekst — skjermleser hører bare 'lenke'" });
      tree.push({ role: "link", name, depth });
      added = true;
    } else if (tag === "button") {
      const name = accessibleName(el).slice(0, 60);
      if (!name) issues.push({ tag: "<button>", message: "knapp uten tekst eller aria-label" });
      tree.push({ role: "button", name, depth });
      added = true;
    } else if (tag === "img") {
      const alt = el.getAttribute("alt");
      if (alt == null) {
        issues.push({ tag: "<img>", message: "mangler alt-attributt (bruk alt=\"\" hvis dekorativt)" });
        tree.push({ role: "image", name: "[mangler alt]", extra: "⚠", depth });
      } else if (alt.trim() === "") {
        // Dekorativ — skjermleser hopper over.
      } else {
        tree.push({ role: "image", name: alt.trim().slice(0, 60), depth });
      }
      added = true;
    } else if (tag === "input") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      const id = el.getAttribute("id");
      const aria = el.getAttribute("aria-label");
      let labelText = "";
      if (id) {
        const lbl = doc.querySelector(`label[for="${cssEscape(id)}"]`);
        if (lbl) labelText = (lbl.textContent ?? "").trim();
      }
      const parentLabel = el.closest("label");
      if (!labelText && parentLabel) labelText = (parentLabel.textContent ?? "").trim();
      const name = aria || labelText;
      if (!name && type !== "hidden" && type !== "submit") {
        issues.push({ tag: `<input type="${type}">`, message: "input uten label — koble med <label for=...> eller aria-label" });
      }
      if (!el.getAttribute("name") && type !== "submit") {
        issues.push({ tag: `<input type="${type}">`, message: "mangler name= — verdien havner ikke i request.form" });
      }
      tree.push({ role: `${type} input`, name: name.slice(0, 60) || "[uten label]", extra: name ? undefined : "⚠", depth });
      added = true;
    } else if (tag === "select" || tag === "textarea") {
      const id = el.getAttribute("id");
      let labelText = "";
      if (id) {
        const lbl = doc.querySelector(`label[for="${cssEscape(id)}"]`);
        if (lbl) labelText = (lbl.textContent ?? "").trim();
      }
      if (!labelText && !el.getAttribute("aria-label")) {
        issues.push({ tag: `<${tag}>`, message: "mangler label-kobling" });
      }
      tree.push({ role: tag, name: labelText.slice(0, 60) || "[uten label]", depth });
      added = true;
    } else if (tag === "ul" || tag === "ol") {
      tree.push({ role: tag === "ul" ? "list" : "ordered list", name: "", depth });
      added = true;
    } else if (tag === "li") {
      tree.push({ role: "list item", name: directText(el).slice(0, 60), depth });
      added = true;
    }

    const childDepth = added ? depth + 1 : depth;
    for (const child of Array.from(el.children)) walk(child, childDepth);
  }

  for (const child of Array.from(doc.body.children)) walk(child, 0);

  // Globale sjekker
  const mains = doc.querySelectorAll("main");
  if (mains.length > 1) issues.push({ tag: "<main>", message: `${mains.length} <main>-elementer — det skal være kun én per dokument` });
  const h1s = doc.querySelectorAll("h1");
  if (h1s.length > 1) issues.push({ tag: "<h1>", message: `${h1s.length} <h1>-elementer — vanligvis bør det være kun én` });

  return { tree, issues };
}

function directText(el: Element): string {
  let s = "";
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === 3) s += n.textContent ?? "";
  }
  s = s.replace(/\s+/g, " ").trim();
  if (!s) s = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  return s;
}

function cssEscape(s: string): string {
  return s.replace(/(["\\])/g, "\\$1");
}

function buildSrcdoc(html: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; }
  body { padding: 12px; background: #ffffff; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}
