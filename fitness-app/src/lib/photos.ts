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

import { DB_ERROR_EVENT, supabase } from "./supabase";
import { PHOTO_BUCKET, photoPath } from "./photoPath";

export { PHOTO_BUCKET, photoPath };

const SIGNED_URL_SECONDS = 60 * 60; // 1 hora


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
    const failed: string[] = [];
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
      else if (item.path) failed.push(`${item.path}: ${item.error ?? "sin permiso"}`);
    }
    // Avisar en pantalla (antes solo iba a la consola y la foto salía rota sin explicación)
    if (error || failed.length > 0) {
      const detail = error ? error.message : `${failed.length} de ${toSign.length} fotos (${failed[0]})`;
      console.error("No se pudieron firmar las fotos:", error ?? failed);
      window.dispatchEvent(new CustomEvent(DB_ERROR_EVENT, {
        detail: { message: `No se pudieron cargar las fotos: ${detail}`, offline: false },
      }));
    }
  }
  return photos.map((p, i) => {
    const path = paths[i];
    return { ...p, storage_url: p.url, url: (path && signed.get(path)) || p.url };
  });
}
