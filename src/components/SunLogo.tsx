interface SunLogoProps {
  size?: number;
  className?: string;
}

const GOLD = '#C8860A';
const GOLD2 = '#E8A020';
const GOLD3 = '#F5C040';

const RAY_COUNT = 18;
const CENTER = 50;
const RAY_INNER = 18;
const RAY_OUTER = 44;

function buildRays() {
  const rays: { x1: number; y1: number; x2: number; y2: number; thick: boolean; color: string }[] = [];
  for (let i = 0; i < RAY_COUNT; i++) {
    const angle = (i * 360) / RAY_COUNT;
    const rad = (angle * Math.PI) / 180;
    rays.push({
      x1: CENTER + RAY_INNER * Math.cos(rad),
      y1: CENTER + RAY_INNER * Math.sin(rad),
      x2: CENTER + RAY_OUTER * Math.cos(rad),
      y2: CENTER + RAY_OUTER * Math.sin(rad),
      thick: i % 2 === 0,
      color: i % 2 === 0 ? GOLD : GOLD2,
    });
  }
  return rays;
}

const rays = buildRays();

const keyframes = `
@keyframes sun-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes sun-pulse {
  0%, 100% { opacity: 0.18; transform: scale(1); }
  50% { opacity: 0.32; transform: scale(1.08); }
}
`;

export default function SunLogo({ size = 80, className }: SunLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{keyframes}</style>

      <defs>
        <radialGradient id="sun-center-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD3} />
          <stop offset="100%" stopColor={GOLD} />
        </radialGradient>
      </defs>

      {/* Halo */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={38}
        fill="none"
        stroke={GOLD3}
        strokeWidth={2.5}
        opacity={0.2}
        style={{
          transformOrigin: '50% 50%',
          animation: 'sun-pulse 4s ease-in-out infinite',
        }}
      />

      {/* Rotating rays */}
      <g
        style={{
          transformOrigin: '50% 50%',
          animation: 'sun-rotate 22s infinite linear',
        }}
      >
        {rays.map((r, i) => (
          <line
            key={i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={r.color}
            strokeWidth={r.thick ? 3 : 1.5}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Center disc */}
      <circle cx={CENTER} cy={CENTER} r={14} fill="url(#sun-center-grad)" />
    </svg>
  );
}
