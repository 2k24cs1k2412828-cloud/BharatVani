# 🇮🇳 BharatVani (भारतवाणी)
### AI-Powered PIB Live News, Audio Bulletin, Visual Storyboard & Grounded Fact Intelligence Platform

> **Official Government Press Releases (PIB) • Natural Indian Female Audio Stream • 3-Scene Video Bulletins • Grounded Fact Verification Engine**

---

## 📖 Executive Summary & Core Philosophy

**BharatVani (भारतवाणी)** bridges the communication gap between the Government of India and all citizens by transforming complex, technical Press Information Bureau (**PIB**) releases into accessible, multimodal formats:

1. **Dual Perspective Design**:
   - **🌾 Kisan / Easy Mode**: Large legible typography, crystal-clear bullet takeaways, and one-tap natural audio narration tailored for rural citizens, farmers, and elders.
   - **💻 Engineer / Pro Mode**: Complete press release text, official Ministry tags, Release IDs (PRID), and technical policy documentation.
2. **"LLM Proposes. Deterministic Code Verifies"**:
   - Every financial figure (₹, Crore, Lakh), percentage (%), and atomic claim is deterministically verified against the official source text with zero hallucination.
3. **0% AI-Generated Look (Editorial Government Aesthetic)**:
   - A unified, prestigious newspaper masthead and clean button hierarchy (styled like *BBC News*, *The Guardian*, and *Gov.uk*), eliminating tacky neon gradients and AI clutter.
4. **Strict Bilingual Separation**:
   - 100% authentic Hindi (`lang=hi`) and English (`lang=en`) news feeds, audio streams, and fact sheets with zero mixed-language leakage.

---

## 🏛️ High-Level System Architecture

```mermaid
graph TD
    subgraph Official PIB Feeds
        A1[PIB RSS / Allrel Feed - Hindi & English] --> B[Scraper & Detail Parser]
        A2[PIB PressReleasePage.aspx?PRID=...] --> B
    end

    subgraph Backend Intelligence Layer (Node.js / Express)
        B --> C[Document Parser & Chunker]
        C --> D1[Canonical Entity Linker]
        C --> D2[Deterministic Token Extractor]
        C --> D3[Gemini 2.5 Flash Engine]
        
        D3 -->|Proposes Storyboard & Claims| E[Fact Grounding Validator]
        D2 & D1 -->|Ground Truth PIB Source Text| E
        
        B --> F[Google Natural Female Voice Audio Stream /api/tts]
    end

    subgraph Frontend Client (React 18 + Vite)
        E --> G1[Editorial News Grid & Hero Spotlight]
        E --> G2[Interactive Fact Sheet & Evidence Drawer]
        D3 --> G3[TV Newsroom Video Bulletin Player]
        F --> G4[Floating Audio Player Bar]
    end
```

---

## 📁 Repository Structure & Directory Breakdown

```text
mayank/
├── index.html                    # Main HTML5 entry point with BharatVani metadata & Google Fonts
├── package.json                  # Scripts & dependencies (Express, React, Vite, Axios, Lucide)
├── vite.config.js                # Vite client configuration & proxy rules
├── .env                          # Server configuration (PORT=5000, GEMINI_API_KEY)
│
├── server/                       # Full-Stack Backend Services
│   ├── index.js                  # Express API server, routes, and TTS proxy endpoint
│   ├── scraper.js                # Live PIB scraper with strict English/Hindi scrapers & detail parser
│   ├── documentParser.js         # Document chunker, regex number extractor (₹, Crore, %, Quantities)
│   ├── entityLinker.js           # Canonical Entity Registry (Ministries, Schemes, Apex Institutions)
│   ├── factEngine.js             # Fact Grounding & Atomic Claim Decomposition Engine
│   └── geminiService.js          # Google Gemini 2.5 Flash Visual Storyboard & TV Script Generator
│
├── src/                          # React Frontend Application
│   ├── main.jsx                  # React DOM root mounting
│   ├── App.jsx                   # Primary state manager (Lang, Mode, Audio, Modals, Feed)
│   ├── index.css                 # Unified editorial design system (0% AI-generated styling)
│   ├── translations.js           # Comprehensive Hindi & English dictionary
│   │
│   ├── components/               # UI Component Hierarchy
│   │   ├── Navbar.jsx            # Official GOI masthead with Tricolor ribbon, Lang & Mode toggles
│   │   ├── HeroBanner.jsx        # Frontpage lead story card with 16:9 photography & action buttons
│   │   ├── CategoryPills.jsx     # Editorial section tabs (Agriculture, Economy, Tech, Health, etc.)
│   │   ├── SearchBar.jsx         # Real-time search & result counter
│   │   ├── NewsCard.jsx          # Newspaper card with Kisan callout box & unified action toolbar
│   │   ├── ArticleModal.jsx      # Full official press release reading drawer
│   │   ├── VideoPlayerModal.jsx  # TV broadcast studio video bulletin player with subtitles
│   │   ├── FactSheetModal.jsx    # Interactive Fact Verification & Evidence Grounding Drawer
│   │   ├── AudioPlayerBar.jsx    # Floating bottom audio bar with playback speed & progress
│   │   └── Footer.jsx            # Official attribution, accessibility notices & links
│   │
│   └── utils/
│       └── voiceEngine.js        # Natural Indian female voice streaming & playback controller
```

---

## ⚡ Core Engine Modules Explained

### 1. Document Parsing & Deterministic Token Extractor (`server/documentParser.js`)
* **Sentence Boundary Detection**: Chunks raw text into verifiable units using both English periods (`.`) and Devanagari purna viram (`।`).
* **Regex Tokenizers**:
  * **Money / Budget**: Matches `₹`, `Rs`, `करोड़`, `लाख`, `crore`, `lakh`, `million`, `billion`.
  * **Percentages**: Matches `%`, `प्रतिशत`, `percent`.
  * **Quantities**: Matches `tonnes`, `टन`, `hectares`, `हेक्टेयर`, `MW`, `मेगावाट`, `districts`, `जिले`.

### 2. Canonical Entity Linker (`server/entityLinker.js`)
* Maps ambiguous names and aliases to verified Government of India entities:
  * `"MoAFW"`, `"कृषि मंत्रालय"`, `"Ministry of Agriculture"` $\rightarrow$ **Ministry of Agriculture and Farmers Welfare, GoI** (`https://agricoop.gov.in`)
  * `"पीएम-किसान"`, `"PM-KISAN"`, `"Kisan Samman Nidhi"` $\rightarrow$ **Pradhan Mantri Kisan Samman Nidhi**
  * Apex institutions: **ICAR**, **ISRO**, **DRDO**, **RBI**, **PIB**.

### 3. Fact Verification & Grounding Engine (`server/factEngine.js`)
* Implements the core principle: **"LLM Proposes. Deterministic Code Verifies."**
* **Atomic Decomposition**: Breaks complex releases into atomic assertions ($C_1, C_2, C_3$):
  $$\text{Subject} \longrightarrow \text{Action} \longrightarrow \text{Target/Quantity}$$
* **Deterministic Verification Loop**:
  1. Searches exact normalized source text for numbers and evidence quote substrings.
  2. Calculates Levenshtein / token overlap grounding confidence ($0\% - 100\%$).
  3. Rejects or flags unverified numbers, ensuring zero hallucination.

### 4. TV Newsroom Visual Storyboard Generator (`server/geminiService.js`)
* Connects to **Google Gemini 2.5 Flash** (`generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`).
* Produces a 3-scene visual broadcast script with headlines, narration scripts, key takeaway badges, and documentary photography.
* Uses `responseMimeType: 'application/json'` for guaranteed valid structured output.

### 5. Authentic Natural Female Voice Stream (`server/index.js` & `src/utils/voiceEngine.js`)
* Routes speech requests through `/api/tts?text=...&lang=...` to stream natural Indian female audio.
* Includes in-memory audio caching (`ttsCache` Map) for instant 0ms latency on repeated plays.
* Completely eliminates robotic browser synthesizers and male voice interference.

### 6. 3D AI News Anchor & Real-Time Lip-Sync (`src/components/NewsAnchor3D.jsx` & `src/utils/lipSyncEngine.js`)
* **WebGL Newsroom Stage**: Three.js broadcast studio featuring a 3D animated female news presenter positioned at the right side of the broadcast desk.
* **Audio Frequency Lip-Sync**: Uses Web Audio API `AudioContext` and `AnalyserNode` to extract real-time speech formant frequency bands and drive mouth blendshapes (`jawOpen`, `viseme_aa`, `mouthSmile`).
* **Natural Gestures**: Blinking micro-animations, breathing sway, and head speech accents.
* **Dual Model Support**: Supports custom `.glb` / `.gltf` 3D avatar loading via `GLTFLoader` with automatic fallback to high-detail procedural 3D studio presenter meshes.

---

## 📡 Backend API Reference

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/news` | Fetches live PIB press releases | `?lang=hi` or `?lang=en` |
| `GET` | `/api/news/detail` | Fetches full article body & ministry info | `?prid=223344&lang=hi` |
| `POST` | `/api/news/factcheck` | Deterministically verifies facts & claims | `{"article": {...}, "lang": "hi"}` |
| `POST` | `/api/ai/storyboard` | Generates 3-scene AI visual bulletin | `{"article": {...}, "lang": "hi"}` |
| `GET` | `/api/tts` | Streams natural female voice audio (MP3) | `?text=...&lang=hi` |
| `GET` | `/api/health` | Health check and server status | None |

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 2. Clone and Configure
```bash
# Navigate to the project directory
cd mayank

# Create or verify .env file
echo "PORT=5000" > .env
echo "GEMINI_API_KEY=YOUR_GEMINI_API_KEY" >> .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
# Starts backend server (port 5000) and Vite dev server (port 3000) concurrently
npm run dev
```

* **Frontend Web App**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000/api/news`

### 5. Production Build
```bash
npm run build
```

---

## 🎨 UI / UX Highlights

* **Masthead & National Ribbon**: Tricolor accent with real-time PIB live feed status indicator.
* **Kisan Mode vs. Pro Mode**: Dynamic reading switcher tailored for both rural accessibility and technical review.
* **Fact Check Modal**: Click **`✓ Facts`** on any card to view exact source sentences, linked ministry portals, and verified numerical badges.
* **Newsroom Studio Video Player**: 3-scene animated bulletin with live synchronized subtitles and documentary visuals.

---

## 📜 License & Attribution

* **News Content**: Press Information Bureau (PIB), Government of India (`pib.gov.in`).
* **Platform**: © 2026 **BharatVani (भारतवाणी)** — Built for Indian Citizens, Farmers, and Technical Professionals.
