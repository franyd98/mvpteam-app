// Punto de entrada de la app. Aquí React "se engancha" al div#root del index.html.
// No hace falta tocar este archivo casi nunca.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
