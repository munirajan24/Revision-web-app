# Data Migration Plan

## Goal

Move question metadata and Kotlin/Java solutions out of the monolithic `src/data/roadmap.ts` file into small, indexed JSON files. The app should load only the topic and solution data needed for the current workflow while preserving existing behavior.

## Current State

Completed:

- Topic index JSON exists at `src/data/topic-index.json`.
- Topic-specific index files exist under `src/data/topics/`.
- `loadTopicIndex(topic)` loads one topic JSON file lazily and caches it.
- `loadQuestionsByTopic(topic)` provides a topic-scoped question boundary.
- Question-specific solution loading exists in `src/data/question-solution-loader.ts`.
- `question-005-find-duplicate-characters.json` contains the duplicate-character Kotlin and Java solutions.
- `question-105-binary-search.json` contains the Binary Search Kotlin and Java solutions.
- Existing generated solutions remain in `src/data/roadmap.ts` for compatibility.
- Tests cover topic loading, solution loading, contracts, examples, and generated-code validation.

Remaining:

- Migrate the other question solutions into descriptive `src/data/solutions/question-NNN-slug.json` files.
- Move complete question metadata and examples out of `roadmap.ts`.
- Make the UI prefer lazy-loaded solution JSON and use the generator only as a temporary fallback.
- Remove the old solution generators after migration and validation.
- Remove duplicate topic index data after one canonical source is established.

## Target Structure

```text
src/data/
  index.json
  topics/
    string.json
    array.json
    hash-map.json
    hash-set.json
    sorting.json
    ...
  questions/
    question-001-reverse-a-string.json
    question-002-string-palindrome.json
    ...
  solutions/
    q001.json
    q002.json
    ...
  roadmap.ts
  topic-index-loader.ts
  question-solution-loader.ts
```

Each solution file should contain both languages:

```json
{
  "kotlin": [
    {
      "label": "Basic Solution",
      "code": "...",
      "recommendation": "Best",
      "note": "..."
    }
  ],
  "java": []
}
```

## Migration Phases

### 1. Establish schemas

Create shared TypeScript types and runtime validation for:

- Question metadata
- Problem contracts
- Examples and test cases
- Solution variants
- Supported languages
- Recommendation values

Reject invalid files for duplicate IDs, missing titles, missing contracts, empty examples, unsupported languages, malformed code, and mismatched solution counts.

### 2. Complete solution extraction

For each question from `q001` through `q120`:

1. Export the current Kotlin and Java variants.
2. Save them as `src/data/solutions/question-NNN-slug.json`.
3. Preserve labels, recommendations, notes, and formatting.
4. Validate the file with `validateGeneratedSolutionCode`.
5. Compare the JSON output with the current generated output.
6. Add a regression check for the question.

Migrate by topic to keep review focused:

1. Strings and character operations
2. Arrays and lists
3. HashMap and HashSet
4. Sorting
5. Kotlin collections
6. Linked lists, stacks, queues, and binary search
7. Sliding window, trees, graphs, and prefix-sum problems

### 3. Move question metadata

Create one metadata file per question under `src/data/questions/` containing:

- `id`
- `level`
- `levelTitle`
- `title`
- `topic`
- `difficulty`
- `description`
- `contract`
- `concepts`
- `keywords`
- `examples`
- `testCases`
- `solutionId`

Question metadata must not contain generated code.

### 4. Update loaders

Extend the lazy loaders so they can load:

- One topic index
- One question metadata file
- One question solution file

All loaders should cache successful reads and return clear errors for missing or invalid files.

### 5. Update the UI

Change the practice view to use lazy data APIs:

- Load the selected question metadata when a question opens.
- Load solutions only when the solution panel is opened.
- Load the selected language and solution variant on demand.
- Preserve existing loading, error, language-switching, and copy-code behavior.
- Keep the current synchronous API temporarily as a fallback during migration.

### 6. Remove legacy generation

After all questions are migrated and validated:

- Delete title-based solution generation from `roadmap.ts`.
- Remove generic numeric fallbacks.
- Remove duplicate topic index data.
- Remove compatibility fallbacks from the UI.
- Keep only shared types, loaders, validators, and lookup helpers in the data layer.

## Validation Requirements

Every migrated question must satisfy:

- Exactly one metadata record exists.
- Exactly one topic index entry exists.
- Kotlin and Java solution files exist.
- Each language has four variants.
- Solution signatures match the problem contract.
- Kotlin output contains no Java syntax.
- Java output contains no Kotlin syntax.
- Braces and parentheses are balanced.
- No malformed declarations such as `val seen {` exist.
- Examples are not placeholders.
- Test cases match the examples.
- The selected solution behavior matches its example.

Special regression coverage must remain for:

- Find duplicate characters, IDs 5 and 38
- Remove duplicate characters
- First repeating character
- First non-repeating character
- Valid Parentheses
- Binary Search
- Reverse Linked List
- Maximum Subarray

## Testing Commands

```bash
npm test -- --run src/engine/mastery.test.ts
npm run build
```

Run both commands after each topic migration. The migration is complete only when all tests pass, the build passes, and no generated fallback solution remains.

## Definition Of Done

- `roadmap.ts` no longer contains the 120-question catalog or solution bodies.
- Question metadata and solutions are stored in small JSON files.
- The initial app bundle does not include every solution body.
- Opening a question loads only its metadata and requested solution data.
- Adding a question requires adding JSON metadata and solution files, not editing generator conditionals.
- All existing UI workflows continue to work.
- All tests and the production build pass.
