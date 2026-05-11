import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page covering TypeScript fundamentals: types, type vs interface,
// generics, narrowing, utility types, strict mode, declaration files.

const STEPS = [
  { title: "Hvorfor TypeScript?", anchor: "hvorfor" },
  { title: "Basis-typer", anchor: "basis" },
  { title: "type vs interface", anchor: "type-vs-interface" },
  { title: "Generics", anchor: "generics" },
  { title: "Narrowing — typeof, instanceof, type guards", anchor: "narrowing" },
  { title: "Utility types", anchor: "utility" },
  { title: "strict mode og declaration files", anchor: "strict" },
];

export function TypescriptPage() {
  return (
    <StackPageShell title="TypeScript" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Moderne web · Språk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            TypeScript — JavaScript med statiske typer
          </h1>
          <p className="mt-3 text-muted-foreground">
            TypeScript er JavaScript med en typesjekker på toppen. Du skriver
            typer en gang, og editor + kompilator fanger bugs før koden kjører.
            Etter ti minutter med TS lurer du på hvordan du noen gang stolte på
            «<code>cannot read properties of undefined</code>»-feilmeldinger i
            runtime.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «TypeScript» — match utility-types, fill-inn generics, quiz
              om narrowing.
            </div>
          </div>
        </div>

        <CourseOutline courseId="typescript" steps={STEPS} />

        {/* 1. Hvorfor */}
        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor TypeScript?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre konkrete gevinster, alle merkbare fra dag én:
          </p>
          <ul className="space-y-2 text-sm list-disc pl-5 text-muted-foreground mb-4">
            <li>
              <strong>Autocomplete i editoren.</strong> Du skriver <code>bruker.</code>{" "}
              og får opp alle feltene — uten å åpne en annen fil.
            </li>
            <li>
              <strong>Refaktorering uten skrekk.</strong> Du endrer et feltnavn,
              og kompilatoren peker på alle de 47 stedene som må oppdateres.
            </li>
            <li>
              <strong>Selvdokumenterende API.</strong> En funksjons-signatur
              forteller alt om input og output — ingen <code>// expects an object with foo</code>-kommentarer.
            </li>
          </ul>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// JavaScript — feil oppdages i runtime, ofte hos en bruker
function pris(produkt) {
  return produkt.pris * produkt.antall;
}
pris({ pris: 10 });   // returnerer NaN — produkt.antall er undefined

// TypeScript — feil oppdages i editoren, før commit
function pris(produkt: { pris: number; antall: number }): number {
  return produkt.pris * produkt.antall;
}
pris({ pris: 10 });   // Error: Property 'antall' is missing
                      //        in type '{ pris: number }'`}</pre>
          </div>
        </section>

        {/* 2. Basis-typer */}
        <section id="basis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Basis-typer</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Primitive
let navn: string = "Ada";
let alder: number = 30;
let aktiv: boolean = true;
let ingenting: null = null;
let ikkesatt: undefined = undefined;

// Arrays
let tall: number[] = [1, 2, 3];
let navne: Array<string> = ["a", "b"];     // samme

// Tuple — fast lengde og fast type per posisjon
let par: [string, number] = ["Ada", 30];
// par[0]  -> string
// par[1]  -> number

// Enum — symbolske konstanter
enum Rolle { Admin, Bruker, Gjest }
let r: Rolle = Rolle.Admin;        // 0 (default numerisk)

// Eller med eksplisitte verdier
enum Status {
  Aktiv  = "AKTIV",
  Sperret = "SPERRET",
}

// Literal types — verdien ER typen
let svar: "ja" | "nei" = "ja";     // bare to lovlige verdier

// any — slå av typesjekking (UNNGÅ — bruk unknown isteden)
let hva: any = 1;
hva = "tekst";                     // OK, men du mister all hjelp

// unknown — som any, men du MÅ narrowe før du bruker
let x: unknown = JSON.parse("{}");
if (typeof x === "string") {
  x.toUpperCase();                 // OK her — TS vet x er string`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Type-inferens betyr at du ofte slipper å skrive typen:{" "}
            <code>let n = 1</code> blir <code>number</code> automatisk. Skriv
            bare eksplisitte typer på funksjons-parametre/-retur og «tomme»
            startverdier.
          </p>
        </section>

        {/* 3. type vs interface */}
        <section id="type-vs-interface" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. type vs interface</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Begge beskriver formen på et objekt. <code>interface</code> er den
            klassiske OOP-formen, <code>type</code> kan i tillegg være alias for
            unions, primitives, tuples. <strong>I praksis:</strong> bruk{" "}
            <code>interface</code> for offentlige objekt-kontrakter,{" "}
            <code>type</code> for alt annet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// interface — kan utvides og declaration-merges
interface Bruker {
  id: number;
  navn: string;
}
interface Bruker {           // samme navn — slås sammen
  epost?: string;            // ?: gjør feltet valgfritt
}
interface Admin extends Bruker {
  rettigheter: string[];
}

// type — fleksibel: union, intersection, mapped, conditional
type Id = number | string;
type Punkt = { x: number; y: number };
type Punkt3D = Punkt & { z: number };          // intersection
type Endring = "opprett" | "oppdater" | "slett";

// Klasse som implementerer interface
class BrukerKonto implements Bruker {
  constructor(public id: number, public navn: string) {}
}`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/2">interface</th>
                  <th className="text-left font-semibold px-4 py-2">type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Kan «declaration-merge» — samme navn slås sammen</td>
                  <td className="px-4 py-3 text-muted-foreground">Kan IKKE re-erklæres</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground"><code>extends</code> for arv</td>
                  <td className="px-4 py-3 text-muted-foreground"><code>&amp;</code> for intersection</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Kun objekter / funksjonssignaturer</td>
                  <td className="px-4 py-3 text-muted-foreground">Kan alias-ere hva som helst (unions, primitives, tuples)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Generics */}
        <section id="generics" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Generics</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En generic er en «type-variabel». Den lar deg skrive funksjoner og
            datastrukturer som virker på en hvilken som helst type, mens
            informasjonen om typen <em>beholdes</em>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Uten generic — taper informasjon
function forste(liste: any[]): any { return liste[0]; }
const x = forste([1, 2, 3]);      // x: any  — vi mistet number

// Med generic — typen følger med
function forste<T>(liste: T[]): T { return liste[0]; }
const y = forste([1, 2, 3]);      // y: number
const z = forste(["a", "b"]);     // z: string

// Multiple type-variabler
function par<A, B>(a: A, b: B): [A, B] { return [a, b]; }

// Generisk klasse
class Kasse<T> {
  private innhold: T[] = [];
  legg(x: T)     { this.innhold.push(x); }
  hent(): T | undefined { return this.innhold.pop(); }
}
const k = new Kasse<number>();
k.legg(42);
const n = k.hent();               // n: number | undefined

// Constraint — T må ha en lengde-egenskap
function lengde<T extends { length: number }>(x: T): number {
  return x.length;
}
lengde("hei");                    // OK — string har .length
lengde([1, 2]);                   // OK
// lengde(42);                    // FEIL — number har ikke .length`}</pre>
          </div>
        </section>

        {/* 5. Narrowing */}
        <section id="narrowing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Narrowing — typeof, instanceof, type guards</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når en variabel kan være flere typer, snevrer du inn med en sjekk.
            TypeScript følger flyt-kontrollen og oppdaterer typen i hver gren.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function lengdeAv(x: string | number): number {
  if (typeof x === "string") {
    return x.length;          // x er string her
  }
  return x;                    // x er number her
}

// instanceof — for klasser
if (e instanceof Error) {
  console.log(e.message);     // e er Error her
}

// 'in' — sjekker om feltet finnes
type Fisk = { svom(): void };
type Fugl = { fly(): void };
function bevegelse(dyr: Fisk | Fugl) {
  if ("svom" in dyr) dyr.svom();
  else dyr.fly();
}

// Egendefinert type guard — funksjon med 'x is T' returtype
function erBruker(x: unknown): x is { id: number; navn: string } {
  return typeof x === "object"
    && x !== null
    && "id" in x
    && "navn" in x;
}

const data: unknown = JSON.parse("{}");
if (erBruker(data)) {
  console.log(data.navn);     // OK — TS vet data er en bruker
}`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Discriminated union — tag-felt som skiller variantene
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`type Resultat =
  | { kind: "ok"; verdi: number }
  | { kind: "feil"; melding: string };

function vis(r: Resultat) {
  switch (r.kind) {
    case "ok":   return "Tall: " + r.verdi;       // r.verdi: number
    case "feil": return "Feil: " + r.melding;     // r.melding: string
  }
}`}</pre>
          </div>
        </section>

        {/* 6. Utility types */}
        <section id="utility" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Utility types</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Innebygde generiske typer som transformerer andre typer. Læres én
            gang, brukes hver dag.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Utility</th>
                  <th className="text-left font-semibold px-4 py-2">Hva den gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Partial&lt;T&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Gjør ALLE feltene valgfrie</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Required&lt;T&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Gjør alle feltene påkrevet</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Readonly&lt;T&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Alle feltene blir readonly</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Pick&lt;T, K&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Plukk noen felt ut av T</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Omit&lt;T, K&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Alt fra T BORTSETT FRA K</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Record&lt;K, V&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Objekt med K-nøkler og V-verdier</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">ReturnType&lt;F&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Returtypen til en funksjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">Awaited&lt;P&gt;</td>
                  <td className="px-4 py-3 text-muted-foreground">Verdien inne i en Promise</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`interface Bruker {
  id: number;
  navn: string;
  epost: string;
  passord: string;
}

// Skjema for å opprette: alt unntatt id
type NyBruker = Omit<Bruker, "id">;

// Skjema for å oppdatere: alle felt valgfrie
type BrukerEndring = Partial<Bruker>;

// Skjema som vises i UI: ikke passord
type OffentligBruker = Omit<Bruker, "passord">;
// alternativt: Pick<Bruker, "id" | "navn" | "epost">

// Map fra ID til Bruker
type Brukerregister = Record<number, Bruker>;

// Hva returnerer fetchBruker?
async function fetchBruker(id: number): Promise<Bruker> { /* ... */ }
type BrukerFraApi = Awaited<ReturnType<typeof fetchBruker>>;   // = Bruker`}</pre>
          </div>
        </section>

        {/* 7. strict mode */}
        <section id="strict" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. strict mode og declaration files</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>"strict": true</code> i <code>tsconfig.json</code> skrur på alle
            de viktige sjekkene. Bruk det. Alltid.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                     // skrur på alle under
    "noImplicitAny": true,              // krev eksplisitt type
    "strictNullChecks": true,           // null/undefined er ikke "alt"
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true    // tall[i] blir T | undefined
  }
}

// strictNullChecks — hva endrer seg:
let navn: string = null;                // FEIL — null ikke tillatt
let navn: string | null = null;         // OK — eksplisitt

function lengde(s: string | null): number {
  return s.length;                       // FEIL — s kan være null
}
function lengde(s: string | null): number {
  return s?.length ?? 0;                 // OK — håndter null
}`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Declaration files — .d.ts
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// I en .d.ts beskriver du typen UTEN implementasjon.
// Brukes for å legge typer til en JS-bibliotek som ikke har dem.

// types/min-bib.d.ts
declare module "min-bib" {
  export function hilse(navn: string): string;
  export const VERSJON: string;
}

// Etterpå kan TypeScript-koden si:
import { hilse } from "min-bib";
hilse("Ada");                            // OK, typesjekkes

// De aller fleste pakker har enten innebygd .d.ts eller en
// @types/* pakke på npm:
//    npm i -D @types/lodash`}</pre>
          </div>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "react-grunnlag" }} className="text-brand hover:underline">
                React-grunnlag
              </Link>{" "}— komponentene blir typesikre med TSX.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "javascript-grunnlag" }} className="text-brand hover:underline">
                JavaScript-grunnlag
              </Link>{" "}— fundamentet TS bygger på.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
