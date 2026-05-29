// Gráfica de línea SVG minimalista — sin dependencias externas.
// Usada en gráficas de progreso (peso, % grasa, perímetros) e historial de cargas.

export type ChartPoint = { label: string; value: number };

interface MiniChartProps {
  data: ChartPoint[];
  color?: string;
  unit?: string;
  /** Alto en px del área SVG (default 90) */
  height?: number;
  /** Mostrar todos los dots o solo el primero/último (default false = todos) */
  sparse?: boolean;
  /** Modo sparkline: sin cabecera, sin ejes, padding mínimo */
  hideLabels?: boolean;
}

export default function MiniChart({
  data,
  color = "#C0394F",
  unit = "",
  height = 90,
  sparse = false,
  hideLabels = false,
}: MiniChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-neutral-700 text-xs">Faltan más datos para mostrar la gráfica</p>
      </div>
    );
  }

  const W = 320;
  const H = height;
  const PAD = hideLabels
    ? { top: 4, right: 4, bottom: 4, left: 4 }
    : { top: 10, right: 18, bottom: 22, left: 36 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const vals = data.map(d => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * iW;
  const toY = (v: number) => PAD.top + iH - ((v - minV) / range) * iH;

  const polyline = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`).join(" ");
  const areaClose = `${toX(data.length - 1).toFixed(1)},${(PAD.top + iH).toFixed(1)} ${PAD.left},${(PAD.top + iH).toFixed(1)}`;
  const area = polyline + " " + areaClose;

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const diff = last.value - prev.value;
  const trend = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
  const trendColor = trend === "↑" ? "#4ADE80" : trend === "↓" ? "#F87171" : "#FBBF24";

  // Valor medio para la 2ª línea de grid
  const midV = (minV + maxV) / 2;

  // gradId único por color para evitar colisiones cuando hay varios charts en la misma página
  const gradId = `mcg-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="w-full">
      {/* Cabecera: rango y último valor (solo modo normal) */}
      {!hideLabels && (
        <div className="flex justify-between items-center px-1 mb-1">
          <span className="text-[10px] text-neutral-600">{data[0].label}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: trendColor }}>
            {last.value.toFixed(1)}{unit}&nbsp;{trend}
          </span>
          <span className="text-[10px] text-neutral-600">{last.label}</span>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height, display: "block" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines (solo modo normal) */}
        {!hideLabels && [minV, midV, maxV].map((v, gi) => {
          const y = toY(v);
          return (
            <g key={gi}>
              <line
                x1={PAD.left} y1={y} x2={PAD.left + iW} y2={y}
                stroke="#2A2A2A" strokeWidth="1" strokeDasharray="2,4"
              />
              <text
                x={PAD.left - 4} y={y + 3.5}
                textAnchor="end" fill="#555" fontSize="8" fontFamily="monospace"
              >
                {v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={area} fill={`url(#${gradId})`} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none" stroke={color} strokeWidth={hideLabels ? "2.5" : "2"}
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const isFirst = i === 0;
          if (sparse && !isFirst && !isLast) return null;
          if (hideLabels && !isLast) return null; // sparkline: solo dot final
          const cx = toX(i);
          const cy = toY(d.value);
          return (
            <g key={i}>
              {isLast && (
                <circle cx={cx} cy={cy} r={hideLabels ? 5 : 7} fill={color} opacity="0.2" />
              )}
              <circle
                cx={cx} cy={cy}
                r={isLast ? (hideLabels ? 3 : 4) : 2.5}
                fill={isLast ? color : "#111"}
                stroke={color} strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* Etiquetas X: primera y última (solo modo normal) */}
        {!hideLabels && <>
          <text x={PAD.left} y={H - 4} textAnchor="middle" fill="#444" fontSize="8">
            {data[0].label}
          </text>
          <text x={PAD.left + iW} y={H - 4} textAnchor="middle" fill="#444" fontSize="8">
            {last.label}
          </text>
        </>}
      </svg>
    </div>
  );
}
