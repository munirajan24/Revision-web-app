# Concurrency: Locks and Atomic Data Types

Source: [Lla_concurrency3.pdf](<../../Scalar java backend contents/Lla_concurrency3.pdf>) (21 pages)

## What you will learn

- Why concurrent access to shared mutable data needs coordination.
- How Java intrinsic synchronization and explicit locks protect critical sections.
- What `volatile` and atomic data types do—and what they do not do.
- When a concurrent map, distributed cache, or producer-consumer queue is appropriate.

## 1. The concurrency problem

Two or more threads can run at overlapping times. If they access independent data, they may proceed without coordinating. If they read and change the same **mutable shared data**, their operations can interleave and produce a result that neither thread intended.

Consider two threads incrementing a shared counter that starts at `0`. The operation `value += 1` is a read, calculation, and write; it is not necessarily one indivisible operation:

```text
Thread A: read 0 ---- add 1 ---- write 1
Thread B:      read 0 ---- add 1 ---- write 1

Expected after both increments: 2
Possible result without coordination: 1
```

This is a **race condition** (specifically, a lost update). The code needs to protect the complete state change, not merely the individual read or write. The source illustrates the counter interleaving and asks why shared data must be handled carefully on [pages 12–13](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=12>).

## 2. Synchronization choices in the source

The source groups its options into:

- Java's `synchronized` methods or blocks.
- Explicit locks, including a reentrant lock and a read/write lock.
- Semaphores.
- `volatile`.
- Concurrent data structures, including atomic integers and concurrent hash maps.

These tools solve related but different problems. Choose the simplest one that protects the invariant you need.

## 3. Java intrinsic synchronization

The Java `synchronized` keyword uses an object's **intrinsic lock**, also called its monitor. Only one thread at a time can hold a given monitor. A thread entering a synchronized region must acquire the monitor; it releases it when it exits the region, including when the block exits because of an exception.

### Synchronized instance method

```java
public synchronized void increment() {
    count++;
}
```

This acquires the monitor of the current object (`this`). Synchronized instance methods on the **same object** exclude one another; methods on different objects use different monitors.

### Synchronized block

```java
public void update() {
    synchronized (lock) {
        // access state guarded by lock
    }
}
```

A block lets you choose the monitor explicitly and keep the critical section small. All code that accesses the guarded invariant must use the same lock consistently.

### Synchronized static method

A `static synchronized` method locks the `Class` object, not an individual instance. It therefore coordinates calls using that class monitor, regardless of which instance the caller holds.

The source diagrams contrast the object monitor and class monitor, and show a small synchronized region around shared work ([pages 4–9](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=4>)).

### Keep locking disciplined

- Protect the whole invariant or read-modify-write operation.
- Keep synchronized work focused; long critical sections block other contenders and can reduce throughput.
- Do not assume locking one instance protects shared static data or state accessed through another lock.
- Avoid acquiring multiple locks in inconsistent orders. If one thread takes lock A then B while another takes B then A, both can wait indefinitely. Establish a consistent lock order when several locks are required; the source illustrates ordering access to two objects on [pages 10–12](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=10>).

## 4. Explicit locks

An explicit lock provides acquire/release operations around a critical section. For example, Java's `ReentrantLock` can be used as follows:

```java
lock.lock();
try {
    // critical section
} finally {
    lock.unlock();
}
```

The `finally` block is essential: it releases the lock even if the protected code throws. Unlike a synchronized block, explicit locks provide additional operations such as timed or interruptible acquisition, but require careful release by the code that acquired them.

### Read/write locks

A **read/write lock** allows multiple readers at once, but a writer needs exclusive access. It can help when reads are frequent and writes are uncommon, but it adds complexity and can be slower than a simple lock for some workloads. Consider fairness and the possibility of reader or writer starvation when selecting an implementation.

## 5. `volatile`: visibility, not compound atomicity

The source lists `volatile` as a synchronization tool. In Java, a volatile field provides visibility and ordering guarantees: a thread that reads the field observes a value written by another thread under the Java Memory Model's volatile rules.

`volatile` does **not** make a compound operation such as `count++` atomic. Two threads can still read the same old value and overwrite each other's increments. Use a lock or an atomic type when the operation must be indivisible.

## 6. Atomic data types

Atomic classes such as `AtomicInteger` provide thread-safe operations on a single value without a separately managed lock for those operations:

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

The increment is atomic, so concurrent increments do not overwrite each other. Atomic values are useful for counters, flags, and other simple state transitions.

An atomic variable does not make a larger multi-step operation atomic. For example, checking one field, updating another field, and then changing a counter may need a lock if those changes must happen together. An atomic operation also does not by itself protect invariants across multiple objects.

The source demonstrates repeated increment attempts against shared state, contrasting an ordinary update with an atomic update ([pages 13–17](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=13>)).

## 7. Concurrent collections and distributed state

### Concurrent hash map

A concurrent hash map is designed for concurrent reads and updates to a shared map. Use the collection's documented atomic operations for the operation you need. A sequence such as “check whether a key exists, then insert or update it” may still need an atomic map method or additional coordination; thread-safe individual operations do not make an arbitrary sequence atomic.

### Distributed cache is a different boundary

A local lock or concurrent map coordinates threads within one application process. It does not coordinate multiple server instances, because each process has its own memory and locks. Shared cross-instance state requires a distributed data/coordination approach, such as a suitable shared cache or service, with its own consistency and failure considerations.

The source names concurrent maps and distributed caches together in its shared-data discussion; these are not interchangeable. See [pages 2–3 and 14–19](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=14>).

## 8. Producer-consumer pattern

A **producer** creates work and places it into a shared buffer; a **consumer** takes work from that buffer and processes it. The source treats producers and consumers as separate threads and calls out the two rules for a bounded buffer:

- A producer must not add an item when the buffer is full.
- A consumer must not remove an item when the buffer is empty.

```text
Producer thread(s) -> [shared, bounded work queue] -> Consumer thread(s)
      wait if full                                  wait if empty
```

A blocking queue or equivalent coordination primitive can enforce those rules and put waiting threads to sleep instead of making them poll continuously. See [pages 20–21](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=20>).

## 9. Choosing a primitive

| Need | Consider |
|---|---|
| Protect a group of related operations or an invariant | `synchronized` or an explicit lock |
| Allow many readers but exclusive writers | A read/write lock, if the workload justifies it |
| Publish a simple value change with visibility guarantees | `volatile` |
| Perform atomic operations on one simple value | An atomic type such as `AtomicInteger` |
| Concurrent access to key/value data within one process | A concurrent map |
| Coordinate work through a bounded producer-consumer buffer | A blocking queue |
| Share state across application instances | A distributed data or coordination design |

If several changes must succeed or fail together, an atomic field or thread-safe collection alone may not be enough. Protect the whole invariant at the layer that owns it.

## Quick self-check

1. Why can two increments of a shared ordinary integer produce a result of only one increment?
2. Which monitor does a synchronized instance method lock? Which monitor does a static synchronized method lock?
3. Why should a synchronized region be kept focused?
4. What can happen if threads acquire the same two locks in opposite orders?
5. What does `volatile` guarantee, and why is it not sufficient for `count++`?
6. What operations are atomic on an atomic integer, and what kind of larger invariant might still require a lock?
7. Why is a local lock insufficient for coordinating separate application instances?
8. What should happen when a producer reaches a full bounded queue or a consumer reaches an empty one?

## Source page guide

- [Pages 1–4](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=1>): synchronization options and the ordinary shared-counter problem.
- [Pages 5–12](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=5>): intrinsic locks, synchronized sections, explicit lock examples, and consistent lock ordering.
- [Pages 13–17](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=13>): shared counter interleavings, atomic data types, and concurrent collection diagrams.
- [Pages 18–19](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=18>): concurrent data structures and cache examples.
- [Pages 20–21](<../../Scalar java backend contents/Lla_concurrency3.pdf#page=20>): producer and consumer threads and bounded-buffer rules.

The scan is handwritten. Use the page references to check its diagrams and original examples where labels are difficult to read.
