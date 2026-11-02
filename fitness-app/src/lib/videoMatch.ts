// Busca el vídeo de un ejercicio aunque en el catálogo esté escrito distinto
// (mayúsculas, acentos, º/°, prefijos tipo "TRí- ", palabras de más, otro orden).
//
// 1) Coincidencia exacta por nombre normalizado.
// 2) Si no, el más parecido por trigramas (como pg_trgm) si la similitud ≥ 0,80.
//    Calibrado con el catálogo real: aciertos 0,89–1,00, no-aciertos ≤ 0,50.

type CatalogEx = { name: string; videoRef: string | null };

const MIN_SIMILARITY = 0.8;

export function isVideoUrl(ref: string | null | undefined): ref is string {
  return !!ref && /^https?:\/\//i.test(ref.trim());
}

/** Arregla enlaces guardados sin protocolo ("youtu.be/…", "www.youtube.com/…"). */
export function fixVideoUrl(ref: string | null | undefined): string | null {
  if (!ref) return null;
  const r = ref.trim();
  if (isVideoUrl(r)) return r;
  if (/^(www\.)?(youtube\.com|youtu\.be)\//i.test(r)) return "https://" + r;
  return null;
}

export function normalizeExerciseName(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quita acentos
    .toLowerCase()
    .replace(/º/g, "°")
    .replace(/macuernas/g, "mancuernas")
    .replace(/^[a-z.]{1,10}\s*-\s*/, "")              // prefijos "tri- ", "ea- ", "dorsal- "
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trigrams(norm: string): Set<string> {
  const out = new Set<string>();
  for (const w of norm.split(" ")) {
    if (!w) continue;
    const p = "  " + w + " ";
    for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  }
  return out;
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Devuelve una función nombre → URL de vídeo (o null), con caché. */
export function buildVideoFinder(catalog: CatalogEx[]): (name: string) => string | null {
  const withVideo = catalog
    .map(e => ({ url: fixVideoUrl(e.videoRef), norm: normalizeExerciseName(e.name) }))
    .filter((e): e is { url: string; norm: string } => !!e.url);

  const exact = new Map<string, string>();
  for (const e of withVideo) if (!exact.has(e.norm)) exact.set(e.norm, e.url);
  const indexed = withVideo.map(e => ({ ...e, tg: trigrams(e.norm) }));

  const cache = new Map<string, string | null>();
  return (name: string) => {
    if (cache.has(name)) return cache.get(name)!;
    const norm = normalizeExerciseName(name);
    let url = exact.get(norm) ?? null;
    if (!url) {
      const tg = trigrams(norm);
      let best = 0;
      for (const e of indexed) {
        const s = similarity(tg, e.tg);
        if (s > best) { best = s; url = e.url; }
      }
      if (best < MIN_SIMILARITY) url = null;
    }
    cache.set(name, url);
    return url;
  };
}
