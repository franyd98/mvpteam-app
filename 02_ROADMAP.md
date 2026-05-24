# Roadmap del proyecto

## Qué vamos a construir, en una frase

Una app web (y más adelante móvil) que reemplace el Excel de entrenamiento: ver la rutina del día, registrar peso/reps/RPE de cada serie, cronómetro de descanso, historial entre semanas. Después, multiusuario para que tu entrenador la use con todos sus clientes.

## Las fases

### Fase 0 — Preparar el entorno (hoy, 30-60 min)

Instalar Node.js, configurar VS Code y abrir el proyecto. **No se programa nada.** El objetivo es que `npm run dev` arranque la app sin errores.

Resultado: ves la rutina cargada en el navegador.

### Fase 1 — Visualizar la rutina (1-2 días)

La app ya muestra tu rutina (esto te lo dejo hecho en el esqueleto). En esta fase, tú aprendes leyendo el código:
- Cambiar textos
- Cambiar colores con Tailwind
- Entender qué es un "componente" de React

Resultado: te sientes cómodo tocando el código.

### Fase 2 — Registrar series (3-5 días)

Añadimos campos para escribir el peso y las reps reales de cada serie, y un selector de RPE. Lo guardamos en `localStorage` (memoria del navegador). Cierras y vuelves a abrir, y los datos siguen ahí.

Resultado: ya puedes usar la app en el gimnasio en vez del Excel.

### Fase 3 — Cronómetro de descanso (1-2 días)

Botón "serie hecha" → arranca un timer con notificación al terminar. Pequeño pero útil.

Resultado: dejas de mirar el reloj.

### Fase 4 — Historial y comparativa (3-5 días)

Cuando arrancas un ejercicio, te muestra "la semana pasada hiciste X kg × Y reps en este mismo ejercicio". Aquí entra de verdad el valor del programa: ver progresión.

Resultado: tienes datos para progresar de forma informada.

### Fase 5 — Multiusuario y nube (1-2 semanas)

Aquí migramos los datos del navegador a Supabase (servicio que te da login, base de datos en la nube y backend sin programar backend, tier gratuito generoso). Tu entrenador podrá crear rutinas, asignarlas a clientes, y ver el histórico de cada uno.

Resultado: dejas de ser el único usuario. Empieza a ser un producto.

### Fase 6 — App móvil iOS y Android (1 semana)

Empaquetamos la web como app móvil con Capacitor. Misma base de código, dos apps. Tiendas: App Store (Apple, requiere cuenta de developer, 99 USD/año) y Google Play (Google, 25 USD una sola vez).

Resultado: app instalable en el móvil.

## Stack técnico y por qué

**Frontend: React + Vite + TypeScript + Tailwind CSS.**

| Pieza | Qué es | Por qué |
|-------|--------|---------|
| React | Librería para construir interfaces. Lo más usado del mundo. | Comunidad enorme, mil tutoriales en español, demanda laboral si quieres usar esto profesionalmente. |
| Vite | Herramienta que arranca el proyecto y recarga al guardar. | Mucho más rápido que las alternativas. Configuración mínima. |
| TypeScript | JavaScript + tipos. Te avisa de errores antes de ejecutar. | Curva inicial pero ahorra horas a partir de la semana 2. |
| Tailwind CSS | Estilos con clases en el HTML (`text-blue-500`, `p-4`, etc.) | Diseñas rápido sin pelearte con CSS. |

**Datos al principio: localStorage.** Cero coste, cero servidores. Suficiente para uso personal.

**Datos en multiusuario: Supabase.** Te da auth (login con email/Google), base de datos PostgreSQL y APIs automáticas. Tier gratuito cubre cientos de usuarios. Migramos cuando llegue la Fase 5.

**Móvil al final: Capacitor.** Coge tu web y la envuelve para iOS/Android sin reescribir.

## Alternativas que descarté y por qué

- **React Native** (mismo lenguaje pero app móvil "nativa"): mejor rendimiento, pero más curva y trabajo doble si quieres web + móvil. Capacitor es más razonable para empezar.
- **Flutter** (Google, lenguaje Dart): excelente, pero te obligaría a aprender un lenguaje extra.
- **Bubble/Glide (no-code)**: arranque rápido, pero techo bajo. Cuando quieras lógica fina (cálculos de RPE, periodización, etc.), te bloquea. Y tu entrenador como cliente serio va a querer más control.
- **Angular/Vue**: igual de buenas que React técnicamente, pero menos recursos y trabajo si quieres llevarlo a serio.

## Cuándo te bloqueas y cuándo no

Estos hitos son señales de que vas bien:

- Tras Fase 0: el navegador abre la app, aunque no sepas qué hace por dentro.
- Tras Fase 1: cambias el título de la página tú solo.
- Tras Fase 2: usas la app en el gimnasio una sesión entera.
- Tras Fase 4: borras el Excel del escritorio (o lo guardas como histórico).

Si en una fase tardas el doble de lo estimado, no es problema. Programar al principio es lento. Lo importante es no saltarse fases.

## Costes esperados

- Fases 0-4: **0 €**. Todo local, todo gratis.
- Fase 5 (Supabase): **0 €** mientras esté en tier gratuito. Si crece mucho, ~25 USD/mes.
- Fase 6 (móvil): **99 USD/año** Apple + **25 USD una vez** Google. Solo si llegas a publicar en tiendas.
- Dominio web propio (opcional): **~10 €/año**.
- Hosting web: **0 €** con Vercel o Netlify (sus planes gratis bastan).
