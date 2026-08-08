import { CANVAS_MODULER, alleObliger, dagerTil, formatFrist } from "@/lib/dte2505/canvasModuler";

/**
 * Semestertidslinje for DTE-2505: alle oblig-frister og eksamen på én akse,
 * med en markør for dagens dato. Poenget er å se *avstanden* mellom fristene —
 * en tabell med sju rader gir ikke den følelsen.
 *
 * Klikk på en frist hopper til modulen den hører til.
 */

const START = new Date("2026-08-01T00:00:00");
const SLUTT = new Date("2026-12-02T23:59:00"); // eksamensdagen
const EKSAMEN_ISO = "2026-12-02";

// Tegneflate i SVG-koordinater. Bredden skaleres av viewBox, så tallene er
// bare et internt rutenett — ikke piksler på skjermen.
const W = 1000;
const H = 180;
const PAD_X = 40;
const AKSE_Y = 92;

function frac(d: Date): number {
  const span = SLUTT.getTime() - START.getTime();
  return Math.min(1, Math.max(0, (d.getTime() - START.getTime()) / span));
}

function x(iso: string): number {
  return PAD_X + frac(new Date(`${iso}T12:00:00`)) * (W - 2 * PAD_X);
}

const MANEDER = [
  { iso: "2026-08-15", navn: "aug" },
  { iso: "2026-09-15", navn: "sep" },
  { iso: "2026-10-15", navn: "okt" },
  { iso: "2026-11-15", navn: "nov" },
  { iso: "2026-12-01", navn: "des" },
];

export function SemesterTidslinje({ naa = new Date() }: { naa?: Date }) {
  const obliger = alleObliger();
  const idagIso = `${naa.getFullYear()}-${String(naa.getMonth() + 1).padStart(2, "0")}-${String(naa.getDate()).padStart(2, "0")}`;
  const idagX = x(idagIso);
  const idagSynlig = naa >= START && naa <= SLUTT;

  // Frister som faller nær hverandre (1.1 og 1.2 har samme dag) stables ved at
  // annenhver etikett legges litt høyere.
  let forrigeX = -100;
  const etiketter = obliger.map(({ modul, oblig }) => {
    const px = x(oblig.frist);
    const naerForrige = px - forrigeX < 70;
    forrigeX = px;
    return { modul, oblig, px, hoy: naerForrige };
  });

  return (
    <figure className="rounded-xl border border-border bg-card p-4">
      <figcaption className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
        Semestertidslinje — alle frister
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Tidslinje fra semesterstart til eksamen med alle obligfrister markert"
      >
        {/* Selve aksen */}
        <line
          x1={PAD_X}
          y1={AKSE_Y}
          x2={W - PAD_X}
          y2={AKSE_Y}
          className="stroke-border"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Månedsmerker */}
        {MANEDER.map((m) => (
          <g key={m.navn}>
            <line
              x1={x(m.iso)}
              y1={AKSE_Y}
              x2={x(m.iso)}
              y2={AKSE_Y + 7}
              className="stroke-border"
              strokeWidth={1.5}
            />
            <text
              x={x(m.iso)}
              y={AKSE_Y + 22}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={13}
            >
              {m.navn}
            </text>
          </g>
        ))}

        {/* Dagens dato */}
        {idagSynlig && (
          <g>
            <line
              x1={idagX}
              y1={AKSE_Y - 34}
              x2={idagX}
              y2={AKSE_Y + 10}
              className="stroke-brand"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <circle cx={idagX} cy={AKSE_Y} r={5} className="fill-brand" />
            <text
              x={idagX}
              y={AKSE_Y - 40}
              textAnchor="middle"
              className="fill-brand font-semibold"
              fontSize={13}
            >
              i dag
            </text>
          </g>
        )}

        {/* Obligfrister */}
        {etiketter.map(({ modul, oblig, px, hoy }) => {
          const dager = dagerTil(oblig.frist, naa);
          const passert = dager < 0;
          const y = hoy ? AKSE_Y + 72 : AKSE_Y + 40;
          return (
            <a key={oblig.nummer} href={`#modul-${modul.id}`} aria-label={`Oblig ${oblig.nummer}, frist ${formatFrist(oblig.frist)}`}>
              <line
                x1={px}
                y1={AKSE_Y}
                x2={px}
                y2={y - 12}
                className={passert ? "stroke-border" : "stroke-amber-500"}
                strokeWidth={1.5}
              />
              <circle
                cx={px}
                cy={AKSE_Y}
                r={6}
                className={passert ? "fill-muted stroke-border" : "fill-amber-500 stroke-amber-500"}
                strokeWidth={2}
              />
              <text
                x={px}
                y={y}
                textAnchor="middle"
                className={passert ? "fill-muted-foreground" : "fill-foreground font-semibold"}
                fontSize={14}
              >
                Oblig {oblig.nummer}
              </text>
              <text
                x={px}
                y={y + 15}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={12}
              >
                {formatFrist(oblig.frist).slice(0, 5)}
              </text>
            </a>
          );
        })}

        {/* Eksamen */}
        <g>
          <circle cx={x(EKSAMEN_ISO)} cy={AKSE_Y} r={7} className="fill-rose-500" />
          <text
            x={x(EKSAMEN_ISO)}
            y={AKSE_Y - 16}
            textAnchor="end"
            className="fill-rose-500 font-semibold"
            fontSize={14}
          >
            eksamen
          </text>
        </g>
      </svg>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {CANVAS_MODULER.length} moduler og {alleObliger().length} obligfrister fra semesterstart
        til eksamen. Alle frister er kl. 23:59 på datoen som står. Klikk en frist for å hoppe til
        modulen.
      </p>
    </figure>
  );
}
