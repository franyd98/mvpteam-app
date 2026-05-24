# Fitness App — Bloque 5

App web para sustituir el Excel de entrenamiento. Construida con React + Vite + TypeScript + Tailwind.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre el navegador en la URL que te muestre Vite (suele ser `http://localhost:5173`).

## Estructura

```
src/
├── App.tsx           ← componente principal (lo que se ve en pantalla)
├── main.tsx          ← arranque de React (no tocar)
├── index.css         ← estilos globales (Tailwind)
├── types.ts          ← tipos de los datos (Program, Day, Exercise, Set)
├── data/
│   └── program.json  ← la rutina (Excel convertido)
└── components/       ← componentes auxiliares (ahora vacío, lo llenamos en fases siguientes)
```

## Próximos pasos

Mira `02_ROADMAP.md` en la carpeta padre. La fase actual es la 1 (visualizar la rutina).
