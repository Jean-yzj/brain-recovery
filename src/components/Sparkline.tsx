"use client";

interface Props {
  values: number[];
  max?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({
  values,
  max = 10,
  height = 48,
  color = "stroke-calm-500",
}: Props) {
  if (!values.length) {
    return <div className="text-xs text-ink-400">尚無資料</div>;
  }
  const w = 100;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = height - (v / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <polyline
          points={points}
          className={`fill-none ${color}`}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute top-0 right-0 text-xs text-ink-500">
        最新 <span className="tabular-nums font-medium">{last}</span>
      </div>
    </div>
  );
}
