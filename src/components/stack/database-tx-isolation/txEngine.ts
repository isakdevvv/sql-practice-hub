// ---------------------------------------------------------------------------
// txEngine.ts
//
// En liten "leke-database" som modellerer to samtidige transaksjoner (A og B)
// og demonstrerer hvordan isolation level styrer hvilke anomalier som kan
// oppstå. Lærepoengene er først og fremst:
//
//   * Dirty read    — leser noe som siden rulles tilbake
//   * Non-repeatable read — samme PK leses to ganger, får ulike verdier
//   * Phantom read  — samme WHERE-spørring returnerer nye rader
//   * Lost update   — to RMW-sekvenser interleaves, en endring tapes
//
// Modellen tar et minimum: én tabell `kontoer(id PK, saldo INT)`. Hver
// transaksjon kjører instruksjoner ett-og-ett (brukeren velger rekkefølge);
// motoren oppdaterer "committed state", "pending writes per tx", "locks",
// og en read-history per tx som brukes for å detektere anomalier.
//
// Lås-/snapshot-mekanikken er sterkt forenklet, men matcher pensum:
//
//   READ UNCOMMITTED  Ingen lese-låser. Read returnerer pending writes
//                     hvis det finnes — det er nettopp dirty read.
//   READ COMMITTED    Read tar shared lock kortvarig (slippes med en gang),
//                     ser bare committet data. Write tar X-lås til commit.
//   REPEATABLE READ   Hver tx får et snapshot ved sin første SELECT.
//                     Snapshot-id'er du har lest, fryses for transaksjonens
//                     levetid. Range-spørringer er IKKE beskyttet → phantom.
//   SERIALIZABLE      Som RR, men predikat-/range-låser. INSERT som matcher
//                     en annens predicate blokkeres eller serialiseres.
//
// Lost update håndteres slik:
//   * READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ med "blind update":
//     hvis begge tx leser samme rad uten FOR UPDATE og begge gjør UPDATE,
//     den siste vinner og den førstes endring er tapt.
//   * SERIALIZABLE: konflikt detekteres ved commit, en av tx aborteres
//     (serialization failure).
//
// Vi sporer både concrete events (LogEntry) og en strukturert
// "anomalies"-liste for highlighting og forklaring i UI.
// ---------------------------------------------------------------------------

export type IsolationLevel =
  | "READ_UNCOMMITTED"
  | "READ_COMMITTED"
  | "REPEATABLE_READ"
  | "SERIALIZABLE";

export type TxId = "A" | "B";
export type TxStatus = "idle" | "active" | "committed" | "aborted" | "blocked";

export type Row = { id: number; saldo: number };

export type LockMode = "S" | "X";

export type RowLock = {
  rowId: number;
  mode: LockMode;
  holder: TxId;
};

/** Range/predicate-lås — brukes av SERIALIZABLE for å hindre phantoms. */
export type RangeLock = {
  /** Lukket intervall på `saldo` (eller hele tabellen om begge null). */
  minSaldo: number | null;
  maxSaldo: number | null;
  holder: TxId;
};

export type ReadEvent = {
  /** Hvilket steg leste vi i (tick). */
  tick: number;
  rowId: number;
  saldo: number;
  /** Var dette en uncommitted-verdi (dirty)? */
  dirty: boolean;
};

export type RangeReadEvent = {
  tick: number;
  predicate: string;
  matchedIds: number[];
};

export type PendingWrite = {
  rowId: number;
  /** null = DELETE; ellers ny verdi. */
  newSaldo: number | null;
  /** Original verdi (for ROLLBACK). null hvis raden ikke fantes før. */
  prevSaldo: number | null;
  /** True hvis denne raden er ny (INSERT). */
  isInsert: boolean;
};

export type TxState = {
  id: TxId;
  status: TxStatus;
  isolation: IsolationLevel;
  /** Snapshot tatt ved første SELECT (RR / SERIALIZABLE). null før det. */
  snapshot: Row[] | null;
  pending: PendingWrite[];
  reads: ReadEvent[];
  rangeReads: RangeReadEvent[];
  /** Rad-id-er denne tx venter på (forsøkte å låse men ble blokkert). */
  waitingFor: number[];
  /** Forklarende notat på siste handling. */
  lastMessage: string | null;
};

export type AnomalyKind =
  | "dirty_read"
  | "non_repeatable_read"
  | "phantom_read"
  | "lost_update"
  | "deadlock"
  | "serialization_failure";

export type Anomaly = {
  kind: AnomalyKind;
  tx: TxId;
  tick: number;
  text: string;
};

export type LogEntry = {
  tick: number;
  tx: TxId | "DB";
  text: string;
  tone: "info" | "good" | "bad" | "warn";
};

export type EngineState = {
  /** Committed snapshot — det andre transaksjoner ser. */
  committed: Row[];
  /** Rad-låser. */
  rowLocks: RowLock[];
  /** Range-låser (kun SERIALIZABLE bruker disse). */
  rangeLocks: RangeLock[];
  tx: Record<TxId, TxState>;
  log: LogEntry[];
  anomalies: Anomaly[];
  tick: number;
  /** True hvis vi har detektert deadlock og må velge offer. */
  deadlock: boolean;
};

// ---------------------------------------------------------------------------
// init / clone
// ---------------------------------------------------------------------------

export function initialEngine(opts?: {
  isolation?: IsolationLevel;
  seed?: Row[];
}): EngineState {
  const isolation: IsolationLevel = opts?.isolation ?? "READ_COMMITTED";
  const seed: Row[] =
    opts?.seed ??
    [
      { id: 1, saldo: 1000 },
      { id: 2, saldo: 500 },
      { id: 3, saldo: 750 },
    ];
  return {
    committed: seed.map((r) => ({ ...r })),
    rowLocks: [],
    rangeLocks: [],
    tx: {
      A: makeTx("A", isolation),
      B: makeTx("B", isolation),
    },
    log: [],
    anomalies: [],
    tick: 0,
    deadlock: false,
  };
}

function makeTx(id: TxId, isolation: IsolationLevel): TxState {
  return {
    id,
    status: "idle",
    isolation,
    snapshot: null,
    pending: [],
    reads: [],
    rangeReads: [],
    waitingFor: [],
    lastMessage: null,
  };
}

export function cloneEngine(s: EngineState): EngineState {
  return {
    committed: s.committed.map((r) => ({ ...r })),
    rowLocks: s.rowLocks.map((l) => ({ ...l })),
    rangeLocks: s.rangeLocks.map((l) => ({ ...l })),
    tx: {
      A: cloneTx(s.tx.A),
      B: cloneTx(s.tx.B),
    },
    log: s.log.slice(),
    anomalies: s.anomalies.slice(),
    tick: s.tick,
    deadlock: s.deadlock,
  };
}

function cloneTx(t: TxState): TxState {
  return {
    ...t,
    snapshot: t.snapshot ? t.snapshot.map((r) => ({ ...r })) : null,
    pending: t.pending.map((p) => ({ ...p })),
    reads: t.reads.slice(),
    rangeReads: t.rangeReads.slice(),
    waitingFor: t.waitingFor.slice(),
  };
}

function pushLog(
  s: EngineState,
  tx: TxId | "DB",
  text: string,
  tone: LogEntry["tone"] = "info",
) {
  s.log.push({ tick: s.tick, tx, text, tone });
  if (s.log.length > 40) s.log = s.log.slice(s.log.length - 40);
}

function pushAnomaly(s: EngineState, a: Omit<Anomaly, "tick">) {
  s.anomalies.push({ ...a, tick: s.tick });
}

// ---------------------------------------------------------------------------
// View functions (lest av UI for å vise "hva ser tx X nå")
// ---------------------------------------------------------------------------

/**
 * Returnerer hva en transaksjon faktisk ville sett av tabellen akkurat nå,
 * gitt isolasjonsnivået. Brukes både i SELECT-instruksjonen og av UI for
 * "tx-perspektiv"-tabellene.
 */
export function viewForTx(s: EngineState, who: TxId): Row[] {
  const tx = s.tx[who];
  const base: Row[] = pickBase(s, tx);
  // Legg på egne pending writes (egen tx ser alltid sine egne endringer).
  return applyPending(base, tx.pending);
}

function pickBase(s: EngineState, tx: TxState): Row[] {
  if (tx.isolation === "READ_UNCOMMITTED") {
    // Vi inkluderer ALLE pending writes fra alle transaksjoner. Det er nettopp
    // dirty read: vi ser det andre har skrevet før de har commit-et.
    let base = s.committed.map((r) => ({ ...r }));
    for (const other of (["A", "B"] as TxId[])) {
      if (other === tx.id) continue;
      const o = s.tx[other];
      if (o.status === "active") base = applyPending(base, o.pending);
    }
    return base;
  }
  if (tx.isolation === "READ_COMMITTED") {
    return s.committed.map((r) => ({ ...r }));
  }
  // REPEATABLE_READ + SERIALIZABLE: bruk snapshot hvis vi har det,
  // ellers committed (vi tar snapshot ved første read).
  if (tx.snapshot) return tx.snapshot.map((r) => ({ ...r }));
  return s.committed.map((r) => ({ ...r }));
}

function applyPending(base: Row[], pending: PendingWrite[]): Row[] {
  const map = new Map<number, Row>();
  for (const r of base) map.set(r.id, { ...r });
  for (const w of pending) {
    if (w.newSaldo === null) {
      map.delete(w.rowId);
    } else if (w.isInsert) {
      map.set(w.rowId, { id: w.rowId, saldo: w.newSaldo });
    } else {
      const existing = map.get(w.rowId);
      if (existing) existing.saldo = w.newSaldo;
      else map.set(w.rowId, { id: w.rowId, saldo: w.newSaldo });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

// ---------------------------------------------------------------------------
// Lock helpers
// ---------------------------------------------------------------------------

function holdsLock(s: EngineState, who: TxId, rowId: number, mode: LockMode): boolean {
  return s.rowLocks.some(
    (l) => l.holder === who && l.rowId === rowId && (l.mode === mode || (mode === "S" && l.mode === "X")),
  );
}

/**
 * Forsøk å ta en rad-lås. Returnerer "ok" hvis vi fikk den (eller allerede har),
 * "blocked-by-X" hvis noen annen holder en konflikterende lås.
 */
function acquireRowLock(
  s: EngineState,
  who: TxId,
  rowId: number,
  mode: LockMode,
): { ok: true } | { ok: false; blockedBy: TxId } {
  if (holdsLock(s, who, rowId, mode)) return { ok: true };
  // Oppgrader S→X hvis vi allerede har S og ingen andre har S
  const ours = s.rowLocks.find((l) => l.holder === who && l.rowId === rowId);
  for (const l of s.rowLocks) {
    if (l.rowId !== rowId) continue;
    if (l.holder === who) continue;
    // Annen tx har lås
    if (mode === "X" || l.mode === "X") {
      return { ok: false, blockedBy: l.holder };
    }
    // begge S — kompatibelt, fortsett
  }
  if (ours) {
    ours.mode = mode === "X" ? "X" : ours.mode;
  } else {
    s.rowLocks.push({ rowId, mode, holder: who });
  }
  return { ok: true };
}

/** Slipp alle låser (rad + range) eid av `who`. */
function releaseLocks(s: EngineState, who: TxId) {
  s.rowLocks = s.rowLocks.filter((l) => l.holder !== who);
  s.rangeLocks = s.rangeLocks.filter((l) => l.holder !== who);
}

/** Beskriv en rad-lås kort, brukt i UI. */
export function describeLock(lock: RowLock): string {
  return `rad ${lock.rowId} · ${lock.mode === "X" ? "EXCLUSIVE" : "SHARED"} (${lock.holder})`;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export type Op =
  | { kind: "BEGIN" }
  | { kind: "SELECT_ONE"; rowId: number }
  | { kind: "SELECT_RANGE"; minSaldo: number; maxSaldo: number }
  | { kind: "UPDATE"; rowId: number; newSaldo: number }
  | { kind: "INSERT"; rowId: number; saldo: number }
  | { kind: "COMMIT" }
  | { kind: "ROLLBACK" };

export function opLabel(op: Op): string {
  switch (op.kind) {
    case "BEGIN":
      return "BEGIN";
    case "SELECT_ONE":
      return `SELECT * FROM kontoer WHERE id=${op.rowId}`;
    case "SELECT_RANGE":
      return `SELECT * FROM kontoer WHERE saldo BETWEEN ${op.minSaldo} AND ${op.maxSaldo}`;
    case "UPDATE":
      return `UPDATE kontoer SET saldo=${op.newSaldo} WHERE id=${op.rowId}`;
    case "INSERT":
      return `INSERT INTO kontoer (id, saldo) VALUES (${op.rowId}, ${op.saldo})`;
    case "COMMIT":
      return "COMMIT";
    case "ROLLBACK":
      return "ROLLBACK";
  }
}

/**
 * Kjør én op for tx `who`. Returnerer ny EngineState. Hvis tx blokkeres,
 * forblir den i `status: "blocked"` med `waitingFor` satt — UI kan vise dette
 * og brukeren må kjøre en op for motparten som frigjør låsen.
 */
export function applyOp(s: EngineState, who: TxId, op: Op): EngineState {
  const next = cloneEngine(s);
  next.tick++;
  const tx = next.tx[who];

  if (tx.status === "committed" || tx.status === "aborted") {
    pushLog(next, who, `tx ${who} er ${tx.status}; ignorerer ${opLabel(op)}`, "warn");
    return next;
  }

  if (op.kind === "BEGIN") {
    return doBegin(next, who);
  }

  if (tx.status === "idle") {
    // Auto-BEGIN på første op-kall — gjør koreografi-bygging behageligere.
    doBegin(next, who);
  }

  // Hvis vi tidligere var blokkert: rydd waitingFor før vi prøver igjen.
  tx.waitingFor = [];

  switch (op.kind) {
    case "SELECT_ONE":
      return doSelectOne(next, who, op.rowId);
    case "SELECT_RANGE":
      return doSelectRange(next, who, op.minSaldo, op.maxSaldo);
    case "UPDATE":
      return doUpdate(next, who, op.rowId, op.newSaldo);
    case "INSERT":
      return doInsert(next, who, op.rowId, op.saldo);
    case "COMMIT":
      return doCommit(next, who);
    case "ROLLBACK":
      return doRollback(next, who);
    default:
      return next;
  }
}

function doBegin(s: EngineState, who: TxId): EngineState {
  const tx = s.tx[who];
  if (tx.status === "active") {
    pushLog(s, who, "BEGIN ignorert (allerede aktiv)", "warn");
    return s;
  }
  tx.status = "active";
  tx.pending = [];
  tx.reads = [];
  tx.rangeReads = [];
  tx.snapshot = null;
  tx.waitingFor = [];
  pushLog(s, who, `BEGIN (${prettyIso(tx.isolation)})`, "info");
  tx.lastMessage = `BEGIN @ ${prettyIso(tx.isolation)}`;
  return s;
}

function maybeTakeSnapshot(s: EngineState, who: TxId) {
  const tx = s.tx[who];
  if (
    (tx.isolation === "REPEATABLE_READ" || tx.isolation === "SERIALIZABLE") &&
    tx.snapshot === null
  ) {
    tx.snapshot = s.committed.map((r) => ({ ...r }));
    pushLog(
      s,
      who,
      `snapshot tatt (${tx.snapshot.length} rader frosset for resten av tx)`,
      "info",
    );
  }
}

function doSelectOne(s: EngineState, who: TxId, rowId: number): EngineState {
  const tx = s.tx[who];

  // READ_COMMITTED tar shared lock kortvarig (sjekk konflikt mot X-lås).
  if (tx.isolation === "READ_COMMITTED" || tx.isolation === "REPEATABLE_READ" || tx.isolation === "SERIALIZABLE") {
    const lockTry = acquireRowLock(s, who, rowId, "S");
    if (!lockTry.ok) {
      tx.status = "blocked";
      tx.waitingFor = [rowId];
      tx.lastMessage = `blokkert: venter på X-lås holdt av tx ${lockTry.blockedBy} (rad ${rowId})`;
      pushLog(s, who, `SELECT rad ${rowId} BLOKKERT av ${lockTry.blockedBy}`, "warn");
      maybeDeadlock(s);
      return s;
    }
  }

  maybeTakeSnapshot(s, who);
  const view = viewForTx(s, who);
  const row = view.find((r) => r.id === rowId);

  // For READ_COMMITTED: slipp S-låsen umiddelbart etter lesing.
  if (tx.isolation === "READ_COMMITTED") {
    s.rowLocks = s.rowLocks.filter(
      (l) => !(l.holder === who && l.rowId === rowId && l.mode === "S"),
    );
  }

  if (!row) {
    pushLog(s, who, `SELECT id=${rowId} → ingen rad`, "info");
    tx.lastMessage = `SELECT id=${rowId} → 0 rader`;
    return s;
  }

  // Sjekk om dette er en dirty read (READ_UNCOMMITTED, og verdien stammer fra
  // en annen aktiv tx sin pending write).
  let dirty = false;
  if (tx.isolation === "READ_UNCOMMITTED") {
    const otherId: TxId = who === "A" ? "B" : "A";
    const o = s.tx[otherId];
    if (o.status === "active") {
      const pw = o.pending.find((p) => p.rowId === rowId);
      if (pw && pw.newSaldo === row.saldo) dirty = true;
    }
  }

  // Sjekk for non-repeatable read: vi har lest samme rowId før, og verdien er
  // endret siden sist.
  const prev = tx.reads.filter((r) => r.rowId === rowId).pop();
  if (prev && prev.saldo !== row.saldo) {
    pushAnomaly(s, {
      kind: "non_repeatable_read",
      tx: who,
      text: `Tx ${who} leste rad ${rowId}=${prev.saldo} tidligere, nå ${row.saldo} — non-repeatable read`,
    });
    pushLog(
      s,
      who,
      `NON-REPEATABLE READ: rad ${rowId} var ${prev.saldo}, er nå ${row.saldo}`,
      "bad",
    );
  }

  tx.reads.push({ tick: s.tick, rowId, saldo: row.saldo, dirty });
  if (dirty) {
    pushAnomaly(s, {
      kind: "dirty_read",
      tx: who,
      text: `Tx ${who} leste uncommittet verdi saldo=${row.saldo} for rad ${rowId} (skrevet av motpart)`,
    });
    pushLog(s, who, `DIRTY READ: rad ${rowId} = ${row.saldo} (uncommittet!)`, "bad");
  } else {
    pushLog(s, who, `SELECT id=${rowId} → saldo=${row.saldo}`, "good");
  }
  tx.lastMessage = `SELECT id=${rowId} → saldo=${row.saldo}${dirty ? " (DIRTY)" : ""}`;
  return s;
}

function doSelectRange(
  s: EngineState,
  who: TxId,
  minSaldo: number,
  maxSaldo: number,
): EngineState {
  const tx = s.tx[who];

  if (tx.isolation === "SERIALIZABLE") {
    // Ta range-lås. Hvis noen annen allerede har en INSERT som lander i området
    // (= ny rad med saldo in [min,max]) ville det vært en konflikt — vi sjekker
    // motpartens pending. (Forenklet versjon av predicate locking.)
    const otherId: TxId = who === "A" ? "B" : "A";
    const other = s.tx[otherId];
    const conflict = other.pending.find(
      (p) =>
        p.isInsert &&
        p.newSaldo !== null &&
        p.newSaldo >= minSaldo &&
        p.newSaldo <= maxSaldo,
    );
    if (conflict && other.status === "active") {
      tx.status = "blocked";
      tx.lastMessage = `blokkert: ${otherId} har pending INSERT i range [${minSaldo},${maxSaldo}]`;
      pushLog(
        s,
        who,
        `SELECT range BLOKKERT av pending INSERT i ${otherId}`,
        "warn",
      );
      maybeDeadlock(s);
      return s;
    }
    s.rangeLocks.push({ minSaldo, maxSaldo, holder: who });
  }

  maybeTakeSnapshot(s, who);
  const view = viewForTx(s, who);
  const matched = view.filter((r) => r.saldo >= minSaldo && r.saldo <= maxSaldo);

  // Detekter phantom: tidligere range-read i samme tx med samme predikat?
  const prev = tx.rangeReads.find(
    (r) => r.predicate === `${minSaldo}..${maxSaldo}`,
  );
  if (prev) {
    const newIds = matched.map((r) => r.id);
    const added = newIds.filter((id) => !prev.matchedIds.includes(id));
    const removed = prev.matchedIds.filter((id) => !newIds.includes(id));
    if (added.length > 0 || removed.length > 0) {
      pushAnomaly(s, {
        kind: "phantom_read",
        tx: who,
        text: `Phantom: range [${minSaldo},${maxSaldo}] returnerer nå ${newIds.join(",") || "ingen"} (var ${prev.matchedIds.join(",") || "ingen"})`,
      });
      pushLog(
        s,
        who,
        `PHANTOM READ: range [${minSaldo},${maxSaldo}] endret seg (added=${added.join(",") || "-"}, removed=${removed.join(",") || "-"})`,
        "bad",
      );
    }
  }

  tx.rangeReads.push({
    tick: s.tick,
    predicate: `${minSaldo}..${maxSaldo}`,
    matchedIds: matched.map((r) => r.id),
  });
  pushLog(
    s,
    who,
    `SELECT range [${minSaldo},${maxSaldo}] → ${matched.length} rader (${matched.map((r) => r.id).join(",") || "-"})`,
    "good",
  );
  tx.lastMessage = `SELECT range → ${matched.length} rader`;
  return s;
}

function doUpdate(
  s: EngineState,
  who: TxId,
  rowId: number,
  newSaldo: number,
): EngineState {
  const tx = s.tx[who];
  // Trenger X-lås på raden.
  const lockTry = acquireRowLock(s, who, rowId, "X");
  if (!lockTry.ok) {
    tx.status = "blocked";
    tx.waitingFor = [rowId];
    tx.lastMessage = `blokkert: venter X-lås holdt av tx ${lockTry.blockedBy} (rad ${rowId})`;
    pushLog(s, who, `UPDATE rad ${rowId} BLOKKERT av ${lockTry.blockedBy}`, "warn");
    maybeDeadlock(s);
    return s;
  }

  // Finn original verdi: fra committed-state (ikke pending).
  const committed = s.committed.find((r) => r.id === rowId);
  if (!committed) {
    pushLog(s, who, `UPDATE rad ${rowId}: ingen slik rad`, "warn");
    return s;
  }

  // Slå sammen / oppdater pending write.
  const existing = tx.pending.find((p) => p.rowId === rowId);
  if (existing) {
    existing.newSaldo = newSaldo;
  } else {
    tx.pending.push({
      rowId,
      newSaldo,
      prevSaldo: committed.saldo,
      isInsert: false,
    });
  }
  pushLog(
    s,
    who,
    `UPDATE rad ${rowId} → ${newSaldo} (pending, X-lås holdes til COMMIT)`,
    "info",
  );
  tx.lastMessage = `UPDATE id=${rowId} → ${newSaldo} (pending)`;
  return s;
}

function doInsert(
  s: EngineState,
  who: TxId,
  rowId: number,
  saldo: number,
): EngineState {
  const tx = s.tx[who];
  if (s.committed.some((r) => r.id === rowId)) {
    pushLog(s, who, `INSERT id=${rowId} feilet: PK finnes`, "warn");
    return s;
  }

  // X-lås på den nye raden.
  const lockTry = acquireRowLock(s, who, rowId, "X");
  if (!lockTry.ok) {
    tx.status = "blocked";
    tx.waitingFor = [rowId];
    pushLog(s, who, `INSERT id=${rowId} BLOKKERT av ${lockTry.blockedBy}`, "warn");
    maybeDeadlock(s);
    return s;
  }

  // Sjekk range-låser fra andre (SERIALIZABLE phantom-prevention).
  const otherId: TxId = who === "A" ? "B" : "A";
  const other = s.tx[otherId];
  if (other.status === "active") {
    const rl = s.rangeLocks.find(
      (l) =>
        l.holder === otherId &&
        (l.minSaldo === null || saldo >= l.minSaldo) &&
        (l.maxSaldo === null || saldo <= l.maxSaldo),
    );
    if (rl) {
      tx.status = "blocked";
      tx.waitingFor = [rowId];
      tx.lastMessage = `INSERT blokkert: ${otherId} holder range-lås [${rl.minSaldo},${rl.maxSaldo}]`;
      pushLog(
        s,
        who,
        `INSERT id=${rowId} BLOKKERT av range-lås (${otherId})`,
        "warn",
      );
      return s;
    }
  }

  tx.pending.push({
    rowId,
    newSaldo: saldo,
    prevSaldo: null,
    isInsert: true,
  });
  pushLog(s, who, `INSERT id=${rowId}, saldo=${saldo} (pending, X-lås)`, "info");
  tx.lastMessage = `INSERT id=${rowId} (pending)`;
  return s;
}

function doCommit(s: EngineState, who: TxId): EngineState {
  const tx = s.tx[who];
  if (tx.status === "blocked") {
    pushLog(s, who, "COMMIT mens blokkert ignorert", "warn");
    return s;
  }

  // SERIALIZABLE lost-update / write-skew detection (forenklet):
  // hvis vi har en pending UPDATE på en rad som har endret seg i committed
  // siden vi tok snapshot, så er det en konflikt → abort.
  if (tx.isolation === "SERIALIZABLE" && tx.snapshot) {
    for (const w of tx.pending) {
      if (w.isInsert) continue;
      const snap = tx.snapshot.find((r) => r.id === w.rowId);
      const curr = s.committed.find((r) => r.id === w.rowId);
      if (snap && curr && snap.saldo !== curr.saldo) {
        // En annen tx har committet over vår snapshot → serialization failure
        pushAnomaly(s, {
          kind: "serialization_failure",
          tx: who,
          text: `Tx ${who} kan ikke commite: rad ${w.rowId} ble endret av annen tx siden snapshot (${snap.saldo} → ${curr.saldo})`,
        });
        pushLog(
          s,
          who,
          `SERIALIZATION FAILURE: rad ${w.rowId} endret under oss — ROLLBACK`,
          "bad",
        );
        return abortInternal(s, who);
      }
    }
  }

  // Lost-update-detektor for andre isolasjonsnivåer (forenklet, men pedagogisk):
  // hvis vi har lest en rad og deretter UPDATE-et den, og motparten ALLEREDE har
  // committet en UPDATE av samme rad mellom vår lesing og vår commit, da har vi
  // sannsynligvis tapt deres oppdatering ved å overskrive den.
  if (tx.isolation !== "SERIALIZABLE") {
    const otherId: TxId = who === "A" ? "B" : "A";
    const other = s.tx[otherId];
    for (const w of tx.pending) {
      if (w.isInsert) continue;
      const myRead = tx.reads.find((r) => r.rowId === w.rowId);
      if (!myRead) continue;
      const committedNow = s.committed.find((r) => r.id === w.rowId);
      if (!committedNow) continue;
      if (committedNow.saldo !== myRead.saldo && other.status === "committed") {
        // Motpart har committet en endring vi ikke så.
        pushAnomaly(s, {
          kind: "lost_update",
          tx: who,
          text: `Lost update: ${who} så rad ${w.rowId}=${myRead.saldo}, ${otherId} commitet ${committedNow.saldo}, ${who} skriver ${w.newSaldo} → ${otherId}s endring borte`,
        });
        pushLog(
          s,
          who,
          `LOST UPDATE: ${otherId} satte rad ${w.rowId}=${committedNow.saldo}, vi overskriver med ${w.newSaldo}`,
          "bad",
        );
      }
    }
  }

  // Skriv pending til committed.
  const map = new Map<number, Row>();
  for (const r of s.committed) map.set(r.id, { ...r });
  for (const w of tx.pending) {
    if (w.newSaldo === null) {
      map.delete(w.rowId);
    } else {
      map.set(w.rowId, { id: w.rowId, saldo: w.newSaldo });
    }
  }
  s.committed = Array.from(map.values()).sort((a, b) => a.id - b.id);

  tx.status = "committed";
  tx.pending = [];
  tx.lastMessage = "COMMIT — endringer varige";
  pushLog(s, who, "COMMIT — endringer flyttet til committed-state", "good");
  releaseLocks(s, who);
  // Snapshot frigjøres ikke (vi kan vise den til UI som "tx er ferdig").
  return s;
}

function abortInternal(s: EngineState, who: TxId): EngineState {
  const tx = s.tx[who];
  tx.status = "aborted";
  tx.pending = [];
  tx.lastMessage = "ROLLBACK / abort";
  releaseLocks(s, who);
  return s;
}

function doRollback(s: EngineState, who: TxId): EngineState {
  const tx = s.tx[who];
  pushLog(s, who, "ROLLBACK — pending writes forkastet", "info");
  return abortInternal(s, who);
}

function maybeDeadlock(s: EngineState) {
  const a = s.tx.A;
  const b = s.tx.B;
  if (
    a.status === "blocked" &&
    b.status === "blocked" &&
    a.waitingFor.length > 0 &&
    b.waitingFor.length > 0
  ) {
    s.deadlock = true;
    pushAnomaly(s, {
      kind: "deadlock",
      tx: "A",
      text: `Deadlock: A venter på ${a.waitingFor.join(",")}, B venter på ${b.waitingFor.join(",")}`,
    });
    pushLog(s, "DB", "DEADLOCK DETEKTERT — DB må velge offer", "bad");
  }
}

/**
 * Brukes av UI når deadlock er detektert: drep én av tx (offeret).
 * Konvensjon: yngste tx-id alfabetisk velges som offer.
 */
export function resolveDeadlock(s: EngineState, victim: TxId): EngineState {
  const next = cloneEngine(s);
  next.tick++;
  pushLog(next, "DB", `OFFER VALGT: ${victim} aborteres`, "warn");
  abortInternal(next, victim);
  // Den andre tx er ikke lenger blokkert (låsene er frigjort).
  const otherId: TxId = victim === "A" ? "B" : "A";
  const other = next.tx[otherId];
  if (other.status === "blocked") {
    other.status = "active";
    other.waitingFor = [];
    other.lastMessage = "ble vekket fra deadlock — kan kjøre igjen";
  }
  next.deadlock = false;
  return next;
}

/** Pretty-name for UI. */
export function prettyIso(iso: IsolationLevel): string {
  return iso.replace("_", " ");
}

/** En "anomali-matrise"-celle: kan denne anomalien oppstå på dette nivået? */
export function matrixCell(iso: IsolationLevel, anomaly: AnomalyKind): boolean {
  // true = anomali kan oppstå
  if (anomaly === "dirty_read") {
    return iso === "READ_UNCOMMITTED";
  }
  if (anomaly === "non_repeatable_read") {
    return iso === "READ_UNCOMMITTED" || iso === "READ_COMMITTED";
  }
  if (anomaly === "phantom_read") {
    return iso !== "SERIALIZABLE";
  }
  if (anomaly === "lost_update") {
    // RR forhindrer noen, men ikke alle. SQL-standarden tar ikke
    // lost-update inn i sin tabell, men praksis er: SERIALIZABLE forhindrer,
    // andre kan tillate.
    return iso !== "SERIALIZABLE";
  }
  return false;
}
