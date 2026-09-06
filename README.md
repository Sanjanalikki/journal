# DearU

> **"A penny for your thoughts?"**  
> *Write it down. Reflect on it. Make it yours.*

DearU is a private, AI-assisted personal journaling and reflection web application. It provides users with a distraction-free midnight sanctuary to record honest thoughts, receive thoughtful perspectives and summaries from Google Gemini, track emotional trends over time, revisit past memories, and take calming pauses through interactive grounding activities.

---

## Overview

Daily life creates a constant stream of thoughts, anxieties, realizations, and experiences that rarely find a dedicated space for processing. Conventional journaling apps often act as static text repositories, offering little support when an individual feels stuck, overwhelmed, or seeks a gentle sounding board.

DearU bridges this gap by combining:
- **Private Thought Logging**: A focused, clutter-free writing space for capturing daily entries and reflections.
- **Empathetic AI Companion**: Interactive reflection capabilities powered by Google Gemini, offering clarifying questions, structured summaries, and creative brainstorming prompts without shallow platitudes.
- **Memory & Pattern Discovery**: A search-and-calendar view paired with mood analytics to help individuals recognize emotional patterns across weeks and months.
- **Grounding Breaks**: A suite of mindful, interactive exercises (guided breathing, sensory focus, and synthesized ambient soundscapes) to steady the mind when overwhelming emotions arise.

*Note: DearU is an interactive self-reflection and personal mindfulness tool. It is not a medical, therapeutic, or diagnostic application, nor is it a substitute for professional healthcare or mental health services.*

---

## Features

- **Private Journal Entries**: Compose dated journal entries with custom titles, emotional moods, body reflections, and searchable tags.
- **AI-Assisted Reflection**: Conversational reflection with DearU powered by Google Gemini, engaging in calm dialogue to explore underlying emotions and dilemmas.
- **AI Summaries & Perspectives**: Synthesize multi-turn journal sessions into core themes, key insights, and grounding takeaways.
- **Brainstorming & Prompts**: On-demand prompts to explore unexamined angles of a topic or generate low-friction steps forward.
- **Memory & Search**: Real-time full-text search across entry titles, reflections, dialogue messages, summaries, and tags.
- **Interactive Calendar**: Visual monthly calendar view mapping journal activity with mood-specific color tokens for quick historical navigation.
- **Mood Insights**: Visual breakdowns of mood distributions, active journaling days, and reflection habits over time.
- **Thought of the Day**: Rotating collection of contemplative, grounding thoughts and prompts updated daily.
- **Grounding Activities**: Eight dedicated mindfulness exercises:
  - *Breathing Space*: Visual expanding-circle breathing exercise.
  - *Box Breathing*: Structured 4-4-4-4 rhythm pacer.
  - *Calm Sounds*: Procedural Web Audio synthesizer generating rain, ocean waves, and breeze soundscapes without external audio assets.
  - *Gratitude Pebbles*: Interactive stacking exercise for mindful gratitude acknowledgment.
  - *Color Flow*: Chromatic canvas for tactile visual calm.
  - *Mindful Tap*: Gentle rhythmic cadence tool.
  - *Word Garden*: Affirming lexicon interaction.
  - *Puzzle Pause*: Low-stress visual tile reassembly break.
- **Firebase Authentication**: User accounts via Google Sign-In or Email/Password, with local demo session fallback.
- **Firestore Persistence**: Real-time synchronization and storage of user journal entries and profile metadata.
- **Responsive Interface**: Dark-canvas interface tailored for night reflection across mobile, tablet, and desktop viewports.

---

## Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 6](https://vite.dev/)
- **Styling & Motion**: [Tailwind CSS 4](https://tailwindcss.com/), [Motion](https://motion.dev/) (motion/react), [Lucide React](https://lucide.dev/)
- **AI & Language Models**: [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`) connecting to Google Gemini models
- **Backend Proxy**: [Express](https://expressjs.com/) on Node.js (proxies Gemini requests, serves static Vite bundle in production)
- **Database & Authentication**: [Firebase Authentication](https://firebase.google.com/products/auth) & [Cloud Firestore](https://firebase.google.com/products/firestore) (`firebase v12`)
- **Audio Synthesis**: Pure [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (client-side procedural sound generation)
- **Development & Cloud**: [Google AI Studio](https://ai.studio/), [Google Cloud Run](https://cloud.google.com/run)

---

## Architecture

DearU adopts a full-stack architecture combining a client-side Single Page Application (SPA) with a lightweight server-side API proxy:

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Client                      │
│                                                             │
│   React 19 UI  ──►  Firebase Auth & Cloud Firestore (Direct)│
│        │                                                    │
│        ▼ (HTTP POST /api/gemini/reflect)                    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express Backend (server.ts)                 │
│                                                             │
│   • Sanitizes input & redacts sensitive identifier patterns │
│   • Evaluates micro-wellness needs (e.g. breathing pauses)  │
│   • Injects server-side GEMINI_API_KEY                      │
│   • Executes multi-model fallback ladder:                   │
│       gemini-2.5-flash ──► gemini-2.0-flash-lite ──►        │
│       gemini-2.0-flash ──► gemini-2.5-pro                   │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Gemini API                         │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Characteristics
1. **Server-Side API Key Isolation**: The browser client never touches or possesses the `GEMINI_API_KEY`. All Gemini requests pass through the backend endpoint `/api/gemini/reflect`, keeping server credentials hidden.
2. **Client-Side Firebase Integration**: Firebase Authentication and Firestore document queries use the official Firebase Web SDK with authenticated user tokens.
3. **Resilient Model Ladder**: If an individual Gemini model alias experiences rate limits or temporary outages, the server ladder automatically retries across backup model tiers before responding.

---

## Privacy & Security

- **Authentication & User Identity**: User sessions are authenticated through Firebase Authentication.
- **Tenant-Isolated Database**: Journal entries are saved in Cloud Firestore under user-scoped collections (`/users/{userId}/entries/{entryId}`).
- **Firestore Security Rules**: Security rules enforce strict tenant authorization (`request.auth != null && request.auth.uid == userId`) and reject unauthorized access attempts across documents by default.
- **Server-Side Secret Management**: Gemini credentials reside solely in server environment variables (`process.env.GEMINI_API_KEY`). No Gemini keys are exposed in client-facing bundles or public source code.
- **Git Hygiene**: Environment files (`.env`, `.env.local`, `.env.*`) and private certificate formats (`*.pem`, `*.key`) are excluded by `.gitignore`.
- **Firebase Web Config**: The public `firebase-applet-config.json` contains standard Firebase Web parameters necessary for client connectivity and contains no private service accounts or server secrets.
- **Client-Side Sound Generation**: Audio grounding sounds are synthesized on the fly via the Web Audio API without tracking, external requests, or cookies.

---

## Google Cloud / Cloud Run

DearU is designed for seamless deployment on **Google Cloud Run** using the development foundation of **Google AI Studio Build**:

- **Unified Full-Stack Container**: The build command (`npm run build`) bundles the client-side SPA with Vite and compiles `server.ts` into a self-contained CommonJS artifact (`dist/server.cjs`) via `esbuild`.
- **Port Compatibility**: In production, the server binds to `0.0.0.0:3000` (or `process.env.PORT`), serving both the static frontend assets and the `/api` routes from a single Cloud Run container instance.
- **Container Cold Starts**: External npm dependencies are retained via `--packages=external` during bundling to minimize image size and speed up container cold starts.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- [npm](https://www.npmjs.com/) (version 10 or higher)
- A Google AI Studio Gemini API key
- A Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dearu.git
   cd dearu
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Never commit `.env` to version control.)*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

5. **Build and test production locally:**
   ```bash
   npm run build
   npm run start
   ```

---

## Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-side only | API key used by `server.ts` to authenticate requests to the Google Gemini API. |

---

## Firebase Setup

To connect your own Firebase backend:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firebase Authentication** and activate your preferred sign-in providers (e.g., Google or Email/Password).
3. Create a **Cloud Firestore** database in production mode.
4. Apply the security rules defined in `firestore.rules`:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /entries/{entryId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
5. Update `firebase-applet-config.json` with your Firebase web configuration values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

---

## Project Structure

```
├── .env.example                # Template for server environment variables
├── .gitignore                  # Git ignore definitions protecting secrets and build outputs
├── firebase-applet-config.json # Standard client-side Firebase web configuration
├── firebase-blueprint.json     # Firestore collection schema metadata
├── firestore.rules             # Cloud Firestore tenant security rules
├── index.html                  # HTML5 entry point
├── metadata.json               # AI Studio project descriptor
├── package.json                # Dependencies, build scripts, and metadata
├── server.ts                   # Express server, Vite middleware, & Gemini reflection API
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration
└── src/
    ├── App.tsx                 # Root application component and view orchestrator
    ├── main.tsx                # React DOM entry point
    ├── index.css               # Global styles and Tailwind imports
    ├── types.ts                # TypeScript data models and interfaces
    ├── firebase.ts             # Firebase client SDK initialization & auth helpers
    ├── components/             # User interface components
    │   ├── AuthLanding.tsx     # Sign-in and onboarding view
    │   ├── BoxBreathingWidget.tsx # Floating box breathing widget
    │   ├── CalendarView.tsx    # Monthly mood and entry calendar
    │   ├── DashboardView.tsx   # Main journal feed, stats, and entry points
    │   ├── DearULogo.tsx       # Logo component
    │   ├── GroundingSidebar.tsx# Quick-access drawer for grounding breaks
    │   ├── HistorySidebar.tsx  # Chronological entry browsing sidebar
    │   ├── InsightsView.tsx    # Emotional pattern and reflection analytics
    │   ├── JournalEditor.tsx   # Writing canvas & Gemini reflection interface
    │   ├── Navbar.tsx          # Main application header and view switchers
    │   ├── SearchEntriesView.tsx # Memory search view
    │   ├── Sidebar.tsx         # Primary navigation drawer
    │   ├── ThreatModelModal.tsx# Architecture & security overview dialog
    │   └── grounding/          # Mindfulness & grounding activity modules
    │       ├── BreathingSpaceActivity.tsx
    │       ├── CalmSoundsActivity.tsx
    │       ├── ColorFlowActivity.tsx
    │       ├── GratitudePebblesActivity.tsx
    │       ├── GroundingModal.tsx
    │       ├── MindfulTapActivity.tsx
    │       ├── PuzzlePauseActivity.tsx
    │       └── WordGardenActivity.tsx
    ├── services/
    │   ├── firestoreService.ts # Firestore CRUD operations and data synchronization
    │   └── geminiService.ts    # Client API service calling the backend proxy
    └── utils/
        ├── ambientAudio.ts     # Procedural Web Audio synthesizer engine
        └── dailyThoughts.ts    # Thought of the Day rotation data
```

---

## Challenge Context

DearU was developed with **Google AI Studio** as a demonstration of building cohesive, full-stack applications with:
- **Google Gemini**: Providing conversational reflection and analytical capabilities on user-provided thoughts.
- **Firebase & Cloud Firestore**: Demonstrating real-time user-partitioned persistence and secure authentication.
- **Google Cloud & Cloud Run**: Leveraging containerized architecture for scalable, responsive deployment.

---

## Future Improvements

The following capabilities are considered for future releases:
- **Client-Side Encryption (E2EE)**: Optional passkey-derived client-side encryption for entry text before Firestore persistence.
- **Export Options**: Exporting journal archives to Markdown, plaintext, or encrypted JSON backups.
- **Offline Sync & PWA**: Service worker caching and IndexedDB queueing for offline writing sessions.
- **Soundscape Customization**: Layered mixer controls for ambient synthesizer frequencies.

---

## License

License information will be added separately.

---

## Acknowledgements

- Built with [Google AI Studio](https://ai.studio/)
- Powered by [Google Gemini](https://ai.google.dev/)
- Icons provided by [Lucide React](https://lucide.dev/)
