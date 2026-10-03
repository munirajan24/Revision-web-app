# Kotlin / Java Interview Trainer

A local-first web app for practicing interview questions in both Kotlin and Java, improving mastery over time, and revising weak concepts using a spaced-repetition workflow.

## What this app does

This project helps users:

- Review a structured 120-question roadmap by level, topic, and difficulty
- Switch the app globally between Kotlin and Java so the training experience stays consistent
- Practice coding solutions in a single-page interview workspace
- Get smarter guidance through best/alternative hints and solution reveal logic
- Track progress, confidence, and time spent per question
- Revisit weak topics with a simple review system
- Save private notes and hints for each problem
- Work offline with browser-based local persistence

## Main features

- Dashboard with readiness summary
- Question library with search, filters, and roadmap-level grouping
- Practice mode with timer, answer draft, hints, and solution reveal
- Global Kotlin/Java switch affecting the active learning flow
- Smart hint system with best approach, alternative approach, and edge-case guidance
- Topic and keyword-based review
- Analytics for completion and mastery progress
- Local save/export/import for learner progress
- Dark/light theme support
- Mobile network access over the same Wi‑Fi

## Tech stack

- React
- TypeScript
- Vite
- Vitest
- Local browser storage for persistence

## Project structure

- [src/App.tsx](src/App.tsx) — main app shell and feature views
- [src/data/roadmap.ts](src/data/roadmap.ts) — question catalog, topic metadata, and keywords
- [src/engine/mastery.ts](src/engine/mastery.ts) — mastery scoring and review scheduling
- [src/engine/mastery.test.ts](src/engine/mastery.test.ts) — tests for scoring logic
- [src/styles.css](src/styles.css) — app styling and layout

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Run the app locally

1. Open a terminal in the project folder.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev -- --host 0.0.0.0 --port 4176
```

4. Open the address shown in the terminal, or use the local network IP from the same Wi‑Fi:

```text
http://localhost:4176/
http://192.168.29.69:4176/
```

The app is configured for local network access so it can be opened on a phone connected to the same Wi‑Fi.

To stop the development server, run `stop-app.cmd` from the project folder. It stops this project's server without closing unrelated processes.

## Build for production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Run tests

```bash
npm test
```

## App workflow

The user experience is built around a simple learning loop:

1. Review the dashboard for weak and high-priority areas.
2. Open a question from the library or daily focus list.
3. Solve the question in practice mode.
4. Use a timer, hints, notes, and confidence rating.
5. Save progress and revisit flagged topics later.

## Data and progress

Progress is stored in the browser using localStorage, so the app works in an offline-first way without requiring a backend. It saves:

- question status
- attempts and confidence
- total time spent
- notes and drafts
- selected theme

## Future extension ideas

- More Kotlin problems and deeper curriculum coverage
- Actual code execution/evaluation
- Timed mock interviews
- Better analytics dashboards
- Cloud sync or backend persistence

## Notes

This project is currently a strong front-end foundation for the Kotlin interview trainer and is designed to be extended as the full curriculum and app features grow.
