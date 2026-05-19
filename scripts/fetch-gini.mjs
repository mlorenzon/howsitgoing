#!/usr/bin/env node
// Fetches Australian income Gini from World Bank and merges with ABS interpolation.
// Run: node scripts/fetch-gini.mjs
// GitHub Actions runs this on January 1 each year.

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'public', 'data', 'gini.json');
const URL  = 'https://api.worldbank.org/v2/country/AUS/indicator/SI.POV.GINI?format=json&mrv=30&per_page=50';

// ABS-derived interpolation for years World Bank doesn't survey
const INTERPOLATED = [
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

const res  = await fetch(URL);
if (!res.ok) throw new Error(`HTTP ${res.status} from World Bank`);
const json = await res.json();

const live = (json[1] || [])
  .filter(d => d.value !== null && parseInt(d.date) >= 2004)
  .map(d => ({ year: parseInt(d.date), value: parseFloat(d.value) }))
  .sort((a, b) => a.year - b.year);

if (live.length < 2) throw new Error(`Only ${live.length} live points — aborting`);

// Merge: World Bank values take priority over interpolated values
const merged = new Map(INTERPOLATED.map(e => [e.year, e]));
for (const pt of live) merged.set(pt.year, pt);
const data = [...merged.values()].sort((a, b) => a.year - b.year);

mkdirSync(join(ROOT, 'public', 'data'), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  fetchedAt: Date.now(),
  source: 'World Bank SI.POV.GINI + ABS Cat. 6523.0 interpolation',
  data,
}, null, 2));
console.log(`gini.json updated — ${data.length} records, latest ${data.at(-1).year}: ${data.at(-1).value}`);
