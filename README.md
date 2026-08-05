# 🛡️ PhishShield AI — Real-Time Phishing Detection & Threat Protection System

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React](https://img.shields.io/badge/Dashboard-React_19_%2B_Vite-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**PhishShield AI** is an enterprise-grade cybersecurity ecosystem designed to detect, analyze, and neutralize zero day phishing attacks, Internationalized Domain Name (IDN) homoglyph spoofs, credential harvesting lures, and malicious macro file attachments in real time.

The platform consists of three core components:
1. **Manifest V3 Chrome Extension:** Frontline client-side sensor with a real-time site blocker and local AI heuristics engine.
2. **React SOC Dashboard:** Centralized security operations center displaying live threat telemetry, risk scores, and email header analysis.
3. **Node.js Threat Intelligence Backend:** Express API server aggregating live threat feeds (URLhaus & OpenPhish) with privacy--first client syncing.

---

## ✨ Key Features

- **🛑 Real-Time Site Blocker:** Intercepts browser navigation before DNS resolution finishes. If a URL is classified as dangerous, navigation is halted instantly and redirected to a full-screen **Red Warning Page** (`warning.html`).
- **🔤 Homoglyph & Punycode Protection:** Detects lookalike Cyrillic and unicode character substitutions (e.g., `pаypal.com` or `googlе.com`), unmasking raw **Punycode** (`xn--`) under the hood.
- **🎯 Typosquatting & Levenshtein Brand Inspection:** Calculates domain edit distances ($0 < d \le 2$) against major global brands (PayPal, Google, Apple, Microsoft, Chase, Coinbase, Amazon) to prevent credential theft.
- **🔗 Dynamic URL Unshortener:** Automatically traces HTTP redirect chains for shortened links (`bit.ly`, `tinyurl.com`, `t.co`, `is.gd`) to analyze the final destination URL.
- **💾 Macro & Executable Payload Inspector:** Flags double-extension masks (e.g., `invoice.pdf.exe`) and malicious macro/script files (`.docm`, `.xlsm`, `.vbs`, `.ps1`, `.bat`, `.scr`).
- **📧 Email & NLP Urgency Analyzer:** Evaluates raw email text (`.eml`, `.txt`) and headers for coercive phrasing ("account suspended", "verify immediately") and extracts Indicators of Compromise (IOCs).
- **🔒 Privacy-First Architecture:** Safe websites are analyzed 100% locally in Chrome and discarded immediately. Only definitive threat blocks report telemetry data.

---

## 🏗️ Project Architecture

```
AI Phishing Detector/
├── extension/                 # Manifest V3 Chrome Extension
│   ├── manifest.json          # Chrome Extension Manifest
│   ├── background.js          # Service Worker & Real-Time Navigation Interceptor
│   ├── featureExtractor.js    # Client-side Lexical Feature Extraction Engine
│   ├── phishingModel.js       # ML Classifier & Decision Stump Scoring
│   ├── popup.html             # Extension Popup UI
│   ├── popup.css              # Glassmorphism & Theme Stylesheet
│   ├── popup.js               # Extension Controller & Local Tab Scanner
│   ├── warning.html           # Full-Screen Red Warning Block Page
│   └── warning.js             # Warning Page Override Handler
│
├── dashboard/                 # React Security Operations Center (SOC)
│   ├── src/
│   │   ├── App.tsx            # Main Application Shell & Routing
│   │   ├── components/        # UI Components (Charts, Modals, Feed, History)
│   │   ├── pages/             # Dashboard Views (Overview, Email Analyzer, Threat Map)
│   │   └── utils/             # Email Parsing & Threat Calculation Engines
│   ├── package.json           # React & Vite Dependencies
│   └── vite.config.ts         # Vite Build Configuration
│
├── server/                    # Node.js Threat Intelligence Backend
│   ├── index.js               # Express Server Entry Point & REST Routes
│   ├── services/              # URLhaus & Threat Feed Fetcher Services
│   └── package.json           # Backend Dependencies
│
├── test-emails/               # Sample Phishing Email Test Files (.txt)
├── demo-flagging.csv          # Homoglyph Test URL Suite
└── test-urls.csv              # Categorized Test URL Dataset
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Google Chrome browser (for loading the extension)

---

### 1. Installing the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select the `extension/` directory from this project.
5. Pin **PhishShield AI** to your Chrome toolbar!

---

### 2. Starting the Backend Server

```bash
cd server
npm install
npm start
```
*The threat intelligence server will start on `http://localhost:3001`.*

---

### 3. Running the React SOC Dashboard

```bash
cd dashboard
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser to view the Security Operations Center.*

---

## 🧪 Testing & Demonstration

### Testing Homoglyph Site Blocking
Copy and paste any of these homoglyph test URLs directly into your Chrome address bar to trigger the instant **Red Warning Site Blocker**:

- `https://pаypal.com` *(Cyrillic 'а')*
- `https://googlе.com` *(Cyrillic 'е')*
- `https://chаse.com` *(Cyrillic 'а')*
- `https://micrоsоft.com` *(Cyrillic 'о')*

### Testing Typosquatting & Suspicious Links in Popup Scanner
Open the Extension Popup and scan any of these test links:
- `http://paypal-secure-login.xyz` *(High Risk Danger)*
- `http://free-bitcoin-airdrop.xyz` *(Suspicious TLD & Keyword)*
- `http://example.com/update.exe` *(Executable Extension Flag)*
- `https://google.com` *(100% Verified Safe)*

---

## 🛠️ Tech Stack

- **Extension:** Vanilla JS (ES6+), Web APIs, HTML5, CSS3, Chrome Extensions API (Manifest V3).
- **Dashboard:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Node.js, Express, Cors, Node-Cron, Node-Fetch.

---

## 📄 Documentation

- [PhishShield Presentation Guide](PhishShield_Presentation_Guide.md) — Team presentation script, role breakdowns, and Judge Q&A prep.
- [PhishShield Technical Documentation](PhishShield_Technical_Documentation.md) — Architectural overview and detection algorithm specifications.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
