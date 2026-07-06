// Auto-generated technical site plan sketch — proportional to plot dimensions.
export function PlotSketch({
  lengthFt,
  breadthFt,
  color = "#1F1B4D",
  accent = "#E8622C",
}: {
  lengthFt: number;
  breadthFt: number;
  color?: string;
  accent?: string;
}) {
  const pad = 44;
  const maxW = 360;
  const maxH = 220;
  const scale = Math.min(maxW / lengthFt, maxH / breadthFt);
  const w = lengthFt * scale;
  const h = breadthFt * scale;
  const vbW = w + pad * 2;
  const vbH = h + pad * 2;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-auto" role="img" aria-label={`${lengthFt}ft by ${breadthFt}ft plot sketch`}>
      {/* Blueprint grid */}
      <defs>
        <pattern id={`bpgrid-${lengthFt}-${breadthFt}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke={color} strokeOpacity="0.08" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={vbW} height={vbH} fill={`url(#bpgrid-${lengthFt}-${breadthFt})`} />

      {/* Plot rectangle */}
      <rect x={pad} y={pad} width={w} height={h} fill="none" stroke={color} strokeWidth="1.5" />

      {/* Corner ticks */}
      {[
        [pad, pad], [pad + w, pad], [pad, pad + h], [pad + w, pad + h],
      ].map(([cx, cy], i) => (
        <g key={i} stroke={accent} strokeWidth="1.5">
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} />
        </g>
      ))}

      {/* Length dimension (top) */}
      <g stroke={color} strokeWidth="0.75" fill="none" strokeOpacity="0.8">
        <line x1={pad} y1={pad - 18} x2={pad + w} y2={pad - 18} />
        <line x1={pad} y1={pad - 22} x2={pad} y2={pad - 14} />
        <line x1={pad + w} y1={pad - 22} x2={pad + w} y2={pad - 14} />
      </g>
      <text x={pad + w / 2} y={pad - 24} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={color}>
        {lengthFt} FT
      </text>

      {/* Breadth dimension (right) */}
      <g stroke={color} strokeWidth="0.75" fill="none" strokeOpacity="0.8">
        <line x1={pad + w + 18} y1={pad} x2={pad + w + 18} y2={pad + h} />
        <line x1={pad + w + 14} y1={pad} x2={pad + w + 22} y2={pad} />
        <line x1={pad + w + 14} y1={pad + h} x2={pad + w + 22} y2={pad + h} />
      </g>
      <text
        x={pad + w + 30}
        y={pad + h / 2}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="11"
        fill={color}
        transform={`rotate(90 ${pad + w + 30} ${pad + h / 2})`}
      >
        {breadthFt} FT
      </text>

      {/* Center label */}
      <text x={pad + w / 2} y={pad + h / 2 - 4} textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="13" fontWeight="700" fill={color}>
        SITE PLAN
      </text>
      <text x={pad + w / 2} y={pad + h / 2 + 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={color} opacity="0.6">
        {(lengthFt * breadthFt).toLocaleString("en-IN")} SQ.FT
      </text>
    </svg>
  );
}
