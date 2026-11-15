# Splitwise Machine-Coding Exercise

Source: [Machiinrecoding_splitw_2.pdf](<../../Scalar java backend contents/Machiinrecoding_splitw_2.pdf>) (5 pages)

The low-resolution handwritten scan is difficult to read. It appears to be a Splitwise-style expense-sharing machine-coding exercise. The guide below provides a sound implementation scaffold; confirm exact commands, entities, and split rules in the original problem statement or starter code.

## 1. Clarify the behavior

Before coding, establish:

- Can expenses be created only in groups, or also between individuals?
- Who can be an expense payer, and must the payer be a participant?
- Which split types are required: equal, exact amounts, percentage, or shares?
- How are currency and rounding handled?
- Can expenses be edited or deleted?
- Does settlement record a payment, or only reduce an outstanding balance?
- What should commands print on success or invalid input?

Do not silently implement split types that the assignment does not request. Keep the rules explicit so they can be added without rewriting command parsing.

## 2. Domain model

A useful starting model is:

```text
User(userId, name, ...)
Group(groupId, name, members)
Expense(expenseId, groupId?, description, total, payerShares, participantSplits)
Settlement(settlementId, groupId?, fromUserId, toUserId, amount, createdAt)
```

An expense may have one payer or multiple payer contributions, depending on the requirement. Each participant split represents how much that person owes for the expense. Keep these concepts separate:

- **Paid:** money a user contributed at the time of the expense.
- **Owed/share:** the user's responsibility for the expense.
- **Net balance:** paid amount minus owed amount, aggregated across expenses and settlements.

## 3. Split calculation

Represent split calculation behind a strategy or domain function:

```text
SplitStrategy.calculate(total, participants, splitDetails) -> shares
```

For each supported split type, validate that:

- All participants exist and are eligible.
- Every amount is non-negative unless refunds/credits are explicitly supported.
- Equal splits divide the total across participants.
- Exact splits sum to the total.
- Percentage splits sum to 100%.
- Currency rounding leaves no unexplained remainder.

For equal splits, compute integer minor units (for example, cents) rather than binary floating-point values. If the total does not divide evenly, define a deterministic remainder rule, such as assigning leftover minor units by stable participant ordering.

## 4. Derive pairwise balances

For each expense, calculate each participant's net contribution:

```text
net[user] = amountPaidByUser - amountOwedByUser
```

A positive value means the user should receive money; a negative value means the user owes money. Across a closed group of expenses, net balances should sum to zero (up to explicitly handled currency rounding).

Example: A pays 30, and A, B, and C each owe 10:

```text
A: +20
B: -10
C: -10
```

One possible settlement is B pays A 10 and C pays A 10. The settlement presentation can vary, but it should preserve the net balances. For minimum-transfer simplification, see [Splitwise Settlement Algorithm](./Splitwise%20Settlement%20Algorithm.md); do not conflate simplifying who pays whom with recording a real payment.

## 5. Command-line architecture

If the exercise is command driven, keep these responsibilities separate:

```text
input reader -> parser -> typed command -> domain/service -> output formatter
```

1. Read a complete line.
2. Parse it into a typed command with explicit fields.
3. Validate syntax and values before changing state.
4. Call a domain/service operation.
5. Print a deterministic result or a clear error.

Avoid mixing `split(" ")` parsing into balance calculations. Quoted descriptions, optional values, and malformed input otherwise become difficult to handle safely.

## 6. State changes and invariants

- An invalid expense must not partially update balances.
- An edit should replace the old expense's effect with the new one exactly once.
- A settlement should reduce the intended outstanding debt and must not exceed it unless overpayment is explicitly supported.
- Repeating a command should not accidentally create duplicate expenses/payments if the interface supports retries or IDs.
- If persistence is required, save the expense and related balance changes in one transaction or derive balances from durable expense/settlement records.

For a small in-memory machine-coding task, a map of IDs to objects may be enough; still define the invariants clearly.

## 7. Test plan

### Split calculation

- Equal split with exact division and with a remainder.
- Exact split that sums correctly and one that does not.
- Percentage split at 100% and invalid totals.
- Zero, negative, or excessively large values according to the requirements.

### Domain and balances

- Payer is also a participant.
- Payer is not a participant, if allowed.
- Unknown user or group.
- One-person expense.
- Multiple expenses between the same users.
- Settlement that exactly clears a debt and one that exceeds it.
- Edit or deletion of an expense if supported.

### Command handling

- Valid registration/expense/settlement commands.
- Missing, extra, malformed, or unknown command arguments.
- Unknown IDs and invalid amounts.
- Clear output for both success and failure.

## Quick self-check

1. What is the difference between paid amount, owed share, and net balance?
2. Why should split logic be separate from command parsing?
3. How do you handle equal-split rounding in currency?
4. What invariant should hold for the sum of group net balances?
5. How does a settlement differ from simplifying a list of debts?
6. What must be atomic when editing an expense?

## Source page guide

- [Pages 1–5](<../../Scalar java backend contents/Machiinrecoding_splitw_2.pdf#page=1>): handwritten Splitwise machine-coding exercise sketches. The scan is low-resolution; verify exact entities, input format, and required behaviors in the original or companion starter code.

Related notes: [Splitwise Machine-Coding Notes](./Splitwise%20Machine-Coding%20Notes.md) covers the separate registration/settlement command-line page; [Splitwise Settlement Algorithm](./Splitwise%20Settlement%20Algorithm.md) focuses on debt simplification.
