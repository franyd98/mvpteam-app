# Fase 5 — Autenticación + Panel Admin

## Qué hay en esta carpeta

| Archivo | Destino en tu proyecto |
|---|---|
| `.env` | `fitness-app/.env` (raíz, junto a package.json) |
| `src/lib/supabase.ts` | `fitness-app/src/lib/supabase.ts` (crea la carpeta `lib`) |
| `src/App.tsx` | `fitness-app/src/App.tsx` (reemplaza) |
| `src/pages/LoginPage.tsx` | `fitness-app/src/pages/LoginPage.tsx` (crea la carpeta `pages`) |
| `src/pages/AdminPage.tsx` | `fitness-app/src/pages/AdminPage.tsx` |
| `src/pages/FitnessApp.tsx` | `fitness-app/src/pages/FitnessApp.tsx` |

---

## Pasos en orden

### 1. SQL de seguridad en Supabase
SQL Editor → pega `01_SQL_SEGURIDAD.sql` → Run

### 2. Instalar librería de Supabase
En la terminal dentro de `fitness-app`:
```
npm install @supabase/supabase-js
```

### 3. Copiar los archivos según la tabla de arriba

### 4. Crear tu cuenta en Supabase
Supabase → Authentication → Users → **Add user**
Pon tu email (`franyd98@gmail.com`) y una contraseña

### 5. Hacerte admin
SQL Editor → pega `02_SQL_CREAR_ADMIN.sql` → Run

### 6. Arrancar
```
npm run dev
```
Entra con tu email y contraseña → verás el panel admin
