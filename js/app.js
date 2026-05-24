// ─── LOGO BUTTON ────────────────────────────────────
function handleLogoClick() {
  var btn = document.getElementById('logoBtn');
  btn.classList.add('clicking');
  setTimeout(function() {
    btn.classList.remove('clicking');
    show('about', document.querySelector('[onclick*=about]'));
  }, 420);
}

// ─── MOBILE NAV ─────────────────────────────────────
function toggleMobileNav() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobOverlay');
  const isOpen = sidebar.classList.toggle('mobile-open');
  overlay.classList.toggle('visible', isOpen);
}

// ─── NAVIGATION ────────────────────────────────────
const titles = {
  about:'About This Project',
  jargon:'Plain-English Guide',
  market:'Market Overview', companies:'Company Intelligence',
  investment:'Investment & Funding', segments:'Sector Breakdown',
  trends:'Trends & Forecast', simulator:'Stakeholder Simulator',
  pipeline:'Data Pipeline Architecture', schema:'Star Schema Model',
  summary:'Final Summary', downloads:'Download Center'
};
function show(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = titles[id] || id;
  // Close mobile sidebar if open
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobOverlay');
  if (sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('visible');
  }
  if (['market','companies','investment','segments','trends'].includes(id)) {
    setTimeout(() => { drawAll(id); initInteractivity(id); }, 60);
  }
  if (id === 'summary') {
    document.getElementById('finalScore').textContent = baScore;
    document.getElementById('finalBar').style.width = (baScore/360*100) + '%';
  }
}

// ─── CHART HELPERS ─────────────────────────────────
const C = { accent:'#00d4ff', accent2:'#7b61ff', green:'#00e5a0', amber:'#ffb547', red:'#ff5f6d', muted:'#6b7a99', text:'#e8edf5', border:'rgba(255,255,255,0.07)' };

function getCtx(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  el.width = el.parentElement.offsetWidth;
  const ctx = el.getContext('2d');
  ctx.clearRect(0, 0, el.width, el.height);
  return { ctx, w: el.width, h: el.height, el };
}

// Modern grid: subtle dashed horizontal lines + faint vertical ticks
function grid(ctx, w, h, pad, steps=5) {
  ctx.save();
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= steps; i++) {
    const y = pad + (h - pad * 2) * i / steps;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad/2, y); ctx.stroke();
  }
  ctx.setLineDash([]);
  // Left axis baseline
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - 28); ctx.stroke();
  ctx.restore();
}

// hex to rgba helper
function hexA(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// Smooth bezier curve through points
function smoothLine(ctx, pts) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i+1].x) / 2;
    const cpy = (pts[i].y + pts[i+1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
  }
  ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
}

function lineChart(id, labels, datasets, opts={}) {
  const r = getCtx(id); if (!r) return;
  const { ctx, w, h } = r;
  const pad = opts.pad || 48;
  const cw = w - pad - 20, ch = h - pad - 28;
  let allVals = datasets.flatMap(d => d.data);
  const max = Math.max(...allVals) * 1.12;
  const min = Math.min(...allVals) * (Math.min(...allVals) < 0 ? 1.1 : 0.9);
  const range = max - min || 1;

  grid(ctx, w, h, pad);

  // y-axis labels
  ctx.fillStyle = C.muted; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = min + range * (1 - i/4);
    const y = pad + ch * i / 4;
    ctx.fillText(opts.fmt ? opts.fmt(val) : val.toFixed(0), pad - 8, y + 4);
  }

  // x-axis labels
  ctx.textAlign = 'center'; ctx.fillStyle = C.muted; ctx.font = '10px var(--font-sans)';
  labels.forEach((l, i) => {
    const x = pad + cw * i / (labels.length - 1);
    ctx.fillText(l, x, h - 6);
  });

  datasets.forEach((ds, di) => {
    const color = ds.color || [C.accent, C.green, C.accent2, C.amber][di % 4];
    const pts = ds.data.map((v, i) => ({
      x: pad + cw * i / (labels.length - 1),
      y: pad + ch * (1 - (v - min) / range)
    }));

    // Gradient fill under line
    if (ds.fill) {
      const fillGrad = ctx.createLinearGradient(0, pad, 0, pad + ch);
      fillGrad.addColorStop(0, hexA(color, 0.18));
      fillGrad.addColorStop(0.6, hexA(color, 0.06));
      fillGrad.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      smoothLine(ctx, pts);
      ctx.lineTo(pts[pts.length-1].x, pad + ch);
      ctx.lineTo(pts[0].x, pad + ch);
      ctx.closePath(); ctx.fill();
    }

    // Glow effect: draw line twice (wide+dim, then sharp)
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = hexA(color, 0.35);
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); smoothLine(ctx, pts); ctx.stroke();
    ctx.restore();

    // Sharp main line
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); smoothLine(ctx, pts); ctx.stroke();

    // Dots with glow
    pts.forEach((p, i) => {
      // outer glow ring
      ctx.save();
      ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.fillStyle = hexA(color, 0.3);
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // inner solid dot
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI*2); ctx.fill();
      // white center
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI*2); ctx.fill();
    });
  });

  // Legend — pill style
  if (datasets.length > 1 && opts.legend !== false) {
    let lx = pad;
    datasets.forEach((ds, i) => {
      const color = ds.color || [C.accent, C.green, C.accent2, C.amber][i % 4];
      const lbl = ds.label || '';
      const tw = ctx.measureText(lbl).width;
      // pill background
      ctx.fillStyle = hexA(color, 0.12);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx - 4, 2, tw + 22, 16, 4);
      else ctx.rect(lx - 4, 2, tw + 22, 16);
      ctx.fill();
      // dot
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(lx + 5, 10, 3.5, 0, Math.PI*2); ctx.fill();
      // label
      ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.font = '10px var(--font-sans)';
      ctx.fillText(lbl, lx + 13, 14);
      lx += tw + 32;
    });
  }
}

function barChart(id, labels, data, colors, opts={}) {
  const r = getCtx(id); if (!r) return;
  const { ctx, w, h } = r;
  const pad = 44;
  const many = labels.length > 4;
  const bottomPad = many ? 48 : 28;
  const cw = w - pad - 16, ch = h - pad - bottomPad;
  const max = Math.max(...data) * 1.18;
  const bw = cw / labels.length * 0.58;

  grid(ctx, w, h, pad);

  // y-axis labels
  ctx.fillStyle = C.muted; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = max * (1 - i/4);
    const y = pad + ch * i / 4;
    ctx.fillText(opts.fmt ? opts.fmt(val) : val.toFixed(0), pad - 8, y + 4);
  }

  data.forEach((v, i) => {
    const x = pad + cw * (i + 0.5) / labels.length - bw/2;
    const bh = ch * v / max;
    const y = pad + ch - bh;
    const color = colors[i % colors.length];

    // Bar glow background (wider, very transparent)
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 18;
    ctx.fillStyle = hexA(color, 0.15);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - 2, y, bw + 4, bh, [6, 6, 0, 0]);
    else ctx.rect(x - 2, y, bw + 4, bh);
    ctx.fill();
    ctx.restore();

    // Main bar — vertical gradient
    const grad = ctx.createLinearGradient(0, y, 0, y + bh);
    grad.addColorStop(0, color);
    grad.addColorStop(0.5, hexA(color, 0.85));
    grad.addColorStop(1, hexA(color, 0.35));
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, [5, 5, 0, 0]);
    else ctx.rect(x, y, bw, bh);
    ctx.fill();

    // Bright top edge on bar
    ctx.fillStyle = hexA(color, 0.7);
    ctx.fillRect(x, y, bw, 2);

    // Value label above bar
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.fillStyle = C.text; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'center';
    ctx.fillText(opts.fmt ? opts.fmt(v) : v, x + bw/2, y - 7);
    ctx.restore();

    // x-axis label
    ctx.fillStyle = C.muted; ctx.font = '10px var(--font-sans)';
    if (many) {
      ctx.save(); ctx.translate(x + bw/2, h - bottomPad + 14);
      ctx.rotate(-Math.PI/5); ctx.textAlign = 'right';
      ctx.fillText(labels[i], 0, 0); ctx.restore();
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + bw/2, h - 10);
    }
  });
}

function donut(id, data, colors) {
  const r = getCtx(id); if (!r) return;
  const { ctx, w, h } = r;
  const cx = w/2, cy = h/2;
  const ro = Math.min(cx, cy) - 12, ri = ro * 0.58;
  const total = data.reduce((a,b)=>a+b,0);
  let angle = -Math.PI/2;
  const gap = 0.03; // gap between slices in radians

  data.forEach((v, i) => {
    const slice = (v/total) * Math.PI * 2 - gap;
    const color = colors[i];
    const midAngle = angle + slice / 2;

    // Outer glow
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 16;
    const grad = ctx.createRadialGradient(cx, cy, ri, cx, cy, ro);
    grad.addColorStop(0, hexA(color, 0.7));
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, ro, angle, angle + slice);
    ctx.arc(cx, cy, ri, angle + slice, angle, true);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Inner border highlight
    ctx.save();
    ctx.strokeStyle = hexA(color, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, ro - 1, angle, angle + slice);
    ctx.stroke();
    ctx.restore();

    angle += slice + gap;
  });

  // Center dark circle (inner cutout refill for clean look)
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ri - 2);
  centerGrad.addColorStop(0, 'rgba(13,20,34,1)');
  centerGrad.addColorStop(1, 'rgba(9,15,25,1)');
  ctx.fillStyle = centerGrad;
  ctx.beginPath(); ctx.arc(cx, cy, ri - 2, 0, Math.PI*2); ctx.fill();
}

// ─── DRAW BY SECTION ───────────────────────────────
function drawAll(section) {
  if (section === 'market') {
    // Respect year slider state
    const sliderEl = document.getElementById('mktYearRange');
    const idx = sliderEl ? parseInt(sliderEl.value) : 6;
    const mktYrL2=['2019','2020','2021','2022','2023','2024','2025'];
    const mktYrD2=[47,93,142,208,391,470,542];
    lineCI('cMarket',
      mktYrL2.slice(0,idx+1),
      [{ label:'Market Size (USD B)', data:mktYrD2.slice(0,idx+1), color:C.accent, fill:true }],
      { pad:52, fmt: v => v >= 1000 ? '$'+Math.round(v/100)/10+'T' : '$'+Math.round(v)+'B' }
    );
    attachTip('cMarket', v => v>=1000?'$'+(v/1000).toFixed(2)+'T':'$'+v+'B');
    donut('cRegion', [35.5, 28.5, 22, 14], [C.accent, C.accent2, C.green, C.amber]);
    lineChart('cDeploy',
      ['2021','2022','2023','2024','2025','2026'],
      [
        { label:'Cloud Deployment %', data:[52, 58, 63, 68, 71.6, 75], color:C.accent, fill:true },
        { label:'On-Premise %', data:[48, 42, 37, 32, 28.4, 25], color:C.accent2, fill:true }
      ],
      { pad:48, fmt: v => Math.round(v)+'%' }
    );
    renderMktKPIs();
  }

  if (section === 'companies') {
    // Respect current company filter state
    const activeCoBtn = document.querySelector('[data-group="co-show"].active');
    const coKey = activeCoBtn ? activeCoBtn.textContent.toLowerCase().includes('private') ? 'private' : activeCoBtn.textContent.toLowerCase().includes('public') ? 'public' : activeCoBtn.textContent.toLowerCase().includes('top') ? 'top3' : 'all' : 'all';
    setCoFilter(coKey, activeCoBtn);
  }

  if (section === 'investment') {
    renderInvChart();
    donut('cFundCat', [67.3, 11.1, 8.4, 7.2, 6.0], [C.accent, C.accent2, C.green, C.amber, C.red]);
  }

  if (section === 'segments') {
    renderSegChart();
    barChart('cComponent',
      ['Hardware','Software','Services'],
      [45.6, 34.2, 20.2],
      [C.accent, C.green, C.accent2],
      { fmt: v => v+'%' }
    );
  }

  if (section === 'trends') {
    renderTrendChart();
  }
}

// ─── SIMULATOR DATA ─────────────────────────────────
const sims = {
  ceo: {
    name:'Alexandra Park', role:'CEO, AI-Native SaaS Company', init:'AP',
    req:'"We\'re heading into our board meeting next quarter. I need a clear picture of where we stand in the market — growth rates, competitor revenue, and which segments are growing fastest. Investors are asking questions I can\'t answer right now."',
    correct:{goal:'Monitor competitive positioning and market share growth',kpi:'Revenue CAGR, Market Share %, Competitor ARR, Segment Growth Rates',sources:'Epoch AI, Grand View Research, Crunchbase, Company Disclosures',segments:'Company, Segment, Region, Time Period',sme:'Strategy & Market Intelligence Lead',output:'Market Overview + Company Intelligence Dashboard'},
    options:{
      goal:['Monitor competitive positioning and market share growth','Reduce infrastructure cost per AI call','Optimize ML model accuracy on benchmarks','Track employee productivity with AI tools'],
      kpi:['Revenue CAGR, Market Share %, Competitor ARR, Segment Growth Rates','GPU Utilization %, Inference Latency, Cost per Token','Accuracy, F1 Score, BLEU, Perplexity','Tasks per Hour, AI Adoption Rate, Tool Usage'],
      sources:['Epoch AI, Grand View Research, Crunchbase, Company Disclosures','AWS Cost Explorer, Internal Logs, Billing API','MLflow, Weights & Biases, Internal Eval Logs','HRIS, Jira, Slack Analytics'],
      segments:['Company, Segment, Region, Time Period','Cloud Provider, Instance Type, Region','Model Name, Dataset, Eval Benchmark','Team, Role, Tool Category'],
      sme:['Strategy & Market Intelligence Lead','Cloud Infrastructure Lead','ML Research Lead','People Analytics Manager'],
      output:['Market Overview + Company Intelligence Dashboard','Data Quality Control Dashboard','Trends & Forecast Dashboard','Investment & Funding Dashboard']
    }
  },
  investor: {
    name:'James Thornton', role:'VC Partner, AI Fund', init:'JT',
    req:'"We\'re deploying $200M into AI this year. I need to understand where enterprise value is accumulating — which companies are pulling away, which funding categories are hot, and what geographic patterns look like. Need this for our investment committee."',
    correct:{goal:'Identify high-conviction AI investment opportunities by segment and stage',kpi:'Funding Volume, Valuation Multiples, ARR Growth Rate, Deal Count by Category',sources:'PitchBook, Crunchbase, Epoch AI, SEC Filings',segments:'Stage, Category, Geography, Year',sme:'Investment Analyst / Market Research Lead',output:'Investment & Funding Dashboard'},
    options:{
      goal:['Identify high-conviction AI investment opportunities by segment and stage','Monitor AI model safety and alignment metrics','Track product feature adoption rates','Analyze customer service ticket volume'],
      kpi:['Funding Volume, Valuation Multiples, ARR Growth Rate, Deal Count by Category','Red-teaming Score, Alignment Benchmark, Safety Incident Rate','Feature Engagement %, Activation Rate, Retention','Ticket Volume, CSAT, Resolution Time'],
      sources:['PitchBook, Crunchbase, Epoch AI, SEC Filings','Internal Red-team Logs, Safety Benchmarks','Mixpanel, Amplitude, Product Analytics','ServiceNow, Zendesk, CRM'],
      segments:['Stage, Category, Geography, Year','Model, Test Type, Evaluator','Feature, User Cohort, Release Version','Channel, Priority, Agent, Category'],
      sme:['Investment Analyst / Market Research Lead','AI Safety Researcher','Product Analytics Lead','Customer Success Manager'],
      output:['Investment & Funding Dashboard','Trends & Forecast Dashboard','Company Intelligence Dashboard','Sector Breakdown Dashboard']
    }
  },
  product: {
    name:'Sarah Kim', role:'Product Manager, LLM Platform', init:'SK',
    req:'"Our model is live but I have no idea how we compare on price-performance versus GPT-4 and Claude. I need to show the team which segments have the highest willingness to pay and where we\'re losing to competitors on capabilities."',
    correct:{goal:'Benchmark product competitiveness across capability, price, and segment fit',kpi:'Benchmark Scores, Price per M Tokens, Segment Market Share, Win/Loss Rate',sources:'Epoch AI Benchmarks, Company Pricing Pages, LLM Leaderboard, Stanford HAI',segments:'Model, Use Case, Customer Segment, Benchmark',sme:'ML Research Lead + Competitive Intelligence',output:'Trends & Forecast Dashboard + Company Intelligence'},
    options:{
      goal:['Benchmark product competitiveness across capability, price, and segment fit','Forecast 10-year market size by technology type','Optimize data center energy consumption','Manage compliance with EU AI Act'],
      kpi:['Benchmark Scores, Price per M Tokens, Segment Market Share, Win/Loss Rate','CAGR, TAM, SAM, Forecast Revenue','PUE, Carbon Intensity, kWh per Training Run','Compliance Score, Audit Count, Incident Log'],
      sources:['Epoch AI Benchmarks, Company Pricing Pages, LLM Leaderboard, Stanford HAI','Grand View Research, Market.us, Precedence Research','Energy Monitoring APIs, Green500 List','Regulatory Databases, Internal Compliance Tracker'],
      segments:['Model, Use Case, Customer Segment, Benchmark','Technology, Region, End-Use, Year','Data Center, Workload Type, Provider','Regulation, Jurisdiction, Business Line'],
      sme:['ML Research Lead + Competitive Intelligence','Market Research Analyst','Infrastructure & Sustainability Lead','Legal & Compliance Officer'],
      output:['Trends & Forecast Dashboard + Company Intelligence','Market Overview Dashboard','Investment & Funding Dashboard','Sector Breakdown Dashboard']
    }
  },
  risk: {
    name:'David Osei', role:'AI Risk & Governance Manager', init:'DO',
    req:'"The board wants a quarterly view of our AI risk exposure. That includes model reliability issues, regulatory changes in key markets, and whether our vendors — OpenAI, Anthropic — are financially stable enough to be long-term partners."',
    correct:{goal:'Assess AI operational, vendor, and regulatory risk exposure',kpi:'Vendor ARR Stability, Regulatory Incident Count, Model Reliability Score, Concentration Risk %',sources:'Company Disclosures, Stanford HAI Policy Tracker, Internal Incident Logs',segments:'Vendor, Regulation, Region, Risk Category',sme:'AI Governance Lead + Legal Counsel',output:'Trends & Forecast Dashboard (Risk overlay)'},
    options:{
      goal:['Assess AI operational, vendor, and regulatory risk exposure','Grow enterprise AI revenue by 40%','Reduce LLM inference cost per query','Hire 50 new ML engineers by Q3'],
      kpi:['Vendor ARR Stability, Regulatory Incident Count, Model Reliability Score, Concentration Risk %','ARR, Net Revenue Retention, Pipeline Value','Cost per Token, Latency P95, GPU Utilization','Time to Fill, Offer Acceptance Rate, Attrition'],
      sources:['Company Disclosures, Stanford HAI Policy Tracker, Internal Incident Logs','CRM, Salesforce, Billing System','Infrastructure Monitoring, Cloud Billing','HRIS, ATS, LinkedIn Insights'],
      segments:['Vendor, Regulation, Region, Risk Category','Customer, Product, Channel, Region','Model, Provider, Workload, Region','Department, Role, Office, Level'],
      sme:['AI Governance Lead + Legal Counsel','Revenue Operations Lead','Infrastructure Lead','People Analytics Manager'],
      output:['Trends & Forecast Dashboard (Risk overlay)','Company Intelligence Dashboard','Investment & Funding Dashboard','Market Overview Dashboard']
    }
  },
  sales: {
    name:'Maria Gonzalez', role:'VP Enterprise Sales, AI Platform', init:'MG',
    req:'"I need to close 20 enterprise deals this quarter. Tell me which industries are buying AI fastest, what pain points drive the biggest contracts, and how our deal sizes compare to OpenAI and Microsoft\'s enterprise numbers."',
    correct:{goal:'Prioritize enterprise sales by high-velocity AI-adopting verticals',kpi:'Sector AI Adoption Rate, Deal Size Benchmark, Vertical Growth %, Win Rate by Segment',sources:'Stanford HAI Index, Grand View Research, CRM, Competitor Intel',segments:'Vertical, Deal Size, Region, Use Case',sme:'Sales Director + Market Intelligence Analyst',output:'Sector Breakdown Dashboard'},
    options:{
      goal:['Prioritize enterprise sales by high-velocity AI-adopting verticals','Optimize our LLM for multilingual benchmarks','Reduce model hallucination rate by 30%','Improve developer onboarding experience'],
      kpi:['Sector AI Adoption Rate, Deal Size Benchmark, Vertical Growth %, Win Rate by Segment','BLEU Score, Cross-lingual Transfer, Language Coverage','Hallucination Rate, Factual Accuracy, Source Citation %','Time to First API Call, Docs NPS, SDK Downloads'],
      sources:['Stanford HAI Index, Grand View Research, CRM, Competitor Intel','Multilingual Eval Datasets, Internal Benchmarks','Eval Frameworks, Human Eval Logs','Developer Portal Analytics, Support Tickets'],
      segments:['Vertical, Deal Size, Region, Use Case','Language, Model, Dataset, Task','Model Version, Prompt Type, Output Category','Developer Cohort, Onboarding Step, SDK Version'],
      sme:['Sales Director + Market Intelligence Analyst','ML Research Lead (NLP)','Alignment Research Lead','Developer Experience Lead'],
      output:['Sector Breakdown Dashboard','Trends & Forecast Dashboard','Company Intelligence Dashboard','Investment & Funding Dashboard']
    }
  },
  data: {
    name:'Lin Wei', role:'Lead Data Scientist, AI Analytics Team', init:'LW',
    req:'"Our pipeline is ingesting market research from six different vendors and the numbers never agree. I need to understand which sources conflict the most, how to reconcile them, and then build a clean model the business can trust for forecasting."',
    correct:{goal:'Ensure data quality and source reconciliation for AI market intelligence',kpi:'Source Variance %, Reconciliation Gap, Confidence Score, Forecast Accuracy',sources:'Stanford HAI, Epoch AI CSV, Grand View Research, Market.us, Precedence Research',segments:'Source, Metric, Time Period, Confidence Level',sme:'Data Engineering Lead + Market Research Analyst',output:'Data Pipeline + Star Schema Model'},
    options:{
      goal:['Ensure data quality and source reconciliation for AI market intelligence','Launch a new generative AI feature for customers','Reduce AWS compute costs by 25%','Build an internal AI knowledge management system'],
      kpi:['Source Variance %, Reconciliation Gap, Confidence Score, Forecast Accuracy','Feature Adoption Rate, Revenue Lift, DAU','Cost per GPU Hour, Reserved vs On-Demand, Savings Plan Utilization','Search Hit Rate, Knowledge Coverage, Query Resolution %'],
      sources:['Stanford HAI, Epoch AI CSV, Grand View Research, Market.us, Precedence Research','Product Analytics, Billing, A/B Test Logs','AWS Cost Explorer, Spot Pricing API, Internal Tags','Confluence, Notion, Slack, Internal KB'],
      segments:['Source, Metric, Time Period, Confidence Level','Feature, User Cohort, Platform, Date','Service, Region, Instance Type, Date','Topic, Team, Source System, Date'],
      sme:['Data Engineering Lead + Market Research Analyst','Product Analytics Lead','Cloud FinOps Lead','Knowledge Management Lead'],
      output:['Data Pipeline + Star Schema Model','Trends & Forecast Dashboard','Investment & Funding Dashboard','Sector Breakdown Dashboard']
    }
  }
};

let baScore = 0;
let completedSims = new Set();
let currentSim = null;
let currentSelections = {};

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
const datasets = {
  market: {
    filename: 'market_size.csv',
    headers: ['year','market_size_usd_b','region_north_america_pct','region_apac_pct','region_europe_pct','region_row_pct'],
    rows: [[2019,47,34.2,27.1,21.8,16.9],[2020,93,34.5,27.5,22.0,16.0],[2021,142,34.8,27.8,22.1,15.3],[2022,208,35.0,28.0,22.0,15.0],[2023,391,35.2,28.2,21.9,14.7],[2024,470,35.5,28.5,22.0,14.0],[2025,542,35.5,28.5,22.0,14.0],[2026,757,35.6,28.8,21.8,13.8],[2028,1380,35.8,29.5,21.2,13.5],[2030,2100,35.0,30.5,21.0,13.5],[2034,3680,33.0,33.0,21.0,13.0]]
  },
  companies: {
    filename: 'companies.csv',
    headers: ['company','type','arr_usd_b','valuation_usd_b','yoy_growth_pct','key_product','strength'],
    rows: [['Anthropic','Private',30,380,8000,'Claude / Claude Code / MCP','Enterprise Safety'],['OpenAI','Private',25,850,580,'ChatGPT / GPT-5 / Sora','Consumer Brand'],['Google DeepMind','Public',8,2100,200,'Gemini / AlphaFold','Research Scale'],['NVIDIA','Public',130,3000,122,'H100 / H200 / CUDA','Hardware 80pct share'],['Microsoft','Public',245,3200,16,'Copilot / Azure AI / GitHub','Enterprise Distribution'],['xAI','Private',0.5,50,400,'Grok / Colossus','Real-time Data'],['Mistral AI','Private',0.4,6,1900,'Mistral Large / Le Chat','Open-source EU'],['Meta AI','Public',164,1400,21,'Llama / Meta AI Assistant','Open-source Leader']]
  },
  investment: {
    filename: 'investment.csv',
    headers: ['year','us_investment_usd_b','china_investment_usd_b','global_genai_usd_b','foundation_models_pct','healthcare_ai_pct','infrastructure_pct'],
    rows: [[2019,18,5.0,1.2,20,10,8],[2020,28,6.5,2.5,30,12,9],[2021,52,9.0,7.0,45,10,8],[2022,61,9.8,10.0,55,10,8],[2023,91,9.1,18.0,60,9,8],[2024,109.1,9.3,33.9,67.3,8.4,7.2],[2025,140,10.0,50.0,68,8,8]]
  },
  sectors: {
    filename: 'sectors.csv',
    headers: ['vertical','market_share_pct','cagr_pct_2025_2033','component_hardware_pct','component_software_pct','component_services_pct'],
    rows: [['Healthcare',25.7,26.4,45.6,34.2,20.2],['BFSI',18.4,24.1,40.0,38.0,22.0],['Retail',14.2,28.5,38.0,38.5,23.5],['Manufacturing',12.1,22.8,55.0,28.0,17.0],['Automotive',11.8,33.2,60.0,25.0,15.0],['Legal',9.2,17.2,20.0,50.0,30.0],['Media',8.6,19.5,25.0,45.0,30.0]]
  },
  trajectory: {
    filename: 'revenue_trajectory.csv',
    headers: ['period','anthropic_arr_usd_b','openai_arr_usd_b','xai_arr_usd_b','source'],
    rows: [['Jan 2023',0.02,0.2,0,'Epoch AI'],['Jul 2023',0.05,1.3,0,'Epoch AI'],['Jan 2024',0.087,2.5,0,'Epoch AI / Company'],['Jul 2024',0.38,5.5,0.1,'Epoch AI'],['Jan 2025',1.4,13,0.1,'Epoch AI'],['May 2025',3,15,0.3,'Company disclosures'],['Jul 2025',7,18,0.5,'Company disclosures'],['Nov 2025',9,22,0.5,'Company disclosures'],['Jan 2026',11,23,0.5,'The Information'],['Feb 2026',14,25,0.5,'Company disclosures'],['Apr 2026',30,25,0.5,'Company disclosures']]
  },
  benchmarks: {
    filename: 'benchmarks.csv',
    headers: ['benchmark','category','score_2023','score_2024','improvement_pp','source'],
    rows: [['SWE-bench','Software Engineering',4.4,71.7,67.3,'Stanford HAI 2025'],['GPQA','Graduate-Level Science',28.1,77.0,48.9,'Stanford HAI 2025'],['MMMU','Multimodal Understanding',56.8,75.6,18.8,'Stanford HAI 2025']]
  }
};

function downloadCSV(key) {
  const ds = datasets[key]; if (!ds) return;
  let csv = ds.headers.join(',') + '\n';
  ds.rows.forEach(row => {
    csv += row.map(v => typeof v === 'string' && v.includes(',') ? '"'+v+'"' : v).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = ds.filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function downloadDictionary() {
  const dict = `AI INDUSTRY INTELLIGENCE PLATFORM — DATA DICTIONARY
Research by Joey Carbajo Olivari · Updated May 2026
${'='.repeat(60)}

DATASET: GLOBAL AI MARKET SIZE (market_size.csv)
Source: Grand View Research, Market.us, Precedence Research
Confidence: MEDIUM (analyst estimates)
${'─'.repeat(60)}
year                     INTEGER  Calendar year
market_size_usd_b        FLOAT    Global AI market USD Billions
region_north_america_pct FLOAT    North America share (%)
region_apac_pct          FLOAT    Asia-Pacific share (%)
region_europe_pct        FLOAT    Europe share (%)
region_row_pct           FLOAT    Rest of World share (%)

DATASET: AI COMPANY INTELLIGENCE (companies.csv)
Source: Epoch AI, company disclosures, SEC filings, Crunchbase
Confidence: HIGH for ARR/revenue; MEDIUM for valuations
${'─'.repeat(60)}
company          VARCHAR  Company name
type             VARCHAR  Public or Private
arr_usd_b        FLOAT    Annualized Run Rate USD Billions
valuation_usd_b  FLOAT    Valuation at last funding round
yoy_growth_pct   FLOAT    Year-over-year growth percentage
key_product      VARCHAR  Primary product(s)
strength         VARCHAR  Primary competitive strength

DATASET: AI INVESTMENT & FUNDING (investment.csv)
Source: Stanford HAI AI Index 2025, PitchBook, Crunchbase
Confidence: HIGH
${'─'.repeat(60)}
year                   INTEGER  Calendar year
us_investment_usd_b    FLOAT    US private AI investment USD B
china_investment_usd_b FLOAT    China private AI investment USD B
global_genai_usd_b     FLOAT    Global GenAI investment USD B
foundation_models_pct  FLOAT    Foundation models share (%)
healthcare_ai_pct      FLOAT    Healthcare AI share (%)
infrastructure_pct     FLOAT    AI infrastructure share (%)

DATASET: SECTOR BREAKDOWN (sectors.csv)
Source: Grand View Research, Precedence Research
Confidence: MEDIUM (analyst estimates)
${'─'.repeat(60)}
vertical               VARCHAR  End-use industry vertical
market_share_pct       FLOAT    Share of total AI market (%)
cagr_pct_2025_2033     FLOAT    Projected CAGR 2025–2033 (%)
component_hardware_pct FLOAT    Hardware share (%)
component_software_pct FLOAT    Software share (%)
component_services_pct FLOAT    Services share (%)

DATASET: REVENUE TRAJECTORY (revenue_trajectory.csv)
Source: Epoch AI, press releases, The Information
Confidence: HIGH (directly disclosed figures)
${'─'.repeat(60)}
period              VARCHAR  Time period of disclosure
anthropic_arr_usd_b FLOAT    Anthropic ARR USD Billions
openai_arr_usd_b    FLOAT    OpenAI ARR USD Billions
xai_arr_usd_b       FLOAT    xAI ARR USD Billions
source              VARCHAR  Data source for this row

DATASET: BENCHMARK IMPROVEMENTS (benchmarks.csv)
Source: Stanford HAI AI Index 2025
Confidence: HIGH (published academic benchmarks)
${'─'.repeat(60)}
benchmark      VARCHAR  Evaluation benchmark name
category       VARCHAR  Benchmark category/domain
score_2023     FLOAT    Best model score in 2023
score_2024     FLOAT    Best model score in 2024
improvement_pp FLOAT    Percentage point improvement
source         VARCHAR  Source publication

${'='.repeat(60)}
CONFIDENCE LEVELS
HIGH     Directly disclosed or peer-reviewed/audited source
MEDIUM   Analyst estimate; treat as directional range
ESTIMATE Long-range forecast; high uncertainty

For questions: Joey Carbajo Olivari — AI Process Enablement
`;
  const blob = new Blob([dict], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'data_dictionary.txt';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}


// ─── INTERACTIVITY ───────────────────────────────────

// ── Tooltip system ────────────────────────────────────
const TT = document.getElementById('chartTooltip');
function showTT(e, label, rows) {
  TT.style.display = 'block';
  TT.innerHTML = `<div class="tt-label">${label}</div>` +
    rows.map(r=>`<div class="tt-row"><div class="tt-dot" style="background:${r.color||'#00d4ff'}"></div><span>${r.name}: </span><span class="tt-val">${r.val}</span></div>`).join('');
  moveTT(e);
}
function moveTT(e) {
  TT.style.left = (e.clientX+14)+'px';
  TT.style.top  = (e.clientY-10)+'px';
  if (e.clientX+220>window.innerWidth) TT.style.left=(e.clientX-210)+'px';
}
function hideTT() { TT.style.display='none'; }

const chartPoints={};
function storePoints(id,pts){ chartPoints[id]=pts; }

function attachTip(id, fmtVal) {
  const el=document.getElementById(id); if(!el) return;
  el.addEventListener('mousemove',function(e){
    const pts=chartPoints[id]; if(!pts||!pts.length) return;
    const rect=el.getBoundingClientRect(), mx=e.clientX-rect.left;
    let best=null,bd=999;
    pts.forEach(p=>{ const d=Math.abs(p.x-mx); if(d<bd){bd=d;best=p;}});
    if(best&&bd<40) showTT(e, best.label,
      best.rows.map(r=>({...r, val: fmtVal ? fmtVal(r.rawVal) : r.rawVal})));
    else hideTT();
  });
  el.addEventListener('mouseleave',hideTT);
}

// Interactive lineChart — stores hover points
function lineCI(id, labels, datasets, opts={}) {
  const r=getCtx(id); if(!r) return;
  const {ctx,w,h}=r, pad=opts.pad||48;
  const cw=w-pad-20, ch=h-pad-28;
  const allV=datasets.flatMap(d=>d.data);
  const max=Math.max(...allV)*1.12;
  const min=Math.min(...allV)*(Math.min(...allV)<0?1.1:0.9);
  const rng=max-min||1;
  grid(ctx,w,h,pad);

  ctx.fillStyle=C.muted; ctx.font='10px var(--font-mono)'; ctx.textAlign='right';
  for(let i=0;i<=4;i++){
    const v=min+rng*(1-i/4), y=pad+ch*i/4;
    ctx.fillText(opts.fmt?opts.fmt(v):v.toFixed(0), pad-8, y+4);
  }
  ctx.textAlign='center'; ctx.fillStyle=C.muted; ctx.font='10px var(--font-sans)';
  labels.forEach((l,i)=>{ const x=pad+cw*i/(labels.length-1); ctx.fillText(l,x,h-6); });

  const byX={};
  datasets.forEach((ds,di)=>{
    const col=ds.color||[C.accent,C.green,C.accent2,C.amber][di%4];
    const pts=ds.data.map((v,i)=>({x:pad+cw*i/(labels.length-1),y:pad+ch*(1-(v-min)/rng)}));

    if(ds.fill){
      const fg=ctx.createLinearGradient(0,pad,0,pad+ch);
      fg.addColorStop(0,hexA(col,0.18)); fg.addColorStop(0.6,hexA(col,0.06)); fg.addColorStop(1,hexA(col,0));
      ctx.fillStyle=fg; ctx.beginPath(); smoothLine(ctx,pts);
      ctx.lineTo(pts[pts.length-1].x,pad+ch); ctx.lineTo(pts[0].x,pad+ch); ctx.closePath(); ctx.fill();
    }

    // glow pass
    ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=10;
    ctx.strokeStyle=hexA(col,0.35); ctx.lineWidth=6; ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.beginPath(); smoothLine(ctx,pts); ctx.stroke(); ctx.restore();

    // main line
    ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.beginPath(); smoothLine(ctx,pts); ctx.stroke();

    pts.forEach((p,i)=>{
      ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=12;
      ctx.fillStyle=hexA(col,0.3); ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2); ctx.fill();
      if(!byX[i]) byX[i]={x:p.x,label:labels[i],rows:[]};
      byX[i].rows.push({name:ds.label||'Value',color:col,rawVal:ds.data[i]});
    });
  });
  storePoints(id,Object.values(byX));

  if(datasets.length>1&&opts.legend!==false){
    let lx=pad;
    datasets.forEach((ds,i)=>{
      const col=ds.color||[C.accent,C.green,C.accent2,C.amber][i%4];
      const lbl=ds.label||''; const tw=ctx.measureText(lbl).width;
      ctx.fillStyle=hexA(col,0.12); ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(lx-4,2,tw+22,16,4); else ctx.rect(lx-4,2,tw+22,16);
      ctx.fill();
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(lx+5,10,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=C.text; ctx.textAlign='left'; ctx.font='10px var(--font-sans)';
      ctx.fillText(lbl,lx+13,14); lx+=tw+32;
    });
  }
}

// Interactive barChart — stores hover points
function barCI(id, labels, data, colors, opts={}) {
  const r=getCtx(id); if(!r) return;
  const {ctx,w,h}=r, pad=44;
  const many=labels.length>4;
  const bottomPad=many?48:28;
  const cw=w-pad-16, ch=h-pad-bottomPad;
  const max=Math.max(...data)*1.18, bw=cw/labels.length*0.58;
  grid(ctx,w,h,pad);

  // y-axis labels
  ctx.fillStyle=C.muted; ctx.font='10px var(--font-mono)'; ctx.textAlign='right';
  for(let i=0;i<=4;i++){
    const v=max*(1-i/4), y=pad+ch*i/4;
    ctx.fillText(opts.fmt?opts.fmt(v):v.toFixed(0), pad-8, y+4);
  }

  const pts=[];
  data.forEach((v,i)=>{
    const x=pad+cw*(i+0.5)/labels.length-bw/2, bh=ch*v/max, y=pad+ch-bh;
    const color=colors[i%colors.length];

    // glow
    ctx.save(); ctx.shadowColor=color; ctx.shadowBlur=18;
    ctx.fillStyle=hexA(color,0.15);
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x-2,y,bw+4,bh,[6,6,0,0]); else ctx.rect(x-2,y,bw+4,bh);
    ctx.fill(); ctx.restore();

    // gradient bar
    const grad=ctx.createLinearGradient(0,y,0,y+bh);
    grad.addColorStop(0,color); grad.addColorStop(0.5,hexA(color,0.85)); grad.addColorStop(1,hexA(color,0.35));
    ctx.fillStyle=grad; ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x,y,bw,bh,[5,5,0,0]); else ctx.rect(x,y,bw,bh);
    ctx.fill();

    // bright top edge
    ctx.fillStyle=hexA(color,0.7); ctx.fillRect(x,y,bw,2);

    // value label
    ctx.save(); ctx.shadowColor=color; ctx.shadowBlur=8;
    ctx.fillStyle=C.text; ctx.font='bold 10px var(--font-mono)'; ctx.textAlign='center';
    ctx.fillText(opts.fmt?opts.fmt(v):v, x+bw/2, y-7); ctx.restore();

    // x label
    ctx.fillStyle=C.muted; ctx.font='10px var(--font-sans)';
    if(many){
      ctx.save(); ctx.translate(x+bw/2,h-bottomPad+14); ctx.rotate(-Math.PI/5); ctx.textAlign='right';
      ctx.fillText(labels[i],0,0); ctx.restore();
    } else {
      ctx.textAlign='center'; ctx.fillText(labels[i],x+bw/2,h-10);
    }
    pts.push({x:x+bw/2,label:labels[i],rows:[{name:labels[i],color,rawVal:v}]});
  });
  storePoints(id,pts);
}

// ── Market Overview ───────────────────────────────────
const mktData={
  '2024':{market:'$391B',adoption:'68%',forecast:'$3.68T',naShare:'35.2%',change:'+87% vs 2023',adoptChange:'+13pp vs 2023'},
  '2025':{market:'$542B',adoption:'78%',forecast:'$3.68T',naShare:'35.5%',change:'▲ 38.5% CAGR',adoptChange:'+10pp vs 2024'},
  '2026':{market:'$757B',adoption:'83%',forecast:'$3.68T',naShare:'35.6%',change:'est. +40%',adoptChange:'+5pp est.'},
  '2030':{market:'$2.1T',adoption:'92%',forecast:'$3.68T',naShare:'35.0%',change:'est. by 2030',adoptChange:'est.'},
  '2034':{market:'$3.68T',adoption:'96%',forecast:'$3.68T',naShare:'33.0%',change:'CAGR target',adoptChange:'est.'},
};
let mktPeriod='2025';

// ── Shared helper — activates one chip within its data-group only ──
function activateChip(btn) {
  if (!btn) return;
  const group = btn.getAttribute('data-group');
  if (group) {
    document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');
}

// ── Market Overview ───────────────────────────────────
function setMktPeriod(period, btn) {
  mktPeriod = period;
  activateChip(btn);
  renderMktKPIs();
}

// ── Company filter ────────────────────────────────────
// (handled by activateChip + coData block below)

// ── Investment filter ─────────────────────────────────
function setInvFilter(key, btn) {
  invKey = key;
  activateChip(btn);
  renderInvChart();
}

// ── Sector filter ─────────────────────────────────────
// Sort By and Show are independent groups — both can have one active each
function setSegFilter(key, btn) {
  if (key === 'share' || key === 'cagr') segSort = key;
  if (key === 'all'   || key === 'top3') segShow = key;
  activateChip(btn); // scoped to its own data-group, so no cross-contamination
  renderSegChart();
}

// ── Trends filter ─────────────────────────────────────
function setTrendFilter(key, btn) {
  trKey = key;
  activateChip(btn);
  renderTrendChart();
}
function renderMktKPIs(){
  const d=mktData[mktPeriod]||mktData['2025'];
  const row=document.getElementById('mktKpiRow'); if(!row) return;
  row.innerHTML=`
    <div class="kpi" style="--kpi-color:var(--accent)">
      <div class="kpi-label">Global AI Market ${mktPeriod}</div>
      <div class="kpi-val">${d.market}</div>
      <div class="kpi-change up">${d.change}</div>
      <div class="kpi-sub">Market.us / Grand View Research</div>
    </div>
    <div class="kpi" style="--kpi-color:var(--green)">
      <div class="kpi-label">Enterprise AI Adoption ${mktPeriod}</div>
      <div class="kpi-val">${d.adoption}</div>
      <div class="kpi-change up">${d.adoptChange}</div>
      <div class="kpi-sub">Stanford HAI AI Index 2025</div>
    </div>
    <div class="kpi" style="--kpi-color:var(--accent2)">
      <div class="kpi-label">AI Forecast 2034</div>
      <div class="kpi-val">${d.forecast}</div>
      <div class="kpi-change up">▲ 19.2% CAGR</div>
      <div class="kpi-sub">Precedence Research</div>
    </div>
    <div class="kpi" style="--kpi-color:var(--amber)">
      <div class="kpi-label">N. America Share ${mktPeriod}</div>
      <div class="kpi-val">${d.naShare}</div>
      <div class="kpi-change neutral">Dominant region</div>
      <div class="kpi-sub">Grand View Research</div>
    </div>`;
}

const mktYrL=['2019','2020','2021','2022','2023','2024','2025'];
const mktYrD=[47,93,142,208,391,470,542];
function onMktRange(el){
  const idx=parseInt(el.value);
  document.getElementById('mktYearVal').textContent=mktYrL[idx];
  const sl=mktYrL.slice(0,idx+1), sd=mktYrD.slice(0,idx+1);
  lineCI('cMarket',sl,[{label:'Market Size',data:sd,color:C.accent,fill:true}],
    {pad:52,fmt:v=>v>=1000?'$'+Math.round(v/100)/10+'T':'$'+Math.round(v)+'B'});
  attachTip('cMarket',v=>v>=1000?'$'+(v/1000).toFixed(2)+'T':'$'+v+'B');
}

// ── Company data ──────────────────────────────────────
const coData={
  all:    {l:['Anthropic','OpenAI','Google DM','NVIDIA','Microsoft','xAI','Mistral','Meta'],d:[30,25,8,130,245,0.5,0.4,164]},
  private:{l:['Anthropic','OpenAI','xAI','Mistral'],d:[30,25,0.5,0.4]},
  public: {l:['Google DM','NVIDIA','Microsoft','Meta'],d:[8,130,245,164]},
  top3:   {l:['Microsoft','NVIDIA','Anthropic'],d:[245,130,30]},
};
function setCoFilter(key,btn){ activateChip(btn); const d=coData[key]; const cols=[C.green,C.accent,C.accent2,C.amber,C.accent,C.amber,C.accent2,C.green]; barCI('cRevRace',d.l,d.d,cols,{fmt:v=>'$'+v+'B'}); attachTip('cRevRace',v=>'$'+v+'B ARR/Rev'); }

// ── Investment data + helpers ─────────────────────────
const invL=['2019','2020','2021','2022','2023','2024','2025*'];
const invTotal=[18,28,52,61,91,109.1,140];
const invGenAI=[0.5,1.2,3.8,7.6,18,33.9,50];
const invChina=[5,6.5,9,9.8,9.1,9.3,10];
let invKey='total';
function onInvRange(el){
  document.getElementById('invYearVal').textContent=invL[parseInt(el.value)];
  renderInvChart();
}
function renderInvChart(){
  const end=parseInt(document.getElementById('invYearRange')?document.getElementById('invYearRange').value:6)+1;
  const labels=invL.slice(0,end);
  if(invKey==='genai'){
    barCI('cInvest',labels,invGenAI.slice(0,end),[C.accent2,C.accent2,C.accent2,C.accent2,C.accent2,C.green,C.amber],{fmt:v=>'$'+v+'B'});
    attachTip('cInvest',v=>'$'+v+'B GenAI');
  } else if(invKey==='geo'){
    lineCI('cInvest',labels,[{label:'US',data:invTotal.slice(0,end),color:C.accent},{label:'China',data:invChina.slice(0,end),color:C.red}],{pad:48,fmt:v=>'$'+v+'B',legend:true});
    attachTip('cInvest',v=>'$'+v+'B');
  } else {
    barCI('cInvest',labels,invTotal.slice(0,end),[C.accent,C.accent,C.accent,C.accent,C.accent2,C.green,C.amber],{fmt:v=>'$'+v+'B'});
    attachTip('cInvest',v=>'$'+v+'B invested');
  }
}

// ── Sector data + helpers ─────────────────────────────
const segAll={l:['Healthcare','BFSI','Retail','Mfg','Auto','Legal','Media'],share:[25.7,18.4,14.2,12.1,11.8,9.2,8.6],cagr:[26.4,24.1,28.5,22.8,33.2,17.2,19.5]};
let segSort='share',segShow='all';
function renderSegChart(){
  let data=segAll.l.map((l,i)=>({l,share:segAll.share[i],cagr:segAll.cagr[i]}));
  data.sort((a,b)=>segSort==='cagr'?b.cagr-a.cagr:b.share-a.share);
  if(segShow==='top3') data=data.slice(0,3);
  const labels=data.map(d=>d.l), vals=data.map(d=>segSort==='cagr'?d.cagr:d.share);
  const cols=[C.accent,C.accent2,C.green,C.amber,C.red,'#a855f7','#6366f1'];
  barCI('cVertical',labels,vals,cols,{fmt:v=>v+(segSort==='cagr'?' CAGR':'%')});
  attachTip('cVertical',v=>v+(segSort==='cagr'?' % CAGR':' % share'));
}

// ── Trends data + helpers ─────────────────────────────
const trL=["Jan'24","May'24","Sep'24","Dec'24","Mar'25","May'25","Jul'25","Nov'25","Jan'26","Feb'26","Apr'26"];
const trD={anthropic:[0.087,0.18,0.35,1.0,1.4,3,7,9,11,14,30],openai:[2.5,3.5,5.0,7.0,9,13,18,22,23,25,25],xai:[0,0,0,0,0.1,0.3,0.5,0.5,0.5,0.5,0.5]};
let trStart=0,trKey='anthropic';
function onTrendRange(el){
  trStart=parseInt(el.value);
  document.getElementById('trendRangeVal').textContent=trL.slice(trStart).pop();
  renderTrendChart();
}
function renderTrendChart(){
  const labels=trL.slice(trStart);
  const colMap={anthropic:C.green,openai:C.accent,xai:C.amber};
  let ds;
  if(trKey==='all'){
    ds=[{label:'Anthropic',data:trD.anthropic.slice(trStart),color:C.green},{label:'OpenAI',data:trD.openai.slice(trStart),color:C.accent},{label:'xAI',data:trD.xai.slice(trStart),color:C.amber}];
  } else {
    ds=[{label:trKey.charAt(0).toUpperCase()+trKey.slice(1)+' ARR',data:trD[trKey].slice(trStart),color:colMap[trKey]||C.accent,fill:true}];
  }
  lineCI('cAnthro',labels,ds,{pad:52,fmt:v=>'$'+v.toFixed(1)+'B',legend:trKey==='all'});
  attachTip('cAnthro',v=>'$'+parseFloat(v).toFixed(2)+'B ARR');
}

// ── Init interactivity after charts render ────────────
function initInteractivity(section){
  if(section==='market'){
    renderMktKPIs();
    // attach tips to static market charts
    attachTip('cMarket', v=>v>=1000?'$'+(v/1000).toFixed(2)+'T':'$'+v+'B');
    attachTip('cDeploy', v=>Math.round(v)+'%');
  }
  if(section==='companies'){
    attachTip('cRevRace', v=>'$'+parseFloat(v).toFixed(2)+'B ARR');
  }
  if(section==='investment'){
    attachTip('cInvest', v=>'$'+v+'B');
    attachTip('cFundCat', v=>v+'%');
  }
  if(section==='segments'){
    attachTip('cVertical', v=>v+'%');
    attachTip('cComponent', v=>v+'%');
  }
  if(section==='trends'){
    attachTip('cAnthro', v=>'$'+parseFloat(v).toFixed(2)+'B ARR');
  }
}

window.addEventListener('load', () => {
  drawAll('market');
  updateProgress();
  setTimeout(()=>initInteractivity('market'),100);
});
window.addEventListener('resize', () => {
  const active = document.querySelector('.section.active');
  if (active) {
    const id = active.id;
    if (['market','companies','investment','segments','trends'].includes(id)) drawAll(id);
  }
});
