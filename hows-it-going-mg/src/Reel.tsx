// Main Reel composition — all 9 scenes sequenced for Remotion
// Each scene component uses useCurrentFrame() so timing is frame-exact.

import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  C,
  Card,
  CountUp,
  DeltaBadge,
  Eyebrow,
  FONT_MONO,
  FONT_UI,
  LineChart,
  RateBars,
  SAFE_Y_TOP,
  SIDE_PAD,
  CONTENT_W,
  StatusPill,
} from './components';
import { clamp, Easing, entryExit, phase } from './animations';
import { CO2_DATA, CO2_RATE, GINI_DATA, HOUSING_DATA, WEALTH_DATA } from './data';

// ── Scene 1: Title "How's It Going?" ────────────────────────
function SceneTitle({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.5, 0.5);
  const eyeP = phase(localTime, 0.0, 0.5);
  const titleP = phase(localTime, 0.25, 1.0);
  const subP = phase(localTime, 0.7, 1.2);

  return (
    <div
      style={{
        position: 'absolute',
        left: SIDE_PAD,
        top: SAFE_Y_TOP + 60,
        width: CONTENT_W,
        opacity,
        transform: `translateY(${slide}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <div style={{ opacity: eyeP, transform: `translateX(${(1 - eyeP) * -20}px)` }}>
        <Eyebrow text="Global Indicators · 2004 – 2025" color={C.textSoft} progress={eyeP} />
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 168,
          lineHeight: 0.92,
          letterSpacing: '-0.045em',
          color: C.text,
          opacity: titleP,
          transform: `translateY(${(1 - titleP) * 30}px)`,
        }}
      >
        How's it{' '}
        <em style={{ fontStyle: 'italic', fontWeight: 400, color: C.textSoft }}>going?</em>
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: FONT_MONO,
          fontSize: 26,
          color: C.textFaint,
          letterSpacing: '0.04em',
          opacity: subP,
          transform: `translateY(${(1 - subP) * 14}px)`,
        }}
      >
        A 20-year read on whether we're making progress.
      </p>
    </div>
  );
}

// ── Scene 2: Atmospheric CO₂ chart ──────────────────────────
function SceneCO2({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.5, 0.5);
  const innerP = clamp((localTime - 0.45) / (duration - 0.9), 0, 1);
  const numP = phase(localTime, 1.4, 2.4);
  const pillP = phase(localTime, 2.0, 2.6, Easing.easeOutBack);

  return (
    <div style={{ opacity, transform: `translateY(${slide}px)` }}>
      <Card color={C.red}>
        <Eyebrow
          text="Atmospheric CO₂ · Mauna Loa"
          color={C.red}
          progress={phase(localTime, 0, 0.4)}
        />
        <LineChart
          data={CO2_DATA}
          color={C.red}
          domain={[370, 432]}
          refLineY={400}
          refLineLabel="400 PPM (2015)"
          progress={innerP}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            marginTop: 4,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 92,
              fontWeight: 700,
              color: C.red,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              opacity: clamp(numP, 0, 1),
              transform: `translateY(${(1 - numP) * 16}px)`,
            }}
          >
            <CountUp to={427.35} progress={numP} decimals={2} />
            <span style={{ fontSize: 36, color: C.textSoft, marginLeft: 10 }}>PPM</span>
          </div>
          <DeltaBadge delta={49.65} pct={13.1} unit=" ppm" color={C.red} progress={numP} />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <StatusPill color={C.red} label="Worsening" progress={pillP} />
        </div>
      </Card>
    </div>
  );
}

// ── Scene 3: CO₂ annual rate (bar chart) ────────────────────
function SceneCO2Rate({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.3, 0.35);
  const inP = clamp((localTime - 0.25) / (duration - 0.6), 0, 1);
  const numP = phase(localTime, 0.6, 1.1);

  return (
    <div style={{ opacity, transform: `translateY(${slide}px)` }}>
      <Card color={C.red}>
        <Eyebrow
          text="Annual increase, ppm / year"
          color={C.red}
          progress={phase(localTime, 0, 0.3)}
        />
        <RateBars data={CO2_RATE} color={C.red} progress={inP} />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 22,
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT_UI,
              fontSize: 64,
              fontWeight: 700,
              color: C.text,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              opacity: numP,
              transform: `translateY(${(1 - numP) * 12}px)`,
            }}
          >
            Also going up.
          </div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <StatusPill
            color={C.red}
            label="Accelerating"
            progress={phase(localTime, 0.8, 1.3, Easing.easeOutBack)}
          />
        </div>
      </Card>
    </div>
  );
}

// ── Scene 4: Income inequality ───────────────────────────────
function SceneIncome({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.25, 0.35);
  const inP = clamp((localTime - 0.2) / (duration - 0.5), 0, 1);
  const numP = phase(localTime, 0.7, 1.2);
  const pillP = phase(localTime, 1.0, 1.5, Easing.easeOutBack);

  return (
    <div style={{ opacity, transform: `translateY(${slide}px)` }}>
      <Card color={C.green}>
        <Eyebrow
          text="Income inequality · Australia"
          color={C.green}
          progress={phase(localTime, 0, 0.3)}
        />
        <LineChart data={GINI_DATA} color={C.green} domain={[30.5, 36]} progress={inP} />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 92,
              fontWeight: 700,
              color: C.green,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              opacity: numP,
              transform: `translateY(${(1 - numP) * 16}px)`,
            }}
          >
            <CountUp to={32.3} progress={numP} decimals={2} />
            <span style={{ fontSize: 32, color: C.textSoft, marginLeft: 10 }}>GINI</span>
          </div>
          <DeltaBadge delta={-0.8} pct={-2.4} color={C.green} progress={numP} />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <StatusPill color={C.green} label="Improving" progress={pillP} />
        </div>
      </Card>
    </div>
  );
}

// ── Scene 5: Wealth inequality ───────────────────────────────
function SceneWealth({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.3, 0.4);
  const inP = clamp((localTime - 0.3) / (duration - 0.7), 0, 1);
  const numP = phase(localTime, 1.0, 1.6);
  const pillP = phase(localTime, 1.6, 2.2, Easing.easeOutBack);
  const tagP = phase(localTime, 3.0, 3.6);

  return (
    <div style={{ opacity, transform: `translateY(${slide}px)` }}>
      <Card color={C.amber}>
        <Eyebrow
          text="Wealth inequality · Australia"
          color={C.amber}
          progress={phase(localTime, 0, 0.3)}
        />
        <LineChart
          data={WEALTH_DATA}
          color={C.amber}
          domain={[58, 68]}
          progress={inP}
          highlightLastN={3}
          highlightColor={C.green}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 22,
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 92,
              fontWeight: 700,
              color: C.amber,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              opacity: numP,
              transform: `translateY(${(1 - numP) * 16}px)`,
            }}
          >
            <CountUp to={65.6} progress={numP} decimals={2} />
            <span style={{ fontSize: 32, color: C.textSoft, marginLeft: 10 }}>GINI</span>
          </div>
          <DeltaBadge delta={5.8} pct={9.7} color={C.amber} progress={numP} />
        </div>
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <StatusPill color={C.amber} label="Mixed" progress={pillP} />
          <div
            style={{
              fontFamily: FONT_UI,
              fontStyle: 'italic',
              fontSize: 30,
              color: C.green,
              opacity: tagP,
              transform: `translateX(${(1 - tagP) * -12}px)`,
            }}
          >
            …turning a corner?
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Scene 6: Housing affordability ──────────────────────────
function SceneHousing({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.25, 0.35);
  const inP = clamp((localTime - 0.2) / (duration - 0.5), 0, 1);
  const numP = phase(localTime, 0.7, 1.2);
  const pillP = phase(localTime, 1.0, 1.5, Easing.easeOutBack);

  return (
    <div style={{ opacity, transform: `translateY(${slide}px)` }}>
      <Card color={C.red}>
        <Eyebrow
          text="Housing affordability · Australia"
          color={C.red}
          progress={phase(localTime, 0, 0.3)}
        />
        <LineChart
          data={HOUSING_DATA}
          color={C.red}
          domain={[5, 10.5]}
          refLineY={5}
          refLineLabel='"Severely unaffordable" (5×)'
          progress={inP}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 92,
              fontWeight: 700,
              color: C.red,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              opacity: numP,
              transform: `translateY(${(1 - numP) * 16}px)`,
            }}
          >
            <CountUp to={9.3} progress={numP} decimals={2} />
            <span style={{ fontSize: 36, color: C.textSoft, marginLeft: 6 }}>×</span>
          </div>
          <DeltaBadge delta={2.8} pct={43.1} unit="×" color={C.red} progress={numP} />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <StatusPill color={C.red} label="Still a mess" progress={pillP} />
        </div>
      </Card>
    </div>
  );
}

// ── Scene 7: Verdict 4-up summary ───────────────────────────
const VERDICT_ROWS = [
  { label: 'Atmospheric CO₂',      val: '427.35 PPM', color: C.red,   status: 'Worsening'    },
  { label: 'Income inequality',    val: '32.30 GINI', color: C.green, status: 'Improving'    },
  { label: 'Wealth inequality',    val: '65.60 GINI', color: C.amber, status: 'Mixed'        },
  { label: 'Housing affordability', val: '9.30×',     color: C.red,   status: 'Still a mess' },
];

function SceneSummary({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.4, 0.55);
  const verdictP = phase(localTime, duration - 4.0, duration - 3.2, Easing.easeOutBack);

  return (
    <div style={{ opacity, transform: `translateY(${slide}px)` }}>
      <Card color={C.text}>
        <Eyebrow text="The verdict" color={C.text} progress={phase(localTime, 0, 0.3)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 6 }}>
          {VERDICT_ROWS.map((r, i) => {
            const rowP = phase(
              localTime,
              0.4 + i * 0.25,
              1.0 + i * 0.25,
              Easing.easeOutCubic,
            );
            return (
              <div
                key={r.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr auto',
                  gap: 22,
                  alignItems: 'center',
                  opacity: rowP,
                  transform: `translateX(${(1 - rowP) * -28}px)`,
                  paddingBottom: 14,
                  borderBottom: i < VERDICT_ROWS.length - 1 ? `1px solid ${C.inkBorder}` : 'none',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: r.color,
                    boxShadow: `0 0 18px ${r.color}aa`,
                    justifySelf: 'center',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: FONT_UI,
                      fontSize: 30,
                      fontWeight: 600,
                      color: C.text,
                      lineHeight: 1.1,
                    }}
                  >
                    {r.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 22,
                      fontWeight: 500,
                      color: r.color,
                      marginTop: 4,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {r.status}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 30,
                    fontWeight: 700,
                    color: C.text,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.val}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 'auto',
            textAlign: 'center',
            opacity: verdictP,
            transform: `scale(${0.85 + 0.15 * verdictP})`,
            transformOrigin: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '18px 36px',
              background: C.red,
              color: C.text,
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: '-0.01em',
              borderRadius: 18,
              boxShadow: `0 0 40px ${C.red}88`,
            }}
          >
            We're not doing enough.
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Scene 8: Link in bio ─────────────────────────────────────
function SceneLink({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.3, 0.35);
  const arrowP = phase(localTime, 0.4, 1.2, Easing.easeOutBack);
  const urlP = phase(localTime, 0.2, 0.8);

  return (
    <div
      style={{
        position: 'absolute',
        left: SIDE_PAD,
        top: SAFE_Y_TOP + 140,
        width: CONTENT_W,
        opacity,
        transform: `translateY(${slide}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 24,
          color: C.text,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          opacity: phase(localTime, 0, 0.4),
        }}
      >
        Try it yourself
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 108,
          color: C.text,
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
          opacity: urlP,
          transform: `translateY(${(1 - urlP) * 24}px)`,
        }}
      >
        Link in bio ↗
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 26,
          padding: '14px 26px',
          border: `1.5px solid ${C.inkBorder}`,
          background: C.ink,
          color: C.textSoft,
          borderRadius: 14,
          opacity: arrowP,
          transform: `translateY(${(1 - arrowP) * 16}px)`,
        }}
      >
        mlorenzon.github.io/howsitgoing
      </div>
    </div>
  );
}

// ── Scene 9: What's in your dashboard? ──────────────────────
function SceneQuestion({ duration }: { duration: number }) {
  const { fps } = useVideoConfig();
  const localTime = useCurrentFrame() / fps;

  const { opacity, slide } = entryExit(localTime, duration, 0.35, 0.4);
  const lineP = phase(localTime, 0.0, 0.5);
  const bigP = phase(localTime, 0.35, 1.0);

  return (
    <div
      style={{
        position: 'absolute',
        left: SIDE_PAD,
        top: SAFE_Y_TOP + 100,
        width: CONTENT_W,
        opacity,
        transform: `translateY(${slide}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 30,
      }}
    >
      <div style={{ opacity: lineP }}>
        <Eyebrow text="Your turn" color={C.textSoft} progress={lineP} />
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 124,
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
          color: C.text,
          opacity: bigP,
          transform: `translateY(${(1 - bigP) * 24}px)`,
        }}
      >
        What's in{' '}
        <em style={{ fontStyle: 'italic', fontWeight: 400, color: C.amber }}>your</em> dashboard?
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: FONT_MONO,
          fontSize: 26,
          color: C.textFaint,
          letterSpacing: '0.04em',
          opacity: phase(localTime, 0.8, 1.4),
        }}
      >
        Tell me in the comments ↓
      </p>
    </div>
  );
}

// ── Scene timeline ────────────────────────────────────────────
// Matches the spoken-transcript boundaries from motion-scenes.jsx / README.
const SCENES = [
  { Comp: SceneTitle,    start:  5.40, end: 10.20 },
  { Comp: SceneCO2,      start: 10.40, end: 17.90 },
  { Comp: SceneCO2Rate,  start: 17.95, end: 19.70 },
  { Comp: SceneIncome,   start: 19.75, end: 22.40 },
  { Comp: SceneWealth,   start: 22.50, end: 28.50 },
  { Comp: SceneHousing,  start: 28.55, end: 31.40 },
  { Comp: SceneSummary,  start: 31.60, end: 45.70 },
  { Comp: SceneLink,     start: 45.85, end: 48.30 },
  { Comp: SceneQuestion, start: 48.40, end: 51.50 },
] as const;

// ── Root Reel component ───────────────────────────────────────
export const Reel: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      {SCENES.map(({ Comp, start, end }) => {
        const duration = end - start;
        return (
          <Sequence
            key={start}
            from={Math.round(start * fps)}
            durationInFrames={Math.round(duration * fps)}
          >
            <Comp duration={duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
