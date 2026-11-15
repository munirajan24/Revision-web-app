# Structural Design Patterns

Source: [Structural_Patterns.pdf](<../../Scalar java backend contents/Structural_Patterns.pdf>) (14 pages)

## What design patterns are

Design patterns are named, reusable approaches to recurring software-design problems. They give a team a shared vocabulary and a place to start; they are not a goal in themselves. The source warns against adding patterns just to reduce lines of code. Use one when it makes responsibilities, change, or collaboration between components clearer.

The source's agenda lists seven structural patterns: **Adapter, Bridge, Composite, Decorator, Facade, Flyweight, and Proxy**. Its detailed examples focus on Adapter and Decorator; it also discusses Builder as a creational pattern ([pages 1–2](<../../Scalar java backend contents/Structural_Patterns.pdf#page=1>)).

## 1. Adapter

Use **Adapter** when a client expects one interface but an existing class, library, or service exposes a different one. The adapter implements the interface the client expects and translates calls and data to the provider's interface.

```text
Client -> BankProvider interface -> YesBank adapter -> YesBank API
                                \-> ICICI adapter ----> ICICI API
```

### Example: payment providers

The source describes a phone/payment application that should keep using a stable `BankProvider` interface even if the underlying bank changes:

```java
interface BankProvider {
    void makePayment(PaymentDetails details);
    float checkBalance(String account);
}

class YesBankAdapter implements BankProvider {
    private final YesBank yesBank;

    public void makePayment(PaymentDetails details) {
        // translate the common request to the YesBank API
    }

    public float checkBalance(String account) {
        // call YesBank and translate the result
        return 0;
    }
}
```

An adapter can convert argument formats, method names, and return values. The client calls the common interface; provider-specific details stay at the boundary. If the provider changes, add or replace an adapter instead of scattering provider-specific code through the application.

The source uses bank/payment providers and a database provider as examples, and recommends interfaces plus adapters when integrating external libraries or services ([pages 2–8](<../../Scalar java backend contents/Structural_Patterns.pdf#page=2>)).

### Adapter vs. wrapper

“Wrapper” is a broad term for an object that contains another object. Several patterns wrap objects, but they have different goals:

- **Adapter:** translates an incompatible interface into the interface the client expects.
- **Decorator:** keeps the same interface and adds behavior.
- **Proxy:** keeps a compatible interface but controls or mediates access to the underlying object.

The source explicitly notes that a pattern does not automatically make code smaller; its purpose is to manage dependencies and change.

## 2. Decorator

Use **Decorator** to add behavior to an object while keeping it usable through the same abstraction. A decorator holds a component, forwards calls to it, and adds work before or after forwarding. Multiple decorators can be composed.

```text
Caller -> Metrics decorator -> Logging decorator -> Original component
```

Examples from the source include:

- Adding toppings or a surcharge to a base pizza.
- Wrapping HTML content with formatting such as bold, span, or div tags.
- Adding logging or extra information around an operation.
- Memoizing a function result so repeated calls can reuse cached work.

The component and decorators should have a compatible interface so callers can use a decorated object wherever they use the original. The source shows both object-level wrapping and function/method decoration. A language feature called a “decorator” can be implemented differently, but the design goal here is the same: add behavior without changing the wrapped component's interface ([pages 8–12](<../../Scalar java backend contents/Structural_Patterns.pdf#page=8>)).

### Decorator vs. Builder

- **Builder** helps construct an object before it is used.
- **Decorator** wraps an object that already exists to add or alter behavior.

## 3. Bridge

Use **Bridge** when two dimensions of a design should vary independently. Separate a high-level abstraction from its implementation and make the abstraction hold a reference to the implementation.

```text
Shape abstraction -> Renderer interface
      Circle      -> VectorRenderer
      Circle      -> RasterRenderer
      Square      -> VectorRenderer
      Square      -> RasterRenderer
```

Without a bridge, adding each new abstraction/implementation combination can lead to many subclasses. The source lists Bridge in its agenda but does not develop a detailed Bridge example; this is a study explanation of the pattern.

## 4. Composite

Use **Composite** when objects form a part-whole tree and callers should treat a single item and a group uniformly.

```text
File-system entry
├── File
└── Folder
    ├── File
    └── Folder
```

A shared component interface can define operations such as `display` or `getSize`. A leaf performs the operation itself; a composite delegates it to its children and combines their results. Composite is useful for trees such as file systems or nested UI components, but can make leaf-only and group-only operations harder to express.

The source names Composite in the agenda without a detailed example.

## 5. Facade

Use **Facade** to give callers a simpler, cohesive entry point to a subsystem with several components. The facade coordinates those components, while clients that need lower-level control can still use the subsystem directly.

```text
Client -> OrderFacade -> inventory, payment, and shipping services
```

A facade simplifies usage; it does not necessarily hide every subsystem capability or replace the subsystem's internal interfaces. The source names Facade in the agenda without a detailed example.

## 6. Flyweight

Use **Flyweight** when an application needs many similar objects and can share their common, relatively stable state. Keep shared **intrinsic state** inside the flyweight; pass changing, context-specific **extrinsic state** from the caller.

For example, a text editor could share character-font data for many displayed character occurrences while keeping each occurrence's position outside the shared object.

Flyweight is useful only when the shared state can be separated cleanly and the number of repeated objects makes the complexity worthwhile. The source names Flyweight in the agenda without a detailed example.

## 7. Proxy

Use **Proxy** when a stand-in object should control access to another object while exposing a compatible interface.

Common uses include:

- **Lazy proxy:** create or load an expensive object only when needed.
- **Remote proxy:** represent an object available through a network call.
- **Protection proxy:** check whether a caller is allowed to perform an operation.
- **Caching proxy:** reuse results or data where the cache rules are valid.

Unlike an adapter, a proxy generally preserves the subject's interface; unlike a decorator, its main purpose is access control or mediation rather than adding responsibilities. The source names Proxy in the agenda without a detailed example.

## 8. Builder: a creational pattern in this source

Builder is **creational**, not one of the seven structural patterns in the source agenda. It constructs an object step by step and helps avoid a constructor with many parameters.

The source's `User.Builder` example gathers values, then passes them into a private `User` constructor through `build()`:

```java
class User {
    private final String name;
    private final String password;
    private final float age;

    private User(Builder builder) {
        this.name = builder.name;
        this.password = builder.password;
        this.age = builder.age;
    }

    public static class Builder {
        private String name;
        private String password;
        private float age;

        public Builder setName(String name) {
            this.name = name;
            return this;
        }

        public Builder setAge(float age) {
            this.age = age;
            return this;
        }

        public User build() {
            return new User(this);
        }
    }
}

User user = new User.Builder()
        .setName("Asha")
        .setAge(28)
        .build();
```

Builder can make optional arguments explicit and avoid errors caused by same-typed parameters in the wrong order. It also works well with immutable objects: set the values during construction, then expose no setters on the completed object. Validate required fields in `build()` or the private constructor.

The source's `Color` discussion calls out long constructors where same-type parameters can be confused, order-sensitive, optional, or need defaults. Builder can improve that call site, though a simple object with a few required values may not need one ([pages 12–14](<../../Scalar java backend contents/Structural_Patterns.pdf#page=12>)).

## 9. Other creational patterns referenced

The source briefly lists these alongside Builder:

- **Singleton:** provide one shared instance through a controlled access point.
- **Factory:** move object creation behind a method or abstraction.
- **Abstract Factory:** create related families of objects through a common interface.
- **Prototype:** create an object by copying an existing instance.

These are not structural patterns in the source agenda.

## Pattern selection checklist

| Problem | Pattern to consider |
|---|---|
| An existing API does not match the interface a client needs | Adapter |
| Add behavior around an object without changing its interface | Decorator |
| Let an abstraction and implementation vary independently | Bridge |
| Treat a tree's individual items and groups uniformly | Composite |
| Offer a simple entry point to a complex subsystem | Facade |
| Share repeated state across many similar objects | Flyweight |
| Mediate or control access to another object | Proxy |
| Construct a complex object from optional or order-sensitive values | Builder (creational) |

Before using a pattern, ask whether the actual change it isolates is likely and whether the added indirection makes the code clearer. The source specifically cautions that design patterns do not automatically reduce code.

## Quick self-check

1. What interface mismatch does Adapter solve?
2. How does Decorator preserve the component interface while adding behavior?
3. How do Adapter, Decorator, and Proxy differ if each one wraps another object?
4. What two dimensions does Bridge let you vary independently?
5. How does Composite treat a leaf and a group?
6. What does Facade simplify, and what does it not necessarily remove?
7. Which state is shared in Flyweight, and which state remains contextual?
8. Give one reason to use a Proxy.
9. Why is Builder creational rather than structural?
10. Which Builder trade-offs does the source identify around constructor parameters?

## Source page guide

- [Pages 1–2](<../../Scalar java backend contents/Structural_Patterns.pdf#page=1>): design-pattern recap, structural-pattern agenda, and transition from creational patterns.
- [Pages 2–8](<../../Scalar java backend contents/Structural_Patterns.pdf#page=2>): Adapter, phone-charger analogy, bank/payment providers, database-provider interface, and dependencies.
- [Pages 8–12](<../../Scalar java backend contents/Structural_Patterns.pdf#page=8>): Decorator, pizza/HTML examples, function/method decoration, memoization, and logging.
- [Pages 12–14](<../../Scalar java backend contents/Structural_Patterns.pdf#page=12>): Builder, immutable `User` example, and `Color` constructor trade-offs.

Bridge, Composite, Facade, Flyweight, and Proxy are listed in the PDF agenda but are not explained in comparable detail there. Their sections above are supplementary learning explanations rather than transcriptions of source examples.
