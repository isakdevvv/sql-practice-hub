// ---------------------------------------------------------------------------
// Tilstandssjekk for TEK-1501-måloppgaver.
//
// PLAN-HOST26-MODULER.md §3.1: nye oppgaver skal ikke sjekke en tekststreng, men
// en *tilstand*. I statistikk er tilstanden to ting samtidig:
//
//   1. VALGT METODE — hvilken formel/test/estimator studenten mener skal brukes.
//   2. NUMERISK SVAR — tallet som faller ut, sjekket innenfor en toleranse.
//
// Poenget er at de to skal rapporteres hver for seg. En student som velger riktig
// metode, men bommer i tredje desimal, har gjort noe helt annet galt enn en som
// regner feilfritt på feil formel — og skal få vite nøyaktig hvilket av de to som
// gikk galt. En «feil»-melding uten den oppdelingen lærer ingenting.
//
// Ingen React-avhengigheter her; ren logikk så den kan testes og gjenbrukes.
// ---------------------------------------------------------------------------

/** Én valgbar metode i en måloppgave (radioknapp i UI-et). */
export type Metode = {
  id: string;
  /** Kort navn, f.eks. "Stikkprøvevarians (del på n − 1)". */
  label: string;
  /**
   * Hvorfor dette valget er feil. Vises kun når studenten valgte det og det var
   * galt. Utelates for riktig metode.
   */
  hvorforFeil?: string;
};

/** Fasit for tallsvaret. */
export type Fasit = {
  verdi: number;
  /**
   * Absolutt toleranse. Svar innenfor ±toleranse regnes som riktig. Velg den ut
   * fra hvor mange desimaler oppgaven faktisk ber om — ikke strengere.
   */
  toleranse: number;
  /** Valgfri enhet, f.eks. "kr" eller "%". Kun til visning. */
  enhet?: string;
  /**
   * Hvor mange desimaler fasiten vises med når vi avslører den.
   * Default utledes av toleransen.
   */
  desimaler?: number;
};

export type SvarStatus =
  /** Alt riktig: riktig metode OG tall innenfor toleranse. */
  | "riktig"
  /** Riktig metode, men tallet bommer. Regnefeil, ikke forståelsesfeil. */
  | "riktig-metode-feil-tall"
  /** Riktig metode, tallet er så vidt utenfor. Avrunding/desimalfeil. */
  | "riktig-metode-avrunding"
  /** Feil metode, men tallet stemmer likevel — nesten alltid flaks eller at to veier gir samme tall. */
  | "feil-metode-riktig-tall"
  /** Begge deler feil. */
  | "feil"
  /** Studenten har ikke fylt ut nok til at vi kan si noe. */
  | "ufullstendig";

export type SjekkResultat = {
  status: SvarStatus;
  /** True når status regnes som bestått (kun "riktig"). */
  bestatt: boolean;
  metodeOk: boolean;
  tallOk: boolean;
  /** |svar − fasit|, eller null hvis svaret ikke var et tall. */
  avvik: number | null;
  /** Kort overskrift til feedback-boksen. */
  tittel: string;
  /** Setningen som forklarer nøyaktig hva som skjedde. */
  melding: string;
  /** Fargetone for feedback-boksen. */
  tone: "success" | "warn" | "info";
};

export type SjekkInput = {
  /** Studentens råtekst fra tallfeltet. Tom streng = ikke besvart. */
  raaSvar: string;
  /** Id-en studenten valgte i metodelisten, eller null hvis ingen er valgt. */
  valgtMetodeId: string | null;
  /** Id-en som er riktig. */
  riktigMetodeId: string;
  fasit: Fasit;
  /** Metodelisten, brukt for å hente `hvorforFeil` til feilmeldingen. */
  metoder: Metode[];
};

/**
 * Tolker norsk tallinput. Godtar både komma og punktum som desimalskille, og
 * ignorerer mellomrom (tusenskille). Returnerer null hvis det ikke er et tall.
 */
export function parseTall(raa: string): number | null {
  const rensket = raa.trim().replace(/\s/g, "").replace(",", ".");
  if (rensket === "") return null;
  // Avvis ting som "1.2.3" og "abc" — Number() er for slapp alene på "" og "0x10".
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(rensket)) return null;
  const n = Number(rensket);
  return Number.isFinite(n) ? n : null;
}

/** Utleder et fornuftig antall desimaler fra toleransen, f.eks. 0.01 → 2. */
export function desimalerFor(fasit: Fasit): number {
  if (fasit.desimaler != null) return fasit.desimaler;
  if (fasit.toleranse <= 0) return 4;
  const d = Math.ceil(-Math.log10(fasit.toleranse));
  return Math.min(6, Math.max(0, d));
}

/** Formaterer et tall norsk (komma som desimalskille) med enhet. */
export function formatterFasit(fasit: Fasit): string {
  const tekst = fasit.verdi.toFixed(desimalerFor(fasit)).replace(".", ",");
  return fasit.enhet ? `${tekst} ${fasit.enhet}` : tekst;
}

/**
 * Hovedsjekken. Rapporterer metode og tall hver for seg, og setter sammen en
 * melding som sier hvilket av de to som gikk galt.
 */
export function sjekkMaloppgave(input: SjekkInput): SjekkResultat {
  const { raaSvar, valgtMetodeId, riktigMetodeId, fasit, metoder } = input;

  const tall = parseTall(raaSvar);
  const harMetode = valgtMetodeId != null;

  if (tall == null || !harMetode) {
    return {
      status: "ufullstendig",
      bestatt: false,
      metodeOk: false,
      tallOk: false,
      avvik: null,
      tittel: "Ikke ferdig utfylt",
      melding:
        tall == null && !harMetode
          ? "Velg en metode og skriv inn et tallsvar før du sjekker."
          : tall == null
            ? "Tallfeltet er tomt eller inneholder ikke et gyldig tall. Bruk komma eller punktum som desimalskille."
            : "Du har skrevet et tall, men ikke valgt hvilken metode du brukte. Metodevalget er halve oppgaven.",
      tone: "info",
    };
  }

  const avvik = Math.abs(tall - fasit.verdi);
  const metodeOk = valgtMetodeId === riktigMetodeId;
  const tallOk = avvik <= fasit.toleranse;
  // «Avrunding» = utenfor toleransen, men innenfor 10× den. Da er det nesten
  // alltid en desimal- eller avrundingsfeil, ikke en tankefeil.
  const naerme = !tallOk && avvik <= fasit.toleranse * 10;

  const valgt = metoder.find((m) => m.id === valgtMetodeId);
  const feilMetodeForklaring = valgt?.hvorforFeil ? ` ${valgt.hvorforFeil}` : "";

  if (metodeOk && tallOk) {
    return {
      status: "riktig",
      bestatt: true,
      metodeOk: true,
      tallOk: true,
      avvik,
      tittel: "Riktig — både metode og tall",
      melding: `Du valgte riktig framgangsmåte og landet på ${formatterFasit(fasit)}. Det er begge halvdelene av oppgaven.`,
      tone: "success",
    };
  }

  if (metodeOk && naerme) {
    return {
      status: "riktig-metode-avrunding",
      bestatt: false,
      metodeOk: true,
      tallOk: false,
      avvik,
      tittel: "Riktig metode — men du bommer på desimalene",
      melding: `Framgangsmåten er riktig, så forståelsen sitter. Svaret ditt er ${avvik.toPrecision(2)} unna fasiten ${formatterFasit(fasit)}, altså like utenfor toleransen på ±${fasit.toleranse}. Se etter en for tidlig avrunding underveis — rund alltid av først til slutt.`,
      tone: "warn",
    };
  }

  if (metodeOk) {
    return {
      status: "riktig-metode-feil-tall",
      bestatt: false,
      metodeOk: true,
      tallOk: false,
      avvik,
      tittel: "Riktig metode — regnefeil i utregningen",
      melding: `Du valgte riktig framgangsmåte, så dette er ikke en forståelsesfeil. Men tallet er ${avvik.toPrecision(3)} unna fasiten ${formatterFasit(fasit)}. Sett opp regnestykket på nytt og sjekk hvert ledd for seg.`,
      tone: "warn",
    };
  }

  if (tallOk) {
    return {
      status: "feil-metode-riktig-tall",
      bestatt: false,
      metodeOk: false,
      tallOk: true,
      avvik,
      tittel: "Riktig tall — men du har begrunnet det med feil metode",
      melding: `Tallet stemmer, men metoden du krysset av for er ikke den som gir det her.${feilMetodeForklaring} På eksamen er det begrunnelsen som gir uttelling, ikke tallet alene.`,
      tone: "warn",
    };
  }

  return {
    status: "feil",
    bestatt: false,
    metodeOk: false,
    tallOk: false,
    avvik,
    tittel: "Feil metode — og derfor feil tall",
    melding: `Metoden du valgte passer ikke på denne oppgaven.${feilMetodeForklaring} Start med metodevalget: når det er riktig, følger som regel tallet av seg selv.`,
    tone: "warn",
  };
}

// ---------------------------------------------------------------------------
// Rene statistikk-hjelpere, brukt av simulatorene i modulene.
// ---------------------------------------------------------------------------

export function gjennomsnitt(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Kvartil etter «median av halvdelene»-metoden, som er den de fleste norske
 * innføringskursene bruker for håndregning. Ved partall antall observasjoner
 * deles rekka i to like halvdeler; ved oddetall holdes medianen utenfor begge.
 */
export function kvartiler(xs: number[]): { q1: number; q2: number; q3: number } {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return { q1: NaN, q2: NaN, q3: NaN };
  const halv = Math.floor(n / 2);
  const nedre = s.slice(0, halv);
  const ovre = n % 2 === 0 ? s.slice(halv) : s.slice(halv + 1);
  return { q1: median(nedre), q2: median(s), q3: median(ovre) };
}

/**
 * Varians. `frihetsgrader = "n-1"` gir stikkprøvevariansen s² (forventningsrett
 * for populasjonsvariansen); `"n"` gir populasjonsvariansen σ².
 */
export function varians(xs: number[], frihetsgrader: "n" | "n-1" = "n-1"): number {
  const n = xs.length;
  const nevner = frihetsgrader === "n-1" ? n - 1 : n;
  if (n === 0 || nevner <= 0) return NaN;
  const m = gjennomsnitt(xs);
  return xs.reduce((sum, x) => sum + (x - m) ** 2, 0) / nevner;
}

export function standardavvik(xs: number[], frihetsgrader: "n" | "n-1" = "n-1"): number {
  return Math.sqrt(varians(xs, frihetsgrader));
}

/** n! — kun for små n (n ≤ 170 før det blir Infinity). */
export function fakultet(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Antall ordnede utvalg: nPk = n! / (n − k)!. Regnes iterativt for å unngå overflyt. */
export function permutasjoner(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

/** Antall uordnede utvalg: nCk = n! / (k!(n − k)!). */
export function kombinasjoner(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  const kk = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < kk; i++) {
    r = (r * (n - i)) / (i + 1);
  }
  return Math.round(r);
}

/** Enkel deterministisk pseudo-tilfeldig generator, så simulatorer kan reproduseres. */
export function lagRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    // xorshift32
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Boks-Muller: én standard normalfordelt verdi fra to uniforme. */
export function normalTrekk(rng: () => number, my = 0, sigma = 1): number {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  return my + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
