"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function useMeasure<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const defaultFormat = (v: number) =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));

/* ------------------------------ LineChart ----------------------------- */

export function LineChart({
  series,
  labels,
  height = 240,
  valueFormat = defaultFormat,
  area = true,
  className,
}: {
  series: { name: string; color: string; data: number[] }[];
  labels: string[];
  height?: number;
  valueFormat?: (v: number) => string;
  area?: boolean;
  className?: string;
}) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const w = Math.max(width, 280);
  const padL = 46;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const n = labels.length;

  const all = series.flatMap((s) => s.data);
  const rawHi = Math.max(...(all.length ? all : [1]));
  const rawLo = Math.min(...(all.length ? all : [0]), 0);
  const span = rawHi - rawLo || 1;
  const hi = rawHi + span * 0.08;
  const lo = rawLo;

  const x = (i: number) =>
    padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padT + innerH - ((v - lo) / (hi - lo || 1)) * innerH;

  const ticks = [0, 1, 2, 3].map((t) => lo + ((hi - lo) * t) / 3);
  const labelEvery = Math.max(1, Math.ceil(n / 7));

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const step = innerW / Math.max(n - 1, 1);
    const idx = Math.min(n - 1, Math.max(0, Math.round((px - padL) / step)));
    setHover(idx);
  }

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <svg
        width={w}
        height={height}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block"
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={w - padR}
              y1={y(t)}
              y2={y(t)}
              stroke="#e2e8f0"
              strokeDasharray={i === 0 ? undefined : "3 4"}
            />
            <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="#94a3b8">
              {valueFormat(t)}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % labelEvery === 0 ? (
            <text
              key={i}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#94a3b8"
            >
              {l}
            </text>
          ) : null
        )}
        {series.map((s) => {
          const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
          const areaPath = `M ${x(0)} ${y(s.data[0] ?? 0)} ${s.data
            .map((v, i) => `L ${x(i)} ${y(v)}`)
            .join(" ")} L ${x(s.data.length - 1)} ${padT + innerH} L ${x(0)} ${
            padT + innerH
          } Z`;
          return (
            <g key={s.name}>
              {area && <path d={areaPath} fill={s.color} opacity={0.08} />}
              <polyline
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={padT + innerH}
              stroke="#cbd5e1"
            />
            {series.map((s) => (
              <circle
                key={s.name}
                cx={x(hover)}
                cy={y(s.data[hover] ?? 0)}
                r={4}
                fill="#fff"
                stroke={s.color}
                strokeWidth={2}
              />
            ))}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: Math.min(Math.max(x(hover) - 60, 0), w - 150) }}
        >
          <div className="font-medium text-slate-900">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="mt-1 flex items-center gap-1.5 text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
              {s.name}:{" "}
              <span className="font-semibold tabular-nums text-slate-900">
                {valueFormat(s.data[hover] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- BarChart ----------------------------- */

export function BarChart({
  data,
  height = 220,
  color = "#10b981",
  valueFormat = defaultFormat,
  className,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const w = Math.max(width, 280);
  const padB = 26;
  const padT = 18;
  const innerH = height - padT - padB;
  const n = data.length || 1;
  const slot = w / n;
  const bw = Math.min(slot * 0.62, 64);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <svg width={w} height={height} className="block">
        <line x1={0} x2={w} y1={padT + innerH} y2={padT + innerH} stroke="#e2e8f0" />
        {data.map((d, i) => {
          const h = (d.value / max) * innerH;
          const bx = i * slot + (slot - bw) / 2;
          const by = padT + innerH - h;
          return (
            <g
              key={d.label + i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={bx}
                y={by}
                width={bw}
                height={Math.max(h, 2)}
                rx={6}
                fill={d.color ?? color}
                opacity={hover === null || hover === i ? 1 : 0.4}
                className="transition-opacity"
              />
              {hover === i && (
                <text
                  x={bx + bw / 2}
                  y={by - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#0f172a"
                >
                  {valueFormat(d.value)}
                </text>
              )}
              <text
                x={bx + bw / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#94a3b8"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------- Donut ------------------------------- */

export function Donut({
  segments,
  size = 180,
  centerLabel,
  centerValue,
  className,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const stroke = Math.max(14, size * 0.105);
  const r = size / 2 - stroke / 2 - 2;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-6", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={stroke}
          />
          {segments.map((s) => {
            const frac = s.value / total;
            const offset = acc;
            acc += frac;
            return (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(frac * C - 2, 0.5)} ${C}`}
                strokeDashoffset={-offset * C}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue && (
              <div className="text-xl font-semibold tracking-tight text-slate-900">
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div className="mt-0.5 text-xs text-slate-500">{centerLabel}</div>
            )}
          </div>
        )}
      </div>
      <ul className="space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-slate-600">{s.label}</span>
            <span className="ml-1 font-medium tabular-nums text-slate-900">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ Sparkline ----------------------------- */

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "#10b981",
  fill = false,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  className?: string;
}) {
  const hi = Math.max(...(data.length ? data : [1]));
  const lo = Math.min(...(data.length ? data : [0]));
  const n = data.length;
  const x = (i: number) => (n <= 1 ? width / 2 : (i / (n - 1)) * (width - 4) + 2);
  const y = (v: number) => height - 3 - ((v - lo) / (hi - lo || 1)) * (height - 6);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPath = `M ${x(0)} ${y(data[0] ?? 0)} ${data
    .map((v, i) => `L ${x(i)} ${y(v)}`)
    .join(" ")} L ${x(n - 1)} ${height - 1} L ${x(0)} ${height - 1} Z`;

  return (
    <svg width={width} height={height} className={cn("block", className)}>
      {fill && <path d={areaPath} fill={color} opacity={0.12} />}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
