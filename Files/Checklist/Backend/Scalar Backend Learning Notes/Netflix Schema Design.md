# Netflix-Style Video Catalog Schema Design

Source: [Schema_Design_For_Netflix.pdf](<../../Scalar java backend contents/Schema_Design_For_Netflix.pdf>) (3 pages)

The handwritten exercise identifies an account, up to five profiles per account, video metadata, and viewing progress used to resume playback. This note turns those requirements into a relational starting point and makes the modeling choices explicit. Some exact source labels are faint; verify them against the original.

## 1. Extract the requirements

From the source diagrams:

- An account has an email and password.
- An account can have up to **five profiles**.
- A profile has a name and a PIN.
- A video has a name/title, description, and cast.
- A profile should be able to resume a movie or episode.

Translate each sentence into data and constraints before deciding table shapes. Also clarify whether profiles have separate watch histories, whether progress is one current position or a full history, and how series and episodes are represented.

## 2. Identify entities and relationships

A useful conceptual model:

```text
Account 1 ---- * Profile
Profile 1 ---- * WatchProgress * ---- 1 Video
Video   * ---- * Person (cast credit)
Series  1 ---- * Episode
```

In the diagram, `*` means “many.” A video may have multiple cast members and a person may appear in multiple videos, so cast is a many-to-many relationship. `WatchProgress` connects one profile to one piece of playable content.

## 3. Relational schema

One possible schema is:

```text
Account(
  account_id PK,
  email UNIQUE NOT NULL,
  password_hash NOT NULL
)

Profile(
  profile_id PK,
  account_id FK -> Account,
  name NOT NULL,
  pin_hash,
  UNIQUE(account_id, name)
)

Video(
  video_id PK,
  title NOT NULL,
  description,
  content_type
)

Person(
  person_id PK,
  name NOT NULL
)

CastCredit(
  video_id FK -> Video,
  person_id FK -> Person,
  role,
  billing_order,
  PRIMARY KEY(video_id, person_id, role)
)

WatchProgress(
  profile_id FK -> Profile,
  video_id FK -> Video,
  position_seconds,
  last_updated_at,
  completed_at,
  PRIMARY KEY(profile_id, video_id)
)
```

The exact key for `CastCredit` depends on the domain: if a person can have multiple roles in one video, `role` (or a separate credit ID) is needed in the key. If the application does not query cast members independently, a simpler representation may be sufficient for the assignment.

## 4. Model series and episodes deliberately

The source mentions movies and series/episodes but does not make the exact hierarchy fully legible. If episodes need independent browsing and resume progress, model them as playable content rather than storing episode lists in an opaque field:

```text
Series(series_id PK, title, description)
Season(season_id PK, series_id FK, season_number)
Episode(episode_id PK, season_id FK, episode_number, title, ...)
```

Then key `WatchProgress` by the playable `video_id`/episode ID. A common alternative is a shared `Content` supertype with movie and episode subtype tables. Choose the simplest model that supports the required queries; do not introduce a hierarchy if the exercise only needs a small flat catalog.

## 5. Important constraints

### Limit profiles to five per account

A `UNIQUE(account_id, name)` constraint can prevent duplicate profile names per account, but it does **not** enforce “at most five profiles.” Ordinary row-level `CHECK` constraints cannot generally count related rows. Enforce the limit in a transaction-safe service operation, or use a database-specific mechanism designed for this rule. A non-transactional “count, then insert” can race when two profile creations happen together.

### Credentials and PINs

Never store a plaintext password or PIN. Store a suitable password hash (and apply the application's security policy to profile PINs). Email should have a unique constraint if it identifies an account; normalize consistently if the product treats case variants as the same address.

### Progress validation

Keep playback position non-negative and validate it against content duration when that value is available. If retaining only the latest resume position, use one row per profile/content pair and update it. If the product needs watch history or session analytics, separate progress state from append-only playback events.

## 6. Queries and indexes

Write the expected queries first, then index their predicates and ordering:

```sql
-- List profiles for an account
SELECT profile_id, name
FROM Profile
WHERE account_id = ?;

-- Continue watching for a profile
SELECT v.video_id, v.title, p.position_seconds, p.last_updated_at
FROM WatchProgress AS p
JOIN Video AS v ON v.video_id = p.video_id
WHERE p.profile_id = ?
  AND p.completed_at IS NULL
ORDER BY p.last_updated_at DESC;
```

The primary/unique key on `(profile_id, video_id)` supports one current progress row for each pair. A separate index beginning with `(profile_id, last_updated_at)` may help an ordered continue-watching query, depending on the database and schema. Confirm choices using the actual query plan and expected data volume.

Possible access patterns include:

- Find an account by email.
- List profiles for an account.
- Get metadata for a video or episode.
- Find cast credits for a video, or videos for a person.
- Retrieve a profile's unfinished progress, newest first.

## 7. Data integrity and lifecycle

- Deleting an account raises a product question: should its profiles and progress be deleted, anonymized, or retained?
- Deleting a profile may need to remove or anonymize its progress.
- A video may be removed from the catalog while viewing-history records remain.
- Choose foreign-key delete behavior intentionally; cascading deletes can be useful but should not erase data unexpectedly.
- Use a transaction when creating related rows or updating state that must remain consistent.

## Quick self-check

1. Why should profiles belong to an account through a foreign key?
2. Which relationship requires a cast-credit/linking table?
3. Why is `(profile_id, video_id)` a useful key for current progress?
4. Why does a unique constraint not enforce a five-profile limit?
5. How would the schema change if each episode must be resumed independently?
6. What is the difference between latest resume state and playback history?
7. Which index could help list one profile's recent unfinished items?

## Source page guide

- [Page 1](<../../Scalar java backend contents/Schema_Design_For_Netflix.pdf#page=1>): account and profile requirements, including the five-profile limit.
- [Page 2](<../../Scalar java backend contents/Schema_Design_For_Netflix.pdf#page=2>): video details, movie/series, and cast notes.
- [Page 3](<../../Scalar java backend contents/Schema_Design_For_Netflix.pdf#page=3>): viewing progress and resume concept.

The proposed keys, constraints, query examples, and episode hierarchy are a worked relational design based on the source requirements, not a verbatim transcription of its handwritten schema.
