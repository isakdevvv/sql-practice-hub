type Rule = {
  er: string;
  becomes: string;
};

const RULES: Rule[] = [
  {
    er: "Entitet (rektangel)",
    becomes: "Egen tabell. Primærnøkkel = identifikator-attributt.",
  },
  {
    er: "Attributt",
    becomes:
      "Kolonne i tabellen. Sammensatt attributt → flere kolonner. Flerverdi → egen tabell.",
  },
  {
    er: "1 : N relasjon",
    becomes: "Fremmednøkkel på mange-siden.",
  },
  {
    er: "1 : 1 relasjon",
    becomes: "FK på én av sidene + UNIQUE; eller slå sammen til én tabell.",
  },
  {
    er: "M : N relasjon",
    becomes:
      "Egen koblingstabell med (FK_a, FK_b) som sammensatt PK. Eventuelle relasjons-attributter legges her.",
  },
  {
    er: "Svak entitet",
    becomes: "Tabell med PK = (FK til eier, eget delvis ID). Total deltakelse mot eier.",
  },
  {
    er: "Total deltakelse (heltrukken/«|» innerst)",
    becomes: "NOT NULL på FK.",
  },
  {
    er: "Valgfri deltakelse («O» innerst)",
    becomes: "FK kan være NULL.",
  },
];

export function MappingRulesTable() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">Mapping-regler — fra ER til tabeller</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Cheat sheet for å oversette hver ER-konstruksjon til SQL.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-4 py-2 w-1/3">ER-konstruksjon</th>
              <th className="text-left font-semibold px-4 py-2">Bli til i tabellene</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((r) => (
              <tr key={r.er} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.er}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.becomes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
