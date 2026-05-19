import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ── Embedded fallback data ────────────────────────────────────────────────────
// Used when both the pre-fetched JSON and the live API are unavailable.

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

// ── Data loading ──────────────────────────────────────────────────────────────

const WEEK_MS  = 7  * 24 * 60 * 60 * 1000;
const YEAR_MS  = 365 * 24 * 60 * 60 * 1000;

async function parseCo2(text) {
  return text.split("\n")
    .filter(l => l.trim() && !l.startsWith("#"))
    .map(l => { const p = l.trim().split(/\s+/); return { year: parseInt(p[0]), value: parseFloat(p[1]) }; })
    .filter(d => !isNaN(d.year) && !isNaN(d.value) && d.year >= 2004);
}

async function fetchCo2Live() {
  const r = await fetch("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt");
  if (!r.ok) throw new Error("NOAA fetch failed");
  return parseCo2(await r.text());
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

// Priority: pre-fetched local JSON → live API → embedded fallback
function useDataSource(localPath, fetchLive, fallback, maxAgeMs) {
  const [state, setState] = useState({ data: fallback, isLive: false, loading: true, updatedAt: null });

  useEffect(() => {
    let dead = false;

    (async () => {
      // 1. Pre-fetched JSON written by GitHub Actions
      try {
        const r = await fetch(localPath);
        if (r.ok) {
          const { fetchedAt, data } = await r.json();
          const age = Date.now() - (fetchedAt || 0);
          if (data?.length > 0) {
            if (!dead) setState({ data, isLive: true, loading: false, updatedAt: fetchedAt || null });
            if (age < maxAgeMs) return;  // fresh — done
            // stale: keep showing it but also try live
          }
        }
      } catch (_) { /* fall through */ }

      // 2. Direct live fetch
      try {
        const data = await fetchLive();
        if (data?.length > 0 && !dead)
          setState({ data, isLive: true, loading: false, updatedAt: Date.now() });
        return;
      } catch (_) { /* fall through */ }

      // 3. Embedded
      if (!dead) setState({ data: fallback, isLive: false, loading: false, updatedAt: null });
    })();

    return () => { dead = true; };
  }, []);

  return state;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit, prefix }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{
      background: "#050810", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px", padding: "10px 14px",
      fontFamily: "'JetBrains Mono', monospace",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <div style={{ color: "#475569", fontSize: "11px", marginBottom: "3px" }}>{label}</div>
      <div style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: 700 }}>
        {prefix || ""}{typeof val === "number" ? val.toFixed(2) : val}{unit}
      </div>
    </div>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({ first, last, unit, color, sinceYear }) {
  if (first == null || last == null) return null;
  const delta = last - first;
  const pct = ((delta / first) * 100).toFixed(1);
  const sign = delta >= 0 ? "+" : "";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: `${color}18`, border: `1px solid ${color}30`,
      borderRadius: "20px", padding: "2px 8px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color,
    }}>
      {delta >= 0 ? "▲" : "▼"} {sign}{delta.toFixed(1)}{unit} since {sinceYear || 2004}
      <span style={{ opacity: 0.6 }}>({sign}{pct}%)</span>
    </div>
  );
}

// ── Updated-at badge ──────────────────────────────────────────────────────────

function UpdatedBadge({ updatedAt, maxAgeMs }) {
  if (!updatedAt) return null;
  const age = Date.now() - updatedAt;
  const days = Math.floor(age / (24 * 60 * 60 * 1000));
  const stale = age > maxAgeMs;
  const label = days === 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "9px", color: stale ? "#f87171" : "#334155",
      marginLeft: "6px",
    }}>
      data {label}
    </span>
  );
}

// ── Chart panel ───────────────────────────────────────────────────────────────

function Panel({
  title, subtitle, note, data, dataKey, unit, prefix, color, gradId,
  domain, ticks, yticks, refLine, source, isLive, loading,
  lastValue, firstValue, sinceYear, updatedAt, maxAgeMs,
}) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0b1120 0%, #080d18 100%)",
      border: "1px solid rgba(255,255,255,0.055)",
      borderRadius: "18px", padding: "28px 28px 20px",
      marginBottom: "20px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, ${color}dd, ${color}44, transparent)`,
      }} />
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "160px", height: "160px",
        background: `radial-gradient(circle, ${color}0a 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h2 style={{
            fontFamily: "'Barlow', sans-serif", fontSize: "16px", fontWeight: 700,
            color: "#e2e8f0", margin: 0, letterSpacing: "-0.3px",
          }}>{title}</h2>
          <p style={{
            fontFamily: "'Barlow', sans-serif", fontSize: "11px",
            color: "#334155", margin: "4px 0 0", lineHeight: 1.4,
          }}>{subtitle}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0, marginLeft: "16px" }}>
          {/* Live / Embedded badge */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
            padding: "3px 9px", borderRadius: "20px",
            border: `1px solid ${isLive ? "rgba(52,211,153,0.35)" : "rgba(71,85,105,0.4)"}`,
            color: isLive ? "#34d399" : "#475569",
            background: isLive ? "rgba(52,211,153,0.06)" : "rgba(71,85,105,0.06)",
            letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: isLive ? "#34d399" : "#475569",
              boxShadow: isLive ? "0 0 6px #34d399" : "none", display: "inline-block",
            }} />
            {isLive ? "LIVE" : "EMBEDDED"}
            {isLive && <UpdatedBadge updatedAt={updatedAt} maxAgeMs={maxAgeMs} />}
          </div>

          {/* Current value */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "30px", fontWeight: 700,
            color: loading ? "#1e293b" : color, lineHeight: 1, textAlign: "right",
            textShadow: `0 0 30px ${color}55`, transition: "color 0.3s",
          }}>
            {loading ? "···" : `${prefix || ""}${lastValue?.toFixed(2)}${unit}`}
          </div>
        </div>
      </div>

      {/* Delta */}
      {!loading && firstValue != null && (
        <div style={{ marginBottom: "14px" }}>
          <DeltaBadge first={firstValue} last={lastValue} unit={unit} color={color} sinceYear={sinceYear} />
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top: 5, right: 2, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="year"
            ticks={ticks || [2004, 2008, 2012, 2016, 2020, 2024]}
            tick={{ fill: "#1e3a5f", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            domain={domain} ticks={yticks}
            tick={{ fill: "#1e3a5f", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            tickLine={false} axisLine={false} width={42}
          />
          <Tooltip content={(p) => <ChartTooltip {...p} unit={unit} prefix={prefix} />} />
          {refLine && (
            <ReferenceLine
              y={refLine.y} stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5"
              label={{ value: refLine.label, fill: "#2d4a6b", fontSize: 9, position: "insideTopRight", fontFamily: "'JetBrains Mono', monospace" }}
            />
          )}
          <Area
            type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fill={`url(#${gradId})`} dot={false}
            activeDot={{ r: 4, fill: color, stroke: "#080d18", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "10px" }}>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", color: "#172033", margin: 0, maxWidth: "70%" }}>
          {note}
        </p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#172033", margin: 0, textAlign: "right" }}>
          {source}
        </p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Barlow:wght@400;600;700;800&display=swap";
    link.onload = () => setFontsReady(true);
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const co2  = useDataSource("/data/co2.json",  fetchCo2Live,  CO2_FALLBACK,  WEEK_MS);
  const gini = useDataSource("/data/gini.json", fetchGiniLive, GINI_FALLBACK, YEAR_MS);

  const lastCo2     = co2.data[co2.data.length - 1]?.value;
  const lastGini    = gini.data[gini.data.length - 1]?.value;
  const lastWealth  = WEALTH_GINI_DATA[WEALTH_GINI_DATA.length - 1]?.value;
  const lastHousing = HOUSING_DATA[HOUSING_DATA.length - 1]?.ratio;

  return (
    <div style={{
      minHeight: "100vh", background: "#060910",
      padding: "36px 20px 48px",
      backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      fontFamily: fontsReady ? "'Barlow', sans-serif" : "system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "740px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#1a3050",
            letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "10px",
          }}>
            GLOBAL INDICATORS · 2004 – {new Date().getFullYear()}
          </div>
          <h1 style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800,
            color: "#e2e8f0", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1,
          }}>
            How&rsquo;s It Going?
          </h1>
          <p style={{ color: "#243552", marginTop: "8px", fontSize: "13px" }}>
            Atmospheric CO₂ · Australian Inequality (Income &amp; Wealth) · Housing Affordability
          </p>
        </div>

        {/* CO₂ */}
        <Panel
          title="Atmospheric CO₂"
          subtitle="Mauna Loa Observatory, Hawaiʻi · NOAA Global Monitoring Laboratory · Annual mean concentration"
          note="Keeling Curve. 400 ppm exceeded on annual basis from 2015. No year-on-year decline recorded in the modern record."
          data={co2.data} dataKey="value" unit=" ppm"
          color="#f87171" gradId="gradCo2"
          domain={[370, 435]} yticks={[380, 390, 400, 410, 420, 430]}
          ticks={[2004, 2008, 2012, 2016, 2020, co2.data.at(-1)?.year ?? 2024]}
          refLine={{ y: 400, label: "400 ppm (2015)" }}
          source="NOAA GML · gml.noaa.gov"
          isLive={co2.isLive} loading={co2.loading}
          lastValue={lastCo2} firstValue={co2.data[0]?.value}
          updatedAt={co2.updatedAt} maxAgeMs={WEEK_MS}
        />

        {/* Income Gini */}
        <Panel
          title="Income Inequality — Australia"
          subtitle="Gini coefficient · Post-tax, post-transfer disposable household income · World Bank / ABS HILDA Survey"
          note="World Bank survey data merged with ABS interpolation for inter-survey years. Lower = more equal."
          data={gini.data} dataKey="value" unit=""
          color="#fbbf24" gradId="gradGini"
          domain={[30, 36]} yticks={[30, 31, 32, 33, 34, 35, 36]}
          source="World Bank SI.POV.GINI + ABS Cat. 6523.0"
          isLive={gini.isLive} loading={gini.loading}
          lastValue={lastGini} firstValue={gini.data[0]?.value}
          updatedAt={gini.updatedAt} maxAgeMs={YEAR_MS}
        />

        {/* Wealth Gini */}
        <Panel
          title="Wealth Inequality — Australia"
          subtitle="Gini coefficient · Net worth (all assets minus liabilities, incl. property) · Credit Suisse / UBS Global Wealth Report"
          note="Wealth Gini is structurally ~2× the income Gini because assets compound and concentrate far faster than wages. 2021 spike driven by zero-rate property & equity boom; slight retreat as rates rose from 2022."
          data={WEALTH_GINI_DATA} dataKey="value" unit=""
          color="#f472b6" gradId="gradWealthGini"
          domain={[55, 72]} yticks={[55, 58, 61, 64, 67, 70]}
          refLine={{ y: 59.8, label: "2004 baseline 59.8" }}
          source="Credit Suisse/UBS Global Wealth Report · ABS/HILDA (pre-2010)"
          isLive={false} loading={false}
          lastValue={lastWealth} firstValue={WEALTH_GINI_DATA[0]?.value}
          updatedAt={null} maxAgeMs={YEAR_MS}
        />

        {/* Housing */}
        <Panel
          title="Housing Affordability — Australia"
          subtitle="Median dwelling price (8 capital cities, weighted) ÷ Average full-time annual earnings · ABS"
          note="COVID-era zero-rate surge (2021) drove ratio to near-record 9.8× in 2022. A ratio of 3× is considered 'affordable' by Demographia."
          data={HOUSING_DATA} dataKey="ratio" unit="×"
          color="#a78bfa" gradId="gradHousing"
          domain={[5, 11]} yticks={[5, 6, 7, 8, 9, 10, 11]}
          refLine={{ y: 6.5, label: "2004 baseline ~6.5×" }}
          source="ABS Cat. 6302.0 & 6416.0"
          isLive={false} loading={false}
          lastValue={lastHousing} firstValue={HOUSING_DATA[0]?.ratio}
          updatedAt={null} maxAgeMs={YEAR_MS}
        />

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px", color: "#131e30", letterSpacing: "0.05em",
          }}>
            CO₂ data refreshed weekly · Gini data refreshed annually · Embedded data from authoritative public sources
          </p>
        </div>
      </div>
    </div>
  );
}
