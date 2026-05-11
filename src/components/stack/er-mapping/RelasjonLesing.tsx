// Worked-example reader for crow's-foot relationships. Reading the symbols
// is the part that trips students up the most — this section walks through
// it left-to-right and right-to-left on a concrete example.

type Example = {
  diagram: string;
  leftRight: string;
  rightLeft: string;
  result: string;
};

const EXAMPLES: Example[] = [
  {
    diagram: "KUNDE ||——O< BESTILLING",
    leftRight: "«For én KUNDE — hvor mange BESTILLING?» Se på symbolene NÆR BESTILLING: «O<» = 0..N. → Én kunde har 0..N bestillinger.",
    rightLeft: "«For én BESTILLING — hvor mange KUNDE?» Se på symbolene NÆR KUNDE: «||» = nøyaktig én. → Én bestilling har akkurat 1 kunde.",
    result: "Klassisk 1:N. FK kunde_id i Bestilling, NOT NULL.",
  },
  {
    diagram: "BESTILLING ||——|< ORDRELINJE",
    leftRight: "Nær ORDRELINJE: «|<» = 1..N. → Én bestilling MÅ ha minst én linje.",
    rightLeft: "Nær BESTILLING: «||» = nøyaktig én. → Én ordrelinje hører til akkurat én bestilling.",
    result: "1:N med total deltakelse på linje-siden. FK bestilling_id NOT NULL. Forretningsregel «minst én linje» må håndteres i applikasjonen (DDL alene klarer det ikke).",
  },
  {
    diagram: "STUDENT >O——O< FAG",
    leftRight: "Nær FAG: «O<» = 0..N. → Én student kan ta 0..N fag.",
    rightLeft: "Nær STUDENT: «O<» = 0..N. → Ett fag kan ha 0..N studenter.",
    result: "M:N — koblingstabell Tar(sid, fkode) med PK=(sid, fkode) og to FK-er. Eventuelle relasjons-attributter (f.eks. karakter, semester) bor i Tar — ikke i Student eller Fag.",
  },
];

export function RelasjonLesing() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">Hvordan lese et forhold — to spørsmål</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Hver relasjonslinje stiller deg det samme spørsmålet to ganger — én gang i hver
        retning. Lær deg formelen, så er resten gjenkjenning.
      </p>

      <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 mb-4">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
          Leseregelen
        </div>
        <ol className="space-y-1.5 text-sm">
          <li>
            <strong>1.</strong> Pek på den ene entiteten — kall den A.
          </li>
          <li>
            <strong>2.</strong> Spør «for én A, hvor mange B?» — og les av symbolene som
            står NÆR B.
          </li>
          <li>
            <strong>3.</strong> Snu spørsmålet: «for én B, hvor mange A?» — og les
            symbolene NÆR A.
          </li>
          <li>
            <strong>4.</strong> Indre symbol = minimum (<code>|</code> = 1,{" "}
            <code>O</code> = 0). Ytre symbol = maksimum (<code>|</code> = 1,{" "}
            <code>&lt;</code> = mange).
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Det ulogiske: symbolene <em>nær</em> en entitet beskriver hvor mange av den
          entiteten det er per én av den andre. Tenk på det som «hvor mange møter du på
          den siden når du går linjen fra A mot B».
        </p>
      </div>

      <div className="space-y-4">
        {EXAMPLES.map((ex, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="font-mono text-base text-foreground mb-3">{ex.diagram}</div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-brand font-semibold shrink-0">→</span>
                <span>{ex.leftRight}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-brand font-semibold shrink-0">←</span>
                <span>{ex.rightLeft}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-muted-foreground">
                <span className="font-semibold text-foreground">Konklusjon:</span>{" "}
                {ex.result}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
          Tre kjappe huskeregler for «forhold»
        </div>
        <ul className="space-y-1 text-foreground">
          <li>
            • <strong>1:1</strong> — ytre symbol er <code>|</code> på BEGGE sider. Ingen
            kråkefot.
          </li>
          <li>
            • <strong>1:N</strong> — ytre <code>&lt;</code> på én side, <code>|</code> på
            den andre.
          </li>
          <li>
            • <strong>M:N</strong> — ytre <code>&lt;</code> (kråkefot) på BEGGE sider →
            koblingstabell.
          </li>
        </ul>
      </div>
    </section>
  );
}
