# Unique ID Generation and Rate Limiting

Source: [Popular_Interview_questions.pdf](<../../Scalar java backend contents/Popular_Interview_questions.pdf>) (16 pages)

The PDF's agenda contains two system-design questions: design a unique ID generator and design a rate limiter.

## 1. Design a unique ID generator

### Requirements to clarify

- Must IDs be globally unique, time-sortable, or both?
- How many IDs are generated per second?
- Are IDs generated across multiple regions?
- Can IDs be predictable, or should they be hard to guess?
- What should happen if a generator node restarts or its clock changes?

### Approaches

| Approach | Benefits | Trade-offs |
|---|---|---|
| Database auto-increment | Simple and ordered | Central coordination and write bottleneck |
| UUID | Decentralized and collision-resistant | Larger, not naturally time-ordered |
| Snowflake-style ID | Distributed and roughly time-sortable | Requires unique worker IDs and clock handling |

### Snowflake-style layout

The notes sketch a 64-bit ID with fields for a timestamp, data-center ID, machine/worker ID, and per-time-unit sequence. The example uses **41 timestamp bits + 5 data-center bits + 5 worker bits + 12 sequence bits = 63 bits** (leaving the sign bit unused).

```text
| timestamp | datacenter | worker | sequence |
|  41 bits  |   5 bits   | 5 bits | 12 bits  |
```

An ID is formed from the elapsed time since a chosen epoch plus the node identifiers and sequence. A worker can issue multiple IDs during one time unit by incrementing the sequence.

**Operational rules:** allocate worker IDs uniquely; wait for the next time unit if the sequence is exhausted; detect clock rollback; and plan for generator restarts and epoch changes. The bit counts are an example design, not a universal standard.

## 2. Design a rate limiter

A rate limiter controls how many requests a client, user, IP, or other key can make over time. When the allowance is exceeded, a service can reject or delay requests (commonly with HTTP `429 Too Many Requests`).

### Fixed-window counter

Count requests per key in fixed time windows, such as 100 requests per minute. Increment the active window's counter and reject once the limit is reached.

**Trade-off:** simple and memory-efficient, but a client can make a burst near a window boundary (for example, requests at the end of one window and start of the next).

### Sliding-window counter

The later pages sketch a weighted count that combines the previous and current window, based on how far into the current window the request arrives. This smooths the fixed-window boundary burst with less storage than keeping every request timestamp.

The exact weighting values in the handwritten example are hard to read; the principle is:

```text
estimated recent requests
  = current-window count
  + previous-window count × fraction of previous window still in range
```

### Design checklist

- Pick the limiting key: user ID, API key, IP address, or a combination.
- Define the window, quota, and whether bursts are allowed.
- Decide how to share counters across application instances.
- Use an atomic counter/update and an expiry time for distributed storage.
- Return a clear rejection response and, where useful, a retry time.
- Consider fairness, clock boundaries, hot keys, and fail-open versus fail-closed behavior.

## Review the handwritten pages

- [Unique-ID requirements and candidate methods (pages 1–3)](<../../Scalar java backend contents/Popular_Interview_questions.pdf#page=1>)
- [Snowflake-style timestamp/worker/sequence layout (pages 4–6)](<../../Scalar java backend contents/Popular_Interview_questions.pdf#page=4>)
- [Rate limiting, 429 responses, and window counters (pages 7–16)](<../../Scalar java backend contents/Popular_Interview_questions.pdf#page=7>)

OCR confidence is low. Use the source for exact example limits, field sizes, and arithmetic.

## Quick self-check

1. What coordination does a distributed Snowflake-style generator still require?
2. How do you handle sequence exhaustion and clock rollback?
3. Why can a fixed-window limiter allow a boundary burst?
4. What does a sliding-window counter trade for smoother enforcement?
