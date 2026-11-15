# LLD Case Study: Movie Booking and Seat Inventory

Source: [LID_Case_Study.pdf](<../../Scalar java backend contents/LID_Case_Study.pdf>) (27 pages)

The diagrams show a booking domain with movies, theatres/cinemas, shows, seats, seat categories, prices, and show-specific seat states. Later pages ask for a schema and Spring Boot model implementation, then mention dynamic pricing for an airline-booking exercise.

## 1. Separate venue seats from show inventory

A physical seat exists independently of a particular show. Availability and price apply to a seat **for one show**, not permanently to the physical seat.

```text
Movie 1 ---- * Show * ---- 1 Screen / Theatre
                         |
                         +---- * ShowSeat * ---- 1 Seat
                                      |
                              state and price
```

Possible entities:

- **Movie:** title and catalog metadata.
- **Theatre/Cinema:** venue information.
- **Screen:** a screen/room within a venue.
- **Seat:** stable seat label and category for a screen.
- **Show:** movie, screen, and scheduled time.
- **ShowSeat:** one seat's price and state for one show.
- **Booking:** customer, show, booking status, and total.
- **BookingSeat:** seats reserved by a booking.

This separation prevents a booking for one show from incorrectly changing availability for all other showtimes.

## 2. Seat-state lifecycle

The source diagrams name states such as **available**, **locked**, and **booked**. A typical lifecycle is:

```text
AVAILABLE -> LOCKED -> BOOKED
                |
                +-> AVAILABLE (lock expires or checkout fails)
```

A lock should include an owner/booking attempt and an expiry time. This gives another user a chance to select the seat if the first user abandons checkout.

Possible state fields for `ShowSeat`:

```text
show_id
seat_id
price
status                // AVAILABLE, LOCKED, BOOKED
lock_owner / booking_id
lock_expires_at
```

Use a unique constraint on `(show_id, seat_id)` so there is only one inventory row for a seat/show pair.

## 3. Booking use case

1. Find the requested show and seat inventory.
2. Verify the seats are available (or that an existing lock has expired).
3. Atomically claim the seats for a short period.
4. Create a pending booking and calculate the quoted total.
5. Complete payment through the payment boundary.
6. On success, mark the booking confirmed and seats booked.
7. On failure or expiry, release the lock and return seats to available.

The exact payment timing and retry behavior depend on the assignment. Do not hold database locks open while waiting on a slow external payment call.

## 4. Prevent double booking

Two users can attempt to book the same seat concurrently. A read-then-write sequence without coordination is unsafe:

```text
User A reads AVAILABLE
User B reads AVAILABLE
User A marks BOOKED
User B marks BOOKED
```

The claim must be atomic, for example by using a transaction with row locking or a conditional update that succeeds only if the seat is still available (or its lock has expired). Check the number of rows changed; if fewer seats were claimed than requested, roll back and report which seats are unavailable.

The transaction boundary should include all database state that must change together, such as creating a pending booking and claiming its seats. Payment is an external side effect, so it needs an explicit workflow for timeout, retry, and compensation rather than assuming it participates in the database transaction.

## 5. Pricing

Seat category and show may affect a seat's price. If price can vary by show, store or snapshot the quoted price in the show inventory or booking so a later catalog change does not rewrite a confirmed booking.

The final pages mention dynamic pricing for an airline-booking exercise. A pricing strategy can be isolated behind a policy interface:

```text
PricingPolicy.quote(item, demand, time, availability) -> Money
```

Keep the inputs explicit and the result testable. Decide when a quote expires and whether the price is locked with the seat. The source does not specify the formula, so do not infer one from the diagram.

## 6. Database and API design checks

- Foreign keys connect show seats to a show and a physical seat.
- Unique constraints prevent duplicate show-seat inventory and duplicate active booking seats.
- Index `Show` by screen/time and `ShowSeat` by `(show_id, status)` or the access path required by the query.
- Expired locks need a cleanup/reclamation path; correctness should not depend solely on a background job running on time.
- APIs should distinguish “seat unavailable” from payment failure and malformed requests.
- Use an idempotency key for retried booking/payment requests where appropriate.

## 7. Test cases

- Two concurrent requests for the same seat: only one should obtain the lock.
- A lock expires and another customer can claim the seat.
- One seat in a multi-seat request is unavailable: define whether the whole request fails atomically.
- Payment succeeds, fails, times out, or is retried.
- Repeated booking request returns the prior result rather than creating duplicate reservations.
- A show changes or is cancelled after seats are selected.
- Quoted price changes before checkout; verify the defined price-lock policy.

## Follow-up exercise

The source asks for a schema based on a class diagram, implementation of the models/entities in Spring Boot, and an extension involving dynamic pricing for an airline-booking app. Separate pricing policy from seat allocation so the rule can change without rewriting the booking workflow.

## Review the handwritten diagrams

- [Movie, theatre, and show examples (page 10)](<../../Scalar java backend contents/LID_Case_Study.pdf#page=10>)
- [Seat type, price, seat status, and inventory example (page 15)](<../../Scalar java backend contents/LID_Case_Study.pdf#page=15>)
- [Schema/model and dynamic-pricing exercises (page 24)](<../../Scalar java backend contents/LID_Case_Study.pdf#page=24>)

Some handwritten labels and numeric estimates were not reliably recoverable; use the PDF for exact values.

## Quick self-check

1. Why should a physical seat be separate from its state for a given show?
2. What stops two customers from booking the same seat at once?
3. Why should a temporary lock expire?
4. Which data must change together when seats are claimed?
5. How should a system handle payment success after a client timeout?
6. How would you make a dynamic-pricing rule independently testable?
