const { datasets } = window.AICC_DATA;

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
