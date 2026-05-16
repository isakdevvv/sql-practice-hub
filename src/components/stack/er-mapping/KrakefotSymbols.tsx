type SymbolRow = {
  symbol: string;
  betyr: string;
  eksempel: string;
};

const SYMBOLS: SymbolRow[] = [
  {
    symbol: "||",
    betyr: "Nøyaktig én (1..1, obligatorisk)",
    eksempel: "«Hver bestilling har én og bare én kunde»",
  },
  {
    symbol: "O|",
    betyr: "Null eller én (0..1, valgfri)",
    eksempel: "«En ansatt kan ha én partner (eller ingen)»",
  },
  {
    symbol: "|<",
    betyr: "Én eller flere (1..N, obligatorisk mange)",
    eksempel: "«En faktura har minst én linje»",
  },
  {
    symbol: "O<",
    betyr: "Null eller flere (0..N, valgfri mange)",
    eksempel: "«En kunde kan ha 0..N bestillinger»",
  },
];

export function KrakefotSymbols() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">Krakefot-symbolene</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Hver ende av linjen mellom to entiteter har to symboler:{" "}
        <strong className="text-foreground">indre symbol = minimum</strong>,{" "}
        <strong className="text-foreground">ytre symbol = maksimum</strong>.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-4 py-2 w-24">Symbol</th>
              <th className="text-left font-semibold px-4 py-2">Betyr</th>
              <th className="text-left font-semibold px-4 py-2 hidden sm:table-cell">
                Eksempel
              </th>
            </tr>
          </thead>
          <tbody>
            {SYMBOLS.map((s) => (
              <tr key={s.symbol} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-base text-brand">{s.symbol}</td>
                <td className="px-4 py-3">{s.betyr}</td>
                <td className="px-4 py-3 text-muted-foreground italic hidden sm:table-cell">
                  {s.eksempel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
          Hvordan lese symbolene
        </div>
        <p className="text-foreground">
          Symbolet nær den <em>andre</em> entiteten forteller hvor mange av denne
          entiteten som hører til <em>én</em> av den andre. Les alltid «hvor mange B per
          A» ved siden av A.
        </p>
      </div>
    </section>
  );
}
