// Live HTML+CSS-preview i en sandboxet iframe (srcdoc). Stilene er isolert
// fra app-siden — ingen lekkasje begge veier.
//
// To moduser:
//   - Statisk preview: vis et HTML+CSS-snutt og rendere det.
//   - Knapp-veksel: la brukeren bytte verdi på én CSS-property (f.eks.
//     justify-content) og se layouten endres. Bygger intuisjon uten å
//     skrive kode.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface BaseProps {
  /** HTML-fragment som rendres innenfor <body>. */
  html: string;
  /** CSS som rendres i <style>. Bruk {{value}} for å bytte ut variabelen
   *  hvis `toggle` er satt. */
  css: string;
  /** Valgfri overskrift over preview-en. */
  title?: string;
  /** Iframe-høyde i px. */
  height?: number;
}

interface StaticProps extends BaseProps {
  toggle?: undefined;
}

interface ToggleProps extends BaseProps {
  toggle: {
    /** Label vist over knappene. */
    label: string;
    /** Liste av verdier — første er valgt by default. */
    values: string[];
  };
}

type Props = StaticProps | ToggleProps;

export function CssLivePreview(props: Props) {
  const hasToggle = "toggle" in props && props.toggle !== undefined;
  const values = hasToggle ? (props as ToggleProps).toggle.values : null;
  const [picked, setPicked] = useState(0);

  const css = useMemo(() => {
    if (!hasToggle || !values) return props.css;
    return props.css.replaceAll("{{value}}", values[picked]);
  }, [props.css, hasToggle, values, picked]);

  const srcdoc = useMemo(() => buildSrcdoc(props.html, css), [props.html, css]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      {(props.title || hasToggle) && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-3 flex-wrap">
          {props.title && (
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {props.title}
            </span>
          )}
          {hasToggle && values && (
            <>
              <span className="text-[11px] text-muted-foreground">
                {(props as ToggleProps).toggle.label}:
              </span>
              <div className="flex flex-wrap gap-1">
                {values.map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPicked(i)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-mono border transition-colors",
                      i === picked
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div className="bg-white">
        <iframe
          title={props.title ?? "CSS preview"}
          srcDoc={srcdoc}
          sandbox=""
          className="w-full block"
          style={{ height: `${props.height ?? 200}px`, border: 0 }}
        />
      </div>
      {hasToggle && values && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-[11px] font-mono text-muted-foreground">
          {/* Vis hvilken CSS-linje som endres */}
          aktiv: <span className="text-foreground">{values[picked]}</span>
        </div>
      )}
    </div>
  );
}

function buildSrcdoc(html: string, css: string): string {
  // Reset + boks-rammer så barn er synlige uten at studenten må style alt.
  // Brukes med vilje en lys, nøytral palett som tegner CSS-prinsipper godt.
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #0f172a; }
  body { padding: 12px; background: #ffffff; }
${css}
</style>
</head>
<body>
${html}
</body>
</html>`;
}
