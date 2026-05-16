// Strong vs weak entities and identifying vs non-identifying relationships.
// In Chen notation, weak entities use a double rectangle and the identifying
// relationship uses a double diamond. In Crow's foot variants, the LINE itself
// is often solid (identifying) or dashed (non-identifying).

type Row = {
  label: string;
  strong: string;
  weak: string;
};

const ROWS: Row[] = [
  {
    label: "Eksistens",
    strong: "Kan eksistere uten andre tabeller",
    weak: "Kan ikke eksistere uten en eier-entitet",
  },
  {
    label: "Primærnøkkel (PK)",
    strong: "Egen, uavhengig PK (f.eks. kundeNr)",
    weak: "Sammensatt PK = (eier-FK, partiell nøkkel)",
  },
  {
    label: "Eksempel",
    strong: "KUNDE, PRODUKT, BIL",
    weak: "ORDRELINJE, ROM (i bygning), AVHENGIG (i ansatt)",
  },
  {
    label: "Notasjon — rektangel",
    strong: "Enkel ramme",
    weak: "Dobbel ramme",
  },
  {
    label: "Notasjon — linje",
    strong: "Stiplet linje (ikke-identifiserende)",
    weak: "Heltrukken linje (identifiserende)",
  },
  {
    label: "Mapping — FK",
    strong: "FK er en vanlig kolonne",
    weak: "FK er DEL av PK (sammensatt nøkkel)",
  },
  {
    label: "ON DELETE",
    strong: "RESTRICT er trygt — barn finnes uavhengig",
    weak: "CASCADE er typisk — barn skal forsvinne med eier",
  },
];

export function SterkSvakRelasjon() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        Sterke vs. svake forhold — heltrukken og stiplet linje
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Ikke alle entiteter er like uavhengige. En <em>svak entitet</em> finnes bare i
        kraft av en annen — som ORDRELINJE som ikke eksisterer uten en ORDRE. Det
        påvirker både diagrammet og DDL-en.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border mb-5">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-4 py-2 w-1/4"></th>
              <th className="text-left font-semibold px-4 py-2">Sterk entitet</th>
              <th className="text-left font-semibold px-4 py-2">Svak entitet</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-muted-foreground">{r.label}</td>
                <td className="px-4 py-3">{r.strong}</td>
                <td className="px-4 py-3">{r.weak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-success font-semibold mb-2">
            Sterk + ikke-identifiserende (stiplet)
          </div>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`KUNDE ----  ----  ORDRE
( - - - = stiplet linje )

KUNDE(kundeNr PK, navn)
ORDRE(ordreNr PK, kundeNr FK, dato)
              ^
              vanlig kolonne, kan være NULL`}</pre>
          <p className="mt-3 text-xs text-muted-foreground">
            ORDRE har egen unik <code>ordreNr</code>. <code>kundeNr</code> er en vanlig
            FK — kan i prinsippet være NULL (gjest-ordre, anonym kjøp).
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Svak + identifiserende (heltrukken)
          </div>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`ORDRE ————————— ORDRELINJE
( ——— = heltrukken linje )
              [[ORDRELINJE]]    -- dobbel ramme

ORDRE(ordreNr PK, dato)
ORDRELINJE(
  ordreNr FK NOT NULL,
  linjeNr,             -- partiell nøkkel
  prodNr FK,
  antall,
  PRIMARY KEY (ordreNr, linjeNr)
)`}</pre>
          <p className="mt-3 text-xs text-muted-foreground">
            <code>ordreNr</code> er BÅDE FK og DEL av PK. <code>linjeNr</code> er bare
            unikt innenfor én ordre. Slettes ordren, må linjene også slettes (ON DELETE
            CASCADE).
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
          Tre kjappe sjekkspørsmål
        </div>
        <ul className="space-y-1 text-foreground">
          <li>
            <strong>1.</strong> Kan barnet identifiseres uten eieren? Ja → sterk · Nei →
            svak.
          </li>
          <li>
            <strong>2.</strong> Er eier-FK DEL av barnets PK? Ja → identifiserende
            (heltrukken) · Nei → ikke-identifiserende (stiplet).
          </li>
          <li>
            <strong>3.</strong> Hvis du sletter eier — skal barna forsvinne? Ja → svak
            (CASCADE) · Nei → sterk (RESTRICT eller SET NULL).
          </li>
        </ul>
      </div>
    </section>
  );
}
