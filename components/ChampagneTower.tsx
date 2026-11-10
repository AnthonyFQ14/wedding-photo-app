type Props = {
  className?: string;
};

// One coupe glass, drawn as a thin outline (like the invitation art).
function Coupe({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* rim */}
      <ellipse cx="0" cy="0" rx="26" ry="5" />
      {/* bowl */}
      <path d="M-26 0 C-24 16 -10 22 0 22 C10 22 24 16 26 0" />
      {/* bubbles */}
      <circle cx="-9" cy="8" r="1.3" />
      <circle cx="4" cy="11" r="1.1" />
      <circle cx="12" cy="6" r="1.3" />
      {/* stem + foot */}
      <path d="M0 22 L0 48" />
      <ellipse cx="0" cy="50" rx="12" ry="2.6" />
    </g>
  );
}

export function ChampagneTower({ className }: Props) {
  // Three tiers: 3 / 2 / 1 glasses, each tier resting on the one below.
  const tiers = [
    { y: 128, xs: [-56, 0, 56] },
    { y: 76, xs: [-28, 28] },
    { y: 24, xs: [0] },
  ];
  return (
    <svg
      viewBox="-100 -40 200 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* bottle pouring into the top glass */}
      <g transform="rotate(-38 -40 -20)">
        <path d="M-70 -30 L-40 -30 L-34 -26 L-20 -26 L-20 -14 L-34 -14 L-40 -10 L-70 -10 Z" />
        <path d="M-24 -26 L-24 -14" />
      </g>
      <path d="M-6 -2 C-4 6 -2 12 0 22" strokeDasharray="2 4" />
      {tiers.map((t) =>
        t.xs.map((x) => <Coupe key={`${x}-${t.y}`} x={x} y={t.y} />),
      )}
    </svg>
  );
}
