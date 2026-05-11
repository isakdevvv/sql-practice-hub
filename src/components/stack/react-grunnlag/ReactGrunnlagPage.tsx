import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page covering React fundamentals: components, JSX, props, hooks,
// effects, lifting state, controlled forms, useMemo/useCallback, useRef,
// context API, custom hooks, common pitfalls.

const STEPS = [
  { title: "Komponenter og JSX", anchor: "komponenter" },
  { title: "Props og dataflyt", anchor: "props" },
  { title: "useState — lokal state", anchor: "usestate" },
  { title: "useEffect og cleanup", anchor: "useeffect" },
  { title: "Lifting state og controlled forms", anchor: "lifting" },
  { title: "useMemo, useCallback og useRef", anchor: "memoref" },
  { title: "Context API og custom hooks", anchor: "context" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function ReactGrunnlagPage() {
  return (
    <StackPageShell title="React-grunnlag" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Moderne web · Frontend-rammeverk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            React — komponenter, hooks og dataflyt
          </h1>
          <p className="mt-3 text-muted-foreground">
            React er et bibliotek for å bygge brukergrensesnitt som
            komponer­bare biter med tilstand. Du beskriver hvordan UI{" "}
            <em>ser ut</em> for en gitt state, og React tar seg av å oppdatere
            DOM-en når staten endrer seg. Etter <code>useState</code> og{" "}
            <code>useEffect</code> har du 80 % av det du trenger til daglig.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «React» — hooks-regler, useEffect cleanup, controlled form,
              stale closure, useMemo vs useCallback.
            </div>
          </div>
        </div>

        <CourseOutline courseId="react-grunnlag" steps={STEPS} />

        {/* 1. Komponenter */}
        <section id="komponenter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Komponenter og JSX</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En komponent er en funksjon som returnerer JSX — HTML-aktig syntaks
            som transpileres til <code>React.createElement(...)</code>.
            Komponent-navn må starte med stor bokstav.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Hello.tsx
export function Hello() {
  const navn = "Ada";
  return (
    <div className="boks">
      <h1>Hei, {navn}!</h1>
      <p>Tall: {1 + 2}</p>
    </div>
  );
}

// JSX-regler:
//  - className, ikke class (class er JS-nøkkelord)
//  - kameltrekk: onClick, tabIndex, htmlFor
//  - selv-lukkende tagger MÅ ha /:  <br />, <img />
//  - kun ÉN rotelement — bruk <>...</> (fragment) hvis trengs
//  - {uttrykk} kan settes inn — IKKE statements`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Conditional og lister
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function Liste({ items }: { items: string[] }) {
  if (items.length === 0) return <p>Tom liste</p>;

  return (
    <ul>
      {items.map((x, i) => (
        <li key={x}>{i + 1}. {x}</li>
      ))}
      {items.length > 5 && <li>...og flere</li>}
    </ul>
  );
}

// key er PÅKREVD i lister — React bruker den til å spore hvilken li
// som er hvilken når listen endrer seg. ALDRI bruk index som key
// hvis listen kan omsorteres eller filtreres.`}</pre>
          </div>
        </section>

        {/* 2. Props */}
        <section id="props" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Props og dataflyt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Props er argumentene til en komponent. Data flyter alltid{" "}
            <em>nedover</em> — fra forelder til barn. Callbacks (funksjoner som
            props) lar barn melde tilbake oppover.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`type KnappProps = {
  tekst: string;
  variant?: "primary" | "secondary";    // ?: valgfri
  onClick: () => void;
  children?: React.ReactNode;            // <Knapp>...her...</Knapp>
};

function Knapp({ tekst, variant = "primary", onClick, children }: KnappProps) {
  return (
    <button className={"btn " + variant} onClick={onClick}>
      {tekst}
      {children}
    </button>
  );
}

// Bruk
<Knapp tekst="Lagre" onClick={() => console.log("lagret")} />
<Knapp tekst="Avbryt" variant="secondary" onClick={lukk}>
  <span className="ikon">✕</span>
</Knapp>`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Props er <strong>read-only</strong>. En komponent skal aldri mutere
            sine egne props. Hvis verdien må endres, hører den hjemme i state —
            enten i denne komponenten eller en forfar.
          </p>
        </section>

        {/* 3. useState */}
        <section id="usestate" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. useState — lokal state</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>useState</code> gir komponenten et minne mellom render. Den
            returnerer en tuple: nåværende verdi og en setter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import { useState } from "react";

function Teller() {
  const [n, setN] = useState(0);

  return (
    <div>
      <p>Tall: {n}</p>
      <button onClick={() => setN(n + 1)}>+1</button>
      <button onClick={() => setN(0)}>Nullstill</button>
    </div>
  );
}

// Update basert på FORRIGE verdi — bruk funksjons-formen
setN(prev => prev + 1);    // garantert basert på siste state
setN(n + 1);               // BUGS hvis flere setN i samme handler!

// Eksempel — bug:
function Buggy() {
  const [n, setN] = useState(0);
  function trippelInc() {
    setN(n + 1);
    setN(n + 1);           // alle tre bruker SAMME n
    setN(n + 1);           // resultat: n + 1, ikke n + 3
  }
}`}</pre>
          </div>
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Hooks-reglene
            </div>
            <ul className="space-y-1.5 text-sm">
              <li>Kall hooks bare på <strong>toppen av en komponent</strong> — aldri i if/for/etter return.</li>
              <li>Kall hooks bare fra <strong>React-funksjoner</strong> (komponent eller custom hook).</li>
              <li>Custom hooks må starte med <code>use</code> — det er hvordan React vet at de bruker hooks.</li>
            </ul>
          </div>
        </section>

        {/* 4. useEffect */}
        <section id="useeffect" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. useEffect og cleanup</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>useEffect</code> kjører kode <em>etter</em> at React har rendret —
            til synkronisering med ting utenfor React (API-kall, timere,
            abonnement, DOM-manipulering).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import { useState, useEffect } from "react";

function Bruker({ id }: { id: number }) {
  const [data, setData] = useState<User | null>(null);

  useEffect(() => {
    let avbrytt = false;
    fetch("/api/users/" + id)
      .then(r => r.json())
      .then(u => {
        if (!avbrytt) setData(u);     // sjekk før setState
      });

    // CLEANUP — kjøres før neste effekt OG ved unmount
    return () => { avbrytt = true; };
  }, [id]);    // dependency array — kjør bare når id endrer seg

  if (!data) return <p>Laster...</p>;
  return <p>{data.navn}</p>;
}`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Dependency array</th>
                  <th className="text-left font-semibold px-4 py-2">Når kjøres effekten</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono"><code>useEffect(() =&gt; ..., [])</code></td>
                  <td className="px-4 py-3 text-muted-foreground">Én gang på mount</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono"><code>useEffect(() =&gt; ..., [a, b])</code></td>
                  <td className="px-4 py-3 text-muted-foreground">På mount + når a eller b endrer seg</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono"><code>useEffect(() =&gt; ...)</code></td>
                  <td className="px-4 py-3 text-muted-foreground">Etter hver render — sjelden ønsket</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Returner alltid en cleanup hvis effekten åpner noe (timer, lytter,
            websocket). Glem cleanup, og du får memory leaks og
            «<code>Can't perform a React state update on an unmounted component</code>».
          </p>
        </section>

        {/* 5. Lifting state + controlled */}
        <section id="lifting" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lifting state og controlled forms</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når to søsken-komponenter må dele state, flyttes staten opp til
            nærmeste felles forelder, og sendes ned som props. Det kalles{" "}
            <em>lifting state up</em>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Controlled form — React eier verdien
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function Skjema() {
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();                    // ikke reload siden
    fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ navn, epost }),
    });
  }

  return (
    <form onSubmit={send}>
      <input
        value={navn}                       // React eier verdien
        onChange={e => setNavn(e.target.value)}
        placeholder="Navn"
      />
      <input
        type="email"
        value={epost}
        onChange={e => setEpost(e.target.value)}
      />
      <button type="submit" disabled={!navn || !epost}>Send</button>
    </form>
  );
}`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/2">Controlled</th>
                  <th className="text-left font-semibold px-4 py-2">Uncontrolled</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">React state = sannheten</td>
                  <td className="px-4 py-3 text-muted-foreground">DOM-en eier verdien, leses via ref</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground"><code>value</code> + <code>onChange</code></td>
                  <td className="px-4 py-3 text-muted-foreground"><code>defaultValue</code> + <code>ref</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">Lett å validere mens man skriver</td>
                  <td className="px-4 py-3 text-muted-foreground">Mindre kode, men vanskeligere å overvåke</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. memo/ref */}
        <section id="memoref" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. useMemo, useCallback og useRef</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Trekløveret for ytelse og DOM-tilgang. Bruk dem målrettet — premature
            optimization gjør koden vanskeligere å lese.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// useMemo — cache en VERDI på tvers av render
const sortert = useMemo(
  () => liste.slice().sort((a, b) => a - b),
  [liste]
);

// useCallback — cache en FUNKSJON (for å stabilisere props til memo-barn)
const handleClick = useCallback(
  (id: number) => slett(id),
  [slett]
);

// useRef — mutabel «boks» som overlever renders
// Bruk 1: tilgang til DOM-element
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => { inputRef.current?.focus(); }, []);
return <input ref={inputRef} />;

// Bruk 2: holde verdier som IKKE skal trigge re-render
const startTid = useRef(Date.now());
// startTid.current kan endres uten render`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Hook</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">useMemo</td>
                  <td className="px-4 py-3 text-muted-foreground">Dyr utregning eller objekt som passeres til memo-barn</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">useCallback</td>
                  <td className="px-4 py-3 text-muted-foreground">Funksjon passeres til memo-barn, eller brukes som dependency</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">useRef</td>
                  <td className="px-4 py-3 text-muted-foreground">DOM-tilgang, eller mutabel verdi uten render-trigger</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Context og custom hooks */}
        <section id="context" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Context API og custom hooks</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Context lar deg dele verdier (tema, innlogget bruker, språk) til en
            hel undertre uten å sende props gjennom hvert nivå (prop drilling).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import { createContext, useContext, useState } from "react";

type Tema = "lys" | "mork";
const TemaCtx = createContext<{
  tema: Tema;
  setTema: (t: Tema) => void;
} | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("lys");
  return (
    <TemaCtx.Provider value={{ tema, setTema }}>
      {children}
    </TemaCtx.Provider>
  );
}

// Custom hook som pakker bruken pent inn
export function useTema() {
  const ctx = useContext(TemaCtx);
  if (!ctx) throw new Error("useTema må brukes inne i TemaProvider");
  return ctx;
}

// Bruk
function Veksler() {
  const { tema, setTema } = useTema();
  return (
    <button onClick={() => setTema(tema === "lys" ? "mork" : "lys")}>
      Bytt til {tema === "lys" ? "mørk" : "lys"} modus
    </button>
  );
}`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Custom hook — gjenbrukbar logikk
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Et hook som synker en verdi til localStorage
function useLocalStorage<T>(key: string, initial: T) {
  const [verdi, setVerdi] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(verdi));
  }, [key, verdi]);

  return [verdi, setVerdi] as const;
}

// Bruk
const [navn, setNavn] = useLocalStorage("brukernavn", "");`}</pre>
          </div>
        </section>

        {/* 8. Feller */}
        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Vanlige feller</h2>
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
              <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
                Stale closure
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre mb-2">{`function Teller() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setN(n + 1);                // bug — n er ALLTID 0 her
    }, 1000);
    return () => clearInterval(id);
  }, []);                          // tom array → fanger n=0 for evig
}`}</pre>
              <p className="text-sm">
                Fiks: bruk funksjons-formen <code>setN(prev =&gt; prev + 1)</code>{" "}
                eller legg <code>n</code> i dependency-array (men da settes en ny
                interval per tick).
              </p>
            </div>

            <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
              <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
                Infinite loop
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre mb-2">{`useEffect(() => {
  setData(hentData());            // setter state
}, [data]);                        // som trigger effekten igjen
// → uendelig løkke`}</pre>
              <p className="text-sm">
                Fiks: sett bare state betinget, eller bruk en ny dependency
                (typisk et id som faktisk endres).
              </p>
            </div>

            <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
              <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
                Mutere state direkte
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre mb-2">{`// FEIL
liste.push(x);                    // muterer arrayet — React ser ingen endring
setListe(liste);                  // samme referanse → ingen re-render

// RIKTIG
setListe([...liste, x]);          // ny array

// Samme for objekter
setBruker({ ...bruker, navn: "Nytt" });`}</pre>
            </div>

            <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
              <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
                Index som key
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre mb-2">{`// FEIL hvis listen kan filtreres/omsorteres
{items.map((x, i) => <Rad key={i} data={x} />)}

// RIKTIG — bruk en STABIL identitet fra dataene
{items.map(x => <Rad key={x.id} data={x} />)}`}</pre>
            </div>
          </div>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "css-moderne" }} className="text-brand hover:underline">
                CSS moderne
              </Link>{" "}— flexbox, grid, custom properties, dark mode.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "typescript" }} className="text-brand hover:underline">
                TypeScript
              </Link>{" "}— gir props og state ekte typer.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
