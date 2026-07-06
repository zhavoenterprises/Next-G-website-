// Abstract architectural hero visual — pure SVG, no image dependencies.
// Renders isometric-ish tower silhouettes with blueprint markings.
export function HeroVisual() {
  return (
    <svg viewBox="0 0 600 520" className="h-full w-full" role="img" aria-label="Architectural blueprint of a modern tower">
      <defs>
        <linearGradient id="towerFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F1B4D" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0D0B1F" stopOpacity="0.4" />
        </linearGradient>
        <pattern id="heroGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#F5A623" strokeOpacity="0.08" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="520" fill="url(#heroGrid)" />

      {/* Ground line */}
      <line x1="20" y1="460" x2="580" y2="460" stroke="#F5A623" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 6" />

      {/* Back tower */}
      <rect x="120" y="140" width="140" height="320" fill="url(#towerFill)" stroke="#F5A623" strokeOpacity="0.5" strokeWidth="1" />
      {/* Front tower */}
      <rect x="240" y="90" width="180" height="370" fill="url(#towerFill)" stroke="#E8622C" strokeWidth="1.2" />
      {/* Side building */}
      <rect x="410" y="220" width="120" height="240" fill="url(#towerFill)" stroke="#F5A623" strokeOpacity="0.5" strokeWidth="1" />

      {/* Windows grid front */}
      {Array.from({ length: 12 }).map((_, r) =>
        Array.from({ length: 5 }).map((_, c) => (
          <rect
            key={`f-${r}-${c}`}
            x={252 + c * 32}
            y={106 + r * 28}
            width="20"
            height="16"
            fill="#F5A623"
            fillOpacity={((r + c) % 3 === 0) ? 0.55 : 0.15}
          />
        ))
      )}

      {/* Corner tick — top left */}
      <g stroke="#E8622C" strokeWidth="1.5">
        <line x1="30" y1="40" x2="70" y2="40" />
        <line x1="30" y1="40" x2="30" y2="80" />
      </g>
      {/* Corner tick — bottom right */}
      <g stroke="#E8622C" strokeWidth="1.5">
        <line x1="570" y1="480" x2="530" y2="480" />
        <line x1="570" y1="480" x2="570" y2="440" />
      </g>

      {/* Dimension line */}
      <g stroke="#F5A623" strokeOpacity="0.7" strokeWidth="0.8">
        <line x1="240" y1="70" x2="420" y2="70" />
        <line x1="240" y1="65" x2="240" y2="75" />
        <line x1="420" y1="65" x2="420" y2="75" />
      </g>
      <text x="330" y="62" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#F5A623">
        48.8K SQ.FT
      </text>

      {/* Labels */}
      <text x="30" y="500" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#F5A623" opacity="0.7">
        NG · MADURAI · 2020—2026
      </text>
      <text x="570" y="500" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#F5A623" opacity="0.7">
        SHEET 01/34
      </text>
    </svg>
  );
}
