import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Interaktiv tidslinje: 7 epoker fra 1940-tallet til i dag.
 * Brukeren drar slideren (eller bruker piltaster/scroll-hjul) for å bytte epoke.
 * Hver epoke har sin egen animert SVG-illustrasjon og kort tekst.
 */

type EraId = "1940s" | "1950s" | "1960s" | "1970s" | "1980s" | "1990s" | "2000+";

type Era = {
  id: EraId;
  label: string;
  yearRange: string;
  headline: string;
  challenge: string;
  solution: string;
  diffFromPrev: string | null;
  examples: string[];
};

const ERAS: Era[] = [
  {
    id: "1940s",
    label: "1940-tallet",
    yearRange: "1945 – 1955",
    headline: "Ingen OS — bare brytere og lys",
    challenge:
      "De første datamaskinene (ENIAC, EDVAC) hadde ingen operativsystem. Programmereren satte brytere for hånd, koblet om kabler og leste resultatet fra lyspaneler. Maskinen kjørte ett program av gangen, og menneskelig oppsett tok timer for hver kjøring.",
    solution:
      "Det fantes ingen «løsning» — bare ren maskinvare. Hver instruks ble matet inn manuelt. Konseptet «operativsystem» eksisterte ikke ennå.",
    diffFromPrev: null,
    examples: ["ENIAC (1945)", "Manchester Baby (1948)", "EDVAC (1949)"],
  },
  {
    id: "1950s",
    label: "1950-tallet",
    yearRange: "1955 – 1965",
    headline: "Batch-systemer & punch cards",
    challenge:
      "Maskinene var dyre, menneskene billige. En operatør samlet inn jobber fra mange brukere som punch card-bunker, og kjørte dem i kø («batch»). Problemet: CPU-en stod stille mellom hver jobb mens kort ble matet inn.",
    solution:
      "Resident monitor — et lite kontrollprogram som lå i minnet og automatisk lastet neste jobb fra bånd. Første spiren til et OS. IBM utviklet FMS og IBSYS for IBM 7090. Jobbene ble lagt på magnetbånd og lest sekvensielt.",
    diffFromPrev:
      "Fra manuell betjening → automatisk jobb-bytte. Operatøren slipper å resette mellom hvert program.",
    examples: ["IBM FMS (1956)", "IBSYS (1960)", "GM-NAA I/O"],
  },
  {
    id: "1960s",
    label: "1960-tallet",
    yearRange: "1965 – 1975",
    headline: "Multiprogrammering & time-sharing",
    challenge:
      "Med batch ventet CPU-en fortsatt på treg I/O — disk og bånd brukte millisekunder, CPU brukte mikrosekunder. Og interaktive brukere kunne ikke vente på en hel batch for å se output.",
    solution:
      "Multiprogrammering: hold flere jobber i minnet samtidig, og bytt til en annen mens en venter på I/O. Time-sharing: gi hver bruker en liten tids-skive på CPU-en så det føles som om de har maskinen for seg selv. CTSS (MIT, 1961) og Multics (1969) var milepælene. CPU-utnyttelsen gikk fra ~20% til ~80%.",
    diffFromPrev:
      "Fra én jobb om gangen → flere jobber overlapper. Bruker kan sitte ved en terminal og se respons direkte.",
    examples: ["CTSS (1961)", "OS/360 (1964)", "Multics (1969)"],
  },
  {
    id: "1970s",
    label: "1970-tallet",
    yearRange: "1975 – 1985",
    headline: "UNIX, virtuelt minne & portabilitet",
    challenge:
      "Multics ble for komplekst. Hver maskinleverandør hadde sitt eget OS skrevet i assembler — null portabilitet. Og jobber begynte å trenge mer minne enn maskinen fysisk hadde.",
    solution:
      "UNIX (Ken Thompson & Dennis Ritchie, Bell Labs, 1971) ble omskrevet til C i 1973 — første portable OS. Virtual memory + paging (swap til disk) lar programmer late som de har mer RAM enn de har. Filsystem-tre, pipes, fork()/exec() — abstraksjoner som overlever til i dag.",
    diffFromPrev:
      "Fra assembler-spesifikt → portabelt via et høynivå-språk (C). Fra «alt må få plass i RAM» → virtuelt minne med swap.",
    examples: ["UNIX V1 (1971)", "UNIX V6 (1975)", "CP/M (1974)", "BSD (1977)"],
  },
  {
    id: "1980s",
    label: "1980-tallet",
    yearRange: "1985 – 1992",
    headline: "Personlige datamaskiner & GUI",
    challenge:
      "Maskiner ble billige nok til at folk eide sine egne. Men hver bruker var ikke en programmerer — kommandolinje var en barriere. Samtidig begynte maskiner å snakke sammen via lokale nettverk.",
    solution:
      "Personlige OS for én bruker: MS-DOS (1981), klassisk Mac OS (1984), Windows (1985). Grafiske brukergrensesnitt — vinduer, mus, ikoner — gjorde datamaskinen tilgjengelig for ikke-teknikere. Network stack (TCP/IP) ble bakt inn i UNIX-derivater.",
    diffFromPrev:
      "Fra delt mainframe med mange brukere → én bruker per maskin. Fra terminal-tekst → grafisk pek-og-klikk. Fra isolert maskin → koblet til lokalt nettverk.",
    examples: ["MS-DOS (1981)", "Mac System 1 (1984)", "Windows 1.0 (1985)", "BSD 4.2 m/ TCP/IP"],
  },
  {
    id: "1990s",
    label: "1990-tallet",
    yearRange: "1992 – 2000",
    headline: "Internett, Linux & distribuerte systemer",
    challenge:
      "Internett tok av: hver maskin ble en node i et globalt nettverk. Kommersielle UNIX-er var dyre og lukkede. Bedrifter trengte servere som tålte tusenvis av samtidige forbindelser.",
    solution:
      "Linux (Linus Torvalds, 1991) — gratis UNIX-klon med åpen kildekode, drevet av en global frivillig-dugnad. Windows NT (1993) hentet inn ekte multitasking og sikkerhet i Windows-familien. Distribuerte systemer (NFS, DCE, CORBA) lot prosesser på ulike maskiner samarbeide. Server-OS ble en industri.",
    diffFromPrev:
      "Fra én maskin på pulten → konstant koblet til internett. Fra proprietære OS → åpen kildekode tar markedsandeler. Fra én CPU per OS → klynger av maskiner som ett system.",
    examples: ["Linux 0.01 (1991)", "Windows NT 3.1 (1993)", "FreeBSD (1993)", "Solaris (1992)"],
  },
  {
    id: "2000+",
    label: "2000-tallet til i dag",
    yearRange: "2000 – nå",
    headline: "Mobil, sky & virtualisering",
    challenge:
      "Maskiner ble for kraftige til å la dem stå halvtomme. Brukerne ville ha datamaskinen i lomma. Og bedrifter ville slippe å eie maskinvaren — kjøpe regnekraft som en tjeneste.",
    solution:
      "Hypervisorer (VMware, Xen, KVM) lar ett fysisk OS kjøre mange virtuelle. Skyen (AWS 2006) gjør VM-er til en API. Containere (Docker 2013) er lettvektige isolerte miljøer som deler kjernen. Mobil-OS (iOS 2007, Android 2008) er Unix-derivater med strengt sandboxede apper. Microkjerner, sikkerhet og energieffektivitet er nye design-drivere.",
    diffFromPrev:
      "Fra én OS per maskin → mange OS per maskin (VM-er) → mange isolerte miljøer per OS (containere). Fra «maskin» → «tjeneste i skyen» eller «app i lomma».",
    examples: ["Windows XP (2001)", "iOS (2007)", "Android (2008)", "Docker (2013)", "AWS EC2 (2006)"],
  },
];

// ============== ILLUSTRATIONS (én per epoke) ==============

function IllustrationFor({ era }: { era: EraId }) {
  switch (era) {
    case "1940s":
      return <Era1940 />;
    case "1950s":
      return <Era1950 />;
    case "1960s":
      return <Era1960 />;
    case "1970s":
      return <Era1970 />;
    case "1980s":
      return <Era1980 />;
    case "1990s":
      return <Era1990 />;
    case "2000+":
      return <Era2000 />;
  }
}

// 1940s — blinkende lyspaneler & brytere
function Era1940() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 350);
    return () => clearInterval(i);
  }, []);
  const lights = Array.from({ length: 24 }, (_, i) => {
    // pseudo-tilfeldig av/på basert på tick + index
    const on = ((tick * 7 + i * 13) % 5) < 2;
    return on;
  });
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <rect x="20" y="20" width="320" height="160" rx="6" fill="currentColor" className="text-zinc-800 dark:text-zinc-900" />
      <rect x="30" y="30" width="300" height="60" rx="3" fill="currentColor" className="text-zinc-700 dark:text-zinc-950" />
      {lights.map((on, i) => (
        <circle
          key={i}
          cx={45 + (i % 12) * 24}
          cy={45 + Math.floor(i / 12) * 24}
          r={6}
          className={on ? "fill-amber-400" : "fill-zinc-600"}
        />
      ))}
      {/* brytere */}
      {Array.from({ length: 8 }).map((_, i) => {
        const up = (tick + i) % 2 === 0;
        return (
          <g key={i}>
            <rect x={40 + i * 36} y={110} width={20} height={50} rx={3} className="fill-zinc-600" />
            <rect
              x={43 + i * 36}
              y={up ? 115 : 140}
              width={14}
              height={18}
              rx={2}
              className="fill-zinc-300"
            />
          </g>
        );
      })}
      <text x="180" y="190" textAnchor="middle" className="fill-current text-[10px] text-zinc-400" fontFamily="monospace">
        ENIAC-stil: brytere inn, lys ut
      </text>
    </svg>
  );
}

// 1950s — punch cards i kø + bånd
function Era1950() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setOffset((o) => (o + 1) % 60), 120);
    return () => clearInterval(i);
  }, []);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      {/* leser-maskin */}
      <rect x="240" y="60" width="100" height="80" rx="6" className="fill-zinc-700" />
      <rect x="250" y="70" width="80" height="40" rx="3" className="fill-zinc-900" />
      <text x="290" y="95" textAnchor="middle" className="fill-green-400 text-[9px]" fontFamily="monospace">
        BATCH
      </text>
      <circle cx="265" cy="125" r="6" className="fill-amber-400">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
      </circle>
      <text x="280" y="128" className="fill-zinc-300 text-[8px]" fontFamily="monospace">
        kjører...
      </text>
      {/* kort-kø som beveger seg mot leseren */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 20 + i * 36 - offset;
        return (
          <g key={i} transform={`translate(${x}, 80)`}>
            <rect width={28} height={42} rx={2} className="fill-amber-100 stroke-amber-700" strokeWidth={1} />
            {/* hull i kortet */}
            {Array.from({ length: 5 }).map((_, h) => (
              <rect key={h} x={3 + h * 5} y={6} width={2} height={3} className="fill-amber-700" />
            ))}
            {Array.from({ length: 5 }).map((_, h) => (
              <rect key={h} x={3 + h * 5} y={14} width={2} height={3} className="fill-amber-700" />
            ))}
          </g>
        );
      })}
      <text x="180" y="180" textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Punch cards → batch monitor → output
      </text>
    </svg>
  );
}

// 1960s — multiprogrammering: 3 jobber bytter på CPU
function Era1960() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(i);
  }, []);
  const active = tick % 3;
  const labels = ["Job A", "Job B", "Job C"];
  const colors = ["fill-rose-400", "fill-emerald-400", "fill-sky-400"];
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      {/* CPU i midten */}
      <rect x="150" y="80" width="60" height="40" rx="4" className="fill-zinc-700" />
      <text x="180" y="105" textAnchor="middle" className="fill-zinc-100 text-[10px] font-bold" fontFamily="monospace">
        CPU
      </text>
      {/* tre jobber */}
      {[0, 1, 2].map((i) => {
        const cx = 60 + i * 120;
        const isActive = i === active;
        return (
          <g key={i}>
            <rect
              x={cx - 30}
              y={20}
              width={60}
              height={40}
              rx={4}
              className={isActive ? colors[i] : "fill-zinc-600"}
              opacity={isActive ? 1 : 0.5}
            />
            <text x={cx} y={45} textAnchor="middle" className="fill-zinc-900 text-[10px] font-bold" fontFamily="monospace">
              {labels[i]}
            </text>
            {/* linje fra jobb til CPU */}
            <line
              x1={cx}
              y1={62}
              x2={180}
              y2={82}
              stroke={isActive ? "currentColor" : "transparent"}
              strokeWidth={2}
              className={isActive ? colors[i].replace("fill-", "stroke-") : ""}
            />
            {/* I/O-status */}
            <text x={cx} y={75} textAnchor="middle" className="fill-current text-[8px] text-zinc-500" fontFamily="monospace">
              {isActive ? "kjører" : "venter I/O"}
            </text>
          </g>
        );
      })}
      <text x="180" y="155" textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Time-sharing: CPU bytter mellom jobber
      </text>
      <text x="180" y="172" textAnchor="middle" className="fill-current text-[9px] text-zinc-400" fontFamily="monospace">
        kvantum ≈ {((tick * 17) % 30) + 10} ms
      </text>
    </svg>
  );
}

// 1970s — virtuelt minne: side-tabell mapper virtuelle → fysiske sider, swap til disk
function Era1970() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 700);
    return () => clearInterval(i);
  }, []);
  const swapped = tick % 4;
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <text x="50" y="15" textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        Virtuelt minne
      </text>
      <text x="180" y="15" textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        Side-tabell
      </text>
      <text x="310" y="15" textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        RAM + swap
      </text>
      {/* virtuelle sider */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x={20} y={25 + i * 22} width={60} height={18} rx={2} className="fill-sky-300 dark:fill-sky-700" />
          <text x={50} y={38 + i * 22} textAnchor="middle" className="fill-current text-[9px] text-zinc-900 dark:text-zinc-100" fontFamily="monospace">
            VPN {i}
          </text>
        </g>
      ))}
      {/* side-tabell pilene */}
      {Array.from({ length: 6 }).map((_, i) => {
        const swapTarget = (i + swapped) % 4 === 0;
        const targetY = swapTarget ? 160 : 25 + ((i + tick) % 5) * 22;
        return (
          <line
            key={i}
            x1={80}
            y1={34 + i * 22}
            x2={swapTarget ? 250 : 240}
            y2={targetY + 9}
            stroke={swapTarget ? "#fb923c" : "#0ea5e9"}
            strokeWidth={1.5}
            opacity={0.7}
          />
        );
      })}
      {/* RAM-rammer */}
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i}>
          <rect x={240} y={25 + i * 22} width={60} height={18} rx={2} className="fill-emerald-300 dark:fill-emerald-700" />
          <text x={270} y={38 + i * 22} textAnchor="middle" className="fill-current text-[9px] text-zinc-900 dark:text-zinc-100" fontFamily="monospace">
            PFN {i}
          </text>
        </g>
      ))}
      {/* swap-disk */}
      <rect x="240" y="150" width="80" height="22" rx={2} className="fill-orange-400" />
      <text x="280" y="165" textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
        SWAP
      </text>
      <text x="180" y="190" textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Programmet tror det har mer RAM enn det fysisk har
      </text>
    </svg>
  );
}

// 1980s — PC + GUI vinduer + nettverks-kabel
function Era1980() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(i);
  }, []);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      {/* PC-skjerm */}
      <rect x="60" y="20" width="240" height="130" rx="4" className="fill-zinc-300 dark:fill-zinc-700" />
      <rect x="70" y="30" width="220" height="100" className="fill-cyan-100 dark:fill-cyan-950" />
      {/* GUI vinduer */}
      <rect x={80 + (tick % 3) * 4} y={45} width={100} height={60} rx={2} className="fill-white stroke-zinc-400" strokeWidth={1} />
      <rect x={80 + (tick % 3) * 4} y={45} width={100} height={10} className="fill-blue-500" />
      <text x={130 + (tick % 3) * 4} y={53} textAnchor="middle" className="fill-white text-[7px]" fontFamily="monospace">
        edit.txt
      </text>
      <rect x={180} y={65} width={100} height={50} rx={2} className="fill-white stroke-zinc-400" strokeWidth={1} />
      <rect x={180} y={65} width={100} height={10} className="fill-blue-500" />
      <text x={230} y={73} textAnchor="middle" className="fill-white text-[7px]" fontFamily="monospace">
        calc
      </text>
      {/* mus-peker */}
      <polygon points={`${100 + (tick * 4) % 150},${75 + (tick * 3) % 50} ${100 + (tick * 4) % 150},${85 + (tick * 3) % 50} ${108 + (tick * 4) % 150},${78 + (tick * 3) % 50}`} className="fill-zinc-900" />
      {/* PC-stativ */}
      <rect x="150" y="150" width="60" height="10" className="fill-zinc-400 dark:fill-zinc-600" />
      <rect x="130" y="158" width="100" height="6" className="fill-zinc-500 dark:fill-zinc-700" />
      {/* nettverks-kabel ut til høyre */}
      <path d="M 300 85 Q 330 85 340 100 Q 350 130 340 160" fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="3 2" />
      <circle cx={340} cy={160} r={4} className="fill-green-500" />
      <text x="180" y="190" textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Personlig PC + GUI + LAN
      </text>
    </svg>
  );
}

// 1990s — distribuerte noder kobles via internett
function Era1990() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 300);
    return () => clearInterval(i);
  }, []);
  const nodes = [
    { x: 60, y: 50, label: "Linux" },
    { x: 300, y: 50, label: "NT" },
    { x: 180, y: 30, label: "BSD" },
    { x: 60, y: 150, label: "Solaris" },
    { x: 300, y: 150, label: "Linux" },
    { x: 180, y: 170, label: "Mac" },
  ];
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      {/* sentral internett-sky */}
      <ellipse cx={180} cy={100} rx={50} ry={28} className="fill-zinc-200 dark:fill-zinc-800" />
      <text x="180" y="105" textAnchor="middle" className="fill-current text-[11px] font-bold text-zinc-700 dark:text-zinc-300" fontFamily="monospace">
        INTERNET
      </text>
      {/* nodene */}
      {nodes.map((n, i) => {
        const active = (tick + i) % nodes.length < 2;
        return (
          <g key={i}>
            <line
              x1={n.x}
              y1={n.y}
              x2={180}
              y2={100}
              stroke={active ? "#22d3ee" : "#475569"}
              strokeWidth={active ? 2 : 1}
              opacity={active ? 1 : 0.4}
            />
            <rect x={n.x - 22} y={n.y - 12} width={44} height={24} rx={3} className={active ? "fill-cyan-400" : "fill-zinc-500"} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
              {n.label}
            </text>
            {/* pakke som beveger seg */}
            {active && (
              <circle r={3} className="fill-amber-400">
                <animateMotion dur="0.6s" repeatCount="1" path={`M ${n.x} ${n.y} L 180 100`} />
              </circle>
            )}
          </g>
        );
      })}
      <text x="180" y="195" textAnchor="middle" className="fill-current text-[10px] text-zinc-500" fontFamily="monospace">
        Mange OS, ett nettverk — TCP/IP knytter alt sammen
      </text>
    </svg>
  );
}

// 2000+ — virtualisering: én fysisk maskin → flere VM-er + containere + sky
function Era2000() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(i);
  }, []);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      {/* hardware-lag */}
      <rect x="20" y="160" width="320" height="22" rx={3} className="fill-zinc-700" />
      <text x="180" y="175" textAnchor="middle" className="fill-zinc-100 text-[10px] font-bold" fontFamily="monospace">
        FYSISK MASKIN  (CPU · RAM · disk · NIC)
      </text>
      {/* hypervisor */}
      <rect x="20" y="135" width="320" height="20" rx={3} className="fill-amber-500" />
      <text x="180" y="148" textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
        HYPERVISOR (KVM / Xen / VMware)
      </text>
      {/* tre VM-er */}
      {[0, 1, 2].map((i) => {
        const x = 25 + i * 108;
        const pulse = (tick + i) % 3 === 0;
        return (
          <g key={i}>
            <rect x={x} y={60} width={100} height={70} rx={3} className={pulse ? "fill-sky-400" : "fill-sky-300 dark:fill-sky-700"} opacity={pulse ? 1 : 0.7} />
            <text x={x + 50} y={75} textAnchor="middle" className="fill-zinc-900 text-[9px] font-bold" fontFamily="monospace">
              VM {i + 1}
            </text>
            {/* containere i hver VM */}
            {[0, 1, 2].map((c) => (
              <rect
                key={c}
                x={x + 5 + c * 30}
                y={82}
                width={26}
                height={40}
                rx={2}
                className="fill-emerald-300 dark:fill-emerald-600"
                opacity={pulse ? 1 : 0.6}
              />
            ))}
            {[0, 1, 2].map((c) => (
              <text
                key={c}
                x={x + 18 + c * 30}
                y={105}
                textAnchor="middle"
                className="fill-zinc-900 text-[7px]"
                fontFamily="monospace"
              >
                ctr
              </text>
            ))}
          </g>
        );
      })}
      {/* sky ikon */}
      <ellipse cx={310} cy={30} rx={40} ry={16} className="fill-zinc-300 dark:fill-zinc-700" />
      <text x="310" y="34" textAnchor="middle" className="fill-current text-[10px] font-bold text-zinc-700 dark:text-zinc-200" fontFamily="monospace">
        SKY
      </text>
      <line x1={250} y1={40} x2={180} y2={60} stroke="#94a3b8" strokeDasharray="3 2" />
      <text x="170" y="22" textAnchor="middle" className="fill-current text-[9px] text-zinc-500" fontFamily="monospace">
        Hypervisor + containere — én maskin, mange isolerte miljøer
      </text>
    </svg>
  );
}

// ============== HOVED-KOMPONENT ==============

export function OsTimeline() {
  const [idx, setIdx] = useState(0);
  const era = ERAS[idx];
  const ref = useRef<HTMLDivElement>(null);

  // Keyboard-navigasjon
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!ref.current) return;
      if (document.activeElement !== ref.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(ERAS.length - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIdx(ERAS.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      className="rounded-xl border border-border bg-card p-5 focus:outline-none focus:ring-2 focus:ring-brand/40"
    >
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            {era.label} ({era.yearRange})
          </div>
          <h3 className="text-lg font-semibold mt-0.5">{era.headline}</h3>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono hidden sm:block">
          ← → for å bytte epoke
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={ERAS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--brand,#3b82f6)] cursor-pointer"
          aria-label="Velg epoke"
        />
        <div className="mt-1 flex justify-between text-[10px] font-mono text-muted-foreground">
          {ERAS.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`px-1 py-0.5 rounded hover:text-brand transition ${i === idx ? "text-brand font-bold" : ""}`}
            >
              {e.label.replace("-tallet", "s").replace(" til i dag", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Illustrasjon */}
      <div className="aspect-[16/9] rounded-lg border border-border bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden mb-4">
        <IllustrationFor era={era.id} />
      </div>

      {/* Tekst-kort */}
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-500 font-semibold mb-1">
            Hovedutfordring
          </div>
          <p className="text-foreground/90 leading-relaxed">{era.challenge}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-1">
            Løsning
          </div>
          <p className="text-foreground/90 leading-relaxed">{era.solution}</p>
        </div>
      </div>

      {/* Diff fra forrige epoke */}
      {era.diffFromPrev && (
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
            Hva endret seg fra forrige epoke?
          </div>
          <p className="text-foreground/90 leading-relaxed">{era.diffFromPrev}</p>
        </div>
      )}

      {/* Eksempler */}
      <div className="mt-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Eksempler:</span>{" "}
        {era.examples.join(" · ")}
      </div>
    </div>
  );
}

// ============== MINI-QUIZ: drag-og-slipp begivenheter til riktig tiår ==============

type QuizEvent = {
  id: string;
  label: string;
  correctEra: EraId;
};

const QUIZ_EVENTS: QuizEvent[] = [
  { id: "eniac", label: "ENIAC tas i bruk", correctEra: "1940s" },
  { id: "unix", label: "UNIX skrives om til C", correctEra: "1970s" },
  { id: "linux", label: "Linus Torvalds slipper Linux 0.01", correctEra: "1990s" },
  { id: "msdos", label: "IBM PC + MS-DOS lanseres", correctEra: "1980s" },
  { id: "docker", label: "Docker gjør containere mainstream", correctEra: "2000+" },
];

export function OsTimelineQuiz() {
  // placement[eventId] = eraId | null
  const [placement, setPlacement] = useState<Record<string, EraId | null>>(() =>
    Object.fromEntries(QUIZ_EVENTS.map((e) => [e.id, null])),
  );
  const [dragged, setDragged] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const unplaced = QUIZ_EVENTS.filter((e) => placement[e.id] === null);

  function placeOn(eraId: EraId) {
    if (!dragged) return;
    setPlacement((p) => ({ ...p, [dragged]: eraId }));
    setDragged(null);
  }

  function takeOff(eventId: string) {
    setPlacement((p) => ({ ...p, [eventId]: null }));
  }

  const allPlaced = unplaced.length === 0;
  const correctCount = QUIZ_EVENTS.filter((e) => placement[e.id] === e.correctEra).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold mb-1">Mini-quiz — dra hendelser til riktig tiår</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Klikk og dra hver begivenhet over til et tiår. Når alle fem er plassert kan du sjekke svaret.
        På mobil: trykk på en begivenhet for å «plukke opp», så trykk på et tiår for å plassere.
      </p>

      {/* event-pool */}
      <div className="mb-4 min-h-[60px] rounded-lg border border-dashed border-border bg-background p-3 flex flex-wrap gap-2">
        {unplaced.length === 0 ? (
          <span className="text-xs text-muted-foreground self-center">Alle plassert.</span>
        ) : (
          unplaced.map((e) => (
            <button
              key={e.id}
              type="button"
              draggable
              onDragStart={() => setDragged(e.id)}
              onClick={() => setDragged(dragged === e.id ? null : e.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-grab active:cursor-grabbing ${
                dragged === e.id
                  ? "bg-brand text-white border-brand"
                  : "bg-card border-border hover:border-brand"
              }`}
            >
              {e.label}
            </button>
          ))
        )}
      </div>

      {/* tiår-drops */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {ERAS.map((era) => {
          const placedHere = QUIZ_EVENTS.filter((e) => placement[e.id] === era.id);
          return (
            <div
              key={era.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => placeOn(era.id)}
              onClick={() => dragged && placeOn(era.id)}
              className={`rounded-lg border border-dashed p-2 min-h-[80px] transition ${
                dragged ? "border-brand bg-brand/5 cursor-pointer" : "border-border bg-background"
              }`}
            >
              <div className="text-[10px] font-mono text-muted-foreground mb-1">{era.label}</div>
              <div className="flex flex-col gap-1">
                {placedHere.map((e) => {
                  const correct = e.correctEra === era.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        takeOff(e.id);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded border text-left ${
                        revealed
                          ? correct
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-700"
                            : "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-700"
                          : "bg-card border-border hover:border-brand"
                      }`}
                      title="Klikk for å ta av igjen"
                    >
                      {e.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* sjekk-knapp */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={!allPlaced}
          onClick={() => setRevealed(true)}
          className="px-3 py-1.5 rounded-md bg-brand text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand/90 transition"
        >
          Sjekk svar
        </button>
        {revealed && (
          <>
            <span className="text-sm">
              <strong className="text-foreground">{correctCount} av {QUIZ_EVENTS.length}</strong> riktig
            </span>
            <button
              type="button"
              onClick={() => {
                setPlacement(Object.fromEntries(QUIZ_EVENTS.map((e) => [e.id, null])));
                setRevealed(false);
              }}
              className="text-xs text-muted-foreground hover:text-brand underline"
            >
              Nullstill
            </button>
          </>
        )}
        {!allPlaced && (
          <span className="text-xs text-muted-foreground">Plasser alle fem for å sjekke.</span>
        )}
      </div>
    </div>
  );
}
