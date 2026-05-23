// motion-scenes.jsx
// All scenes for the "How's It Going?" reel overlay.
// Each scene is a <Sprite> positioned for the 1080×1920 reel frame.
// Safe overlay zone: y = 1180..1880 (below the speaker's chin/shoulders).

const SAFE_Y_TOP = 1180;
const SAFE_Y_BOT = 1880;
const SAFE_H = SAFE_Y_BOT - SAFE_Y_TOP; // 700
const CANVAS_W = 1080;
const SIDE_PAD = 70;
const CONTENT_W = CANVAS_W - SIDE_PAD * 2; // 940

// ── Palette ────────────────────────────────────────────────
const C = {
  ink:        '#0e1118',
  inkBorder:  'rgba(255,255,255,0.10)',
  text:       '#f6f4ef',
  textSoft:   'rgba(246,244,239,0.62)',
  textFaint:  'rgba(246,244,239,0.38)',
  red:        '#ef6a6a',
  amber:      '#f0b342',
  green:      '#5cc28f',
  blue:       '#7dadf2',
};

const FONT_UI = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const FONT_MONO = 'JetBrains Mono, ui-monospace, monospace';

// ── Data (mirrors dashboard) ────────────────────────────────
const CO2_DATA = [
  {year:2004,value:377.70},{year:2005,value:379.98},{year:2006,value:382.09},
  {year:2007,value:384.02},{year:2008,value:385.83},{year:2009,value:387.64},
  {year:2010,value:390.10},{year:2011,value:391.85},{year:2012,value:394.06},
  {year:2013,value:396.74},{year:2014,value:398.81},{year:2015,value:401.01},
  {year:2016,value:404.41},{year:2017,value:406.76},{year:2018,value:408.72},
  {year:2019,value:411.65},{year:2020,value:414.21},{year:2021,value:416.41},
  {year:2022,value:418.53},{year:2023,value:421.08},{year:2024,value:424.61},
  {year:2025,value:427.35},
];
const GINI_DATA = [
  {year:2004,value:33.1},{year:2005,value:33.0},{year:2006,value:33.4},
  {year:2007,value:34.0},{year:2008,value:35.4},{year:2009,value:33.9},
  {year:2010,value:34.7},{year:2011,value:33.4},{year:2012,value:33.5},
  {year:2013,value:33.5},{year:2014,value:34.4},{year:2015,value:33.4},
  {year:2016,value:33.7},{year:2017,value:33.2},{year:2018,value:34.3},
  {year:2019,value:33.1},{year:2020,value:33.8},{year:2021,value:32.3},
  {year:2022,value:32.1},{year:2023,value:32.3},
];
const WEALTH_DATA = [
  {year:2004,value:59.8},{year:2005,value:60.3},{year:2006,value:61.0},
  {year:2007,value:62.1},{year:2008,value:61.4},{year:2009,value:61.9},
  {year:2010,value:62.5},{year:2011,value:62.8},{year:2012,value:63.2},
  {year:2013,value:63.8},{year:2014,value:64.5},{year:2015,value:65.3},
  {year:2016,value:64.9},{year:2017,value:65.6},{year:2018,value:66.2},
  {year:2019,value:65.7},{year:2020,value:65.9},{year:2021,value:66.8},
  {year:2022,value:65.9},{year:2023,value:65.6},
];
const HOUSING_DATA = [
  {year:2004,value:6.5},{year:2005,value:6.7},{year:2006,value:6.9},
  {year:2007,value:7.1},{year:2008,value:7.0},{year:2009,value:7.2},
  {year:2010,value:7.4},{year:2011,value:7.3},{year:2012,value:7.2},
  {year:2013,value:7.1},{year:2014,value:7.5},{year:2015,value:8.0},
  {year:2016,value:8.4},{year:2017,value:8.6},{year:2018,value:8.0},
  {year:2019,value:7.4},{year:2020,value:7.2},{year:2021,value:9.0},
  {year:2022,value:9.8},{year:2023,value:9.1},{year:2024,value:9.3},
];

// CO₂ year-on-year deltas (the "annual rate" series)
const CO2_RATE = CO2_DATA.slice(1).map((d, i) => ({
  year: d.year,
  value: +(d.value - CO2_DATA[i].value).toFixed(2),
}));

// ── Helpers ────────────────────────────────────────────────

// Per-scene phase utility — bound any animation to a local progress window.
function phase(t, start, end, ease = Easing.easeOutCubic) {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return ease((t - start) / (end - start));
}

// Easing wrapper that lets us run an exit fade in last `exitDur` seconds.
function entryExit(localTime, sceneDuration, entryDur = 0.45, exitDur = 0.45) {
  const exitStart = sceneDuration - exitDur;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    return { opacity: t, slide: (1 - t) * 24 };
  }
  if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    return { opacity: 1 - t, slide: -t * 12 };
  }
  return { opacity: 1, slide: 0 };
}

// ── Building blocks ────────────────────────────────────────

// Eyebrow with a sliding underline rule
function Eyebrow({ text, color = C.text, progress = 1, width = CONTENT_W }) {
  const lineW = Easing.easeOutCubic(clamp(progress, 0, 1)) * 60;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: FONT_MONO, fontSize: 22, fontWeight: 500,
      letterSpacing: '0.24em', textTransform: 'uppercase',
      color,
    }}>
      <span style={{
        width: lineW, height: 2, background: color,
        flexShrink: 0,
      }}/>
      <span>{text}</span>
    </div>
  );
}

// Animated number that tweens from 0 to `to` across progress 0..1
function CountUp({ to, from = 0, progress, decimals = 2, suffix = '', prefix = '', ...rest }) {
  const t = Easing.easeOutCubic(clamp(progress, 0, 1));
  const v = from + (to - from) * t;
  return <span {...rest}>{prefix}{v.toFixed(decimals)}{suffix}</span>;
}

// Traffic-light status pill — pops in with back ease
function StatusPill({ color, label, progress }) {
  const t = clamp(progress, 0, 1);
  const scale = Easing.easeOutBack(t);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      padding: '14px 26px',
      border: `2px solid ${color}`,
      borderRadius: 999,
      background: `${color}22`,
      color,
      fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      transform: `scale(${scale})`, opacity: t,
      transformOrigin: 'left center',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: color, boxShadow: `0 0 16px ${color}`,
      }}/>
      {label}
    </div>
  );
}

// Delta badge: ▲ +49.65  (+13.1%)
function DeltaBadge({ delta, pct, unit = '', color, progress }) {
  const t = clamp(progress, 0, 1);
  const sign = delta >= 0 ? '▲' : '▼';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '10px 18px',
      border: `1.5px solid ${color}66`,
      borderRadius: 999,
      background: `${color}1a`,
      color,
      fontFamily: FONT_MONO, fontSize: 22, fontWeight: 600,
      opacity: t, transform: `translateY(${(1 - t) * 8}px)`,
      whiteSpace: 'nowrap',
    }}>
      <span>{sign} {delta >= 0 ? '+' : ''}{delta.toFixed(2)}{unit}</span>
      <span style={{ color: C.textSoft, fontWeight: 400 }}>
        ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
      </span>
    </div>
  );
}

// The card chrome that holds chart scenes — dark, glowing border
function Card({ children, color = C.text, opacity = 1, slide = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      left: SIDE_PAD, top: SAFE_Y_TOP,
      width: CONTENT_W, height: SAFE_H,
      background: C.ink,
      border: `1px solid ${C.inkBorder}`,
      borderTop: `4px solid ${color}`,
      borderRadius: 28,
      padding: '40px 44px 36px',
      boxSizing: 'border-box',
      boxShadow: `0 28px 60px rgba(0,0,0,0.35), 0 0 0 1px ${color}22, 0 0 80px ${color}33`,
      display: 'flex', flexDirection: 'column', gap: 22,
      opacity, transform: `translateY(${slide}px)`,
      backdropFilter: 'blur(0px)',
    }}>
      {children}
    </div>
  );
}

// ── Animated line chart ────────────────────────────────────
// progress 0..1 drives drawing of the line, area fill, end-dot, ref line.
function LineChart({
  data, color,
  width = CONTENT_W - 88, height = 320,
  domain, refLineY, refLineLabel,
  progress = 1,
  highlightLastN = 0,        // emphasise last N points with a colored segment
  highlightColor,
}) {
  const ys = data.map(d => d.value);
  const minY = domain ? domain[0] : Math.min(...ys);
  const maxY = domain ? domain[1] : Math.max(...ys);
  const range = (maxY - minY) || 1;
  const pad = 12;

  const x = (i) => pad + (width - pad * 2) * (i / (data.length - 1));
  const y = (v) => pad + (height - pad * 2) * (1 - (v - minY) / range);

  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const pathD = pts.map(([px, py], i) => (i === 0 ? `M${px} ${py}` : ` L${px} ${py}`)).join('');
  const areaD = pathD +
    ` L${pts[pts.length - 1][0]} ${height - pad}` +
    ` L${pts[0][0]} ${height - pad} Z`;

  // Draw phases
  const drawProg = clamp(progress / 0.55, 0, 1);     // 0..1 over first 55% of scene
  const fillProg = clamp((progress - 0.35) / 0.35, 0, 1);
  const tipProg  = clamp((progress - 0.55) / 0.20, 0, 1);

  const tip = pts[pts.length - 1];
  const refY = refLineY != null ? y(refLineY) : null;

  // Optional last-N highlight (e.g. wealth scene: most recent 3 years in green)
  let highlightPath = null;
  if (highlightLastN > 0 && highlightColor) {
    const slice = pts.slice(-1 - highlightLastN);
    highlightPath = slice.map(([px, py], i) =>
      (i === 0 ? `M${px} ${py}` : ` L${px} ${py}`)).join('');
  }

  const gradId = `g-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height, display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.45"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* baseline + gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g}
          x1={pad} x2={width - pad}
          y1={pad + (height - pad * 2) * g}
          y2={pad + (height - pad * 2) * g}
          stroke="rgba(255,255,255,0.06)" strokeDasharray="2 8"
        />
      ))}
      <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad}
        stroke="rgba(255,255,255,0.18)"/>

      {/* reference line */}
      {refY != null && (
        <g opacity={clamp((progress - 0.45) / 0.2, 0, 1)}>
          <line x1={pad} x2={width - pad} y1={refY} y2={refY}
            stroke="rgba(255,255,255,0.35)" strokeDasharray="6 6" strokeWidth="1.2"/>
          {refLineLabel && (
            <text x={width - pad - 6} y={refY - 10} textAnchor="end"
              fill="rgba(255,255,255,0.55)"
              fontFamily={FONT_MONO} fontSize="16" fontWeight="500">
              {refLineLabel}
            </text>
          )}
        </g>
      )}

      {/* area fill */}
      <path d={areaD} fill={`url(#${gradId})`} opacity={fillProg}/>

      {/* main line draws via stroke-dashoffset */}
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

      {/* highlight last-N (drawn after main line so it sits on top) */}
      {highlightPath && (
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

      {/* End tip dot */}
      {tipProg > 0 && (
        <g transform={`translate(${tip[0]} ${tip[1]})`} opacity={tipProg}>
          <circle r={22} fill={color} opacity="0.18"/>
          <circle r={10} fill={color}/>
          <circle r={4}  fill="#fff"/>
        </g>
      )}

      {/* Start / end year labels */}
      <g opacity={drawProg}>
        <text x={pad} y={height + 22}
          fill={C.textFaint}
          fontFamily={FONT_MONO} fontSize="18">
          {data[0].year}
        </text>
        <text x={width - pad} y={height + 22} textAnchor="end"
          fill={C.textFaint}
          fontFamily={FONT_MONO} fontSize="18">
          {data[data.length - 1].year}
        </text>
      </g>
    </svg>
  );
}

// ── Annual rate bar chart (CO₂ "rate also going up" callout) ──
function RateBars({ data, color, width = CONTENT_W - 88, height = 280, progress }) {
  const ys = data.map(d => d.value);
  const maxY = Math.max(...ys) * 1.1;
  const gap = 4;
  const barW = (width - gap * (data.length - 1)) / data.length;

  const reveal = clamp(progress / 0.7, 0, 1);
  const trend = clamp((progress - 0.55) / 0.4, 0, 1);

  // trendline points (linear regression-ish; use first to last)
  const yScale = (v) => height - (v / maxY) * height;
  const trendStartY = yScale(data[0].value);
  const trendEndY = yScale(data[data.length - 1].value);

  return (
    <svg viewBox={`0 0 ${width} ${height + 30}`}
      style={{ width: '100%', height: height + 30, display: 'block', overflow: 'visible' }}>
      {data.map((d, i) => {
        // bars reveal staggered left-to-right
        const localR = clamp(reveal * data.length - i, 0, 1);
        const h = Easing.easeOutCubic(localR) * (d.value / maxY) * height;
        const x = i * (barW + gap);
        return (
          <g key={d.year}>
            <rect
              x={x} y={height - h}
              width={barW} height={h}
              rx={Math.min(3, barW / 2)}
              fill={color} opacity={0.55 + 0.45 * localR}
            />
          </g>
        );
      })}

      {/* trend line over bars */}
      {trend > 0 && (
        <g opacity={trend}>
          <line
            x1={barW / 2} y1={trendStartY}
            x2={width - barW / 2} y2={trendEndY}
            stroke="#fff" strokeWidth="2.5" strokeDasharray="6 6"
          />
          <circle cx={width - barW / 2} cy={trendEndY} r="8" fill="#fff"/>
        </g>
      )}

      <text x={0} y={height + 22}
        fill={C.textFaint}
        fontFamily={FONT_MONO} fontSize="16">
        {data[0].year}
      </text>
      <text x={width} y={height + 22} textAnchor="end"
        fill={C.textFaint}
        fontFamily={FONT_MONO} fontSize="16">
        {data[data.length - 1].year}
      </text>
    </svg>
  );
}

// ── SCENE 1: Title "How's It Going?" ────────────────────────
function SceneTitle({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.5, 0.5);
        const eyeP = phase(localTime, 0.0, 0.5);
        const titleP = phase(localTime, 0.25, 1.0);
        const subP  = phase(localTime, 0.7, 1.2);
        return (
          <div style={{
            position: 'absolute', left: SIDE_PAD,
            top: SAFE_Y_TOP + 60, width: CONTENT_W,
            opacity, transform: `translateY(${slide}px)`,
            display: 'flex', flexDirection: 'column', gap: 28,
          }}>
            <div style={{ opacity: eyeP, transform: `translateX(${(1 - eyeP) * -20}px)` }}>
              <Eyebrow text="Global Indicators · 2004 – 2025" color={C.textSoft} progress={eyeP}/>
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: FONT_UI, fontWeight: 700,
              fontSize: 168, lineHeight: 0.92,
              letterSpacing: '-0.045em',
              color: C.text,
              opacity: titleP,
              transform: `translateY(${(1 - titleP) * 30}px)`,
            }}>
              How's it{' '}
              <em style={{
                fontStyle: 'italic', fontWeight: 400,
                color: C.textSoft,
              }}>going?</em>
            </h1>
            <p style={{
              margin: 0,
              fontFamily: FONT_MONO, fontSize: 26,
              color: C.textFaint, letterSpacing: '0.04em',
              opacity: subP,
              transform: `translateY(${(1 - subP) * 14}px)`,
            }}>
              A 20-year read on whether we're making progress.
            </p>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 2: Atmospheric CO₂ chart ─────────────────────────
function SceneCO2({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.5, 0.5);
        const innerP = clamp((localTime - 0.45) / (duration - 0.9), 0, 1);
        const chartP = clamp(innerP * 1.0, 0, 1);
        const numP   = phase(localTime, 1.4, 2.4);
        const pillP  = phase(localTime, 2.0, 2.6, Easing.easeOutBack);

        return (
          <div style={{ opacity, transform: `translateY(${slide}px)` }}>
            <Card color={C.red}>
              <Eyebrow text="Atmospheric CO₂ · Mauna Loa" color={C.red} progress={phase(localTime, 0, 0.4)}/>
              <LineChart
                data={CO2_DATA}
                color={C.red}
                domain={[370, 432]}
                refLineY={400}
                refLineLabel="400 PPM (2015)"
                progress={chartP}
              />
              <div style={{
                display: 'flex', alignItems: 'baseline',
                gap: 24, marginTop: 4, flexWrap: 'wrap',
              }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 92, fontWeight: 700,
                  color: C.red, lineHeight: 1, letterSpacing: '-0.02em',
                  opacity: clamp(numP, 0, 1),
                  transform: `translateY(${(1 - numP) * 16}px)`,
                }}>
                  <CountUp to={427.35} progress={numP} decimals={2}/>
                  <span style={{ fontSize: 36, color: C.textSoft, marginLeft: 10 }}>PPM</span>
                </div>
                <DeltaBadge delta={49.65} pct={13.1} unit=" ppm" color={C.red} progress={numP}/>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <StatusPill color={C.red} label="Worsening" progress={pillP}/>
              </div>
            </Card>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 3: CO₂ annual rate (bars) ────────────────────────
function SceneCO2Rate({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.3, 0.35);
        const inP = clamp((localTime - 0.25) / (duration - 0.6), 0, 1);
        const numP = phase(localTime, 0.6, 1.1);

        return (
          <div style={{ opacity, transform: `translateY(${slide}px)` }}>
            <Card color={C.red}>
              <Eyebrow text="Annual increase, ppm / year" color={C.red} progress={phase(localTime, 0, 0.3)}/>
              <RateBars data={CO2_RATE} color={C.red} progress={inP}/>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 22, flexWrap: 'wrap', marginTop: 4,
              }}>
                <div style={{
                  fontFamily: FONT_UI, fontSize: 64, fontWeight: 700,
                  color: C.text, lineHeight: 1, letterSpacing: '-0.02em',
                  opacity: numP, transform: `translateY(${(1 - numP) * 12}px)`,
                }}>
                  Also going up.
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <StatusPill color={C.red} label="Accelerating" progress={phase(localTime, 0.8, 1.3, Easing.easeOutBack)}/>
              </div>
            </Card>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 4: Income inequality (improving) ─────────────────
function SceneIncome({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.25, 0.35);
        const inP = clamp((localTime - 0.2) / (duration - 0.5), 0, 1);
        const numP = phase(localTime, 0.7, 1.2);
        const pillP = phase(localTime, 1.0, 1.5, Easing.easeOutBack);

        return (
          <div style={{ opacity, transform: `translateY(${slide}px)` }}>
            <Card color={C.green}>
              <Eyebrow text="Income inequality · Australia" color={C.green} progress={phase(localTime, 0, 0.3)}/>
              <LineChart
                data={GINI_DATA}
                color={C.green}
                domain={[30.5, 36]}
                progress={inP}
              />
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 24, flexWrap: 'wrap', marginTop: 4,
              }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 92, fontWeight: 700,
                  color: C.green, lineHeight: 1, letterSpacing: '-0.02em',
                  opacity: numP, transform: `translateY(${(1 - numP) * 16}px)`,
                }}>
                  <CountUp to={32.30} progress={numP} decimals={2}/>
                  <span style={{ fontSize: 32, color: C.textSoft, marginLeft: 10 }}>GINI</span>
                </div>
                <DeltaBadge delta={-0.80} pct={-2.4} color={C.green} progress={numP}/>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <StatusPill color={C.green} label="Improving" progress={pillP}/>
              </div>
            </Card>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 5: Wealth inequality (mixed, turning corner) ─────
function SceneWealth({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.3, 0.4);
        const inP = clamp((localTime - 0.3) / (duration - 0.7), 0, 1);
        const numP = phase(localTime, 1.0, 1.6);
        const pillP = phase(localTime, 1.6, 2.2, Easing.easeOutBack);
        const tagP = phase(localTime, 3.0, 3.6);

        return (
          <div style={{ opacity, transform: `translateY(${slide}px)` }}>
            <Card color={C.amber}>
              <Eyebrow text="Wealth inequality · Australia" color={C.amber} progress={phase(localTime, 0, 0.3)}/>
              <LineChart
                data={WEALTH_DATA}
                color={C.amber}
                domain={[58, 68]}
                progress={inP}
                highlightLastN={3}
                highlightColor={C.green}
              />
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 22, flexWrap: 'wrap', marginTop: 4,
              }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 92, fontWeight: 700,
                  color: C.amber, lineHeight: 1, letterSpacing: '-0.02em',
                  opacity: numP, transform: `translateY(${(1 - numP) * 16}px)`,
                }}>
                  <CountUp to={65.60} progress={numP} decimals={2}/>
                  <span style={{ fontSize: 32, color: C.textSoft, marginLeft: 10 }}>GINI</span>
                </div>
                <DeltaBadge delta={5.80} pct={9.7} color={C.amber} progress={numP}/>
              </div>
              <div style={{
                marginTop: 'auto',
                display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
              }}>
                <StatusPill color={C.amber} label="Mixed" progress={pillP}/>
                <div style={{
                  fontFamily: FONT_UI, fontStyle: 'italic',
                  fontSize: 30, color: C.green,
                  opacity: tagP, transform: `translateX(${(1 - tagP) * -12}px)`,
                }}>
                  …turning a corner?
                </div>
              </div>
            </Card>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 6: Housing affordability (still a mess) ──────────
function SceneHousing({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.25, 0.35);
        const inP = clamp((localTime - 0.2) / (duration - 0.5), 0, 1);
        const numP = phase(localTime, 0.7, 1.2);
        const pillP = phase(localTime, 1.0, 1.5, Easing.easeOutBack);

        return (
          <div style={{ opacity, transform: `translateY(${slide}px)` }}>
            <Card color={C.red}>
              <Eyebrow text="Housing affordability · Australia" color={C.red} progress={phase(localTime, 0, 0.3)}/>
              <LineChart
                data={HOUSING_DATA}
                color={C.red}
                domain={[5, 10.5]}
                refLineY={5}
                refLineLabel='"Severely unaffordable" (5×)'
                progress={inP}
              />
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 24, flexWrap: 'wrap', marginTop: 4,
              }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 92, fontWeight: 700,
                  color: C.red, lineHeight: 1, letterSpacing: '-0.02em',
                  opacity: numP, transform: `translateY(${(1 - numP) * 16}px)`,
                }}>
                  <CountUp to={9.30} progress={numP} decimals={2}/>
                  <span style={{ fontSize: 36, color: C.textSoft, marginLeft: 6 }}>×</span>
                </div>
                <DeltaBadge delta={2.80} pct={43.1} unit="×" color={C.red} progress={numP}/>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <StatusPill color={C.red} label="Still a mess" progress={pillP}/>
              </div>
            </Card>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 7: 4-up verdict summary ──────────────────────────
function SceneSummary({ start, end }) {
  const rows = [
    { label: 'Atmospheric CO₂',     val: '427.35 PPM', color: C.red,   status: 'Worsening' },
    { label: 'Income inequality',   val: '32.30 GINI', color: C.green, status: 'Improving' },
    { label: 'Wealth inequality',   val: '65.60 GINI', color: C.amber, status: 'Mixed' },
    { label: 'Housing affordability', val: '9.30×',    color: C.red,   status: 'Still a mess' },
  ];
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.4, 0.55);
        const verdictP = phase(localTime, duration - 4.0, duration - 3.2, Easing.easeOutBack);

        return (
          <div style={{ opacity, transform: `translateY(${slide}px)` }}>
            <Card color={C.text}>
              <Eyebrow text="The verdict" color={C.text} progress={phase(localTime, 0, 0.3)}/>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 18, marginTop: 6,
              }}>
                {rows.map((r, i) => {
                  const rowP = phase(localTime, 0.4 + i * 0.25, 1.0 + i * 0.25, Easing.easeOutCubic);
                  return (
                    <div key={r.label} style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr auto',
                      gap: 22, alignItems: 'center',
                      opacity: rowP,
                      transform: `translateX(${(1 - rowP) * -28}px)`,
                      paddingBottom: 14,
                      borderBottom: i < rows.length - 1 ? `1px solid ${C.inkBorder}` : 'none',
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: r.color,
                        boxShadow: `0 0 18px ${r.color}aa`,
                        justifySelf: 'center',
                      }}/>
                      <div>
                        <div style={{
                          fontFamily: FONT_UI, fontSize: 30, fontWeight: 600,
                          color: C.text, lineHeight: 1.1,
                        }}>
                          {r.label}
                        </div>
                        <div style={{
                          fontFamily: FONT_MONO, fontSize: 22, fontWeight: 500,
                          color: r.color, marginTop: 4, letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}>
                          {r.status}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: FONT_MONO, fontSize: 30, fontWeight: 700,
                        color: C.text, whiteSpace: 'nowrap',
                      }}>
                        {r.val}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{
                marginTop: 'auto',
                textAlign: 'center',
                opacity: verdictP,
                transform: `scale(${0.85 + 0.15 * verdictP})`,
                transformOrigin: 'center',
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '18px 36px',
                  background: C.red,
                  color: C.text,
                  fontFamily: FONT_UI, fontWeight: 700,
                  fontSize: 44, letterSpacing: '-0.01em',
                  borderRadius: 18,
                  boxShadow: `0 0 40px ${C.red}88`,
                }}>
                  We're not doing enough.
                </div>
              </div>
            </Card>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 8: Link in bio ───────────────────────────────────
function SceneLink({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.3, 0.35);
        const arrowP = phase(localTime, 0.4, 1.2, Easing.easeOutBack);
        const urlP = phase(localTime, 0.2, 0.8);
        return (
          <div style={{
            position: 'absolute', left: SIDE_PAD,
            top: SAFE_Y_TOP + 140, width: CONTENT_W,
            opacity, transform: `translateY(${slide}px)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 24, color: C.text,
              letterSpacing: '0.24em', textTransform: 'uppercase',
              opacity: phase(localTime, 0, 0.4),
            }}>
              Try it yourself
            </div>
            <div style={{
              fontFamily: FONT_UI, fontWeight: 700, fontSize: 108,
              color: C.text, letterSpacing: '-0.03em', lineHeight: 0.95,
              opacity: urlP,
              transform: `translateY(${(1 - urlP) * 24}px)`,
            }}>
              Link in bio ↗
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 26,
              padding: '14px 26px',
              border: `1.5px solid ${C.inkBorder}`,
              background: C.ink,
              color: C.textSoft,
              borderRadius: 14,
              opacity: arrowP,
              transform: `translateY(${(1 - arrowP) * 16}px)`,
            }}>
              mlorenzon.github.io/howsitgoing
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── SCENE 9: What's in your dashboard? ─────────────────────
function SceneQuestion({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const { opacity, slide } = entryExit(localTime, duration, 0.35, 0.4);
        const lineP = phase(localTime, 0.0, 0.5);
        const bigP  = phase(localTime, 0.35, 1.0);

        return (
          <div style={{
            position: 'absolute', left: SIDE_PAD,
            top: SAFE_Y_TOP + 100, width: CONTENT_W,
            opacity, transform: `translateY(${slide}px)`,
            display: 'flex', flexDirection: 'column', gap: 30,
          }}>
            <div style={{ opacity: lineP }}>
              <Eyebrow text="Your turn" color={C.textSoft} progress={lineP}/>
            </div>
            <h2 style={{
              margin: 0,
              fontFamily: FONT_UI, fontWeight: 700,
              fontSize: 124, lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: C.text,
              opacity: bigP,
              transform: `translateY(${(1 - bigP) * 24}px)`,
            }}>
              What's in <em style={{
                fontStyle: 'italic', fontWeight: 400, color: C.amber,
              }}>your</em> dashboard?
            </h2>
            <p style={{
              margin: 0,
              fontFamily: FONT_MONO, fontSize: 26,
              color: C.textFaint, letterSpacing: '0.04em',
              opacity: phase(localTime, 0.8, 1.4),
            }}>
              Tell me in the comments ↓
            </p>
          </div>
        );
      }}
    </Sprite>
  );
}

// ── Scene timeline ─────────────────────────────────────────
// Synced to the spoken transcript timestamps.
const SCENES = [
  { Comp: SceneTitle,    start: 5.4,  end: 10.2 },
  { Comp: SceneCO2,      start: 10.4, end: 17.9 },
  { Comp: SceneCO2Rate,  start: 17.95, end: 19.7 },
  { Comp: SceneIncome,   start: 19.75, end: 22.4 },
  { Comp: SceneWealth,   start: 22.5, end: 28.5 },
  { Comp: SceneHousing,  start: 28.55, end: 31.4 },
  { Comp: SceneSummary,  start: 31.6, end: 45.7 },
  { Comp: SceneLink,     start: 45.85, end: 48.3 },
  { Comp: SceneQuestion, start: 48.4, end: 51.5 },
];
const TOTAL_DURATION = 51.5;

// ── Optional preview overlay (the speaker thumbnail) ───────
function PreviewOverlay({ enabled }) {
  if (!enabled) return null;
  return (
    <img
      src="thumbnail.png"
      alt=""
      style={{
        position: 'absolute', inset: 0,
        width: CANVAS_W, height: 1920,
        objectFit: 'cover',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}

// ── Safe-zone guides (toggleable in tweaks) ────────────────
function SafeZoneGuides({ enabled }) {
  if (!enabled) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999,
    }}>
      <div style={{
        position: 'absolute',
        left: SIDE_PAD, top: SAFE_Y_TOP,
        width: CONTENT_W, height: SAFE_H,
        border: '2px dashed rgba(255,0,255,0.6)',
      }}/>
      <div style={{
        position: 'absolute', left: 10, top: SAFE_Y_TOP - 28,
        fontFamily: FONT_MONO, fontSize: 16, color: 'magenta',
      }}>
        SAFE ZONE · y={SAFE_Y_TOP}–{SAFE_Y_BOT}
      </div>
    </div>
  );
}

Object.assign(window, {
  SCENES, TOTAL_DURATION, SAFE_Y_TOP, SAFE_Y_BOT,
  PreviewOverlay, SafeZoneGuides, C,
});
