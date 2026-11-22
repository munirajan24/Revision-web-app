# Mobile Interview Practice — Implementation Plan

## Goal

Add a dedicated, mobile-first interview practice experience that runs in the web app and feels purpose-built for a phone. It should use the existing Revision Checklist content as its source of interview prompts, while keeping checklist review and timed practice as separate activities.

The first tracks are:

1. **Kotlin** — Kotlin-focused questions and concepts.
2. **Spring Boot** — backend/Spring Boot questions, including the Kotlin + Spring Boot checklist content.

The experience should take inspiration from the supplied SoloLearn challenge screenshots: one focused prompt at a time, clear progress and time remaining, and a persistent primary action. It should not copy the competitor’s visual design or introduce a fictitious opponent or score.

## Existing app surfaces to reuse

- `src/data/skill-checklists.ts` loads checklist Markdown into `seedSkillChecklists`, including item IDs, section headings, code terms, and priority labels.
- `src/engine/interviews.ts` defines checklist and interview data, stable checklist item IDs, and the existing interview-checklist workflow.
- The backend checklist `Files/Checklist/Backend/Kotlin + Spring Boot Backend Interview Checklist.md` already has Kotlin, Spring, and backend interview topics. Other Kotlin/backend checklist documents are also available.
- `src/App.tsx` owns URL-tab navigation, lazy-loaded screens, interview-store state, and app persistence.
- The existing Sample Interview experience in `src/components/SampleInterview.tsx` provides precedent for a question-at-a-time flow, written drafts, elapsed time, and a recap.

The new experience should consume the existing checklist catalog and keep source checklist item IDs intact. Do not fork the same prompts into a new hard-coded question bank.

## Product and flow

### 1. Entry and setup

- Add a dedicated **Mobile Interview** entry point and URL tab so the experience can be opened directly in the browser.
- Setup is a short, phone-friendly screen:
  - Choose **Kotlin** or **Spring Boot**.
  - Optionally choose a checklist section or use **All topics**.
  - Choose the session length (recommended initial presets: **15, 30, or 45 minutes**).
  - Choose whether to include only high-priority (`⭐`) prompts, if any exist for the chosen track.
  - Show the available prompt count before starting; do not silently create an empty or undersized session.
- Start with one prompt per checklist item, selected from the chosen track and section. Keep ordering predictable (source checklist order); randomization can be an explicit later option.

### 2. Active session

Build a dedicated, responsive interview screen with:

- A compact header with back/exit, track/topic, question position, and a visible session countdown.
- A thin progress indicator showing prompts completed or passed over.
- One readable prompt per screen, preserving code terms and source formatting where available.
- A simple response area for spoken practice (a “Start thinking / answer aloud” prompt) and optional private text notes. Notes must remain available when navigating between prompts.
- A persistent bottom action area that respects mobile safe areas and does not cover content.
- A restrained professional theme consistent with the app, with touch targets sized for phones and no desktop-only interaction.

Primary controls:

- **Pause / Resume** — pause freezes the remaining session time; resume restarts from that exact remaining time.
- **Skip** — move forward without treating the prompt as answered; skipped prompts remain visible in the end recap.
- **Mark important** — toggle a per-prompt star for the current practice session.
- **Answer / Reveal reference** — keep the reference hidden during timed practice until the user chooses to reveal it; revealing should be recorded in the session recap.
- **Previous / Next** — allow navigation without losing notes, marks, or status.
- **End session** — ask for confirmation, then show the recap.

The timer should use a stored end-time/remaining-time model rather than relying only on interval ticks. This avoids timer drift when the browser throttles background tabs. Pausing records the remaining duration; resuming establishes a new end time. Persist the active session so refresh or accidental navigation can offer **Resume session** or **End session**.

When time expires, pause the session and show the recap. Do not silently discard the current response or marks.

### 3. Session recap

Show a concise completion screen with:

- Track, selected topics, total duration, and prompt count.
- Answered, skipped, and reference-revealed counts.
- Important prompts in a review list.
- A prompt-by-prompt recap with the user’s notes and status.
- Actions to **Review important**, **Start another session**, or return to **Revision Checklist**.

Do not grade free-form answers automatically in the first version. The value is a realistic, timed self-practice flow, not an unreliable score.

## Content mapping

Use the loaded revision checklist catalog as the canonical source:

- **Kotlin track:** select Kotlin-oriented checklist items, including the Kotlin sections of the Kotlin + Spring Boot backend checklist and applicable Kotlin interview checklist material.
- **Spring Boot track:** select Spring Boot/backend items from the Kotlin + Spring Boot backend checklist. Keep Kotlin-specific language fundamentals out of a Spring Boot-only session unless they are needed to understand that prompt.
- Preserve source section names, priority labels, code terms, item text, and item IDs.
- Make the initial mapping explicit and testable (track-to-checklist/section rules); do not infer topics from prompt wording at render time.
- Avoid duplicate prompts if equivalent content appears in more than one checklist. Retain the selected canonical source ID and document any intentional inclusions.
- If a checklist has no items matching a selected track/topic, explain that clearly and let the user change the selection.

## State and persistence

- Keep session-only data separate from `InterviewRecord.completedItemIds`. A timed practice answer is not the same as completing a revision checklist item.
- Define a versioned practice-session record containing:
  - Session ID, track, selected source IDs, prompt order, and start/finish timestamps.
  - Timer duration, remaining time, paused/running/finished status, and active prompt index.
  - Per-prompt draft note, answered/skipped state, important mark, and reference-revealed state.
- Persist in browser storage using the app’s established local-first approach. Recover an unfinished session after refresh and validate persisted data before resuming.
- Keep completed session history small and useful; decide retention/clear-history behavior before implementation. Do not overwrite or migrate existing interview or checklist progress.
- Consider backup/export integration only after the core flow is stable; it is not required for the first release.

## Navigation and responsive behavior

- Use a distinct URL tab (for example `mobile-interview`) that opens the session on desktop browsers too.
- At phone widths, use a full-height app-like layout with a single-column prompt, thumb-friendly controls, and safe-area-aware bottom actions.
- On wider screens, keep a narrow centered practice column rather than stretching text or controls across the page.
- Provide clear navigation back to the existing checklist and an exit confirmation while a session is active.
- Ensure the page works with keyboard navigation, screen readers, browser zoom, and reduced-motion preferences.

## Implementation phases

1. **Content mapping and model**
   - Inspect the canonical Kotlin and Spring Boot checklist files and current catalog IDs.
   - Define deterministic, non-duplicating track filters and test the resulting prompt lists.
   - Add typed session state, persistence validation, and timer transition helpers with unit tests.
2. **Session setup and lifecycle**
   - Add setup, start, pause, resume, skip, mark-important, previous/next, exit confirmation, refresh recovery, and timeout behavior.
   - Test timer pause/resume and session recovery without depending on real-time waits.
3. **Mobile-first UI**
   - Build the phone-sized active prompt view, persistent actions, notes, reference reveal, and responsive desktop presentation.
   - Add accessible labels, focus handling, safe-area spacing, and loading/empty/error states.
4. **Recap and integration**
   - Add recap and review-important flow.
   - Wire the route/tab into app navigation without disturbing existing checklist and sample interview behavior.
   - Add tests for recap counts and preservation of prompt state while navigating.
5. **Validation**
   - Run focused unit/component tests, the full test suite, type check, and production build.
   - Manually verify narrow phone viewport, landscape/narrow height, desktop browser, refresh recovery, pause/resume, timeout, and exit confirmation.

## Acceptance criteria

- Kotlin and Spring Boot sessions draw prompts from the existing Revision Checklist catalog; there is no duplicated hard-coded content source.
- A user can start, pause, resume, skip, navigate, mark important, write notes, reveal a reference, and end a session without losing state.
- The countdown remains accurate across pause/resume and refresh, and expiry leads to a recap rather than data loss.
- The recap distinguishes answered, skipped, and reference-revealed prompts and surfaces important items.
- Existing checklist completion/progress remains unchanged by practice sessions.
- The page is comfortable and functional at common mobile viewport sizes and remains usable in a desktop web browser.
- Empty filters and corrupt/stale saved sessions have explicit, recoverable user-facing behavior.

## Out of scope for the first version

- Multiplayer, opponent avatars, leaderboards, or competitive scoring.
- Automatic AI grading or answer evaluation.
- Voice recording/transcription.
- A separate duplicate question bank or a rewrite of the Revision Checklist screen.
- Native mobile app packaging.
