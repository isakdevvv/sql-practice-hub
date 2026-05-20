import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { SEC01CiaAutentisering } from "@/components/stack/sikkerhet/SEC01CiaAutentisering";
import { getBit } from "@/components/stack/sikkerhet/bits";
import type { ComponentType } from "react";

const BIT_COMPONENTS: Record<string, ComponentType> = {
  "sec01-cia-autentisering": SEC01CiaAutentisering,
};

export const Route = createFileRoute("/sikkerhet/$slug")({
  head: ({ params }) => {
    const bit = getBit(params.slug);
    return {
      meta: [
        { title: bit ? `${bit.bitId} ${bit.tittel} — Sikkerhet` : "Sikkerhet" },
        { name: "description", content: bit?.blurb ?? "Sikkerhet-bit" },
      ],
    };
  },
  component: SikkerhetBitPage,
});

function SikkerhetBitPage() {
  const { slug } = useParams({ from: "/sikkerhet/$slug" });
  const Component = BIT_COMPONENTS[slug];
  if (Component) {
    return <Component />;
  }

  const bit = getBit(slug);

  return (
    <StackPageShell title="Sikkerhet" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/sikkerhet" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Tilbake til sikkerhets-sporet
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
              Denne biten er ikke bygd ennå. SEC-01 er piloten — godkjenn stilen der først.
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
              Slug &quot;{slug}&quot; finnes ikke i sikkerhets-registeret.
            </p>
          </div>
        )}
      </article>
    </StackPageShell>
  );
}
