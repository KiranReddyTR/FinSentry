# ScamShield AI 🛡️

> **Detect the scam before you lose your money.**

A complete, production-ready cross-platform mobile application built with **React Native + Expo + TypeScript** that uses AI to detect financial scams in messages and URLs.

---

## Features

| Feature | Description |
|---|---|
| 🏠 **Home Dashboard** | Stats, quick scan actions, recent scams, safety tips |
| 💬 **AI Message Scanner** | Paste suspicious SMS/WhatsApp/email → instant analysis |
| 🔗 **Link Checker** | Detect phishing URLs without ever opening them |
| 📊 **AI Risk Analysis** | Risk score 0–100, indicators, explanations, recommendations |
| 📋 **Scan History** | AsyncStorage-backed history with filters and deletion |
| 📚 **Scam Awareness** | UPI, OTP, Loan, Investment, Phishing, Impersonation guides |

---

## Detection Engine

ScamShield AI uses a **two-layer detection approach**:

### Layer 1 — Rule-Based Engine (always active)
Analyses 20+ scam patterns including:
- OTP requests & urgency tactics
- Fake lottery / prize claims
- UPI collect scams & pay-to-receive fraud
- Impersonation (SBI, RBI, Police, CBI)
- Fake loan / investment schemes
- Phishing URL patterns (typosquatting, suspicious TLDs, IP URLs, missing HTTPS)

### Layer 2 — IBM Granite AI (optional, requires credentials)
When watsonx.ai credentials are configured, the IBM `granite-13b-instruct-v2` model performs deeper contextual analysis on top of the rule-based result.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure IBM watsonx.ai
cp .env.example .env
# Fill in EXPO_PUBLIC_WATSONX_API_KEY and EXPO_PUBLIC_WATSONX_PROJECT_ID

# 3. Start development server
npx expo start

# Scan QR code with Expo Go on Android/iOS
# Or press 'w' for web preview
```

---

## IBM watsonx.ai Setup

1. Create an IBM Cloud account at [cloud.ibm.com](https://cloud.ibm.com)
2. Provision a **watsonx.ai** instance
3. Create a project and note the **Project ID**
4. Generate an **API key** at [cloud.ibm.com/iam/apikeys](https://cloud.ibm.com/iam/apikeys)
5. Add credentials to `.env`:
   ```
   EXPO_PUBLIC_WATSONX_API_KEY=your_key_here
   EXPO_PUBLIC_WATSONX_PROJECT_ID=your_project_id
   EXPO_PUBLIC_WATSONX_REGION=us-south
   ```

The app gracefully falls back to the local rule engine if watsonx is unavailable.

---

## Project Structure

```
ScamShield AI/
├── App.tsx                          # Entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Bottom tabs + stack navigation
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Dashboard
│   │   ├── ScannerScreen.tsx        # Message scanner
│   │   ├── LinkCheckerScreen.tsx    # URL checker
│   │   ├── ResultScreen.tsx         # Scan result detail
│   │   ├── HistoryScreen.tsx        # Scan history
│   │   └── AwarenessScreen.tsx      # Scam education
│   ├── components/
│   │   ├── ScanCard.tsx             # Reusable scan result card
│   │   ├── RiskMeter.tsx            # Risk score visualiser
│   │   └── Button.tsx               # Gradient + outline buttons
│   ├── services/
│   │   ├── detectionEngine.ts       # Rule-based scam detection
│   │   ├── watsonxService.ts        # IBM Granite AI integration
│   │   └── historyService.ts        # AsyncStorage scan history
│   ├── data/
│   │   └── awarenessData.ts         # Scam awareness content
│   ├── theme/index.ts               # Design tokens
│   ├── types/index.ts               # TypeScript types
│   └── utils/helpers.ts             # Utility functions
└── .env.example                     # watsonx credentials template
```

---

## Design System

- **Background**: `#0a0f1e` (dark navy)
- **Primary accent**: `#00d4aa` (teal)
- **Secondary accent**: `#00bcd4` (cyan)
- **Danger**: `#ff4757` | **Warning**: `#ffa502` | **Success**: `#2ed573`
- Fully dark theme, card-based layout, bottom navigation

---

## Privacy & Safety

- Messages are **never stored on external servers**
- IBM watsonx calls are made only when credentials are configured
- The app **never requests OTPs, passwords, or banking PINs**
- Results are for **awareness purposes only** — always verify with official sources

---

## Reporting Scams

- **National Cyber Crime Portal**: [cybercrime.gov.in](https://cybercrime.gov.in)
- **Cyber Crime Helpline**: 1930
- **RBI Complaint Portal**: [cms.rbi.org.in](https://cms.rbi.org.in)
