export interface AggregateRow {
  fn: string;
  desc: string;
}

export function AggregateTable({ rows }: { rows: AggregateRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-card/60">
          <tr className="text-left">
            <th className="px-3 py-2 font-semibold text-foreground border-b border-border w-1/3">
              Funksjon
            </th>
            <th className="px-3 py-2 font-semibold text-foreground border-b border-border">
              Hva den gjør
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="px-3 py-2 align-top">
                <code className="font-mono text-[12.5px] text-pink-700 dark:text-pink-400">
                  {r.fn}
                </code>
              </td>
              <td className="px-3 py-2 align-top text-foreground/80">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
