interface SpotlightOverlayProps {
  rect: DOMRect | null;
  visible: boolean;
}

export function SpotlightOverlay({ rect, visible }: SpotlightOverlayProps) {
  if (!visible || !rect) return null;

  const padding = 12;
  const borderRadius = 12;
  const x = rect.left - padding;
  const y = rect.top - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;

  return (
    <svg
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        zIndex: 99998, pointerEvents: 'none',
        opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
      }}
    >
      <defs>
        <mask id="vektrus-spotlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={borderRadius} ry={borderRadius} fill="black" />
        </mask>
      </defs>

      <rect
        x="0" y="0" width="100%" height="100%"
        fill="rgba(0, 20, 40, 0.55)"
        mask="url(#vektrus-spotlight-mask)"
      />

      <rect
        x={x - 2} y={y - 2} width={w + 4} height={h + 4}
        rx={borderRadius + 2} ry={borderRadius + 2}
        fill="none" stroke="#49B7E3" strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 10px rgba(73, 183, 227, 0.35))' }}
      >
        <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2.5s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
