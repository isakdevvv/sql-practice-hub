import { Link } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { InodeDiagram } from "./InodeDiagram";
import { FreeBlockBitmap } from "./FreeBlockBitmap";
import { PathResolution } from "./PathResolution";
import { LinkTypes } from "./LinkTypes";
import { JournalingAnimator } from "./JournalingAnimator";

const STEPS = [
  { title: "Hva er en inode?", anchor: "inode" },
  { title: "Inode-strukturen i ext4", anchor: "struktur" },
  { title: "Direkte / indirekte pointers (visuelt)", anchor: "pointers" },
  { title: "Free-block bitmap & fragmentering", anchor: "bitmap" },
  { title: "Path-resolution: inode-for-inode", anchor: "path" },
  { title: "Hard link vs symbolic link", anchor: "links" },
  { title: "FAT vs ext4", anchor: "fat-vs-ext4" },
  { title: "Journaling i ext4", anchor: "journal" },
  { title: "Journal-animator (krasj-eksperiment)", anchor: "journal-anim" },
  { title: "Mount-points og VFS", anchor: "vfs" },
  { title: "Konkrete syscalls", anchor: "syscalls" },
  { title: "Eksamen-quick-ref", anchor: "eksamen" },
];

export function FilsystemPage() {
  return (
    <StackPageShell title="Filsystem og inodes" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OSTEP kap. 39–42
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Filsystem og inodes
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Et filsystem er en datastruktur lagt over en blokk-enhet. Det må
            svare på: <em>hvilke blokker hører til hvilken fil?</em>, og{" "}
            <em>hvor finner jeg dem ut fra et filnavn?</em> Inoder
            (index-noder) er ext-familiens svar — en kompakt post per fil med
            metadata pluss pekere til blokkene. Sammenlign med FAT, som bruker
            en lenket liste i én sentral tabell.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <HardDrive className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Visuelt:</span>{" "}
              <a href="#pointers" className="text-brand hover:underline">
                inode-diagrammet
              </a>{" "}
              under viser hvordan 12 direkte, 1 indirekte, 1 dobbel-indirekte
              og 1 trippel-indirekte pointer dekker filer fra 4&nbsp;KiB til
              flere TB.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-filsystem" steps={STEPS} />

        <Section number="1" id="inode" title="Hva er en inode?">
          <p className="text-sm text-muted-foreground mb-3">
            En inode (index-node) er en post som beskriver én fil. Inode-nummeret
            er primærnøkkelen — selve filnavnet bor i en directory entry som
            bare peker hit. Det er derfor hardlinks fungerer: to navn, samme
            inode-nummer.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`$ ls -li /etc/hostname
1310732 -rw-r--r-- 1 root root 6 mai 17 09:12 /etc/hostname
   ^^^^^^^
   inode-nummer

$ stat /etc/hostname
  File: /etc/hostname
  Size: 6         Blocks: 8          IO Block: 4096   regular file
Device: 8,1       Inode: 1310732     Links: 1
Access: (0644/-rw-r--r--)  Uid: (0/root)   Gid: (0/root)`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Inode-nummeret er unikt per filsystem. Når du gjør{" "}
            <code className="font-mono">open("/etc/hostname")</code>, slår
            kjernen opp directory-entry, finner inode-nummer, leser inoden,
            og bruker pointer-blokkene for å hente data.
          </p>
        </Section>

        <Section number="2" id="struktur" title="Inode-strukturen i ext4">
          <p className="text-sm text-muted-foreground mb-3">
            En ext4-inode er typisk 256 byte. Disse feltene er kjernen:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-44">Felt</th>
                  <th className="text-left font-semibold px-3 py-2 w-20">Byte</th>
                  <th className="text-left font-semibold px-3 py-2">Hva det er</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_mode</td>
                  <td className="px-3 py-2">2</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Filtype (regular / dir / symlink / ...) + permisjoner (rwx).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_uid / i_gid</td>
                  <td className="px-3 py-2">2 + 2</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Eier-bruker og gruppe (numeriske ID-er).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_size</td>
                  <td className="px-3 py-2">8</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Logisk filstørrelse i byte.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_atime / mtime / ctime</td>
                  <td className="px-3 py-2">12</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Last-access, last-modify, status-change timestamps.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_links_count</td>
                  <td className="px-3 py-2">2</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Antall hardlinks. Når dette går til 0 og ingen har filen
                    åpen → blokker frigis.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_blocks</td>
                  <td className="px-3 py-2">4</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Antall 512-byte sektorer brukt på disk (kan være mer enn
                    i_size pga. sparse / metadata).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">i_block[15]</td>
                  <td className="px-3 py-2">60</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Pointer-array: 12 direkte + 1 indirekte + 1
                    dobbel-indirekte + 1 trippel-indirekte.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Ext4-twist:</strong> moderne ext4 bruker faktisk{" "}
            <em>extents</em> (sammenhengende range &lt;start, length&gt;) i
            stedet for ren pointer-array, fordi en TB-fil med 4&nbsp;KiB blokker
            ellers ville trengt millioner av pointere. Pensum-spørsmål
            handler likevel om den klassiske inode-strukturen.
          </p>
        </Section>

        <Section
          number="3"
          id="pointers"
          title="Direkte / indirekte pointers — visuelt"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Anta blokkstørrelse 4&nbsp;KiB og 4-byte pointere. Da rommer én
            indirekte blokk 1024 pointere. Spørsmålet «hva er maks filstørrelse
            med kun 12 + 1 + 1 + 1 = 15 inode-slots?» løses i hodet med
            denne summen:
          </p>
          <InodeDiagram />
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="font-semibold mb-2">Pluss-regnskap (4&nbsp;KiB blokk, 4-byte pointer):</div>
            <pre className="font-mono text-xs whitespace-pre">{`Direkte:            12 × 4 KiB        =       48 KiB
Indirekte:        1024 × 4 KiB        =        4 MiB
Dobbel-indirekte: 1024² × 4 KiB       =        4 GiB
Trippel-indirekte:1024³ × 4 KiB       =        4 TiB
                  ---------------------+-------------
Sum                                  ≈        4 TiB`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Hvorfor 12 direkte?</strong> Empirisk er de fleste filer
            små (&lt; 48 KiB). For dem holder det med ett oppslag i inoden — null
            ekstra disk-IO for å finne blokkene. Indirekte-trinnene kicker
            kun inn for store filer, hvor den ekstra indirection-kostnaden er
            småpenger sammenlignet med selve dataoverføringen.
          </p>
        </Section>

        <Section
          number="4"
          id="bitmap"
          title="Free-block bitmap & fragmentering"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Inoden vet hvilke blokker som tilhører <em>én</em> fil — men
            hvordan vet filsystemet hvilke blokker som er <em>ledige</em>?
            Svaret er en{" "}
            <strong className="text-foreground">free-block bitmap</strong>:
            én bit per disk-blokk. 0 = ledig, 1 = brukt. For et 1 TB
            disk-volum med 4&nbsp;KiB blokker blir bitmapet ~32 MiB — lite
            nok til å holde i RAM.
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Når du oppretter en fil må allokatoren finne et hull stort nok.
            Strategien påvirker både hastighet på selve søket og hvor mye
            fragmentering du ender med over tid. Eksperimentér:
          </p>
          <FreeBlockBitmap />
        </Section>

        <Section
          number="5"
          id="path"
          title="Path-resolution: hvordan kernel finner filen"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Når en applikasjon kaller{" "}
            <code className="font-mono">open("/home/isak/docs/file.txt")</code>
            , må kjernen oversette path-strengen til en inode. Det skjer
            komponent-for-komponent: starter i root-inoden, slår opp neste
            navn i directoryen, leser den nye inoden, gjentar. Hvert steg
            koster minst to disk-leser med kald cache — én for
            directory-data, én for ny inode. Klikk gjennom stegene:
          </p>
          <PathResolution />
        </Section>

        <Section
          number="6"
          id="links"
          title="Hard link vs symbolic link — to navn, to filosofier"
        >
          <p className="text-sm text-muted-foreground mb-3">
            En <em>hard link</em> er bare en ekstra directory-entry som
            peker på samme inode-nummer som en eksisterende fil. En{" "}
            <em>symbolic link</em> er en helt egen inode med type "symlink"
            som inneholder en path-streng. Forskjellen blir tydeligst når
            du sletter originalen eller endrer permissions:
          </p>
          <LinkTypes />
        </Section>

        <Section number="7" id="fat-vs-ext4" title="FAT vs ext4 — to filosofier">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                FAT (File Allocation Table)
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Én sentral tabell. Hver tabell-celle representerer én
                disk-cluster og peker til neste cluster i samme fil — en
                lenket liste på disk.
              </p>
              <pre className="font-mono text-xs whitespace-pre">{`Cluster 0: FREE
Cluster 1: BAD
Cluster 5: -> 6
Cluster 6: -> 9
Cluster 9: EOF      // fil-slutt

dir-entry "rapport.txt":
  start = 5, size = 12 KiB`}</pre>
              <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4 space-y-1">
                <li>Random access er O(n) i fillengde — må følge lista.</li>
                <li>Ingen permisjoner, ingen eier.</li>
                <li>Lett å implementere — derfor på USB-pinner.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                ext4 (inode-tabell)
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Inode-tabell per blokk-gruppe. Hver inode har egen
                metadata + pointer-array. Filnavn → inode via directory entry.
              </p>
              <pre className="font-mono text-xs whitespace-pre">{`inode 1310732:
  mode=0644, uid=1000, size=12K
  blocks: [820, 821, 822, 0,...]
                |    |    |
                v    v    v
            data data data

dir "rapport.txt" → 1310732`}</pre>
              <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4 space-y-1">
                <li>Random access er O(1) for små filer, O(log) for store.</li>
                <li>Full POSIX: rwx, uid/gid, hardlinks, symlinks.</li>
                <li>Journaling for crash-konsistens.</li>
              </ul>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-44">Egenskap</th>
                  <th className="text-left font-semibold px-3 py-2">FAT32</th>
                  <th className="text-left font-semibold px-3 py-2">ext4</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Metadata-lokasjon</td>
                  <td className="px-3 py-2 text-muted-foreground">I dir-entry</td>
                  <td className="px-3 py-2 text-muted-foreground">I inode</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Block-mapping</td>
                  <td className="px-3 py-2 text-muted-foreground">Lenket liste (FAT-tabell)</td>
                  <td className="px-3 py-2 text-muted-foreground">Pointer-array / extents</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Maks filstørrelse</td>
                  <td className="px-3 py-2 text-muted-foreground">4 GiB</td>
                  <td className="px-3 py-2 text-muted-foreground">16 TiB (med extents)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Permisjoner</td>
                  <td className="px-3 py-2 text-muted-foreground">Nei (read-only bit)</td>
                  <td className="px-3 py-2 text-muted-foreground">Full POSIX rwx + ACL</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Hardlinks</td>
                  <td className="px-3 py-2 text-muted-foreground">Nei</td>
                  <td className="px-3 py-2 text-muted-foreground">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Crash-konsistens</td>
                  <td className="px-3 py-2 text-muted-foreground">fsck (treg, scan av hele disken)</td>
                  <td className="px-3 py-2 text-muted-foreground">Journaling (replay)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="8" id="journal" title="Journaling i ext4 — write-ahead log">
          <p className="text-sm text-muted-foreground mb-3">
            En filoperasjon endrer ofte flere blokker (inode + bitmap +
            datablokk). Hvis strømmen går mellom dem, sitter du igjen med
            «halvferdig» filsystem-tilstand. Journaling løser dette ved å
            skrive en <em>intention log</em> først, så commit, så de faktiske
            blokkene.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Steg                                Disk-aktivitet
----                                -------------
1. Begin transaction (TxB)          journal-skriv
2. Skriv metadata + data til journal journal-skriv
3. Commit-blokk (TxE)               journal-skriv (sync!)
4. Skriv metadata til endelig plass main-disk-skriv
5. Marker journal-blokken som fri   journal-skriv

Hvis crash før steg 3: ingenting i journalen → ignore.
Hvis crash mellom 3 og 5: journal har commit → replay.`}</pre>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <ModeCard
              title="data=writeback"
              text="Bare metadata journales. Data kan skrives før eller etter metadata."
              tradeoff="Raskest, men gammel data kan dukke opp etter crash."
              color="amber"
            />
            <ModeCard
              title="data=ordered (default)"
              text="Bare metadata journales, men data tvinges til disk FØR metadata-commit."
              tradeoff="Bra balanse: rask + ingen 'gammel data lekker frem'."
              color="emerald"
            />
            <ModeCard
              title="data=journal"
              text="Både metadata OG data går gjennom journalen. Dobbeltskrivning."
              tradeoff="Sterkest garanti, men ~halv throughput. Brukes til DB-disker."
              color="sky"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Atomic by commit:</strong> commit-blokken har en checksum.
            Den skrives helt til slutt, med en disk-barrier. Hvis den
            mangler eller har feil checksum etter crash, anses hele
            transaksjonen som ugyldig — alt-eller-ingenting-prinsippet.
          </p>
        </Section>

        <Section
          number="9"
          id="journal-anim"
          title="Journal-animator — krasj-eksperiment"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Tekstforklaringen over er en god start, men intuisjonen for{" "}
            <em>hvorfor</em> det fungerer kommer først når du selv kan
            stoppe disken midt i en transaksjon. Simulatoren under lar deg
            kjøre en operasjon steg-for-steg, trykke <strong>Krasj!</strong>{" "}
            når som helst, og se hva som skjer ved reboot:
          </p>
          <JournalingAnimator />
          <p className="text-xs text-muted-foreground mt-3">
            <strong className="text-foreground">Prøv:</strong> bytt til
            "uten journal" og trykk Krasj etter meta-skrivet. Sammenlign
            med "ordered" → samme krasj-punkt gir replay og konsistent
            filsystem. Det er hele poenget.
          </p>
        </Section>

        <Section number="10" id="vfs" title="Mount-points og VFS-laget">
          <p className="text-sm text-muted-foreground mb-3">
            Linux har dusinvis av filsystemer (ext4, xfs, btrfs, FAT, NFS,
            tmpfs, procfs ...). Felles for dem: <strong>VFS</strong> (Virtual File System).
            VFS er en abstraksjon i kjernen som gjør at applikasjoner kan
            kalle <code className="font-mono">open()</code> /{" "}
            <code className="font-mono">read()</code> /{" "}
            <code className="font-mono">write()</code> uten å bry seg om
            hvilken implementasjon som ligger under.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Applikasjon (Python, curl, vim ...)
      |
   open/read/write/close   ← POSIX-syscalls
      v
+-----------------+
|       VFS       |  ← felles inode / dentry / file-objekter
+-----------------+
  /       |        \\
 ext4    xfs      tmpfs   nfs   procfs
  |       |        |       |      |
[disk]  [disk]   [RAM]  [nett]  [genererte]`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Et <strong>mount-point</strong> er der ett filsystem «kobles på»
            et annet. Etter <code className="font-mono">mount /dev/sdb1
            /mnt/data</code> overstyrer det monterte fs-et alt under{" "}
            <code className="font-mono">/mnt/data</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`$ mount | grep -E "^/dev"
/dev/sda2 on / type ext4 (rw,relatime)
/dev/sda1 on /boot/efi type vfat (rw,relatime)
/dev/sdb1 on /mnt/data type xfs (rw,relatime)

$ df -hT
Filesystem     Type   Size  Used Avail Use% Mounted on
/dev/sda2      ext4   456G   78G  355G  19% /
tmpfs          tmpfs  7,7G  2,1M  7,7G   1% /run
/dev/sda1      vfat   511M  6,1M  505M   2% /boot/efi`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Hvorfor flere fs-er?</strong> Forskjellige bruksmønstre:
            <code className="font-mono"> tmpfs</code> for raske scratch-filer
            i RAM, <code className="font-mono">vfat</code> på EFI fordi UEFI
            bare forstår FAT, <code className="font-mono">ext4/xfs</code> på
            data-disker, <code className="font-mono">procfs</code> for
            kjerne-eksponert prosessinfo. VFS gjør at alle ser like ut for
            applikasjonen.
          </p>
        </Section>

        <Section number="11" id="syscalls" title="Konkrete syscalls">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Lese en fil i C
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`int fd = open("/etc/hostname",
              O_RDONLY);
char buf[64];
ssize_t n = read(fd, buf, 64);
close(fd);

// Under panseret:
//   open  → finn inode, alloker fd
//   read  → følg pointer-array,
//           kopier blokk(er) til buf
//   close → frigi fd`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Inspisere inoden
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`#include <sys/stat.h>

struct stat st;
stat("/etc/hostname", &st);

printf("inode: %lu\\n",
       (unsigned long)st.st_ino);
printf("mode:  %o\\n", st.st_mode);
printf("size:  %lld\\n",
       (long long)st.st_size);
printf("links: %lu\\n",
       (unsigned long)st.st_nlink);`}</pre>
            </div>
          </div>
        </Section>

        <Section number="12" id="eksamen" title="Eksamen-quick-ref">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Inode ≠ filnavn.</strong>{" "}
              Inoden lagrer metadata + pointere; filnavnet bor i
              directory-entry og peker til inode-nummeret. Derfor:
              hardlinks = flere navn på samme inode.
            </li>
            <li>
              <strong className="text-foreground">12 direkte + 1 + 1 + 1.</strong>{" "}
              Klassisk pointer-layout. Kunne regne maks filstørrelse: med
              4&nbsp;KiB blokk og 4-byte pointer blir det 48&nbsp;KiB + 4&nbsp;MiB
              + 4&nbsp;GiB + 4&nbsp;TiB.
            </li>
            <li>
              <strong className="text-foreground">FAT = lenket liste, ext4 = inode-tabell.</strong>{" "}
              FAT har én sentral tabell med «neste cluster»-pekere. Ext4 har
              metadata samlet per fil i en inode.
            </li>
            <li>
              <strong className="text-foreground">Journaling = write-ahead log.</strong>{" "}
              Skriv intent først, så commit-blokk, så endelig plassering.
              Garanterer alt-eller-ingenting ved crash.
            </li>
            <li>
              <strong className="text-foreground">data=ordered er default.</strong>{" "}
              Journaler metadata, men tvinger data til disk først. Rimelig
              balanse mellom ytelse og sikkerhet.
            </li>
            <li>
              <strong className="text-foreground">VFS er en abstraksjon, ikke et filsystem.</strong>{" "}
              Det er kjernens fellesgrensesnitt som ext4, xfs, tmpfs osv. plugger seg inn i.
            </li>
            <li>
              <strong className="text-foreground">Mount-point binder fs til en sti.</strong>{" "}
              Etter mount overstyrer det nye fs-et alt under den stien — det
              som var der før er «skjult» til umount.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              OSTEP kap. 39 (Files &amp; Directories), 40 (FS Implementation),
              41 (FFS), 42 (Crash Consistency: FSCK &amp; Journaling) —{" "}
              <a
                href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
                className="text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                gratis hos UW Madison
              </a>.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-virtuelt-minne" }}
                className="text-brand hover:underline"
              >
                Virtuelt minne &amp; paging
              </Link>{" "}
              — beslektet adresseringstema (page-tables vs. inode-pointers).
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-rwx-kalkulator" }}
                className="text-brand hover:underline"
              >
                rwx-kalkulator
              </Link>{" "}
              — selve mode-feltet i inoden.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function ModeCard({
  title,
  text,
  tradeoff,
  color,
}: {
  title: string;
  text: string;
  tradeoff: string;
  color: "amber" | "emerald" | "sky";
}) {
  const borderClass =
    color === "amber"
      ? "border-amber-500/30 bg-amber-500/5"
      : color === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : "border-sky-500/30 bg-sky-500/5";
  const textClass =
    color === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : color === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-sky-600 dark:text-sky-400";
  return (
    <div className={`rounded-xl border p-4 ${borderClass}`}>
      <div className={`text-xs uppercase tracking-wider font-semibold mb-2 font-mono ${textClass}`}>
        {title}
      </div>
      <p className="text-sm text-foreground mb-2">{text}</p>
      <p className="text-xs text-muted-foreground">
        <strong className="text-foreground">Tradeoff:</strong> {tradeoff}
      </p>
    </div>
  );
}
