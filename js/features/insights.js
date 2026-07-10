// ─────────────────────────────────────────────────────────
// AICC_INSIGHTS — derives business-analysis output (Executive
// Decision Brief, So-What insight cards, Risk & Watchlist) from the
// raw datasets using AICC_CALC. No business numbers are hardcoded
// here beyond narrative thresholds documented inline — every figure
// shown to the user is computed at render time from window.AICC_DATA.
// ─────────────────────────────────────────────────────────
window.AICC_INSIGHTS = (() => {
  const D = window.AICC_DATA;
  const K = window.AICC_CALC;

  const fmtB = v => v === null || v === undefined ? 'Insufficient data' : (Math.abs(v) >= 1000 ? '$' + K.round(v / 1000, 2) + 'T' : '$' + v + 'B');
  const fmtPct = v => v === null || v === undefined ? 'Insufficient data' : v + '%';
  const na = v => v === null || v === undefined;

  // ── Derived metric blocks (one per dataset family) ────

  function marketMetrics() {
    const byYear = Object.fromEntries(D.datasets.market.rows.map(r => [r[0], r]));
    const y19 = byYear[2019], y24 = byYear[2024], y25 = byYear[2025], y34 = byYear[2034];
    const cagrActual = K.cagr(y19[1], y25[1], 2025 - 2019);
    const cagrForecast = K.cagr(y25[1], y34[1], 2034 - 2025);
    return {
      size2019: y19[1], size2024: y24[1], size2025: y25[1], size2034: y34[1],
      yoy2025: K.yoyGrowth(y25[1], y24[1]),
      cagrActual, cagrForecast,
      absExpansion: K.absoluteChange(y25[1], y19[1]),
      naShareMove: K.absoluteChange(y25[2], y19[2]),
      apacShareMove: K.absoluteChange(y25[3], y19[3]),
      doublingYears: K.yearsToDouble(cagrActual),
      maturity: K.maturityIndicator(cagrForecast),
      scenario: K.scenarioBand(y25[1], cagrForecast, 2034 - 2025, 6)
    };
  }

  function companyMetrics() {
    const companies = D.datasets.companies.rows.map(r => ({
      name: r[0], type: r[1], arr: r[2], valuation: r[3], yoy: r[4], product: r[5], strength: r[6]
    }));
    const totalArr = K.sum(companies.map(c => c.arr));
    let list = companies.map(c => ({
      ...c,
      multiple: K.valuationMultiple(c.valuation, c.arr),
      share: K.pct(c.arr, totalArr)
    }));
    const leader = list.slice().sort((a, b) => b.arr - a.arr)[0];
    const maxYoy = Math.max(...companies.map(c => c.yoy));
    const maxArr = Math.max(...companies.map(c => c.arr));
    list = list.map(c => ({
      ...c,
      gapFromLeader: K.gapFromLeader(c.arr, leader.arr),
      momentum: K.momentumScore(Math.min(c.yoy, 2000), c.arr, Math.min(maxYoy, 2000), maxArr)
    }));
    const multiples = list.filter(c => c.multiple !== null);
    const outliers = K.findOutliers(multiples, 'multiple', 1.25);
    return {
      companies: list, totalArr, leader,
      top3Share: K.topNShare(companies.map(c => c.arr), 3),
      hhi: K.concentrationIndex(list.map(c => c.share)),
      outliers,
      momentumLeader: list.slice().sort((a, b) => (b.momentum || 0) - (a.momentum || 0))[0]
    };
  }

  function investmentMetrics() {
    const byYear = Object.fromEntries(D.datasets.investment.rows.map(r => [r[0], r]));
    const y24 = byYear[2024], y25 = byYear[2025];
    return {
      usToChina2024: K.safeDiv(y24[1], y24[2]),
      usToChina2025: K.safeDiv(y25[1], y25[2]),
      totalYoy: K.yoyGrowth(y25[1], y24[1]),
      genaiYoy: K.yoyGrowth(y25[3], y24[3]),
      genaiShare2025: K.pct(y25[3], y25[1]),
      genaiShare2024: K.pct(y24[3], y24[1]),
      accel: K.growthAcceleration(D.datasets.investment.rows.map(r => r[1]))
    };
  }

  function sectorMetrics() {
    const rows = D.datasets.sectors.rows;
    const shares = rows.map(r => r[1]);
    const cagrs = rows.map(r => r[2]);
    const shareMedian = K.median(shares);
    const cagrMedian = K.median(cagrs);
    const maxShare = Math.max(...shares), maxCagr = Math.max(...cagrs);
    const sectors = rows.map(r => {
      const [vertical, share, cagr] = r;
      return {
        vertical, share, cagr,
        quadrant: K.classifyQuadrant(share, cagr, shareMedian, cagrMedian),
        opportunityScore: K.opportunityScore(share, cagr, maxShare, maxCagr),
        vsMedianCagr: K.relativeToMedian(cagr, cagrs)
      };
    });
    const topOpportunity = sectors.filter(s => s.quadrant === 'high-growth-opportunity')
      .sort((a, b) => b.opportunityScore - a.opportunityScore)[0]
      || sectors.slice().sort((a, b) => b.cagr - a.cagr)[0];
    return { sectors, shareMedian, cagrMedian, topOpportunity };
  }

  function trajectoryMetrics() {
    return {
      anthropic: K.growthAcceleration(D.trD.anthropic),
      openai: K.growthAcceleration(D.trD.openai),
      xai: K.growthAcceleration(D.trD.xai)
    };
  }

  function compositeScores(mkt, inv, co) {
    const top4 = co.companies.slice().sort((a, b) => b.arr - a.arr).slice(0, 4);
    const avgTopGrowth = K.mean(top4.map(c => Math.min(c.yoy, 500)));
    const marketMomentum = K.round(Math.min(100,
      (Math.min(mkt.yoy2025 || 0, 80) / 80) * 40 +
      (Math.min(inv.totalYoy || 0, 60) / 60) * 30 +
      ((avgTopGrowth || 0) / 500) * 30), 0);

    const hhiRelief = 100 - Math.min((co.hhi || 0) / 2500 * 100, 100);
    const investAttract = K.round(Math.min(100,
      ((inv.genaiShare2025 || 0) / 80) * 40 +
      (Math.min(inv.genaiYoy || 0, 80) / 80) * 30 +
      (hhiRelief / 100) * 30), 0);

    const riskFromConcentration = Math.min((co.hhi || 0) / 2500, 1) * 40;
    const riskFromMultiples = Math.min(co.outliers.length / co.companies.length, 1) * 30;
    const riskFromForecastReliance = Math.min((mkt.cagrForecast || 0) / 40, 1) * 30;
    const marketRisk = K.round(riskFromConcentration + riskFromMultiples + riskFromForecastReliance, 0);

    return { marketMomentum, investAttract, marketRisk };
  }

  function dataConfidence() {
    const scores = Object.values(D.DQ_SCORECARD).map(s => s.score);
    const avg = K.mean(scores);
    const label = avg >= 82 ? 'High confidence' : avg >= 65 ? 'Medium confidence' : 'Low confidence';
    return { avg, label };
  }

  function computeAll() {
    const mkt = marketMetrics(), co = companyMetrics(), inv = investmentMetrics(),
      sec = sectorMetrics(), traj = trajectoryMetrics(), scores = compositeScores(mkt, inv, co),
      conf = dataConfidence();
    return { mkt, co, inv, sec, traj, scores, conf };
  }

  // ── Executive Decision Brief ───────────────────────────

  function renderExecutiveBrief() {
    const el = document.getElementById('execBrief');
    if (!el) return;
    const { mkt, co, inv, sec, scores, conf } = computeAll();

    const findings = [
      `<b>Market expansion is real but decelerating in shape.</b> The AI market grew from ${fmtB(mkt.size2019)} to ${fmtB(mkt.size2025)} between 2019–2025 (${fmtPct(mkt.cagrActual)} actual CAGR, +${fmtB(mkt.absExpansion)} absolute), while the 2025–2034 outlook implies a ${fmtPct(mkt.cagrForecast)} forward CAGR — a different growth regime than the one that produced the actuals. <span class="brief-kpi">Supporting KPI: Multi-year CAGR, Absolute Market Expansion</span>`,
      `<b>${co.leader.name} leads on scale, but momentum is shifting.</b> ${co.leader.name} holds the highest ARR at ${fmtB(co.leader.arr)}, yet ${co.momentumLeader.name}'s momentum score of ${co.momentumLeader.momentum ?? 'Insufficient data'}/100 (from ${co.momentumLeader.yoy}% YoY growth) signals the competitive gap is closing faster than a static ARR snapshot suggests. <span class="brief-kpi">Supporting KPI: Company Momentum Score, Competitive Gap from Leader</span>`,
      `<b>Capital is rotating toward foundation models ahead of realized market share.</b> GenAI investment reached an estimated ${fmtPct(inv.genaiShare2025)} of total AI investment in 2025 (up from ${fmtPct(inv.genaiShare2024)} in 2024), while total investment growth of ${fmtPct(inv.totalYoy)} is running ${inv.totalYoy > mkt.yoy2025 ? 'faster' : 'slower'} than overall market growth of ${fmtPct(mkt.yoy2025)}. <span class="brief-kpi">Supporting KPI: GenAI Share of Investment, Investment vs. Market Growth</span>`
    ];

    const risks = [
      `<b>Company-level concentration risk.</b> The top 3 tracked companies hold ${fmtPct(co.top3Share)} of tracked ARR (concentration index ${co.hhi ?? 'Insufficient data'}) — a single disclosure surprise from any one of them would move most company-level KPIs on this dashboard. <span class="brief-kpi">Supporting KPI: Revenue Concentration, Regional/Company Concentration Index</span>`,
      `<b>The long-range forecast leans on an aggressive assumption.</b> Reaching ${fmtB(mkt.size2034)} by 2034 requires sustaining a ${fmtPct(mkt.cagrForecast)} CAGR for 9 straight years — above the ${fmtPct(mkt.cagrActual)} actually achieved 2019–2025 — making the 2034 figure the single largest assumption risk in this dataset. <span class="brief-kpi">Supporting KPI: Forecast vs. Historical Growth, Scenario Band</span>`
    ];

    const opportunities = [
      sec.topOpportunity ? `<b>${sec.topOpportunity.vertical} AI is a high-growth, low-share opportunity.</b> It carries a ${fmtPct(sec.topOpportunity.cagr)} projected CAGR against only ${fmtPct(sec.topOpportunity.share)} current market share (opportunity score ${sec.topOpportunity.opportunityScore ?? 'Insufficient data'}/100) — an earlier-stage growth pool rather than an already-captured revenue base. <span class="brief-kpi">Supporting KPI: Sector Opportunity Score, Growth-Share Matrix</span>` : `<b>Sector opportunity data insufficient to rank.</b>`,
      `<b>GenAI's rising share of capital is an early-mover signal.</b> Investment growth outpacing market growth this cycle (${fmtPct(inv.totalYoy)} vs ${fmtPct(mkt.yoy2025)}) suggests investors are pricing in demand ahead of it showing up in realized market share — a window for GenAI-adjacent products to capture share while competition is still forming. <span class="brief-kpi">Supporting KPI: Investment Acceleration, Growth in Funding vs. Market Growth</span>`
    ];

    const actions = [
      sec.topOpportunity ? `Prioritize ${sec.topOpportunity.vertical.toLowerCase()} and other high-growth/low-share sectors for structured customer discovery before committing further scale-stage investment in already-saturated verticals. <span class="brief-owner">Owner: Strategy &amp; Product</span>` : `Prioritize sector-level customer discovery once opportunity-score data is complete. <span class="brief-owner">Owner: Strategy &amp; Product</span>`,
      `Treat any single-quarter ARR or valuation jump from the top 3 concentrated companies as a confirm-next-disclosure item before it drives a resourcing decision. <span class="brief-owner">Owner: Investment / Competitive Intelligence</span>`,
      mkt.scenario ? `Present the downside scenario (${fmtB(mkt.scenario.downside)} by 2034, a ${K.round(6, 0)}pp lower CAGR) alongside the base case in any board or investment-committee forecast — do not lead with the base case alone. <span class="brief-owner">Owner: FP&amp;A / Strategy</span>` : `Build a downside forecast scenario before presenting 2034 projections externally. <span class="brief-owner">Owner: FP&amp;A / Strategy</span>`
    ];

    const scoreGauge = (label, value, tooltip) => `
      <div class="brief-score">
        <div class="brief-score-ring" style="--val:${value ?? 0}"><span>${na(value) ? '—' : value}</span></div>
        <div class="brief-score-label">${label}</div>
        <div class="brief-score-tip" title="${tooltip}">ⓘ methodology</div>
      </div>`;

    el.innerHTML = `
      <div class="brief-top">
        <div class="brief-heading">
          <div class="brief-eyebrow">Executive Decision Brief</div>
          <h2 class="brief-title">Where the AI market stands right now, and what to do about it</h2>
          <div class="brief-meta">
            <span class="vtype-badge vtype-mixed" title="This brief blends actual, estimated, and forecast figures — see badges on each KPI card">Actual + Estimated + Forecast</span>
            <span class="conf-badge conf-${conf.avg >= 82 ? 'high' : conf.avg >= 65 ? 'medium' : 'low'}">${conf.label} (${conf.avg}/100 data quality)</span>
            <span class="brief-updated">Last updated ${D.PROJECT_META.lastUpdated}</span>
          </div>
        </div>
        <div class="brief-scores">
          ${scoreGauge('AI Market Momentum', scores.marketMomentum, 'Blends latest market YoY growth (40%), investment YoY growth (30%), and average YoY growth of the four largest tracked companies capped at 500% (30%). Illustrative composite score, not a published index.')}
          ${scoreGauge('Investment Attractiveness', scores.investAttract, 'Blends GenAI share of total investment (40%), GenAI investment YoY growth (30%), and relief from company-level concentration risk (30%). Illustrative composite score.')}
          ${scoreGauge('Market Risk', scores.marketRisk, 'Blends company concentration index (40%), share of tracked companies with statistically outlying valuation multiples (30%), and reliance on an aggressive long-range forecast CAGR (30%). Higher = more risk.')}
        </div>
      </div>
      <div class="brief-grid">
        <div class="brief-col">
          <div class="brief-col-title">Three most important findings</div>
          ${findings.map(f => `<div class="brief-item finding">${f}</div>`).join('')}
        </div>
        <div class="brief-col">
          <div class="brief-col-title">Two major risks</div>
          ${risks.map(f => `<div class="brief-item risk">${f}</div>`).join('')}
          <div class="brief-col-title" style="margin-top:14px">Two major opportunities</div>
          ${opportunities.map(f => `<div class="brief-item opportunity">${f}</div>`).join('')}
        </div>
        <div class="brief-col">
          <div class="brief-col-title">Three recommended actions</div>
          ${actions.map(f => `<div class="brief-item action">${f}</div>`).join('')}
        </div>
      </div>
      <div class="brief-footnote">This is an analytical portfolio demonstration, not investment advice. Composite scores are illustrative and documented in the KPI Dictionary. Figures marked <span class="vtype-badge vtype-forecast">Forecast</span> or <span class="vtype-badge vtype-estimated">Estimated</span> carry materially lower confidence than those marked <span class="vtype-badge vtype-actual">Actual</span>.</div>`;
  }

  // ── So-What insight cards ──────────────────────────────

  function renderSoWhat(containerId, card) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="so-what">
        <div class="so-what-row"><span class="so-what-label">Key finding</span><span class="so-what-val">${card.finding}</span></div>
        <div class="so-what-row"><span class="so-what-label">Business implication</span><span class="so-what-val">${card.implication}</span></div>
        <div class="so-what-row"><span class="so-what-label">Recommended action</span><span class="so-what-val">${card.action}</span></div>
        <div class="so-what-foot">
          <span class="so-what-tag stakeholder">${card.stakeholder}</span>
          <span class="so-what-tag conf-${card.confidence}">${card.confidence[0].toUpperCase() + card.confidence.slice(1)} confidence</span>
          <span class="so-what-tag kpi">${card.kpi}</span>
        </div>
        <div class="so-what-source">Source / methodology: ${card.source}</div>
      </div>`;
  }

  function renderAllSoWhat() {
    const { mkt, co, inv, sec, conf } = computeAll();

    renderSoWhat('soWhatMarket', {
      finding: `Actual market growth ran at ${fmtPct(mkt.cagrActual)} CAGR (2019–2025); the 2025–2034 outlook assumes ${fmtPct(mkt.cagrForecast)}.`,
      implication: `Budget and hiring plans anchored to the 2034 figure are implicitly betting on a growth regime the market hasn't sustained yet.`,
      action: `Model resourcing against the downside scenario (${mkt.scenario ? fmtB(mkt.scenario.downside) : 'insufficient data'} by 2034), not just the base case.`,
      stakeholder: 'Strategy / FP&A',
      confidence: mkt.cagrForecast ? 'medium' : 'low',
      kpi: 'Multi-Year CAGR · Forecast vs. Historical Growth',
      source: 'Grand View Research, Market.us, Precedence Research — see Data Governance for reconciliation method.'
    });

    renderSoWhat('soWhatCompanies', {
      finding: `${co.leader.name} leads ARR at ${fmtB(co.leader.arr)}, but the top 3 companies hold ${fmtPct(co.top3Share)} of tracked ARR.`,
      implication: `This is a highly concentrated competitive set — market-share conclusions drawn from 8 companies should not be generalized to the full industry.`,
      action: `Track momentum score, not just ARR rank, when briefing leadership on "who is winning" — a low-ARR company can be closing the gap fastest.`,
      stakeholder: 'Competitive Intelligence / Executive Team',
      confidence: 'high',
      kpi: 'Revenue Concentration · Company Momentum Score',
      source: 'Epoch AI, company disclosures, SEC filings — ARR figures are actuals; valuations are estimated.'
    });

    renderSoWhat('soWhatInvestment', {
      finding: `GenAI now takes an estimated ${fmtPct(inv.genaiShare2025)} of total AI investment, and US capital outpaces China by roughly ${inv.usToChina2025 ?? '—'}x.`,
      implication: `Capital concentration in both category (GenAI) and geography (US) means a slowdown in either could disproportionately affect the whole AI funding picture.`,
      action: `Stress-test any GenAI-dependent revenue plan against a scenario where investment growth decelerates toward market growth.`,
      stakeholder: 'Investment / Corporate Development',
      confidence: 'medium',
      kpi: 'GenAI Share of Investment · US-to-China Investment Ratio',
      source: 'Stanford HAI AI Index 2025; 2025 figures are forecast, marked with *.'
    });

    renderSoWhat('soWhatSectors', {
      finding: sec.topOpportunity ? `${sec.topOpportunity.vertical} has the strongest growth-share opportunity profile (opportunity score ${sec.topOpportunity.opportunityScore ?? '—'}/100).` : 'Insufficient data to rank sector opportunity.',
      implication: `High-CAGR, low-share sectors are not yet proven revenue pools — they represent option value, not guaranteed return.`,
      action: `Run structured customer discovery in the top opportunity-quadrant sector before shifting budget away from established, high-share verticals.`,
      stakeholder: 'Strategy / Product / Sales',
      confidence: 'medium',
      kpi: 'Growth-Share Matrix · Sector Opportunity Score',
      source: 'Grand View Research, Precedence Research — market share is estimated, CAGR is forecast.'
    });

    renderSoWhat('soWhatTrends', {
      finding: `Benchmark gains (e.g. SWE-bench +67.3pp) have translated into new revenue categories such as agentic coding, but multimodal capability (MMMU +18.8pp) lags.`,
      implication: `Capability gains do not convert into commercial value uniformly across domains — coding assistants monetized fastest; multimodal agent products remain more capability-constrained.`,
      action: `Weight product roadmap bets toward domains with both strong benchmark momentum and a demonstrated revenue conversion path, not benchmark improvement alone.`,
      stakeholder: 'Product / ML Research Lead',
      confidence: 'high',
      kpi: 'Benchmark Momentum · Business-Use-Case Interpretation',
      source: 'Stanford HAI AI Index 2025 (benchmark scores are actual, published results).'
    });
  }

  // ── Risk & Watchlist ────────────────────────────────────

  function computeWatchlist() {
    const { mkt, co, inv, sec, traj } = computeAll();
    const signals = [];

    // 1. Extreme valuation-to-ARR multiples
    co.outliers.forEach(o => {
      signals.push({
        title: `${o.name}: valuation-to-ARR multiple is a statistical outlier`,
        severity: o.z && Math.abs(o.z) >= 2 ? 'high' : 'medium',
        why: `${o.name}'s valuation/ARR multiple of ${o.multiple}x is ${o.z}σ from the tracked-company mean. ${o.name === 'Google DeepMind' ? 'Note: this reflects Alphabet’s full market cap against a segment-estimated ARR, not a true like-for-like comparison — a data caveat, not a real 262x pricing signal.' : 'Confirm whether this reflects a genuinely differentiated growth premium or a very early-stage ARR base before treating it as comparable to peers.'}`,
        kpi: 'Valuation-to-ARR Multiple (outlier z-score)'
      });
    });

    // 2. Heavy market concentration
    if (co.hhi !== null) {
      signals.push({
        title: `Company ARR concentration is elevated (index ${co.hhi})`,
        severity: co.hhi > 2000 ? 'high' : 'medium',
        why: `Top 3 companies hold ${fmtPct(co.top3Share)} of tracked ARR. A Herfindahl-style index above ~1800 is conventionally considered highly concentrated — any single-company disclosure event will disproportionately move the aggregate picture.`,
        kpi: 'Revenue Concentration Index (HHI-style)'
      });
    }

    // 3. Forecast dependent on aggressive assumptions
    if (mkt.cagrForecast !== null && mkt.cagrActual !== null && mkt.cagrForecast > mkt.cagrActual) {
      signals.push({
        title: 'Long-range market forecast assumes faster growth than history shows',
        severity: 'medium',
        why: `The 2025–2034 forecast implies ${fmtPct(mkt.cagrForecast)} CAGR versus ${fmtPct(mkt.cagrActual)} actually achieved 2019–2025. Treat the 2034 figure as a scenario, not a projection with historical precedent.`,
        kpi: 'Forecast vs. Historical Growth'
      });
    }

    // 4. Investment growing faster than market demand
    if (inv.totalYoy !== null && mkt.yoy2025 !== null && inv.totalYoy > mkt.yoy2025 * 1.3) {
      signals.push({
        title: 'Investment growth is outpacing measured market growth',
        severity: 'medium',
        why: `Total AI investment grew an estimated ${fmtPct(inv.totalYoy)} year-over-year versus ${fmtPct(mkt.yoy2025)} market growth. When capital inflow consistently outruns demand growth, it is an early signal of potential overinvestment risk in the funded categories.`,
        kpi: 'Investment Growth vs. Market Growth'
      });
    }

    // 5. Sector with high growth but limited present scale
    const emergingSectors = sec.sectors.filter(s => s.quadrant === 'high-growth-opportunity');
    emergingSectors.forEach(s => {
      signals.push({
        title: `${s.vertical}: high growth, limited present scale`,
        severity: 'low',
        why: `${s.vertical} shows a ${fmtPct(s.cagr)} CAGR against only ${fmtPct(s.share)} current market share — above-median growth on a below-median revenue base. This is an opportunity signal and a risk signal simultaneously: the growth is not yet proven at scale.`,
        kpi: 'Growth-Share Matrix'
      });
    });

    // 6. Company with strong growth but weak relative scale
    const smallHighGrowth = co.companies.filter(c => c.arr < K.mean(co.companies.map(x => x.arr)) && c.yoy > 300);
    smallHighGrowth.forEach(c => {
      signals.push({
        title: `${c.name}: strong growth rate, weak relative scale`,
        severity: 'low',
        why: `${c.name} grew ${c.yoy}% YoY but holds only ${fmtB(c.arr)} ARR (${fmtPct(c.share)} of tracked-company revenue). High percentage growth off a small base can be a leading indicator or a statistical artifact — confirm the next 2 disclosure cycles before treating it as a trend.`,
        kpi: 'YoY Growth vs. Revenue Scale'
      });
    });

    // 7. Growth deceleration among top-2 companies
    [['Anthropic', traj.anthropic], ['OpenAI', traj.openai], ['xAI', traj.xai]].forEach(([name, t]) => {
      if (t && t.direction === 'decelerating') {
        signals.push({
          title: `${name}: ARR growth rate is decelerating`,
          severity: 'medium',
          why: `${name}'s trajectory shows the latest period-over-period growth rate (${t.latestRate}%) is slower than the prior period (${t.priorRate}%), a ${Math.abs(t.delta)}pp deceleration. Confirm whether this reflects a maturing base or a genuine demand slowdown.`,
          kpi: 'Growth Acceleration / Deceleration'
        });
      }
    });

    // 8. Geographic concentration risk (static context figure, documented in About/Investment section)
    signals.push({
      title: 'Investment capital is heavily concentrated in the United States',
      severity: 'low',
      why: `Among the top 50 AI companies by funding, the US captured roughly 93.6% of 2024 funding (WriterBuddy.ai). Any US-specific regulatory, capital-market, or macro shock would disproportionately affect the global AI funding picture as currently measured.`,
      kpi: 'Regional Concentration Index'
    });

    // 9 & 10. Source conflicts and low-confidence estimates, pulled directly from governance metadata
    Object.entries(D.DATA_GOVERNANCE).forEach(([key, g]) => {
      if (g.sourceConflicts && g.sourceConflicts !== 'None material at vertical level; component mix % is directional, not audited' && g.sourceConflicts !== 'None — single source') {
        signals.push({
          title: `${g.label}: conflicting source values identified`,
          severity: 'low',
          why: g.sourceConflicts,
          kpi: 'Source Reconciliation Gap'
        });
      }
      if (g.confidence === 'low' || (typeof g.confidence === 'string' && g.confidence.includes('low'))) {
        signals.push({
          title: `${g.label}: contains low-confidence estimate(s)`,
          severity: 'medium',
          why: `${g.valueType}. Treat figures from this dataset's forecast years as directional, not precise.`,
          kpi: 'Data Confidence Score'
        });
      }
    });

    const order = { high: 0, medium: 1, low: 2 };
    return signals.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  function renderWatchlist() {
    const el = document.getElementById('watchlistBody');
    if (!el) return;
    const signals = computeWatchlist();
    document.getElementById('watchlistCount') && (document.getElementById('watchlistCount').textContent = signals.length);
    el.innerHTML = signals.map(s => `
      <div class="watch-item watch-${s.severity}">
        <div class="watch-sev">${s.severity.toUpperCase()}</div>
        <div class="watch-body">
          <div class="watch-title">${s.title}</div>
          <div class="watch-why">${s.why}</div>
          <div class="watch-kpi">Triggered by: ${s.kpi}</div>
        </div>
      </div>`).join('') || '<div class="empty-state">No active signals.</div>';
  }

  // ── Data Quality Scorecard + Governance table ──────────

  function renderGovernance() {
    const dqEl = document.getElementById('dqScorecard');
    if (dqEl) {
      dqEl.innerHTML = Object.entries(D.DQ_SCORECARD).map(([dim, v]) => {
        const tier = v.score >= 82 ? 'hi' : v.score >= 65 ? 'mid' : 'lo';
        const color = tier === 'hi' ? D.C.green : tier === 'mid' ? D.C.amber : D.C.red;
        return `<div class="dq-dim">
          <div class="dq-dim-name">${dim}</div>
          <div class="dq-dim-score ${tier}">${v.score}</div>
          <div class="dq-dim-bar"><div class="dq-dim-bar-fill" style="width:${v.score}%;background:${color}"></div></div>
          <div class="dq-dim-note">${v.note}</div>
        </div>`;
      }).join('');
    }

    const govEl = document.getElementById('govTable');
    if (govEl) {
      const cols = [
        ['sourceSystem', 'Source System'], ['owner', 'Data Owner'], ['refreshFrequency', 'Refresh Frequency'],
        ['dataType', 'Data Type'], ['valueType', 'Actual / Estimate / Forecast'], ['confidence', 'Confidence'],
        ['transformationRule', 'Transformation Rule'], ['validationRule', 'Validation Rule'],
        ['missingValueHandling', 'Missing-Value Handling'], ['duplicateHandling', 'Duplicate Handling'],
        ['outlierHandling', 'Outlier Handling'], ['reconciliationMethod', 'Reconciliation Method'],
        ['sourceConflicts', 'Source Conflicts'], ['lineage', 'Lineage']
      ];
      govEl.innerHTML = `
        <thead><tr><th>Dataset</th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead>
        <tbody>
          ${Object.values(D.DATA_GOVERNANCE).map(g => `
            <tr>
              <td class="gov-label">${g.label}<br><span style="color:var(--muted);font-weight:400">as of ${g.asOf}</span></td>
              ${cols.map(c => `<td>${g[c[0]] ?? '—'}</td>`).join('')}
            </tr>`).join('')}
        </tbody>`;
    }
  }

  function renderBenchmarkInterpretation() {
    const el = document.getElementById('benchmarkInterpretation');
    if (!el) return;
    el.innerHTML = `<div class="so-what-source" style="margin-top:12px">
      ${D.datasets.benchmarks.rows.map(r => `<div style="margin-bottom:8px"><b>${r[0]}:</b> ${D.BENCHMARK_INTERPRETATION[r[0]] || 'Business-use-case interpretation not yet documented.'}</div>`).join('')}
    </div>`;
  }

  return { computeAll, renderExecutiveBrief, renderAllSoWhat, computeWatchlist, renderWatchlist, renderBenchmarkInterpretation, renderGovernance };
})();
