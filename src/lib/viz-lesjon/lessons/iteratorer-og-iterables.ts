import type {
  Example,
  HeapBlock,
  IterStep,
  Lesson,
  LogEntry,
  PrimitiveVal,
} from "../types";

/* ----------------------------- små hjelpere ------------------------------ */

const S = (v: string): PrimitiveVal => ({ kind: "str", value: v });
const I = (v: number): PrimitiveVal => ({ kind: "int", value: v });
const REF = (label: string, refId: string): PrimitiveVal => ({
  kind: "ref",
  label,
  refId,
});

function listIterable(items: PrimitiveVal[]): HeapBlock {
  return { kind: "iterable", refId: "L1", label: "list", items };
}

function iterFrom(
  cursor: number | "done",
  label = "list_iterator",
): HeapBlock {
  return {
    kind: "iterator",
    refId: "I1",
    label,
    overRefId: "L1",
    cursor,
  };
}

/* =============================================================== */
/* Example 1: implicit for-loop                                    */
/* =============================================================== */

const ex1Code = `boker = ["Python", "Algo", "ML"]
for b in boker:
    print(b)
`;

const ex1Items = [S("Python"), S("Algo"), S("ML")];

// Hjelper for ex1 — alle steg deler samme iterable.
function ex1Step(
  line: number,
  narration: string,
  vars: { boker?: boolean; b?: string },
  iter: { cursor: number | "done" } | null,
  log: LogEntry[],
): IterStep {
  const heap: HeapBlock[] = [listIterable(ex1Items)];
  if (iter) heap.push(iterFrom(iter.cursor));
  const v: { name: string; value: PrimitiveVal }[] = [];
  if (vars.boker) v.push({ name: "boker", value: REF("list", "L1") });
  if (vars.b !== undefined) v.push({ name: "b", value: S(vars.b) });
  return {
    line,
    narration,
    vars: v,
    heap,
    log,
    highlight: iter ? "cursor" : "none",
  };
}

const ex1Log: LogEntry[] = [];
function pushLog(...entries: LogEntry[]): LogEntry[] {
  ex1Log.push(...entries);
  return [...ex1Log];
}

const example1: Example = {
  title: "1 · «for x in xs» — hva skjer egentlig?",
  intro:
    "En for-løkke ser enkel ut, men under panseret kaller Python iter() og next() for deg. Følg cursoren mens den glir over listen.",
  viz: "iterator",
  code: ex1Code,
  steps: [
    ex1Step(
      1,
      "Listen opprettes. Dette er iterablen — selve datastrukturen vi skal gå gjennom. Foreløpig ingen iterator.",
      { boker: true },
      null,
      [],
    ),
    ex1Step(
      2,
      "for-løkken starter. Python kaller iter(boker) bak kulissene og lager et list_iterator-objekt. Cursoren peker på [0] — det er det neste next() vil returnere.",
      { boker: true },
      { cursor: 0 },
      pushLog({ kind: "call", text: "iter(boker) → <list_iterator id=I1>" }),
    ),
    ex1Step(
      2,
      "next(iterator) returnerer 'Python'. b bindes til verdien, og cursoren rykker frem til [1].",
      { boker: true, b: "Python" },
      { cursor: 1 },
      pushLog({ kind: "return", text: "next(it) → 'Python'  (b = 'Python')" }),
    ),
    ex1Step(
      3,
      "print(b) skriver ut 'Python'.",
      { boker: true, b: "Python" },
      { cursor: 1 },
      pushLog({ kind: "print", text: "Python" }),
    ),
    ex1Step(
      2,
      "Tilbake til toppen av løkken. next() returnerer 'Algo', cursor → [2].",
      { boker: true, b: "Algo" },
      { cursor: 2 },
      pushLog({ kind: "return", text: "next(it) → 'Algo'   (b = 'Algo')" }),
    ),
    ex1Step(
      3,
      "print(b) skriver ut 'Algo'.",
      { boker: true, b: "Algo" },
      { cursor: 2 },
      pushLog({ kind: "print", text: "Algo" }),
    ),
    ex1Step(
      2,
      "Siste runde: next() returnerer 'ML', cursoren rykker forbi siste indeks.",
      { boker: true, b: "ML" },
      { cursor: 3 },
      pushLog({ kind: "return", text: "next(it) → 'ML'    (b = 'ML')" }),
    ),
    ex1Step(
      3,
      "print(b) skriver ut 'ML'.",
      { boker: true, b: "ML" },
      { cursor: 3 },
      pushLog({ kind: "print", text: "ML" }),
    ),
    ex1Step(
      2,
      "for-løkken prøver next() én gang til. Cursoren er forbi listen → iteratoren reiser StopIteration. for-løkken fanger den og avslutter løkken stille.",
      { boker: true, b: "ML" },
      { cursor: "done" },
      pushLog(
        { kind: "call", text: "next(it)" },
        { kind: "raise", text: "StopIteration  (for-løkken fanger og avslutter)" },
      ),
    ),
  ],
  outro:
    "Konklusjon: «for x in xs» er sukker for «it = iter(xs); while True: x = next(it); ... except StopIteration: break». Iterablen lever videre; det er iteratoren som er oppbrukt.",
};

/* =============================================================== */
/* Example 2: explicit iter() + next()                              */
/* =============================================================== */

const ex2Code = `boker = ["Python", "Algo", "ML"]
it = iter(boker)
print(next(it))
print(next(it))
print(next(it))
print(next(it))   # ← reiser StopIteration
`;

const ex2Items = [S("Python"), S("Algo"), S("ML")];

function ex2Step(
  line: number,
  narration: string,
  varsBoker: boolean,
  it: { cursor: number | "done" } | null,
  log: LogEntry[],
): IterStep {
  const heap: HeapBlock[] = [
    { kind: "iterable", refId: "L1", label: "list", items: ex2Items },
  ];
  if (it) heap.push(iterFrom(it.cursor));
  const v: { name: string; value: PrimitiveVal }[] = [];
  if (varsBoker) v.push({ name: "boker", value: REF("list", "L1") });
  if (it) v.push({ name: "it", value: REF("list_iterator", "I1") });
  return {
    line,
    narration,
    vars: v,
    heap,
    log,
    highlight: it ? "cursor" : "none",
  };
}

const ex2Log: LogEntry[] = [];
function pushEx2(...entries: LogEntry[]): LogEntry[] {
  ex2Log.push(...entries);
  return [...ex2Log];
}

const example2: Example = {
  title: "2 · Manuelt: iter(), next(), StopIteration",
  intro:
    "Samme forløp som over, men nå skriver vi iter() og next() selv. Da blir det også synlig at iteratoren faktisk reiser en exception når den er tom.",
  viz: "iterator",
  code: ex2Code,
  steps: [
    ex2Step(1, "Lager iterablen — list med tre strenger.", true, null, []),
    ex2Step(
      2,
      "iter(boker) returnerer et list_iterator-objekt. Vi lagrer det i variabelen it. Iteratoren har sin egen cursor (starter på [0]) — uavhengig av listen.",
      true,
      { cursor: 0 },
      pushEx2({ kind: "call", text: "iter(boker) → <list_iterator id=I1>" }),
    ),
    ex2Step(
      3,
      "next(it) returnerer 'Python'. Cursoren rykker til [1]. print skriver ut verdien.",
      true,
      { cursor: 1 },
      pushEx2(
        { kind: "return", text: "next(it) → 'Python'" },
        { kind: "print", text: "Python" },
      ),
    ),
    ex2Step(
      4,
      "next(it) returnerer 'Algo'. Cursor → [2].",
      true,
      { cursor: 2 },
      pushEx2(
        { kind: "return", text: "next(it) → 'Algo'" },
        { kind: "print", text: "Algo" },
      ),
    ),
    ex2Step(
      5,
      "next(it) returnerer 'ML'. Cursoren glir forbi siste indeks. Iteratoren er nå tømt — selv om listen fortsatt har alle elementene sine.",
      true,
      { cursor: 3 },
      pushEx2(
        { kind: "return", text: "next(it) → 'ML'" },
        { kind: "print", text: "ML" },
      ),
    ),
    ex2Step(
      6,
      "next(it) kalles på et tomt iterator-objekt. Den reiser StopIteration. Siden ingen for-løkke fanger den, krasjer programmet her.",
      true,
      { cursor: "done" },
      pushEx2(
        { kind: "call", text: "next(it)" },
        { kind: "raise", text: "Traceback: StopIteration" },
      ),
    ),
  ],
  outro:
    "Viktig: list-iteratorer er én-veis og kan ikke spoles tilbake. Trenger du å iterere på nytt, må du kalle iter(boker) en gang til og få et helt nytt iterator-objekt.",
};

/* =============================================================== */
/* Example 3: egen klasse med __iter__ / __next__                   */
/* =============================================================== */

const ex3Code = `class Telleren:
    def __init__(self, n):
        self._n = n

    def __iter__(self):
        self._i = 0
        return self

    def __next__(self):
        if self._i >= self._n:
            raise StopIteration
        v = self._i
        self._i += 1
        return v

for x in Telleren(3):
    print(x)
`;

const ex3Items = [I(0), I(1), I(2)];

function ex3Step(opts: {
  line: number;
  narration: string;
  showInstance?: boolean;
  internal_i?: number | null; // self._i
  cursor: number | "done" | null;
  x?: number;
  log: LogEntry[];
}): IterStep {
  const heap: HeapBlock[] = [
    {
      kind: "iterable",
      refId: "L1",
      label: "Telleren (yielder)",
      items: ex3Items,
    },
  ];
  if (opts.showInstance) {
    heap.push({
      kind: "iterator",
      refId: "I1",
      label: "Telleren",
      overRefId: "L1",
      cursor: opts.cursor ?? 0,
      attrs: [
        { name: "_n", value: I(3) },
        ...(opts.internal_i != null
          ? [{ name: "_i", value: I(opts.internal_i) }]
          : []),
      ],
    });
  }
  const v: { name: string; value: PrimitiveVal }[] = [];
  if (opts.x !== undefined) v.push({ name: "x", value: I(opts.x) });
  return {
    line: opts.line,
    narration: opts.narration,
    vars: v,
    heap,
    log: opts.log,
    highlight: opts.showInstance ? "cursor" : "none",
  };
}

const ex3Log: LogEntry[] = [];
function pushEx3(...entries: LogEntry[]): LogEntry[] {
  ex3Log.push(...entries);
  return [...ex3Log];
}

const example3: Example = {
  title: "3 · Egen klasse: __iter__ og __next__",
  intro:
    "Vil du lage noe iterabelt selv? Implementer __iter__ (returner en iterator) og __next__ (returner neste verdi eller reis StopIteration). Iteratorens interne state ligger på selve objektet.",
  viz: "iterator",
  code: ex3Code,
  steps: [
    ex3Step({
      line: 13,
      narration:
        "Telleren(3) opprettes — __init__ kjøres, self._n = 3. Foreløpig er det bare iterablen; ingen iterator ennå.",
      showInstance: true,
      internal_i: null,
      cursor: null,
      log: pushEx3({ kind: "call", text: "Telleren(3).__init__()" }),
    }),
    ex3Step({
      line: 5,
      narration:
        "for-løkken kaller iter(Telleren(3)). __iter__ setter self._i = 0 og returnerer self. Telleren-instansen er nå BÅDE iterable og iterator — cursoren starter på [0].",
      showInstance: true,
      internal_i: 0,
      cursor: 0,
      log: pushEx3({ kind: "call", text: "__iter__()  → self  (self._i = 0)" }),
    }),
    ex3Step({
      line: 9,
      narration:
        "next() kalles → __next__ kjøres. self._i (0) er mindre enn self._n (3), så den returnerer v=0 og inkrementerer self._i til 1.",
      showInstance: true,
      internal_i: 1,
      cursor: 1,
      x: 0,
      log: pushEx3(
        { kind: "return", text: "__next__() → 0   (self._i: 0 → 1)" },
      ),
    }),
    ex3Step({
      line: 14,
      narration: "print(x) skriver ut 0.",
      showInstance: true,
      internal_i: 1,
      cursor: 1,
      x: 0,
      log: pushEx3({ kind: "print", text: "0" }),
    }),
    ex3Step({
      line: 9,
      narration:
        "Ny iterasjon. __next__ ser self._i=1 < 3, returnerer 1, øker _i til 2.",
      showInstance: true,
      internal_i: 2,
      cursor: 2,
      x: 1,
      log: pushEx3({ kind: "return", text: "__next__() → 1   (self._i: 1 → 2)" }),
    }),
    ex3Step({
      line: 14,
      narration: "print(x) skriver ut 1.",
      showInstance: true,
      internal_i: 2,
      cursor: 2,
      x: 1,
      log: pushEx3({ kind: "print", text: "1" }),
    }),
    ex3Step({
      line: 9,
      narration:
        "Siste verdi: __next__ returnerer 2, _i blir 3 — like stor som _n.",
      showInstance: true,
      internal_i: 3,
      cursor: 3,
      x: 2,
      log: pushEx3({ kind: "return", text: "__next__() → 2   (self._i: 2 → 3)" }),
    }),
    ex3Step({
      line: 14,
      narration: "print(x) skriver ut 2.",
      showInstance: true,
      internal_i: 3,
      cursor: 3,
      x: 2,
      log: pushEx3({ kind: "print", text: "2" }),
    }),
    ex3Step({
      line: 8,
      narration:
        "for-løkken ber om neste verdi. __next__ ser self._i (3) ≥ self._n (3) og reiser StopIteration. for-løkken fanger den og avslutter.",
      showInstance: true,
      internal_i: 3,
      cursor: "done",
      log: pushEx3(
        { kind: "call", text: "__next__()" },
        { kind: "raise", text: "StopIteration  (self._i ≥ self._n)" },
      ),
    }),
  ],
  outro:
    "Sluttsetningen: en iterable er bare et objekt med __iter__. En iterator er et objekt med __next__ (og som regel et __iter__ som returnerer seg selv). Her var de samme objekt — som ofte er en feilkilde, fordi to nestede for-løkker da deler cursor.",
};

/* =============================================================== */
/* Example 4: generator with yield                                  */
/* =============================================================== */

const ex4Code = `def telleren(n):
    i = 0
    while i < n:
        yield i
        i += 1

for x in telleren(3):
    print(x)
`;

const ex4Items = [I(0), I(1), I(2)];

function ex4Step(opts: {
  line: number;
  narration: string;
  pausedAt?: number | null;
  internal_i?: number;
  cursor: number | "done" | null;
  yielded: number[];
  x?: number;
  log: LogEntry[];
}): IterStep {
  const heap: HeapBlock[] = [
    {
      kind: "iterable",
      refId: "L1",
      label: "telleren-generator (yielder)",
      items: ex4Items,
    },
  ];
  heap.push({
    kind: "generator",
    refId: "G1",
    label: "telleren",
    pausedAt: opts.pausedAt ?? undefined,
    yielded: opts.yielded.map((v) => I(v)),
    attrs:
      opts.internal_i !== undefined
        ? [
            { name: "n", value: I(3) },
            { name: "i", value: I(opts.internal_i) },
          ]
        : [{ name: "n", value: I(3) }],
  });
  // generator har ikke "cursor" på samme måten — vi viser cursor på den
  // virtuelle iterablen for å fortsette samme didaktiske bilde.
  // Hijack iter-card ikke nødvendig; vi setter cursor på iterable-raden
  // via en hjelpe-iterator UTEN attr.
  if (opts.cursor !== null) {
    heap.push({
      kind: "iterator",
      refId: "I1",
      label: "for-loopens internal iter",
      overRefId: "L1",
      cursor: opts.cursor,
    });
  }
  // For å unngå å vise to "iterator/generator"-kort: visualiseringen
  // velger første av (iterator|generator). Vi vil at generator skal
  // vises — så vi fjerner placeholder-iteratoren igjen (den var bare
  // for cursor-state). Putt cursor inn i en egen variant: la oss heller
  // ikke pushe den, og i stedet tegne cursor på iterable basert på...
  // (visualiseringen kjenner ikke til generator-cursor — så ja, vi
  // beholder den lille iteratoren, men sørger for at GENERATOREN
  // kommer FØR den i heap-arrayen.)
  // (Heap rekkefølge: iterable, GENERATOR, iterator-placeholder.)
  const v: { name: string; value: PrimitiveVal }[] = [];
  if (opts.x !== undefined) v.push({ name: "x", value: I(opts.x) });
  return {
    line: opts.line,
    narration: opts.narration,
    vars: v,
    heap,
    log: opts.log,
    highlight: "cursor",
  };
}

const ex4Log: LogEntry[] = [];
function pushEx4(...entries: LogEntry[]): LogEntry[] {
  ex4Log.push(...entries);
  return [...ex4Log];
}

const example4: Example = {
  title: "4 · Generatorer: yield pauser funksjonen",
  intro:
    "En generator er en funksjon som inneholder yield. Å kalle den kjører IKKE funksjonen — den lager bare et generator-objekt. Hver next() fortsetter helt til neste yield, og pauser der.",
  viz: "iterator",
  code: ex4Code,
  steps: [
    ex4Step({
      line: 7,
      narration:
        "telleren(3) kalles, men funksjonskroppen kjører IKKE. Du får et generator-objekt tilbake, klar til å starte. Ingen kode i telleren har kjørt enda.",
      pausedAt: null,
      cursor: null,
      yielded: [],
      log: pushEx4({
        kind: "call",
        text: "telleren(3)  → <generator id=G1>  (kropp ikke kjørt enda)",
      }),
    }),
    ex4Step({
      line: 4,
      narration:
        "Første next(): kroppen kjøres fra toppen. i=0 settes, while-betingelsen er sann, yield i sender ut 0 og pauser. Cursor → [0]. x = 0.",
      pausedAt: 4,
      internal_i: 0,
      cursor: 1,
      yielded: [0],
      x: 0,
      log: pushEx4({
        kind: "return",
        text: "next(gen)  → yield 0   (pauser på linje 4)",
      }),
    }),
    ex4Step({
      line: 8,
      narration: "print(x) skriver 0.",
      pausedAt: 4,
      internal_i: 0,
      cursor: 1,
      yielded: [0],
      x: 0,
      log: pushEx4({ kind: "print", text: "0" }),
    }),
    ex4Step({
      line: 4,
      narration:
        "Andre next(): kjøringen fortsetter ETTER yield. i += 1 (=1), while sjekker 1<3 ja, yield 1, pauser igjen. x = 1.",
      pausedAt: 4,
      internal_i: 1,
      cursor: 2,
      yielded: [0, 1],
      x: 1,
      log: pushEx4({
        kind: "return",
        text: "next(gen)  → yield 1   (i: 0→1)",
      }),
    }),
    ex4Step({
      line: 8,
      narration: "print(x) skriver 1.",
      pausedAt: 4,
      internal_i: 1,
      cursor: 2,
      yielded: [0, 1],
      x: 1,
      log: pushEx4({ kind: "print", text: "1" }),
    }),
    ex4Step({
      line: 4,
      narration:
        "Tredje next(): i blir 2, 2<3 ja, yield 2, pauser. x = 2.",
      pausedAt: 4,
      internal_i: 2,
      cursor: 3,
      yielded: [0, 1, 2],
      x: 2,
      log: pushEx4({
        kind: "return",
        text: "next(gen)  → yield 2   (i: 1→2)",
      }),
    }),
    ex4Step({
      line: 8,
      narration: "print(x) skriver 2.",
      pausedAt: 4,
      internal_i: 2,
      cursor: 3,
      yielded: [0, 1, 2],
      x: 2,
      log: pushEx4({ kind: "print", text: "2" }),
    }),
    ex4Step({
      line: 3,
      narration:
        "Fjerde next(): kjøringen fortsetter, i blir 3, while-betingelsen 3<3 er falsk. Funksjonen faller av slutten → generatoren reiser StopIteration. for-løkken avslutter.",
      pausedAt: 3,
      internal_i: 3,
      cursor: "done",
      yielded: [0, 1, 2],
      log: pushEx4(
        { kind: "call", text: "next(gen)" },
        { kind: "raise", text: "StopIteration  (while-betingelsen falsk)" },
      ),
    }),
  ],
  outro:
    "Sammenlign med eksempel 3: generatoren er DRAMATISK mindre kode for samme resultat. Lokal state (i) overlever pauser fordi Python lagrer hele stack-rammen i generator-objektet. Det er derfor generatorer ofte er det rette valget når du «produserer en sekvens».",
};

/* =============================================================== */
/* Lesjonen                                                         */
/* =============================================================== */

export const lesson: Lesson = {
  slug: "iteratorer-og-iterables",
  title: "Iteratorer og iterables — hvordan «for x in xs» faktisk virker",
  blurb:
    "Spill av eksemplene og se cursoren gli over listen mens minnet endrer seg. Fire økende dybder: for-løkken utfoldet, manuell iter/next, egen klasse, generator.",
  estMinutes: 12,
  sections: [
    {
      kind: "prose",
      html: `
        <p>
          To begreper som ofte blandes:
        </p>
        <ul>
          <li><b>Iterable</b> — et objekt du <i>kan</i> iterere over (har <code>__iter__</code>). Lister, strenger, dict-er, filer, ranges …</li>
          <li><b>Iterator</b> — et engangsobjekt som faktisk husker hvor langt du har kommet (har <code>__next__</code>). Hver <code>next()</code> returnerer neste verdi eller reiser <code>StopIteration</code>.</li>
        </ul>
        <p>
          En for-løkke kaller <code>iter()</code> én gang for å lage en iterator, og deretter <code>next()</code> gjentatte ganger til <code>StopIteration</code>. Det er hele mekanismen — la oss se den.
        </p>
      `,
    },
    { kind: "example", example: example1 },
    {
      kind: "checkpoint",
      question:
        "Hva skjer hvis du kjører «for x in it» to ganger på samme iterator-objekt it (uten å lage en ny)?",
      options: [
        "Begge løkker går gjennom alle elementene — Python spoler tilbake.",
        "Første løkke kjører normalt. Andre løkke kjører ikke (iteratoren er tømt) — løkken hopper bare over.",
        "Andre løkke kaster en feilmelding fordi iteratoren ikke kan brukes to ganger.",
      ],
      correctIdx: 1,
      explanation:
        "Iteratorer er én-veis. Etter første gjennomløp er cursor på «done», og for-løkken får StopIteration umiddelbart — løkken er tom, men det er ikke en feil.",
    },
    { kind: "example", example: example2 },
    {
      kind: "checkpoint",
      question:
        "Hva er forskjellen mellom listen [1,2,3] og iter([1,2,3])?",
      options: [
        "Ingen — de er ekvivalente objekter.",
        "Listen er iterable og kan iterereres mange ganger; iter()-resultatet er en iterator som kun kan brukes én gang.",
        "iter() returnerer en kopi av listen.",
      ],
      correctIdx: 1,
      explanation:
        "Hver gang du kaller iter(liste) får du en fersk iterator med cursor på 0 — selve listen er uendret og kan iterereres så mange ganger du vil.",
    },
    { kind: "example", example: example3 },
    { kind: "example", example: example4 },
    {
      kind: "prose",
      html: `
        <h3 class="text-base font-semibold mt-6 mb-2">Oppsummert</h3>
        <ul>
          <li><b>Iterable</b> = objekt med <code>__iter__</code>. <b>Iterator</b> = objekt med <code>__next__</code> (+ et <code>__iter__</code> som returnerer seg selv).</li>
          <li><b>for x in xs</b> = <code>it = iter(xs); while True: try: x = next(it); ... except StopIteration: break</code>.</li>
          <li>Iteratoren har sin egen state (cursor). Listen er uendret etter en for-løkke.</li>
          <li>Generatorer er den korteste veien til en egen iterator. <code>yield</code> pauser funksjonen.</li>
        </ul>
      `,
    },
  ],
};
