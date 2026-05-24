# Fase 0 — Primera ejecución

Antes de empezar, asegúrate de haber terminado `03_INSTALACION.md`. Si `node -v` no devuelve un número, vuelve allí.

## Paso 1 — Coloca el proyecto donde quieras trabajar

Decide una carpeta para tus proyectos. Por ejemplo `~/Documents/proyectos`. Crea esa carpeta si no existe (en Finder, botón derecho → Nueva carpeta).

Mueve la carpeta `fitness-app/` (la que está dentro de esta carpeta de Cowork) a `~/Documents/proyectos/`. Puedes arrastrarla con el Finder.

Recomendación: mueve también `data/program.json` y los `.md` a esa misma carpeta padre, así tienes todo junto.

## Paso 2 — Abre el proyecto en VS Code

1. Abre VS Code.
2. Menú **Archivo → Abrir carpeta...** (o `Cmd + O`).
3. Selecciona la carpeta `fitness-app`.

Verás en la barra lateral izquierda la estructura del proyecto.

## Paso 3 — Abre la terminal integrada

En VS Code: menú **Terminal → Nuevo Terminal** (o `Ctrl + ñ`). Se abre una terminal abajo, ya situada en la carpeta del proyecto.

## Paso 4 — Instala las dependencias

En esa terminal de VS Code escribe:

```bash
npm install
```

Y pulsa Enter. Esto descarga las librerías que el proyecto necesita (React, Vite, Tailwind, etc.). Tarda 1-3 minutos la primera vez. Se crea una carpeta `node_modules/` (no te preocupes si pesa mucho, es normal y no se sube nunca a ningún sitio).

**Posibles avisos:** verás texto sobre "warnings" o "vulnerabilities". **Ignóralos por ahora.** Lo importante es que no salga un "ERROR" rojo grande al final.

## Paso 5 — Arranca el servidor de desarrollo

```bash
npm run dev
```

Verás algo como:

```
  VITE v5.4.x  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Paso 6 — Abre el navegador

Mantén pulsada la tecla `Cmd` y haz clic en `http://localhost:5173/` en la terminal. O cópialo y pégalo en tu navegador.

Deberías ver:

- El título "Bloque 5 - Fran Villar".
- Botones de día (Tirón, Cuádriceps, Empuje, Femoral/Glúteo, Repaso Torso).
- Botones del 1 al 8 (microciclos).
- La lista de ejercicios del día y microciclo seleccionado.

**Prueba a hacer clic en los días y los microciclos.** La lista cambia. Eso es React reaccionando a tu click.

## Paso 7 — Prueba la magia del "hot reload"

Sin cerrar el navegador, vuelve a VS Code. Abre `src/App.tsx`.

Busca la línea:

```tsx
<h1 className="text-2xl sm:text-3xl font-bold text-white">
  {program.programName}
</h1>
```

Cambia `{program.programName}` por `"Mi entreno"` (con las comillas dobles).

Guarda con `Cmd + S`.

Mira el navegador. **Sin recargar la página, el título ha cambiado.** Esto es Vite recargando en caliente. Programar con esto es adictivo.

Cuando termines de jugar, deshaz el cambio (Cmd + Z) y guarda otra vez.

## Paso 8 — Cuando termines de trabajar

En la terminal donde corre `npm run dev`, pulsa `Ctrl + C` para pararlo. Cierra VS Code tranquilo, nada se pierde.

Cuando vuelvas a trabajar: abrir VS Code en la carpeta → terminal → `npm run dev`.

## Si algo falla

- "command not found: npm" → no se instaló bien Node, vuelve a `03_INSTALACION.md`.
- "Cannot find module './data/program.json'" → no copiaste bien el archivo. Asegúrate de que `src/data/program.json` existe dentro de `fitness-app/`.
- "Port 5173 is already in use" → ya tienes otra app corriendo. Pulsa `Ctrl + C` en esa terminal o usa el puerto que te ofrezca como alternativa.
- Otro error → copia el mensaje TAL CUAL y pásamelo.

## Has completado la Fase 0 y la Fase 1

Tu app arranca, muestra tu rutina y reacciona a tus clicks. **Es un hito real.**

Cuando estés aquí, dímelo y empezamos la Fase 2: registrar peso, reps y RPE de cada serie.
