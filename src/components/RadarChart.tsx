"use client";

interface Axis {
  label: string;
  value: number;
  max?: number;
}

interface Props {
  axes: Axis[];
  size?: number;
  fill?: string;
}

export default function RadarChart({
  axes,
  size = 240,
  fill = "fill-calm-500/30 stroke-calm-600",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 32;
  const n = axes.length;
  const angle = (i: number) => -Math.PI / 2 + (i / n) * 2 * Math.PI;

  const point = (i: number, ratio: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * ratio, cy + Math.sin(a) * r * ratio];
  };

  const polyPoints = axes
    .map((ax, i) => {
      const ratio = Math.min(1, Math.max(0, ax.value / (ax.max ?? 100)));
      const [x, y] = point(i, ratio);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size }}>
      {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <polygon
          key={i}
          points={axes
            .map((_, j) => {
              const [x, y] = point(j, ratio);
              return `${x},${y}`;
            })
            .join(" ")}
          className="fill-none stroke-ink-200 dark:stroke-ink-800"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            className="stroke-ink-200 dark:stroke-ink-800"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={polyPoints}
        className={fill}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {axes.map((ax, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-600 dark:fill-ink-300 text-[11px]"
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}
