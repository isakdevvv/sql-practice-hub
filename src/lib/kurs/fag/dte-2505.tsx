// DTE-2505 Operativsystemer — skjerm-basert fag.
//
// Emnerekkefølgen er en avhengighetsrekkefølge, ikke en pensumliste. Hvert emne
// forutsetter noe fra et tidligere emne, og `byggerPa` på hvert undertema sier
// nøyaktig hva. Leser du fra topp til bunn, blir ingen term brukt før den er
// innført.
//
//   1  Operativsystemet og maskinen   modus, kjerne, systemkall, systemtyper
//   2  Linux i praksis                distro, pakker, kommandolinje, hjelp, fjernbruk
//   3  Prosesser                      abstraksjon, tilstander, fork/exec, signaler
//   4  Scheduling                     mål, FIFO/SJF/STCF, round-robin, MLFQ, bytte
//   5  Minnehåndtering                adresserom, paging, TLB, sidefeil, fragmentering
//   6  Tråder og konkurrens           tråder, kappløp, låser, produsent-konsument, vranglås
//   7  Kommunikasjon mellom prosesser rør, delt minne, meldinger, valg  ← tidligere hull
//   8  Filsystemet                    inoder, kataloger, lenker, journal ← tidligere hull
//   9  Inn- og utdata og lagring      drivere, diskplanlegging, HDD, SSD
//  10  Brukere og rettigheter         UID/GID, rwx, umask, spesialbits
//  11  Skallet og skallprogrammering  fork-exec-løkka, omdirigering, skript, drift
//  12  Virtualisering og containere   hypervisorer, navnerom, cgroups  ← tidligere hull
//
// Kartleggingen mot Canvas-modulene og mot eksisterende innhold i repoet ligger
// i docs/DTE2505-EMNEKART.md.

import type { Fag } from "../types";
import { emneOsOgMaskinen } from "./dte-2505/emne-01-os-og-maskinen";
import { emneLinuxIPraksis } from "./dte-2505/emne-02-linux-i-praksis";
import { emneProsesser } from "./dte-2505/emne-03-prosesser";
import { emneScheduling } from "./dte-2505/emne-04-scheduling";
import { emneMinne } from "./dte-2505/emne-05-minne";
import { emneTraderOgKonkurrens } from "./dte-2505/emne-06-trader-og-konkurrens";
import { emneIpc } from "./dte-2505/emne-07-ipc";
import { emneFilsystem } from "./dte-2505/emne-08-filsystem";
import { emneIoOgLagring } from "./dte-2505/emne-09-io-og-lagring";
import { emneRettigheter } from "./dte-2505/emne-10-rettigheter";
import { emneSkalletOgSkript } from "./dte-2505/emne-11-skallet-og-skript";
import { emneVirtualisering } from "./dte-2505/emne-12-virtualisering";

export const dte2505: Fag = {
  slug: "dte-2505",
  kode: "DTE-2505",
  navn: "Operativsystemer",
  emner: [
    emneOsOgMaskinen,
    emneLinuxIPraksis,
    emneProsesser,
    emneScheduling,
    emneMinne,
    emneTraderOgKonkurrens,
    emneIpc,
    emneFilsystem,
    emneIoOgLagring,
    emneRettigheter,
    emneSkalletOgSkript,
    emneVirtualisering,
  ],
};
