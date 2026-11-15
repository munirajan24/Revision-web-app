# LLD Design Practice and Splitwise

Source: [pdf.pdf](<../../Scalar java backend contents/pdf.pdf>) (29 pages)

> The filename does not describe the subject. The visible handwritten pages cover low-level design (LLD), OOP/design practices, and a Splitwise-style expense-settlement exercise. OCR is unreliable, so use the page references to check exact diagrams and values.

## Part 1: approaching an LLD problem

The notes use a **design a pen** exercise and a BMS/class-design example to practice turning requirements into classes and interactions.

1. Clarify the requested behavior and boundaries.
2. List the important use cases and expected inputs/outputs.
3. Identify the main domain objects, their state, and their responsibilities.
4. Define object relationships and the APIs needed to perform each use case.
5. Consider extensibility, concurrency, and error cases where they affect the requirements.
6. Walk through example scenarios and refine the design.

The pages emphasize good project structure and applying OOP where it helps. They call out patterns including **Strategy, Adapter, Factory, and Builder**. Choose a pattern to solve a real variation or construction problem; do not add one just to use a named pattern.

### Design responsibilities, not just class names

For each candidate class, decide:

- Which state does it own?
- Which invariant does it enforce?
- Which operations belong with that state?
- Which dependencies should it call, and which details should remain outside it?

For the pen exercise, a refill can own ink type and remaining quantity, while a pen coordinates writing with a compatible refill. If the supported pen types use different writing behavior, a strategy may isolate that variation. If the requirements include only one kind of pen, a simpler design is preferable.

For a BMS (booking-management) style exercise, first identify the user actions and main records, then trace one complete use case through its collaborators. Keep domain rules distinct from request parsing and persistence. The handwritten diagrams contain the specific class details; use the PDF instead of inferring a definitive class list from this generic method.

## Part 2: Splitwise expense settlement

Represent each expense with its amount, payer, and participants/shares. Track how much each member paid and how much they owe, then compute each member's net balance:

```text
net balance = amount paid - amount owed
```

- Positive balance: the group owes this member.
- Negative balance: this member owes the group.
- Zero balance: settled.

Settle by transferring money from members with negative balances to members with positive balances. Each transfer must reduce at least one unsettled balance; never create a transfer that changes the group's total.

### Minimizing the number of transfers

A straightforward greedy method pairs a debtor with a creditor and transfers the smaller of the debt and credit. It produces a valid settlement, but it does not always minimize the number of transactions globally.

The handwritten pages identify the exact minimum-transaction problem as difficult/NP-hard and sketch a brute-force approach. For small groups, an exact search can enumerate ways to combine zero-sum subsets; larger groups generally need a practical approximation/greedy strategy. Use the source pages for the specific recurrence or algorithm attempted in class.

Keep the expense ledger as the source of truth when possible, and derive each user's net balance from payments and shares. If balances are cached, update them consistently with expense edits and settlements. Use integer minor currency units or a decimal money type; binary floating point can create non-zero residue after splits.

### Settlement invariants

- The sum of all users' net balances is zero (subject to explicitly managed rounding).
- Every transfer moves value from a debtor to a creditor.
- A transfer cannot exceed the remaining debt or credit it settles.
- After applying a complete settlement plan, each net balance is zero.
- Recording that a payment happened is separate from proposing a simplified set of transfers.

## Review the handwritten pages

- [Design-a-pen prompt and LLD approach (pages 1–4)](<../../Scalar java backend contents/pdf.pdf#page=1>)
- [Good design, OOP, and pattern notes (pages 5–12)](<../../Scalar java backend contents/pdf.pdf#page=5>)
- [Requirements/API and class-interaction sketches (pages 13–19)](<../../Scalar java backend contents/pdf.pdf#page=13>)
- [Splitwise balances and minimizing transfers (pages 20–29)](<../../Scalar java backend contents/pdf.pdf#page=20>)

The source contains worked balances and an NP-hardness/brute-force discussion. Check the original for the exact figures and algorithm details.

For a fuller treatment of balance calculation and settlement algorithms, see [Splitwise Settlement Algorithm](./Splitwise%20Settlement%20Algorithm.md). For the separate command-line implementation prompt, see [Splitwise Machine-Coding Notes](./Splitwise%20Machine-Coding%20Notes.md).

## Quick self-check

1. What information must be recorded for an expense?
2. How do you derive a member's net balance?
3. Why is pairing one debtor with one creditor valid, but not always globally optimal?
4. Which design pattern would help if pen behavior varies by type, and why?
