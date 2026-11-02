// Fotos de check-in con enlaces TEMPORALES.
//
// Antes las fotos se mostraban con su enlace público permanente: con el bucket
// público, cualquiera (incluso sin sesión) podía listar y descargar las fotos de
// todos los clientes. Ahora el bucket es privado y la app pide a Supabase un enlace
// firmado que caduca en 1 hora, y solo se lo da a quien tiene permiso (el propio
// cliente o el admin).
//
// En la base de datos (checkin_photos.url) se sigue guardando el enlace de siempre:
// de él sacamos la ruta del archivo. Así las fotos antiguas funcionan sin migrar nada.

import { supabase } from "./supabase";

export const PHOTO_BUCKET = "checkin-photos";
const SIGNED_URL_SECONDS = 60 * 60; // 1 hora

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

/**
 * Sustituye la url de cada foto por un enlace temporal firmado.
 * Conserva la original en `storage_url` (para poder borrar el archivo después).
 * Si algo falla, deja la url original (no rompe la pantalla).
 */
export async function withSignedUrls<T extends { url: string }>(photos: T[]): Promise<(T & { storage_url: string })[]> {
  const paths = photos.map(p => photoPath(p.url));
  const toSign = [...new Set(paths.filter((p): p is string => !!p))];
  const signed = new Map<string, string>();
  if (toSign.length > 0) {
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(toSign, SIGNED_URL_SECONDS);
    if (error) console.error("No se pudieron firmar las fotos:", error);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }
  return photos.map((p, i) => {
    const path = paths[i];
    return { ...p, storage_url: p.url, url: (path && signed.get(path)) || p.url };
  });
}
