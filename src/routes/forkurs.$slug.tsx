import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { F01Virtualisering } from "@/components/stack/forkurs/F01Virtualisering";
import { getBit } from "@/components/stack/forkurs/bits";

export const Route = createFileRoute("/forkurs/$slug")({
  head: ({ params }) => {
    const bit = getBit(params.slug);
    return {
      meta: [
        { title: bit ? `${bit.bitId} ${bit.tittel} — Forkurs` : "Forkurs" },
        { name: "description", content: bit?.blurb ?? "Forkurs-bit" },
      ],
    };
  },
  component: ForkursBitPage,
});

function ForkursBitPage() {
  const { slug } = useParams({ from: "/forkurs/$slug" });

  if (slug === "f01-virtualisering") {
    return <F01Virtualisering />;
  }

  const bit = getBit(slug);

  return (
    <StackPageShell title="Forkurs" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/forkurs" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Tilbake til forkurs-løypen
        </Link>
        {bit ? (
          <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <div className="text-xs font-mono text-brand mb-2">{bit.bitId}</div>
            <h1 className="text-2xl font-bold mb-2">{bit.tittel}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-4">
              {bit.blurb}
            </p>
            <div className="text-xs text-muted-foreground">
              Denne biten er ikke bygd ennå. F-01 er piloten — godkjenn stilen der først.
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Begreper biten skal dekke:{" "}
              <span className="text-foreground">{bit.begreper.join(", ")}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
            <h1 className="text-xl font-bold mb-2">Ukjent bit</h1>
            <p className="text-sm text-muted-foreground">
              Slug &quot;{slug}&quot; finnes ikke i forkurs-registeret.
            </p>
          </div>
        )}
      </article>
    </StackPageShell>
  );
}
