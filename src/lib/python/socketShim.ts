// In-process socket-shim som lar studenter skrive ekte-utseende socket-kode i
// nettleseren. Pyodide har ingen ekte network-sockets — sandbox-en tillater
// ikke TCP-tilkoblinger. I stedet emulerer vi:
//
//   - socket.socket(AF_INET, SOCK_STREAM)        -- TCP, kø-basert
//   - socket.socket(AF_INET, SOCK_DGRAM)         -- UDP, datagram-mailbox
//   - bind, listen, accept, connect, send, recv, sendto, recvfrom, close
//   - SO_REUSEADDR aksepteres (gjør ingenting)
//
// «Nettverket» er en global dict {(host, port): server} hvor servere registrerer
// seg ved bind+listen, og klienter finner dem via connect(). For at studenter skal
// kunne se en full echo-roundtrip i ett skript, kjorer vi server-loopen som en
// kort-tids tråd inn til all forventet trafikk er handtert.
//
// Det er bevisst en *forenkling*: hovedformålet er at studenten skriver riktig
// API-flyt og kan kjore det. Ekte TCP-kanter (TIME_WAIT, partial recv,
// Nagle, fragmentering) lar vi være.
//
// Dette mønsteret matcher mysqlShim — eksporterer en kildestreng som
// runner.ts execer inn i en types.ModuleType("socket") og setter i sys.modules
// før user-kode kjorer.

export const SOCKET_SHIM_SOURCE = `
import threading as _threading
import queue as _queue
import time as _time

# === Constants matching real Python socket module ===
AF_INET = 2
AF_INET6 = 10
AF_UNIX = 1
SOCK_STREAM = 1
SOCK_DGRAM = 2
SOL_SOCKET = 1
SO_REUSEADDR = 2
SHUT_RD = 0
SHUT_WR = 1
SHUT_RDWR = 2

class error(OSError):
    pass

class timeout(OSError):
    pass

# In-process registry: (host, port) -> _ServerEndpoint (TCP) or _DgramEndpoint (UDP)
_tcp_servers = {}
_udp_endpoints = {}

class _TcpServer:
    """A listening TCP server endpoint. Has a queue of incoming connections."""
    def __init__(self, addr):
        self.addr = addr
        # Pending client _Pipe pairs the server will accept().
        self.pending = _queue.Queue()
        self.closed = False

class _Pipe:
    """One half of a TCP connection — a bidirectional byte stream backed by two queues."""
    def __init__(self, my_addr, peer_addr):
        self.my_addr = my_addr
        self.peer_addr = peer_addr
        # Bytes coming IN to this side.
        self.inbox = _queue.Queue()
        self.buffer = b""
        self.peer = None  # set after pairing
        self.closed_by_peer = False
        self.closed_by_self = False

    def send_to_peer(self, data):
        if self.peer is None:
            raise error("not connected")
        if self.peer.closed_by_self:
            raise error("broken pipe (peer closed)")
        self.peer.inbox.put(data)

    def recv_data(self, n, timeout_s=None):
        # Pull from buffer first.
        while len(self.buffer) < n:
            if self.closed_by_peer and self.inbox.empty():
                break
            try:
                chunk = self.inbox.get(timeout=timeout_s if timeout_s is not None else 5.0)
            except _queue.Empty:
                if self.closed_by_peer:
                    break
                # Timeout — return what we have (matches blocking-with-timeout).
                break
            if chunk is None:  # close sentinel
                self.closed_by_peer = True
                continue
            self.buffer += chunk
        out, self.buffer = self.buffer[:n], self.buffer[n:]
        return out

    def close_self(self):
        if self.closed_by_self:
            return
        self.closed_by_self = True
        if self.peer is not None and not self.peer.closed_by_peer:
            # Tell peer we closed.
            self.peer.inbox.put(None)

class _DgramEndpoint:
    """UDP endpoint — one inbox, datagrams keyed by sender addr."""
    def __init__(self, addr):
        self.addr = addr
        # Each entry: (bytes, sender_addr)
        self.inbox = _queue.Queue()
        self.closed = False

class socket:
    """In-process socket emulating the parts of stdlib socket.socket() that fit on a single page."""

    def __init__(self, family=AF_INET, type=SOCK_STREAM, proto=0):
        self.family = family
        self.type = type
        self.proto = proto
        self._addr = None
        self._listening = False
        self._closed = False
        self._timeout = None
        # For TCP-connected sockets:
        self._pipe = None
        # For TCP servers:
        self._server = None
        # For UDP:
        self._dgram = None

    # ---- options ----
    def setsockopt(self, level, optname, value):
        return None  # accept everything silently

    def getsockopt(self, level, optname, buflen=4):
        return 0

    def setblocking(self, flag):
        self._timeout = None if flag else 0.0

    def settimeout(self, seconds):
        self._timeout = seconds

    def gettimeout(self):
        return self._timeout

    def fileno(self):
        return id(self) % 100000

    # ---- bind / listen / accept ----
    def bind(self, addr):
        self._addr = tuple(addr)
        if self.type == SOCK_DGRAM:
            if self._addr in _udp_endpoints and not _udp_endpoints[self._addr].closed:
                raise error("address already in use")
            self._dgram = _DgramEndpoint(self._addr)
            _udp_endpoints[self._addr] = self._dgram

    def listen(self, backlog=5):
        if self.type != SOCK_STREAM:
            raise error("listen() only valid on SOCK_STREAM")
        if self._addr is None:
            raise error("bind() before listen()")
        if self._addr in _tcp_servers and not _tcp_servers[self._addr].closed:
            raise error("address already in use")
        self._server = _TcpServer(self._addr)
        _tcp_servers[self._addr] = self._server
        self._listening = True

    def accept(self):
        if not self._listening or self._server is None:
            raise error("not listening")
        try:
            client_pipe = self._server.pending.get(
                timeout=self._timeout if self._timeout is not None else 5.0
            )
        except _queue.Empty:
            raise timeout("accept() timed out")
        # The server-side pipe is the peer of what connect() created.
        server_side = client_pipe.peer
        s = socket(self.family, self.type)
        s._pipe = server_side
        s._addr = self._addr
        return s, server_side.peer_addr

    # ---- connect ----
    def connect(self, addr):
        addr = tuple(addr)
        if self.type == SOCK_DGRAM:
            # UDP "connect" just remembers default peer.
            self._peer_addr = addr
            if self._dgram is None:
                # Auto-bind to ephemeral port.
                self._addr = ("0.0.0.0", _ephemeral_port())
                self._dgram = _DgramEndpoint(self._addr)
                _udp_endpoints[self._addr] = self._dgram
            return
        srv = _tcp_servers.get(addr)
        if srv is None or srv.closed:
            raise ConnectionRefusedError("[Errno 111] Connection refused: " + repr(addr))
        # Pair pipes:
        client_addr = ("127.0.0.1", _ephemeral_port())
        client_pipe = _Pipe(client_addr, addr)
        server_pipe = _Pipe(addr, client_addr)
        client_pipe.peer = server_pipe
        server_pipe.peer = client_pipe
        srv.pending.put(client_pipe)
        self._pipe = client_pipe
        self._addr = client_addr

    # ---- TCP send / recv ----
    def send(self, data):
        if self._pipe is None:
            raise error("not connected")
        self._pipe.send_to_peer(bytes(data))
        return len(data)

    def sendall(self, data):
        self.send(data)
        return None

    def recv(self, n):
        if self._pipe is None:
            raise error("not connected")
        return self._pipe.recv_data(n, self._timeout)

    def shutdown(self, how):
        if self._pipe is not None:
            self._pipe.close_self()

    # ---- UDP send / recv ----
    def sendto(self, data, addr):
        addr = tuple(addr)
        ep = _udp_endpoints.get(addr)
        if ep is None or ep.closed:
            # Silently drop — that's how UDP works on real networks.
            return len(data)
        # Auto-bind if needed so we have a valid source addr.
        if self._dgram is None:
            self._addr = ("0.0.0.0", _ephemeral_port())
            self._dgram = _DgramEndpoint(self._addr)
            _udp_endpoints[self._addr] = self._dgram
        ep.inbox.put((bytes(data), self._addr))
        return len(data)

    def recvfrom(self, n):
        if self._dgram is None:
            raise error("not bound")
        try:
            data, addr = self._dgram.inbox.get(
                timeout=self._timeout if self._timeout is not None else 5.0
            )
        except _queue.Empty:
            raise timeout("recvfrom() timed out")
        return data[:n], addr

    # ---- close ----
    def close(self):
        if self._closed:
            return
        self._closed = True
        if self._pipe is not None:
            self._pipe.close_self()
        if self._server is not None:
            self._server.closed = True
            if self._addr in _tcp_servers:
                del _tcp_servers[self._addr]
        if self._dgram is not None:
            self._dgram.closed = True
            if self._addr in _udp_endpoints:
                del _udp_endpoints[self._addr]

    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()

    def getsockname(self):
        return self._addr or ("0.0.0.0", 0)

    def getpeername(self):
        if self._pipe is not None:
            return self._pipe.peer_addr
        raise error("not connected")


# ----- module-level helpers -----

_ephem_counter = [49152]
def _ephemeral_port():
    _ephem_counter[0] += 1
    return _ephem_counter[0]


def create_connection(address, timeout=None, source_address=None):
    s = socket(AF_INET, SOCK_STREAM)
    if timeout is not None:
        s.settimeout(timeout)
    s.connect(address)
    return s


def gethostbyname(host):
    # Map a handful of well-known names; everything else falls through to 127.0.0.1
    if host in ("localhost", "127.0.0.1"):
        return "127.0.0.1"
    return "127.0.0.1"


def reset_shim():
    """Reset all in-process sockets — call between exercises."""
    _tcp_servers.clear()
    _udp_endpoints.clear()
    _ephem_counter[0] = 49152
`;
