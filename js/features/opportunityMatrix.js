// ─────────────────────────────────────────────────────────
// AICC_MATRIX — interactive Opportunity Matrix (growth-share bubble
// chart). X = current scale, Y = expected growth, bubble size = an
// opportunity-weighted value. Quadrants are computed from the actual
// median of the plotted set, not fixed pixel thresholds, so the
// quadrant boundaries stay correct if the underlying data changes.
// ─────────────────────────────────────────────────────────
(() => {
  const D = window.AICC_DATA;
  const K = window.AICC_CALC;

  const QUADRANT_META = {
    'strategic-leader': { label: 'Strategic Leaders', color: D.C.green, desc: 'High scale, high growth — defend and reinvest.' },
    'high-growth-opportunity': { label: 'High-Growth Opportunities', color: D.C.accent, desc: 'Low scale, high growth — earlier-stage bets worth structured discovery.' },
    'mature-defensive': { label: 'Mature / Defensive', color: D.C.amber, desc: 'High scale, low(er) growth — cash-generative, protect share.' },
    'lower-priority': { label: 'Lower-Priority Segments', color: D.C.muted, desc: 'Low scale, low(er) growth — deprioritize unless strategy changes.' }
  };

  let matrixMode = 'sectors';
  let matrixPoints = [];

  function buildSectorPoints() {
    const rows = D.datasets.sectors.rows; // vertical, share, cagr, hw, sw, svc
    const marketByYear = Object.fromEntries(D.datasets.market.rows.map(r => [r[0], r]));
    const marketSize2025 = marketByYear[2025][1];
    const shares = rows.map(r => r[1]);
    const cagrs = rows.map(r => r[2]);
    const shareMedian = K.median(shares), cagrMedian = K.median(cagrs);
    return rows.map(r => {
      const [vertical, share, cagr] = r;
      const estValue = K.round(marketSize2025 * share / 100, 1);
      return {
        id: vertical, label: vertical,
        x: share, y: cagr, size: estValue,
        quadrant: K.classifyQuadrant(share, cagr, shareMedian, cagrMedian),
        detail: {
          metrics: [
            ['Market share (2025 est.)', share + '%'],
            ['Projected CAGR (2025–2033)', cagr + '%'],
            ['Estimated market value', '$' + estValue + 'B'],
            ['Growth vs. sector median', K.relativeToMedian(cagr, cagrs) + 'x median CAGR']
          ],
          interpretation: `${vertical} sits in the ${QUADRANT_META[K.classifyQuadrant(share, cagr, shareMedian, cagrMedian)].label} quadrant: ${QUADRANT_META[K.classifyQuadrant(share, cagr, shareMedian, cagrMedian)].desc}`,
          action: share < shareMedian && cagr >= cagrMedian
            ? `Run structured customer discovery in ${vertical} — data/infrastructure/regulatory barriers should be assessed before committing meaningful budget.`
            : cagr < cagrMedian && share >= shareMedian
              ? `Protect ${vertical}'s existing share with retention and expansion motions rather than new-logo-heavy investment.`
              : `Monitor ${vertical} for a quadrant shift at the next data refresh.`,
          risks: `Sector share and CAGR are both analyst estimates (medium confidence) — treat this position as directional, not precise.`,
          confidence: 'Medium — estimated market share, forecast CAGR'
        }
      };
    });
  }

  function buildCompanyPoints() {
    const rows = D.datasets.companies.rows; // company, type, arr, valuation, yoy, product, strength
    const arrs = rows.map(r => r[2]);
    const cappedYoy = rows.map(r => Math.min(r[4], 600));
    const arrMedian = K.median(arrs), yoyMedian = K.median(cappedYoy);
    return rows.map(r => {
      const [company, type, arr, valuation, yoy, product, strength] = r;
      const cYoy = Math.min(yoy, 600);
      const multiple = K.valuationMultiple(valuation, arr);
      const quadrant = K.classifyQuadrant(arr, cYoy, arrMedian, yoyMedian);
      return {
        id: company, label: company,
        x: arr, y: cYoy, size: valuation,
        quadrant,
        detail: {
          metrics: [
            ['ARR', '$' + arr + 'B'], ['Valuation', '$' + valuation + 'B'],
            ['YoY growth', yoy + '%' + (yoy !== cYoy ? ' (chart capped at 600% for readability)' : '')],
            ['Valuation-to-ARR multiple', multiple !== null ? multiple + 'x' : 'Insufficient data']
          ],
          interpretation: `${company} sits in the ${QUADRANT_META[quadrant].label} quadrant: ${QUADRANT_META[quadrant].desc} Primary strength: ${strength}.`,
          action: quadrant === 'high-growth-opportunity'
            ? `Watch ${company} closely — small-scale companies growing this fast can close a competitive gap within a few disclosure cycles.`
            : quadrant === 'strategic-leader'
              ? `Benchmark against ${company} directly — it combines scale and momentum, the hardest position to compete against.`
              : `${company} is lower priority for competitive-response planning at current growth/scale levels.`,
          risks: multiple !== null && multiple > 50 ? `Valuation-to-ARR multiple of ${multiple}x is elevated — confirm this isn't a data artifact (e.g. parent-company valuation vs. segment ARR) before treating it as a pricing signal.` : `No unusual valuation signal detected.`,
          confidence: type === 'Public' ? 'High — public disclosure' : 'Medium — private company, last-round valuation'
        }
      };
    });
  }

  function setMatrixMode(mode, btn) {
    matrixMode = mode;
    if (typeof activateChip === 'function') activateChip(btn);
    renderOpportunityMatrix();
  }
  window.setMatrixMode = setMatrixMode;

  function renderOpportunityMatrix() {
    const canvas = document.getElementById('cOpportunityMatrix');
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    matrixPoints = matrixMode === 'companies' ? buildCompanyPoints() : buildSectorPoints();

    const pad = 56;
    const cw = w - pad - 24, ch = h - pad - 44;
    const xs = matrixPoints.map(p => p.x), ys = matrixPoints.map(p => p.y), sizes = matrixPoints.map(p => p.size);
    const xMax = Math.max(...xs) * 1.15, yMax = Math.max(...ys) * 1.15;
    const xMedian = K.median(xs), yMedian = K.median(ys);
    const maxSize = Math.max(...sizes);

    const xPix = v => pad + (v / xMax) * cw;
    const yPix = v => pad + ch - (v / yMax) * ch;
    const rPix = v => 8 + Math.sqrt(v / maxSize) * 26;

    // quadrant backgrounds
    const xMedPix = xPix(xMedian), yMedPix = yPix(yMedian);
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = D.C.green; ctx.fillRect(xMedPix, pad, pad + cw - xMedPix, yMedPix - pad); // top-right: strategic leaders
    ctx.fillStyle = D.C.accent; ctx.fillRect(pad, pad, xMedPix - pad, yMedPix - pad); // top-left: high growth opportunity
    ctx.fillStyle = D.C.amber; ctx.fillRect(xMedPix, yMedPix, pad + cw - xMedPix, pad + ch - yMedPix); // bottom-right: mature/defensive
    ctx.fillStyle = D.C.muted; ctx.fillRect(pad, yMedPix, xMedPix - pad, pad + ch - yMedPix); // bottom-left: lower priority
    ctx.restore();

    // median divider lines
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(xMedPix, pad); ctx.lineTo(xMedPix, pad + ch); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, yMedPix); ctx.lineTo(pad + cw, yMedPix); ctx.stroke();
    ctx.restore();

    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + ch); ctx.lineTo(pad + cw, pad + ch); ctx.stroke();

    ctx.fillStyle = D.C.muted; ctx.font = "10px 'Manrope', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(matrixMode === 'companies' ? 'ARR — USD Billions (scale) →' : 'Current market share % (scale) →', pad + cw / 2, h - 8);
    ctx.save(); ctx.translate(14, pad + ch / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center';
    ctx.fillText(matrixMode === 'companies' ? 'YoY growth % (expected growth) →' : 'Projected CAGR % (expected growth) →', 0, 0); ctx.restore();

    // quadrant labels — shortened on narrow canvases so the two labels on
    // each row never collide into one unreadable string
    const narrow = cw < 420;
    ctx.font = "9px 'Manrope', sans-serif"; ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'right'; ctx.fillText(narrow ? 'LEADERS' : 'STRATEGIC LEADERS', pad + cw - 4, pad + 12);
    ctx.textAlign = 'left'; ctx.fillText(narrow ? 'OPPORTUNITY' : 'HIGH-GROWTH OPPORTUNITIES', pad + 4, pad + 12);
    ctx.textAlign = 'right'; ctx.fillText(narrow ? 'DEFENSIVE' : 'MATURE / DEFENSIVE', pad + cw - 4, pad + ch - 6);
    ctx.textAlign = 'left'; ctx.fillText(narrow ? 'LOW PRIORITY' : 'LOWER PRIORITY', pad + 4, pad + ch - 6);

    // bubbles
    const hitRegions = [];
    matrixPoints.forEach(p => {
      const cx = xPix(p.x), cy = yPix(p.y), r = rPix(p.size);
      const color = QUADRANT_META[p.quadrant] ? QUADRANT_META[p.quadrant].color : D.C.accent;
      ctx.save();
      ctx.shadowColor = color; ctx.shadowBlur = 14;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color + 'cc'); grad.addColorStop(1, color + '33');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = D.C.text; ctx.font = "10px 'Manrope', sans-serif"; ctx.textAlign = 'center';
      ctx.fillText(p.label, cx, cy - r - 5);
      hitRegions.push({ cx, cy, r, point: p });
    });

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const hit = hitRegions.find(h => Math.hypot(mx - h.cx, my - h.cy) <= h.r + 4);
      if (hit) showMatrixDetail(hit.point);
    };

    if (!matrixPoints.length) return;
    showMatrixDetail(matrixPoints[0], true);
  }

  function showMatrixDetail(point, silent) {
    const el = document.getElementById('matrixDetail');
    if (!el) return;
    const meta = QUADRANT_META[point.quadrant] || { label: 'Unclassified', color: D.C.muted };
    el.innerHTML = `
      <div class="matrix-detail-head">
        <span class="matrix-detail-dot" style="background:${meta.color}"></span>
        <span class="matrix-detail-name">${point.label}</span>
        <span class="matrix-detail-quadrant" style="color:${meta.color}">${meta.label}</span>
      </div>
      <div class="matrix-detail-metrics">
        ${point.detail.metrics.map(m => `<div class="matrix-metric"><span>${m[0]}</span><b>${m[1]}</b></div>`).join('')}
      </div>
      <div class="matrix-detail-row"><span class="matrix-detail-k">Interpretation</span>${point.detail.interpretation}</div>
      <div class="matrix-detail-row"><span class="matrix-detail-k">Potential action</span>${point.detail.action}</div>
      <div class="matrix-detail-row"><span class="matrix-detail-k">Risks</span>${point.detail.risks}</div>
      <div class="matrix-detail-row"><span class="matrix-detail-k">Data confidence</span>${point.detail.confidence}</div>`;
    if (!silent) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  window.AICC_MATRIX = { renderOpportunityMatrix };
  window.renderOpportunityMatrix = renderOpportunityMatrix;
})();
