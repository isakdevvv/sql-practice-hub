/**
 * Kommandotolkeren for nettverksterminalen i Lab 1.
 *
 * Alle fem verktøyene laben nevner er her, og de leser fra samme tilstand
 * (`nettverkTilstand.ts`). Det betyr at `ping`, `traceroute` og `nslookup`
 * er enige med hverandre: adressen `nslookup` gir deg er den `traceroute`
 * finner en rute til, og siste hopp i ruta har samme rundturstid som `ping`
 * rapporterer. Ellers ville øvingen lært deg å lese utdata som lyver.
 *
 * Både Windows- og Unix-formene godtas, fordi laben eksplisitt sier at du
 * bruker `ipconfig` på Windows og `ifconfig` på macOS/Linux. Utdataen følger
 * plattformen kommandonavnet tilhører — det er den forskjellen studenten
 * faktisk møter når hen sammenligner med en medstudent på annen maskin.
 */

import {
  FORBINDELSER,
  GRENSESNITT,
  NAVNETJENER,
  REVERS_SONE,
  SVARER_IKKE_PA_PING,
  aktivtGrensesnitt,
  ruteTil,
  slaOppNavn,
  tilIpv4,
  type Grensesnitt,
} from "./nettverkTilstand";

export interface Resultat {
  /** Linjene terminalen skal skrive ut. */
  linjer: string[];
  /**
   * Satt når kommandoen ikke ble forstått. Terminalen farger den annerledes,
   * og selvsjekken bruker den til å skille «feil svar» fra «feil kommando».
   */
  feil?: boolean;
}

const IPV4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/** Kjører én kommandolinje mot det etterlignede nettet. */
export function kjor(linje: string): Resultat {
  const deler = linje.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return { linjer: [] };

  const kommando = deler[0].toLowerCase();
  const args = deler.slice(1);

  switch (kommando) {
    case "ifconfig":
      return ifconfig(args);
    case "ipconfig":
      return ipconfig(args);
    case "ping":
      return ping(args);
    case "traceroute":
      return traceroute(args, "unix");
    case "tracert":
      return traceroute(args, "windows");
    case "nslookup":
      return nslookup(args);
    case "netstat":
      return netstat(args);
    case "help":
    case "?":
      return hjelp();
    default:
      return {
        feil: true,
        linjer: [
          `${deler[0]}: kommandoen finnes ikke i denne simulatoren.`,
          "Skriv «help» for å se hvilke fem verktøy som er med.",
        ],
      };
  }
}

/* --------------------------------------------------------- ifconfig (Unix) */

function ifconfigBlokk(g: Grensesnitt): string[] {
  const flagg = g.oppe ? "UP,BROADCAST,RUNNING,MULTICAST" : "BROADCAST,MULTICAST";
  const ut = [`${g.navn}: flags=8863<${flagg}> mtu 1500`];
  if (g.mac) ut.push(`\tether ${g.mac}`);
  if (g.ipv6) ut.push(`\tinet6 ${g.ipv6}${g.slag === "loopback" ? "" : " %" + g.navn} prefixlen 64`);
  if (g.ipv4) ut.push(`\tinet ${g.ipv4} netmask ${g.nettmaske} broadcast ${kringkasting(g)}`);
  ut.push(`\tstatus: ${g.oppe ? "active" : "inactive"}`);
  return ut;
}

function kringkasting(g: Grensesnitt): string {
  if (!g.ipv4 || !g.nettmaske) return "";
  const ip = g.ipv4.split(".").map(Number);
  const maske = g.nettmaske.split(".").map(Number);
  return ip.map((o, i) => o | (255 - maske[i])).join(".");
}

function ifconfig(args: string[]): Resultat {
  const valgt = args.find((a) => !a.startsWith("-"));
  const liste = valgt ? GRENSESNITT.filter((g) => g.navn === valgt) : GRENSESNITT;
  if (liste.length === 0) {
    return { feil: true, linjer: [`ifconfig: interface ${valgt} does not exist.`] };
  }
  return { linjer: liste.flatMap(ifconfigBlokk) };
}

/* ------------------------------------------------------ ipconfig (Windows) */

function ipconfig(args: string[]): Resultat {
  const alt = args.some((a) => a.toLowerCase() === "/all");
  const ut: string[] = ["", "Windows IP Configuration", ""];

  if (alt) {
    ut.push("   Host Name . . . . . . . . . . . . : lab1-pc", "");
  }

  for (const g of GRENSESNITT) {
    if (g.slag === "loopback") continue;
    const type = g.slag === "wifi" ? "Wireless LAN adapter" : "Ethernet adapter";
    ut.push(`${type} ${g.windowsNavn}:`, "");

    if (!g.oppe) {
      ut.push("   Media State . . . . . . . . . . . : Media disconnected", "");
      continue;
    }
    if (alt && g.mac) {
      ut.push(`   Physical Address. . . . . . . . . : ${g.mac.replace(/:/g, "-").toUpperCase()}`);
    }
    if (g.ipv6) ut.push(`   Link-local IPv6 Address . . . . . : ${g.ipv6}%12`);
    ut.push(
      `   IPv4 Address. . . . . . . . . . . : ${g.ipv4}`,
      `   Subnet Mask . . . . . . . . . . . : ${g.nettmaske}`,
      `   Default Gateway . . . . . . . . . : ${g.gateway}`,
    );
    if (alt) {
      ut.push(`   DNS Servers . . . . . . . . . . . : ${NAVNETJENER.ip}`);
    }
    ut.push("");
  }

  if (!alt) {
    ut.push("Tips: «ipconfig /all» viser også MAC-adressen (Physical Address) og DNS-tjeneren.");
  }
  return { linjer: ut };
}

/* -------------------------------------------------------------------- ping */

function ping(args: string[]): Resultat {
  const mal = args.find((a) => !a.startsWith("-") && !/^\d+$/.test(a));
  if (!mal) return { feil: true, linjer: ["usage: ping [-c count] <vert>"] };

  const cIdx = args.findIndex((a) => a === "-c" || a === "-n");
  const antall = cIdx >= 0 && args[cIdx + 1] ? Math.min(10, Number(args[cIdx + 1]) || 4) : 4;

  const ip = tilIpv4(mal);
  if (!ip) {
    return { feil: true, linjer: [`ping: cannot resolve ${mal}: Unknown host`] };
  }

  const rute = ruteTil(ip);
  const rtt = rute ? rute[rute.length - 1].rtt : undefined;
  const ut = [`PING ${mal} (${ip}): 56 data bytes`];

  if (SVARER_IKKE_PA_PING.has(ip) || rtt === undefined) {
    // Ingen svar er ikke det samme som «maskinen er nede» — se oppgave 6.
    for (let i = 0; i < antall; i++) ut.push("Request timeout for icmp_seq " + i);
    ut.push(
      "",
      `--- ${mal} ping statistics ---`,
      `${antall} packets transmitted, 0 packets received, 100.0% packet loss`,
    );
    return { linjer: ut };
  }

  const malinger: number[] = [];
  for (let i = 0; i < antall; i++) {
    // Liten, deterministisk variasjon rundt rundturstiden — ekte ping er
    // aldri helt jevn, og oppgavene skal tåle at tallene ikke er identiske.
    const m = Number((rtt + ((i * 37) % 11) / 10 - 0.5).toFixed(3));
    malinger.push(m);
    ut.push(`64 bytes from ${ip}: icmp_seq=${i} ttl=${rute ? 64 - rute.length : 64} time=${m} ms`);
  }
  const min = Math.min(...malinger);
  const max = Math.max(...malinger);
  const snitt = malinger.reduce((a, b) => a + b, 0) / malinger.length;
  ut.push(
    "",
    `--- ${mal} ping statistics ---`,
    `${antall} packets transmitted, ${antall} packets received, 0.0% packet loss`,
    `round-trip min/avg/max = ${min.toFixed(3)}/${snitt.toFixed(3)}/${max.toFixed(3)} ms`,
  );
  return { linjer: ut };
}

/* -------------------------------------------------------------- traceroute */

function traceroute(args: string[], stil: "unix" | "windows"): Resultat {
  const mal = args.find((a) => !a.startsWith("-") && !a.startsWith("/"));
  if (!mal) {
    return {
      feil: true,
      linjer: [stil === "windows" ? "usage: tracert <vert>" : "usage: traceroute <vert>"],
    };
  }

  const ip = tilIpv4(mal);
  if (!ip) return { feil: true, linjer: [`${stil === "windows" ? "tracert" : "traceroute"}: unknown host ${mal}`] };

  const rute = ruteTil(ip);
  if (!rute) return { feil: true, linjer: [`Ingen rute til ${ip} i denne simulatoren.`] };

  const maks = 30;
  const ut: string[] =
    stil === "windows"
      ? ["", `Tracing route to ${mal} [${ip}]`, `over a maximum of ${maks} hops:`, ""]
      : [`traceroute to ${mal} (${ip}), ${maks} hops max, 60 byte packets`];

  rute.forEach((hopp, i) => {
    const nr = String(i + 1).padStart(2, " ");
    if (hopp.stille) {
      ut.push(stil === "windows" ? `${nr}     *        *        *     Request timed out.` : `${nr}  * * *`);
      return;
    }
    const tider = [0, 1, 2]
      .map((k) => `${(hopp.rtt + k * 0.4).toFixed(3)} ms`)
      .join("  ");
    const navn = hopp.navn ? `${hopp.navn} (${hopp.ip})` : hopp.ip;
    ut.push(stil === "windows" ? `${nr}   ${tider}  ${navn}` : `${nr}  ${navn}  ${tider}`);
  });

  // Når målet selv er stille, stopper ikke traceroute — den går til maks.
  // Å vise det er poenget; ellers ser det ut som ruta er kortere enn den er.
  if (rute[rute.length - 1].stille) {
    for (let i = rute.length; i < Math.min(rute.length + 3, maks); i++) {
      const nr = String(i + 1).padStart(2, " ");
      ut.push(stil === "windows" ? `${nr}     *        *        *     Request timed out.` : `${nr}  * * *`);
    }
    ut.push("", "(målet svarer ikke — traceroute fortsetter til den gir opp)");
  } else if (stil === "windows") {
    ut.push("", "Trace complete.");
  }

  return { linjer: ut };
}

/* ---------------------------------------------------------------- nslookup */

function nslookup(args: string[]): Resultat {
  if (args.length === 0) {
    return {
      linjer: [
        `Default Server:  ${NAVNETJENER.navn}`,
        `Address:  ${NAVNETJENER.ip}`,
        "",
        "Interaktiv modus er ikke med her. Skriv i stedet «nslookup <navn>»",
        "eller «nslookup <ip-adresse>» for et revers-oppslag.",
      ],
    };
  }

  const mal = args[0];
  const topp = [`Server:\t\t${NAVNETJENER.navn}`, `Address:\t${NAVNETJENER.ip}`, ""];

  // Revers-oppslag: adresse inn, navn ut.
  if (IPV4.test(mal)) {
    const navn = REVERS_SONE[mal];
    if (!navn) {
      return {
        linjer: [...topp, `** server can't find ${reversNavn(mal)}: NXDOMAIN`],
      };
    }
    return { linjer: [...topp, `Name:\t${navn}`, `Address:  ${mal}`] };
  }

  const post = slaOppNavn(mal);
  if (!post) {
    return { linjer: [...topp, `** server can't find ${mal}: NXDOMAIN`] };
  }

  const ut = [...topp];
  // «Non-authoritative answer» betyr at svaret kom fra cachen til
  // navnetjeneren, ikke fra sonen som eier navnet.
  if (!post.autoritativ) ut.push("Non-authoritative answer:");

  if (post.cname) {
    const mal2 = slaOppNavn(post.cname);
    ut.push(`Name:\t${post.cname}`);
    for (const a of mal2?.ipv6 ?? []) ut.push(`Address:  ${a}`);
    for (const a of mal2?.ipv4 ?? post.ipv4) ut.push(`Address:  ${a}`);
    ut.push(`Aliases:  ${post.navn}`);
  } else {
    ut.push(`Name:\t${post.navn}`);
    for (const a of post.ipv6 ?? []) ut.push(`Address:  ${a}`);
    for (const a of post.ipv4) ut.push(`Address:  ${a}`);
  }
  return { linjer: ut };
}

/** «19.113.0.203.in-addr.arpa» — formen nslookup bruker i feilmeldinger. */
function reversNavn(ip: string): string {
  return `${ip.split(".").reverse().join(".")}.in-addr.arpa`;
}

/* ----------------------------------------------------------------- netstat */

function netstat(args: string[]): Resultat {
  const flagg = args.join("").toLowerCase();
  const kunLyttende = flagg.includes("l");
  const kunTcp = flagg.includes("t") && !flagg.includes("u");
  const kunUdp = flagg.includes("u") && !flagg.includes("t");
  const visProgram = flagg.includes("p") || flagg.includes("b");

  let liste = FORBINDELSER;
  if (kunLyttende) liste = liste.filter((f) => f.tilstand === "LISTENING");
  if (kunTcp) liste = liste.filter((f) => f.protokoll === "TCP");
  if (kunUdp) liste = liste.filter((f) => f.protokoll === "UDP");

  const ut = [
    "Active Internet connections",
    `Proto  ${"Local Address".padEnd(24)}${"Foreign Address".padEnd(24)}${"State".padEnd(13)}${visProgram ? "Program" : ""}`.trimEnd(),
  ];

  for (const f of liste) {
    const lokal = `${f.lokalAdresse}:${f.lokalPort}`;
    const fjern = f.tilstand === "LISTENING" ? "*:*" : `${f.fjernAdresse}:${f.fjernPort}`;
    ut.push(
      `${f.protokoll.padEnd(7)}${lokal.padEnd(24)}${fjern.padEnd(24)}${f.tilstand.padEnd(13)}${
        visProgram ? (f.program ?? "-") : ""
      }`.trimEnd(),
    );
  }

  if (liste.length === 0) ut.push("(ingen forbindelser passer filteret)");
  if (!visProgram) {
    ut.push("", "Tips: legg til «-p» for å se hvilket program som eier hver forbindelse.");
  }
  return { linjer: ut };
}

/* -------------------------------------------------------------------- help */

function hjelp(): Resultat {
  return {
    linjer: [
      "Verktøyene i Lab 1, og det du bruker dem til:",
      "",
      "  ifconfig [grensesnitt]     Unix/macOS: IP-adresse, nettmaske og MAC per nettverkskort",
      "  ipconfig [/all]            Windows: samme, men MAC og DNS krever /all",
      "  ping [-c antall] <vert>    Svarer maskinen? Og hvor lang er rundturen?",
      "  traceroute <vert>          Unix/macOS: hvilke rutere passerer pakken?",
      "  tracert <vert>             Windows: samme verktøy, annet navn og format",
      "  nslookup <navn>            Navn → adresse. Viser CNAME og alias.",
      "  nslookup <ip-adresse>      Revers-oppslag: adresse → navn.",
      "  netstat [-a -l -t -u -p]   Hvilke forbindelser og lyttende porter har maskinen?",
      "",
      "Verter du kan nå: uit.no, www.uit.no, fabrikken.example.no, arkiv.example.org,",
      "gatewayen 10.0.5.1 og 127.0.0.1.",
    ],
  };
}
