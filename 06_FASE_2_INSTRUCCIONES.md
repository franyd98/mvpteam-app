# Fase 2 — Instrucciones para Fran

Vamos a hacer que la app permita registrar peso, reps y RPE de cada serie, con guardado automático en localStorage. No hace falta `npm install` extra, todo se hace con lo que ya tienes.

## Resumen de cambios

| Archivo | Acción | Qué hace |
|---|---|---|
| `src/types.ts` | **Sobreescribir** | Añade los tipos para SetLog y Settings |
| `src/storage.ts` | **Crear nuevo** | Lee/guarda en localStorage del navegador |
| `src/components/SetLogger.tsx` | **Crear nuevo** | Modal con teclado numérico tipo Hevy |
| `src/components/SettingsPanel.tsx` | **Crear nuevo** | Panel de ajustes (kg/lb) |
| `src/App.tsx` | **Sobreescribir** | Integra todo lo anterior |

## Proceso paso a paso

Tienes dos opciones, elige la que prefieras:

### Opción A — Arrastrar los archivos (más rápido)

1. En el panel de Cowork, descárgate los 5 archivos que te he presentado a la izquierda.
2. Llévalos a las rutas correspondientes dentro de tu proyecto (`fitness-app/`):
   - `types.ts` → `fitness-app/src/types.ts` (reemplaza al existente).
   - `storage.ts` → `fitness-app/src/storage.ts` (nuevo).
   - `SetLogger.tsx` → `fitness-app/src/components/SetLogger.tsx` (nuevo).
   - `SettingsPanel.tsx` → `fitness-app/src/components/SettingsPanel.tsx` (nuevo).
   - `App.tsx` → `fitness-app/src/App.tsx` (reemplaza al existente).
3. Cuando reemplaces los existentes, macOS te preguntará "¿Sustituir?". Di que sí.

### Opción B — Copiar y pegar en VS Code (más educativo)

Para cada archivo:

1. En VS Code, abre el archivo (`Cmd + P`, escribes el nombre, Enter).
2. Si es **nuevo**: clic derecho sobre la carpeta correspondiente en el árbol lateral → "New File". Le pones el nombre.
3. Selecciona todo el contenido actual (`Cmd + A`) y borra (`Delete`).
4. Abre el archivo correspondiente en Cowork, copia todo (`Cmd + A`, `Cmd + C`).
5. Pega en VS Code (`Cmd + V`) y guarda (`Cmd + S`).

## Después de reemplazar los archivos

Vuelve a la terminal donde tienes `npm run dev` corriendo. Vite recarga solo. **Recarga el navegador** una vez con `Cmd + R` para asegurar.

Deberías ver:

- Cabecera con un botón **⚙** arriba a la derecha (ajustes).
- Las series del ejercicio ahora son **botones grandes** que ponen "Registrar →".
- Al pulsar uno, se abre un modal con teclado numérico.
- Eliges peso → escribes con el teclado del modal. Cambias a Reps. Cambias a RPE. Le das a "Guardar".
- La serie se queda en verde y muestra "Xkg × Y reps · RPE Z".
- Cierras el navegador, lo vuelves a abrir → **los datos siguen ahí**.
- El botón ⚙ te permite cambiar entre kg y lb.

## Si algo falla

- **Página en blanco** o error rojo en pantalla → abre la consola del navegador (`Cmd + Opt + J` en Chrome) y pégame el mensaje de error.
- **VS Code subraya cosas en rojo** → puede ser un import roto. Pégame el error que sale al pasar el ratón sobre el subrayado.
- **El modal no se abre al pulsar la serie** → mira la consola del navegador igualmente.

Cuando lo tengas funcionando, dímelo y empezamos la Fase 3 (cronómetro de descanso) o Fase 4 (historial), tú decides.

## Lo que aprendes con esta fase

- **`useState`** múltiple en un componente (día, microciclo, qué serie estás editando).
- **`useEffect`** para sincronizar estado con localStorage.
- **Hook personalizado** (`useLogs`, `useSettings`) — funciones que empaquetan lógica reutilizable.
- **Composición de componentes**: App contiene ExerciseCard, que dispara abrir SetLogger.
- **Eventos del navegador** (cerrar con Escape).
- **Patrón "modal"**: superposición con `fixed inset-0`.
- **Persistencia en cliente** sin backend: localStorage.
