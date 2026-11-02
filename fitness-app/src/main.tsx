// Punto de entrada de la app. Aquí React "se engancha" al div#root del index.html.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Si se publica una versión nueva mientras alguien tiene la app abierta, al cambiar
// de pantalla podría pedir un trozo de código que ya no existe → pantalla en blanco.
// En ese caso recargamos UNA vez para coger la versión nueva.
window.addEventListener("vite:preloadError", (event) => {
  const KEY = "mvp_reloaded_after_deploy";
  if (sessionStorage.getItem(KEY)) return;          // evitar bucle de recargas
  sessionStorage.setItem(KEY, "1");
  event.preventDefault();
  window.location.reload();
});

// App instalable + abre sin cobertura (solo en producción, no en desarrollo)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("SW no registrado:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
