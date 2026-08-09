// ---------------------------------------------------------------------------
// DTE-2505 Modul 1b, Canvas-punkt 1.3 — programvare fra ANDRE kilder enn
// standard-pakkearkivet.
//
// Motoren er en ren tilstandsmaskin: den holder rede på hvilke kilder som er
// aktive, hvilke signeringsnøkler nøkkelringen har, hva pakkeindeksen inneholder
// og hva som faktisk er installert. Kommandoene endrer tilstanden; oppgavene
// sjekker TILSTANDEN, ikke tekststrengen studenten skrev
// (PLAN-HOST26-MODULER.md §3.1).
//
// Ingenting her rører nettverk eller React. Filen kan importeres i en test og
// kjøres uten å rendre noe som helst — samme prinsipp som
// src/lib/dte2602/spamSimulering.ts.
//
// Ordforklaringer brukt gjennomgående (skrevet ut første gang de dukker opp i
// grensesnittet også):
//   apt   = Advanced Package Tool, verktøyet som håndterer pakker og avhengigheter
//   dpkg  = Debian Package, det lavnivå-verktøyet apt bruker under seg
//   PPA   = Personal Package Archive, et personlig pakkearkiv hos Launchpad
//   GPG   = GNU Privacy Guard, programmet som lager og sjekker signaturene
//   .deb  = filformatet til en Debian-pakke
// ---------------------------------------------------------------------------

/** Pakkeformatene modulen sammenligner. */
export type PkgFormat = "deb" | "snap" | "flatpak";

/** Hva slags kilde en pakke kommer fra. */
export type KildeType = "standard" | "ppa" | "tredjepart" | "løs-fil" | "snap" | "flatpak";

export interface RepoPakke {
  version: string;
  /** Pakker denne trenger for å virke. Må finnes i indeksen eller være installert. */
  depends?: string[];
  /** Én linje om hva pakken er — vises i søk. */
  om: string;
}

/** Et pakkearkiv (engelsk: repository) slik apt ser det. */
export interface RepoDef {
  id: string;
  /** Linja som faktisk står i sources.list-filen. */
  linje: string;
  /** Filen linja bor i. */
  fil: string;
  label: string;
  type: KildeType;
  /** Adressen apt henter fra — brukes til å matche `deb ...`-linjer studenten skriver. */
  url: string;
  /** Navnet på signeringsnøkkelen arkivet er signert med. */
  nokkel: string;
  /** Nøkkelen slik den heter i /etc/apt/keyrings/, når den er lagt inn manuelt. */
  nokkelfil?: string;
  pakker: Record<string, RepoPakke>;
}

// ---------------------------------------------------------------------------
// 1. Verden: hvilke arkiver finnes å hente fra
// ---------------------------------------------------------------------------

export const REPOS: RepoDef[] = [
  {
    id: "ubuntu-main",
    linje: "deb http://archive.ubuntu.com/ubuntu noble main restricted",
    fil: "/etc/apt/sources.list",
    label: "Ubuntu hovedarkiv",
    type: "standard",
    url: "http://archive.ubuntu.com/ubuntu",
    nokkel: "ubuntu-archive-keyring",
    pakker: {
      git: { version: "1:2.43.0-1ubuntu7", om: "distribuert versjonskontroll" },
      vim: { version: "2:9.1.0016-1ubuntu7", om: "teksteditoren Vi Improved" },
      curl: { version: "8.5.0-2ubuntu10", om: "henter data over nett fra kommandolinja" },
      htop: { version: "3.3.0-4", om: "interaktiv prosessovervåker" },
      "obs-studio": { version: "30.0.2-1", om: "opptak og direktesending (eldre versjon)" },
      gpg: { version: "2.4.4-2ubuntu17", om: "GNU Privacy Guard — signaturer og kryptering" },
      "libappindicator3-1": { version: "12.10.1-2", om: "bibliotek for statusikoner i systemfeltet" },
      "ca-certificates": { version: "20240203", om: "rotsertifikatene systemet stoler på" },
    },
  },
  {
    id: "ubuntu-universe",
    linje: "deb http://archive.ubuntu.com/ubuntu noble universe",
    fil: "/etc/apt/sources.list",
    label: "Ubuntu universe (fellesskapsvedlikeholdt)",
    type: "standard",
    url: "http://archive.ubuntu.com/ubuntu",
    nokkel: "ubuntu-archive-keyring",
    pakker: {
      neofetch: { version: "7.1.0-4", om: "viser systeminfo med distro-logo" },
      cowsay: { version: "3.03+dfsg2-8", om: "en ku som sier det du skriver" },
      flatpak: { version: "1.14.6-1", om: "pakkesystem med sandkasse, uavhengig av distribusjon" },
    },
  },
  {
    id: "ppa-obs",
    linje: "deb https://ppa.launchpadcontent.net/obsproject/obs-studio/ubuntu noble main",
    fil: "/etc/apt/sources.list.d/obsproject-ubuntu-obs-studio-noble.sources",
    label: "PPA: obsproject/obs-studio",
    type: "ppa",
    url: "https://ppa.launchpadcontent.net/obsproject/obs-studio/ubuntu",
    nokkel: "obsproject-ppa-key",
    pakker: {
      "obs-studio": { version: "31.0.1-0obsproject1", om: "opptak og direktesending (nyeste)" },
    },
  },
  {
    id: "docker",
    linje: "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable",
    fil: "/etc/apt/sources.list.d/docker.list",
    label: "Docker sitt eget arkiv",
    type: "tredjepart",
    url: "https://download.docker.com/linux/ubuntu",
    nokkel: "docker-archive-keyring",
    nokkelfil: "/etc/apt/keyrings/docker.asc",
    pakker: {
      "docker-ce": {
        version: "5:27.0.3-1~ubuntu.24.04~noble",
        depends: ["ca-certificates"],
        om: "containermotoren fra Docker selv, nyere enn Ubuntu sin",
      },
    },
  },
];

/** Løse .deb-filer som allerede ligger i nedlastingsmappa. */
export interface DebFil {
  navn: string;
  pakke: string;
  version: string;
  depends: string[];
  om: string;
}

export const DEB_FILER: DebFil[] = [
  {
    navn: "slack-desktop.deb",
    pakke: "slack-desktop",
    version: "4.38.125",
    depends: ["libappindicator3-1"],
    om: "meldingsklient lastet ned som løs fil fra leverandøren",
  },
  {
    navn: "hello-verden.deb",
    pakke: "hello-verden",
    version: "1.0",
    depends: [],
    om: "en bitteliten pakke uten avhengigheter",
  },
];

export const SNAP_PAKKER: Record<string, { version: string; om: string; classicKrevd?: boolean }> = {
  code: { version: "1.91.1", om: "Visual Studio Code", classicKrevd: true },
  spotify: { version: "1.2.38", om: "musikkspiller" },
  "obs-studio": { version: "31.0.1", om: "opptak og direktesending, som snap" },
};

export const FLATPAK_PAKKER: Record<string, { version: string; om: string }> = {
  "org.gimp.GIMP": { version: "2.10.38", om: "bilderedigering" },
  "com.obsproject.Studio": { version: "31.0.1", om: "opptak og direktesending, som flatpak" },
};

// ---------------------------------------------------------------------------
// 2. Tilstanden
// ---------------------------------------------------------------------------

export interface InstallertPakke {
  navn: string;
  version: string;
  format: PkgFormat;
  /** Hvilken kilde den kom fra — repo-id, filnavn, "snap" eller "flatpak". */
  kilde: string;
  kildeType: KildeType;
  /** Sant når dpkg la inn filene, men avhengigheter mangler. */
  brutt?: boolean;
  /** Avhengigheter som mangler når `brutt` er satt. */
  manglerAvhengighet?: string[];
}

export interface AptState {
  /** Repo-id-er som står i sources.list eller sources.list.d/. */
  kilder: string[];
  /** Nøkkelnavn i nøkkelringen. Et arkiv uten sin nøkkel her blir avvist. */
  nokler: string[];
  /**
   * Pakkeindeksen apt bygde sist `apt update` kjørte: pakkenavn → hvor den finnes.
   * Tom før første update — det er poenget med at update finnes.
   */
  indeks: Record<string, { version: string; repo: string }>;
  /** Sant når kildene er endret uten at `apt update` har kjørt etterpå. */
  indeksUtdatert: boolean;
  installert: Record<string, InstallertPakke>;
  /** Filer i ~/Nedlastinger. */
  filer: string[];
  /** Fjernarkiver flatpak kjenner. Tom liste = flatpak har ingen steder å hente fra. */
  flatpakRemotes: string[];
  /** Sant når flatpak-programmet selv er installert. */
  flatpakInstallert: boolean;
}

export function initialState(): AptState {
  return {
    kilder: ["ubuntu-main", "ubuntu-universe"],
    nokler: ["ubuntu-archive-keyring"],
    indeks: {},
    indeksUtdatert: true,
    installert: {
      git: {
        navn: "git",
        version: "1:2.43.0-1ubuntu7",
        format: "deb",
        kilde: "ubuntu-main",
        kildeType: "standard",
      },
      "ca-certificates": {
        navn: "ca-certificates",
        version: "20240203",
        format: "deb",
        kilde: "ubuntu-main",
        kildeType: "standard",
      },
    },
    filer: DEB_FILER.map((d) => d.navn),
    flatpakRemotes: [],
    flatpakInstallert: false,
  };
}

function klone(s: AptState): AptState {
  return {
    kilder: [...s.kilder],
    nokler: [...s.nokler],
    indeks: { ...s.indeks },
    indeksUtdatert: s.indeksUtdatert,
    installert: Object.fromEntries(Object.entries(s.installert).map(([k, v]) => [k, { ...v }])),
    filer: [...s.filer],
    flatpakRemotes: [...s.flatpakRemotes],
    flatpakInstallert: s.flatpakInstallert,
  };
}

// ---------------------------------------------------------------------------
// 3. Kjøreren
// ---------------------------------------------------------------------------

/** Hva kommandoen endte med å gjøre. Oppgavene kan se på dette i tillegg til tilstanden. */
export type AptUtfall =
  | "listing" // vi leste en fil eller listet en katalog
  | "kilde-lagt-til"
  | "kilde-fjernet"
  | "nokkel-lagt-til"
  | "indeks-oppdatert"
  | "indeks-avvist" // update kjørte, men et arkiv ble avvist på grunn av manglende nøkkel
  | "installert"
  | "installert-brutt" // dpkg la inn filene, avhengigheter mangler
  | "reparert"
  | "fjernet"
  | "ikke-funnet"
  | "policy"
  | "sok"
  | "feil";

export interface KjoreResultat {
  state: AptState;
  lines: string[];
  utfall: AptUtfall;
  /** Kommandoen som ble kjørt, normalisert. */
  cmd: string;
}

export interface Session {
  state: AptState;
  historikk: KjoreResultat[];
}

export function nySession(state: AptState = initialState()): Session {
  return { state, historikk: [] };
}

const repoById = (id: string) => REPOS.find((r) => r.id === id);

/** Bygger indeksen på nytt fra de aktive kildene som har gyldig nøkkel. */
function byggIndeks(s: AptState): { indeks: AptState["indeks"]; avvist: RepoDef[]; brukt: RepoDef[] } {
  const indeks: AptState["indeks"] = {};
  const avvist: RepoDef[] = [];
  const brukt: RepoDef[] = [];
  for (const id of s.kilder) {
    const repo = repoById(id);
    if (!repo) continue;
    if (!s.nokler.includes(repo.nokkel)) {
      avvist.push(repo);
      continue;
    }
    brukt.push(repo);
    for (const [navn, p] of Object.entries(repo.pakker)) {
      const finnes = indeks[navn];
      // Uten pinning vinner høyeste versjon. PPA-en har nyere obs-studio enn
      // hovedarkivet, og det er nettopp derfor man legger til en PPA.
      if (!finnes || sammenlignVersjon(p.version, finnes.version) > 0) {
        indeks[navn] = { version: p.version, repo: repo.id };
      }
    }
  }
  return { indeks, avvist, brukt };
}

/** Grov versjonssammenligning — nok til å avgjøre hvem som «vinner» i indeksen. */
export function sammenlignVersjon(a: string, b: string): number {
  const rens = (v: string) => v.replace(/^\d+:/, "").split(/[.\-+~]/).map((x) => parseInt(x, 10) || 0);
  const xa = rens(a);
  const xb = rens(b);
  for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
    const d = (xa[i] ?? 0) - (xb[i] ?? 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}

const feil = (state: AptState, cmd: string, ...lines: string[]): KjoreResultat => ({
  state,
  cmd,
  lines,
  utfall: "feil",
});

/**
 * Kjører én kommandolinje mot tilstanden og returnerer en NY tilstand.
 * Rent funksjonell: `state` inn blir aldri endret.
 */
export function runApt(state: AptState, input: string): KjoreResultat {
  const cmd = input.trim().replace(/\s+/g, " ");
  if (!cmd) return feil(state, cmd, "Skriv en kommando.");

  // sudo er bare et prefiks her — vi later som studenten har rettighetene.
  const uten = cmd.replace(/^sudo\s+/, "");
  const t = uten.split(" ");

  // ---- lese kildene ------------------------------------------------------
  if (t[0] === "cat" && t[1]?.startsWith("/etc/apt/sources.list")) {
    return lesKilder(state, cmd, t[1]);
  }
  if (t[0] === "ls" && t[1]?.startsWith("/etc/apt/sources.list.d")) {
    const filer = [...new Set(state.kilder.map((id) => repoById(id)?.fil).filter((f): f is string => Boolean(f)))]
      .filter((f) => f.startsWith("/etc/apt/sources.list.d/"))
      .map((f) => f.replace("/etc/apt/sources.list.d/", ""));
    return {
      state,
      cmd,
      utfall: "listing",
      lines: filer.length
        ? filer
        : ["(katalogen er tom — alle kildene står i selve /etc/apt/sources.list)"],
    };
  }
  if (t[0] === "ls" && t[1]?.startsWith("/etc/apt/keyrings")) {
    const nokkelfiler = REPOS.filter((r) => r.nokkelfil && state.nokler.includes(r.nokkel)).map((r) =>
      r.nokkelfil!.replace("/etc/apt/keyrings/", ""),
    );
    return {
      state,
      cmd,
      utfall: "listing",
      lines: nokkelfiler.length ? nokkelfiler : ["(ingen manuelt installerte nøkler)"],
    };
  }
  if (t[0] === "ls" && (t[1] === "~/Nedlastinger" || t[1] === "~/Nedlastinger/")) {
    return { state, cmd, utfall: "listing", lines: state.filer.length ? state.filer : ["(tom)"] };
  }
  if (t[0] === "apt-key") {
    return {
      state,
      cmd,
      utfall: "feil",
      lines: [
        "Warning: apt-key is deprecated. Manage keyring files in trusted.gpg.d instead (see apt-key(8)).",
        "",
        "(apt-key la nøkkelen i én felles nøkkelring som gjaldt ALLE arkiver. Da kunne et",
        " tredjepartsarkiv signere pakker som utga seg for å være fra Ubuntu. Derfor er den",
        " avviklet: nå legges nøkkelen i /etc/apt/keyrings/ og bindes til ETT arkiv med",
        " signed-by= i kildelinja.)",
      ],
    };
  }

  // ---- add-apt-repository ------------------------------------------------
  if (t[0] === "add-apt-repository" || t[0] === "apt-add-repository") {
    const fjern = t.includes("--remove") || t.includes("-r");
    const mål = t.find((x) => x.startsWith("ppa:"));
    if (!mål) {
      return feil(
        state,
        cmd,
        "add-apt-repository trenger en kilde, for eksempel ppa:obsproject/obs-studio",
        "(PPA = Personal Package Archive, et personlig pakkearkiv hos Launchpad.)",
      );
    }
    const repo = REPOS.find((r) => r.type === "ppa" && r.url.includes(mål.slice(4).split("/")[0]));
    if (!repo) {
      return feil(state, cmd, `Kan ikke nå ${mål} — arkivet finnes ikke i dette øvingsmiljøet.`, "Prøv ppa:obsproject/obs-studio.");
    }
    const ny = klone(state);
    if (fjern) {
      ny.kilder = ny.kilder.filter((k) => k !== repo.id);
      ny.nokler = ny.nokler.filter((k) => k !== repo.nokkel);
      ny.indeksUtdatert = true;
      return {
        state: ny,
        cmd,
        utfall: "kilde-fjernet",
        lines: [
          `Fjerner ${repo.label}.`,
          "",
          "(Merk: kilden er borte, men pakker du allerede har installert DERFRA blir liggende.",
          " De blir bare aldri oppdatert igjen. Verktøyet ppa-purge ruller dem tilbake til",
          " versjonen i standardarkivet.)",
        ],
      };
    }
    if (ny.kilder.includes(repo.id)) {
      return { state: ny, cmd, utfall: "kilde-lagt-til", lines: [`${repo.label} er allerede lagt til.`] };
    }
    ny.kilder.push(repo.id);
    if (!ny.nokler.includes(repo.nokkel)) ny.nokler.push(repo.nokkel);
    ny.indeksUtdatert = true;
    return {
      state: ny,
      cmd,
      utfall: "kilde-lagt-til",
      lines: [
        `Repository: '${repo.linje}'`,
        "Beskrivelse:",
        `  ${repo.label}`,
        "Mer info: https://launchpad.net/~obsproject/+archive/ubuntu/obs-studio",
        "Trykk [ENTER] for å fortsette.",
        `Henter signeringsnøkkel ... OK (${repo.nokkel} lagt i nøkkelringen)`,
        `Skriver ${repo.fil}`,
        "",
        "(add-apt-repository gjorde TO ting: den skrev kildelinja OG hentet signeringsnøkkelen.",
        " Legger du inn et arkiv for hånd, må du gjøre begge selv.)",
        "Kjør `sudo apt update` for å hente den nye pakkelista.",
      ],
    };
  }

  // ---- legge inn nøkkel manuelt -----------------------------------------
  // Både `curl ... -o /etc/apt/keyrings/x.asc` og `curl ... | sudo gpg --dearmor -o ...`
  if ((t[0] === "curl" || t[0] === "wget") && /keyrings\//.test(cmd)) {
    const repo = REPOS.find((r) => r.nokkelfil && cmd.includes(new URL(r.url).hostname));
    if (!repo) {
      return feil(state, cmd, "Fant ingen nøkkel på den adressen i dette øvingsmiljøet.", "Prøv https://download.docker.com/linux/ubuntu/gpg");
    }
    const ny = klone(state);
    if (!ny.nokler.includes(repo.nokkel)) ny.nokler.push(repo.nokkel);
    return {
      state: ny,
      cmd,
      utfall: "nokkel-lagt-til",
      lines: [
        `Lagret signeringsnøkkelen i ${repo.nokkelfil}`,
        "",
        "(Nøkkelen er den offentlige halvdelen av nøkkelparet arkivet signerer med. apt bruker",
        " den til å sjekke at pakkelista er uendret siden arkivet lagde den. Den sier ingenting",
        " om at innholdet er trygt — bare at det kommer uendret fra den som eier nøkkelen.)",
      ],
    };
  }

  // ---- skrive kildelinja for hånd ---------------------------------------
  if (/\btee\b/.test(cmd) && /sources\.list\.d\//.test(cmd) && /\bdeb\b/.test(cmd)) {
    const repo = REPOS.find((r) => cmd.includes(r.url));
    if (!repo) {
      return feil(state, cmd, "Adressen i deb-linja peker ikke på noe arkiv dette øvingsmiljøet kjenner.");
    }
    const ny = klone(state);
    if (!ny.kilder.includes(repo.id)) ny.kilder.push(repo.id);
    ny.indeksUtdatert = true;
    return {
      state: ny,
      cmd,
      utfall: "kilde-lagt-til",
      lines: [
        repo.linje,
        `Skrev ${repo.fil}`,
        "",
        ny.nokler.includes(repo.nokkel)
          ? "(Nøkkelen ligger allerede i nøkkelringen, så arkivet blir godtatt ved neste apt update.)"
          : "(Advarsel: nøkkelen for dette arkivet er IKKE lagt inn. apt update kommer til å avvise det.)",
      ],
    };
  }

  // ---- apt update --------------------------------------------------------
  if ((t[0] === "apt" || t[0] === "apt-get") && t[1] === "update") {
    const ny = klone(state);
    const { indeks, avvist, brukt } = byggIndeks(ny);
    ny.indeks = indeks;
    ny.indeksUtdatert = false;
    const lines = brukt.map((r, i) => `Get:${i + 1} ${r.url} noble InRelease [128 kB]`);
    for (const r of avvist) {
      lines.push(
        `Err:${lines.length + 1} ${r.url} noble InRelease`,
        `  The following signatures couldn't be verified because the public key is not available: NO_PUBKEY ${r.nokkel}`,
      );
    }
    lines.push(`Reading package lists... Done`);
    if (avvist.length) {
      lines.push(
        "",
        `W: Kunne ikke hente ${avvist[0].url}/dists/noble/InRelease`,
        `W: Arkivet «${avvist[0].label}» er hoppet over. Pakkene der er USYNLIGE for apt.`,
        "",
        "(Dette er hele poenget med signering: apt nekter heller å bruke et arkiv enn å stole",
        " på pakkelister den ikke kan bevise opphavet til. Legg inn nøkkelen, kjør update igjen.)",
      );
      return { state: ny, cmd, utfall: "indeks-avvist", lines };
    }
    lines.push(
      "",
      `(Indeksen har nå ${Object.keys(indeks).length} pakker fra ${brukt.length} arkiv.`,
      " update henter LISTA over hva som finnes. Den installerer og oppgraderer ingenting.)",
    );
    return { state: ny, cmd, utfall: "indeks-oppdatert", lines };
  }

  // ---- apt install -f / --fix-broken ------------------------------------
  if ((t[0] === "apt" || t[0] === "apt-get") && (t[1] === "install" || t[1] === "-f") && (t.includes("-f") || t.includes("--fix-broken")) && t.length <= 4) {
    const ny = klone(state);
    const brutte = Object.values(ny.installert).filter((p) => p.brutt);
    if (!brutte.length) {
      return { state: ny, cmd, utfall: "reparert", lines: ["0 oppgradert, 0 nyinstallert, 0 å fjerne. Ingenting er brutt."] };
    }
    const manglende = [...new Set(brutte.flatMap((p) => p.manglerAvhengighet ?? []))];
    const ikkeIIndeks = manglende.filter((m) => !ny.indeks[m]);
    if (ikkeIIndeks.length) {
      return feil(
        ny,
        cmd,
        `E: Klarer ikke rette avhengigheter: ${ikkeIIndeks.join(", ")} finnes ikke i indeksen.`,
        "(Kjør `sudo apt update` først — apt kan bare hente det den vet finnes.)",
      );
    }
    for (const m of manglende) {
      const kilde = ny.indeks[m];
      ny.installert[m] = {
        navn: m,
        version: kilde.version,
        format: "deb",
        kilde: kilde.repo,
        kildeType: repoById(kilde.repo)?.type ?? "standard",
      };
    }
    for (const p of brutte) {
      p.brutt = false;
      p.manglerAvhengighet = undefined;
    }
    return {
      state: ny,
      cmd,
      utfall: "reparert",
      lines: [
        "Correcting dependencies... Done",
        `Følgende NYE pakker vil bli installert: ${manglende.join(" ")}`,
        `Setting up ${brutte.map((b) => b.navn).join(", ")} ...`,
        "",
        "(apt løste opp det dpkg lot stå halvferdig. dpkg installerer ÉN fil og sjekker at",
        " avhengighetene er der; apt kjenner arkivene og kan hente dem.)",
      ],
    };
  }

  // ---- apt install <noe> -------------------------------------------------
  if ((t[0] === "apt" || t[0] === "apt-get") && (t[1] === "install" || t[1] === "reinstall")) {
    const mål = t.slice(2).filter((x) => !x.startsWith("-"));
    if (!mål.length) return feil(state, cmd, "apt install trenger et pakkenavn eller en filsti.");
    const ny = klone(state);
    const lines: string[] = [];
    let utfall: AptUtfall = "installert";

    for (const m of mål) {
      // Lokal .deb-fil: må ha ./ eller en absolutt sti, ellers tolkes den som pakkenavn.
      if (m.endsWith(".deb")) {
        const filnavn = m.split("/").pop()!;
        const deb = DEB_FILER.find((d) => d.navn === filnavn);
        if (!deb || !ny.filer.includes(filnavn)) {
          lines.push(`E: Kunne ikke åpne filen ${m} — finnes ikke.`);
          utfall = "feil";
          continue;
        }
        if (!m.includes("/")) {
          lines.push(
            `E: Unable to locate package ${filnavn}`,
            "",
            "(Filen ligger jo rett der. Men apt tolker et bart navn som et PAKKENAVN og slår det",
            " opp i indeksen. Skal den forstå at du mener en fil, må navnet inneholde en skråstrek:",
            ` skriv ./${filnavn}.)`,
          );
          utfall = "feil";
          continue;
        }
        const mangler = deb.depends.filter((d) => !ny.installert[d]);
        const kanHente = mangler.filter((d) => ny.indeks[d]);
        const kanIkke = mangler.filter((d) => !ny.indeks[d]);
        if (kanIkke.length) {
          lines.push(
            `E: Avhengighet mangler: ${kanIkke.join(", ")}`,
            "(Kjør `sudo apt update` først, slik at apt vet hvor avhengighetene finnes.)",
          );
          utfall = "feil";
          continue;
        }
        for (const d of kanHente) {
          ny.installert[d] = {
            navn: d,
            version: ny.indeks[d].version,
            format: "deb",
            kilde: ny.indeks[d].repo,
            kildeType: repoById(ny.indeks[d].repo)?.type ?? "standard",
          };
        }
        ny.installert[deb.pakke] = {
          navn: deb.pakke,
          version: deb.version,
          format: "deb",
          kilde: deb.navn,
          kildeType: "løs-fil",
        };
        lines.push(
          ...(kanHente.length ? [`Følgende ekstra pakker vil bli installert: ${kanHente.join(" ")}`] : []),
          `Setting up ${deb.pakke} (${deb.version}) ...`,
          "",
          "(apt godtar en filsti og løser avhengighetene fra arkivene på veien. Det er derfor",
          " `apt install ./fil.deb` nesten alltid er bedre enn `dpkg -i fil.deb`.)",
          "Advarsel: pakken oppdateres ikke automatisk — den kom fra en løs fil, ikke fra et arkiv.",
        );
        continue;
      }

      // Vanlig pakkenavn.
      const oppf = ny.indeks[m];
      if (!oppf) {
        const finnesIEtRepo = REPOS.find((r) => r.pakker[m]);
        lines.push(
          `E: Unable to locate package ${m}`,
          finnesIEtRepo && !ny.kilder.includes(finnesIEtRepo.id)
            ? `(Pakken finnes — men i «${finnesIEtRepo.label}», som ikke er blant kildene dine.)`
            : ny.indeksUtdatert || !Object.keys(ny.indeks).length
              ? "(Indeksen er tom eller utdatert. `sudo apt update` henter pakkelista.)"
              : "(Navnet finnes ikke i noen av kildene dine.)",
        );
        utfall = "ikke-funnet";
        continue;
      }
      const repo = repoById(oppf.repo)!;
      const deps = repo.pakker[m].depends ?? [];
      const manglerDep = deps.filter((d) => !ny.installert[d] && !ny.indeks[d]);
      if (manglerDep.length) {
        lines.push(`E: Avhengighet mangler og finnes ikke i indeksen: ${manglerDep.join(", ")}`);
        utfall = "feil";
        continue;
      }
      for (const d of deps.filter((d) => !ny.installert[d])) {
        ny.installert[d] = {
          navn: d,
          version: ny.indeks[d].version,
          format: "deb",
          kilde: ny.indeks[d].repo,
          kildeType: repoById(ny.indeks[d].repo)?.type ?? "standard",
        };
      }
      const gammel = ny.installert[m];
      ny.installert[m] = {
        navn: m,
        version: oppf.version,
        format: "deb",
        kilde: repo.id,
        kildeType: repo.type,
      };
      // Selve flatpak-verktøyet er bare en helt vanlig .deb-pakke. At det å
      // installere den er det som slår på flatpak-kommandoen, er hele poenget i
      // måloppgave pg6: det ene pakkesystemet installerer det andre.
      if (m === "flatpak") ny.flatpakInstallert = true;
      lines.push(
        gammel
          ? `${m} oppgraderes fra ${gammel.version} til ${oppf.version}`
          : `Følgende NYE pakker vil bli installert: ${m}`,
        `Henter fra ${repo.url}`,
        `Setting up ${m} (${oppf.version}) ...`,
      );
      if (repo.type === "ppa" || repo.type === "tredjepart") {
        lines.push(
          "",
          `(Pakken kom fra «${repo.label}» — ikke fra Ubuntu. Den blir oppdatert automatisk så`,
          " lenge kilden står der, men det er eieren av arkivet som bestemmer hva som havner i deg.)",
        );
      }
    }
    return { state: ny, cmd, utfall, lines };
  }

  // ---- dpkg -i -----------------------------------------------------------
  if (t[0] === "dpkg" && (t.includes("-i") || t.includes("--install"))) {
    const filsti = t.find((x) => x.endsWith(".deb"));
    if (!filsti) return feil(state, cmd, "dpkg -i trenger en .deb-fil.");
    const filnavn = filsti.split("/").pop()!;
    const deb = DEB_FILER.find((d) => d.navn === filnavn);
    if (!deb || !state.filer.includes(filnavn)) {
      return feil(state, cmd, `dpkg: kan ikke få tilgang til arkivet '${filsti}': ingen slik fil`);
    }
    const ny = klone(state);
    const mangler = deb.depends.filter((d) => !ny.installert[d]);
    ny.installert[deb.pakke] = {
      navn: deb.pakke,
      version: deb.version,
      format: "deb",
      kilde: deb.navn,
      kildeType: "løs-fil",
      brutt: mangler.length > 0,
      manglerAvhengighet: mangler.length ? mangler : undefined,
    };
    if (!mangler.length) {
      return {
        state: ny,
        cmd,
        utfall: "installert",
        lines: [
          `Selecting previously unselected package ${deb.pakke}.`,
          `Unpacking ${deb.pakke} (${deb.version}) ...`,
          `Setting up ${deb.pakke} (${deb.version}) ...`,
          "",
          "(Det gikk bra fordi pakken ikke hadde avhengigheter. dpkg pakker ut ÉN fil og",
          " gjør ingen forsøk på å hente noe som mangler.)",
        ],
      };
    }
    return {
      state: ny,
      cmd,
      utfall: "installert-brutt",
      lines: [
        `Unpacking ${deb.pakke} (${deb.version}) ...`,
        `dpkg: dependency problems prevent configuration of ${deb.pakke}:`,
        ...mangler.map((m) => ` ${deb.pakke} depends on ${m}; however: Package ${m} is not installed.`),
        "",
        `dpkg: error processing package ${deb.pakke} (--install):`,
        " dependency problems - leaving unconfigured",
        "Errors were encountered while processing:",
        ` ${deb.pakke}`,
        "",
        "(Pakken er halvinstallert: filene ligger der, men den er ikke satt opp og virker ikke.",
        " dpkg kjenner ingen arkiver og kan derfor ikke hente det som mangler. `sudo apt install -f`",
        " rydder opp — eller bruk `apt install ./fil.deb` neste gang og slipp problemet.)",
      ],
    };
  }

  // ---- apt policy / apt-cache policy ------------------------------------
  if ((t[0] === "apt" || t[0] === "apt-cache") && t[1] === "policy") {
    const navn = t[2];
    if (!navn) {
      return {
        state,
        cmd,
        utfall: "policy",
        lines: state.kilder.map((id) => {
          const r = repoById(id)!;
          return ` 500 ${r.url} noble/main amd64 Packages  [${r.type}]`;
        }),
      };
    }
    const inst = state.installert[navn];
    const kand = state.indeks[navn];
    return {
      state,
      cmd,
      utfall: "policy",
      lines: [
        `${navn}:`,
        `  Installed: ${inst ? inst.version : "(none)"}`,
        `  Candidate: ${kand ? kand.version : "(none)"}`,
        "  Version table:",
        ...(kand ? [`     ${kand.version} 500`, `        500 ${repoById(kand.repo)?.url} noble/main amd64 Packages`] : []),
        ...(inst && inst.kildeType === "løs-fil"
          ? ["", "(Installed uten Candidate betyr at pakken kom fra en løs fil. Ingen arkiv kjenner den,", " så den blir aldri oppdatert.)"]
          : []),
        ...(kand && inst && sammenlignVersjon(kand.version, inst.version) > 0
          ? ["", `(Candidate er nyere enn Installed — \`sudo apt install ${navn}\` oppgraderer.)`]
          : []),
      ],
    };
  }

  // ---- apt search --------------------------------------------------------
  if ((t[0] === "apt" || t[0] === "apt-cache") && (t[1] === "search" || t[1] === "list")) {
    const term = t[2] ?? "";
    const treff = Object.entries(state.indeks).filter(([n]) => n.includes(term));
    return {
      state,
      cmd,
      utfall: "sok",
      lines: treff.length
        ? treff.map(([n, v]) => `${n}/${repoById(v.repo)?.id} ${v.version} amd64`)
        : [`Ingen treff på «${term}».`, state.indeksUtdatert ? "(Indeksen er utdatert — kjør `sudo apt update`.)" : ""],
    };
  }

  // ---- apt remove / purge ------------------------------------------------
  if ((t[0] === "apt" || t[0] === "apt-get") && (t[1] === "remove" || t[1] === "purge")) {
    const navn = t[2];
    if (!navn || !state.installert[navn]) return feil(state, cmd, `E: Pakken ${navn ?? ""} er ikke installert.`);
    const ny = klone(state);
    delete ny.installert[navn];
    if (navn === "flatpak") {
      ny.flatpakInstallert = false;
      ny.flatpakRemotes = [];
    }
    return {
      state: ny,
      cmd,
      utfall: "fjernet",
      lines: [
        `Fjerner ${navn} ...`,
        t[1] === "purge"
          ? "(purge sletter også oppsettsfilene i /etc. remove lar dem stå.)"
          : "(remove lar oppsettsfilene i /etc stå igjen. purge fjerner dem også.)",
      ],
    };
  }

  // ---- snap --------------------------------------------------------------
  if (t[0] === "snap") {
    if (t[1] === "list") {
      const snaps = Object.values(state.installert).filter((p) => p.format === "snap");
      return {
        state,
        cmd,
        utfall: "listing",
        lines: snaps.length ? ["Name  Version  Publisher", ...snaps.map((s) => `${s.navn}  ${s.version}  -`)] : ["Ingen snap-pakker installert."],
      };
    }
    if (t[1] === "install") {
      const navn = t[2];
      const pk = navn ? SNAP_PAKKER[navn] : undefined;
      if (!pk) return feil(state, cmd, `error: snap "${navn ?? ""}" not found`);
      if (pk.classicKrevd && !t.includes("--classic")) {
        return feil(
          state,
          cmd,
          `error: This revision of snap "${navn}" was published using classic confinement`,
          "Bruk --classic hvis du stoler på utgiveren.",
          "",
          "(En snap kjører normalt i en sandkasse med sterkt begrenset tilgang til resten av",
          " systemet. --classic slår av sandkassa. En kodeeditor trenger tilgang til alle filene",
          " dine, derfor krever den det — men da har du også gitt fra deg beskyttelsen.)",
        );
      }
      const ny = klone(state);
      ny.installert[navn] = { navn, version: pk.version, format: "snap", kilde: "snapcraft.io", kildeType: "snap" };
      return {
        state: ny,
        cmd,
        utfall: "installert",
        lines: [
          `${navn} ${pk.version} from Snapcrafters installed`,
          "",
          "(Merk hva som IKKE skjedde: ingen apt update, ingen avhengigheter, ingen kildeliste.",
          " En snap tar med seg alle bibliotekene sine inne i pakken og kjører i egen sandkasse.",
          " Prisen er diskplass og treg oppstart første gang.)",
        ],
      };
    }
    return feil(state, cmd, `snap: ukjent underkommando ${t[1] ?? ""}`);
  }

  // ---- flatpak -----------------------------------------------------------
  if (t[0] === "flatpak") {
    if (!state.flatpakInstallert) {
      return feil(
        state,
        cmd,
        "Kommandoen «flatpak» ble ikke funnet, men kan installeres med:",
        "sudo apt install flatpak",
        "",
        "(Flatpak er ikke en del av Ubuntu-installasjonen. Snap er det. Det er hele forskjellen",
        " i praksis: begge er sandkassede pakkeformater, men Ubuntu leverer det ene ferdig.)",
      );
    }
    if (t[1] === "remote-add") {
      const ny = klone(state);
      if (!ny.flatpakRemotes.includes("flathub")) ny.flatpakRemotes.push("flathub");
      return {
        state: ny,
        cmd,
        utfall: "kilde-lagt-til",
        lines: [
          "Fjernarkivet «flathub» er lagt til.",
          "",
          "(Flatpak har sitt EGET kildebegrep, helt adskilt fra /etc/apt/sources.list. En fersk",
          " flatpak-installasjon kan ingenting før du har lagt til et fjernarkiv.)",
        ],
      };
    }
    if (t[1] === "install") {
      const navn = t.slice(2).find((x) => x.includes("."));
      if (!state.flatpakRemotes.length) {
        return feil(state, cmd, "error: Ingen fjernarkiver er lagt til.", "Kjør: flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo");
      }
      const pk = navn ? FLATPAK_PAKKER[navn] : undefined;
      if (!pk) return feil(state, cmd, `error: Fant ingenting som passer ${navn ?? ""} i flathub`, "Prøv org.gimp.GIMP");
      const ny = klone(state);
      ny.installert[navn!] = { navn: navn!, version: pk.version, format: "flatpak", kilde: "flathub", kildeType: "flatpak" };
      return {
        state: ny,
        cmd,
        utfall: "installert",
        lines: [
          `Installerer ${navn} ${pk.version} fra flathub`,
          "",
          "(Legg merke til navnet: org.gimp.GIMP, ikke gimp. Flatpak bruker omvendt domenenavn",
          " som ID slik at to utgivere aldri kan kollidere.)",
        ],
      };
    }
    if (t[1] === "list") {
      const fp = Object.values(state.installert).filter((p) => p.format === "flatpak");
      return { state, cmd, utfall: "listing", lines: fp.length ? fp.map((p) => `${p.navn}  ${p.version}  flathub`) : ["Ingen flatpak installert."] };
    }
    return feil(state, cmd, `flatpak: ukjent underkommando ${t[1] ?? ""}`);
  }

  // ---- dpkg -l -----------------------------------------------------------
  if (t[0] === "dpkg" && (t.includes("-l") || t.includes("--list"))) {
    const rader = Object.values(state.installert).filter((p) => p.format === "deb");
    return {
      state,
      cmd,
      utfall: "listing",
      lines: [
        "ii = installert og satt opp, iU = pakket ut men IKKE satt opp",
        ...rader.map((p) => `${p.brutt ? "iU" : "ii"}  ${p.navn}  ${p.version}  ${p.kilde}`),
      ],
    };
  }

  return feil(state, cmd, `bash: ${t[0]}: kommandoen finnes ikke i dette øvingsmiljøet.`);
}

function lesKilder(state: AptState, cmd: string, sti: string): KjoreResultat {
  const iFil = state.kilder.map(repoById).filter((r): r is RepoDef => Boolean(r));
  if (sti === "/etc/apt/sources.list") {
    const linjer = iFil.filter((r) => r.fil === "/etc/apt/sources.list");
    return {
      state,
      cmd,
      utfall: "listing",
      lines: [
        "# Hovedkildelista. Hver linje er ett arkiv apt kan hente fra.",
        "# Format:  deb <adresse> <utgivelse> <komponenter>",
        ...linjer.map((r) => r.linje),
        "",
        "(Alt annet ligger som egne filer i /etc/apt/sources.list.d/. Det er der pakkeverktøy",
        " og tredjepartsinstallasjoner legger sine linjer, slik at de ikke tukler med denne.)",
      ],
    };
  }
  const treff = iFil.find((r) => r.fil === sti);
  if (!treff) return feil(state, cmd, `cat: ${sti}: ingen slik fil eller katalog`);
  return { state, cmd, utfall: "listing", lines: [treff.linje] };
}

// ---------------------------------------------------------------------------
// 4. Måloppgavene (oppgavetype 3) — tilstandssjekk, ikke strengsjekk
// ---------------------------------------------------------------------------

export type Verdict = "riktig" | "nesten" | "feil";

export interface CheckOutcome {
  verdict: Verdict;
  message: string;
}

export const ok = (message: string): CheckOutcome => ({ verdict: "riktig", message });
export const near = (message: string): CheckOutcome => ({ verdict: "nesten", message });
export const no = (message: string): CheckOutcome => ({ verdict: "feil", message });

export interface PakkeGoalTask {
  id: string;
  title: string;
  prompt: string;
  /** Hva som teller som løst, i klartekst. */
  goal: string;
  /** Én løsningsvei, steg for steg. Sjekken godtar flere. */
  fasit: string[];
  hint: string;
  takeaway: string;
  /** Starttilstanden oppgaven begynner i. */
  start: () => AptState;
  /** Sjekker MÅLTILSTANDEN. Historikken er med fordi noen mål handler om rekkefølge. */
  check: (s: AptState, historikk: KjoreResultat[]) => CheckOutcome;
}

const harKilde = (s: AptState, id: string) => s.kilder.includes(id);
const erInstallert = (s: AptState, navn: string) => Boolean(s.installert[navn]);

export const PAKKE_GOAL_TASKS: PakkeGoalTask[] = [
  {
    id: "pg1",
    title: "Nyere versjon enn Ubuntu tilbyr",
    prompt:
      "Ubuntu har obs-studio 30.0.2 i hovedarkivet. Du trenger 31, som bare finnes i prosjektets eget PPA (Personal Package Archive) ppa:obsproject/obs-studio. Få versjon 31 installert.",
    goal: "obs-studio installert i en 31-versjon, hentet fra PPA-en.",
    fasit: [
      "sudo add-apt-repository ppa:obsproject/obs-studio",
      "sudo apt update",
      "sudo apt install obs-studio",
    ],
    hint: "Tre steg: legg til kilden, hent den nye pakkelista, installer. Hopper du over det midterste, vet apt fortsatt bare om det gamle.",
    takeaway:
      "add-apt-repository skriver kildelinja OG henter signeringsnøkkelen. Men indeksen er fortsatt den gamle til du kjører apt update — apt installerer aldri noe den ikke har sett i en pakkeliste.",
    start: initialState,
    check: (s) => {
      const p = s.installert["obs-studio"];
      if (p && p.version.startsWith("31")) {
        return ok(`Installert: obs-studio ${p.version} fra ${p.kilde}. Systemet holder den oppdatert automatisk så lenge PPA-en står i kildelista.`);
      }
      if (p && harKilde(s, "ppa-obs") && s.indeksUtdatert) {
        return near("Kilden er lagt til, men indeksen er ikke hentet inn ennå — du installerte fortsatt den gamle versjonen fra hovedarkivet. Kjør `sudo apt update` og installer på nytt.");
      }
      if (p) {
        return near(`Du fikk obs-studio ${p.version}, altså versjonen fra Ubuntu sitt hovedarkiv. PPA-en er ikke lagt til, så apt kjenner ikke versjon 31 i det hele tatt.`);
      }
      if (harKilde(s, "ppa-obs") && !s.indeksUtdatert) {
        return near("Kilden er på plass og indeksen er hentet — det som gjenstår er selve installasjonen: `sudo apt install obs-studio`.");
      }
      if (harKilde(s, "ppa-obs")) {
        return near("Kilden er lagt til. Neste steg er `sudo apt update`, ellers vet ikke apt at det finnes noe nytt der.");
      }
      return no("Ingenting er lagt til ennå. Start med å legge PPA-en inn som kilde.");
    },
  },
  {
    id: "pg2",
    title: "Tredjepartsarkiv med egen nøkkel",
    prompt:
      "Docker har sitt eget pakkearkiv. Legg inn signeringsnøkkelen, skriv kildelinja, og installer docker-ce. Nøkkelen ligger på https://download.docker.com/linux/ubuntu/gpg og skal i /etc/apt/keyrings/docker.asc.",
    goal: "docker-ce installert fra Docker sitt eget arkiv, med nøkkelen i nøkkelringen.",
    fasit: [
      "sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc",
      'echo "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" | sudo tee /etc/apt/sources.list.d/docker.list',
      "sudo apt update",
      "sudo apt install docker-ce",
    ],
    hint: "add-apt-repository gjorde to jobber for deg forrige gang. Her må du gjøre begge selv — og nøkkelen må inn FØR update, ellers avvises arkivet.",
    takeaway:
      "GPG = GNU Privacy Guard. apt sjekker at pakkelista er signert med en nøkkel den har. Mangler nøkkelen, hopper apt over hele arkivet med NO_PUBKEY. signed-by= binder nøkkelen til nøyaktig dette arkivet, slik at Docker sin nøkkel ikke kan brukes til å signere noe som utgir seg for å være fra Ubuntu.",
    start: initialState,
    check: (s, h) => {
      const harNokkel = s.nokler.includes("docker-archive-keyring");
      if (erInstallert(s, "docker-ce")) {
        return ok("Docker er installert fra sitt eget arkiv, og arkivet er signert med en nøkkel systemet har. Det er slik alle seriøse tredjepartskilder settes opp i dag.");
      }
      if (harKilde(s, "docker") && !harNokkel) {
        return near("Kildelinja er på plass, men nøkkelen mangler. Kjør `sudo apt update` og les feilmeldingen — apt avviser arkivet med NO_PUBKEY. Hent nøkkelen først.");
      }
      if (harKilde(s, "docker") && harNokkel && s.indeksUtdatert) {
        return near("Nøkkel og kilde er på plass. Nå mangler bare `sudo apt update` og deretter installasjonen.");
      }
      if (harKilde(s, "docker") && harNokkel) {
        return near("Alt er klart — kjør `sudo apt install docker-ce`.");
      }
      if (harNokkel) return near("Nøkkelen er på plass, men apt vet fortsatt ikke hvor den skal hente fra. Skriv kildelinja til /etc/apt/sources.list.d/docker.list.");
      if (h.some((r) => r.cmd.includes("apt-key"))) {
        return near("apt-key er avviklet nettopp fordi den la nøkkelen i én felles ring som gjaldt alle arkiver. Bruk /etc/apt/keyrings/ og signed-by= i stedet.");
      }
      return no("Ingen nøkkel og ingen kilde ennå. Begynn med nøkkelen — uten den blir arkivet avvist uansett.");
    },
  },
  {
    id: "pg3",
    title: "Løs .deb-fil, gjort riktig",
    prompt:
      "Filen ~/Nedlastinger/slack-desktop.deb er lastet ned fra leverandørens nettside. Den trenger biblioteket libappindicator3-1, som du ikke har. Installer den slik at den faktisk virker med én gang.",
    goal: "slack-desktop installert og satt opp — ikke i brutt tilstand — og avhengigheten på plass.",
    fasit: ["sudo apt update", "sudo apt install ./Nedlastinger/slack-desktop.deb"],
    hint: "Ett av de to verktøyene kjenner arkivene og kan hente det som mangler. Det andre gjør ikke. Og apt trenger en skråstrek i navnet for å skjønne at du mener en fil.",
    takeaway:
      "dpkg installerer ÉN fil og stopper hvis noe mangler — pakken blir liggende halvferdig (iU). apt install ./fil.deb gjør det samme, men henter avhengighetene fra arkivene på veien. Derfor er apt nesten alltid riktig valg, selv for løse filer.",
    start: initialState,
    check: (s, h) => {
      const p = s.installert["slack-desktop"];
      if (p && !p.brutt && erInstallert(s, "libappindicator3-1")) {
        const viaDpkg = h.some((r) => r.utfall === "installert-brutt");
        return viaDpkg
          ? ok("Målet er nådd — du gikk innom den brutte tilstanden og reparerte den med apt. Det er en helt gyldig vei, og verdt å ha sett en gang.")
          : ok("Riktig. apt godtok filstien, hentet libappindicator3-1 fra arkivet og satte opp pakken i én operasjon.");
      }
      if (p && p.brutt) {
        return near(`Pakken er pakket ut, men ikke satt opp — den mangler ${(p.manglerAvhengighet ?? []).join(", ")}. Det er dpkg sin begrensning. Fiks det med \`sudo apt install -f\`.`);
      }
      if (h.some((r) => r.lines.some((l) => l.includes("Unable to locate package slack-desktop.deb")))) {
        return near("Du er på riktig verktøy. apt tolket bare navnet som et pakkenavn. Sett ./ foran filnavnet så skjønner den at det er en fil.");
      }
      if (h.some((r) => r.cmd.includes(".deb"))) {
        return near("Du har prøvd deg på filen, men den er ikke installert. Sjekk feilmeldingen — er indeksen hentet inn, så apt vet hvor avhengigheten finnes?");
      }
      return no("Filen er ikke installert ennå. Se hva som ligger i ~/Nedlastinger og prøv deg fram.");
    },
  },
  {
    id: "pg4",
    title: "Samme program, annet pakkeformat",
    prompt:
      "Du vil ha Visual Studio Code, men det finnes ikke i noe apt-arkiv du har. Det finnes som snap. Installer det.",
    goal: "code installert som snap-pakke.",
    fasit: ["sudo snap install code --classic"],
    hint: "Snap har ingen kildeliste og ingen apt update. Men den har sandkasse — og noen programmer må ha den slått av.",
    takeaway:
      "En snap tar med alle bibliotekene sine og kjører i sandkasse, så den bryr seg ikke om hvilken Linux du har. --classic slår av sandkassa, som en kodeeditor må ha for å nå filene dine. Da har du også gitt fra deg beskyttelsen — det er en avveining, ikke en formalitet.",
    start: initialState,
    check: (s, h) => {
      const p = s.installert["code"];
      if (p && p.format === "snap") return ok("Installert som snap. Ingen kildelinje, ingen apt update, ingen avhengigheter — hele poenget med formatet.");
      if (h.some((r) => r.lines.some((l) => l.includes("classic confinement")))) {
        return near("Nesten. Snap-en krever at du bekrefter at sandkassa skal av: legg til --classic.");
      }
      if (h.some((r) => r.cmd.startsWith("sudo apt install code") || r.cmd.startsWith("apt install code"))) {
        return near("apt finner den ikke, og det er riktig — pakken finnes ikke i noe arkiv du har. Prøv det andre pakkeformatet.");
      }
      return no("Ikke installert ennå. Programmet finnes ikke som .deb her, så apt kommer ikke til å hjelpe deg.");
    },
  },
  {
    id: "pg5",
    title: "Rydd opp etter en PPA du ikke vil ha",
    prompt:
      "Du la til ppa:obsproject/obs-studio og installerte obs-studio 31 derfra. Nå vil du ikke ha PPA-en lenger. Fjern kilden, og bekreft med et oppslag at pakken du har ikke lenger har noe arkiv bak seg.",
    goal: "PPA-en fjernet fra kildelista, indeksen bygget på nytt, og du har sett hva apt policy sier om obs-studio etterpå.",
    fasit: [
      "sudo add-apt-repository --remove ppa:obsproject/obs-studio",
      "sudo apt update",
      "apt policy obs-studio",
    ],
    hint: "Å fjerne kilden fjerner ikke pakken. Sammenlign «Installed» og «Candidate» etterpå — der ligger hele historien.",
    takeaway:
      "Fjerner du en PPA, blir pakkene derfra stående som foreldreløse: installert, men uten arkiv som tilbyr oppdateringer. Da er «Installed» nyere enn «Candidate», og systemet vil aldri rette et sikkerhetshull i den. Verktøyet ppa-purge ruller dem tilbake til distribusjonens versjon.",
    start: () => {
      const s = initialState();
      s.kilder.push("ppa-obs");
      s.nokler.push("obsproject-ppa-key");
      s.indeks = byggIndeks(s).indeks;
      s.indeksUtdatert = false;
      s.installert["obs-studio"] = {
        navn: "obs-studio",
        version: "31.0.1-0obsproject1",
        format: "deb",
        kilde: "ppa-obs",
        kildeType: "ppa",
      };
      return s;
    },
    check: (s, h) => {
      const fjernet = !harKilde(s, "ppa-obs");
      const sjekket = h.some((r) => r.utfall === "policy" && r.cmd.includes("obs-studio"));
      if (fjernet && !s.indeksUtdatert && sjekket) {
        return ok(
          "Riktig. apt policy viser nå Installed 31.0.1 og Candidate 30.0.2 — du har en pakke som er NYERE enn alt systemet kjenner. Den blir aldri oppdatert igjen.",
        );
      }
      if (fjernet && sjekket && s.indeksUtdatert) {
        return near("Kilden er fjernet og du har sjekket policy, men indeksen er ikke bygget på nytt — tallene du så er fortsatt fra før fjerningen. Kjør `sudo apt update` og se igjen.");
      }
      if (fjernet && !s.indeksUtdatert) {
        return near("Kilden er borte og indeksen er oppdatert. Siste steg: `apt policy obs-studio` — se hva som står under Installed og Candidate.");
      }
      if (fjernet) return near("Kilden er fjernet. Kjør `sudo apt update` slik at indeksen faktisk speiler det, og se så på apt policy.");
      if (!erInstallert(s, "obs-studio")) {
        return near("Du avinstallerte pakken. Det løser problemet, men oppgaven handlet om hva som skjer med en pakke som BLIR stående når kilden forsvinner.");
      }
      return no("PPA-en står fortsatt i kildelista. Fjern den først.");
    },
  },
  {
    id: "pg6",
    title: "Flatpak fra bunnen av",
    prompt:
      "Du vil installere GIMP som flatpak (pakke-ID org.gimp.GIMP). Ingenting av flatpak er satt opp på maskinen ennå. Få det til.",
    goal: "flatpak-programmet installert, fjernarkivet flathub lagt til, og org.gimp.GIMP installert.",
    fasit: [
      "sudo apt update",
      "sudo apt install flatpak",
      "flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
      "flatpak install flathub org.gimp.GIMP",
    ],
    hint: "Flatpak er ikke installert på Ubuntu som standard — det må hentes med apt først. Og flatpak har sitt eget kildebegrep, adskilt fra apt sitt.",
    takeaway:
      "Snap og flatpak løser samme problem på hver sin måte: ett program, alle bibliotekene med i pakken, sandkasse rundt. Forskjellen i praksis er at Ubuntu leverer snap ferdig installert med ett innebygd arkiv, mens flatpak må installeres og få et fjernarkiv (flathub) før den kan noe som helst.",
    start: initialState,
    check: (s, h) => {
      if (erInstallert(s, "org.gimp.GIMP")) {
        return ok("Hele kjeden er på plass: apt installerte flatpak, flatpak fikk et fjernarkiv, og pakken kom derfra. Tre lag med pakkehåndtering oppå hverandre.");
      }
      if (s.flatpakInstallert && s.flatpakRemotes.length) {
        return near("Flatpak er klart og flathub er lagt til. Nå gjenstår selve installasjonen — husk at ID-en er org.gimp.GIMP, ikke gimp.");
      }
      if (s.flatpakInstallert) {
        return near("Flatpak-programmet er installert, men det har ingen steder å hente fra ennå. Legg til fjernarkivet flathub.");
      }
      if (h.some((r) => r.cmd.startsWith("flatpak"))) {
        return near("Kommandoen finnes ikke ennå — flatpak er ikke en del av Ubuntu. Installer den med apt først.");
      }
      return no("Ingenting er satt opp. Første steg er å skaffe selve flatpak-programmet.");
    },
  },
];

// ---------------------------------------------------------------------------
// 5. Feilsøkingsoppgavene (oppgavetype 4)
// ---------------------------------------------------------------------------

export interface PakkeTroubleTask {
  id: string;
  title: string;
  transcript: { cmd: string; output: string[] }[];
  question: string;
  options: { id: string; label: string; why: string; correct?: boolean }[];
  fix: { cmd: string; text: string };
  lesson: string;
}

export const PAKKE_TROUBLE_TASKS: PakkeTroubleTask[] = [
  {
    id: "pt1",
    title: "Arkivet som ble hoppet over",
    transcript: [
      {
        cmd: 'echo "deb https://download.docker.com/linux/ubuntu noble stable" | sudo tee /etc/apt/sources.list.d/docker.list',
        output: ["deb https://download.docker.com/linux/ubuntu noble stable"],
      },
      {
        cmd: "sudo apt update",
        output: [
          "Get:1 http://archive.ubuntu.com/ubuntu noble InRelease [128 kB]",
          "Err:2 https://download.docker.com/linux/ubuntu noble InRelease",
          "  The following signatures couldn't be verified because the public key is not available: NO_PUBKEY docker-archive-keyring",
          "Reading package lists... Done",
          "W: Arkivet «Docker sitt eget arkiv» er hoppet over.",
        ],
      },
      { cmd: "sudo apt install docker-ce", output: ["E: Unable to locate package docker-ce"] },
    ],
    question:
      "Kildelinja står helt riktig i filen, og adressen svarer. Hvorfor finner ikke apt pakken?",
    options: [
      {
        id: "a",
        label:
          "Arkivet er signert med en nøkkel systemet ikke har. apt nekter å bruke pakkelister den ikke kan verifisere, så hele arkivet er usynlig.",
        why: "Riktig. NO_PUBKEY betyr nøyaktig dette: signaturen finnes, men den offentlige nøkkelen som kan sjekke den mangler.",
        correct: true,
      },
      {
        id: "b",
        label: "Pakkenavnet er feil — den heter docker.io, ikke docker-ce.",
        why: "docker.io er Ubuntu sin egen pakke, men det er ikke problemet her: feilmeldingen fra update sier rett ut at arkivet ble hoppet over.",
      },
      {
        id: "c",
        label: "Ubuntu-utgivelsen «noble» støttes ikke av Docker.",
        why: "Da ville update gitt 404 på selve filen, ikke en signaturfeil. Arkivet svarte fint — apt ville bare ikke stole på svaret.",
      },
      {
        id: "d",
        label: "Kildelinja må ligge i /etc/apt/sources.list, ikke i sources.list.d/.",
        why: "Begge deler fungerer. sources.list.d/ er tvert imot det anbefalte stedet for alt som ikke er distribusjonens egne linjer.",
      },
    ],
    fix: {
      cmd: "sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc",
      text: "Hent nøkkelen først, kjør `sudo apt update` på nytt, og pakken dukker opp. Legg dessuten til signed-by=/etc/apt/keyrings/docker.asc i kildelinja, slik at nøkkelen bare gjelder dette ene arkivet.",
    },
    lesson:
      "En advarsel fra apt update er ikke kosmetikk. Blir et arkiv hoppet over, er alt innholdet borte for apt — og feilen viser seg først som «Unable to locate package» i neste kommando, langt fra der årsaken var.",
  },
  {
    id: "pt2",
    title: "Halvinstallert pakke",
    transcript: [
      {
        cmd: "sudo dpkg -i slack-desktop.deb",
        output: [
          "Unpacking slack-desktop (4.38.125) ...",
          "dpkg: dependency problems prevent configuration of slack-desktop:",
          " slack-desktop depends on libappindicator3-1; however: Package libappindicator3-1 is not installed.",
          "Errors were encountered while processing:",
          " slack-desktop",
        ],
      },
      { cmd: "slack", output: ["(programmet starter ikke)"] },
      {
        cmd: "dpkg -l | grep slack",
        output: ["iU  slack-desktop  4.38.125  slack-desktop.deb"],
      },
    ],
    question:
      "Filene er pakket ut, men programmet virker ikke, og statusen er «iU» i stedet for «ii». Hva er situasjonen?",
    options: [
      {
        id: "a",
        label: ".deb-filen er skadet under nedlastingen og må lastes ned på nytt.",
        why: "Da ville dpkg klaget på selve arkivet før utpakkingen. Her ble den pakket helt ut — feilen kom i oppsettssteget etterpå.",
      },
      {
        id: "b",
        label:
          "dpkg pakket ut filene, men kunne ikke sette opp pakken fordi en avhengighet mangler. dpkg kjenner ingen arkiver og kan ikke hente den selv.",
        why: "Riktig. «U» i iU står for unpacked: filene ligger der, konfigurasjonssteget er aldri kjørt. Det er nettopp arbeidsdelingen mellom dpkg og apt.",
        correct: true,
      },
      {
        id: "c",
        label: "Pakken krever root-rettigheter for å kjøre, og du startet den som vanlig bruker.",
        why: "Rettigheter har ingenting med dette å gjøre — dpkg sier eksplisitt hvilken pakke som mangler.",
      },
      {
        id: "d",
        label: "Pakken er bygget for feil arkitektur.",
        why: "Da ville dpkg avvist den med «package architecture does not match system», ikke med et avhengighetsproblem.",
      },
    ],
    fix: {
      cmd: "sudo apt install -f",
      text: "apt ser den halvferdige pakken, henter libappindicator3-1 fra arkivet og fullfører oppsettet. Neste gang: `sudo apt install ./slack-desktop.deb` gjør alt i ett steg, fordi apt godtar en filsti og fortsatt har arkivene tilgjengelig.",
    },
    lesson:
      "dpkg er lavnivåverktøyet som håndterer én fil. apt er laget rundt det og kjenner arkivene. Bruker du dpkg direkte, har du valgt bort avhengighetshåndteringen — som regel uten å mene det.",
  },
  {
    id: "pt3",
    title: "Pakken som aldri blir oppdatert",
    transcript: [
      {
        cmd: "apt policy obs-studio",
        output: [
          "obs-studio:",
          "  Installed: 31.0.1-0obsproject1",
          "  Candidate: 30.0.2-1",
          "  Version table:",
          "     30.0.2-1 500",
          "        500 http://archive.ubuntu.com/ubuntu noble/main amd64 Packages",
        ],
      },
      { cmd: "sudo apt upgrade", output: ["0 oppgradert, 0 nyinstallert, 0 å fjerne."] },
    ],
    question:
      "Den installerte versjonen er nyere enn kandidaten, og apt upgrade gjør ingenting. Hva har skjedd?",
    options: [
      {
        id: "a",
        label: "Pakken er holdt tilbake med apt-mark hold.",
        why: "Da ville apt upgrade sagt «følgende pakker er holdt tilbake». Her ser apt rett og slett ingen nyere versjon å tilby.",
      },
      {
        id: "b",
        label:
          "Pakken ble installert fra et arkiv som senere er fjernet fra kildelista. Ingen aktiv kilde tilbyr versjon 31, så det finnes ingenting å oppgradere til.",
        why: "Riktig. Versjonstabellen viser bare hovedarkivet — PPA-en som leverte 31 er ikke der lenger. Pakken er foreldreløs.",
        correct: true,
      },
      {
        id: "c",
        label: "apt update er ikke kjørt, så indeksen er tom.",
        why: "Indeksen er tydeligvis i orden — den vet at hovedarkivet har 30.0.2.",
      },
      {
        id: "d",
        label: "Versjon 31 er merket som eksperimentell og krever et eget flagg.",
        why: "apt har ikke noe slikt begrep i standardoppsettet. En versjon er enten i et arkiv du har, eller så finnes den ikke for deg.",
      },
    ],
    fix: {
      cmd: "sudo add-apt-repository ppa:obsproject/obs-studio",
      text: "Enten legger du kilden tilbake, eller så ruller du pakken tilbake til distribusjonens versjon (verktøyet ppa-purge gjør nettopp det). Å la den bli stående er det dårligste alternativet: den får aldri en sikkerhetsoppdatering igjen.",
    },
    lesson:
      "Installed nyere enn Candidate er alltid et varsel. Det betyr at pakken kom fra et sted systemet ikke lenger snakker med — enten en fjernet PPA eller en løs .deb-fil.",
  },
  {
    id: "pt4",
    title: "Nyinstallert kilde, ingen ny pakke",
    transcript: [
      {
        cmd: "sudo add-apt-repository ppa:obsproject/obs-studio",
        output: ["Repository: 'deb https://ppa.launchpadcontent.net/obsproject/obs-studio/ubuntu noble main'", "Henter signeringsnøkkel ... OK"],
      },
      {
        cmd: "sudo apt install obs-studio",
        output: ["obs-studio er allerede den nyeste versjonen (30.0.2-1).", "0 oppgradert, 0 nyinstallert."],
      },
    ],
    question:
      "Kilden er lagt til, nøkkelen er hentet, og PPA-en har versjon 31. Hvorfor sier apt at 30.0.2 er nyeste?",
    options: [
      {
        id: "a",
        label: "PPA-en har ikke bygget pakken for denne Ubuntu-versjonen ennå.",
        why: "Mulig i virkeligheten, men da ville pakkelista vært hentet og tom. Her er lista aldri hentet i det hele tatt.",
      },
      {
        id: "b",
        label:
          "`apt update` er ikke kjørt. Å legge til en kilde skriver bare en linje i en fil — indeksen apt slår opp i er fortsatt den gamle.",
        why: "Riktig. add-apt-repository endrer oppsettet; det er update som faktisk henter pakkelistene og bygger indeksen på nytt.",
        correct: true,
      },
      {
        id: "c",
        label: "Signeringsnøkkelen ble ikke godtatt.",
        why: "Utdataen sier «Henter signeringsnøkkel ... OK». Og en avvist nøkkel ville gitt NO_PUBKEY under update.",
      },
      {
        id: "d",
        label: "Ubuntu-arkivet har høyere prioritet enn PPA-er, så versjonen derfra vinner alltid.",
        why: "Uten pinning vinner høyeste versjonsnummer, uansett arkiv. Det er nettopp derfor en PPA kan overstyre distribusjonens pakke.",
      },
    ],
    fix: {
      cmd: "sudo apt update",
      text: "Hent pakkelistene, så dukker 31.0.1 opp som kandidat. Deretter installerer `sudo apt install obs-studio` den nye versjonen.",
    },
    lesson:
      "Skillet update / upgrade / install gjelder også her: update henter LISTA, upgrade oppgraderer det som allerede er installert, install henter én pakke. Endrer du kildene, er update alltid neste steg.",
  },
  {
    id: "pt5",
    title: "Ett program, tre installasjoner",
    transcript: [
      { cmd: "which obs", output: ["/snap/bin/obs"] },
      { cmd: "apt policy obs-studio", output: ["  Installed: 30.0.2-1", "  Candidate: 30.0.2-1"] },
      { cmd: "snap list obs-studio", output: ["obs-studio  31.0.1  -"] },
      { cmd: "flatpak list", output: ["com.obsproject.Studio  31.0.1  flathub"] },
    ],
    question:
      "Brukeren klager over at innstillingene forsvinner mellom hver gang, og at det «er feil versjon». Hva er egentlig situasjonen?",
    options: [
      {
        id: "a",
        label: "Programmet er installert tre ganger i tre ulike pakkeformater. Hvilket som starter, avgjøres av PATH — her snap-versjonen, siden /snap/bin kommer først.",
        why: "Riktig. De tre installasjonene vet ikke om hverandre og har hver sin oppsettskatalog, så innstillingene ser tilfeldige ut avhengig av hvilken som startes.",
        correct: true,
      },
      {
        id: "b",
        label: "Snap-versjonen har ødelagt apt-installasjonen.",
        why: "Formatene rører ikke hverandre i det hele tatt — det er nettopp derfor de kan sameksistere uten at noen sier ifra.",
      },
      {
        id: "c",
        label: "Flatpak-versjonen kjører i sandkasse og kan ikke lagre innstillinger.",
        why: "Flatpak lagrer innstillinger fint, bare i sin egen katalog under ~/.var/app/. Det er en annen katalog, ikke en manglende en.",
      },
      {
        id: "d",
        label: "apt policy viser feil fordi indeksen er utdatert.",
        why: "Installed og Candidate er like, altså er apt-installasjonen konsistent med arkivet. Problemet er at det finnes to installasjoner til.",
      },
    ],
    fix: {
      cmd: "sudo snap remove obs-studio",
      text: "Velg ett format og fjern de andre. Er du usikker på hvilken som faktisk starter, spør systemet: `which obs` viser filen PATH treffer først. Innstillingene ligger i ~/.config for apt-versjonen, ~/snap/ for snap og ~/.var/app/ for flatpak.",
    },
    lesson:
      "Tre parallelle pakkesystemer på samme maskin er normalen på moderne Ubuntu, ikke et unntak. Ingen av dem varsler om at et program allerede finnes i et annet format — det er du som må holde orden.",
  },
];
