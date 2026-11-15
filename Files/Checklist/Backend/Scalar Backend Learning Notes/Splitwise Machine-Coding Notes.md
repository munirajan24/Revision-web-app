# Machine Coding: Splitwise CLI Tasks

Source: [Machinecoding_spliterise2.pdf](<../../Scalar java backend contents/Machinecoding_spliterise2.pdf>) (1 page)

The handwritten page lists three tasks: understand the existing entity code, read input through a command-line reader, and implement user registration and settling a user's expense through the command line.

## 1. Read the existing code first

Before changing the starter project:

1. Find the entry point and understand how input reaches it.
2. Read the existing user, expense, group, and balance entities that are present.
3. Check how IDs are assigned and how objects are stored.
4. Identify existing services/repositories and reuse their conventions.
5. Run the existing tests or sample input before editing.

Do not create a second representation of an entity if the starter code already defines the intended one.

## 2. Separate command handling from business logic

Use a small pipeline:

```text
command-line reader
    -> parser / command validation
    -> user or settlement service
    -> domain state update
    -> output formatter
```

The reader obtains a line; the parser turns it into a typed command; the service applies the operation; the formatter prints a predictable result. Keep token parsing out of the domain entities so the same domain operation can later be called through another interface.

The page does not specify a complete command grammar. Define and document one that matches the assignment's expected examples; do not assume the illustrative shapes below are required:

```text
REGISTER_USER <name> <contact>
SETTLE <fromUserId> <toUserId> <amount>
```

Parsing should make malformed input an explicit error and should not mutate state until validation succeeds.

## 3. User registration

A registration operation should:

1. Validate required fields and their formats.
2. Enforce uniqueness rules such as a unique email/phone if required.
3. Create one user with a stable ID.
4. Store it using the existing entity/repository mechanism.
5. Return or print the created ID and a clear result.

Decide whether duplicate registration is rejected, treated as idempotent, or updates a user; follow the assignment rather than silently choosing.

## 4. Settle an expense

A settlement represents a payment from one user to another. Validate both users, the amount, and the outstanding relationship before applying it.

```text
User A owes User B 20
User A pays User B 8
Remaining: A owes B 12
```

If the exercise settles an expense rather than a pairwise balance, confirm whether settlement references an expense ID. Do not mix “simplify the who-owes-whom graph” with recording that money was actually paid; they are different operations.

Keep the state update atomic: a failed validation or persistence operation must not leave the balance partially modified. For a small in-memory exercise, perform all checks first and apply one well-defined state change.

## 5. Error cases and test plan

- Unknown command.
- Missing or extra arguments.
- Duplicate or invalid user registration.
- Unknown user IDs.
- Non-numeric, zero, or negative amount.
- Settlement greater than the outstanding amount, unless overpayment is explicitly allowed.
- Successful registration followed by settlement using the returned IDs.
- Repeated input and end-of-file behavior.

Test parsing separately from the service. Then test the domain operation without depending on console input/output.

## Quick self-check

1. What are the three tasks listed in the source?
2. Why should parsing and settlement logic be separate?
3. What conditions should be checked before modifying a balance?
4. Why is settling a payment different from minimizing the number of transfers?

## Source page guide

- [Page 1](<../../Scalar java backend contents/Machinecoding_spliterise2.pdf#page=1>): inspect existing entities, read command-line input, register users, and settle an expense.

This is a one-page task outline, not a full command specification. Confirm exact input/output and entity fields in the starter code or assignment statement. For the larger expense-sharing exercise, see [Splitwise Machine-Coding Exercise](./Splitwise%20Machine-Coding%20Exercise.md); for payment minimization, see [Splitwise Settlement Algorithm](./Splitwise%20Settlement%20Algorithm.md).
