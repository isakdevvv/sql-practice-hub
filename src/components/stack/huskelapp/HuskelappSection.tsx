import { Link as LinkIcon } from "lucide-react";

export function HuskelappSection({
  id,
  number,
  title,
  children,
  data_text,
}: {
  id: string;
  number: number | string;
  title: string;
  children: React.ReactNode;
  /** Concatenated text used for search filtering (rendered to a hidden element). */
  data_text?: string;
}) {
  return (
    <section
      id={id}
      data-huskelapp-section
      data-section-title={title}
      data-section-text={data_text ?? ""}
      className="scroll-mt-24"
    >
      <div className="flex items-baseline gap-3 mb-4 group">
        <span className="text-xs font-mono tabular-nums text-muted-foreground rounded-md border border-border bg-card px-1.5 py-0.5">
          {number}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <a
          href={`#${id}`}
          aria-label={`Anker-lenke til ${title}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-brand"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="space-y-4 text-[14px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
