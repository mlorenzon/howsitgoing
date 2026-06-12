import { useState, useMemo } from "react";

// Body density model: fat (~900 kg/m³) lowers density; lean mass raises it.
// Calibrated so BMI 22 → 985 kg/m³ (typical measured average).
function bodyDensity(bmi) {
  return Math.max(940, Math.min(1050, 985 - (bmi - 22) * 1.5));
}

// Geographic & notable areas (km²) — all figures from Wikipedia.
// Sorted ascending so slice logic is simple.
const FEATURES = [
  { name: "Vatican City",          area: 0.44       },
  { name: "Disneyland (Anaheim)",  area: 0.85       },
  { name: "Monaco",                area: 2.02       },
  { name: "Central Park, NYC",     area: 3.41       },
  { name: "Gibraltar",             area: 6.80       },
  { name: "Nauru",                 area: 21         },
  { name: "Tuvalu",                area: 26         },
  { name: "Macau",                 area: 33.3       },
  { name: "Bermuda",               area: 54         },
  { name: "Manhattan",             area: 59.1       },
  { name: "San Marino",            area: 61.2       },
  { name: "Guernsey",              area: 78         },
  { name: "Jersey",                area: 118        },
  { name: "San Francisco (city)",  area: 121.4      },
  { name: "Liechtenstein",         area: 160        },
  { name: "Aruba",                 area: 180        },
  { name: "Marshall Islands",      area: 181        },
  { name: "Maldives",              area: 298        },
  { name: "Malta",                 area: 316        },
  { name: "Barbados",              area: 431        },
  { name: "Andorra",               area: 468        },
  { name: "Singapore",             area: 734        },
  { name: "Bahrain",               area: 778        },
  { name: "Hong Kong",             area: 1_114      },
  { name: "Samoa",                 area: 2_842      },
  { name: "Rhode Island",          area: 4_001      },
  { name: "Cyprus",                area: 9_251      },
  { name: "Jamaica",               area: 10_990     },
  { name: "Switzerland",           area: 41_285     },
  { name: "South Korea",           area: 100_210    },
  { name: "United Kingdom",        area: 243_610    },
  { name: "Germany",               area: 357_114    },
  { name: "France",                area: 643_801    },
  { name: "Nigeria",               area: 923_768    },
  { name: "India",                 area: 3_287_263  },
  { name: "Australia",             area: 7_692_024  },
  { name: "Antarctica",            area: 14_000_000 },
  { name: "Russia",                area: 17_098_242 },
  { name: "Africa",                area: 30_370_000 },
  { name: "Asia",                  area: 44_579_000 },
  { name: "Earth's land surface",  area: 148_940_000},
  { name: "the Pacific Ocean",     area: 165_250_000},
  { name: "Earth's total surface", area: 510_100_000},
].sort((a, b) => a.area - b.area);

function findComparison(areaKm2) {
  const logA = Math.log(areaKm2);
  const ranked = [...FEATURES].sort(
    (a, b) => Math.abs(Math.log(a.area) - logA) - Math.abs(Math.log(b.area) - logA)
  );
  const best = ranked[0];
  const idx  = FEATURES.indexOf(best);
  const smaller = FEATURES.slice(Math.max(0, idx - 2), idx);
  const larger  = FEATURES.slice(idx + 1, Math.min(FEATURES.length, idx + 3));
  return { best, smaller, larger };
}

function fmtArea(km2) {
  if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(1)}M km²`;
  if (km2 >= 1_000)     return `${Math.round(km2).toLocaleString("en")} km²`;
  if (km2 >= 1)         return `${km2.toFixed(1)} km²`;
  return `${(km2 * 1e6).toFixed(0)} m²`;
}

function ScaleBars({ entries }) {
  const logValues = entries.map(e => Math.log(e.area));
  const logMin    = Math.min(...logValues);
  const logMax    = Math.max(...logValues);
  const logRange  = logMax - logMin || 1;

  return (
    <div className="vol-scale">
      {entries.map(e => {
        const pct  = ((Math.log(e.area) - logMin) / logRange) * 85 + 5;
        const diff = ((e.area - e.userArea) / e.userArea) * 100;
        const rel  = e.isUser
          ? null
          : Math.abs(diff) < 2
            ? "≈ same"
            : diff < 0
              ? `${Math.abs(diff).toFixed(0)}% smaller`
              : `${diff.toFixed(0)}% larger`;

        return (
          <div
            key={e.id}
            className={[
              "sbar-row",
              e.isBest ? "sbar-best" : "",
              e.isUser ? "sbar-user" : "",
            ].filter(Boolean).join(" ")}
          >
            <span className="sbar-name">{e.name}</span>
            <div className="sbar-track">
              <div className="sbar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="sbar-area">{fmtArea(e.area)}</span>
            {rel && <span className="sbar-rel">{rel}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function VolumeCalculator() {
  const [mode, setMode] = useState("metric");
  const [hCm, setHCm]   = useState("");
  const [hFt, setHFt]   = useState("");
  const [hIn, setHIn]   = useState("");
  const [wKg, setWKg]   = useState("");
  const [wLb, setWLb]   = useState("");

  const result = useMemo(() => {
    let kg, cm;
    if (mode === "metric") {
      kg = parseFloat(wKg);
      cm = parseFloat(hCm);
    } else {
      const ft  = parseFloat(hFt) || 0;
      const ins = parseFloat(hIn) || 0;
      cm  = (ft * 12 + ins) * 2.54;
      kg  = parseFloat(wLb) / 2.20462;
    }
    if (!kg || !cm || isNaN(kg) || isNaN(cm) || kg <= 0 || cm <= 0) return null;

    const hM    = cm / 100;
    const bmi   = kg / (hM * hM);
    const rho   = bodyDensity(bmi);
    const volM3 = kg / rho;
    const aM2   = volM3 / 1e-9;
    const aKm2  = aM2 / 1e6;
    const { best, smaller, larger } = findComparison(aKm2);

    // Build sorted scale entries interleaving "you" at correct position
    const userEntry = { id: "__you__", name: "you", area: aKm2, isUser: true, isBest: false, userArea: aKm2 };
    const scaleEntries = [
      ...smaller.map(f => ({ id: f.name, ...f, isUser: false, isBest: false, userArea: aKm2 })),
      { id: best.name, ...best, isUser: false, isBest: true, userArea: aKm2 },
      ...larger.map(f => ({ id: f.name, ...f, isUser: false, isBest: false, userArea: aKm2 })),
      userEntry,
    ].sort((a, b) => a.area - b.area);

    return { kg, cm, bmi, rho, volM3, aM2, aKm2, best, smaller, larger, scaleEntries };
  }, [mode, hCm, hFt, hIn, wKg, wLb]);

  return (
    <article className="card accent-blue vol-full">
      <div className="card-rule" />
      <div className="card-body">

        <header className="card-head">
          <div>
            <h2>Body volume calculator</h2>
            <p className="sub">
              Enter your height and weight to find out how much of the world map
              you&apos;d cover if you were spread one nanometre thin.
            </p>
          </div>
          <div className="pills">
            <span className="pill pill-embed">
              <span className="pdot" />
              Calculator
            </span>
          </div>
        </header>

        {/* Unit toggle */}
        <div>
          <div className="vol-toggle">
            <button
              className={`toggle-btn${mode === "metric" ? " active" : ""}`}
              onClick={() => setMode("metric")}
            >Metric</button>
            <button
              className={`toggle-btn${mode === "imperial" ? " active" : ""}`}
              onClick={() => setMode("imperial")}
            >Imperial</button>
          </div>
        </div>

        {/* Inputs */}
        <div className="vol-inputs">
          {mode === "metric" ? (
            <>
              <label className="vol-field">
                <span>Height</span>
                <div className="input-wrap">
                  <input type="number" placeholder="170" min="50" max="280"
                    value={hCm} onChange={e => setHCm(e.target.value)} />
                  <span className="unit-label">cm</span>
                </div>
              </label>
              <label className="vol-field">
                <span>Weight</span>
                <div className="input-wrap">
                  <input type="number" placeholder="70" min="10" max="600"
                    value={wKg} onChange={e => setWKg(e.target.value)} />
                  <span className="unit-label">kg</span>
                </div>
              </label>
            </>
          ) : (
            <>
              <label className="vol-field">
                <span>Height</span>
                <div className="input-wrap input-wrap--double">
                  <input type="number" placeholder="5" min="1" max="9"
                    value={hFt} onChange={e => setHFt(e.target.value)} />
                  <span className="unit-label">ft</span>
                  <input type="number" placeholder="10" min="0" max="11"
                    value={hIn} onChange={e => setHIn(e.target.value)} />
                  <span className="unit-label">in</span>
                </div>
              </label>
              <label className="vol-field">
                <span>Weight</span>
                <div className="input-wrap">
                  <input type="number" placeholder="154" min="20" max="1300"
                    value={wLb} onChange={e => setWLb(e.target.value)} />
                  <span className="unit-label">lbs</span>
                </div>
              </label>
            </>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="vol-results">

            <div className="vol-step">
              <div className="step-label">1 · Body volume</div>
              <div className="step-value">
                {(result.volM3 * 1000).toFixed(1)}
                <span className="step-unit"> litres</span>
              </div>
              <div className="step-detail">
                {result.kg.toFixed(1)} kg ÷ {result.rho} kg/m³
                {" = "}{result.volM3.toFixed(5)} m³
                {" · "}BMI {result.bmi.toFixed(1)} → density {result.rho} kg/m³
              </div>
            </div>

            <div className="vol-step">
              <div className="step-label">2 · Area at 1 nanometre thick</div>
              <div className="step-value">
                {fmtArea(result.aKm2)}
              </div>
              <div className="step-detail">
                {result.volM3.toFixed(5)} m³ ÷ 1×10⁻⁹ m
                {" = "}{result.aM2.toExponential(3)} m²
                {" = "}{result.aKm2.toFixed(1)} km²
                {" · "}1 nm ≈ width of 10 hydrogen atoms
              </div>
            </div>

            <div className="vol-step vol-step--match">
              <div className="step-label">3 · Geographic match</div>
              <p className="vol-sentence">
                Spread one nanometre thin, you&apos;d blanket an area roughly the size of{" "}
                <strong>{result.best.name}</strong> ({fmtArea(result.best.area)}).
              </p>
              <ScaleBars entries={result.scaleEntries} />
            </div>

          </div>
        )}

        <div className="card-foot">
          <p className="note">
            Density model: 985 − (BMI − 22) × 1.5 kg/m³, clamped 940–1050 · Areas from Wikipedia
          </p>
          <div className="foot-meta">
            <span className="src">Wikipedia</span>
          </div>
        </div>

      </div>
    </article>
  );
}
