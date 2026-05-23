// Data arrays — copied verbatim from motion-scenes.jsx (mirrors the dashboard)

export const CO2_DATA = [
  { year: 2004, value: 377.70 }, { year: 2005, value: 379.98 }, { year: 2006, value: 382.09 },
  { year: 2007, value: 384.02 }, { year: 2008, value: 385.83 }, { year: 2009, value: 387.64 },
  { year: 2010, value: 390.10 }, { year: 2011, value: 391.85 }, { year: 2012, value: 394.06 },
  { year: 2013, value: 396.74 }, { year: 2014, value: 398.81 }, { year: 2015, value: 401.01 },
  { year: 2016, value: 404.41 }, { year: 2017, value: 406.76 }, { year: 2018, value: 408.72 },
  { year: 2019, value: 411.65 }, { year: 2020, value: 414.21 }, { year: 2021, value: 416.41 },
  { year: 2022, value: 418.53 }, { year: 2023, value: 421.08 }, { year: 2024, value: 424.61 },
  { year: 2025, value: 427.35 },
];

export const GINI_DATA = [
  { year: 2004, value: 33.1 }, { year: 2005, value: 33.0 }, { year: 2006, value: 33.4 },
  { year: 2007, value: 34.0 }, { year: 2008, value: 35.4 }, { year: 2009, value: 33.9 },
  { year: 2010, value: 34.7 }, { year: 2011, value: 33.4 }, { year: 2012, value: 33.5 },
  { year: 2013, value: 33.5 }, { year: 2014, value: 34.4 }, { year: 2015, value: 33.4 },
  { year: 2016, value: 33.7 }, { year: 2017, value: 33.2 }, { year: 2018, value: 34.3 },
  { year: 2019, value: 33.1 }, { year: 2020, value: 33.8 }, { year: 2021, value: 32.3 },
  { year: 2022, value: 32.1 }, { year: 2023, value: 32.3 },
];

export const WEALTH_DATA = [
  { year: 2004, value: 59.8 }, { year: 2005, value: 60.3 }, { year: 2006, value: 61.0 },
  { year: 2007, value: 62.1 }, { year: 2008, value: 61.4 }, { year: 2009, value: 61.9 },
  { year: 2010, value: 62.5 }, { year: 2011, value: 62.8 }, { year: 2012, value: 63.2 },
  { year: 2013, value: 63.8 }, { year: 2014, value: 64.5 }, { year: 2015, value: 65.3 },
  { year: 2016, value: 64.9 }, { year: 2017, value: 65.6 }, { year: 2018, value: 66.2 },
  { year: 2019, value: 65.7 }, { year: 2020, value: 65.9 }, { year: 2021, value: 66.8 },
  { year: 2022, value: 65.9 }, { year: 2023, value: 65.6 },
];

export const HOUSING_DATA = [
  { year: 2004, value: 6.5 }, { year: 2005, value: 6.7 }, { year: 2006, value: 6.9 },
  { year: 2007, value: 7.1 }, { year: 2008, value: 7.0 }, { year: 2009, value: 7.2 },
  { year: 2010, value: 7.4 }, { year: 2011, value: 7.3 }, { year: 2012, value: 7.2 },
  { year: 2013, value: 7.1 }, { year: 2014, value: 7.5 }, { year: 2015, value: 8.0 },
  { year: 2016, value: 8.4 }, { year: 2017, value: 8.6 }, { year: 2018, value: 8.0 },
  { year: 2019, value: 7.4 }, { year: 2020, value: 7.2 }, { year: 2021, value: 9.0 },
  { year: 2022, value: 9.8 }, { year: 2023, value: 9.1 }, { year: 2024, value: 9.3 },
];

// CO₂ year-on-year deltas (derived the same way as motion-scenes.jsx)
export const CO2_RATE = CO2_DATA.slice(1).map((d, i) => ({
  year: d.year,
  value: +(d.value - CO2_DATA[i].value).toFixed(2),
}));
