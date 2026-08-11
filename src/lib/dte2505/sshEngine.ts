// ---------------------------------------------------------------------------
// DTE-2505 Modul 6 — SSH (Secure Shell) og X (X Window System) som én
// tilstandsmaskin.
//
// De to hører sammen her fordi X-videresending (X-forwarding) går gjennom SSH:
// du kan ikke forstå `ssh -X` uten å vite både hva DISPLAY er og hva SSH-tunnelen
// gjør. Derfor deler de tilstand.
//
// Som resten av modulene er dette ren TypeScript uten React — kommandoene kan
// kjøres i en test og etterprøves uten å rendre noe.
//
// Navn skrevet ut første gang de brukes:
//   SSH   = Secure Shell
//   X     = X Window System (også kalt X11, fordi versjon 11 er den som overlevde)
//   SCP   = Secure Copy
//   SFTP  = SSH File Transfer Protocol
// ---------------------------------------------------------------------------

export interface Nokkelpar {
  /** Filnavnet i ~/.ssh/, uten mappe. Den offentlige er samme navn + ".pub". */
  navn: string;
  /** Nøkkeltypen: ed25519 (anbefalt i dag) eller rsa. */
  type: string;
  /** Sant når den private nøkkelen er kryptert med en passfrase. */
  passfrase: boolean;
}

export interface ConfigVert {
  alias: string;
  hostName: string;
  user?: string;
  port?: number;
  identityFile?: string;
  forwardX11?: boolean;
}

export interface SshState {
  /** Nøkkelpar i ~/.ssh/ på din egen maskin. */
  noklerLokalt: Nokkelpar[];
  /** Nøkler som er lastet inn i ssh-agent, altså låst opp for økta. */
  agentNokler: string[];
  /** Sant når ssh-agent kjører. */
  agentKjorer: boolean;
  /** Oppføringer i ~/.ssh/config. */
  config: ConfigVert[];
  /** Offentlige nøkler i ~/.ssh/authorized_keys PÅ TJENEREN. */
  autoriserteNokler: string[];
  /** Om tjeneren i det hele tatt tillater passordinnlogging. */
  tjenerTillaterPassord: boolean;
  /** Sant når du er logget inn på fjernmaskinen akkurat nå. */
  tilkoblet: boolean;
  /** Verdien av DISPLAY der du er nå. Null betyr ingen grafikk tilgjengelig. */
  display: string | null;
  /** DISPLAY på din egen maskin — X-tjeneren din. */
  lokalDisplay: string;
  /** Sant når X-tjeneren faktisk kjører lokalt (den gjør den ikke over en ren tekstøkt). */
  xTjenerKjorer: boolean;
  /** Sant når inneværende SSH-økt har X-videresending slått på. */
  xVideresending: boolean;
  /** Om tjeneren har X11Forwarding yes i sshd_config. */
  tjenerTillaterX11: boolean;
  /** Filer som er kopiert til fjernmaskinen. */
  overfort: string[];
}

export function initialSshState(): SshState {
  return {
    noklerLokalt: [],
    agentNokler: [],
    agentKjorer: true,
    config: [],
    autoriserteNokler: [],
    tjenerTillaterPassord: true,
    tilkoblet: false,
    display: ":0",
    lokalDisplay: ":0",
    xTjenerKjorer: true,
    xVideresending: false,
    tjenerTillaterX11: true,
    overfort: [],
  };
}

function klone(s: SshState): SshState {
  return {
    ...s,
    noklerLokalt: s.noklerLokalt.map((n) => ({ ...n })),
    agentNokler: [...s.agentNokler],
    config: s.config.map((c) => ({ ...c })),
    autoriserteNokler: [...s.autoriserteNokler],
    overfort: [...s.overfort],
  };
}

export const TJENER = { host: "login.uit.no", bruker: "student" };

export type SshUtfall =
  | "nokkel-laget"
  | "nokkel-kopiert"
  | "agent"
  | "config"
  | "tilkoblet"
  | "frakoblet"
  | "avvist"
  | "overfort"
  | "listing"
  | "grafikk"
  | "feil";

export interface SshResultat {
  state: SshState;
  cmd: string;
  lines: string[];
  utfall: SshUtfall;
  /** Sant når kommandoen ble kjørt PÅ fjernmaskinen. */
  pared: boolean;
}

const feil = (state: SshState, cmd: string, ...lines: string[]): SshResultat => ({
  state,
  cmd,
  lines,
  utfall: "feil",
  pared: state.tilkoblet,
});

/** Finner nøkkelnavnet i en sti som ~/.ssh/id_ed25519 eller id_ed25519.pub. */
function nokkelnavn(sti: string): string {
  return (sti.split("/").pop() ?? sti).replace(/\.pub$/, "");
}

/**
 * Kjører én kommandolinje. Ren funksjon: tilstanden inn endres aldri.
 *
 * Hvilken maskin kommandoen kjører på avgjøres av `state.tilkoblet` — det er
 * nettopp den forvirringen studenten skal lære å holde styr på.
 */
export function runSsh(state: SshState, input: string): SshResultat {
  const cmd = input.trim().replace(/\s+/g, " ");
  if (!cmd) return feil(state, cmd, "Skriv en kommando.");
  const t = cmd.split(" ");

  // ---- ssh-keygen --------------------------------------------------------
  if (t[0] === "ssh-keygen") {
    const typeIdx = t.indexOf("-t");
    const type = typeIdx >= 0 ? (t[typeIdx + 1] ?? "rsa") : "rsa";
    if (!["ed25519", "rsa", "ecdsa"].includes(type)) {
      return feil(state, cmd, `unknown key type ${type}`, "(Gyldige typer: ed25519, rsa, ecdsa. Bruk ed25519 med mindre du må snakke med noe eldgammelt.)");
    }
    const navn = `id_${type}`;
    const ny = klone(state);
    if (ny.noklerLokalt.some((n) => n.navn === navn)) {
      return {
        state: ny,
        cmd,
        utfall: "nokkel-laget",
        pared: false,
        lines: [`${navn} finnes allerede i ~/.ssh/. Overskriv (y/n)? n`, "(Lag heller et nytt nøkkelpar med -f og et annet filnavn.)"],
      };
    }
    const passfrase = !t.includes("-N") || t[t.indexOf("-N") + 1] !== '""';
    ny.noklerLokalt.push({ navn, type, passfrase });
    return {
      state: ny,
      cmd,
      utfall: "nokkel-laget",
      pared: false,
      lines: [
        `Generating public/private ${type} key pair.`,
        `Enter file in which to save the key (/home/student/.ssh/${navn}):`,
        passfrase ? "Enter passphrase (empty for no passphrase): ********" : "Enter passphrase (empty for no passphrase):",
        `Your identification has been saved in /home/student/.ssh/${navn}`,
        `Your public key has been saved in /home/student/.ssh/${navn}.pub`,
        "",
        "(To filer ble laget. Den UTEN .pub er den private — den forlater aldri maskinen din.",
        " Den MED .pub er den offentlige, og den skal du dele fritt. Passfrasen krypterer den",
        " private nøkkelen på disk, slik at en stjålet laptop ikke er det samme som en stjålet",
        " tilgang.)",
      ],
    };
  }

  // ---- ssh-copy-id -------------------------------------------------------
  if (t[0] === "ssh-copy-id") {
    const mål = t.find((x) => x.includes("@"));
    const iIdx = t.indexOf("-i");
    const valgt = iIdx >= 0 ? nokkelnavn(t[iIdx + 1] ?? "") : state.noklerLokalt[0]?.navn;
    if (!mål) return feil(state, cmd, "Bruk: ssh-copy-id [-i nøkkel] bruker@vert");
    if (!valgt || !state.noklerLokalt.some((n) => n.navn === valgt)) {
      return feil(
        state,
        cmd,
        "/usr/bin/ssh-copy-id: ERROR: No identities found",
        "(Du har ingen nøkkel å kopiere. Lag et nøkkelpar først med ssh-keygen.)",
      );
    }
    const ny = klone(state);
    if (!ny.autoriserteNokler.includes(valgt)) ny.autoriserteNokler.push(valgt);
    return {
      state: ny,
      cmd,
      utfall: "nokkel-kopiert",
      pared: false,
      lines: [
        `Number of key(s) added: 1`,
        `Now try logging into the machine, with:  "ssh '${mål}'"`,
        "",
        "(Den OFFENTLIGE nøkkelen ble lagt til på én linje i ~/.ssh/authorized_keys på tjeneren.",
        " Det er alt som skjedde. Du kunne gjort det for hånd med en teksteditor — ssh-copy-id",
        " passer bare på at rettighetene på fila blir riktige, noe SSH er svært kresen på.)",
      ],
    };
  }

  // ---- ssh-add -----------------------------------------------------------
  if (t[0] === "ssh-add") {
    const ny = klone(state);
    if (t.includes("-l")) {
      return {
        state: ny,
        cmd,
        utfall: "agent",
        pared: false,
        lines: ny.agentNokler.length
          ? ny.agentNokler.map((n) => `256 SHA256:… /home/student/.ssh/${n} (ED25519)`)
          : ["The agent has no identities."],
      };
    }
    if (t.includes("-D")) {
      ny.agentNokler = [];
      return { state: ny, cmd, utfall: "agent", pared: false, lines: ["All identities removed."] };
    }
    const valgt = t[1] ? nokkelnavn(t[1]) : state.noklerLokalt[0]?.navn;
    if (!valgt || !ny.noklerLokalt.some((n) => n.navn === valgt)) {
      return feil(state, cmd, `Could not open a connection to your authentication agent, or no such key: ${t[1] ?? ""}`);
    }
    if (!ny.agentNokler.includes(valgt)) ny.agentNokler.push(valgt);
    return {
      state: ny,
      cmd,
      utfall: "agent",
      pared: false,
      lines: [
        `Enter passphrase for /home/student/.ssh/${valgt}: ********`,
        `Identity added: /home/student/.ssh/${valgt}`,
        "",
        "(ssh-agent holder den opplåste nøkkelen i minnet så lenge du er logget inn. Nå slipper",
        " du å skrive passfrasen for hver eneste tilkobling — og nøkkelen ligger fortsatt kryptert",
        " på disk.)",
      ],
    };
  }

  // ---- skrive en Host-blokk til ~/.ssh/config ----------------------------
  // Fila redigeres normalt i vim, men her skriver vi den med printf/tee slik at
  // hele oppsettet blir én etterprøvbar kommando. Feltnavnene er de ekte.
  if (cmd.includes(".ssh/config") && /Host\s+\S/.test(cmd) && !cmd.startsWith("cat")) {
    const felt = (navn: string) => new RegExp(`${navn}\\s+([^\\s\\\\'"]+)`, "i").exec(cmd)?.[1];
    const alias = /Host\s+([^\s\\'"]+)/.exec(cmd)?.[1];
    if (!alias) return feil(state, cmd, "Fant ingen «Host <alias>» i teksten du skrev.");
    const ny = klone(state);
    const oppf: ConfigVert = {
      alias,
      hostName: felt("HostName") ?? TJENER.host,
      user: felt("User"),
      port: felt("Port") ? Number(felt("Port")) : undefined,
      identityFile: felt("IdentityFile") ? nokkelnavn(felt("IdentityFile")!) : undefined,
      forwardX11: /ForwardX11\s+yes/i.test(cmd),
    };
    ny.config = [...ny.config.filter((c) => c.alias !== alias), oppf];
    return {
      state: ny,
      cmd,
      utfall: "config",
      pared: false,
      lines: [
        `Lagt til i ~/.ssh/config:`,
        `Host ${oppf.alias}`,
        `    HostName ${oppf.hostName}`,
        ...(oppf.user ? [`    User ${oppf.user}`] : []),
        ...(oppf.port ? [`    Port ${oppf.port}`] : []),
        ...(oppf.identityFile ? [`    IdentityFile ~/.ssh/${oppf.identityFile}`] : []),
        ...(oppf.forwardX11 ? [`    ForwardX11 yes`] : []),
        "",
        `(Nå holder det å skrive \`ssh ${oppf.alias}\`. Og fordi scp, sftp og rsync leser den samme`,
        " fila, virker aliaset i alle sammen.)",
      ],
    };
  }

  // ---- ~/.ssh/config -----------------------------------------------------
  if (t[0] === "cat" && cmd.includes(".ssh/config")) {
    if (!state.config.length) {
      return { state, cmd, utfall: "listing", pared: false, lines: ["cat: /home/student/.ssh/config: ingen slik fil eller katalog"] };
    }
    const lines: string[] = [];
    for (const c of state.config) {
      lines.push(`Host ${c.alias}`);
      lines.push(`    HostName ${c.hostName}`);
      if (c.user) lines.push(`    User ${c.user}`);
      if (c.port) lines.push(`    Port ${c.port}`);
      if (c.identityFile) lines.push(`    IdentityFile ~/.ssh/${c.identityFile}`);
      if (c.forwardX11) lines.push(`    ForwardX11 yes`);
      lines.push("");
    }
    return { state, cmd, utfall: "listing", pared: false, lines };
  }
  if (t[0] === "cat" && cmd.includes("authorized_keys")) {
    return {
      state,
      cmd,
      utfall: "listing",
      pared: state.tilkoblet,
      lines: state.autoriserteNokler.length
        ? state.autoriserteNokler.map((n) => `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI… student@laptop  (fra ${n}.pub)`)
        : ["(fila er tom — ingen nøkler er autorisert for denne kontoen)"],
    };
  }
  if (t[0] === "ls" && cmd.includes(".ssh")) {
    const filer = state.noklerLokalt.flatMap((n) => [n.navn, `${n.navn}.pub`]);
    if (state.config.length) filer.push("config");
    filer.push("known_hosts");
    return { state, cmd, utfall: "listing", pared: false, lines: filer.length ? [filer.join("  ")] : ["(tom)"] };
  }

  // ---- ssh ---------------------------------------------------------------
  if (t[0] === "ssh") {
    if (state.tilkoblet) {
      return feil(state, cmd, "Du er allerede logget inn på fjernmaskinen. (Du KAN hoppe videre derfra, men her holder vi det til én.)");
    }
    const vilX = t.includes("-X") || t.includes("-Y");
    const mål = t.find((x) => !x.startsWith("-") && x !== "ssh" && !/^\d+$/.test(x));
    if (!mål) return feil(state, cmd, "usage: ssh [-X] [-i identity_file] [-p port] destination");

    // Alias fra ~/.ssh/config?
    const alias = state.config.find((c) => c.alias === mål);
    const bruker = alias?.user ?? (mål.includes("@") ? mål.split("@")[0] : "student");
    const vert = alias?.hostName ?? (mål.includes("@") ? mål.split("@")[1] : mål);
    const nokkelValgt = alias?.identityFile ?? (t.includes("-i") ? nokkelnavn(t[t.indexOf("-i") + 1] ?? "") : undefined);
    const xØnsket = vilX || Boolean(alias?.forwardX11);

    const brukbareNokler = nokkelValgt ? [nokkelValgt] : state.noklerLokalt.map((n) => n.navn);
    const nokkelGodtatt = brukbareNokler.find((n) => state.autoriserteNokler.includes(n));

    const ny = klone(state);
    const lines: string[] = [];
    if (alias) {
      lines.push(`(«${mål}» ble slått opp i ~/.ssh/config: ${bruker}@${vert}${alias.port ? `:${alias.port}` : ""}${alias.forwardX11 ? " med X-videresending" : ""})`);
    }

    if (nokkelGodtatt) {
      const nokkel = ny.noklerLokalt.find((n) => n.navn === nokkelGodtatt);
      if (nokkel?.passfrase && !ny.agentNokler.includes(nokkelGodtatt)) {
        lines.push(`Enter passphrase for key '/home/student/.ssh/${nokkelGodtatt}': ********`);
      }
      lines.push(`Authenticated with ${nokkelGodtatt}.`);
    } else if (ny.tjenerTillaterPassord) {
      lines.push(
        `${bruker}@${vert}'s password: ********`,
        ...(ny.noklerLokalt.length
          ? ["(Du HAR en nøkkel, men tjeneren kjenner den ikke. Kjør ssh-copy-id for å legge den offentlige delen i authorized_keys der.)"]
          : []),
      );
    } else {
      return {
        state: ny,
        cmd,
        utfall: "avvist",
        pared: false,
        lines: [
          `${bruker}@${vert}: Permission denied (publickey).`,
          "",
          "(Tjeneren har slått av passordinnlogging. Da er nøkkel eneste vei inn — og nøkkelen din",
          " ligger ikke i authorized_keys der. Legg den inn med ssh-copy-id fra en maskin som",
          " allerede har tilgang.)",
        ],
      };
    }

    ny.tilkoblet = true;
    lines.push(`Welcome to Ubuntu 24.04.1 LTS`, `Last login: Sun Aug  9 19:12:04 2026 from 129.242.1.1`);

    if (xØnsket) {
      if (!ny.tjenerTillaterX11) {
        ny.xVideresending = false;
        ny.display = null;
        lines.push(
          "X11 forwarding request failed on channel 0",
          "",
          "(Du ba om X-videresending, men tjeneren har X11Forwarding no i /etc/ssh/sshd_config.",
          " Innlogging virker fint — bare ikke grafikken.)",
        );
      } else if (!ny.xTjenerKjorer) {
        ny.xVideresending = false;
        ny.display = null;
        lines.push(
          "Warning: No xauth data; using fake authentication data for X11 forwarding.",
          "",
          "(Det er ingen X-tjener på DIN side heller. X-videresending sender vinduene hjem til",
          " din skjerm — finnes ingen skjerm, er det ingenting å sende til.)",
        );
      } else {
        ny.xVideresending = true;
        ny.display = "localhost:10.0";
        lines.push(
          "",
          "(X-videresending er aktiv. Se DISPLAY: den peker nå på localhost:10.0 PÅ TJENEREN.",
          " Det er enden av en tunnel gjennom SSH som kommer ut hos deg. Grafiske programmer du",
          " starter her, tegner seg på skjermen din.)",
        );
      }
    } else {
      ny.xVideresending = false;
      ny.display = null;
      lines.push("", "(Merk: DISPLAY er nå tom. En ren SSH-økt har ingen grafikk i det hele tatt.)");
    }

    return { state: ny, cmd, utfall: "tilkoblet", pared: false, lines };
  }

  // ---- exit / logout -----------------------------------------------------
  if (t[0] === "exit" || t[0] === "logout") {
    if (!state.tilkoblet) return feil(state, cmd, "Du er på din egen maskin — det er ingenting å logge ut av.");
    const ny = klone(state);
    ny.tilkoblet = false;
    ny.xVideresending = false;
    ny.display = ny.lokalDisplay;
    return { state: ny, cmd, utfall: "frakoblet", pared: true, lines: ["logout", `Connection to ${TJENER.host} closed.`] };
  }

  // ---- echo $DISPLAY -----------------------------------------------------
  if (t[0] === "echo" && cmd.includes("$DISPLAY")) {
    return {
      state,
      cmd,
      utfall: "listing",
      pared: state.tilkoblet,
      lines: [
        state.display ?? "",
        state.display
          ? state.tilkoblet
            ? "(Dette er DISPLAY på tjeneren. localhost:10.0 er tunnelen — ikke en skjerm som står der.)"
            : "(Dette er din egen X-tjener: skjerm 0 på denne maskinen.)"
          : "(Tom. Ingen X-tjener å tegne på. Grafiske programmer vil nekte å starte.)",
      ],
    };
  }

  // ---- grafiske programmer ----------------------------------------------
  if (["xeyes", "xclock", "gedit", "firefox"].includes(t[0])) {
    if (!state.display) {
      return {
        state,
        cmd,
        utfall: "grafikk",
        pared: state.tilkoblet,
        lines: [
          `Error: Can't open display: `,
          "",
          "(Programmet vil tegne et vindu, men fant ingen X-tjener å tegne på. DISPLAY er tom.",
          " Koble til med ssh -X hvis du vil ha grafikk over nettet.)",
        ],
      };
    }
    return {
      state,
      cmd,
      utfall: "grafikk",
      pared: state.tilkoblet,
      lines: [
        `(${t[0]} åpner et vindu på ${state.display})`,
        state.tilkoblet && state.xVideresending
          ? "(Programmet KJØRER på tjeneren — den regner ut alt — men vinduet vises på skjermen din. Det er hele poenget med klient–tjener-modellen i X.)"
          : "(Programmet kjører lokalt og tegner lokalt.)",
      ],
    };
  }

  // ---- scp / sftp / rsync ------------------------------------------------
  if (t[0] === "scp" || t[0] === "sftp" || t[0] === "rsync") {
    if (t.length < 2) return feil(state, cmd, `Bruk: ${t[0]} kilde mål`);
    const harFjern = cmd.includes(":") && cmd.includes("@");
    if (!harFjern && t[0] !== "sftp") {
      return feil(state, cmd, "Ingen fjernmaskin i kommandoen. Formen er: scp fil bruker@vert:sti");
    }
    const fil = t[1].split("/").pop() ?? t[1];
    const ny = klone(state);
    if (!ny.overfort.includes(fil)) ny.overfort.push(fil);
    return {
      state: ny,
      cmd,
      utfall: "overfort",
      pared: false,
      lines: [
        `${fil}    100%   12KB   1.2MB/s   00:00`,
        "",
        t[0] === "scp"
          ? "(scp = Secure Copy: kopierer og er ferdig. Kjører over nøyaktig samme SSH-tilkobling — samme nøkler, samme autentisering, samme kryptering.)"
          : t[0] === "sftp"
            ? "(sftp = SSH File Transfer Protocol: en interaktiv økt der du kan bla, med get og put. Samme SSH under.)"
            : "(rsync sender bare det som er endret, og kan gjenoppta. Bruker SSH som transport når målet har et kolon.)",
      ],
    };
  }

  // ---- hostname / whoami — hvilken maskin er jeg på? ---------------------
  if (t[0] === "hostname" || t[0] === "whoami" || t[0] === "uname") {
    return {
      state,
      cmd,
      utfall: "listing",
      pared: state.tilkoblet,
      lines: [
        t[0] === "whoami" ? (state.tilkoblet ? TJENER.bruker : "student") : state.tilkoblet ? TJENER.host : "laptop",
        state.tilkoblet
          ? "(Du er på fjernmaskinen. Alt du skriver nå kjører DER.)"
          : "(Du er på din egen maskin.)",
      ],
    };
  }

  return feil(state, cmd, `bash: ${t[0]}: kommandoen finnes ikke i dette øvingsmiljøet.`);
}

// ---------------------------------------------------------------------------
// Måloppgaver (oppgavetype 3) — tilstandssjekk
// ---------------------------------------------------------------------------

export type Verdict = "riktig" | "nesten" | "feil";
export interface CheckOutcome {
  verdict: Verdict;
  message: string;
}
const ok = (m: string): CheckOutcome => ({ verdict: "riktig", message: m });
const near = (m: string): CheckOutcome => ({ verdict: "nesten", message: m });
const no = (m: string): CheckOutcome => ({ verdict: "feil", message: m });

export interface SshGoalTask {
  id: string;
  title: string;
  prompt: string;
  goal: string;
  fasit: string[];
  hint: string;
  takeaway: string;
  start: () => SshState;
  check: (s: SshState, historikk: SshResultat[]) => CheckOutcome;
}

export const SSH_GOAL_TASKS: SshGoalTask[] = [
  {
    id: "sg1",
    title: "Slutt å skrive passord",
    prompt: `Du logger inn på ${TJENER.host} flere ganger om dagen og skriver passordet hver gang. Sett opp nøkkelinnlogging og logg inn uten passord.`,
    goal: "Et nøkkelpar finnes lokalt, den offentlige delen ligger i authorized_keys på tjeneren, og du er logget inn.",
    fasit: [
      "ssh-keygen -t ed25519",
      `ssh-copy-id ${TJENER.bruker}@${TJENER.host}`,
      `ssh ${TJENER.bruker}@${TJENER.host}`,
    ],
    hint: "Tre steg: lag paret, send den offentlige halvdelen til tjeneren, logg inn. Den private halvdelen skal aldri noe sted.",
    takeaway:
      "Nøkkelinnlogging er ikke «passord lagret på disk». Tjeneren sender en utfordring, du signerer den med den private nøkkelen, og tjeneren sjekker signaturen med den offentlige. Den private nøkkelen forlater aldri maskinen din — derfor kan en kompromittert tjener ikke stjele den.",
    start: initialSshState,
    check: (s, h) => {
      const harNokkel = s.noklerLokalt.length > 0;
      const autorisert = s.autoriserteNokler.length > 0;
      if (harNokkel && autorisert && s.tilkoblet) {
        const braPassord = h.some((r) => r.lines.some((l) => l.includes("Authenticated with")));
        return braPassord
          ? ok("Inne, uten passord. Tjeneren godtok signaturen fra den private nøkkelen din.")
          : near("Du er inne, men innloggingen gikk på passord. Sjekk at nøkkelen faktisk ble kopiert til tjeneren.");
      }
      if (harNokkel && autorisert) return near("Nøkkelen er på plass begge steder. Nå gjenstår bare selve innloggingen.");
      if (harNokkel && s.tilkoblet) return near("Du er logget inn, men på passord — den offentlige nøkkelen ligger ikke på tjeneren ennå. Bruk ssh-copy-id.");
      if (harNokkel) return near("Nøkkelparet er laget. Neste steg er å få den OFFENTLIGE delen inn i authorized_keys på tjeneren.");
      if (h.some((r) => r.cmd.startsWith("ssh-copy-id"))) return near("Du prøvde å kopiere en nøkkel du ikke har ennå. Lag paret først med ssh-keygen.");
      return no("Ingen nøkkel finnes ennå. Start med ssh-keygen.");
    },
  },
  {
    id: "sg2",
    title: "Slipp passfrasen for hver tilkobling",
    prompt:
      "Nøkkelen din er beskyttet med en passfrase, og du må skrive den ved hver eneste tilkobling. Få den lagt inn i ssh-agent, og logg inn uten å skrive noe.",
    goal: "Nøkkelen ligger i ssh-agent, og innloggingen skjer uten passfrase.",
    fasit: ["ssh-add ~/.ssh/id_ed25519", `ssh ${TJENER.bruker}@${TJENER.host}`],
    hint: "Det finnes en egen bakgrunnstjeneste som holder opplåste nøkler i minnet for økta.",
    takeaway:
      "ssh-agent låser opp den private nøkkelen én gang og holder den i minnet. Nøkkelen ligger fortsatt kryptert på disk — det er bare den opplåste kopien i minnet som gjenbrukes. Derfor er passfrase + agent både tryggere og mer bekvemt enn nøkkel uten passfrase.",
    start: () => {
      const s = initialSshState();
      s.noklerLokalt.push({ navn: "id_ed25519", type: "ed25519", passfrase: true });
      s.autoriserteNokler.push("id_ed25519");
      return s;
    },
    check: (s, h) => {
      if (s.agentNokler.length > 0 && s.tilkoblet) {
        const spurte = h.some((r) => r.utfall === "tilkoblet" && r.lines.some((l) => l.includes("Enter passphrase for key")));
        return spurte
          ? near("Nøkkelen er i agenten, men innloggingen spurte likevel — la du den inn FØR du koblet til?")
          : ok("Inne uten et eneste tastetrykk. Agenten hadde nøkkelen klar.");
      }
      if (s.agentNokler.length > 0) return near("Nøkkelen ligger i agenten. Logg inn og se at den ikke spør.");
      if (s.tilkoblet) return near("Du er inne, men måtte skrive passfrasen. Legg nøkkelen i agenten først, så slipper du det neste gang.");
      return no("Agenten er tom. `ssh-add -l` viser hva den har.");
    },
  },
  {
    id: "sg3",
    title: "Ett ord i stedet for en hel kommandolinje",
    prompt:
      "Du er lei av å skrive brukernavn, vertsnavn og nøkkelfil hver gang. Sett opp ~/.ssh/config slik at bare `ssh uit` er nok, og bruk det.",
    goal: "En Host-oppføring med alias «uit» finnes i konfigurasjonen, og du er logget inn ved å bruke aliaset.",
    fasit: [
      `printf 'Host uit\\n HostName ${TJENER.host}\\n User ${TJENER.bruker}\\n IdentityFile ~/.ssh/id_ed25519\\n' >> ~/.ssh/config`,
      `ssh uit`,
    ],
    hint: "Fila redigeres normalt i vim, men her holder det å skrive en Host-blokk til ~/.ssh/config. Feltene heter Host, HostName, User og IdentityFile.",
    takeaway:
      "~/.ssh/config er ren tekst med Host-blokker. Alt du kan gi ssh på kommandolinja kan stå der i stedet: HostName, User, Port, IdentityFile, ForwardX11. Og scp, sftp og rsync leser den samme fila — aliaset virker i alle sammen.",
    start: () => {
      const s = initialSshState();
      s.noklerLokalt.push({ navn: "id_ed25519", type: "ed25519", passfrase: false });
      s.autoriserteNokler.push("id_ed25519");
      return s;
    },
    check: (s, h) => {
      const alias = s.config.find((c) => c.alias === "uit");
      const bruktAlias = h.some((r) => r.cmd === "ssh uit" && r.utfall === "tilkoblet");
      if (alias && bruktAlias) return ok("«ssh uit» slo opp i konfigurasjonen og fylte ut resten selv. Nøyaktig det config-filen er til for.");
      if (alias) return near("Oppføringen finnes. Prøv å logge inn med bare `ssh uit`.");
      if (s.tilkoblet) return near("Du er inne, men du skrev hele adressen. Oppgaven var å slippe det — legg inn en Host-oppføring først.");
      return no("Ingen oppføring med alias «uit» ennå.");
    },
  },
  {
    id: "sg4",
    title: "Grafisk program over nettet",
    prompt:
      "Du skal kjøre et grafisk program på tjeneren, men se vinduet på din egen skjerm. Logg inn slik at det er mulig, og start xeyes.",
    goal: "Du er tilkoblet med X-videresending aktiv, DISPLAY peker på tunnelen, og et grafisk program har åpnet et vindu.",
    fasit: [`ssh -X ${TJENER.bruker}@${TJENER.host}`, "echo $DISPLAY", "xeyes"],
    hint: "Ett flagg til ssh. Sjekk DISPLAY etterpå — verdien forteller deg om det virket.",
    takeaway:
      "X er delt i klient og tjener, og fordelingen overrasker: X-TJENEREN kjører der SKJERMEN er, altså på din laptop. Programmet er KLIENTEN. ssh -X lager en tunnel slik at klienten på fjernmaskinen kan snakke med tjeneren hjemme hos deg. Derfor peker DISPLAY på localhost:10.0 på fjernmaskinen — det er tunnelmunningen, ikke en skjerm.",
    start: initialSshState,
    check: (s, h) => {
      const grafikkOk = h.some((r) => r.utfall === "grafikk" && r.lines.some((l) => l.includes("åpner et vindu")));
      if (s.tilkoblet && s.xVideresending && grafikkOk) {
        return ok("Programmet kjører på tjeneren, vinduet tegnes hos deg. DISPLAY=localhost:10.0 er SSH-tunnelen.");
      }
      if (s.tilkoblet && s.xVideresending) return near("Videresendingen er aktiv og DISPLAY er satt. Start et grafisk program, for eksempel xeyes.");
      if (s.tilkoblet && !s.xVideresending) {
        return near("Du er inne, men uten X-videresending — DISPLAY er tom, og grafiske programmer nekter å starte. Logg ut og koble til med -X.");
      }
      if (h.some((r) => r.utfall === "grafikk")) return near("Du prøvde et grafisk program, men uten en X-tjener å tegne på. Se på feilmeldingen: «Can't open display».");
      return no("Du er ikke tilkoblet ennå.");
    },
  },
  {
    id: "sg5",
    title: "Få en fil over",
    prompt:
      "Rapporten rapport.pdf ligger lokalt og skal opp på tjeneren. Overfør den — uten å åpne en innloggingsøkt først.",
    goal: "Filen er overført til fjermaskinen.",
    fasit: [`scp rapport.pdf ${TJENER.bruker}@${TJENER.host}:~/`],
    hint: "Kolonet skiller vertsnavnet fra stien på den andre siden. Verktøyet bruker samme tilkobling som ssh.",
    takeaway:
      "scp (Secure Copy), sftp (SSH File Transfer Protocol) og rsync bruker alle SSH som transport. Setter du opp nøkler for ssh, virker de tre automatisk — og aliaset fra ~/.ssh/config virker i alle sammen.",
    start: () => {
      const s = initialSshState();
      s.noklerLokalt.push({ navn: "id_ed25519", type: "ed25519", passfrase: false });
      s.autoriserteNokler.push("id_ed25519");
      return s;
    },
    check: (s, h) => {
      if (s.overfort.includes("rapport.pdf")) return ok("Filen er over. Ingen innloggingsøkt var nødvendig — scp åpner sin egen SSH-forbindelse, bruker den, og lukker den.");
      if (s.overfort.length) return near(`Du overførte «${s.overfort[0]}», ikke rapport.pdf.`);
      if (h.some((r) => r.utfall === "feil" && r.cmd.startsWith("scp"))) return near("Nesten. Målet må inneholde bruker@vert OG et kolon foran stien.");
      if (s.tilkoblet) return near("Du logget inn i stedet. Det virker også, men oppgaven ba om overføring uten en innloggingsøkt.");
      return no("Ingenting er overført ennå.");
    },
  },
];

// ---------------------------------------------------------------------------
// Feilsøkingsoppgavene (oppgavetype 4) for modul 6
// ---------------------------------------------------------------------------

export interface TroubleTask {
  id: string;
  title: string;
  transcript: { cmd: string; output: string[] }[];
  question: string;
  options: { id: string; label: string; why: string; correct?: boolean }[];
  fix: { cmd: string; text: string };
  lesson: string;
}

export const MODUL6_TROUBLE_TASKS: TroubleTask[] = [
  {
    id: "m6t1",
    title: "Fanget i editoren",
    transcript: [
      { cmd: "vim /etc/hosts", output: ["(editoren åpner seg)"] },
      { cmd: "(brukeren skriver: retter en linje, så :wq)", output: ["(teksten «:wq» dukker opp midt i fila)"] },
      { cmd: "(brukeren trykker Ctrl+C, så Ctrl+Z)", output: ["[1]+  Stopped     vim /etc/hosts"] },
    ],
    question: "Hvorfor havnet «:wq» i teksten i stedet for å lagre og avslutte?",
    options: [
      {
        id: "a",
        label: "Brukeren var i innsettingsmodus. Der er tastene tekst, også kolon — kommandolinja åpnes bare fra normalmodus.",
        why: "Riktig. Kolon er en kommando i normalmodus og et helt vanlig tegn i innsettingsmodus. Esc først, så kolon.",
        correct: true,
      },
      {
        id: "b",
        label: "Fila er skrivebeskyttet, så vim skrev kommandoen i bufferet i stedet.",
        why: "Skrivebeskyttelse ville gitt feilmeldingen «E45: 'readonly' option is set» ved lagring, ikke tekst i fila.",
      },
      {
        id: "c",
        label: ":wq må skrives med stor bokstav.",
        why: "Nei, :wq er små bokstaver. :X betyr noe helt annet (kryptering).",
      },
      {
        id: "d",
        label: "vim krever at man trykker Enter før kolon.",
        why: "Nei. Kolon åpner kommandolinja umiddelbart — når du er i normalmodus.",
      },
    ],
    fix: {
      cmd: "Esc  :wq  Enter",
      text: "Esc tar deg alltid tilbake til normalmodus, uansett hvor du er. Deretter virker kolon som kommando. Og Ctrl+Z stoppet ikke vim — den la den i bakgrunnen; `fg` henter den tilbake, ellers ligger den der og holder en låsefil.",
    },
    lesson:
      "Regelen som løser nesten alle vim-problemer: er du i tvil, trykk Esc. Det er alltid trygt — i normalmodus gjør Esc ingenting, og fra alle andre moduser tar den deg dit.",
  },
  {
    id: "m6t2",
    title: "Nøkkelen som ikke ble brukt",
    transcript: [
      { cmd: "ssh-keygen -t ed25519", output: ["Your public key has been saved in /home/student/.ssh/id_ed25519.pub"] },
      { cmd: "ssh student@login.uit.no", output: ["student@login.uit.no's password:"] },
    ],
    question: "Nøkkelen er laget, men tjeneren spør fortsatt om passord. Hva mangler?",
    options: [
      {
        id: "a",
        label: "Den offentlige nøkkelen er aldri lagt inn i ~/.ssh/authorized_keys på tjeneren. Tjeneren kjenner den ikke.",
        why: "Riktig. Å lage et nøkkelpar gjør noe på din maskin. Tjeneren vet ingenting om det før den offentlige halvdelen er lagt inn der.",
        correct: true,
      },
      {
        id: "b",
        label: "ed25519-nøkler støttes ikke av eldre tjenere.",
        why: "Da ville tjeneren avvist nøkkeltypen eksplisitt. Her forsøkes nøkkelen aldri — tjeneren har ingen å sammenligne med.",
      },
      {
        id: "c",
        label: "Nøkkelen må legges i ssh-agent før den kan brukes.",
        why: "Agenten sparer deg for å skrive passfrasen, men ssh finner nøkkelen i ~/.ssh/ helt uten den.",
      },
      {
        id: "d",
        label: "Den private nøkkelen må kopieres til tjeneren.",
        why: "Aldri. Den private nøkkelen skal ikke forlate maskinen din — hele sikkerheten hviler på det.",
      },
    ],
    fix: {
      cmd: "ssh-copy-id student@login.uit.no",
      text: "Kommandoen legger den offentlige nøkkelen på én linje i ~/.ssh/authorized_keys på tjeneren, og setter riktige rettigheter på fila. Du kan gjøre det for hånd, men SSH nekter å bruke fila hvis rettighetene er for åpne — og det er den vanligste grunnen til at det håndgjorte oppsettet feiler.",
    },
    lesson:
      "Nøkkelparet har to halvdeler med hver sin plass: den private blir hos deg, den offentlige skal til alle tjenere du vil nå. Blander du dem, har du enten ingen tilgang eller ingen sikkerhet.",
  },
  {
    id: "m6t3",
    title: "Grafikken som ikke kom",
    transcript: [
      { cmd: "ssh student@login.uit.no", output: ["Welcome to Ubuntu 24.04.1 LTS"] },
      { cmd: "xeyes", output: ["Error: Can't open display: "] },
      { cmd: "echo $DISPLAY", output: ["(tom linje)"] },
    ],
    question: "Innloggingen virker fint, men det grafiske programmet nekter å starte. Hvorfor?",
    options: [
      {
        id: "a",
        label: "xeyes er ikke installert på tjeneren.",
        why: "Da ville skallet sagt «command not found». Programmet startet — det fant bare ingen skjerm å tegne på.",
      },
      {
        id: "b",
        label: "En vanlig SSH-økt er ren tekst. DISPLAY er tom fordi det ikke finnes noen X-tjener å sende vinduene til, og X-videresending er ikke bedt om.",
        why: "Riktig. DISPLAY forteller et program hvor det skal tegne. Uten videresending er det ingen slik adresse i økta.",
        correct: true,
      },
      {
        id: "c",
        label: "Tjeneren har ikke grafisk skrivebord installert.",
        why: "Det trenger den heller ikke. Poenget med X-videresending er nettopp at programmet kjører på en maskin uten skjerm, mens vinduet vises hos deg.",
      },
      {
        id: "d",
        label: "DISPLAY må settes manuelt til :0.",
        why: "Nei — :0 er DIN skjerm, og fjernmaskinen kan ikke nå den direkte. Settes den for hånd, får du «Can't open display :0» i stedet. Tunnelen må lages av ssh.",
      },
    ],
    fix: {
      cmd: "ssh -X student@login.uit.no",
      text: "-X ber om X-videresending. Da setter tjenersiden DISPLAY til localhost:10.0 — enden av en tunnel gjennom SSH-forbindelsen som kommer ut hos deg. (-Y er en mindre streng variant som noen ganger trengs for eldre programmer, men den slår av beskyttelser og bør ikke være førstevalget.)",
    },
    lesson:
      "DISPLAY er hele X-modellen i én variabel: den sier hvilken X-tjener et program skal tegne på. Er den tom, finnes ingen skjerm. Peker den på localhost:10.0 i en SSH-økt, er det tunnelen — ikke en skjerm som står ved tjeneren.",
  },
  {
    id: "m6t4",
    title: "Feil maskin",
    transcript: [
      { cmd: "ssh student@login.uit.no", output: ["Welcome to Ubuntu 24.04.1 LTS"] },
      { cmd: "vim rapport.tex", output: ["(brukeren redigerer, lagrer med :wq)"] },
      { cmd: "ls ~/rapport.tex", output: ["/home/student/rapport.tex"] },
      { cmd: "(brukeren lukker terminalen og leter etter fila på laptopen)", output: ["ls: cannot access 'rapport.tex': No such file or directory"] },
    ],
    question: "Fila ble lagret og lista ut. Hvorfor er den ikke på laptopen?",
    options: [
      {
        id: "a",
        label: "vim lagret bare i minnet fordi økta ble lukket.",
        why: ":wq skrev fila til disk — `ls` bekreftet det rett etterpå.",
      },
      {
        id: "b",
        label: "Alt etter `ssh` kjørte på fjernmaskinen. Fila ligger på tjenerens disk, ikke på laptopen. En SSH-økt flytter ingen filer.",
        why: "Riktig. Skallet ditt snakker med den andre maskinen fra og med innloggingen. Ingenting deles automatisk.",
        correct: true,
      },
      {
        id: "c",
        label: "Hjemmekatalogen er ikke synkronisert fordi NFS ikke er montert.",
        why: "Det ville vært en mulig forklaring i et bestemt oppsett, men standard SSH deler ingenting — det er ikke noe som mangler, det er slik det virker.",
      },
      {
        id: "d",
        label: "Fila ble slettet da forbindelsen ble lukket.",
        why: "Nei. Filer på tjeneren blir liggende. De er bare ikke på din maskin.",
      },
    ],
    fix: {
      cmd: "scp student@login.uit.no:~/rapport.tex .",
      text: "Hent fila ned med scp (Secure Copy). Motsatt vei: `scp rapport.tex student@login.uit.no:~/`. Er du i tvil om hvilken maskin du står på, spør: `hostname`.",
    },
    lesson:
      "SSH gir deg et skall på en annen maskin — ikke en delt katalog. Alt du lager der, blir der. Å holde styr på hvilken maskin ledeteksten tilhører er en ferdighet i seg selv, og `hostname` er svaret hver gang du er usikker.",
  },
  {
    id: "m6t5",
    title: "Låst ute etter «opprydding»",
    transcript: [
      { cmd: "chmod 777 ~/.ssh -R", output: ["(ingen utskrift)"] },
      { cmd: "ssh student@login.uit.no", output: ["student@login.uit.no: Permission denied (publickey)."] },
      {
        cmd: "ssh -v student@login.uit.no",
        output: [
          "debug1: Offering public key: /home/student/.ssh/id_ed25519",
          "debug1: Authentications that can continue: publickey",
          "Bad owner or permissions on /home/student/.ssh/config",
        ],
      },
    ],
    question: "Nøkkelen finnes og tilbys, men innloggingen avvises. Hva er galt?",
    options: [
      {
        id: "a",
        label: "Nøkkelen er utløpt og må lages på nytt.",
        why: "SSH-nøkler har ingen utløpsdato i seg selv. Feilmeldingen peker dessuten rett på rettigheter.",
      },
      {
        id: "b",
        label: "chmod 777 gjorde filene lesbare for alle. SSH nekter å bruke private nøkler og oppsett som andre brukere kan lese eller endre.",
        why: "Riktig. En privat nøkkel alle kan lese er ingen hemmelighet lenger, så SSH avviser den heller enn å bruke den.",
        correct: true,
      },
      {
        id: "c",
        label: "Tjeneren har slått av publickey-autentisering.",
        why: "Da ville «Authentications that can continue» ikke listet publickey i det hele tatt.",
      },
      {
        id: "d",
        label: "ssh-agent kjører ikke.",
        why: "Agenten er en bekvemmelighet. Uten den ville ssh spurt om passfrasen, ikke avvist nøkkelen.",
      },
    ],
    fix: {
      cmd: "chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519 ~/.ssh/config && chmod 644 ~/.ssh/id_ed25519.pub",
      text: "Katalogen skal være 700 (bare du), private nøkler og config 600, offentlige nøkler 644. Dette knytter rett tilbake til rettighetene fra modul 5: 7 = rwx, 6 = rw-, og førstesifferet er deg selv.",
    },
    lesson:
      "SSH stoler ikke på hemmeligheter andre kan lese. Det er en av få steder i Linux der for åpne rettigheter gir en hard avvisning i stedet for en advarsel — og `ssh -v` sier alltid rett ut hva som er galt.",
  },
];
