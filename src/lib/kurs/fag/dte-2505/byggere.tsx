// Fabrikker som lager `Skjerm`-objekter for DTE-2505.
//
// Hver `Skjerm.Component` skal være props-løs, så innholdet lukkes inne i
// fabrikken i stedet for å sendes inn som props. Det gjør emne-filene til nesten
// ren data: én linje per skjerm.
//
// Dette er ENESTE fila i DTE-2505-faget som importerer `useSkjerm`. Alle
// svar-skjermer går gjennom `anslag()`, `sjekk()`, `tallanslag()` og `recall()`
// her, slik at kontrakten mot skjerm-shellet ligger ett sted.

import type { ComponentType, ReactNode } from "react";
import { useSkjerm } from "@/components/skjerm";
import type { Skjerm } from "@/lib/kurs/types";
import {
  Bihjelp,
  Figur,
  Flervalg,
  Ingress,
  Kodeblokk,
  Merk,
  Oppsummering,
  Punkter,
  Ramme,
  Recall,
  Tallanslag,
  type RecallKort,
  type Valg,
} from "@/components/kurs-dte2505/blokker";

/* ---------------- ikke-svarende skjermer ---------------- */

/** Setter scenen for et undertema: hva skal vi finne ut, og hvorfor. */
export function intro(
  id: string,
  tittel: string,
  cfg: { ingress: ReactNode; punkter?: readonly ReactNode[]; merk?: ReactNode },
): Skjerm {
  const Component: ComponentType = () => (
    <Ramme>
      <Ingress>{cfg.ingress}</Ingress>
      {cfg.punkter ? <Punkter punkter={cfg.punkter} /> : null}
      {cfg.merk ? <Merk>{cfg.merk}</Merk> : null}
    </Ramme>
  );
  return { id, type: "intro", tittel, Component, sekunder: 30 };
}

/** Én idé forklart. Aldri mer enn ingress + fire punkter + eventuell merknad. */
export function konsept(
  id: string,
  tittel: string,
  cfg: {
    ingress: ReactNode;
    punkter?: readonly ReactNode[];
    merk?: ReactNode;
    bihjelp?: ReactNode;
  },
): Skjerm {
  const Component: ComponentType = () => (
    <Ramme>
      <Ingress>{cfg.ingress}</Ingress>
      {cfg.punkter ? <Punkter punkter={cfg.punkter} /> : null}
      {cfg.merk ? <Merk>{cfg.merk}</Merk> : null}
      {cfg.bihjelp ? <Bihjelp>{cfg.bihjelp}</Bihjelp> : null}
    </Ramme>
  );
  return { id, type: "konsept", tittel, Component, sekunder: 45 };
}

/** Interaktiv visualisering. `Viz` er en props-løs komponent — typisk gjenbrukt
 *  fra src/components/stack/**. `hint` sier hva studenten skal fikle med. */
export function visual(
  id: string,
  tittel: string,
  cfg: {
    Viz: ComponentType;
    /** Én setning over figuren: hva ser jeg på? */
    ledetekst?: ReactNode;
    /** Én setning under: hva skal jeg gjøre med den? */
    hint: ReactNode;
    hoyde?: string;
  },
): Skjerm {
  const { Viz } = cfg;
  const Component: ComponentType = () => (
    <Ramme>
      {cfg.ledetekst ? <Ingress>{cfg.ledetekst}</Ingress> : null}
      <Figur hint={cfg.hint} hoyde={cfg.hoyde}>
        <Viz />
      </Figur>
    </Ramme>
  );
  return { id, type: "visual", tittel, Component, sekunder: 120 };
}

/** Kode eller kommando som leses/kjøres, med én linje forklaring under. */
export function kode(
  id: string,
  tittel: string,
  cfg: {
    ingress?: ReactNode;
    kode: string;
    filnavn?: string;
    punkter?: readonly ReactNode[];
    merk?: ReactNode;
  },
): Skjerm {
  const Component: ComponentType = () => (
    <Ramme>
      {cfg.ingress ? <Ingress>{cfg.ingress}</Ingress> : null}
      <Kodeblokk kode={cfg.kode} tittel={cfg.filnavn} />
      {cfg.punkter ? <Punkter punkter={cfg.punkter} /> : null}
      {cfg.merk ? <Merk>{cfg.merk}</Merk> : null}
    </Ramme>
  );
  return { id, type: "kode", tittel, Component, sekunder: 60 };
}

/* ---------------- skjermer som krever svar ---------------- */

/** Gjett før fasit. Ingen «feil» — poenget er å satse på et svar. */
export function anslag(
  id: string,
  tittel: string,
  cfg: { sporsmal: ReactNode; valg: readonly Valg[]; fasit: ReactNode },
): Skjerm {
  const Component: ComponentType = () => {
    const { besvart } = useSkjerm();
    return (
      <Flervalg
        modus="anslag"
        sporsmal={cfg.sporsmal}
        valg={cfg.valg}
        fasit={cfg.fasit}
        onSvar={besvart}
      />
    );
  };
  return { id, type: "anslag", tittel, Component, krevesSvar: true, sekunder: 45 };
}

/** Tallanslag før en simulator avslører tallet. */
export function tallanslag(
  id: string,
  tittel: string,
  cfg: { sporsmal: ReactNode; enhet?: string; fasitTall: number; fasit: ReactNode },
): Skjerm {
  const Component: ComponentType = () => {
    const { besvart } = useSkjerm();
    return (
      <Tallanslag
        sporsmal={cfg.sporsmal}
        enhet={cfg.enhet}
        fasitTall={cfg.fasitTall}
        fasit={cfg.fasit}
        onSvar={besvart}
      />
    );
  };
  return { id, type: "anslag", tittel, Component, krevesSvar: true, sekunder: 60 };
}

/** Sjekkspørsmål med ett riktig svar. Kommer ETTER at ideen er vist. */
export function sjekk(
  id: string,
  tittel: string,
  cfg: { sporsmal: ReactNode; valg: readonly Valg[]; fasit: ReactNode },
): Skjerm {
  const Component: ComponentType = () => {
    const { besvart } = useSkjerm();
    return (
      <Flervalg
        modus="sjekk"
        sporsmal={cfg.sporsmal}
        valg={cfg.valg}
        fasit={cfg.fasit}
        onSvar={besvart}
      />
    );
  };
  return { id, type: "sjekk", tittel, Component, krevesSvar: true, sekunder: 45 };
}

/* ---------------- avslutning ---------------- */

/** Recall-kort. Alltid nest sist i et undertema, aldri først. */
export function recall(id: string, kort: readonly RecallKort[]): Skjerm {
  const Component: ComponentType = () => {
    const { besvart } = useSkjerm();
    return <Recall kort={kort} onSvar={besvart} />;
  };
  return {
    id,
    type: "sjekk",
    tittel: "Husker du?",
    Component,
    krevesSvar: true,
    sekunder: 20 * kort.length,
  };
}

export function oppsummering(
  id: string,
  cfg: { punkter: readonly ReactNode[]; videre?: ReactNode },
): Skjerm {
  const Component: ComponentType = () => (
    <Oppsummering punkter={cfg.punkter} videre={cfg.videre} />
  );
  return { id, type: "oppsummering", tittel: "Oppsummering", Component, sekunder: 30 };
}
