-- Actualizar video_ref en exercises (URLs de YouTube)
-- Pegar en Supabase → SQL Editor

UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=IDiTDQiJG0E' WHERE LOWER(TRIM(name)) = LOWER(TRIM('BANDA REVERSA EN MULTIPOWER'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=eggPWrMrUzA' WHERE LOWER(TRIM(name)) = LOWER(TRIM('ELEVACIONES DE RODILLA EN SUSPENSIÓN'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=Zfmaqq_--EI' WHERE LOWER(TRIM(name)) = LOWER(TRIM('ESCÁPULA- JALÓN UNILATERAL EN LA MULTIESTACIÓN PLANO ESCAPULAR'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=o5yMF4zqNcY' WHERE LOWER(TRIM(name)) = LOWER(TRIM('ESCÁPULAS- ELEVACIONES EN Y CON BANDA'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=veWelYl2FAI' WHERE LOWER(TRIM(name)) = LOWER(TRIM('ESCÁPULAS- ELEVACIONES EN Y EN CRUCE DE POLEAS BILATERAL'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=JagtCmldBs8' WHERE LOWER(TRIM(name)) = LOWER(TRIM('ESCÁPULAS- ELEVACIÓN EN Y UNILATERAL DESDE POLEA MEDIA'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=-KKrbyenNpM' WHERE LOWER(TRIM(name)) = LOWER(TRIM('ESCÁPULAS- JALÓN BILATERAL DESDE POLEA ALTA BANCO A 75'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=qc_NTe6cK1s' WHERE LOWER(TRIM(name)) = LOWER(TRIM('GEMELO PRENSA 45°'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=5klhQmzSDv8' WHERE LOWER(TRIM(name)) = LOWER(TRIM('Gemelo Unilateral de pie con mancuerna sobre step'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=_5jWQUcGiMA' WHERE LOWER(TRIM(name)) = LOWER(TRIM('Gemelo Unilateral de pie sobre step en multipower '));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=C_DBBIaIbSA' WHERE LOWER(TRIM(name)) = LOWER(TRIM('Híbrido remo y hombro posterior'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=Z1om7ohdSfo' WHERE LOWER(TRIM(name)) = LOWER(TRIM('Pájaros de pie con mancuernas agarre prono'));
UPDATE exercises SET video_ref = 'https://www.youtube.com/watch?v=FMj_f5JNGl8' WHERE LOWER(TRIM(name)) = LOWER(TRIM('Remo unilateral desde polea media sentado de lado'));
