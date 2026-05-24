const { sims } = window.AICC_DATA;

var baScore = 0;
var completedSims = new Set();
var currentSim = null;
var currentSelections = {};

function pickStakeholder(id) {
  currentSim = id;
  currentSelections = {};
  const s = sims[id];

  document.querySelectorAll('.sim-chip').forEach(c => {
    c.classList.remove('active');
    if (c.dataset.id === id && !completedSims.has(id)) c.classList.add('active');
  });

  const cats = ['goal','kpi','sources','segments','sme','output'];
  const catLabels = { goal:'Business Goal', kpi:'Key KPIs / Metrics', sources:'Data Sources', segments:'Segments / Dimensions', sme:'SME to Consult', output:'Dashboard Output' };

  let html = `
  <div class="req-card">
    <div class="req-head">
      <div class="req-avatar">${s.init}</div>
      <div><div class="req-name">${s.name}</div><div class="req-role">${s.role}</div></div>
    </div>
    <div class="req-text">${s.req}</div>
  </div>
  <div class="opts-grid">
  ${cats.map(cat => `
    <div class="opt-group">
      <div class="opt-label">${catLabels[cat]}</div>
      <div class="opt-list" id="opts-${cat}">
        ${s.options[cat].map((o,i) => `<button class="opt-btn" onclick="selectOpt('${cat}',${i},this)">${o}</button>`).join('')}
      </div>
    </div>
  `).join('')}
  </div>
  <div id="fb" class="feedback"></div>
  <button class="submit-btn" onclick="submitSim()">✅ Submit & Generate Requirements</button>
  <div id="brdOut" class="brd-out"></div>`;

  document.getElementById('simContent').innerHTML = html;
}

function selectOpt(cat, idx, btn) {
  currentSelections[cat] = idx;
  btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function submitSim() {
  if (!currentSim) return;
  const s = sims[currentSim];
  const cats = ['goal','kpi','sources','segments','sme','output'];
  if (cats.some(c => currentSelections[c] === undefined)) { alert('Please make all 6 selections.'); return; }

  let pts = 0;
  const corr = {};
  cats.forEach(c => corr[c] = s.options[c].indexOf(s.correct[c]));

  const errs = [];
  cats.forEach(c => {
    const btns = document.getElementById('opts-'+c).querySelectorAll('.opt-btn');
    btns.forEach((b,i) => {
      b.classList.remove('selected');
      if (i === corr[c]) b.classList.add('correct');
      else if (currentSelections[c] === i) b.classList.add('wrong');
    });
    if (currentSelections[c] === corr[c]) pts += 10;
    else errs.push(`<b>${c.toUpperCase()}:</b> Should be "${s.correct[c]}"`);
  });

  const fb = document.getElementById('fb');
  if (pts === 60) {
    fb.className = 'feedback ok show';
    fb.innerHTML = '<div class="feedback-title">🎉 Perfect Score! All 6 selections correct.</div>Great business analysis — you correctly identified stakeholder need, KPIs, sources, and output.';
  } else {
    fb.className = 'feedback err show';
    fb.innerHTML = `<div class="feedback-title">⚠️ ${pts}/60 pts — Review corrections above</div>${errs.join('<br>')}`;
  }

  if (!completedSims.has(currentSim)) {
    baScore += pts;
    completedSims.add(currentSim);
    document.getElementById('baScore').textContent = baScore;
    document.getElementById('navScore').textContent = baScore;
    const pct = baScore / 360 * 100;
    document.getElementById('scoreBar').style.width = pct + '%';
    document.getElementById('scoreText').textContent = baScore + ' / 360 points';
    document.querySelector(`[data-id="${currentSim}"]`).classList.add('done');
    updateProgress();
  }

  // BRD
  const brd = document.getElementById('brdOut');
  brd.className = 'brd-out show';
  brd.innerHTML = `
  <div class="brd-head">📋 Business Requirements Document — AI Industry Analysis</div>
  <div><span class="brd-k">Stakeholder:</span> <span class="brd-v">${s.name} (${s.role})</span></div>
  <div><span class="brd-k">Business Goal:</span> <span class="brd-v">${s.correct.goal}</span></div>
  <div><span class="brd-k">Key Metrics:</span> <span class="brd-v">${s.correct.kpi}</span></div>
  <div><span class="brd-k">Data Sources:</span> <span class="brd-v">${s.correct.sources}</span></div>
  <div><span class="brd-k">Segments:</span> <span class="brd-v">${s.correct.segments}</span></div>
  <div><span class="brd-k">SME Consulted:</span> <span class="brd-v">${s.correct.sme}</span></div>
  <div><span class="brd-k">Dashboard:</span> <span class="brd-v">${s.correct.output}</span></div>
  <div style="margin-top:10px"><span class="brd-k">Acceptance Criteria:</span></div>
  <div>1. All market-size figures must cite source and disclosure date</div>
  <div>2. Revenue figures tagged with confidence level (Confident / Likely / Estimate)</div>
  <div>3. Dashboard must support filter by company, region, and time range</div>
  <div>4. Source reconciliation gap must be &lt;5% for published metrics</div>`;
}

function updateProgress() {
  const names = { ceo:'CEO', investor:'VC Investor', product:'Product Mgr', risk:'Risk Mgr', sales:'Enterprise Sales', data:'Data Scientist' };
  const list = document.getElementById('progressList');
  list.innerHTML = Object.keys(sims).map(id => `
  <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">
    <span style="color:${completedSims.has(id)?'var(--green)':'var(--muted)'}">${names[id]}</span>
    <span style="font-family:var(--font-mono);color:${completedSims.has(id)?'var(--green)':'var(--muted)'}">${completedSims.has(id)?'✓ Done':'—'}</span>
  </div>`).join('');
}

// ─── DOWNLOAD FUNCTIONS ──────────────────────────────



// ─── INTERACTIVITY ───────────────────────────────────
