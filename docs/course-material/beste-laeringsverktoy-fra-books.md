# Beste Laeringsverktoy Fra `Books/`

Dette er en praktisk backlog for aa gjore bokstoffet i `Books/` om til egne, interaktive laeringsverktoy i appen. Vi kopierer ikke tekst, figurer, kode eller oppgaver fra bokene. Vi bruker dem som fagkart: hvilke konsepter som er viktige, hvilken progresjon som virker, og hvilke mentale modeller studentene trenger.

## Prinsipp

Beste studentverktoy har en tydelig handling:

- Studenten endrer noe.
- Systemet viser konsekvensen.
- Studenten forklarer hvorfor.
- Oppgaven repeteres med nye tall/scenarioer.

Prioriter derfor simulatorer, trace-oppgaver, feiljakt og sma labber over lange tekstkapitler.

## Byggerekkefolge

1. **Datamaskin-grunnmur fra `Code`**: bits, tallbaser, porter, addere, minne, enkel CPU.
2. **Operativsystemer fra OSTEP**: prosesser, scheduling, virtuelt minne, concurrency, filsystem.
3. **Dataintensive systemer fra DDIA**: transaksjoner, indekser, replikering, partisjonering, stream/event-log.
4. **Maskinlaering fra Hands-On ML**: train/test, evaluering, pipelines, regresjon/klassifikasjon, modellvalg.
5. **AI fra AIMA**: agenter, sok, CSP, logikk, Bayes, MDP/RL.

## 1. `Code`: Fra Bit Til CPU

Hovedmaal: gi studenten fysisk og mental forstaaelse av hva en datamaskin er.

### Hoye Prioriteter

**Binary Foundations**

- Verktøy: interaktiv bit/byte-kalkulator.
- Studenthandling: toggle 8 eller 16 bits og se binar, desimal, heks, signed og unsigned.
- Hvorfor: bygger tallforstaaelse som trengs i OS, nettverk, hashing og maskinkode.
- Oppgaver: konverter tall, finn overflow, tolk samme byte signed/unsigned.

**Logic Gates Lab**

- Verktøy: AND/OR/NOT/XOR/NAND-bygger med sannhetstabell.
- Studenthandling: dra porter sammen, endre input, se output.
- Hvorfor: gjor boolsk algebra konkret.
- Oppgaver: bygg XOR fra AND/OR/NOT; lag en alarmregel som krets.

**Adder Simulator**

- Verktøy: halv-adder, full-adder og 4/8-bit ripple-carry-adder.
- Studenthandling: sett input-bits og folg carry.
- Hvorfor: viser hvordan aritmetikk bygges fra logikk.
- Oppgaver: beregn sum/carry, forklar overflow, bygg subtraksjon med toerkomplement.

**Memory Explorer**

- Verktøy: RAM-grid med adresse, data, read/write-signal.
- Studenthandling: skriv byte til adresse, les tilbake, se minnekart.
- Hvorfor: kobler bits til adresserbart minne.
- Oppgaver: finn byte paa adresse, endre en celle, forklar volatile storage.

**Tiny CPU**

- Verktøy: fetch-decode-execute-simulator med PC, IR, ACC, RAM.
- Studenthandling: skriv mini-program med `LOAD`, `ADD`, `STORE`, `JMP`.
- Hvorfor: binder minne, instruksjoner og prosessor til programmering.
- Oppgaver: spor registerverdier, finn bug i jump, implementer teller-loop.

### Medium

- Character Encoding: byte -> ASCII/Unicode-grunnlag.
- Machine Code & Assembly: opcode, mnemonic, stack, subrutine.
- Bus Visualizer: adressebuss, databuss, kontrollsignal.

## 2. OSTEP: Operativsystemer

Hovedmaal: vise OS som ressursforvalter med konkrete mekanismer.

### Hoye Prioriteter

**Process/System Call Lab**

- Verktøy: user/kernel-tidslinje med syscall trap og retur.
- Studenthandling: velg `read`, `write`, `fork`, `exec`, `wait` og se state-endring.
- Hvorfor: system calls er grensen mellom program og OS.
- Oppgaver: fork/exec/wait-trace, zombie-prosess, exit code.

**Scheduling Gantt Editor**

- Verktøy: interaktiv Gantt for FIFO, SJF, STCF, RR, MLFQ.
- Studenthandling: legg inn prosesser med arrival/burst/I/O og sammenlign algoritmer.
- Hvorfor: metrics blir synlige: turnaround, response time, fairness.
- Oppgaver: beregn ventetid, finn starvation, juster quantum.

**Virtual Memory Translator**

- Verktøy: virtuell adresse -> VPN/offset -> TLB -> page table -> fysisk adresse.
- Studenthandling: skriv adresse, se TLB hit/miss og page fault.
- Hvorfor: virtuelt minne er vanskelig uten visualisering.
- Oppgaver: oversett adresse, oppdater page table, forklar ASID/context switch.

**Concurrency Bug Lab**

- Verktøy: to trad-tidslinjer med delt variabel, lock, condition variable og semafor.
- Studenthandling: step gjennom interleavings.
- Hvorfor: race conditions og deadlocks ma sees som tidsproblemer.
- Oppgaver: reparer race med mutex, lag producer/consumer, finn deadlock og fiks lock order.

**Filesystem/Inode Lab**

- Verktøy: inode, directory entries, data blocks, direct/indirect pointers, journal.
- Studenthandling: opprett fil, link, symlink, skriv data, simuler krasj.
- Hvorfor: filer er en abstraksjon over blokker og metadata.
- Oppgaver: finn hvilke blokker en fil bruker, forklar hard link, recover fra journal.

### Medium

- Disk/RAID simulator.
- Heap/free-list visual med split/coalesce.
- `strace`-drill for shell-kommandoer.

## 3. DDIA: Dataintensive Systemer

Hovedmaal: gi studenten systemdesign-intuisjon rundt data, feil og konsistens.

### Hoye Prioriteter

**Transaction Timeline Lab**

- Verktøy: to samtidige transaksjoner med isolasjonsnivaer.
- Studenthandling: dra read/write/commit-hendelser og se anomaly.
- Hvorfor: lost update, non-repeatable read og write skew er tidslinjer.
- Oppgaver: identifiser anomaly, velg isolasjonsniva, forklar serializable.

**Index Engine Visualizer**

- Verktøy: hashindeks, B-tree og LSM-tree paa samme workload.
- Studenthandling: sett inn/les keys og se skrivesti/lesesti.
- Hvorfor: indekser er kjernen i databaseytelse.
- Oppgaver: velg indeks for workload, forklar write amplification, finn range query-kost.

**Replication Simulator**

- Verktøy: primary/follower med replikeringslag og read-after-write-problem.
- Studenthandling: juster lag, velg hvor lesing skjer.
- Hvorfor: konsistensproblem blir synlig.
- Oppgaver: finn stale read, design read-your-writes, forklar failover.

**Partitioning/Hotspot Lab**

- Verktøy: hash vs range partitioning over mange keys.
- Studenthandling: send trafikk og se hot partitions.
- Hvorfor: sharding er fordeling, men ogsa skew.
- Oppgaver: fordel keys, oppdag hot key, foresla rebalansering.

**Event Log / Materialized View Builder**

- Verktøy: event-stream inn, read model ut.
- Studenthandling: legg til events, replay, simuler duplikater/sen data.
- Hvorfor: binder stream, CDC og avledede datasett.
- Oppgaver: bygg konto-/ordrevisning, handter idempotens, vinduer.

### Medium

- Quorum-kalkulator (`N`, `R`, `W`).
- Schema evolution-lab.
- Partial failure/retry-simulator.

## 4. Hands-On ML: Praktisk Maskinlaering

Hovedmaal: la studenten bygge trygg ML-flyt for tabulaere data for avansert ML.

### Hoye Prioriteter

**Train/Validation/Test Split Lab**

- Verktøy: datasett deles og lekkasje markeres.
- Studenthandling: velg split, preprocessing-plassering og testtidspunkt.
- Hvorfor: data leakage er en av de vanligste feilene.
- Oppgaver: finn leakage, velg riktig split, forklar validering vs test.

**Confusion Matrix + Threshold Slider**

- Verktøy: interaktiv threshold som endrer TP/FP/FN/TN, precision, recall, F1.
- Studenthandling: flytt terskel og velg metrikk etter scenario.
- Hvorfor: evaluering er mer verdifullt enn modellnavn tidlig.
- Oppgaver: optimaliser for recall, precision eller F1.

**Gradient Descent Visual**

- Verktøy: loss-kurve/flata med punkt som beveger seg.
- Studenthandling: endre learning rate, regularisering og startpunkt.
- Hvorfor: forklarer trening, divergens og treg konvergens.
- Oppgaver: velg learning rate, tolk learning curve.

**Pipeline Builder**

- Verktøy: dra steg: imputering, encoding, scaling, modell, CV.
- Studenthandling: bygg pipeline og se hva som trenes bare paa train.
- Hvorfor: reproduserbarhet og riktig preprocessing.
- Oppgaver: reparer feil pipeline, legg til kategorisk encoding.

**Model Comparison Lab**

- Verktøy: samme datasett, flere modeller: logistic regression, tree, forest, SVM.
- Studenthandling: sammenlign train/test/CV og feiltyper.
- Hvorfor: modellvalg handler om data, bias/variance og metrikk.
- Oppgaver: finn overfitting, velg modell for drift.

### Medium

- PCA-projeksjon.
- Clustering/anomaly detection.
- Ensemble visual: bagging/boosting.

## 5. AIMA: Klassisk AI

Hovedmaal: bygge AI-intuisjon rundt agent, sok, resonnering og usikkerhet.

### Hoye Prioriteter

**Agent Environment Classifier**

- Verktøy: scenario-kort med toggles for observable/deterministic/static/etc.
- Studenthandling: klassifiser miljo og velg agenttype.
- Hvorfor: riktig AI-metode avhenger av miljoet.
- Oppgaver: forklar hvorfor robotstovsuger != sjakkagent.

**Search/A* Playground**

- Verktøy: grid/graf med frontier, explored set, `g`, `h`, `f`.
- Studenthandling: bytt BFS, DFS, UCS, greedy, A*.
- Hvorfor: sok er felles grunnmur for AI og algoritmer.
- Oppgaver: lag admissible heuristikk, sammenlign besokte noder.

**CSP Solver Lab**

- Verktøy: variabler, domener og constraints med domain reduction.
- Studenthandling: los kartfarging/Sudoku-mini med MRV/forward checking.
- Hvorfor: constraints gir en annen problemlosingsmodell enn sok i grafer.
- Oppgaver: finn inkonsistens, velg neste variabel, forklar arc consistency.

**Logic Knowledge Base Lab**

- Verktøy: fakta, regler og query med forward/backward chaining.
- Studenthandling: legg inn regler og se inferens.
- Hvorfor: viser symbolsk AI og forklarbar resonnering.
- Oppgaver: bygg liten diagnose-KB, finn regel som mangler.

**Bayes Network Lab**

- Verktøy: noder, avhengigheter, evidens-sliders, posterior.
- Studenthandling: sett evidens og se sannsynlighet endre seg.
- Hvorfor: base rate og conditional independence er vanskelig uten interaksjon.
- Oppgaver: falsk positiv-test, diagnose, feilsoking.

**MDP/Gridworld Lab**

- Verktøy: reward-grid, policy arrows, value iteration.
- Studenthandling: endre rewards/noise/discount og se policy endres.
- Hvorfor: binder usikker handling, nytte og RL.
- Oppgaver: kjor value iteration, forklar policy-endring.

### Medium

- Minimax/alpha-beta tre.
- Planning lab med preconditions/effects.
- Bandit epsilon-greedy.

## Tverrgaaende Drilltyper

Bruk disse paa alle fag:

- **Trace neste steg**: studenten velger hva algoritmen/systemet gjor naa.
- **Fyll tabell**: page table, cost-table, confusion matrix, transaction timeline.
- **Finn feilen**: data leakage, race, stale read, deadlock, inadmissible heuristic.
- **Velg riktig verktøy**: BFS vs Dijkstra, lock vs semaphore, B-tree vs LSM, precision vs recall.
- **Bygg mini-system**: tiny CPU, scheduler, key-value store, ML pipeline, Bayes-nett.

## Foerste 10 Konkrete Bygg

1. Bit/byte/heks-kalkulator.
2. Logic Gates Lab.
3. Tiny CPU fetch-decode-execute.
4. Scheduling Gantt Editor.
5. Virtual Memory Translator.
6. Concurrency Bug Lab.
7. Transaction Timeline Lab.
8. Index Engine Visualizer.
9. Confusion Matrix Threshold Lab.
10. Search/A* Playground.

Dette gir en sterk progresjon fra maskinens minste byggesteiner til OS, databaser, ML og AI.
