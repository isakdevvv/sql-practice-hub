import { ExternalLink, BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { MediaEmbed } from "@/components/stack/MediaEmbed";
import { BOOKS, LESEORDEN_FOR_BACHELOR, type Book } from "./books";

const STEPS = [
  { title: "Hvordan jeg har valgt", anchor: "metode" },
  { title: "De 20 bøkene", anchor: "boker" },
  { title: "Lese-rekkefølge for bachelor (3 år)", anchor: "rekkefolge" },
  { title: "Bok per fag — quick-ref", anchor: "per-fag" },
];

const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: "border-brand/40 bg-brand/5",
  2: "border-success/40 bg-success/5",
  3: "border-muted bg-muted/30",
};
const TIER_LABEL: Record<1 | 2 | 3, string> = {
  1: "Må ha",
  2: "Sterk anbefaling",
  3: "Bonus",
};

export function ProgrammeringsbokerPage() {
  return (
    <StackPageShell title="Programmeringsbøker — kuratert for DTE-bachelor" group="stack">
      <article className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Bibliotek · 20 bøker som dekker hele DTE-pensumet
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            20 bøker en data-ingeniør faktisk trenger
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Ikke "topp 10 most-cited" eller "alle pensum-bøker på UiT". Dette er bøker valgt fordi
            DE ER BEST på sitt område — boka som forklarer det best, som har de mest minneverdige
            metaforene, som faktisk leser seg som et menneske skrev den. 9 av dem er gratis online.
          </p>
        </header>

        <CourseOutline courseId="programmeringsboker" steps={STEPS} />

        <section id="metode" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hvordan jeg har valgt</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <Rule
              ok
              label="Ett tema, én vinner."
              text="Jeg har ikke valgt 'topp 3 OS-bøker' og lest et destillat. Hver bok er den jeg ville sendt en venn alene."
            />
            <Rule
              ok
              label="Pedagogikk over fullstendighet."
              text="Petzold dekker mindre enn Patterson & Hennessy, men forklarer det han dekker uendelig bedre. Den vinner."
            />
            <Rule
              ok
              label="Metaforer som henger."
              text="'Bibliotek som logg' (Kleppmann), 'trucks on highways' (Kurose), 'rational agent' (AIMA) — disse blir mentale verktøy du bruker i 20 år."
            />
            <Rule
              warn
              label="Det er IKKE pensum-erstatninger."
              text="Foreleser-pensum + disse bøkene = best resultat. Ikke disse bøkene alene før eksamen."
            />
            <Rule
              warn
              label="Dette er ikke 'alle bøker'."
              text="Algoritmer-/CLRS-tier mangler bevisst — vi har eksisterende stack-sider for det. Sikkerhet (Schneier) og kompilatorer (dragon book) er heller ikke med — for dypt for bachelor."
            />
          </div>
        </section>

        <section id="boker" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">De 20 bøkene</h2>
          <div className="space-y-4">
            {BOOKS.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>

        <section id="rekkefolge" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Lese-rekkefølge — 3-års-plan for DTE-bachelor</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Når du leser en bok i ROEN av et semester FØR emnet starter, halverer du tiden
            eksamens-pugging tar. Her er rekkefølgen som matcher DTE-bachelorforløpet:
          </p>
          <ol className="space-y-2">
            {LESEORDEN_FOR_BACHELOR.map((item, i) => {
              const book = BOOKS.find((b) => b.id === item.bok);
              if (!book) return null;
              return (
                <li
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 flex items-start gap-3"
                >
                  <div className="text-xs font-mono bg-brand/10 text-brand rounded px-2 py-1 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {item.semester}
                    </div>
                    <div className="text-sm font-semibold mt-0.5">{book.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.why}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="per-fag" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Bok per fag — quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Fag</th>
                  <th className="text-left font-semibold px-4 py-2">Primærbok</th>
                  <th className="text-left font-semibold px-4 py-2">Komplement</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <FagRow fag="Trinn 1-9 (CPU/minne)" primary="Code (Petzold)" extra="—" />
                <FagRow fag="DTE-2505 OS" primary="OSTEP" extra="Petzold for hardware-grunnlag" />
                <FagRow
                  fag="DTE-2507 Datakomm"
                  primary="Kurose & Ross"
                  extra="(vi har full integrasjon — se /spor)"
                />
                <FagRow fag="DTE-2509 Databaser" primary="Pensumbok + DDIA" extra="DDIA for industri-perspektiv" />
                <FagRow fag="DTE-2501 AI Methods" primary="AIMA" extra="3Blue1Brown for intuisjon" />
                <FagRow fag="DTE-2602 ML intro" primary="Géron" extra="ISLR for statistisk dybde" />
                <FagRow fag="DTE-2502 Deep Learning" primary="Nielsen NNDL" extra="Goodfellow for dybde senere" />
                <FagRow fag="TEK-1501 Statistikk" primary="MML kap 6 + ISLR kap 2-5" extra="—" />
                <FagRow fag="DTE-2511 Vid. prog." primary="Pragmatic Programmer" extra="Refactoring (Fowler) + Crafting Interpreters" />
                <FagRow fag="DTE-2604 Systemutvikling" primary="DDIA + Pragmatic" extra="Database Internals (Petrov)" />
                <FagRow fag="Algoritmer og datastrukturer" primary="Grokking Algorithms" extra="CLRS for dybde" />
                <FagRow fag="MLOps / produksjon-ML" primary="Designing ML Systems (Huyen)" extra="Etter Géron" />
                <FagRow fag="Bygge ditt eget språk (sommer-prosjekt)" primary="Crafting Interpreters" extra="—" />
                <FagRow fag="Web-perf / HTTP/2/3 / QUIC" primary="High Performance Browser Networking (Grigorik)" extra="Etter Kurose" />
                <FagRow fag="DevOps / produksjon-drift" primary="Site Reliability Engineering (Google)" extra="Pragmatic for individ-perspektiv" />
                <FagRow fag="Deep Learning matematisk fundament" primary="Goodfellow et al" extra="Etter Nielsen NNDL" />
                <FagRow fag="Reinforcement Learning" primary="Sutton & Barto" extra="AIMA gir kort intro" />
                <FagRow fag="Idiomatisk Python" primary="Fluent Python (Ramalho)" extra="Etter du har skrevet 5000+ linjer" />
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div>
              <strong>Et siste råd:</strong> Ikke kjøp alle 5 betalbøker på én gang. Start med
              Petzold (du leser den raskt og den endrer mental-modellen din). Skaff de gratis
              først (OSTEP, Nielsen, ISLR, MML). Ta resten når emnet er nært.
            </div>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <div
      id={book.id}
      className={`rounded-xl border ${TIER_COLORS[book.tier]} p-5 scroll-mt-20`}
    >
      <div className="flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-brand mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-semibold">{book.title}</h3>
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand">
              tier {book.tier} · {TIER_LABEL[book.tier]}
            </span>
            {book.free && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-success bg-success/10 rounded px-1.5">
                gratis
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            {book.authors} · {book.year} ·{" "}
            <a
              href={book.url}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline inline-flex items-center gap-0.5"
            >
              {book.free ? "Les gratis" : "Forlag/forfatter"} <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-sm leading-relaxed mb-3">{book.blurb}</p>

          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1.5">
              Hvorfor den vinner — beste konsepter / metaforer
            </div>
            <ul className="text-sm space-y-1">
              {book.metaforer.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand">→</span>
                  <span className="leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs">
            <span className="text-muted-foreground">Treffer fag: </span>
            {book.fag.map((f, i) => (
              <span key={i}>
                <span className="font-mono text-brand">{f}</span>
                {i < book.fag.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>

          {book.motArgument && (
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground hover:text-brand">
                Hvorfor ikke alternativet?
              </summary>
              <p className="mt-1.5 leading-relaxed">{book.motArgument}</p>
            </details>
          )}

          {book.embedUrl && book.embedKind && (
            <MediaEmbed
              kind={book.embedKind}
              src={book.embedUrl}
              title={`Les ${book.title} her`}
              externalUrl={book.url}
              mayBlock={book.embedMayBlock}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Rule({
  ok,
  warn,
  label,
  text,
}: {
  ok?: boolean;
  warn?: boolean;
  label: string;
  text: string;
}) {
  const Icon = warn ? AlertTriangle : CheckCircle2;
  const color = warn ? "text-warning" : "text-success";
  return (
    <div className="flex items-start gap-2">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
      <div>
        <span className="font-semibold">{label}</span>{" "}
        <span className="text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

function FagRow({ fag, primary, extra }: { fag: string; primary: string; extra: string }) {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-2.5 font-mono text-brand">{fag}</td>
      <td className="px-4 py-2.5 font-medium">{primary}</td>
      <td className="px-4 py-2.5 text-muted-foreground">{extra}</td>
    </tr>
  );
}
