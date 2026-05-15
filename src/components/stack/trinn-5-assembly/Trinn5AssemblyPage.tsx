import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { AssemblyVisualizer } from "./AssemblyVisualizer";

const STEPS = [
  { title: "Interaktiv assembly-trace", anchor: "trace" },
  { title: "Hva assembly er", anchor: "hva" },
  { title: "Registre i x86-64", anchor: "registre" },
  { title: "mov, add, sub, cmp — grunninstruksjonene", anchor: "grunn" },
  { title: "Hopp og betingelser — jmp, je, jl", anchor: "hopp" },
  { title: "Stack-frames og call/ret", anchor: "stack" },
  { title: "Kallkonvensjon — System V AMD64", anchor: "kall" },
  { title: "Eksempel — C-funksjon disassemblert", anchor: "eksempel" },
];

export function Trinn5AssemblyPage() {
  return (
    <StackPageShell title="5. Assembly" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Assembly — språket CPU-en faktisk forstår
          </h1>
          <p className="mt-3 text-muted-foreground">
            Assembly er en tekstuell representasjon av maskinkoden CPU-en
            kjører. Hver linje er én instruksjon — en av de få hundre
            byggeklossene CPU-en kjenner. Vi bruker x86-64 (Intel/AMD-syntaksen i
            Linux: AT&amp;T-stil med <code>%</code>-prefiks, eller Intel-stil
            uten). Her bruker vi Intel-syntaks fordi den er enklere å lese.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Assembly» — fill in mov/add/jmp, stack-frame layout,
              kallkonvensjon.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-5-assembly" steps={STEPS} />

        <section id="trace" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv assembly-trace
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Steg deg gjennom fire små programmer i en miniatyr-x86-64. Se hva
            som skjer i registrene, minnet og stacken for hver instruksjon. Bytt
            program øverst, bruk Play eller piltastene under for å trå
            instruksjon for instruksjon.
          </p>
          <AssemblyVisualizer />
        </section>

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva assembly er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver assembly-instruksjon mapper én-til-én til en{" "}
            <em>maskininstruksjon</em> — en sekvens av bytes som CPU-en
            kjenner igjen. Det er den siste tekstrepresentasjonen før det
            blir ren binær.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tre nivåer av det samme programmet — "1 + 2":

  C-kode:
    int a = 1 + 2;

  Assembly (x86-64, Intel-syntax):
    mov eax, 1
    add eax, 2
    mov DWORD PTR [rbp-4], eax

  Maskinkode (faktiske bytes):
    b8 01 00 00 00      ; mov eax, 1
    83 c0 02            ; add eax, 2
    89 45 fc            ; mov [rbp-4], eax

Hver byte er det CPU-en faktisk leser fra RAM når PC peker hit.
Du kan disassemble med 'objdump -d binary' eller 'gdb (gdb) disas main'.`}</pre>
          </div>
        </section>

        <section id="registre" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Registre i x86-64</h2>
          <p className="text-sm text-muted-foreground mb-4">
            x86-64 har 16 generelle registre på 64 bits hver. Hvert
            register kan også brukes som mindre subset.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Generelle registre:

  64-bit   32-bit   16-bit   8-bit (low)   Konvensjonell rolle
  ──────   ──────   ──────   ───────────   ──────────────────────────
  rax      eax      ax       al            return-verdi, akkumulator
  rbx      ebx      bx       bl            callee-saved, "B" base
  rcx      ecx      cx       cl            4. arg, "C" counter (loops)
  rdx      edx      dx       dl            3. arg, "D" data
  rsi      esi      si       sil           2. arg, "Source Index"
  rdi      edi      di       dil           1. arg, "Destination Index"
  rbp      ebp      bp       bpl           base pointer (stack-frame)
  rsp      esp      sp       spl           STACK POINTER — alltid topp av stack
  r8-r15   r8d..    r8w..    r8b..         5.-6. arg, ekstra

Spesialregistre:
  rip      ─       ─        ─            Instruction Pointer (= PC)
  rflags   ─       ─        ─            CF, ZF, SF, OF — flag-bits

  64-bit:  rax = ████████████████████████████████████████████████████████████████ (64 bits)
  32-bit:  eax = ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████████████████████ (lavere 32)
  16-bit:  ax  = ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████ (lavere 16)
  8-bit:   al  = ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████ (lavere 8)

  Å skrive til eax NULLSTILLER de øverste 32 bits av rax (x86-64-quirk).`}</pre>
          </div>
        </section>

        <section id="grunn" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. mov, add, sub, cmp — grunninstruksjonene</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`mov   ── flytt data
  mov rax, 42          ; rax := 42 (konstant)
  mov rax, rbx         ; rax := rbx
  mov rax, [rbx]       ; rax := minne på adresse rbx (load)
  mov [rbx], rax       ; minne på adresse rbx := rax (store)
  mov [rbx + 8], rax   ; med offset
  mov [rbx + rcx*4], rax ; base + index*scale (array-access)

add   ── legge til
  add rax, 1           ; rax := rax + 1
  add rax, rbx         ; rax := rax + rbx
  add [rax], 5         ; mem[rax] := mem[rax] + 5

sub   ── trekke fra (samme mønster)
  sub rsp, 16          ; rsp := rsp - 16 (vanlig: lag plass på stacken)

cmp   ── sammenligne (setter flags, lagrer ikke resultatet)
  cmp rax, 10          ; FLAGS = rax - 10 ;  (men rax endres ikke)
  ; etter dette:
  ;   ZF=1 hvis rax == 10
  ;   SF=1 hvis rax < 10 (signed)
  ;   CF=1 hvis rax < 10 (unsigned)

test  ── som cmp, men med AND
  test rax, rax        ; AND rax, rax ⇒ ZF=1 iff rax == 0

inc/dec ── ++/--
  inc rcx
  dec rcx`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Memory-operander i firkantparentes <code>[ ]</code> er
            «pekere». <code>[rbx]</code> betyr «innholdet på adressen i
            rbx» — som <code>*rbx</code> i C-pekere.
          </p>
        </section>

        <section id="hopp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Hopp og betingelser</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ubetinget hopp:
  jmp label             ; PC := label, alltid

Betingede hopp (etter en cmp):
  je   label            ; jump if equal (ZF=1)
  jne  label            ; jump if not equal (ZF=0)
  jl   label            ; jump if less (signed)
  jle  label            ; jump if less or equal (signed)
  jg   label            ; jump if greater (signed)
  jge  label            ; jump if greater or equal (signed)
  jb   label            ; jump if below (unsigned)
  ja   label            ; jump if above (unsigned)
  jz   label            ; jump if zero (samme som je)
  jnz  label            ; jump if not zero

Eksempel — if (a < b) goto less:

   C-kode:
     if (a < b) goto less;

   Assembly (anta a = rax, b = rbx):
     cmp rax, rbx        ; sammenlign
     jl  less            ; hopp hvis rax < rbx (signed)
     ; ... fortsetter her ellers ...
   less:
     ; ...


Loop-eksempel — for (int i = 0; i < 10; i++):

       mov rcx, 0          ; i := 0
   loop_start:
       cmp rcx, 10
       jge loop_end        ; if (i >= 10) gå ut
       ; ... loop-body ...
       inc rcx             ; i++
       jmp loop_start
   loop_end:`}</pre>
          </div>
        </section>

        <section id="stack" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Stack-frames og call/ret</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Stacken er et område i RAM hvor funksjonskall lagrer lokale
            variabler, parametre, og return-adressen. <code>rsp</code> er
            alltid pekeren til toppen av stacken. Stacken VOKSER NEDOVER
            (mot lavere adresser) på x86.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`call og ret:

  call func             ; push neste-instruksjons-adresse, så jmp func
  ret                    ; pop adresse av stacken, jmp dit

Det er ekvivalent til:

  call func   =>   push rip+5      ; lagre return-adresse
                   jmp func

  ret         =>   pop rip         ; lese return-adresse, hopp dit


Typisk stack-frame layout for en funksjon foo:

  Høyere adresser
       │
       │  [forrige stack-frame]
       │  ────────────────────  ← rbp peker hit (gammelt rbp ble lagret)
       │  return-adresse  (lagt av 'call')
       │  gammelt rbp     (lagt av 'push rbp')
       │  lokal var 1     [rbp - 8]
       │  lokal var 2     [rbp - 16]
       │  ...
       │  ────────────────────  ← rsp peker hit
       │
  Lavere adresser  (mot 0)

Standard prolog/epilog for en x86-64 funksjon:

   foo:
       push rbp            ; lagre forrige stack-frame-base
       mov rbp, rsp        ; vår nye base = nåværende toppen
       sub rsp, 32         ; lag plass for lokale variabler
       ; ... funksjons-kropp ...
       mov rsp, rbp        ; rull tilbake stacken
       pop rbp             ; gjenopprett forrige base
       ret                 ; gå tilbake til kalleren`}</pre>
          </div>
        </section>

        <section id="kall" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Kallkonvensjon — System V AMD64</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kompilatoren må vite hvilke registre som er argumenter, hvor
            return-verdien havner, og hvilke som må bevares over kall. Det
            kalles «calling convention».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`System V AMD64 ABI (Linux, macOS):

  Argument-registre (heltall / pekere):
    1. arg:  rdi
    2. arg:  rsi
    3. arg:  rdx
    4. arg:  rcx
    5. arg:  r8
    6. arg:  r9
    7. arg+: på stacken

  Return-verdi:
    rax                  ; (rdx:rax for 128-bit)

  Caller-saved (kalleren må lagre hvis den vil ha verdien igjen etter call):
    rax, rcx, rdx, rsi, rdi, r8-r11

  Callee-saved (funksjonen må gjenopprette før den returnerer):
    rbx, rbp, rsp, r12-r15

Eksempel — int sum(int a, int b, int c) { return a + b + c; }

   sum:
       push rbp
       mov rbp, rsp
       ; a er i edi (32-bit del av rdi)
       ; b er i esi
       ; c er i edx
       mov eax, edi        ; eax := a
       add eax, esi        ; eax += b
       add eax, edx        ; eax += c
       pop rbp
       ret                  ; return-verdi i eax`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Windows har en helt annen kallkonvensjon (Microsoft x64) — rcx,
            rdx, r8, r9 er argumenter. Det er derfor systemkall mellom
            Windows og Linux ikke er binær-kompatible.
          </p>
        </section>

        <section id="eksempel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Eksempel — en C-funksjon disassemblert</h2>
          <p className="text-sm text-muted-foreground mb-4">
            La oss se en hel C-funksjon og hva gcc lager av den.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`C-kilde:

   int maks(int a, int b) {
       if (a > b) return a;
       return b;
   }

Kompilert med gcc -O0 (ingen optimering) — disassemblert:

   maks:
       push rbp                ; standard prolog
       mov  rbp, rsp
       mov  DWORD PTR [rbp-4], edi   ; lagre a på stacken (lokal kopi)
       mov  DWORD PTR [rbp-8], esi   ; lagre b
       mov  eax, DWORD PTR [rbp-4]   ; eax := a
       cmp  eax, DWORD PTR [rbp-8]   ; sammenlign med b
       jle  .L_else            ; if (a <= b) gå til else
       mov  eax, DWORD PTR [rbp-4]   ; eax := a   (return a)
       jmp  .L_end
   .L_else:
       mov  eax, DWORD PTR [rbp-8]   ; eax := b   (return b)
   .L_end:
       pop  rbp
       ret


Samme C-kode med gcc -O2:

   maks:
       cmp  edi, esi           ; a vs b direkte i registre
       mov  eax, esi           ; eax := b
       cmovg eax, edi          ; if (a > b) eax := a   <- en INSTRUKSJON
       ret

  Optimaliseringen droppet hele stack-frame-en og bruker
  betinget mov (cmovg = conditional move if greater).`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : mov/add/jmp-syntaks, stack-frame layout, kallkonvensjon.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-6-c-minne" }} className="text-brand hover:underline">
                Trinn 6 — C, minne og pekere
              </Link>
              : stack vs heap, malloc/free, segfault-eksempler.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
