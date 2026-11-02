
-- Diagnóstico de fotos de check-in (solo lectura).
-- Para cada foto de franvyother: ¿existe el archivo? ¿está en SU carpeta?
-- (el permiso nuevo solo deja al cliente ver fotos de la carpeta con su id)

SELECT
  cp.taken_at                                         AS fecha,
  o.name                                              AS archivo_en_storage,
  CASE WHEN o.name IS NULL THEN '❌ el archivo NO existe en Storage'
       WHEN (storage.foldername(o.name))[1] = cp.client_id::text THEN '✓ en su carpeta'
       ELSE '⚠️ en otra carpeta: el cliente no puede verla' END AS estado,
  cp.url                                              AS url_guardada
FROM public.checkin_photos cp
JOIN public.profiles p ON p.id = cp.client_id
LEFT JOIN storage.objects o
  ON o.bucket_id = 'checkin-photos'
 AND cp.url LIKE '%/checkin-photos/' || o.name
WHERE p.full_name ILIKE '%franvyother%'
ORDER BY cp.taken_at DESC;
