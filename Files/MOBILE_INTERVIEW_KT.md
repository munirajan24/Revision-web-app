# Mobile Interview: Developer Knowledge Transfer

This document explains Mobile Interview, Learn & Q&A, and Smart Revision: where questions come from, how sessions/timers and answer assessment work, and where progress is stored.

## 1. Feature map

| Responsibility | Main file |
|---|---|
| App navigation, route query parameter, shell, local/Drive backup UI and full-app backup orchestration | [`src/App.tsx`](../src/App.tsx) |
| Parse the source interview-question HTML and create source question records | [`src/data/interview-question-bank.ts`](../src/data/interview-question-bank.ts) |
| Convert source questions and generated coding problems into Mobile Interview sets | [`src/data/mobile-interview-bank.ts`](../src/data/mobile-interview-bank.ts) |
| Generated coding problem catalog, examples, contracts, and Kotlin/Java solutions | [`src/data/roadmap.ts`](../src/data/roadmap.ts) |
| Session, timer, history, schedule, backup, Q&A formatting, and statistics rules | [`src/engine/mobile-interview.ts`](../src/engine/mobile-interview.ts) |
| Learn & Q&A stage chunking, learned flags, progress validation and merge | [`src/engine/learn-track.ts`](../src/engine/learn-track.ts) |
| Pure Smart Revision scheduling, selection, coverage, promotion, and merge rules | [`src/engine/smart-revision.ts`](../src/engine/smart-revision.ts) |
| Google OAuth and private Drive backup discovery/upload/download | [`src/engine/google-drive-backup.ts`](../src/engine/google-drive-backup.ts) |
| Screens, setup, question controls, feedback, and orchestration | [`src/components/MobileInterview.tsx`](../src/components/MobileInterview.tsx) |
| Learn & Q&A track selection, stage map, flashcards, and quiz options | [`src/components/LearnQA.tsx`](../src/components/LearnQA.tsx) |
| Coding editor, Kotlin/Java execution, expected-output check, and coding answer UI | [`src/components/CodingInterviewExperience.tsx`](../src/components/CodingInterviewExperience.tsx) |
| Flexible output comparison for coding answers | [`src/utils/output-comparison.ts`](../src/utils/output-comparison.ts) |
| Mobile Interview layout and responsive styles | [`src/styles.css`](../src/styles.css) |
| Feature and behavior regression tests | [`src/engine/mobile-interview.test.ts`](../src/engine/mobile-interview.test.ts), [`src/data/mobile-interview-bank.test.ts`](../src/data/mobile-interview-bank.test.ts) |

Navigation uses the `mobile-interview` view and `?tab=mobile-interview`. The home actions are Learn & Q&A, Smart Revision, New interview, Categories, and History. Learn & Q&A sets `&mode=learn`; Smart Revision sets `&mode=revision`. In the sidebar, “Mobile interview” is directly below Dashboard.

## 2. Data sources and question-bank construction

The feature combines two sources into one `MobileBankQuestion[]` bank.

### A. Complete Revision source questions

[`interview-question-bank.ts`](../src/data/interview-question-bank.ts) imports the project HTML as raw text using Vite's `import.meta.glob`:

```ts
import.meta.glob(
  '../../Files/Checklist/Android/Interview Questions Android/InterviewQuestionsAndroid.html',
  { eager: true, query: '?raw', import: 'default' }
)
```

The module fails fast if that source file is missing. `parseInterviewQuestionHtml` uses `parse5` and reads the document's top-level body children. It tracks:

- The current source mode: study content, interview question sets, or neither.
- The current category/set (`h2`), subsection (`h3`), and whether that category is included.
- Question lists (`ul`/`ol`), individual list items, and interview-set question paragraphs.
- Following answer nodes, stopping at the next question list or section heading.

Question and answer text is normalized; answer HTML is serialized for content that needs formatting/code. Generated IDs use a slug and per-section sequence, with category-derived display IDs. The resulting `InterviewQuestion` includes its category, section, prompt, answer text/HTML, and answer flags.

`getMobileQuestionBank` in [`mobile-interview-bank.ts`](../src/data/mobile-interview-bank.ts) maps those records into sets and sections:

1. Split a source section on ` / ` into category and remaining subsection names.
2. Map known categories to friendly set titles (Java, Kotlin, Android, Testing, Git, iOS Development).
3. Keep `Set N: ...` content under “Original interview sets”.
4. Build stable IDs from category ID, source section, and normalized prompt using a 64-bit FNV-style hash. Duplicate identities in the input receive a suffix.
5. Preserve source prompt/answer text and attach an optional parsed coding question.

### B. Generated Kotlin and Java coding problems

The generated source is `problems` from [`roadmap.ts`](../src/data/roadmap.ts). `getMobileCodingQuestionBank` creates a Kotlin and Java bank item for each problem that has a description, at least one usable example, and non-empty solutions for both languages. These items carry a `codingProblemId` and selected language; the coding view resolves the problem data again from the roadmap.

The current tests assert 120 generated roadmap problems, producing 120 Kotlin and 120 Java coding prompts (240 total). The source HTML also contributes the “Programming / Kotlin basic coding” and “Programming / Java basic coding” questions; regression tests currently expect 242 extracted coding questions from the source question bank.

### C. How source programming prompts are parsed

`getProgrammingCodingQuestions` filters source questions by a case-insensitive section pattern:

```text
Programming / Kotlin basic coding
Programming / Java basic coding
```

For each question, `parseProgrammingCodingPrompt`:

1. Finds `Input:` followed later by `Expected Output:` or `Output:`.
2. Treats the prefix as the problem description, removing a leading `Problem:`.
3. Extracts and trims the input/output strings, removing trailing separators.
4. Splits a leading `Title — description` (hyphen/en dash/em dash) when present. Otherwise, it infers a title from a known phrase or first sentence, with a language/index fallback.
5. Produces one `{ input, output }` example. The example text is intentionally kept as display text; output comparison later accounts for representational quotes and collection formatting.

`parseProgrammingCodingSolutions` parses the answer HTML with `parse5` rather than regexing raw tags. It collects `<pre>` blocks as code and `<p>` blocks as headings/notes. A heading like `Kotlin — ...` or `Java — ...` starts a solution variant; a heading for the other language disables collection until that language resumes. Optional `(Best)`, `(Good to try)`, and `(Avoid unless needed)` suffixes become recommendations. “Time: ... Space: ...” paragraphs become solution notes.

Kotlin and Java source prompts are paired by their position within the filtered language lists. A source programming question is included only when its own and partner-language solution lists are both non-empty. If editing the source HTML, keep equivalent Kotlin and Java questions in the same order.

## 3. Screen and session lifecycle

`MobileInterview` in [`MobileInterview.tsx`](../src/components/MobileInterview.tsx) owns feature-level React state:

- Current session and current screen.
- Selected sets/sections, question order, and time limits.
- Interview history and calendar schedules.
- Question-level attended/correct/wrong/skipped statistics.
- Feedback overlay, copy status, and coding keyboard state.

The main screens are `home`, `practice`, `sets`, `history`, `session`, and `recap`.

### Starting a session

1. The setup screen chooses question sets and sections. “Select all” and “Clear” act on the corresponding selection.
2. `getSectionOrientedPrompts` walks selected sets, then selected sections, then questions in bank order. `toMobilePrompt` maps each bank question to the persisted session prompt shape and marks coding questions with `kind: 'coding'`.
3. Optional randomization shuffles a copy of the prompts using Fisher–Yates.
4. `beginSession` selects the schedule's settings if launched from the calendar; otherwise it uses the current setup's time choices.
5. `createMobileInterviewSession` in the engine validates the input and produces a version-1 session with a unique ID, active index `0`, timers, and prompt copies.
6. The session is saved to `localStorage` whenever the `session` state changes.

If a previous session is still running or paused, starting another interview asks for confirmation because it replaces that saved in-progress session.

### Moving between questions

The bottom next-question arrow stays enabled. `moveTo` marks an unanswered prompt as skipped when moving forward, records its skip statistic, and delegates timer/index/finish behavior to `moveMobileInterviewToPrompt`.

- Moving to an existing question restores that prompt's saved remaining time.
- A running session remains running when the next prompt has not expired.
- A paused/expired next prompt remains paused.
- Moving beyond the final prompt finishes the session and opens the recap.
- Moving backward does not mark the current prompt skipped.
- Coding's “Next question” and timeout continuation use the same session advancement helpers.

The session header shows section and overall question progress. The recap and history screens show answers/results, skipped prompts, reference-answer viewing, and session details.

## 4. Prompt and answer model

`MobileInterviewPrompt` and `TimedMobileInterviewPrompt` are defined in [`mobile-interview.ts`](../src/engine/mobile-interview.ts). A prompt has stable identity and presentation fields (`id`, set/section IDs and titles, text, answer/reference material) plus its state:

- `answered`, `skipped`, `important`, `referenceRevealed`.
- Short response (`answerText`/`note`) or MCQ selection/result.
- Coding problem ID/language, code per language, optional stdin, and verification state.
- Per-prompt time limit, remaining seconds, and expiration flag.

The type and submit path support `short-answer`, `mcq`, and `coding`. The current `toMobilePrompt` bank mapper sets coding explicitly and otherwise leaves the kind unset (the short-answer path). It does not currently parse MCQ choices out of the source HTML; MCQ handling is available for prompts that provide `options` and `correctOptionId`.

### Answer and correctness behavior

- **Short answer:** Submitting pauses the prompt and opens feedback. It is not automatically machine-graded. After viewing the reference answer, the learner can self-assess “Correct” or “Not yet”; the chosen result updates the prompt and persistent stats.
- **MCQ:** The selected option is compared with `correctOptionId`; correct/wrong is recorded at submission.
- **Coding:** Submitting non-empty code pauses the session prompt and opens the coding verification flow. The code runs; if the runner succeeds and an expected output exists, output comparison determines correct/wrong. Compile/runtime/runner failures are recorded as verification unavailable rather than a wrong answer. Submitting with an empty current-language editor marks the prompt skipped (not attended) and shows “Skipped · no code entered”; if the learner later returns and submits code, the skip is removed and attendance is counted.
- **Reference answers:** Source HTML answers are shown in the feedback view. The `referenceRevealed` flag feeds recap/history and Q&A export.

Short-answer feedback can advance automatically after a short delay unless the answer has been viewed; coding has a separate verification/timeout UI.

## 5. Timer behavior

Timer calculations live in [`mobile-interview.ts`](../src/engine/mobile-interview.ts); the React component updates the visible clock and calls the engine on expiry.

### Time selection

- `TimeWheelPicker` offers 30 seconds and minute increments from 1 through 30 minutes.
- The ordinary time-per-question picker is always shown in setup.
- The separate program timer is shown only when one of the selected prompts has “program” in its set/checklist title or section title, or is a coding prompt (`isProgramInterviewPrompt`). This covers generated sets titled “Kotlin Coding” and “Java Coding,” which do not literally contain “program.”
- Scheduled sessions store their time choices and randomization choice on `MobileInterviewSchedule`.

### Per-prompt allocation

`createMobileInterviewSession` uses:

1. Zero time when the session is untimed.
2. The selected program duration for prompts identified as program/coding when the program duration is supplied.
3. Otherwise, the ordinary selected question duration.
4. A 5-minute coding fallback when no program timer was supplied.
5. When no explicit per-question time is supplied, a calculated even share of the total session duration.

Timers use absolute `endsAt` timestamps while running. `getMobileInterviewRemainingSeconds` derives remaining seconds from `endsAt`; pausing stores the current remaining time and clears `endsAt`; resuming creates a new deadline. On reload, a running session recalculates its remaining time and expires immediately if its deadline passed.

Non-coding expiry advances to the next prompt (or finishes the session). Coding expiry pauses on that coding prompt so its timeout/verification flow can run. Coding also supports a single extra-time retry equal to 25% of its original time limit; the retry retains code but resets the prior verification/result.

## 6. Coding editor and verification

`CodingInterviewExperience` owns editor-local UI and connects back to the prompt via `onPromptChange`.

### Editor

- Kotlin uses the `kotlin-playground` package loaded dynamically. The component initializes CodeMirror, sets editor options, syncs code with saved prompt state, and destroys the playground on language/prompt change or unmount.
- Java uses a textarea and a remote Judge0 execution request.
- The Kotlin/Java selector changes language; Normal/Big adjusts editor height for either language. Editor size is local UI state, not session data.
- Code is stored separately per language in `codingAnswers`; changing languages preserves each language's draft.
- Symbol bar buttons insert code tokens at the editor selection. Run, Submit, template insertion, clear, output and copy actions are owned by this component.

### Running and comparing

- Kotlin runs in Kotlin Playground with a 10-second client deadline.
- Java uses Judge0 (`https://ce.judge0.com`), looks up/caches the Java language ID, submits source/stdin, and aborts the request after 15 seconds. The payload also sets CPU/wall time limits.
- Results distinguish success, compile error, runtime error, timeout, offline/service-busy/runner-unavailable, and stopped states.
- A successful run is compared with the first example's expected output using [`outputsMatch`](../src/utils/output-comparison.ts). It parses scalar strings, nested lists, and map-like displays; it ignores harmless quotes/whitespace and map entry ordering, while retaining list ordering and scalar contents.
- Runner failures are not falsely reported as incorrect answers.
- Submit opens a verification dialog and runs entered code. Timeout does likewise; empty code does not become a successful or incorrect verification.
- A one-time “Try again (+25% time)” path is available after a timed-out coding question when the retry has not been used.

The example's expected output is demonstration-based verification, not a full hidden-test judge. It can only confirm the program's printed result against the displayed first example, so the runner code must print the answer in the expected format.

## 7. Persistence, history, schedule, and backups

Mobile Interview state is stored in browser `localStorage` using these keys:

| Key | Contents |
|---|---|
| `kotlin-interview-trainer-mobile-interview-v1` | Current or most recent session (including prompt answers, code, timer and state) |
| `kotlin-interview-trainer-mobile-interview-history-v1` | Finished interview sessions |
| `kotlin-interview-trainer-mobile-interview-schedule-v1` | Calendar schedules and timer/randomization settings |
| `kotlin-interview-trainer-mobile-interview-question-stats-v1` | Per-question statistics and deduplication event IDs |
| `kotlin-interview-trainer-mobile-learn-progress-v1` | Learn tracks, question learning flags, and stage quiz summaries |
| `kotlin-interview-trainer-mobile-revision-v1` | Smart Revision question memory records, preferences, interview date, and assessment idempotency events |

Session serialization is validated by `parseMobileInterviewSession` before being trusted. It checks status, timing, active index, prompt structure and optional fields; malformed JSON or incompatible data is ignored rather than crashing the screen. Legacy sessions are normalized/migrated when loaded. History contains finished sessions and is ordered newest first.

The app's backup integration in [`App.tsx`](../src/App.tsx) calls `loadMobileInterviewBackup` / `saveMobileInterviewBackup`. The bundle includes the active session, finished history, schedules, question statistics, Learn & Q&A progress, and Smart Revision data. Both local JSON export/import and optional manual Google Drive backup use this same full-app bundle. Restoring with **Merge / Add** unions statistics by unique session + prompt event and merges revision priorities, memory records, coverage cycle, settings, and interview date. **Replace** replaces the complete Mobile Interview section.

The full app backup remains version 3. Statistics, Learn progress, and Smart Revision fields are optional when parsing older version-3 backups; missing fields restore as empty state. Invalid optional Smart Revision data is ignored without rejecting the other backup sections. Newly exported version-3 backups include all three payloads.

### Per-question statistics

The statistics key uses schema version 2. Each question ID maps to:

```ts
{ attended: number; correct: number; wrong: number; skipped: number }
```

Counters are persisted independently from the active session:

- Opening a question does **not** count as attendance.
- Attendance is recorded when the learner submits/attempts an answer (including coding verification). Event keys are session ID + prompt ID, so repeat React effects/runs in the same interview do not double count the same visit.
- Correct/wrong answer-result recording also ensures attendance and clears a previous skip atomically. A skipped event cannot be recorded again after attendance/result for the same session/prompt; skipped and attended are mutually exclusive for that event.
- Correct/wrong is recorded when machine assessed (MCQ/coding) or when a short answer is self-assessed. Changing a short-answer assessment in that same session replaces its previous result rather than incrementing both.
- Moving forward without answering records a skipped count once per session/prompt. If the learner later returns and answers it in that same session, the skip is removed and attendance is counted.
- Starting another session permits a new attendance/result for the same question.
- “Clear stats” removes the statistics storage key after confirmation. It does not delete interview sessions or history.
- Older version-1 view-based stats are intentionally treated as invalid and reset, because they counted merely opening questions as attended.

### Learn & Q&A (Version 2)

Learn & Q&A reuses the same source/generated question bank, prompt/session schema, timers, coding runner, grading, question-stat recorders, and Smart Revision scheduler. Flashcard answers are always visible and do not mark a question attended. Explicit **Got it** and **Need review** actions update separate learning flags; assessed quiz answers and skips update both existing interview statistics and revision scheduling. A blank Learn quiz submission is recorded as skipped and opens feedback instead of advancing immediately; **View answer** remains available before continuing. Empty coding submissions use the coding verification dialog, which marks the prompt skipped and offers **View answer**. The quiz-options defaults include already-correct questions, shuffle questions, use a 2-minute ordinary-question timer, and use a 10-minute program timer.

Learn state uses `kotlin-interview-trainer-mobile-learn-progress-v1`, separate from question statistics. The pure engine in [`learn-track.ts`](../src/engine/learn-track.ts) chunks bank-order question IDs by the saved stage size (3, 5, or 10), derives stage IDs from track ID + size + ordinal, tracks learned/review/important flags by question ID, computes the Mistakes pool, and merges backup progress. The component filters removed question IDs against the current bank at runtime. Coding-only tracks default to stage size 3; learners may choose another size.

Learn quizzes are ordinary `MobileInterviewSession` records with optional `mode: 'learn'`, `trackId`, and `stageId`; the session schema remains version 1 and older sessions parse as interview mode. Learn quizzes appear in the existing History, can be resumed through the regular active-session path, and save one latest stage summary on finish. The Learn recap lists wrong and skipped questions with their reference answers and offers a direct next-stage action. Aborting does not add a summary or roll back already-recorded statistics or revision assessments. A stage is mastered when the latest result for every question in that track's Learn quizzes is correct (100% pass threshold, centralized as `LEARN_PASS_PERCENT`).

Learn progress is included in the existing version-3 full-app backup bundle. Missing `learnProgress` in older version-3 files parses as empty; malformed present learn data rejects that full backup rather than partially restoring it. Replace writes the incoming Learn section, and Merge unions track/question flags, lets learned win over need-review, keeps the earliest learned timestamp, latest stage quiz by finish time, and the most recently touched stage pointer. Reset Learn progress never clears attendance/correct/wrong/skipped statistics. The existing **Clear stats** control remains separate.

### Smart Revision (Version 1)

Smart Revision is a separate home mode (`?mode=revision`) that builds weighted, non-duplicating sessions and reuses the normal Mobile Interview session, timer, coding verification, answer assessment, recap, and History flows. The session remains schema version 1 and stores optional `mode: 'revision'` plus per-prompt `pickReason`.

The pure scheduler in [`smart-revision.ts`](../src/engine/smart-revision.ts) accepts an explicit clock and random function. Question records are keyed by stable bank question ID. Correct answers advance boxes 1–5; wrong answers return to box 1 and become due immediately; skips preserve their box and become due within a day. Runner failures do not update a schedule. Assessment events use session ID + prompt ID so reassessment replaces that event, while manual priority survives result reassessment. Existing interview and Learn assessments use the same scheduler; opening a question or revealing an answer does not.

Selection precedence is Due, Weak, New, then Rest. Weighted sampling is without replacement; unseen normal questions are exhausted before normal repeats. Priority and weak questions can recur sooner. A single bank-wide cycle is advanced once all questions in the selected candidate scope have been seen; displayed coverage is calculated from the current scope. An optional interview date shifts the Due/Weak/New/priority mix for the 14+, 7–13, 2–6, and 0–1 day windows. The setup supports question scope, 5/10/15/20/30 question sessions, date, and editable Due/Weak/New percentages.

The revision localStorage payload has its own schema version 1 and does not change question-statistics or Learn-progress schemas. Missing or malformed optional revision data in a version-3 app backup becomes empty revision state without discarding other backup sections. Merge takes the maximum priority/cycle, uses the more recently assessed memory record, and takes global settings/date from the newer modified block (incoming wins ties). History has a Revision filter. Permanent priority is editable from session prompts and Learn cards; repeated errors can auto-promote a question and are shown in the UI.

Tunable defaults in `SMART_REVISION_CONFIG`: box gaps `[1, 3, 7, 14, 30]` days; priority gap multipliers `1`, `0.75`, and `0.5`; default session size `10` (allowed `5`–`30`); default pool mix Due/Weak/New `30/20/50`; score weights overdue/priority/error/unseen/age/recent `3/1.5/2/1/0.5/-2`.

Remaining scope exclusions are notifications, calendar due-question integration, automatic cloud sync, read-aloud, personal notes, global search, and daily goals/streaks. Manual full-app local and Google Drive backups include revision data.

## 8. Copy/export and reference content

`formatMobileInterviewQaText` in the engine creates a plain-text transcript for every prompt in the session, including question, section, reference answer, selected/correct option when present, explanation, and the user's submitted answer. Coding drafts for both Kotlin and Java are included with language labels.

The recap exposes “Copy all Q&A” and “Download .txt”. The download filename combines a sanitized session title with the completion/start date-time. Both actions use the same formatter, so updates to transcript structure should be made in one place. Generated coding prompts copy the first/default language solution into their session `referenceAnswer`; the transcript therefore includes that reference code as well as any user-written Kotlin/Java drafts.

## 9. Important implementation details and extension points

- **Adding or editing a normal interview question:** Update the source HTML or the existing question-bank parser. Preserve recognizable headings/lists and the answer block boundaries that `parseInterviewQuestionHtml` expects.
- **Adding a programming HTML question:** Include `Input:` plus `Output:`/`Expected Output:` in the prompt, add language-labelled solution headings and `<pre>` code blocks in answer HTML, and keep the Java/Kotlin counterpart at the same filtered-list position.
- **Adding a generated coding problem:** Add a problem to the roadmap catalog, ensure examples describe the real operation, and ensure both generated Kotlin and Java solution variants are available. The coding bank derives entries from those values.
- **Changing timer semantics:** Update engine helpers and their tests first; UI timers rely on `endsAt`, not independent decrement state.
- **Changing answer/result policy:** Update `submitAnswer`, coding verification callbacks, and the question-stat functions together. Keep short answer self-assessment distinct from automatic grading.
- **Changing session persistence:** Keep parse/validate, load/save, backup bundle and migration behavior aligned. Add tests for malformed and legacy state.
- **Changing question stats:** Preserve event-level idempotency; React effects and verification callbacks can fire more than once for the same prompt.

## 10. Tests and verification

Useful focused commands:

```powershell
npx vitest run src/engine/mobile-interview.test.ts src/data/mobile-interview-bank.test.ts
npx vitest run src/engine/smart-revision.test.ts
npm run build
```

The engine tests cover session creation/navigation, timers, persistence/legacy parsing, backups, history/schedules, retries, QA formatting, statistics, and deterministic Smart Revision scheduling/simulation. The bank tests cover stable source mapping, set counts, generated coding set counts, coding HTML parsing/solution pairing, and selected generated expected-output regressions.

## 11. Complete user-flow map

```text
App navigation (?tab=mobile-interview)
  -> Mobile Interview home
     -> New interview
        -> choose bank/set categories
        -> choose sections
        -> optionally shuffle
        -> choose ordinary timer; choose program timer if any selected prompt is program/coding
        -> Start interview
           -> question session
              -> save edits and session state to localStorage
              -> submit / mark important / pause / next / previous / end early
           -> completed recap
              -> review all or important questions
              -> copy all Q&A / download dated .txt
              -> new round / home / history dialog
     -> Categories: browse set and section counts, select a set into setup
     -> History: inspect completed sessions and per-question outcomes
     -> Smart Revision (?mode=revision)
        -> choose scope, session size, optional interview date, and pool mix
        -> build weighted Due/Weak/New/Priority picks
        -> reuse question session, assessments, timers, coding verification, recap and History
     -> Calendar: browse dates, start/remove schedules already present in storage
```

### Home, setup, and selection details

- The home screen has a resume card when an unfinished session exists, then Learn & Q&A, Smart Revision, New interview, Categories, History, and a month calendar. Learn & Q&A is the first home action rather than a persistent Interview/Learn toggle.
- The resume card restores the saved prompt. A paused session resumes its timer; an expired coding prompt advances through the coding continuation path.
- Categories is an informational library; selecting one preselects its set and every section, then opens setup.
- Setup starts with no categories selected. Category “Select all” / “Clear” updates both selected set IDs and the section IDs that belong to those sets. Section-level selection can then narrow the question pool. The available-question count is computed from selected set + section IDs.
- Randomization is optional and applied once when the session is created; it does not rerandomize on resume.
- Time selection draft values (ordinary 2 minutes and program 15 minutes by default) are component state. They are not independently persisted between page reloads. A saved schedule, if present, stores its own time settings.
- The selected set/section IDs and randomization preference are not persisted as a setup draft.

### Session controls and edge behavior

- The header back arrow returns to the feature home; it confirms and pauses a running session before navigating away.
- App-shell navigation out of Mobile Interview also confirms, pauses, and persists the current running question. Browser Back changes the selected view through the app's `popstate` handler.
- Pause/resume applies to the current prompt, not the entire pool. Every prompt retains its own remaining time when revisited.
- Previous is disabled on the first prompt and while paused. Next is always enabled and acts as Finish on the last question.
- End interview opens the recap early after confirmation. Unvisited prompts remain unsubmitted; they are not all marked skipped automatically.
- Abort deletes the active session and excludes it from completed History. Statistics already written by answer/skip events are separate and are not rolled back.
- Starting another round from recap retains the completed attempt in History.
- Pressing/long-pressing the question text on touch/pen copies the question to the clipboard. Clipboard errors are surfaced in a notice.
- “Mark important” is per prompt/session. It affects recap's Important only filter; it does not reorder questions or alter grading.
- A History dialog is available from recap. The full History page lists completed attempts. Each attempt can expand to show prompt-level status and a saved typed answer, but it does not restore that old attempt as the active session.

### Recap, counters, and answer display

- Recap counts sections, answered prompts, skipped prompts, reference answers viewed, and important prompts.
- The recap list shows each question, section, important/skipped/answered status, result where available, and typed response. Reference content is marked as viewed but is not rendered inline for every row.
- Statistics displayed alongside the active question are lifetime per-question counters; recap counts are for the current attempt (or aggregate session-history summaries in History).
- “Clear stats” is available in the active question UI, requires confirmation, and clears all question counters for this browser origin—not only the displayed question.
- A missing reference answer is explicitly displayed as unavailable rather than inferred from the user's answer.

## 12. Calendar and schedule behavior

The calendar is a Monday-first 42-cell month grid. Selecting a date shows schedules for that date. Cells show a count formed from sessions started on that date plus schedules that have not yet been associated with a started session.

`MobileInterviewSchedule` is validated and persisted, and starting one uses its title, set IDs, section IDs, randomization flag, and timer values. If its section ID list is empty, the app expands it to every current section in its selected sets. When a linked session finishes, the schedule is marked completed with `completedAt`; it can still be started again. Removing a schedule deletes that schedule only, not the associated history.

**Current UI limitation:** the calendar has no control to create or edit a schedule. It can display, start, restart, and remove schedules already present in localStorage or imported from a backup. The schedule schema and engine support these objects, but there is currently no in-feature schedule composer. Do not tell a user they can create calendar schedules through this screen unless that UI is added.

An older saved schedule can refer to removed set/section IDs. The UI shows an explanatory alert when it cannot produce prompts and asks the user to remove it and create a schedule using current categories; because in-app creation is not currently available, the practical workaround is to use New interview or update/import schedule data through an applicable product flow.

## 13. Coding-interview UI and state details

### Prompt data resolution

For generated bank entries, the prompt stores a roadmap problem ID and language. The coding component resolves title, description, examples, and language-specific solution variants from `problems` using that ID. For source HTML programming entries, `MobileInterview` supplies the parsed `MobileCodingQuestion` directly, including paired Kotlin/Java solution variants.

The problem title bar can collapse/expand; the collapsed flag is saved on the prompt. The question and examples have a copy button. Solution panel expansion, current solution selection, editor size, output drawer visibility, and keyboard visibility are component UI state and reset or reinitialize as the component/prompt changes.

### Code editing and starter/reference solutions

- Kotlin's editor is dynamically imported. Until ready, the UI shows loading; on initialization failure it offers a textarea fallback and a Retry action. The component logs initialization failures.
- Java uses a native textarea. Enter preserves indentation; braces are auto-indented and closing braces can be placed on their own line.
- A symbol toolbar inserts common symbols, indentation, and language-specific tokens at the current cursor/selection. It prevents toolbar mousedown from stealing editor focus and requests brief vibration where supported.
- Code is written into `prompt.codingAnswers[language]`, making drafts survive prompt changes and reloads. Switching language does not overwrite the other language's draft.
- Insert template asks before replacing non-empty code. Clear asks before clearing. Both reset the current language draft.
- A reference-solution panel provides variants, recommendation/complexity details, and a “try this solution” action that loads the selected code into the editor; this is a preview/edit action, not an automatic submission.
- The playground Normal/Big size switch is not persisted.
- Mobile keyboard size is detected with `visualViewport`; the screen uses this to adapt layout and keep controls/editor usable.

### Run, submit, and drawer behavior

- **Run** runs code and updates the output drawer. It does not by itself mark the question attended/correct/wrong.
- **Submit** records attendance, pauses the interview prompt, and opens verification. It runs non-empty code automatically. Only a successful expected-output comparison records correct/incorrect; empty code, compile errors, runtime errors, network problems, and runner failures are not treated as incorrect.
- The output drawer is scoped to the current prompt ID and reset on prompt change. It can display status/duration, stdout, compile/runtime stderr, stdin for Java, and expected-output comparison. It has close and copy-all actions.
- The verification overlay provides progress/loading, result/unknown states, View answer, Next question, and Try again (+25%) where eligible. A transient service/runner failure can be retried without consuming the timed extra-time retry.
- At question timeout, coding auto-submits non-empty code for verification. If the run cannot be verified, the question remains paused with a message and a continue action. If empty, the learner can view a solution or continue.
- Each coding attempt compares only the first available example's expected output. Java's optional stdin field is passed to Judge0, but the currently displayed example input is not automatically translated into stdin. Generated/source questions may express input as function arguments instead.
- There is no native Android share-intent action in the current coding experience. The removed “Ask AI” action should not be described as available; code and run details can be copied to the clipboard.
- A React error boundary isolates coding-playground rendering errors and offers recovery without crashing the full app.

## 14. HTML source parsing: maintenance contract

The source HTML parser relies on the document's top-level body children and its Google-Docs-like ordered-list class (`lst-kix_...-0`). The accepted source sections are explicitly enumerated in `isStudySection`; arbitrary new study headings are excluded until that function is updated. Interview-set headings must match `Set N: ...`.

For interview-set content, list items are individual questions and subsequent sibling nodes up to the next section heading/list are treated as the shared answer. For study content, the first list item's text is the question and subsequent siblings up to the next list are accumulated into its answer. The interview-set paragraph-question mode uses a question heuristic (question mark or known leading verbs) and excludes headings beginning with Output/Result/Example/Explanation/Answer/Note.

Answer HTML is serialized through an allowlist: script/style/iframe/object/embed/SVG/Math are excluded; only selected tags, link protocols, image names, and style properties survive. Known source images are remapped to Vite asset URLs in `QuestionAnswer`. If an answer format changes in the source HTML, check both parser text and safe-HTML rendering; a question can have a plain answer but no valid `answerHtml`, or can be detected as unanswered if the answer content moves beyond the current stop boundary.

This parser operates at app build/module load time; it does not fetch HTML from a server or parse user-uploaded question files. Source modifications require a rebuild/reload.

## 15. Persistence and integration details for future changes

### State ownership

| State | Owner | Persisted? |
|---|---|---|
| Current prompt index, answers, flags, timers, code, verification | `MobileInterviewSession` in engine/localStorage | Yes |
| Completed attempts | `history` localStorage key | Yes |
| Calendar schedules | `schedules` localStorage key | Yes |
| Per-question counters/dedupe events | `question-stats` localStorage key | Yes; included in full local and Drive app backups |
| Learn tracks, per-question learned/review flags, and stage quiz summaries | `learn-progress` localStorage key | Yes; included in full local and Drive app backups |
| Smart Revision per-question memory and settings | `revision-v1` localStorage key | Yes; included in full local and Drive app backups |
| Setup selections, time picker draft, show-history dialog | `MobileInterview` React state | No |
| Coding editor size, solution selector, output drawer, runner transient result | `CodingInterviewExperience` React state | No (except verification/code copied back to prompt) |
| Selected app tab | App URL `?tab=...` and app view state | URL/history state |

### Session/history transitions

1. Session creation writes an active session with `finishedAt: null`.
2. Component effects save every session change; a storage exception shows an explicit storage warning.
3. Finishing sets status and `finishedAt`. An effect inserts it into History once by session ID and changes screen to recap. A linked schedule is marked completed.
4. Returning home after recap clears the current-session key; History is retained.
5. Abort clears the active session and does not add it to History.
6. History loading filters invalid entries and only keeps finished sessions, sorted newest-first.

### App-level backup

Settings' full JSON backup is version 3 and contains `mobileInterview` as one section. `parseMobileInterviewBackup` validates the active session, finished history, schedules, and optional question-statistics, Learn, and Smart Revision payloads. Missing or invalid optional revision data is treated as empty without rejecting other valid sections; new exports always include it. Import can replace or merge:

- Replace writes the incoming active session/history/schedules/stats/Learn/revision data for that section.
- Merge deduplicates history and schedules by ID, sorts them, and keeps the current active session if the incoming backup has none; incoming non-null active session takes precedence.
- Stats merge using session ID + prompt ID event keys. Duplicate events from the same backup copied across devices count once; events found in only one backup are retained. For a given event, attended takes precedence over skipped, and the latest answer result in the merged data determines correct vs wrong.
- Revision merge uses maximum priority and cycle, takes the memory schedule from the more recently seen copy, and uses the newer global settings/date block (incoming wins ties).
- Older app backup versions (1/2) predate the Mobile Interview section.

### Local file backup vs Google Drive

The controls live in **Settings → Data** and are deliberately separate:

- **Local backup · This device**: **Export Local Backup** downloads the version-3 full-app JSON file; **Import Local Backup** reads a user-selected JSON file. It requires no Google sign-in and does not upload data.
- **Google Drive backup · Cloud**: optional manual backup using Google Identity Services and Drive's private `appDataFolder`. The file is named `kotlin-interview-trainer-backup.json`; there is one file that is created on first save and updated on subsequent saves. The entire same full-app JSON is saved, including Mobile Interview history, schedules, question stats, Learn progress, and Smart Revision data. There is no automatic/background sync.
- After successful Google authorization, the UI checks whether the Drive backup exists and shows its filename, last-modified timestamp, and size when Google provides them. **Refresh backup status** checks again; save and restore refresh the status too. A successful authorization with no matching file is shown as “No backup found,” distinct from an unchecked/error state.
- Restore downloads and validates the JSON, then opens the same explicit **Merge / Add** or **Replace** confirmation used by local import. Merely signing in or checking status does not upload or alter local progress.
- The selected Google account email is remembered in localStorage so the UI can offer **Continue as** after page refresh. OAuth access tokens are short-lived and are not persisted; reconnecting asks Google for a fresh token. **Log out** clears the in-memory token and remembered email on this device. It does not sign the user out of Google globally, revoke Google consent, or delete the Drive backup.
- Google Drive support requires the public OAuth Web client ID as the build-time `VITE_GOOGLE_CLIENT_ID`. Local Vite uses `.env.local`; the deployed Render build needs this value in Render's environment and a fresh deployment. Google Cloud must have the exact app URL configured as an Authorized JavaScript origin. See [`docs/GOOGLE_DRIVE_BACKUP.md`](../../docs/GOOGLE_DRIVE_BACKUP.md) for setup details. No client secret belongs in the browser app.

### Important local-only and operational constraints

- All interview data is scoped to the browser's localStorage origin/profile. Different ports/origins (for example `localhost` vs `127.0.0.1`) do not share it.
- The Kotlin compiler/playground and Java Judge0 execution require connectivity; the rest of the feature can load cached local state without sending question-bank data to a backend.
- `localStorage` capacity is finite. Persisting a whole session includes code and question text; failed writes are shown but do not synchronize across browsers/devices.
- Session version is currently `1`; question statistics have their own schema version `2`. If a persisted shape changes, update parser validation/migration, tests, and backup parsing together.

## 16. Known limitations and precise behavior

These are current behavior, not assumptions for new feature design:

1. There is no in-app schedule creation or edit flow.
2. There is no visible “untimed interview” option in setup, although the engine retains untimed/legacy session support.
3. The current question bank mapper does not turn HTML questions into MCQs. The engine/UI supports MCQ prompts only when `options` and `correctOptionId` are supplied by another source.
4. Short answers are self-assessed; there is no semantic AI grader or server-side answer evaluation.
5. Coding verification is a single displayed-example output check, not hidden tests, and solution tests are not run automatically.
6. General Q&A export includes typed answers, selected options, coding drafts, and the first/default generated coding reference solution. It does not include every alternative solution variant.
7. Q&A export is available from recap, not as a general export action on the setup/home screen.
8. Per-question statistics survive reloads and are included in full local and Google Drive app backups. Existing backups exported before the stats backup field was added cannot restore counters that were never in those files.
9. Session/history/schedule/statistics data is stored in localStorage for the current browser origin. An optional manual Google Drive backup can copy and restore it across origins/devices; there is no automatic cloud sync.
10. Calendar counts include completed/in-progress sessions by start date as well as future/unstarted schedules; a schedule attached to a session is not counted twice as a pending schedule.

## 17. AI handoff: short system-context block

When asking another AI to change Mobile Interview, include this summary and point it to this document:

> Mobile Interview is a lazy-loaded React feature in `src/components/MobileInterview.tsx`, routed by `src/App.tsx` as `?tab=mobile-interview`. Its bank is built from the local raw HTML parsed in `src/data/interview-question-bank.ts`, mapped/generated in `src/data/mobile-interview-bank.ts`, plus coding problems in `src/data/roadmap.ts`. Session domain logic and validation/persistence are in `src/engine/mobile-interview.ts`; coding editor/runners are in `src/components/CodingInterviewExperience.tsx`; output comparison is in `src/utils/output-comparison.ts`. Active session, history, schedules and question stats use separate localStorage keys. Full app backups include all of these, including attendance/correct/wrong/skipped counters and event IDs; manual Google Drive backup uses the same full-app data. Short answers are self-assessed; MCQs compare IDs; coding compares successful runner stdout with the first example only. Preserve timer deadline semantics (`endsAt`), per-prompt remaining time, session+prompt statistics deduplication, and parser/backup compatibility. Read this document before proposing edits; add focused regression tests in the paired engine/bank test files and report any current limitation rather than assuming it exists.
