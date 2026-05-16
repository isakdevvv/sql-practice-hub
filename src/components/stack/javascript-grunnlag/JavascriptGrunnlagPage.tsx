import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page covering modern JavaScript fundamentals — variables, types,
// `this`, closures, prototypes/classes, the event loop, and common pitfalls.

const STEPS = [
  { title: "var, let, const — og hoisting", anchor: "variabler" },
  { title: "Typer — primitive vs objekter", anchor: "typer" },
  { title: "this — fire regler", anchor: "this" },
  { title: "Closures", anchor: "closures" },
  { title: "Prototyper og klasser", anchor: "klasser" },
  { title: "Event loop, microtasks og tasks", anchor: "eventloop" },
  { title: "Promise og async/await", anchor: "promise" },
  { title: "=== vs == og vanlige feller", anchor: "feller" },
];

export function JavascriptGrunnlagPage() {
  return (
    <StackPageShell title="JavaScript-grunnlag" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Moderne web · Språk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            JavaScript — fra var til async/await
          </h1>
          <p className="mt-3 text-muted-foreground">
            JavaScript er dynamisk typet, single-threaded, og kjører i en event
            loop. Det er små valg — <code>var</code> vs <code>const</code>,{" "}
            <code>==</code> vs <code>===</code>, hvor <code>this</code> peker —
            som skiller en kode som fungerer fra en som lekker bugs. Dette er
            minimums-syntaksen og mental-modellen du må ha før React og
            TypeScript begynner å gi mening.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «JavaScript» — match var/let/const, quiz om hoisting og{" "}
              <code>this</code>, fyll-inn Promise/async, event-loop-rekkefølge.
            </div>
          </div>
        </div>

        <CourseOutline courseId="javascript-grunnlag" steps={STEPS} />

        {/* 1. var/let/const */}
        <section id="variabler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. var, let, const — og hoisting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre måter å erklære en variabel på. Bruk <code>const</code> som
            standard, <code>let</code> hvis verdien skal endres, og{" "}
            <strong>aldri <code>var</code></strong> i ny kode.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// const — kan ikke rebindes. Verdien (hvis objekt) er fortsatt mutabel.
const PI = 3.14;
const liste = [1, 2, 3];
liste.push(4);          // OK — vi muterer objektet
// liste = [];          // SyntaxError — kan ikke rebinde

// let — kan rebindes, blokk-scoped
let teller = 0;
teller += 1;

// var — funksjons-scoped, hoistes til toppen, undefined inntil tilordning
function gammel() {
  console.log(x);       // undefined  (IKKE ReferenceError!)
  var x = 5;
  if (true) {
    var x = 10;          // SAMME x som over — ikke ny variabel
  }
  console.log(x);       // 10
}`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Hoisting — hva blir flyttet til toppen
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// var DEKLARASJON hoistes, tilordning ligger igjen
console.log(a);     // undefined
var a = 1;

// let/const hoistes også, men inn i "temporal dead zone" (TDZ)
console.log(b);     // ReferenceError — TDZ
let b = 1;

// Funksjons-deklarasjon hoistes FULLT — kan kalles før definisjon
hei();              // OK
function hei() { console.log("hei"); }

// Funksjons-uttrykk hoistes IKKE
hade();             // TypeError: hade is not a function
var hade = function() {};`}</pre>
          </div>
          <ul className="mt-3 space-y-1 text-sm list-disc pl-5 text-muted-foreground">
            <li><code>const</code> &gt; <code>let</code> &gt; <code>var</code>. <code>var</code> overlevde av legacy-grunner.</li>
            <li>Blokk-scope ({"{ ... }"}) gjelder bare for <code>let</code>/<code>const</code>.</li>
            <li>«hoisting» betyr at deklarasjoner kjent på toppen av scope-et — initialiseringen flyttes ikke.</li>
          </ul>
        </section>

        {/* 2. Typer */}
        <section id="typer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Typer — primitive vs objekter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            JavaScript har 7 primitive typer og «alt annet er object». Primitive
            verdier kopieres når de tilordnes; objekter sender referansen.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Type</th>
                  <th className="text-left font-semibold px-4 py-2">Eksempel / merknad</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">string</td><td className="px-4 py-3 text-muted-foreground">"hei", 'hei', `hei ${"navn"}`</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">number</td><td className="px-4 py-3 text-muted-foreground">Alle tall — 1, 3.14, NaN, Infinity (64-bit float)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">bigint</td><td className="px-4 py-3 text-muted-foreground">10n — tall større enn 2^53</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">boolean</td><td className="px-4 py-3 text-muted-foreground">true / false</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">null</td><td className="px-4 py-3 text-muted-foreground">«bevisst tomhet» — du satte den</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">undefined</td><td className="px-4 py-3 text-muted-foreground">«ikke satt» — default for variabler uten verdi</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">symbol</td><td className="px-4 py-3 text-muted-foreground">Unik «navn-verdi» — sjelden brukt manuelt</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">object</td><td className="px-4 py-3 text-muted-foreground">{"{}, [], function () {}, new Date() — alt annet"}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`typeof "hei"        // "string"
typeof 42           // "number"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object"   ← historisk bug i JS, kan ikke fikses
typeof []           // "object"   ← bruk Array.isArray() istedenfor
typeof function(){} // "function" ← undertype av object

// Verdi vs referanse
let a = 1;
let b = a;          // b = 1 (kopi)
b = 99;
console.log(a);     // 1 (uendret)

let x = { n: 1 };
let y = x;          // y peker på SAMME objekt
y.n = 99;
console.log(x.n);   // 99 (begge peker på samme)`}</pre>
          </div>
        </section>

        {/* 3. this */}
        <section id="this" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. this — fire regler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>this</code> avhenger av <em>hvordan</em> funksjonen kalles, ikke
            hvor den er definert. Det er fire regler — i prioritert rekkefølge.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// 1. new-binding — when called with 'new', this = nytt objekt
function Person(navn) { this.navn = navn; }
const p = new Person("Ada");
console.log(p.navn);              // "Ada"

// 2. eksplisitt — .call() / .apply() / .bind()
function hils() { console.log("Hei " + this.navn); }
hils.call({ navn: "Bob" });       // "Hei Bob"
const bundet = hils.bind({ navn: "Carl" });
bundet();                          // "Hei Carl"

// 3. implicit — funksjon kalt SOM metode på objekt
const obj = {
  navn: "Dora",
  hils() { console.log("Hei " + this.navn); }
};
obj.hils();                        // "Hei Dora"  (this = obj)

// 4. default — alt annet
function ensom() { console.log(this); }
ensom();                           // strict: undefined, ellers globalt objekt

// Arrow-funksjoner har INGEN egen this — de arver fra omgivelsen
const lukke = {
  navn: "Eva",
  hils: () => console.log(this.navn),   // this = omgivelsen (ikke lukke!)
};
lukke.hils();                      // undefined`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Vanlig feile:</strong> sende en metode som callback mister{" "}
            <code>this</code>: <code>setTimeout(obj.hils, 100)</code> kaller{" "}
            <code>hils</code> uten objektet. Bruk{" "}
            <code>obj.hils.bind(obj)</code> eller{" "}
            <code>{"() => obj.hils()"}</code>.
          </p>
        </section>

        {/* 4. Closures */}
        <section id="closures" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Closures</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En closure er en funksjon som «husker» variabler fra omgivelsen sin,
            selv etter at omgivelsen er ferdig. Det er fundamentet for moduler,
            React-hooks og private felt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function lagTeller() {
  let n = 0;                  // privat
  return {
    inc() { n += 1; return n; },
    get() { return n; },
  };
}

const t = lagTeller();
t.inc();                       // 1
t.inc();                       // 2
t.get();                       // 2
// n er IKKE tilgjengelig utenfra — bare gjennom inc/get`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Klassisk feile — loop med var
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// FEIL — alle setTimeout-ene deler SAMME i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 3, 3, 3   (i = 3 når callbacks kjører)

// RIKTIG — let lager ny binding per iterasjon
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 0, 1, 2`}</pre>
          </div>
        </section>

        {/* 5. Prototyper og klasser */}
        <section id="klasser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Prototyper og klasser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            JavaScript har ikke «ekte» klasser — <code>class</code> er syntaktisk
            sukker over prototype-arv. Hvert objekt har en intern lenke (proto)
            til et annet objekt det «arver» fra.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Moderne — class-syntaks
class Dyr {
  constructor(navn) { this.navn = navn; }
  lyd()             { return "..."; }
}

class Hund extends Dyr {
  lyd()             { return "Voff"; }
}

const h = new Hund("Rex");
h.lyd();                        // "Voff"
h instanceof Hund;              // true
h instanceof Dyr;               // true (via prototype-kjeden)

// Under-the-hood (prototype-mønster) — samme effekt
function DyrGammel(navn) { this.navn = navn; }
DyrGammel.prototype.lyd = function() { return "..."; };
const g = new DyrGammel("Lo");
g.lyd();                        // "..."
Object.getPrototypeOf(g) === DyrGammel.prototype;   // true`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Klasse-syntaksen kom i ES2015. Når du leser eldre kode (jQuery,
            Node-pakker) ser du <code>Foo.prototype.bar = ...</code> — det er
            samme idé.
          </p>
        </section>

        {/* 6. Event loop */}
        <section id="eventloop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Event loop, microtasks og tasks</h2>
          <p className="text-sm text-muted-foreground mb-4">
            JavaScript er single-threaded. Alt asynkront (timer, fetch, click,
            Promise) putter en jobb i en kø, og event-loopen plukker dem opp
            mellom synkrone blokker. To køer har ulike prioriteter:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border mb-3">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Kø</th>
                  <th className="text-left font-semibold px-4 py-2">Hva havner der</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">microtasks</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Promise <code>.then</code>/<code>.catch</code>,{" "}
                    <code>queueMicrotask</code>, <code>await</code>-fortsettelser.{" "}
                    <strong>Tømmes helt før neste task.</strong>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">tasks</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <code>setTimeout</code>, <code>setInterval</code>, I/O,
                    DOM-events.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");

// Output: 1, 4, 3, 2
// 1 og 4: synkront
// 3: microtask — kjøres etter synkron blokk, FØR timeren
// 2: task — kjøres etter at microtask-køen er tom`}</pre>
          </div>
        </section>

        {/* 7. Promise og async/await */}
        <section id="promise" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Promise og async/await</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En Promise er et objekt som representerer en verdi som kommer
            seinere. <code>async/await</code> er syntaktisk sukker som lar deg
            skrive asynkron kode i lineær form.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Promise — tre states: pending, fulfilled, rejected
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve(42), 100);
});

p.then(verdi => console.log(verdi))      // 42
 .catch(err => console.error(err))
 .finally(() => console.log("ferdig"));`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              async/await — samme kode, leselig
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`async function hentBruker(id) {
  try {
    const res = await fetch("/api/users/" + id);
    if (!res.ok) throw new Error("Status " + res.status);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Feil:", err);
    return null;
  }
}

// async-funksjoner RETURNERER alltid en Promise
const u = hentBruker(1);    // Promise<User | null>
u.then(d => console.log(d));`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Parallelle vs sekvensielle await
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// SEKVENSIELT — 2 sekunder totalt
const a = await hent("/a");   // venter 1s
const b = await hent("/b");   // venter 1s mer

// PARALLELT — 1 sekund totalt
const [a, b] = await Promise.all([hent("/a"), hent("/b")]);

// Promise.allSettled — venter på alle, uansett om noen feiler
const resultater = await Promise.allSettled([p1, p2, p3]);
// hver: { status: "fulfilled", value: ... } eller { status: "rejected", reason: ... }`}</pre>
          </div>
        </section>

        {/* 8. Feller */}
        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. === vs == og vanlige feller</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              == gjør type-coercion. === gjør det IKKE.
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`0 == "0"            // true  — string konverteres til number
0 == false          // true  — boolean konverteres til number
null == undefined   // true  — eneste «like» null-aktige
"" == 0             // true  — tom string blir 0

0 === "0"           // false
0 === false         // false
null === undefined  // false

// Regel: bruk ALLTID === og !==, med UNNTAK av:
if (x == null)      // sjekker både null OG undefined på én linje`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Truthy / falsy
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Falsy: false, 0, -0, 0n, "", null, undefined, NaN
// Alt annet er truthy — også []  og  {}  !

if ([])  console.log("ja");     // ja  — array er truthy selv om tom
if ({})  console.log("ja");     // ja  — objekt er truthy
if ("0") console.log("ja");     // ja  — ikke-tom string er truthy

// Vanlig feile:
const liste = [];
if (liste) { /* alltid sant — sjekk liste.length isteden */ }`}</pre>
          </div>
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Andre feller å huske
            </div>
            <ul className="space-y-1.5 text-sm">
              <li><strong>NaN === NaN er false.</strong> Bruk <code>Number.isNaN(x)</code>.</li>
              <li><strong>0.1 + 0.2 !== 0.3.</strong> Float-presisjon. Bruk en epsilon eller heltall (øre).</li>
              <li><strong><code>typeof null === "object"</code></strong>. Bruk <code>x === null</code>.</li>
              <li><strong><code>[] + []</code> blir "" (tom string).</strong> Operatorene konverterer.</li>
              <li><strong><code>parseInt("08")</code></strong> ble før 0 (oktal-bug). Skriv alltid radix: <code>parseInt(s, 10)</code>.</li>
            </ul>
          </div>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "typescript" }} className="text-brand hover:underline">
                TypeScript
              </Link>{" "}— legg statiske typer på JavaScript.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "react-grunnlag" }} className="text-brand hover:underline">
                React
              </Link>{" "}— bygg UI med komponenter og hooks.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
