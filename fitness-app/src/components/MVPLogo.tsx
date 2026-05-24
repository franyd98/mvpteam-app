// Logo SVG de MVP Team
// M y P grandes · V carmesí fina que pasa por el hueco de la M y el agujero de la P
// La V NO sobresale por encima de las letras

export default function MVPLogo({ size = 64, className = "" }: { size?: number; className?: string }) {
  const w = size * 1.9;
  const h = size;

  // viewBox: margen izquierdo para la flecha (-28), sin espacio extra arriba
  // Todo queda dentro de la altura de las letras (y=24 a y=132)
  return (
    <svg
      width={w}
      height={h}
      viewBox="-28 8 325 140"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MVP Team logo"
    >
      {/* Fondo negro */}
      <rect x="-28" y="8" width="325" height="140" rx="10" fill="#0A0A0A" />

      {/* ── Letras blancas (protagonistas) ── */}
      <text
        x="5" y="132"
        fontFamily="'Arial Black', Impact, Arial, sans-serif"
        fontWeight="900"
        fontSize="105"
        fill="white"
      >M</text>

      <text
        x="163" y="132"
        fontFamily="'Arial Black', Impact, Arial, sans-serif"
        fontWeight="900"
        fontSize="105"
        fill="white"
      >P</text>

      {/* ══ V CARMESÍ — pasa por el hueco de la M y el counter de la P ══
          Restricción: se queda dentro de la altura de las letras (y 25–130)
          La flecha izquierda sale horizontalmente del hueco de la M hacia la izquierda
          La V baja hasta casi el pie de letra entre M y P
          La V sube por el agujero circular de la P hasta su techo (~y=27)
          Pequeño pico y check a la derecha, SIN salir apenas por encima de la P
      */}

      {/* 1. Punta de flecha izquierda (sale del hueco interior de la M hacia la izquierda) */}
      <polygon
        points="-25,66  -4,58  34,58  34,74  -4,74"
        fill="#8B1A2F"
      />

      {/* 2. Cinta V fina: baja por el hueco de la M → fondo V → sube por el agujero de la P */}
      <polyline
        points="34,66  128,124  195,27"
        fill="none"
        stroke="#8B1A2F"
        strokeWidth="13"
        strokeLinejoin="miter"
        strokeMiterlimit="20"
        strokeLinecap="butt"
      />

      {/* 3. Pico pequeño justo en el techo de la P (no sobresale más que las letras) */}
      <polygon
        points="189,24  195,15  201,24"
        fill="#8B1A2F"
      />

      {/* 4. Check fino saliendo a la derecha, ligeramente descendente */}
      <line
        x1="201" y1="28"
        x2="234" y2="56"
        stroke="#8B1A2F"
        strokeWidth="7"
        strokeLinecap="butt"
      />
    </svg>
  );
}

/** Wordmark: logo + "MVP Team" en texto */
export function MVPWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <MVPLogo size={36} />
      <div className="leading-none">
        <span className="text-white font-black text-xl tracking-tight">MVP</span>
        <span className="font-black text-xl tracking-tight" style={{ color: "#8B1A2F" }}> Team</span>
      </div>
    </div>
  );
}
