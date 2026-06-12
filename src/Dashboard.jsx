import { useState, useEffect, useMemo } from "react";
import VolumeCalculator from "./VolumeCalculator.jsx";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ── Embedded fallback data ────────────────────────────────────────────────────

const CO2_FALLBACK = [
  { year: 2004, value: 377.49 }, { year: 2005, value: 379.80 },
  { year: 2006, value: 381.90 }, { year: 2007, value: 383.76 },
  { year: 2008, value: 385.59 }, { year: 2009, value: 387.37 },
  { year: 2010, value: 389.85 }, { year: 2011, value: 391.57 },
  { year: 2012, value: 393.82 }, { year: 2013, value: 396.48 },
  { year: 2014, value: 398.61 }, { year: 2015, value: 400.83 },
  { year: 2016, value: 404.21 }, { year: 2017, value: 406.53 },
  { year: 2018, value: 408.48 }, { year: 2019, value: 411.44 },
  { year: 2020, value: 414.21 }, { year: 2021, value: 416.45 },
  { year: 2022, value: 418.53 }, { year: 2023, value: 421.06 },
  { year: 2024, value: 422.96 },
];

const GINI_FALLBACK = [
  { year: 2004, value: 32.8 }, { year: 2005, value: 33.0 },
  { year: 2006, value: 33.4 }, { year: 2007, value: 34.0 },
  { year: 2008, value: 34.3 }, { year: 2009, value: 33.9 },
  { year: 2010, value: 33.5 }, { year: 2011, value: 33.4 },
  { year: 2012, value: 33.5 }, { year: 2013, value: 33.5 },
  { year: 2014, value: 33.2 }, { year: 2015, value: 33.4 },
  { year: 2016, value: 33.7 }, { year: 2017, value: 33.2 },
  { year: 2018, value: 32.9 }, { year: 2019, value: 33.1 },
  { year: 2020, value: 32.6 }, { year: 2021, value: 32.3 },
  { year: 2022, value: 32.1 }, { year: 2023, value: 32.3 },
];

const WEALTH_GINI_DATA = [
  { year: 2004, value: 59.8 }, { year: 2005, value: 60.3 },
  { year: 2006, value: 61.0 }, { year: 2007, value: 62.1 },
  { year: 2008, value: 61.4 }, { year: 2009, value: 61.9 },
  { year: 2010, value: 62.5 }, { year: 2011, value: 62.8 },
  { year: 2012, value: 63.2 }, { year: 2013, value: 63.8 },
  { year: 2014, value: 64.5 }, { year: 2015, value: 65.3 },
  { year: 2016, value: 64.9 }, { year: 2017, value: 65.6 },
  { year: 2018, value: 66.2 }, { year: 2019, value: 65.7 },
  { year: 2020, value: 65.9 }, { year: 2021, value: 66.8 },
  { year: 2022, value: 65.9 }, { year: 2023, value: 65.6 },
];

const HOUSING_DATA = [
  { year: 2004, ratio: 6.5 }, { year: 2005, ratio: 6.7 },
  { year: 2006, ratio: 6.9 }, { year: 2007, ratio: 7.1 },
  { year: 2008, ratio: 7.0 }, { year: 2009, ratio: 7.2 },
  { year: 2010, ratio: 7.4 }, { year: 2011, ratio: 7.3 },
  { year: 2012, ratio: 7.2 }, { year: 2013, ratio: 7.1 },
  { year: 2014, ratio: 7.5 }, { year: 2015, ratio: 8.0 },
  { year: 2016, ratio: 8.4 }, { year: 2017, ratio: 8.6 },
  { year: 2018, ratio: 8.0 }, { year: 2019, ratio: 7.4 },
  { year: 2020, ratio: 7.2 }, { year: 2021, ratio: 9.0 },
  { year: 2022, ratio: 9.8 }, { year: 2023, ratio: 9.1 },
  { year: 2024, ratio: 9.3 },
];

// ── Explanations ──────────────────────────────────────────────────────────────

const EXPLANATIONS = {
  co2: {
    text: "CO₂ is the primary long-lived greenhouse gas. Its concentration at Mauna Loa has risen without interruption since modern records began in 1958. No annual mean has ever been lower than the year before it. Pre-industrial levels were roughly 280 ppm. The IPCC broadly associates 450 ppm with approximately 2°C of warming above pre-industrial temperatures.",
    source: "NOAA Global Monitoring Laboratory · gml.noaa.gov/ccgg/trends/",
  },
  co2Growth: {
    text: "This chart shows how much atmospheric CO₂ increased each year compared to the previous year. A declining trend — 'bending the curve' — would indicate slowing emissions growth. An increasing trend means acceleration. Pre-industrial growth was near zero; the current rate of ~2 ppm/yr is entirely human-caused. No year has ever recorded a net decline in annual mean concentration.",
    source: "NOAA Global Monitoring Laboratory · gml.noaa.gov/ccgg/trends/",
  },
  incomeGini: {
    text: "The Gini coefficient measures inequality on a 0–100 scale: 0 means everyone has identical income, 100 means one person has it all. This figure uses post-tax, post-transfer disposable income, so it already reflects welfare payments and progressive taxation. Australia's score of around 32 is more equal than the US (around 41) but less equal than Nordic countries (around 27). The World Bank surveys household income every few years; inter-survey years use ABS/HILDA estimates.",
    source: "World Bank SI.POV.GINI · data.worldbank.org · ABS Cat. 6523.0",
  },
  wealthGini: {
    text: "Same 0–100 Gini scale as income inequality, but applied to net worth (all assets minus all debts). Wealth inequality is structurally much higher than income inequality because assets, especially property and shares, compound over time and concentrate among older, higher-income households. Australia's wealth Gini of around 65 reflects the outsized role of residential property values. Published annually by UBS (formerly Credit Suisse) in the Global Wealth Report.",
    source: "UBS Global Wealth Report (formerly Credit Suisse) · ABS/HILDA Survey (pre-2010)",
  },
  housing: {
    text: "The median dwelling price across Australia's eight capital cities divided by average full-time annual earnings. A ratio of 3× was typical in the 1980s; Demographia's international survey classifies anything above 5× as 'severely unaffordable'. At 9×, buying a median home requires nine full years of average salary before interest costs or saving time. No public REST API exists for this data; it is compiled manually from ABS earnings and property price releases.",
    source: "ABS Cat. 6302.0 (Average Weekly Earnings) · ABS Cat. 6416.0 (Residential Property Price Indexes)",
  },
};

// ── Traffic light ─────────────────────────────────────────────────────────────
// Higher = worse for all four metrics (CO₂ ppm, Gini, Wealth Gini, price-to-income).

function computeStatus(data, dataKey) {
  if (!data || data.length < 6) return null;
  const last     = data.at(-1)?.[dataKey];
  const first    = data[0]?.[dataKey];
  const lastYear = data.at(-1)?.year;
  const shortRef = (
    data.find(d => d.year === lastYear - 5) ||
    data.find(d => d.year === lastYear - 4) ||
    data[Math.max(0, data.length - 6)]
  )?.[dataKey];
  if (last == null || first == null || shortRef == null) return null;

  const longBad  = last > first;
  const shortBad = last > shortRef;

  if (longBad  && shortBad)  return { key: 'red',   label: 'Worsening', detail: 'Worse long-term and recently' };
  if (!longBad && !shortBad) return { key: 'green', label: 'Improving', detail: 'Better long-term and recently' };
  return longBad
    ? { key: 'amber', label: 'Mixed', detail: 'Worse long-term, improving recently' }
    : { key: 'amber', label: 'Mixed', detail: 'Better long-term, worsening recently' };
}

const ACCENT_CLASS = { red: 'accent-red', amber: 'accent-amber', green: 'accent-green' };
const ACCENT_VAR   = { red: 'var(--red)', amber: 'var(--amber)', green: 'var(--green)' };
const ACCENT_SOFT  = { red: 'var(--red-soft)', amber: 'var(--amber-soft)', green: 'var(--green-soft)' };

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v, decimals = 2) {
  if (v == null || isNaN(v)) return '—';
  return v.toFixed(decimals);
}

function ageLabel(updatedAt) {
  if (!updatedAt) return null;
  const days = Math.floor((Date.now() - updatedAt) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function ChartTip({ active, payload, label, unit, prefix }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="tip">
      <div className="tip-year">{label}</div>
      <div className="tip-val">
        {prefix || ''}{typeof v === 'number' ? v.toFixed(2) : v}{unit || ''}
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({
  title, subtitle, note, source, explanation,
  data, dataKey, unit, prefix,
  domain, ticks, yticks, refLine,
  isLive, loading, updatedAt, maxAgeMs,
}) {
  const [showInfo, setShowInfo] = useState(false);
  const status = useMemo(() => computeStatus(data, dataKey), [data, dataKey]);
  const accentClass = status ? ACCENT_CLASS[status.key] : 'accent-ink';
  const accentVar = status ? ACCENT_VAR[status.key] : 'var(--ink-soft)';

  const last = data.at(-1)?.[dataKey];
  const first = data[0]?.[dataKey];
  const delta = (last != null && first != null) ? last - first : null;
  const pct   = (delta != null && first) ? (delta / first) * 100 : null;
  const gradId = `grad-${title.replace(/\W/g, '')}`;

  const lastYear = data.at(-1)?.year;
  const firstYear = data[0]?.year;
  const stale = isLive && updatedAt && maxAgeMs && (Date.now() - updatedAt > maxAgeMs);
  const age = ageLabel(updatedAt);

  return (
    <article className={`card ${accentClass}`}>
      <div className="card-rule"></div>
      <div className="card-body">

        <header className="card-head">
          <div>
            <h2>{title}</h2>
            <p className="sub">{subtitle}</p>
          </div>
          <div className="pills">
            <span className={`pill ${isLive ? 'pill-live' : 'pill-embed'}`}>
              <span className="pdot"></span>
              {isLive ? 'Live' : 'Embedded'}
              {isLive && age && <span className={`age ${stale ? 'stale' : ''}`}>{age}</span>}
            </span>
            {!loading && status && (
              <span className="pill pill-status" title={status.detail}>
                <span className="pdot"></span>
                {status.label}
              </span>
            )}
          </div>
        </header>

        <div className="value-row">
          <div className="value">
            {loading
              ? <span className="skeleton" style={{ width: 120 }}></span>
              : <>{prefix || ''}{fmt(last, 2)}<span className="unit">{unit}</span></>
            }
          </div>
          {!loading && delta != null && (
            <span className="delta" title={`Change since ${firstYear}`}>
              {delta >= 0 ? '▲' : '▼'} {delta >= 0 ? '+' : ''}{fmt(delta, 2)}{unit}
              <span className="pct">({delta >= 0 ? '+' : ''}{fmt(pct, 1)}% since {firstYear})</span>
            </span>
          )}
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={accentVar} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={accentVar} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="year"
                ticks={ticks || [firstYear, firstYear+4, firstYear+8, firstYear+12, firstYear+16, lastYear]}
                tickLine={false} axisLine={false}
              />
              <YAxis
                domain={domain} ticks={yticks}
                tickLine={false} axisLine={false} width={42}
              />
              <Tooltip
                content={(p) => <ChartTip {...p} unit={unit} prefix={prefix} />}
                cursor={{ stroke: 'var(--ink-faint)', strokeDasharray: '3 3' }}
              />
              {refLine && (
                <ReferenceLine
                  y={refLine.y}
                  strokeDasharray="4 4"
                  label={{ value: refLine.label, position: 'insideTopRight', fontSize: 10 }}
                />
              )}
              <Area
                type="monotone" dataKey={dataKey}
                stroke={accentVar} strokeWidth={2.25}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 4.5, fill: accentVar, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-foot">
          <p className="note">{note}</p>
          <div className="foot-meta">
            <span className="src">{source}</span>
            {explanation && (
              <button
                className="info-btn"
                aria-expanded={showInfo}
                aria-label={showInfo ? 'Hide explanation' : 'Show explanation'}
                onClick={() => setShowInfo(v => !v)}
              >
                {showInfo ? '×' : '?'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showInfo && explanation && (
        <div className="info-panel">
          <p>{explanation.text}</p>
          <p className="src-line">Source · {explanation.source}</p>
        </div>
      )}
    </article>
  );
}

// ── Summary strip cell ────────────────────────────────────────────────────────

function SummaryCell({ label, data, dataKey, unit, prefix }) {
  const status = computeStatus(data, dataKey);
  const last = data.at(-1)?.[dataKey];
  const color = status ? ACCENT_VAR[status.key] : 'var(--ink-faint)';
  const halo = status ? ACCENT_SOFT[status.key] : 'transparent';
  return (
    <div className="summary-cell">
      <span className="label">{label}</span>
      <div className="dot-row">
        <span className="dot" style={{ background: color, '--dot-halo': halo }}></span>
        <span className="status">{status?.label || '—'}</span>
      </div>
      <span className="value-mono">
        {prefix || ''}{fmt(last, 2)}{unit}
      </span>
    </div>
  );
}

// ── Data loading ──────────────────────────────────────────────────────────────

const WEEK_MS = 7   * 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

async function fetchCo2Live() {
  const r = await fetch("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt");
  if (!r.ok) throw new Error("NOAA fetch failed");
  const text = await r.text();
  return text.split("\n")
    .filter(l => l.trim() && !l.startsWith("#"))
    .map(l => { const p = l.trim().split(/\s+/); return { year: parseInt(p[0]), value: parseFloat(p[1]) }; })
    .filter(d => !isNaN(d.year) && !isNaN(d.value) && d.year >= 2004);
}

async function fetchGiniLive() {
  const r = await fetch(
    "https://api.worldbank.org/v2/country/AUS/indicator/SI.POV.GINI?format=json&mrv=30&per_page=50"
  );
  if (!r.ok) throw new Error("World Bank fetch failed");
  const json = await r.json();
  const live = (json[1] || [])
    .filter(d => d.value !== null && parseInt(d.date) >= 2004)
    .map(d => ({ year: parseInt(d.date), value: parseFloat(d.value) }))
    .sort((a, b) => a.year - b.year);
  if (live.length < 2) throw new Error("Sparse");
  return GINI_FALLBACK.map(e => live.find(r => r.year === e.year) || e);
}

function useDataSource(localPath, fetchLive, fallback, maxAgeMs) {
  const [state, setState] = useState({ data: fallback, isLive: false, loading: true, updatedAt: null });

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch(localPath);
        if (r.ok) {
          const { fetchedAt, data } = await r.json();
          const age = Date.now() - (fetchedAt || 0);
          if (data?.length > 0) {
            if (!dead) setState({ data, isLive: true, loading: false, updatedAt: fetchedAt || null });
            if (age < maxAgeMs) return;
          }
        }
      } catch (_) { /* fall through */ }

      try {
        const data = await fetchLive();
        if (data?.length > 0 && !dead)
          setState({ data, isLive: true, loading: false, updatedAt: Date.now() });
        return;
      } catch (_) { /* fall through */ }

      if (!dead) setState({ data: fallback, isLive: false, loading: false, updatedAt: null });
    })();
    return () => { dead = true; };
  }, []);

  return state;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const co2  = useDataSource("/data/co2.json",  fetchCo2Live,  CO2_FALLBACK,  WEEK_MS);
  const gini = useDataSource("/data/gini.json", fetchGiniLive, GINI_FALLBACK, YEAR_MS);

  const currentYear = new Date().getFullYear();
  const co2LastYear = co2.data.at(-1)?.year ?? 2024;

  const co2GrowthData = useMemo(() => {
    const d = co2.data;
    return d.slice(1).map((pt, i) => ({
      year: pt.year,
      growth: parseFloat((pt.value - d[i].value).toFixed(2)),
    }));
  }, [co2.data]);

  return (
    <div className="shell">
      <header className="masthead">
        <div className="eyebrow">Australian indicators · 2004 to {currentYear}</div>
        <h1>How's it <em>going?</em></h1>
        <p className="lede">
          A 20-year read on whether we're making progress. Four longitudinal metrics across climate, inequality and affordability, each scored at a glance against its own trajectory.
        </p>
      </header>

      <section className="summary" aria-label="At-a-glance summary">
        <SummaryCell label="Atmospheric CO₂"        data={co2.data}     dataKey="value" unit=" ppm" />
        <SummaryCell label="Income inequality"     data={gini.data}    dataKey="value" unit="" />
        <SummaryCell label="Wealth inequality"     data={WEALTH_GINI_DATA}  dataKey="value" unit="" />
        <SummaryCell label="Housing affordability" data={HOUSING_DATA} dataKey="ratio" unit="×" />
      </section>

      <section className="grid">
        <Card
          title="Atmospheric CO₂"
          subtitle="Mauna Loa Observatory · NOAA · annual mean concentration"
          note="Keeling Curve. 400 ppm exceeded annually from 2015. No year-on-year decline on record."
          source="NOAA GML"
          explanation={EXPLANATIONS.co2}
          data={co2.data} dataKey="value" unit=" ppm"
          domain={[370, 435]} yticks={[380, 395, 410, 425]}
          ticks={[2004, 2009, 2014, 2019, co2LastYear]}
          refLine={{ y: 400, label: '400 ppm (2015)' }}
          isLive={co2.isLive} loading={co2.loading}
          updatedAt={co2.updatedAt} maxAgeMs={WEEK_MS}
        />
        <Card
          title="CO₂ Annual Growth Rate"
          subtitle="Year-on-year change in atmospheric concentration · Mauna Loa · NOAA"
          note="'Bending the curve' means this line trending down. Rising means accelerating emissions. No year has seen a net decline."
          source="NOAA GML"
          explanation={EXPLANATIONS.co2Growth}
          data={co2GrowthData} dataKey="growth" unit=" ppm/yr"
          domain={[0, 4]} yticks={[1, 2, 3, 4]}
          ticks={[2005, 2009, 2014, 2019, co2LastYear]}
          isLive={co2.isLive} loading={co2.loading}
          updatedAt={co2.updatedAt} maxAgeMs={WEEK_MS}
        />
        <Card
          title="Income inequality, Australia"
          subtitle="Gini · post-tax disposable household income · World Bank + ABS"
          note="World Bank survey merged with ABS estimates for inter-survey years. Lower means more equal."
          source="World Bank + ABS"
          explanation={EXPLANATIONS.incomeGini}
          data={gini.data} dataKey="value"
          domain={[30, 36]} yticks={[30, 32, 34, 36]}
          ticks={[2004, 2008, 2012, 2016, 2020, 2023]}
          isLive={gini.isLive} loading={gini.loading}
          updatedAt={gini.updatedAt} maxAgeMs={YEAR_MS}
        />
        <Card
          title="Wealth inequality, Australia"
          subtitle="Gini · net worth incl. property · UBS Global Wealth Report"
          note="Wealth Gini is structurally about 2× income Gini. Assets compound and concentrate faster than wages."
          source="UBS Global Wealth Report"
          explanation={EXPLANATIONS.wealthGini}
          data={WEALTH_GINI_DATA} dataKey="value"
          domain={[55, 72]} yticks={[58, 62, 66, 70]}
          ticks={[2004, 2008, 2012, 2016, 2020, 2023]}
          refLine={{ y: 59.8, label: '2004 baseline' }}
          isLive={false} loading={false}
        />
        <Card
          title="Housing affordability, Australia"
          subtitle="Median dwelling price ÷ average full-time annual earnings · ABS"
          note="Demographia classifies above 5× as 'severely unaffordable'. COVID-era surge drove the ratio near 10×."
          source="ABS Cat. 6302.0 & 6416.0"
          explanation={EXPLANATIONS.housing}
          data={HOUSING_DATA} dataKey="ratio" unit="×"
          domain={[5, 11]} yticks={[5, 7, 9, 11]}
          ticks={[2004, 2008, 2012, 2016, 2020, 2024]}
          refLine={{ y: 3, label: '3× historic norm' }}
          isLive={false} loading={false}
        />
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <VolumeCalculator />
      </section>

      <footer className="colophon">
        <span>CO₂ refreshed weekly · Gini refreshed annually</span>
        <span>Tap <strong>?</strong> on any card for sources and methodology</span>
      </footer>
    </div>
  );
}
