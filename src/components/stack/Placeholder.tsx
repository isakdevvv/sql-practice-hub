import { Link } from "@tanstack/react-router";

export function Placeholder({ title, group }: { title: string; group: "eksamen" | "stack" }) {
  const groupLabel = group === "eksamen" ? "Eksamensforberedelse" : "Hele stacken — kommer etter eksamen";
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
        {groupLabel}
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-muted-foreground">
        Denne siden er under arbeid. Kom tilbake snart.
      </p>
      <Link to="/stack" className="mt-6 inline-block text-sm text-brand hover:underline">
        ← Tilbake til Stack-oversikten
      </Link>
    </div>
  );
}
