# Fase 0 — Instalación (Mac)

Objetivo: tener Node.js funcionando y VS Code listo. No vamos a programar todavía.

Si en algún paso falla algo, copia el mensaje de error tal cual y pásamelo.

## Paso 1 — Comprobar si ya tienes Node.js

Abre la app **Terminal** (búscala con Cmd+Espacio, escribes "Terminal").

Escribe esto y pulsa Enter:

```bash
node -v
```

- Si te sale algo como `v20.x.x` o `v22.x.x` (cualquier número >= 18): **ya tienes Node, salta al Paso 3**.
- Si te dice "command not found", sigue al Paso 2.

## Paso 2 — Instalar Node.js

La forma más fácil es con el instalador oficial.

1. Abre [https://nodejs.org](https://nodejs.org) en tu navegador.
2. Descarga la versión **LTS** (la que no dice "Current"). Es el botón grande de la izquierda.
3. Abre el archivo `.pkg` descargado y sigue el instalador (Siguiente, Siguiente, Instalar).
4. **Cierra la Terminal y vuelve a abrirla** (importante, si no no detecta Node).
5. Vuelve a probar:

```bash
node -v
npm -v
```

Las dos órdenes deben darte un número de versión. Si es así, perfecto.

## Paso 3 — Configurar VS Code

Abre VS Code. Vamos a instalar 3 extensiones que te van a ahorrar mucho tiempo.

Pulsa el icono de los cuadraditos en la barra lateral izquierda (o `Cmd+Shift+X`). Eso abre el panel de extensiones.

Busca e instala una por una:

1. **ES7+ React/Redux/React-Native snippets** (de "dsznajder"). Atajos para escribir React más rápido.
2. **Tailwind CSS IntelliSense** (de "Tailwind Labs"). Autocompleta clases de Tailwind.
3. **Prettier - Code formatter** (de "Prettier"). Formatea tu código automáticamente.

Opcional pero recomendada: **GitLens** (de "GitKraken"). Útil cuando lleguemos a Git.

## Paso 4 — Configurar Prettier para que formatee al guardar

En VS Code:

1. Pulsa `Cmd + ,` para abrir Ajustes.
2. Arriba a la derecha verás un icono que parece un archivo con una flecha. Es "Abrir Ajustes (JSON)". Pulsa.
3. Te abre un archivo `settings.json`. Asegúrate de que dentro de las llaves `{}` esté esto (si el archivo está vacío, déjalo así):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

Si ya tenías cosas dentro, añade esas dos líneas separándolas por comas. Guarda con `Cmd+S`.

## Paso 5 — Verificar la Terminal integrada de VS Code

En VS Code: menú **Terminal → Nuevo Terminal** (o `Ctrl + ñ`). Se abre una terminal abajo. Prueba ahí también:

```bash
node -v
npm -v
```

Te debe dar las mismas versiones que en Terminal. Si va, perfecto.

## Listo

Has terminado la Fase 0. Ya tienes:

- Node.js + npm funcionando.
- VS Code con las extensiones útiles.
- Prettier formateando al guardar.

Pasa a **04_PRIMERA_EJECUCION.md**.
