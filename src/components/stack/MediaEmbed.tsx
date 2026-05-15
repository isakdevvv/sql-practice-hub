import { useState, type FC } from "react";
import { Play, FileText, Globe, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export type MediaKind = "youtube" | "pdf" | "html";

interface Props {
  kind: MediaKind;
  /** YouTube video-id (uten URL), PDF-URL eller HTML-side-URL. */
  src: string;
  /** Visningstittel i toggle-knappen. */
  title: string;
  /** Original ekstern URL — for "åpne i ny fane"-fallback. */
  externalUrl: string;
  /** Optional default-state for visning. */
  defaultOpen?: boolean;
  /** For PDF/HTML: noen sider blokkerer iframe-embedding (X-Frame-Options).
   *  Sett `mayBlock` for å vise en advarsel om at fallback kan trenges. */
  mayBlock?: boolean;
}

const ICONS: Record<MediaKind, typeof Play> = {
  youtube: Play,
  pdf: FileText,
  html: Globe,
};

const LABELS: Record<MediaKind, { open: string; close: string }> = {
  youtube: { open: "Spill av video her", close: "Lukk video" },
  pdf: { open: "Les PDF her", close: "Lukk PDF" },
  html: { open: "Åpne side her", close: "Lukk side" },
};

const HEIGHTS: Record<MediaKind, string> = {
  youtube: "aspect-video",
  pdf: "h-[80vh]",
  html: "h-[80vh]",
};

/**
 * Inline-embed for YouTube, PDF og HTML.
 * Klikk knappen for å folde ut iframe-en. Fallback-lenke til ekstern URL alltid synlig.
 *
 * YouTube bruker youtube-nocookie.com for personvern.
 * PDF/HTML bruker raw iframe — noen sider blokkerer dette via X-Frame-Options;
 * `mayBlock=true` viser en eksplisitt advarsel.
 */
export const MediaEmbed: FC<Props> = ({
  kind,
  src,
  title,
  externalUrl,
  defaultOpen = false,
  mayBlock = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = ICONS[kind];
  const labels = LABELS[kind];

  const embedSrc =
    kind === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${src}?rel=0`
      : src;

  return (
    <div className="my-3 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
        <Icon className="h-4 w-4 text-brand shrink-0" />
        <span className="text-sm font-medium flex-1 truncate">{title}</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent inline-flex items-center gap-1"
        >
          {open ? (
            <>
              <ChevronUp className="h-3 w-3" /> {labels.close}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> {labels.open}
            </>
          )}
        </button>
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          title="Åpne i ny fane"
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent inline-flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {open && (
        <div className="bg-background">
          {mayBlock && (
            <div className="px-3 py-2 border-b border-border bg-warning/5 flex items-start gap-2 text-xs text-warning-foreground">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
              <span>
                Hvis siden er tom kan kilden ha blokkert embedding (X-Frame-Options).
                Bruk knappen til høyre for å åpne i ny fane.
              </span>
            </div>
          )}
          <iframe
            src={embedSrc}
            title={title}
            className={`w-full ${HEIGHTS[kind]} border-0 bg-background`}
            allow={
              kind === "youtube"
                ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                : undefined
            }
            allowFullScreen={kind === "youtube"}
          />
        </div>
      )}
    </div>
  );
};
