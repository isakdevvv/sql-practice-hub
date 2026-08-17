// ---------------------------------------------------------------------------
// Sandkassemotoren til løkke-laben.
//
// Den delte tilstandsmodellen i denne laben er selve interpreteren — vi
// etterligner ingenting, Pyodide kjører ekte CPython. Det vi legger oppå er en
// MÅLING: hvor mange ganger hver enkelt linje faktisk ble utført.
//
// Målingen gjøres med `sys.settrace`, som gir et «line»-varsel hver gang
// interpreteren er i ferd med å utføre en ny linje. Vi teller varslene per
// linjenummer. Det gir tre ting laben er helt avhengig av:
//
//   - kroppen kan telles UAVHENGIG av løkkelinja, så «hvor mange ganger gikk
//     løkka rundt» og «hvor mange ganger ble betingelsen sjekket» blir to
//     forskjellige tall studenten kan se med egne øyne;
//   - to linjer inni samme kropp kan ha ULIKE tellinger, som er nettopp det
//     `break` og `continue` gjør — og det er umulig å se uten en slik måling;
//   - en evig løkke kan STOPPES, se under.
//
// Om den evige løkka: en løkke-lab uten vern mot `while True` fryser fanen
// første gang noen gjør den feilen alle gjør. Siden vi allerede teller hver
// linje, koster vernet nesten ingenting: passeres et tak, avbryter vi med en
// feilmelding som forklarer HVA som skjedde. Den evige løkka blir dermed noe
// laben underviser i stedet for noe som ødelegger økta.
// ---------------------------------------------------------------------------

import { getPyodide } from "./pyodideLoader";

/** Tak på antall linjekjøringer før vi antar at løkka aldri stopper. */
export const LINJETAK = 200_000;

export interface Kjoereresultat {
  /** Alt programmet skrev med print(). */
  utdata: string;
  /** Linjenummer (1-basert) → hvor mange ganger linja ble utført. */
  tellinger: Record<number, number>;
  /** Variabelnavn → repr() av sluttverdien. */
  variabler: Record<string, string>;
  /** Feilmelding, hvis programmet stoppet. Ellers null. */
  feil: string | null;
  /** Sant når kjøringen ble avbrutt av linjetaket. */
  aldriFerdig: boolean;
}

/**
 * Python-siden av målingen. Ligger som en streng her, ikke i en egen .py-fil,
 * fordi den må følge med koden som bruker den — endres tellemåten, endres
 * fasitene i lokkeLab.ts, og de to bør ikke kunne komme i utakt uten at det
 * synes i samme diff.
 *
 * Merk `frame.f_code.co_filename != "<lab>"` — uten den filtreringen teller vi
 * også linjer inne i biblioteksfunksjoner studenten kaller, og tallene blir
 * meningsløse.
 */
const MÅLEKODE = `
import sys, io, json

def _lab_kjor(src, tak):
    tellinger = {}
    totalt = [0]

    def _spor(ramme, hendelse, arg):
        if ramme.f_code.co_filename != "<lab>":
            return None
        if hendelse == "line":
            nr = ramme.f_lineno
            tellinger[nr] = tellinger.get(nr, 0) + 1
            totalt[0] += 1
            if totalt[0] > tak:
                raise RuntimeError("__LAB_EVIG__")
        return _spor

    g = {"__name__": "__main__"}
    ut = io.StringIO()
    gammel_stdout = sys.stdout
    sys.stdout = ut
    feil = None
    evig = False
    try:
        kode = compile(src, "<lab>", "exec")
        sys.settrace(_spor)
        exec(kode, g)
    except RuntimeError as e:
        if "__LAB_EVIG__" in str(e):
            evig = True
        else:
            feil = type(e).__name__ + ": " + str(e)
    except SyntaxError as e:
        feil = "SyntaxError på linje " + str(e.lineno) + ": " + str(e.msg)
    except BaseException as e:
        feil = type(e).__name__ + ": " + str(e)
    finally:
        sys.settrace(None)
        sys.stdout = gammel_stdout

    variabler = {}
    for navn, verdi in g.items():
        if navn.startswith("__") or callable(verdi):
            continue
        try:
            variabler[navn] = repr(verdi)
        except Exception:
            variabler[navn] = "<kan ikke vises>"

    return json.dumps({
        "utdata": ut.getvalue(),
        "tellinger": {str(k): v for k, v in tellinger.items()},
        "variabler": variabler,
        "feil": feil,
        "aldriFerdig": evig,
    })
`;

let målekodeLastet = false;

export async function kjorMedTelling(kildekode: string): Promise<Kjoereresultat> {
  const pyodide = await getPyodide();
  if (!målekodeLastet) {
    pyodide.runPython(MÅLEKODE);
    målekodeLastet = true;
  }

  // Kildekoden sendes som en Python-variabel i stedet for å limes inn i et
  // uttrykk. Gjør man det siste, knekker første anførselstegn i studentens kode
  // hele kallet — og feilmeldingen peker et helt annet sted enn feilen.
  pyodide.globals.set("_lab_src", kildekode);
  pyodide.globals.set("_lab_tak", LINJETAK);
  const rå = pyodide.runPython("_lab_kjor(_lab_src, _lab_tak)") as string;

  const svar = JSON.parse(rå) as {
    utdata: string;
    tellinger: Record<string, number>;
    variabler: Record<string, string>;
    feil: string | null;
    aldriFerdig: boolean;
  };

  const tellinger: Record<number, number> = {};
  for (const [nr, antall] of Object.entries(svar.tellinger)) tellinger[Number(nr)] = antall;

  return { ...svar, tellinger };
}
