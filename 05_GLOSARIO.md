# Glosario sin tecnicismos

Lo que no entiendas, búscalo aquí. Si falta algo, pregúntame.

**Node.js** — Programa que sabe ejecutar JavaScript fuera del navegador. Necesario para que nuestras herramientas de desarrollo funcionen.

**npm** — "Node Package Manager". Es el almacén de librerías de JavaScript. Cuando escribes `npm install` se descargan las que el proyecto declara que necesita.

**package.json** — El "carnet de identidad" del proyecto. Lista qué librerías usa y qué comandos puedes ejecutar (`dev`, `build`, etc.).

**node_modules/** — Carpeta donde npm guarda todas las librerías descargadas. Suele pesar cientos de MB. **Nunca se sube** a internet (por eso está en `.gitignore`).

**Vite** — Servidor de desarrollo. Cuando ejecutas `npm run dev`, Vite levanta una web local en `localhost:5173` y se ocupa de recargar el navegador cuando guardas un cambio.

**React** — Librería para construir interfaces. La idea principal: troceas tu pantalla en "componentes" (botones, tarjetas, listas) y los combinas como piezas de Lego.

**Componente** — Una función que devuelve HTML (en realidad JSX). Ejemplo: `ExerciseCard` en `App.tsx` es un componente que pinta una tarjeta de ejercicio.

**JSX** — La mezcla de HTML y JavaScript que ves dentro de `App.tsx`. `<div>{variable}</div>` significa "pinta un div con el contenido de esta variable".

**Estado (`useState`)** — Datos del componente que pueden cambiar (qué día está seleccionado, qué peso ha metido el usuario). Cuando cambian, React vuelve a pintar la pantalla.

**Hook** — Funciones de React que empiezan por `use` (`useState`, `useEffect`, `useMemo`). Te dan superpoderes en los componentes.

**TypeScript** — JavaScript con "tipos". Le dices al editor "esto es un número, esto es texto", y te avisa si te equivocas. Curva al principio, ahorra horas después.

**Tailwind CSS** — Sistema de estilos por clases. En vez de escribir CSS aparte, pones `className="text-white bg-black p-4"` en el HTML y queda con texto blanco, fondo negro y padding 4.

**localStorage** — Pequeña memoria del navegador donde podemos guardar datos. Lo usaremos en Fase 2 para que tus pesos/reps no se pierdan al cerrar la pestaña.

**Supabase** — Servicio en la nube que nos da login, base de datos y APIs sin tener que programar un backend. Tier gratuito generoso. Lo usaremos en Fase 5.

**Capacitor** — Herramienta que envuelve una web y la convierte en app de iOS y Android. Fase 6.

**Git** — Sistema para guardar el historial de cambios de tu código (como "Control+Z infinito" y multipersona). Lo introduciremos cuando llegue el momento.

**Repositorio (repo)** — Carpeta de un proyecto controlado por Git.

**GitHub** — Web donde se alojan repos públicos y privados. Hosting de código.

**Frontend** — Lo que ve el usuario (la web, la app, los botones).

**Backend** — Lo que pasa por detrás (base de datos, servidor, lógica). Lo evitamos al principio gracias a localStorage; lo subcontratamos a Supabase en Fase 5.

**Deploy** — Publicar tu app en internet para que cualquiera la abra desde un enlace. Fase 5/6.

**Hot reload** — Magia de Vite: guardas un archivo, el navegador se actualiza solo sin recargar la página entera. Adictivo.

**RPE** — (Tuyo, no técnico) Rate of Perceived Exertion. Lo que ya conoces del Excel. Se lo cuento al código en `types.ts`.

**Microciclo** — (Tuyo, no técnico) Una semana de entreno en tu programación.
