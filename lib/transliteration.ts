// Georgian ↔ Latin transliteration for cross-script search.
//
// Georgians commonly type Georgian words in Latin script (on devices without
// a ka layout) and English words in Georgian script (phonetic input). The
// synonym table holds one canonical pair per profession, so we bridge the
// scripts in the query layer: given one spelling, generate plausible
// cross-script candidates and search all of them.
//
// The mapping is deliberately lossy — pg_trgm similarity in the resolver RPC
// tolerates minor divergences (ტ vs თ, ჩ vs ჭ, etc.), so we pick one common
// form per letter rather than enumerating every possible variant.

// Georgian → Latin (BGN/PCGN-ish, favouring widely-read forms)
const KA_TO_LATIN: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z",
  თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o",
  პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "f",
  ქ: "q", ღ: "gh", ყ: "y", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz",
  წ: "w", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

// Latin → Georgian digraphs (match first, longest-wins)
const LATIN_DIGRAPHS: ReadonlyArray<readonly [string, string]> = [
  ["zh", "ჟ"],
  ["sh", "შ"],
  ["ch", "ჩ"],
  ["ts", "ც"],
  ["dz", "ძ"],
  ["gh", "ღ"],
  ["kh", "ხ"],
];

// Latin → Georgian single chars (ambiguous letters picked by common usage:
// `t` → თ, `k` → კ, `p` → პ — trigram tolerance handles aspirated variants).
const LATIN_SINGLE: Record<string, string> = {
  a: "ა", b: "ბ", c: "ც", d: "დ", e: "ე", f: "ფ", g: "გ",
  h: "ჰ", i: "ი", j: "ჯ", k: "კ", l: "ლ", m: "მ", n: "ნ",
  o: "ო", p: "პ", q: "ქ", r: "რ", s: "ს", t: "თ", u: "უ",
  v: "ვ", w: "წ", x: "ხ", y: "ყ", z: "ზ",
};

const GEORGIAN_RE = /[Ⴀ-ჿ]/;
const LATIN_RE = /[a-zA-Z]/;

export function georgianToLatin(input: string): string {
  let out = "";
  for (const ch of input) {
    out += KA_TO_LATIN[ch] ?? ch;
  }
  return out;
}

export function latinToGeorgian(input: string): string {
  const lower = input.toLowerCase();
  let out = "";
  let i = 0;
  while (i < lower.length) {
    const pair = lower.slice(i, i + 2);
    const digraph = LATIN_DIGRAPHS.find(([dg]) => dg === pair);
    if (digraph) {
      out += digraph[1];
      i += 2;
      continue;
    }
    const ch = lower[i];
    out += LATIN_SINGLE[ch] ?? ch;
    i += 1;
  }
  return out;
}

// Produce script variants of a search term so a single RPC input covers
// cross-script spellings. Duplicate-free; original term is always present.
//
// Examples:
//   "menejeri"  → ["menejeri", "მენეჯერი"]
//   "მანაგერ"   → ["მანაგერ", "manager"]
//   "React"     → ["react", "რეაცტ"]
//   "IT"        → ["it", "ით"]  (harmless — won't match anything meaningful)
export function generateSearchCandidates(term: string): string[] {
  const trimmed = term.trim().toLowerCase();
  if (trimmed.length === 0) return [];

  const seen = new Set<string>();
  const candidates: string[] = [];

  const push = (value: string) => {
    if (value && !seen.has(value)) {
      seen.add(value);
      candidates.push(value);
    }
  };

  push(trimmed);

  const hasGeorgian = GEORGIAN_RE.test(trimmed);
  const hasLatin = LATIN_RE.test(trimmed);

  if (hasLatin) push(latinToGeorgian(trimmed));
  if (hasGeorgian) push(georgianToLatin(trimmed));

  return candidates;
}
