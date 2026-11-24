# Mobile Interview — Product Plan

## Product boundary

Mobile Interview is a standalone interview-practice feature with a configurable per-question timer. Concept questions reuse Complete Revision's HTML-backed question-and-answer catalog as read-only content; coding sets derive from the shared roadmap problem data. It keeps its own category/section selection, calendar, session history, and progress, without changing Revision Checklist completion state or Android Concepts state.

## Navigation

The Mobile Interview landing page links to:

- **Practice** — choose one or more major categories and their inner sections, follow Complete Revision's source order by default, and optionally enable randomized order.
- **Calendar** — browse dates, schedule interview sessions with category/section selections and a per-question time limit, and start or remove planned sessions.
- **Categories** — browse the shared question catalog as major categories with nested inner sections.
- **History** — review completed sessions, answers, and progress.

Completing an interview returns to its Mobile Interview recap, with a direct route back to the Mobile Interview landing page. Leaving an active interview pauses and saves it; the landing page offers resume.

## Shared question catalog

Use the typed `interviewQuestions` catalog consumed by Complete Revision. Derive Mobile Interview categories from the source hierarchy, keeping category headings such as Java, Kotlin, Android, Testing, and Original interview sets above their inner sections. Do not split inner topics such as Coroutines or Basics into separate top-level sets.

Keep question IDs, prompts, and available answers sourced from Complete Revision, in source order. Add a category only when the Complete Revision source contains questions for it; do not fabricate Spring Boot, microservices, Kafka, Kubernetes, AWS, or GCP content when it is absent from the source.

Coding interviews are separate from the concept-question flow. The question-bank selector includes Kotlin Coding and Java Coding sets built from the 120 roadmap problems, preserving their descriptions, examples, and language-specific solution variants. The HTML-backed `Programming / Kotlin basic coding` and `Programming / Java basic coding` sections are also coding interviews: parse their input/output examples and answer code, pairing the corresponding Kotlin and Java questions in source order. Other Programming sections remain in the concept-question flow.

## Timed, section-oriented interview flow

- Present all questions from the selected sections, grouped in their original section and question order unless randomization is explicitly enabled.
- One focused prompt per screen with the current section, question position, round progress, and a distinct per-question countdown.
- Coding prompts use a five-minute timer and a language-specific editor, symbol toolbar, output drawer, and reference-answer sheet. Kotlin executes through Kotlin Playground; Java executes through Judge0 CE.
- Preserve Kotlin and Java editor contents independently for each coding prompt.
- Pause, resume, skip, mark important, save response drafts automatically, and end early with confirmation.
- Support saved short-form responses. Submit to show a saved-response confirmation. The user explicitly advances after reviewing; viewing the reference answer also requires explicit Next.
- Finish on a recap with answered/skipped/reference counts, important questions, and response review.

## Mobile Interview data and persistence

- Store the active session, completed history, and scheduled sessions under Mobile Interview-specific local-storage keys.
- Validate imported and persisted schedules, question state, and session state.
- Preserve legacy active sessions and history; adding this feature must not clear existing browser data.
- Include Mobile Interview sessions, history, and calendar entries in Settings backup/import.
- Persist coding language, per-language editor contents, and Java standard input with the active prompt.
- Support older app backup formats; backups created before the calendar existed import with an empty Mobile Interview schedule.

## Validation and acceptance

- Mobile Interview reuses the same source questions and answers as Complete Revision; its progress and session records remain independent.
- Kotlin Coding and Java Coding each contain the 120 roadmap problems, and their editor, runner, and answer sheet remain isolated from concept questions.
- Users can select multiple sets/sections, randomize questions, schedule independent sessions, and view their own calendar/history.
- Each question has its own configurable timer; a timeout preserves the current answer draft. Questions follow original section order by default, random order is opt-in, and answer feedback/reveal waits for explicit navigation.
- Schedule and session records survive refresh and backup/restore without modifying Revision Checklist progress.
- The page remains usable on a phone-sized viewport and in a desktop browser.
