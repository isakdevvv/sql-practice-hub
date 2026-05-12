// A `mysql.connector`-compatible shim that uses Python's built-in sqlite3
// underneath. We expose the same surface students see in DAT1000 — connect(),
// cursor.execute(sql, values), fetchone()/fetchall(), commit(), close() —
// so they can write code identical to what they'd run against a real MySQL
// server. SQL syntax differences are minor for the constructs we teach
// (CREATE / INSERT / SELECT / UPDATE / DELETE).
//
// The full Python source lives here as a single string so we can register it
// as the `mysql.connector` module the first time the runner boots.

export const MYSQL_SHIM_SOURCE = `
import sqlite3 as _sqlite

# In-process registry of "databases" — each connect() with a new database name
# creates an in-memory SQLite that persists for the rest of the page session.
_dbs = {}

def _translate_placeholders(sql):
    # Translate %s placeholders (mysql-connector style) to ? (sqlite style).
    out = []
    in_string = False
    quote = ''
    i = 0
    while i < len(sql):
        c = sql[i]
        if in_string:
            if c == quote and (i == 0 or sql[i-1] != "\\\\"):
                in_string = False
            out.append(c)
        else:
            if c == "'" or c == '"':
                in_string = True
                quote = c
                out.append(c)
            elif c == '%' and i + 1 < len(sql) and sql[i+1] == 's':
                out.append('?')
                i += 1
            else:
                out.append(c)
        i += 1
    return ''.join(out)

class Cursor:
    def __init__(self, conn):
        self._conn = conn
        self._cur = conn._raw.cursor()
        self.rowcount = -1
        self.lastrowid = None

    def execute(self, sql, params=None):
        sql = _translate_placeholders(sql)
        if params is None:
            self._cur.execute(sql)
        else:
            self._cur.execute(sql, tuple(params))
        self.rowcount = self._cur.rowcount
        self.lastrowid = self._cur.lastrowid
        return self

    def executemany(self, sql, seq_of_params):
        sql = _translate_placeholders(sql)
        self._cur.executemany(sql, [tuple(p) for p in seq_of_params])
        self.rowcount = self._cur.rowcount
        return self

    def fetchone(self):
        return self._cur.fetchone()

    def fetchall(self):
        return self._cur.fetchall()

    def fetchmany(self, size=1):
        return self._cur.fetchmany(size)

    def close(self):
        self._cur.close()

    @property
    def description(self):
        return self._cur.description

    def __iter__(self):
        return iter(self._cur)


class Connection:
    def __init__(self, name, host=None, user=None, password=None, port=None):
        self._name = name
        self._raw = _dbs.setdefault(name, _sqlite.connect(":memory:"))
        # Public attributter slik mysql-connector-python eksponerer dem —
        # disse er det vanlig å bruke i undervisning og debugging.
        self.database = name
        self.host = host
        self.user = user
        self.port = port

    def cursor(self, dictionary=False, buffered=False):
        return Cursor(self)

    def commit(self):
        self._raw.commit()

    def rollback(self):
        self._raw.rollback()

    def close(self):
        # Don't actually close — keep the in-memory DB alive for the rest of
        # the page session so repeated runs can see the data they inserted.
        pass

    def is_connected(self):
        # I ekte mysql-connector er dette en metode, ikke en property —
        # studenter skriver db.is_connected().
        return True


class Error(Exception):
    pass


class IntegrityError(Error):
    pass


def connect(host=None, user=None, password=None, database=None, port=None, **kwargs):
    name = database or "default"
    return Connection(name, host=host, user=user, password=password, port=port)


def reset_database(name="default"):
    """Clear and recreate the in-memory database — useful between exercises."""
    if name in _dbs:
        try:
            _dbs[name].close()
        except Exception:
            pass
        del _dbs[name]
`;
