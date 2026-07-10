// ─────────────────────────────────────────────────────────
// AICC_KPI_DICT — searchable KPI dictionary. Centralizes every
// calculated metric's definition, formula, and business purpose so
// the formulas in js/data/calc.js are documented in one place instead
// of being explained ad hoc across the UI.
// ─────────────────────────────────────────────────────────
window.AICC_KPI_DICT = (() => {
  const entries = [
    {
      name: 'Year-over-Year (YoY) Growth', category: 'Market',
      definition: 'How much a metric changed compared to the same period one year earlier.',
      formula: '(Current − Previous) / |Previous| × 100',
      purpose: 'The fastest way to answer "is this getting better or worse right now?"',
      stakeholder: 'CEO, FP&A, Strategy',
      interpretation: 'A single YoY figure can be noisy for small bases — pair with CAGR for a multi-year read.',
      limitations: 'Sensitive to one-off spikes or dips in either period; not smoothed.',
      sourceFields: 'market_size_usd_b, us_investment_usd_b, arr_usd_b',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'Market: ($542B − $470B) / $470B = 15.3% YoY growth in 2025.'
    },
    {
      name: 'Compound Annual Growth Rate (CAGR)', category: 'Market',
      definition: 'The smoothed average annual growth rate over a multi-year period.',
      formula: '(EndValue / BeginValue)^(1 / Years) − 1, expressed as %',
      purpose: 'Removes year-to-year noise so growth across different time windows can be compared fairly.',
      stakeholder: 'Strategy, Investors, Board',
      interpretation: 'A CAGR does not mean growth was that rate every year — it is the average compounding rate that connects the start and end points.',
      limitations: 'Ignores the shape of the path between endpoints; a volatile market and a smooth one can share the same CAGR.',
      sourceFields: 'market_size_usd_b (by year)',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'Market 2019→2025: ($542B/$47B)^(1/6) − 1 = 50.3% CAGR.'
    },
    {
      name: 'Absolute Market Expansion', category: 'Market',
      definition: 'The raw dollar (or unit) change in a metric between two periods.',
      formula: 'CurrentValue − PriorValue',
      purpose: 'CAGR can look impressive on a tiny base; absolute expansion shows real economic scale.',
      stakeholder: 'Strategy, Board',
      interpretation: 'Use alongside CAGR — a high CAGR on a small absolute base is a different signal than a high CAGR on a large one.',
      limitations: 'Not normalized — cannot compare expansion across metrics of different scale directly.',
      sourceFields: 'market_size_usd_b',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: '$542B − $47B = $495B absolute market expansion 2019–2025.'
    },
    {
      name: 'Years to Double', category: 'Market',
      definition: 'How many years, at the current CAGR, until a metric doubles in value.',
      formula: 'ln(2) / ln(1 + CAGR)',
      purpose: 'Translates an abstract growth percentage into an intuitive time horizon for planning.',
      stakeholder: 'Strategy, FP&A',
      interpretation: 'Lower is faster-growing. Compare against your planning horizon to gauge relevance.',
      limitations: 'Assumes the CAGR holds constant — real markets rarely grow at a perfectly steady rate.',
      sourceFields: 'Derived from CAGR',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'At 50.3% CAGR, the market doubles roughly every 1.7 years.'
    },
    {
      name: 'Concentration Index (HHI-style)', category: 'Market / Company',
      definition: 'A measure of how concentrated a market or revenue base is among a small number of participants.',
      formula: 'Σ (marketShare_i²) across all participants, share as a percentage (0–100)',
      purpose: 'Flags when a metric is dominated by very few entities — a data-risk and business-risk signal.',
      stakeholder: 'Risk, Strategy, Investors',
      interpretation: 'Higher = more concentrated. Values above ~1800 are conventionally considered highly concentrated.',
      limitations: 'Sensitive to how narrowly the population is defined — 8 tracked companies is not the full market.',
      sourceFields: 'arr_usd_b (companies), regional share fields (market)',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: '8 tracked companies with ARR shares → concentration index of ~2,000+.'
    },
    {
      name: 'Top-N Share', category: 'Market / Company',
      definition: 'The percentage of a total held by the largest N participants.',
      formula: 'Sum(topN values) / Sum(all values) × 100',
      purpose: 'A simpler, more intuitive companion to the concentration index.',
      stakeholder: 'Strategy, Investors',
      interpretation: 'Compare against the total population size — top-3 of 8 concentrated is different from top-3 of 200.',
      limitations: 'Loses information about the shape of the "long tail" below N.',
      sourceFields: 'arr_usd_b',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'Top 3 tracked companies by ARR hold roughly 80%+ of tracked-company ARR.'
    },
    {
      name: 'Valuation-to-ARR Multiple', category: 'Company',
      definition: 'How many times a company’s Annual Recurring Revenue its valuation represents.',
      formula: 'Valuation / ARR',
      purpose: 'A standard SaaS/AI pricing signal — higher multiples imply the market is pricing in future growth, not just current revenue.',
      stakeholder: 'Investors, M&A, Risk',
      interpretation: 'Compare against peers of similar growth stage. Extreme multiples (very high or, for mature firms, unexpectedly low) warrant a data-quality check before being treated as a real signal.',
      limitations: 'For conglomerates (e.g. Alphabet, Meta), valuation reflects the whole company while ARR is a segment estimate — the ratio is not a true like-for-like multiple in those cases.',
      sourceFields: 'valuation_usd_b, arr_usd_b',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'OpenAI: $850B valuation / $25B ARR = 34x.'
    },
    {
      name: 'Company Momentum Score', category: 'Company',
      definition: 'An illustrative 0–100 composite blending growth rate and scale so neither dimension dominates alone.',
      formula: '70% × min(YoY growth / peer max, 1) + 30% × min(ARR / peer max ARR, 1), scaled to 100',
      purpose: 'Prevents "biggest company always wins" or "fastest-growing tiny company always wins" framing — balances both signals.',
      stakeholder: 'Competitive Intelligence, Executive Team',
      interpretation: 'A high score means a company is combining real growth with real scale, not just one or the other.',
      limitations: 'An illustrative composite, not a published industry index — weights (70/30) are a documented judgment call, not derived from a model.',
      sourceFields: 'yoy_growth_pct, arr_usd_b',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'Anthropic’s high YoY growth (from a smaller base) can produce a momentum score close to companies with much larger ARR.'
    },
    {
      name: 'Competitive Gap from Leader', category: 'Company',
      definition: 'How far a company’s metric sits below (or above) the category leader’s value.',
      formula: '(Value − LeaderValue) / LeaderValue × 100',
      purpose: 'Frames competitive position relative to the best performer, not just an absolute rank.',
      stakeholder: 'Strategy, Sales, Competitive Intelligence',
      interpretation: 'A negative percentage means "this far below the leader"; watch the trend over time, not just the snapshot.',
      limitations: 'A single snapshot — pair with momentum score to see whether the gap is closing or widening.',
      sourceFields: 'arr_usd_b',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'A company with $25B ARR vs. a $30B leader has an 16.7% gap from leader.'
    },
    {
      name: 'Outlier Detection (z-score)', category: 'Company / Sector',
      definition: 'How many standard deviations a value sits from the mean of its peer group.',
      formula: '(Value − Mean) / StandardDeviation',
      purpose: 'Flags values that are statistically unusual and deserve a data-quality or business-narrative check before being trusted.',
      stakeholder: 'Data Quality, Risk, Analysts',
      interpretation: '|z| ≥ 1.5 is flagged on the Watchlist here; |z| ≥ 2 is treated as higher severity.',
      limitations: 'With very small sample sizes (e.g. 8 companies) z-scores are directional, not statistically rigorous.',
      sourceFields: 'Any numeric field being screened (e.g. valuation-to-ARR multiple)',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'Google DeepMind’s valuation/ARR multiple is a flagged outlier due to using Alphabet’s full valuation.'
    },
    {
      name: 'Investment Share (by category)', category: 'Investment',
      definition: 'The percentage of total investment flowing into a specific category, such as GenAI or foundation models.',
      formula: 'CategoryInvestment / TotalInvestment × 100',
      purpose: 'Shows where capital is concentrating within the broader AI investment picture.',
      stakeholder: 'Investors, Corporate Development',
      interpretation: 'Rising share signals investor conviction rotating toward that category, ahead of or alongside realized market share.',
      limitations: 'Category taxonomies vary by source; cross-source comparisons should be treated as directional.',
      sourceFields: 'global_genai_usd_b, us_investment_usd_b, foundation_models_pct',
      updateFrequency: 'Annual (Stanford HAI Index cycle)',
      example: 'GenAI investment / total AI investment = ~36% in the 2025 estimate.'
    },
    {
      name: 'US-to-China Investment Ratio', category: 'Investment',
      definition: 'How many times larger US private AI investment is than China’s in a given year.',
      formula: 'US Investment / China Investment',
      purpose: 'A simple geographic concentration signal for capital flows.',
      stakeholder: 'Risk, Strategy, Policy Analysts',
      interpretation: 'A high ratio signals US-centric capital concentration risk, not necessarily US-centric AI capability.',
      limitations: 'China investment figures are the least reliable line in this dataset — state-fund non-disclosure likely understates the true figure.',
      sourceFields: 'us_investment_usd_b, china_investment_usd_b',
      updateFrequency: 'Annual (Stanford HAI Index cycle)',
      example: '$109.1B / $9.3B ≈ 11.7x in 2024.'
    },
    {
      name: 'Growth Acceleration / Deceleration', category: 'Investment / Trajectory',
      definition: 'Whether the most recent period-over-period growth rate is faster or slower than the prior period’s rate.',
      formula: 'LatestPeriodGrowth − PriorPeriodGrowth (both computed via YoY/period-over-period formula)',
      purpose: 'Distinguishes "still growing" from "still growing, but slowing down" — an earlier warning signal than a level trend.',
      stakeholder: 'Risk, Strategy, Investors',
      interpretation: '|delta| < 2pp is treated as stable; otherwise flagged accelerating or decelerating.',
      limitations: 'Requires at least 3 data points; noisy with irregular disclosure intervals.',
      sourceFields: 'us_investment_usd_b (by year), ARR trajectory series',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'OpenAI’s ARR trajectory shows a flattening growth rate in the most recent disclosed periods.'
    },
    {
      name: 'Opportunity Score (Growth-Share)', category: 'Sector',
      definition: 'An illustrative 0–100 score weighting projected growth above current market share.',
      formula: '60% × min(CAGR / maxCAGR, 1) + 40% × min(Share / maxShare, 1), scaled to 100',
      purpose: 'Surfaces sectors that are forward-looking opportunities, not just today’s largest revenue pools.',
      stakeholder: 'Strategy, Product, Sales',
      interpretation: 'A high score with low current share signals an earlier-stage opportunity; a high score with high share signals a sector that is both large and still growing fast.',
      limitations: 'An illustrative composite with a documented 60/40 growth-weighted formula, not a market-validated index.',
      sourceFields: 'market_share_pct, cagr_pct_2025_2033',
      updateFrequency: 'Annual (source report cycle)',
      example: 'Automotive AI: high CAGR (33.2%), lower share (11.8%) → high opportunity score.'
    },
    {
      name: 'Growth-Share Quadrant Classification', category: 'Sector / Company',
      definition: 'Classifies each sector or company into one of four quadrants using the median share and median growth of its peer set.',
      formula: 'Share ≥ median AND Growth ≥ median → Strategic Leader; Share < median AND Growth ≥ median → High-Growth Opportunity; Share ≥ median AND Growth < median → Mature/Defensive; else → Lower-Priority',
      purpose: 'Powers the Opportunity Matrix — a standard BCG-style growth-share framework adapted to sector/company data.',
      stakeholder: 'Strategy, Product, Investors',
      interpretation: 'Quadrant boundaries move with the data (median-based), so they stay meaningful as the dataset is refreshed.',
      limitations: 'Median-based thresholds mean roughly half of any peer set is always "above" or "below" by construction — read alongside the absolute values, not the quadrant label alone.',
      sourceFields: 'market_share_pct, cagr_pct_2025_2033 (sectors); arr_usd_b, yoy_growth_pct (companies)',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'See the Opportunity Matrix page for live quadrant placement.'
    },
    {
      name: 'Forecast Variance', category: 'Forecast',
      definition: 'The percentage difference between an actual outcome and a prior forecast for the same period.',
      formula: '(Actual − Forecast) / |Forecast| × 100',
      purpose: 'Tracks forecasting accuracy over time and builds trust (or appropriate skepticism) in forward projections.',
      stakeholder: 'FP&A, Strategy, Data Quality',
      interpretation: 'Consistently large positive or negative variance signals a systematic bias in the forecasting methodology, not just noise.',
      limitations: 'Requires a documented prior forecast to compare against — not available for every metric in this dataset.',
      sourceFields: 'Any forecast field paired with its later actual',
      updateFrequency: 'Calculated when a forecast period resolves to an actual',
      example: 'If a $600B 2026 forecast resolves to $757B actual, variance = +26.2%.'
    },
    {
      name: 'Scenario Band (Downside / Base / Best-Case)', category: 'Forecast',
      definition: 'A range of projected outcomes built by applying a CAGR spread around the base-case forecast rate.',
      formula: 'BaseValue × (1 + (BaseCAGR ± spread))^Years, spread illustratively set at 6pp',
      purpose: 'Forces any forward projection to be presented as a range, not a single point estimate.',
      stakeholder: 'Board, Investors, FP&A',
      interpretation: 'The wider the gap between downside and best-case, the higher the genuine uncertainty in the base forecast.',
      limitations: 'The ±6pp spread is an illustrative, documented assumption — not derived from a statistical confidence interval.',
      sourceFields: 'market_size_usd_b, cagr_pct_2025_2033',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: '2034 market size: downside ~$2.1T, base ~$3.68T, best-case ~$6.1T.'
    },
    {
      name: 'Market Maturity Indicator', category: 'Market',
      definition: 'A plain-English band describing where a market sits on the growth curve, derived from its CAGR.',
      formula: 'CAGR ≥ 30% → Emerging/high-growth; 18–30% → Scaling; 8–18% → Maturing; < 8% → Mature',
      purpose: 'Translates a raw growth number into a stakeholder-friendly life-cycle label.',
      stakeholder: 'Strategy, Sales, Executive Team',
      interpretation: 'Use as a conversation-starter label, not a precise classification — the exact thresholds are a documented judgment call.',
      limitations: 'Threshold bands are illustrative; a market at 29% CAGR and one at 31% CAGR are functionally similar despite crossing a labeled boundary.',
      sourceFields: 'Derived from CAGR',
      updateFrequency: 'Recalculated on every dataset refresh',
      example: 'The 2025–2034 forecast CAGR classifies the AI market as "Scaling."'
    },
    {
      name: 'Data Confidence Score', category: 'Data Quality',
      definition: 'A composite 0–100 self-assessment across six data-quality dimensions: completeness, accuracy, consistency, timeliness, validity, uniqueness.',
      formula: 'Average of the six dimension scores in the Data Quality Scorecard',
      purpose: 'Gives a single at-a-glance trust signal before a stakeholder dives into any specific number.',
      stakeholder: 'All — especially first-time viewers of the dashboard',
      interpretation: '≥82 = High confidence; 65–81 = Medium confidence; <65 = Low confidence.',
      limitations: 'A judgment-based self-assessment for this portfolio project, not an automated statistical audit.',
      sourceFields: 'All datasets, scored via the Data Governance view',
      updateFrequency: 'Reviewed whenever a dataset is refreshed',
      example: 'See the Data Pipeline & Governance page for the live scorecard.'
    }
  ];

  function render(filter = '') {
    const el = document.getElementById('kpiDictBody');
    if (!el) return;
    const q = filter.trim().toLowerCase();
    const rows = entries.filter(e => !q ||
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q) ||
      e.stakeholder.toLowerCase().includes(q));
    document.getElementById('kpiDictCount') && (document.getElementById('kpiDictCount').textContent = rows.length);
    el.innerHTML = rows.map(e => `
      <div class="kpi-dict-card">
        <div class="kpi-dict-head">
          <span class="kpi-dict-name">${e.name}</span>
          <span class="kpi-dict-cat">${e.category}</span>
        </div>
        <div class="kpi-dict-def">${e.definition}</div>
        <div class="kpi-dict-formula"><span>Formula</span><code>${e.formula}</code></div>
        <div class="kpi-dict-grid">
          <div><span>Business purpose</span>${e.purpose}</div>
          <div><span>Primary stakeholder</span>${e.stakeholder}</div>
          <div><span>Interpretation</span>${e.interpretation}</div>
          <div><span>Limitations</span>${e.limitations}</div>
          <div><span>Source fields</span>${e.sourceFields}</div>
          <div><span>Update frequency</span>${e.updateFrequency}</div>
        </div>
        <div class="kpi-dict-example"><span>Example</span>${e.example}</div>
      </div>`).join('') || '<div class="empty-state">No KPIs match your search.</div>';
  }

  function search(value) { render(value); }
  window.searchKpiDictionary = search;

  return { entries, render, search };
})();
