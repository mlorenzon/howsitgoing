// Shared UI components — ported from motion-scenes.jsx
// Layout constants and palette are re-exported for use in scene files.

import { loadFont } from '@remotion/google-fonts/JetBrainsMono';
import { clamp, Easing } from './animations';

const { fontFamily: FONT_MONO_LOADED } = loadFont('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
});

export const FONT_UI = 'Helvetica Neue, Helvetica, Arial, sans-serif';
export const FONT_MONO = FONT_MONO_LOADED;

export const CANVAS_W = 1080;
export const SAFE_Y_TOP = 1180;
export const SAFE_Y_BOT = 1880;
export const SAFE_H = SAFE_Y_BOT - SAFE_Y_TOP; // 700
export const SIDE_PAD = 70;
export const CONTENT_W = CANVAS_W - SIDE_PAD * 2; // 940

export const C = {
  ink:       '#0e1118',
  inkBorder: 'rgba(255,255,255,0.10)',
  text:      '#f6f4ef',
  textSoft:  'rgba(246,244,239,0.62)',
  textFaint: 'rgba(246,244,239,0.38)',
  red:       '#ef6a6a',
  amber:     '#f0b342',
  green:     '#5cc28f',
  blue:      '#7dadf2',
};

// ── Eyebrow with sliding underline rule ─────────────────────
export function Eyebrow({
  text,
  color = C.text,
  progress = 1,
}: {
  text: string;
  color?: string;
  progress?: number;
}) {
  const lineW = Easing.easeOutCubic(clamp(progress, 0, 1)) * 60;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: FONT_MONO,
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color,
      }}
    >
      <span style={{ width: lineW, height: 2, background: color, flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  );
}

// ── Animated count-up number ─────────────────────────────────
export function CountUp({
  to,
  from = 0,
  progress,
  decimals = 2,
  suffix = '',
  prefix = '',
}: {
  to: number;
  from?: number;
  progress: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const t = Easing.easeOutCubic(clamp(progress, 0, 1));
  const v = from + (to - from) * t;
  return (
    <span>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ── Traffic-light status pill ────────────────────────────────
export function StatusPill({
  color,
  label,
  progress,
}: {
  color: string;
  label: string;
  progress: number;
}) {
  const t = clamp(progress, 0, 1);
  const scale = Easing.easeOutBack(t);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 26px',
        border: `2px solid ${color}`,
        borderRadius: 999,
        background: `${color}22`,
        color,
        fontFamily: FONT_MONO,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        transform: `scale(${scale})`,
        opacity: t,
        transformOrigin: 'left center',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 16px ${color}`,
        }}
      />
      {label}
    </div>
  );
}

// ── Delta badge (▲ +49.65  (+13.1%)) ────────────────────────
export function DeltaBadge({
  delta,
  pct,
  unit = '',
  color,
  progress,
}: {
  delta: number;
  pct: number;
  unit?: string;
  color: string;
  progress: number;
}) {
  const t = clamp(progress, 0, 1);
  const sign = delta >= 0 ? '▲' : '▼';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 18px',
        border: `1.5px solid ${color}66`,
        borderRadius: 999,
        background: `${color}1a`,
        color,
        fontFamily: FONT_MONO,
        fontSize: 22,
        fontWeight: 600,
        opacity: t,
        transform: `translateY(${(1 - t) * 8}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      <span>
        {sign} {delta >= 0 ? '+' : ''}
        {delta.toFixed(2)}
        {unit}
      </span>
      <span style={{ color: C.textSoft, fontWeight: 400 }}>
        ({pct >= 0 ? '+' : ''}
        {pct.toFixed(1)}%)
      </span>
    </div>
  );
}

// ── Card chrome ──────────────────────────────────────────────
export function Card({
  children,
  color = C.text,
  opacity = 1,
  slide = 0,
}: {
  children: React.ReactNode;
  color?: string;
  opacity?: number;
  slide?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: SIDE_PAD,
        top: SAFE_Y_TOP,
        width: CONTENT_W,
        height: SAFE_H,
        background: C.ink,
        border: `1px solid ${C.inkBorder}`,
        borderTop: `4px solid ${color}`,
        borderRadius: 28,
        padding: '40px 44px 36px',
        boxSizing: 'border-box',
        boxShadow: `0 28px 60px rgba(0,0,0,0.35), 0 0 0 1px ${color}22, 0 0 80px ${color}33`,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        opacity,
        transform: `translateY(${slide}px)`,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated line chart ──────────────────────────────────────
export function LineChart({
  data,
  color,
  width = CONTENT_W - 88,
  height = 320,
  domain,
  refLineY,
  refLineLabel,
  progress = 1,
  highlightLastN = 0,
  highlightColor,
}: {
  data: { year: number; value: number }[];
  color: string;
  width?: number;
  height?: number;
  domain?: [number, number];
  refLineY?: number;
  refLineLabel?: string;
  progress?: number;
  highlightLastN?: number;
  highlightColor?: string;
}) {
  const ys = data.map((d) => d.value);
  const minY = domain ? domain[0] : Math.min(...ys);
  const maxY = domain ? domain[1] : Math.max(...ys);
  const range = (maxY - minY) || 1;
  const pad = 12;

  const xFn = (i: number) => pad + (width - pad * 2) * (i / (data.length - 1));
  const yFn = (v: number) => pad + (height - pad * 2) * (1 - (v - minY) / range);

  const pts = data.map((d, i) => [xFn(i), yFn(d.value)] as [number, number]);
  const pathD = pts
    .map(([px, py], i) => (i === 0 ? `M${px} ${py}` : ` L${px} ${py}`))
    .join('');
  const areaD =
    pathD +
    ` L${pts[pts.length - 1][0]} ${height - pad}` +
    ` L${pts[0][0]} ${height - pad} Z`;

  const drawProg = clamp(progress / 0.55, 0, 1);
  const fillProg = clamp((progress - 0.35) / 0.35, 0, 1);
  const tipProg = clamp((progress - 0.55) / 0.2, 0, 1);

  const tip = pts[pts.length - 1];
  const refY = refLineY != null ? yFn(refLineY) : null;

  let highlightPath: string | null = null;
  if (highlightLastN > 0 && highlightColor) {
    const slice = pts.slice(-1 - highlightLastN);
    highlightPath = slice
      .map(([px, py], i) => (i === 0 ? `M${px} ${py}` : ` L${px} ${py}`))
      .join('');
  }

  const gradId = `g-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height, display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={width - pad}
          y1={pad + (height - pad * 2) * g}
          y2={pad + (height - pad * 2) * g}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="2 8"
        />
      ))}
      <line
        x1={pad}
        x2={width - pad}
        y1={height - pad}
        y2={height - pad}
        stroke="rgba(255,255,255,0.18)"
      />

      {refY != null && (
        <g opacity={clamp((progress - 0.45) / 0.2, 0, 1)}>
          <line
            x1={pad}
            x2={width - pad}
            y1={refY}
            y2={refY}
            stroke="rgba(255,255,255,0.35)"
            strokeDasharray="6 6"
            strokeWidth="1.2"
          />
          {refLineLabel && (
            <text
              x={width - pad - 6}
              y={refY - 10}
              textAnchor="end"
              fill="rgba(255,255,255,0.55)"
              fontFamily={FONT_MONO}
              fontSize="16"
              fontWeight="500"
            >
              {refLineLabel}
            </text>
          )}
        </g>
      )}

      <path d={areaD} fill={`url(#${gradId})`} opacity={fillProg} />

      <path
        d={pathD}
        pathLength="100"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - drawProg)}
      />

      {highlightPath && highlightColor && (
        <path
          d={highlightPath}
          pathLength="100"
          stroke={highlightColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="100"
          strokeDashoffset={100 * (1 - drawProg)}
          opacity={clamp((progress - 0.5) / 0.2, 0, 1)}
        />
      )}

      {tipProg > 0 && (
        <g transform={`translate(${tip[0]} ${tip[1]})`} opacity={tipProg}>
          <circle r={22} fill={color} opacity="0.18" />
          <circle r={10} fill={color} />
          <circle r={4} fill="#fff" />
        </g>
      )}

      <g opacity={drawProg}>
        <text x={pad} y={height + 22} fill={C.textFaint} fontFamily={FONT_MONO} fontSize="18">
          {data[0].year}
        </text>
        <text
          x={width - pad}
          y={height + 22}
          textAnchor="end"
          fill={C.textFaint}
          fontFamily={FONT_MONO}
          fontSize="18"
        >
          {data[data.length - 1].year}
        </text>
      </g>
    </svg>
  );
}

// ── Annual rate bar chart ────────────────────────────────────
export function RateBars({
  data,
  color,
  width = CONTENT_W - 88,
  height = 280,
  progress,
}: {
  data: { year: number; value: number }[];
  color: string;
  width?: number;
  height?: number;
  progress: number;
}) {
  const ys = data.map((d) => d.value);
  const maxY = Math.max(...ys) * 1.1;
  const gap = 4;
  const barW = (width - gap * (data.length - 1)) / data.length;

  const reveal = clamp(progress / 0.7, 0, 1);
  const trend = clamp((progress - 0.55) / 0.4, 0, 1);

  const yScale = (v: number) => height - (v / maxY) * height;
  const trendStartY = yScale(data[0].value);
  const trendEndY = yScale(data[data.length - 1].value);

  return (
    <svg
      viewBox={`0 0 ${width} ${height + 30}`}
      style={{ width: '100%', height: height + 30, display: 'block', overflow: 'visible' }}
    >
      {data.map((d, i) => {
        const localR = clamp(reveal * data.length - i, 0, 1);
        const h = Easing.easeOutCubic(localR) * (d.value / maxY) * height;
        const x = i * (barW + gap);
        return (
          <rect
            key={d.year}
            x={x}
            y={height - h}
            width={barW}
            height={h}
            rx={Math.min(3, barW / 2)}
            fill={color}
            opacity={0.55 + 0.45 * localR}
          />
        );
      })}

      {trend > 0 && (
        <g opacity={trend}>
          <line
            x1={barW / 2}
            y1={trendStartY}
            x2={width - barW / 2}
            y2={trendEndY}
            stroke="#fff"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />
          <circle cx={width - barW / 2} cy={trendEndY} r="8" fill="#fff" />
        </g>
      )}

      <text x={0} y={height + 22} fill={C.textFaint} fontFamily={FONT_MONO} fontSize="16">
        {data[0].year}
      </text>
      <text
        x={width}
        y={height + 22}
        textAnchor="end"
        fill={C.textFaint}
        fontFamily={FONT_MONO}
        fontSize="16"
      >
        {data[data.length - 1].year}
      </text>
    </svg>
  );
}
