# Low-Level Design and OOP Interview Preparation

Source: [Outdo_to_UD_LUDI_945PM_5_CNN.pdf](<../../Scalar java backend contents/Outdo_to_UD_LUDI_945PM_5_CNN.pdf>) (30 pages)

> The filename includes “CNN,” but the visible pages are about low-level design (LLD), object-oriented programming, interview preparation, and a design-a-pen exercise. The scan is handwritten and difficult to OCR; use the PDF for the original class diagrams and assignments.

## What LLD is

**Low-level design** turns requirements into a concrete model of classes, state, behavior, relationships, and interactions. It answers questions such as:

- Which objects participate in a use case?
- Which object owns each piece of state?
- What operations can callers perform?
- How do objects collaborate in success and failure cases?
- What invariants must remain true?

LLD is not a class-diagram drawing exercise alone. A good design can be explained by walking through its use cases and showing how responsibilities are divided.

## OOP foundations

- **Class and object:** a class defines a type and its behavior; an object is a particular instance with state.
- **Encapsulation:** keep state behind operations that preserve invariants.
- **Abstraction:** expose the behavior a caller needs without exposing internal implementation.
- **Inheritance:** share or specialize behavior only when the subtype truly satisfies the base type's contract.
- **Polymorphism:** invoke a common contract while selecting behavior based on the implementation.
- **Composition:** build an object from collaborators and delegate behavior; often clearer than a deep inheritance tree.

An interface is useful when it defines a meaningful contract or variation point. Creating an interface for every class without a real boundary adds indirection rather than clarity.

## A repeatable LLD interview approach

1. **Clarify scope.** Ask what features are required, what is excluded, and what assumptions are allowed.
2. **List use cases.** Write the important user actions and system responses.
3. **Identify domain concepts.** Separate entities with identity/lifecycle from value objects and simple data.
4. **Define state and invariants.** What must always be true? Who is responsible for enforcing it?
5. **Assign responsibilities.** Keep each operation with the object/service that owns its rules.
6. **Design APIs and relationships.** Show important method signatures and how collaborators are connected.
7. **Walk through scenarios.** Trace normal flow, validation failure, boundary conditions, and relevant concurrency.
8. **Discuss trade-offs.** Mention persistence, extensibility, patterns, and performance only where they matter to the requirements.

Start with the smallest design that handles the stated behavior. Add a strategy, factory, or other abstraction when a real variation or construction problem justifies it.

## Example: design a pen

Treat the source's design-a-pen exercise as practice in requirements and responsibility, not as a fixed class diagram.

### Clarify requirements

- Which pen types are in scope: ballpoint, gel, fountain, or marker?
- Must a pen be refillable?
- Does it write continuously, or can it run out of ink?
- Are ink color and refill type selectable?
- Is the exercise about modeling behavior only, or also inventory/manufacturing?

### Possible model

```text
Pen
  - type / model
  - ink color
  - refill (optional)
  + write(mark)

Refill
  - ink type
  - remaining amount
  + consume(amount)
```

Different writing mechanisms may have different behavior. If the assignment requires multiple algorithms, define a writing/refill contract and delegate to the correct implementation. Do not introduce this abstraction if only one behavior is required.

### Scenarios to test

- Write while ink is available.
- Attempt to write when the pen is empty.
- Replace a compatible refill.
- Reject an incompatible refill if compatibility is a requirement.
- Confirm that replacing a refill changes the intended pen state.

For the exact exercise diagram and labels, consult the source rather than treating this sample as a transcription.

## From design to implementation

When moving from an LLD to code:

- Keep controller/CLI parsing separate from domain rules.
- Use value objects for concepts with validation, such as a monetary amount or identifier.
- Prefer explicit state transitions over arbitrary setters for lifecycle-sensitive entities.
- Keep persistence behind a repository boundary when the design requires one.
- Make dependencies visible through constructors or a clear composition root.
- Test public behavior and invariants, not only private helper calls.

## Interview preparation

The source connects LLD practice with assignments, class design, and broader DSA/interview preparation. For each design exercise, practice explaining:

- Requirements and assumptions.
- Why each class exists.
- Which object owns a rule.
- How a new behavior can be added.
- What you intentionally did not model.
- How tests would verify the behavior.

## Review the handwritten pages

- [LLD/OOP introduction and study agenda (pages 1–2)](<../../Scalar java backend contents/Outdo_to_UD_LUDI_945PM_5_CNN.pdf#page=1>)
- [Course/class overview and related study material (pages 3–20)](<../../Scalar java backend contents/Outdo_to_UD_LUDI_945PM_5_CNN.pdf#page=3>)
- [LLD problem approach and design-a-pen exercise (pages 21–30)](<../../Scalar java backend contents/Outdo_to_UD_LUDI_945PM_5_CNN.pdf#page=21>)

The page ranges are navigation aids, not a page-by-page transcription; inspect all original pages for diagrams, class names, and assignment details.

## Quick self-check

1. What requirements should be clarified before drawing classes?
2. How do you decide whether a concept deserves its own class?
3. When is composition clearer than inheritance?
4. Which object should own an invariant?
5. How would the pen model handle an empty or replaced refill?
6. What is the benefit—and cost—of introducing an interface?
