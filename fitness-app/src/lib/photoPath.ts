// Ruta de una foto de check-in dentro del bucket (lógica pura, probada en tests/).

export const PHOTO_BUCKET = "checkin-photos";

/** Ruta del archivo dentro del bucket a partir de la URL guardada (o la propia ruta). */
export function photoPath(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;
  const marker = `/${PHOTO_BUCKET}/`;
  if (urlOrPath.includes(marker)) {
    const path = urlOrPath.split(marker)[1]?.split("?")[0];
    return path ? decodeURIComponent(path) : null;
  }
  return /^https?:\/\//i.test(urlOrPath) ? null : urlOrPath; // ya es una ruta
}
