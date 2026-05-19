"use client";

interface Props {
  score: number;
  label?: string;
  sub?: string;
  size?: number;
}

export default function BrainScoreRing({ score, label, sub, size = 160 }: Props) {
  const safe = Math.max(0, Math.min(100, score));
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (safe / 100) * c;
  const color =
    safe >= 75
      ? "stroke-warm-500"
      : safe >= 55
      ? "stroke-warm-400"
      : safe >= 30
      ? "stroke-calm-500"
      : "stroke-calm-700";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={10}
            className="stroke-ink-200 dark:stroke-ink-800"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={10}
            strokeLinecap="round"
            className={`${color} transition-[stroke-dashoffset] duration-700`}
            strokeDasharray={c}
            strokeDashoffset={offset}
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-semibold tabular-nums">{safe}</div>
          <div className="text-xs text-ink-500">/100</div>
        </div>
      </div>
      {label && <div className="mt-3 text-sm font-medium">{label}</div>}
      {sub && <div className="mt-0.5 text-xs text-ink-500 text-center max-w-xs">{sub}</div>}
    </div>
  );
}
