#!/usr/bin/env node
// Fetches annual mean CO₂ from NOAA GML and writes public/data/co2.json.
// Run: node scripts/fetch-co2.mjs
// GitHub Actions runs this weekly; it's also safe to run locally.

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'public', 'data', 'co2.json');
const URL  = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt';

const res  = await fetch(URL);
if (!res.ok) throw new Error(`HTTP ${res.status} from NOAA`);
const text = await res.text();

const data = text.split('\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .map(l => {
    const [y, v] = l.trim().split(/\s+/);
    return { year: parseInt(y), value: parseFloat(v) };
  })
  .filter(d => !isNaN(d.year) && !isNaN(d.value) && d.year >= 2004);

if (data.length < 5) throw new Error(`Only ${data.length} rows parsed — aborting`);

mkdirSync(join(ROOT, 'public', 'data'), { recursive: true });
writeFileSync(OUT, JSON.stringify({ fetchedAt: Date.now(), source: 'NOAA GML Mauna Loa Observatory', data }, null, 2));
console.log(`co2.json updated — ${data.length} annual records, latest ${data.at(-1).year}: ${data.at(-1).value} ppm`);
