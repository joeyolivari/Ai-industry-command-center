# AI Industry Command Center

An interactive business-intelligence dashboard tracking the AI market — company revenue, investment flows, sector breakdowns, and forecasts — built as a portfolio project demonstrating business analysis, data modeling, and stakeholder-driven dashboard design.

Live focus: *if a stakeholder asked "where is the AI market going and what does it mean for us?", could they find the answer here in under two minutes?*

## Key Features

- **Market Overview** — global AI market size, regional split, and deployment trends with a year-range slider (2019–2034).
- **Company Intelligence** — ARR, valuation, and growth for major AI companies, sourced from Epoch AI and company disclosures.
- **Investment & Funding** — private AI investment by year, category, and geography.
- **Sector Breakdown** — market share and CAGR by vertical, with hardware/software/services component splits.
- **Trends & Forecast** — benchmark and revenue trajectory charts (2023–2026), including Stanford HAI benchmark scores.
- **Stakeholder Simulator** — a scored exercise where you play different stakeholder roles (CEO, VC Investor, Product Manager, Risk Manager, Enterprise Sales, Data Scientist) and choose the correct KPIs, data sources, and dashboard output for their needs.
- **Data Pipeline & Star Schema** — documented ETL pipeline and dimensional (star schema) data model behind the dashboards.
- **Download Center** — exports all underlying datasets as CSV, plus a full data dictionary, so the analysis can be reviewed or extended.
- **Plain-English Guide & About** — a jargon glossary and a write-up of research methodology, data sources, and the reasoning behind the project.

All charts are hand-rolled on HTML `<canvas>` — there is no external charting library dependency.

## Tech Stack

- Vanilla HTML, CSS, and JavaScript (no frameworks, no build step)
- Custom canvas-based charting engine (`js/app.js`)
- Google Fonts (Sora, Manrope, JetBrains Mono) loaded via CDN
- Static data module (`js/data/appData.js`) driving all views

There is no `package.json`, package manager, or build pipeline — this is a plain static site.

## Getting Started

### Prerequisites

Just a modern web browser. No Node.js, no package manager, and no build tools are required.

### Run Locally

Because the app loads local JS/CSS via relative paths, open it through a local web server rather than the `file://` protocol (some browsers block module/script loading from `file://`).

```bash
# clone the repo
git clone https://github.com/joeyolivari/ai-industry-command-center.git
cd ai-industry-command-center

# serve the directory with any static file server, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Alternatives: `npx serve .`, the VS Code "Live Server" extension, or any other static file server.

## Project Structure

```
.
├── index.html                  # Single-page app shell — all dashboard sections
├── css/
│   ├── styles.css              # Entry point importing the other stylesheets
│   ├── base.css                # Resets, typography, color variables
│   ├── layout.css              # Page/grid layout
│   ├── components.css          # Cards, KPI tiles, nav, charts, etc.
│   ├── background.css          # Background/visual effects
│   ├── logo.css                # Logo styling
│   ├── downloads.css           # Download Center styling
│   ├── interactivity.css       # Hover/interaction states
│   ├── responsive.css          # Responsive breakpoints
│   ├── mobile-overflow.css     # Mobile-specific fixes
│   └── print.css               # Print styles
├── js/
│   ├── app.js                  # Core app logic, navigation, custom charting
│   ├── data/
│   │   └── appData.js          # Static datasets, simulator scenarios, chart data
│   └── features/
│       ├── downloads.js        # CSV export / Download Center logic
│       └── simulator.js        # Stakeholder Simulator scoring logic
├── assets/images/               # Logo and background imagery
└── LICENSE                     # MIT License
```

## Data Sources

Figures are drawn from public research and disclosures, including Stanford HAI's AI Index Report, Epoch AI's company revenue data, Grand View Research, Precedence Research, and company press releases/SEC filings. Full citations and methodology notes are available in the app's "About This Project" section, and the underlying datasets can be exported from the "Download Center."

## License

This project is licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Joey Carbajo Olivari.

## Author

**Joey Carbajo Olivari**
Business Analyst · Process Improvement · Data & AI
