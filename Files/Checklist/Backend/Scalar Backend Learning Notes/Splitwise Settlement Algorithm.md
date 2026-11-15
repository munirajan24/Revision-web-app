# Splitwise: Computing and Minimizing Settlements

Source: [zero__put_them.pdf](<../../Scalar java backend contents/zero__put_them.pdf>) (16 pages)

The handwritten pages work through group expenses and ask how to compute the smallest list of transfers that settles everyone.

## Step 1: calculate each person's net balance

For each expense, record the total, who paid, and how the amount is split. Sum across all expenses:

```text
net(person) = total paid by person - total share owed by person
```

- A positive result means the group should pay this person.
- A negative result means this person should pay the group.
- The sum of all net balances must be zero (apart from rounding).

Do not settle each expense independently: combine a person's balances across the whole group first.

## Step 2: produce a valid settlement

Separate people into creditors (positive balance) and debtors (negative balance). Repeatedly pair one of each:

```text
transfer = min(creditor balance, abs(debtor balance))
```

Send that amount from the debtor to the creditor, reduce both balances, and remove any balance that reaches zero. This always makes progress and creates a valid settlement.

An implementation can keep debtors and creditors in max-heaps by absolute balance. Each iteration removes one of each, emits a transfer of the smaller amount, and reinserts whichever balance remains. For `n` non-zero balances, this produces a valid plan in roughly `O(n log n)` time, apart from output. Different pairing orders can produce different transfer counts.

## Worked example

The source shows a four-person group and expenses where different people pay different portions. For a simple illustration, suppose the combined balances are:

```text
A: +250    B: +250    C: -250    D: -250
```

One valid settlement is `C -> A: 250` and `D -> B: 250`. The result should contain no more transfers than needed to bring every balance to zero.

Use the handwritten examples for the actual expense values; the scan's arithmetic is not consistently legible enough to reproduce every number safely.

## Valid settlement vs. minimum settlement

Greedy debtor/creditor pairing is easy to implement and produces a correct settlement, but the order of pairing can affect the number of transfers. Finding the globally minimum number of transactions is a harder optimization problem; the notes explore minimizing transfers and describe a brute-force/exact-search direction.

For a small group, an exact approach can try subsets of people whose net balances sum to zero, then combine the subsets to minimize the number of settlements. This has exponential worst-case growth, so use it only for small input sizes. For larger groups, use a practical greedy approach and document that it does not guarantee the global minimum.

One exact formulation is to partition the non-zero balances into the largest possible number of zero-sum groups. A group of `k` people can be settled using at most `k - 1` transfers, so maximizing the number of independently settled groups minimizes the total transfers:

```text
maxGroups(mask):
    choose one person i in mask
    try each subset group of mask that contains i
    if sum(balance[j] for j in group) == 0:
        maxGroups(mask) =
            max(maxGroups(mask), 1 + maxGroups(mask without group))

minimum transfers = number of non-zero balances - maxGroups(all)
```

Enumerating subsets is exponential (a straightforward submask formulation can take `O(3^n)` time), so this is appropriate only for small groups. It is also important to keep the problem's input bounded; a memoized exact search can still consume substantial time and memory.

## Implementation checks

- Validate that each expense has a positive amount and valid participants.
- Define how equal or unequal shares are represented.
- Use a currency-safe representation (for example, integer minor units) to avoid floating-point rounding errors.
- Ensure transfers conserve money and all final balances are zero.
- In an exact search, omit zero balances and store the chosen zero-sum groups so the transfer list can be reconstructed.
- Test repeated expenses, self-payments, zero balances, and rounding remainders.

## Review the handwritten pages

- [Expense and participant examples (pages 1–5)](<../../Scalar java backend contents/zero__put_them.pdf#page=1>)
- [Net balances and transfer examples (pages 6–11)](<../../Scalar java backend contents/zero__put_them.pdf#page=6>)
- [Minimum-transfer discussion and algorithm sketches (pages 12–16)](<../../Scalar java backend contents/zero__put_them.pdf#page=12>)

The specific numerical examples and exact search steps are not fully readable in OCR; consult the cited source pages before reusing them.

## Quick self-check

1. Why should all expenses be consolidated into net balances before settling?
2. How do you know the ledger is internally consistent?
3. What makes a debtor/creditor pairing algorithm correct?
4. Why can a valid greedy settlement use more transfers than an optimal solution?
