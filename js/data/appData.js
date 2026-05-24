// Static data and shared constants for AI Industry Command Center.
window.AICC_DATA = (() => {
  const titles = {
    about:'About This Project',
    jargon:'Plain-English Guide',
    market:'Market Overview', companies:'Company Intelligence',
    investment:'Investment & Funding', segments:'Sector Breakdown',
    trends:'Trends & Forecast', simulator:'Stakeholder Simulator',
    pipeline:'Data Pipeline Architecture', schema:'Star Schema Model',
    summary:'Final Summary', downloads:'Download Center'
  };

  const C = { accent:'#00d4ff', accent2:'#7b61ff', green:'#00e5a0', amber:'#ffb547', red:'#ff5f6d', muted:'#6b7a99', text:'#e8edf5', border:'rgba(255,255,255,0.07)' };

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

  const mktData={
    '2024':{market:'$391B',adoption:'68%',forecast:'$3.68T',naShare:'35.2%',change:'+87% vs 2023',adoptChange:'+13pp vs 2023'},
    '2025':{market:'$542B',adoption:'78%',forecast:'$3.68T',naShare:'35.5%',change:'▲ 38.5% CAGR',adoptChange:'+10pp vs 2024'},
    '2026':{market:'$757B',adoption:'83%',forecast:'$3.68T',naShare:'35.6%',change:'est. +40%',adoptChange:'+5pp est.'},
    '2030':{market:'$2.1T',adoption:'92%',forecast:'$3.68T',naShare:'35.0%',change:'est. by 2030',adoptChange:'est.'},
    '2034':{market:'$3.68T',adoption:'96%',forecast:'$3.68T',naShare:'33.0%',change:'CAGR target',adoptChange:'est.'},
  };

  const mktYrL=['2019','2020','2021','2022','2023','2024','2025'];

  const mktYrD=[47,93,142,208,391,470,542];

  const coData={
    all:    {l:['Anthropic','OpenAI','Google DM','NVIDIA','Microsoft','xAI','Mistral','Meta'],d:[30,25,8,130,245,0.5,0.4,164]},
    private:{l:['Anthropic','OpenAI','xAI','Mistral'],d:[30,25,0.5,0.4]},
    public: {l:['Google DM','NVIDIA','Microsoft','Meta'],d:[8,130,245,164]},
    top3:   {l:['Microsoft','NVIDIA','Anthropic'],d:[245,130,30]},
  };

  const invL=['2019','2020','2021','2022','2023','2024','2025*'];

  const invTotal=[18,28,52,61,91,109.1,140];

  const invGenAI=[0.5,1.2,3.8,7.6,18,33.9,50];

  const invChina=[5,6.5,9,9.8,9.1,9.3,10];

  const segAll={l:['Healthcare','BFSI','Retail','Mfg','Auto','Legal','Media'],share:[25.7,18.4,14.2,12.1,11.8,9.2,8.6],cagr:[26.4,24.1,28.5,22.8,33.2,17.2,19.5]};

  const trL=["Jan'24","May'24","Sep'24","Dec'24","Mar'25","May'25","Jul'25","Nov'25","Jan'26","Feb'26","Apr'26"];

  const trD={anthropic:[0.087,0.18,0.35,1.0,1.4,3,7,9,11,14,30],openai:[2.5,3.5,5.0,7.0,9,13,18,22,23,25,25],xai:[0,0,0,0,0.1,0.3,0.5,0.5,0.5,0.5,0.5]};

  return {
    titles,
    C,
    sims,
    datasets,
    mktData,
    mktYrL,
    mktYrD,
    coData,
    invL,
    invTotal,
    invGenAI,
    invChina,
    segAll,
    trL,
    trD
  };
})();
