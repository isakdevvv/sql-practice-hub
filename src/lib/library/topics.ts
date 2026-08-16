// Farge = tema. Hvert bibliotek-kort får en fargetone ut fra sin første
// kjente fag-tag, slik at et rutenett med 60 kort leses som grupper i stedet
// for én grå vegg. Vi lagrer bare *hue* (0-360) og bygger lys/mørk variant med
// oklch i Tailwind-klassene — da trenger vi én definisjon for begge temaer.
const TOPIC_HUES: Record<string, number> = {
  // Data og databaser
  sql: 195,
  database: 195,
  // Nettverk
  nettverk: 250,
  // Maskinlæring og AI
  ml: 300,
  "nevrale-nett": 300,
  ai: 300,
  // Statistikk og matematikk
  statistikk: 85,
  sannsyn: 85,
  matte: 85,
  // Operativsystemer og maskinvare
  os: 45,
  linux: 45,
  hardware: 45,
  // Sikkerhet
  sikkerhet: 20,
  krypto: 20,
  // Programmering
  python: 150,
  algoritmer: 150,
  git: 150,
  csharp: 150,
  kotlin: 150,
  // Web og app
  web: 335,
  flask: 335,
  api: 335,
  blazor: 335,
  mobil: 335,
};

// Brand-lilla som fallback for kort uten fag-tag (rene aktivitets-tags som
// "drill" eller "sandkasse" sier ikke noe om tema).
const DEFAULT_HUE = 265;

// Tag-lista i LIBRARY er kuratert med den viktigste faglige taggen først, så
// første treff er også det riktige temaet.
export function topicHue(tags: string[]): number {
  for (const tag of tags) {
    const hue = TOPIC_HUES[tag];
    if (hue !== undefined) return hue;
  }
  return DEFAULT_HUE;
}
