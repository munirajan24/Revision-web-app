# SOLID Design Principles

Source: [New_Note.pdf](<../../Scalar java backend contents/New_Note.pdf>) (42 pages)

The opening page identifies interfaces and the five SOLID principles. The notes use banking/UPI interfaces and a bird inheritance example. Handwritten code and several examples are faint; the examples below clarify the principles without claiming to reproduce every source snippet.

## Interfaces: contracts and implementations

The opening pages introduce an interface as a contract for behavior: callers can use the operations it declares without depending on the concrete class that implements them. The source illustrates this with a `List` interface and an `ArrayList` implementation.

```java
List<String> names = new ArrayList<>();
names.add("Asha");
```

The variable is typed to the behavior the caller needs; the implementation supplies that behavior. An interface is useful when it establishes a meaningful boundary or allows implementations to vary. It is not automatically beneficial to create one for every class.

## Dependency inversion, injection, and inversion of control

The source lists these related terms separately:

- **Dependency Inversion Principle (DIP):** high-level policy and low-level details depend on a useful abstraction rather than directly on one another.
- **Dependency injection (DI):** a technique for supplying a component's dependencies from outside it, commonly through a constructor.
- **Inversion of control (IoC):** the broader idea that a component does not control some aspect of its creation or execution; a DI container is one common way to provide dependencies and manage object lifecycles.

DI can help implement DIP, but they are not synonyms: injecting a concrete vendor class still leaves the high-level policy coupled to that detail. The source applies the interface/adapter idea to banking and UPI payments.

## What SOLID is for

SOLID is a set of design principles for making responsibilities and dependency boundaries easier to change and test. It is not a checklist that requires an interface or class for every noun. Apply a principle when it helps preserve a meaningful contract or isolate a likely change.

## S — Single Responsibility Principle

A class or module should have one focused responsibility and one main reason to change.

If an `Invoice` class calculates totals, formats HTML, and saves to a database, those concerns change for different reasons. Separate policy from presentation and persistence:

```text
Invoice / line items -> invoice total
InvoiceFormatter     -> presentation
InvoiceRepository    -> persistence
```

Do not interpret SRP as “a class can have only one method.” The goal is cohesion: related behavior changes together.

## O — Open/Closed Principle

Software should be open to adding behavior while avoiding repeated changes to stable code. Put a genuine variation behind a contract:

```java
interface FeePolicy {
    Money calculate(Trip trip);
}

class StandardFeePolicy implements FeePolicy { ... }
class PeakHourFeePolicy implements FeePolicy { ... }
```

A caller can use a new fee policy without adding another branch to a central class each time. This is not a ban on modifying existing code; requirements sometimes need a deliberate change. Avoid building a plugin framework for variations that are unlikely or do not yet exist.

## L — Liskov Substitution Principle

A subtype should be usable wherever its base type is expected without breaking the base type's promises or requiring surprising special cases.

The source's bird example illustrates the problem with requiring every `Bird` to fly. A penguin is a bird but cannot satisfy an operation that promises flight. Model flight as a capability:

```java
interface Bird {
    void eat();
}

interface FlyingBird extends Bird {
    void fly();
}

class Sparrow implements FlyingBird { ... }
class Penguin implements Bird { ... }
```

Subtypes should preserve expected preconditions, postconditions, and invariants. A subclass that rejects ordinary base-class inputs or returns behavior that violates the base contract is not substitutable.

## I — Interface Segregation Principle

Keep interfaces focused so a client does not depend on methods it never uses.

Instead of one large `Device` interface with `print`, `scan`, and `fax`, separate capabilities:

```java
interface Printer {
    void print(Document document);
}

interface Scanner {
    Scan scan(Document document);
}
```

A simple printer can implement `Printer` without pretending to support scanning or faxing. Keep interfaces cohesive; splitting every method into its own interface is not the goal.

## D — Dependency Inversion Principle

High-level policy and low-level implementation should depend on abstractions at a useful boundary. The details should implement the contract needed by the policy.

The source shows a stable banking/payment interface with provider-specific implementations or adapters:

```text
Payment service -> BankProvider contract <- Bank A adapter
                                   \------<- Bank B adapter
```

The payment use case calls the contract. Provider-specific API changes stay in the adapter rather than spreading through the use case. Dependency injection is one way to provide the implementation, but DI alone does not ensure a good abstraction.

## How the principles fit together

- SRP helps identify responsibilities that change independently.
- OCP helps contain known or likely variations behind a stable boundary.
- LSP checks that alternate implementations honor that boundary.
- ISP keeps the boundary small enough for its clients.
- DIP makes high-level policy depend on the boundary rather than a vendor detail.

## Practical review checklist

When adding or changing behavior:

1. What is the class's responsibility and likely reason to change?
2. Is there a real variation that benefits from a contract?
3. Can each implementation honor the contract for all supported inputs?
4. Does each client need every method in the interface?
5. Does business policy depend on a vendor/library detail?
6. Would a direct implementation be clearer than the proposed abstraction?

## Quick self-check

1. What is a responsibility in SRP, and why is “one method per class” not the rule?
2. How can a strategy help with OCP?
3. Why is `fly()` a problematic operation on a base type that includes penguins?
4. What is wrong with forcing a simple printer to implement scanning?
5. How does an adapter help apply DIP at a provider boundary?
6. What is one risk of applying SOLID mechanically?

## Review the handwritten examples

- [Interfaces and SOLID agenda (page 1)](<../../Scalar java backend contents/New_Note.pdf#page=1>)
- [Interface contract and `List` implementation example (pages 2–5)](<../../Scalar java backend contents/New_Note.pdf#page=2>)
- [Interface/adapter banking and UPI example (pages 6–7)](<../../Scalar java backend contents/New_Note.pdf#page=6>)
- [Liskov substitution principle (page 37)](<../../Scalar java backend contents/New_Note.pdf#page=37>)
- [Bird inheritance example (page 39)](<../../Scalar java backend contents/New_Note.pdf#page=39>)

The PDF contains further handwritten principle examples and code between these references. Check the original pages for exact class names and wording; the scan is too faint to recover every implementation detail reliably.
