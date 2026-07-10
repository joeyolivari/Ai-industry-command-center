// ─────────────────────────────────────────────────────────
// AICC_CALC — reusable KPI calculation engine.
//
// Every function is pure, side-effect free, and defensive against
// null / undefined / zero / non-numeric inputs so dashboard code can
// call them directly on live dataset slices without pre-validating.
// A calculation that cannot be responsibly produced returns null —
// rendering code is expected to display "Insufficient data" for null.
// ─────────────────────────────────────────────────────────
window.AICC_CALC = (() => {

  const isNum = v => typeof v === 'number' && Number.isFinite(v);
  const clean = arr => (arr || []).filter(isNum);

  // ── Basic safety helpers ──────────────────────────────
  function safeDiv(a, b) {
    if (!isNum(a) || !isNum(b) || b === 0) return null;
    return a / b;
  }

  function pct(a, b, dp = 1) {
    const r = safeDiv(a, b);
    return r === null ? null : round(r * 100, dp);
  }

  function round(v, dp = 1) {
    if (!isNum(v)) return null;
    const f = Math.pow(10, dp);
    return Math.round(v * f) / f;
  }

  // ── Growth metrics ────────────────────────────────────

  // Year-over-year growth: (current - previous) / previous * 100
  function yoyGrowth(current, previous) {
    if (!isNum(current) || !isNum(previous) || previous === 0) return null;
    return round(((current - previous) / Math.abs(previous)) * 100, 1);
  }

  // Compound Annual Growth Rate: (end/begin)^(1/years) - 1, as a percentage
  function cagr(beginValue, endValue, years) {
    if (!isNum(beginValue) || !isNum(endValue) || !isNum(years)) return null;
    if (beginValue <= 0 || endValue <= 0 || years <= 0) return null;
    return round((Math.pow(endValue / beginValue, 1 / years) - 1) * 100, 1);
  }

  // Absolute expansion between two points in the same unit
  function absoluteChange(current, previous) {
    if (!isNum(current) || !isNum(previous)) return null;
    return round(current - previous, 1);
  }

  // Growth acceleration: is the most recent YoY rate faster or slower than the prior one?
  // Returns { delta, direction } where direction is 'accelerating' | 'decelerating' | 'stable'
  function growthAcceleration(series) {
    const v = clean(series);
    if (v.length < 3) return null;
    const g1 = yoyGrowth(v[v.length - 2], v[v.length - 3]);
    const g2 = yoyGrowth(v[v.length - 1], v[v.length - 2]);
    if (g1 === null || g2 === null) return null;
    const delta = round(g2 - g1, 1);
    const direction = Math.abs(delta) < 2 ? 'stable' : (delta > 0 ? 'accelerating' : 'decelerating');
    return { priorRate: g1, latestRate: g2, delta, direction };
  }

  // Rolling growth rate across a whole series (array of YoY rates)
  function rollingGrowth(series) {
    const v = clean(series);
    const out = [];
    for (let i = 1; i < v.length; i++) out.push(yoyGrowth(v[i], v[i - 1]));
    return out;
  }

  // Years required for a value to double at a given CAGR (Rule of 70 style, exact form)
  function yearsToDouble(cagrPct) {
    if (!isNum(cagrPct) || cagrPct <= 0) return null;
    return round(Math.log(2) / Math.log(1 + cagrPct / 100), 1);
  }

  // ── Distribution / concentration metrics ──────────────

  function sum(arr) { return clean(arr).reduce((a, b) => a + b, 0); }
  function mean(arr) { const v = clean(arr); return v.length ? round(sum(v) / v.length, 2) : null; }

  function median(arr) {
    const v = clean(arr).slice().sort((a, b) => a - b);
    if (!v.length) return null;
    const mid = Math.floor(v.length / 2);
    return v.length % 2 ? v[mid] : round((v[mid - 1] + v[mid]) / 2, 2);
  }

  function stdDev(arr) {
    const v = clean(arr);
    if (v.length < 2) return null;
    const m = mean(v);
    const variance = v.reduce((acc, x) => acc + Math.pow(x - m, 2), 0) / (v.length - 1);
    return round(Math.sqrt(variance), 2);
  }

  // z-score of a single value against a distribution — used for outlier flags
  function zScore(value, arr) {
    const m = mean(arr), sd = stdDev(arr);
    if (!isNum(value) || m === null || !isNum(sd) || sd === 0) return null;
    return round((value - m) / sd, 2);
  }

  // Herfindahl-style concentration index (0-10000 scale) from an array of share percentages
  function concentrationIndex(sharesPct) {
    const v = clean(sharesPct);
    if (!v.length) return null;
    return round(v.reduce((acc, s) => acc + s * s, 0), 0);
  }

  // Share of total held by the top N entries (already-sorted-desc values assumed unsorted; we sort here)
  function topNShare(values, n) {
    const v = clean(values).slice().sort((a, b) => b - a);
    if (!v.length) return null;
    const total = sum(v);
    if (total === 0) return null;
    return pct(sum(v.slice(0, n)), total, 1);
  }

  function rank(values, valueForItem) {
    // values: array of {key, value}; returns same array with .rank added, 1 = highest
    const sorted = values.slice().sort((a, b) => b.value - a.value);
    sorted.forEach((item, i) => { item.rank = i + 1; });
    return sorted;
  }

  // ── Company / market structure metrics ────────────────

  // Valuation-to-ARR multiple — a standard SaaS/AI company pricing signal
  function valuationMultiple(valuation, arr) {
    return safeDiv(valuation, arr) === null ? null : round(valuation / arr, 1);
  }

  // Momentum score: blends YoY growth rate (capped) with scale, 0-100 scale.
  // 70% growth signal + 30% scale signal so a small company can't "win" on hype alone,
  // and a large company can't coast purely on size.
  function momentumScore(growthPct, scaleValue, maxGrowth, maxScale) {
    if (!isNum(growthPct) || !isNum(scaleValue) || !maxGrowth || !maxScale) return null;
    const growthComponent = Math.min(growthPct / maxGrowth, 1) * 70;
    const scaleComponent = Math.min(scaleValue / maxScale, 1) * 30;
    return round(growthComponent + scaleComponent, 0);
  }

  // Competitive gap from the category leader, as a percentage of the leader's value
  function gapFromLeader(value, leaderValue) {
    if (!isNum(value) || !isNum(leaderValue) || leaderValue === 0) return null;
    return round(((value - leaderValue) / leaderValue) * 100, 1);
  }

  // Outlier detection helper — flags values beyond +/- threshold standard deviations
  function findOutliers(items, valueKey, threshold = 1.5) {
    const values = items.map(i => i[valueKey]);
    return items
      .map(i => ({ ...i, z: zScore(i[valueKey], values) }))
      .filter(i => i.z !== null && Math.abs(i.z) >= threshold);
  }

  // ── Sector / opportunity scoring ───────────────────────

  // Weighted growth-share opportunity score, 0-100. Growth is weighted higher than
  // current share because the brief calls for surfacing forward-looking opportunity,
  // not just today's revenue pool.
  function opportunityScore(sharePct, cagrPct, maxShare, maxCagr, growthWeight = 0.6) {
    if (!isNum(sharePct) || !isNum(cagrPct) || !maxShare || !maxCagr) return null;
    const shareComponent = Math.min(sharePct / maxShare, 1) * (1 - growthWeight) * 100;
    const growthComponent = Math.min(cagrPct / maxCagr, 1) * growthWeight * 100;
    return round(shareComponent + growthComponent, 0);
  }

  // Growth relative to the peer-set median, as a ratio (1.0 = at median)
  function relativeToMedian(value, arr) {
    const m = median(arr);
    if (!isNum(value) || m === null || m === 0) return null;
    return round(value / m, 2);
  }

  // Classify a growth-share position into the four opportunity-matrix quadrants
  function classifyQuadrant(sharePct, cagrPct, shareMedian, cagrMedian) {
    if (!isNum(sharePct) || !isNum(cagrPct) || shareMedian === null || cagrMedian === null) return null;
    const highShare = sharePct >= shareMedian;
    const highGrowth = cagrPct >= cagrMedian;
    if (highShare && highGrowth) return 'strategic-leader';
    if (!highShare && highGrowth) return 'high-growth-opportunity';
    if (highShare && !highGrowth) return 'mature-defensive';
    return 'lower-priority';
  }

  // ── Forecast / trajectory metrics ──────────────────────

  // Variance between an actual outcome and a prior forecast, as a percentage
  function forecastVariance(actual, forecast) {
    return yoyGrowth(actual, forecast); // same formula: (actual-forecast)/forecast
  }

  // Simple scenario band around a base CAGR, +/- a spread, applied to a base value over n years
  function scenarioBand(baseValue, baseCagrPct, years, spreadPct = 8) {
    if (!isNum(baseValue) || !isNum(baseCagrPct) || !isNum(years)) return null;
    const grow = (rate) => round(baseValue * Math.pow(1 + rate / 100, years), 1);
    return {
      downside: grow(Math.max(baseCagrPct - spreadPct, 0)),
      base: grow(baseCagrPct),
      bestCase: grow(baseCagrPct + spreadPct)
    };
  }

  // Confidence-scaled range around a point estimate — wider band for lower confidence
  function confidenceRange(value, confidence) {
    if (!isNum(value)) return null;
    const spread = { high: 0.05, medium: 0.15, low: 0.30 }[confidence] ?? 0.20;
    return { low: round(value * (1 - spread), 1), high: round(value * (1 + spread), 1) };
  }

  // Threshold alert: flags a growth rate as abnormal vs a peer distribution
  function isAbnormalGrowth(growthPct, peerGrowths, zThreshold = 1.75) {
    const z = zScore(growthPct, peerGrowths);
    return z !== null && Math.abs(z) >= zThreshold;
  }

  // Market maturity indicator from CAGR: crude but explainable heuristic band
  function maturityIndicator(cagrPct) {
    if (!isNum(cagrPct)) return null;
    if (cagrPct >= 30) return 'Emerging / high-growth';
    if (cagrPct >= 18) return 'Scaling';
    if (cagrPct >= 8) return 'Maturing';
    return 'Mature';
  }

  // Status badge helper — NOT a blanket "up=green" rule. Callers pass whether
  // an increase is favourable in this specific business context.
  function statusBadge(value, benchmark, { higherIsBetter = true, tolerancePct = 5 } = {}) {
    if (!isNum(value) || !isNum(benchmark) || benchmark === 0) return null;
    const diffPct = ((value - benchmark) / Math.abs(benchmark)) * 100;
    if (Math.abs(diffPct) <= tolerancePct) return 'near-benchmark';
    const above = diffPct > 0;
    if (higherIsBetter) return above ? 'above-benchmark' : 'below-benchmark';
    return above ? 'below-benchmark' : 'above-benchmark'; // inverted for "lower is better" metrics
  }

  return {
    isNum, safeDiv, pct, round,
    yoyGrowth, cagr, absoluteChange, growthAcceleration, rollingGrowth, yearsToDouble,
    sum, mean, median, stdDev, zScore, concentrationIndex, topNShare, rank,
    valuationMultiple, momentumScore, gapFromLeader, findOutliers,
    opportunityScore, relativeToMedian, classifyQuadrant,
    forecastVariance, scenarioBand, confidenceRange, isAbnormalGrowth, maturityIndicator,
    statusBadge
  };
})();
