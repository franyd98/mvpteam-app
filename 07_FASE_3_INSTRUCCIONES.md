# Fase 3 — Instrucciones para Fran

Añadimos el cronómetro de descanso. Es la mejora más visible hasta ahora.

## Resumen de cambios

| Archivo | Acción | Por qué |
|---|---|---|
| `src/types.ts` | **Sobreescribir** | Añade `restSeconds` y `autoStartRestTimer` a Settings |
| `src/storage.ts` | **Sobreescribir** | Defaults actualizados (150s = 2:30, auto-on) |
| `src/components/RestTimer.tsx` | **Crear nuevo** | La barra flotante del cronómetro |
| `src/components/SettingsPanel.tsx` | **Sobreescribir** | Controles de duración y auto-arranque |
| `src/App.tsx` | **Sobreescribir** | Arranca el timer al guardar serie, lo pinta abajo |

`src/components/SetLogger.tsx` **no se toca**, sigue igual que en la Fase 2.

## Pasos

1. Reemplaza los 5 archivos en tu proyecto (arrastrar o copiar-pegar, como en Fase 2).
2. Si `npm run dev` sigue corriendo, Vite recarga solo. Si no, vuelve a arrancarlo.
3. Recarga el navegador.

## Qué deberías ver

- Una nueva opción en el icono ⚙ : "Descanso por defecto" con 6 opciones (1:00 a 4:00).
- Un nuevo interruptor: "Arrancar cronómetro al guardar".
- Un **nuevo icono ⏱** en la cabecera junto al ⚙: arranca el cronómetro manualmente.
- Cuando guardas una serie con el auto-arranque activado: **aparece una barra flotante abajo** con:
  - Tiempo grande (mm:ss).
  - Botones `−15`, `+15` para ajustar sobre la marcha.
  - Botón `⤼` para saltar (cierra la barra).
- Mientras corre, una **línea blanca arriba de la barra** se va vaciando: progreso visual.
- Al llegar a 0:
  - **Pitido doble** (lo genera el navegador, no necesita ningún archivo).
  - **Vibración** si lo abres desde el móvil.
  - La barra se pone **verde** con "¡Descanso terminado!" y un ✓.
  - Auto-cierra después de 6 segundos si no la cierras tú.

## Cosas que puedes probar

- Saltar a 5 segundos restantes con `−15` repetido y comprobar el pitido.
- Abrir la app desde el móvil (en el navegador móvil, conectado a la misma WiFi, escribiendo `http://<IP-de-tu-Mac>:5173`) → debería vibrar al terminar.
- Cambiar la duración en ⚙ y comprobar que la siguiente serie usa la nueva.
- Desactivar "Arrancar cronómetro al guardar" → comprobar que ya no salta solo, pero el botón ⏱ sigue funcionando.

## Si algo falla

- **No se oye el pitido**: muchos navegadores bloquean audio si no has interactuado nunca con la página. Si pulsas cualquier botón antes (por ejemplo, abrir el ⚙ y cerrarlo), debería habilitarse. Esto es una restricción del navegador, no un bug.
- **No vibra en el móvil**: iOS no soporta `navigator.vibrate()` en Safari (decisión de Apple). En Android Chrome sí funciona. Es una limitación de la plataforma, no algo que pueda arreglar en código.
- **Página en blanco** tras guardar archivos: abre consola del navegador (`Cmd + Opt + J`) y pásame el error en rojo.

## Aprendizajes de esta fase

- **`setInterval` y limpieza con `useEffect`**: cómo "agendar" código que se repite y cómo cancelarlo cuando el componente se va.
- **`useRef`**: una "caja" que persiste entre renders sin disparar re-render. La usamos para no pitar dos veces.
- **APIs del navegador**: `navigator.vibrate`, `AudioContext` (síntesis de audio).
- **Componentes "controlados desde fuera"**: el RestTimer no decide cuándo aparece, lo decide el padre vía props.
- **Patrón "barra fija"**: `fixed inset-x-0 bottom-0 z-40` con `pointer-events-none` en el contenedor y `pointer-events-auto` en el contenido (truco para que solo la barra reciba clics, no toda la franja).

Cuando funcione, dímelo y vamos a por la **Fase 4 (historial entre microciclos)**, que es donde el tracking empieza a dar valor de verdad.
