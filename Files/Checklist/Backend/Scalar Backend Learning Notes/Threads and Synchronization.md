# Threads and Synchronization

Source: [Threads_2.pdf](<../../Scalar java backend contents/Threads_2.pdf>) (27 pages)

## What you will learn

- How threads differ from processes and what they share.
- Why concurrency can corrupt shared data, even when each individual operation seems simple.
- What a critical section is and which properties a correct solution should provide.
- How Peterson's algorithm, test-and-set locks, and semaphores coordinate access.
- How starvation differs from deadlock, and how systems prevent, avoid, detect, or handle deadlocks.

## 1. Processes and threads

A **process** is a running program with its own address space and resources. A **thread** is an execution path inside a process. A process can contain one or more threads.

| Resource/state | Separate processes | Threads in one process |
|---|---|---|
| Code, data, and open files | Generally separate | Shared |
| Thread ID | Each thread has its own | Each thread has its own |
| Program counter and registers | Each execution context has its own | Each thread has its own |
| Stack | Each execution context has its own | Each thread has its own |
| Context switch | Usually more state to switch | Often less state to switch between threads in the same process |

The OS keeps process-level information in a **process control block (PCB)** and per-thread execution information in a **thread control block (TCB)**. The source diagrams show each thread with its own ID, program counter, registers, and stack, while the threads of one process share code, data, and files ([pages 5–6](<../../Scalar java backend contents/Threads_2.pdf#page=5>)).

### Why use multiple threads?

The source gives examples such as a browser downloading content while displaying pages, and a code editor checking syntax or saving while a person continues editing. Multithreading can provide:

1. **Responsiveness:** a slow or background task need not freeze all user-facing work.
2. **Resource sharing:** threads can use the same process data and open files.
3. **Economy:** creating and switching between threads of one process is generally less costly than managing separate processes.
4. **Scalability:** on a multiprocessor system, independent threads can run on different cores, increasing concurrency and potentially throughput.

Sharing data is convenient, but also means that multiple threads can access and modify the same state. Those accesses must be coordinated.

## 2. Producer/consumer and the race condition

A **producer** creates data and a **consumer** uses it. The source illustrates a compiler producing assembler code for an assembler, and a web server producing pages for a client. They communicate through shared memory or another shared buffer ([page 9](<../../Scalar java backend contents/Threads_2.pdf#page=9>)).

A **race condition** occurs when concurrent operations access shared state and the result depends on their timing or interleaving. An operation that looks like one assignment may actually consist of separate steps: read a value, compute a new value, and write it back.

### Lost-update example

Suppose a shared counter starts at `5`. A producer increments it while a consumer decrements it. If the operations were properly coordinated, the final value would still be `5`. Without coordination, this interleaving is possible:

| Step | Thread | Operation | Local value / shared counter |
|---:|---|---|---:|
| 1 | Producer | Reads counter | Producer has `5` |
| 2 | Producer | Adds one locally | Producer has `6` |
| 3 | Consumer | Reads the still-unmodified counter | Consumer has `5` |
| 4 | Consumer | Subtracts one locally | Consumer has `4` |
| 5 | Producer | Writes its result | Counter becomes `6` |
| 6 | Consumer | Writes its result | Counter becomes `4` |

The final value is `4`, not `5`: one update was lost. Reversing the last two writes could instead leave `6`. This is why shared data must be protected as a complete critical operation, not just considered safe because each individual read or write is simple. The source traces this interleaving and identifies the result as a race condition on [pages 10–11](<../../Scalar java backend contents/Threads_2.pdf#page=10>).

## 3. Critical sections

A **critical section** is the part of a program that accesses shared state and must not run concurrently with another conflicting access. A process/thread's repeated execution can be organized into:

```text
Entry section -> [Critical section] -> Exit section -> Remainder section
```

- **Entry section:** requests permission to enter.
- **Critical section:** reads or changes the shared resource.
- **Exit section:** releases permission or the lock.
- **Remainder section:** work that does not need that protected resource.

The source describes the goal as allowing only one process into the critical section at a time and requiring a process to obtain permission before entering ([page 12](<../../Scalar java backend contents/Threads_2.pdf#page=12>)).

A correct critical-section solution aims to satisfy:

1. **Mutual exclusion:** at most one participant is in the critical section at a time.
2. **Progress:** if the critical section is free and participants want to enter, selection of the next entrant is not postponed indefinitely by processes that are not trying to enter.
3. **Bounded waiting:** after a participant requests entry, there is a bound on how many times others can enter before it gets its turn. This prevents indefinite postponement.

These are separate properties. A lock may guarantee mutual exclusion yet still fail to guarantee bounded waiting.

## 4. Peterson's algorithm

Peterson's algorithm is a classic **software** solution for two processes, `P0` and `P1`. It uses:

- `flag[i]`: `true` when process `i` wants to enter.
- `turn`: indicates which process should yield if both want to enter.

For process `i`, let `j` be the other process:

```text
do {
    flag[i] = true;       // I want to enter
    turn = j;             // Let the other process go first if it also wants in
    while (flag[j] && turn == j) {
        ;                 // wait
    }

    // critical section

    flag[i] = false;      // I am leaving

    // remainder section
} while (true);
```

If both processes request entry together, each raises its flag, and `turn` breaks the tie. When one leaves, it clears its flag so the other can proceed. In the classic model, this gives mutual exclusion, progress, and bounded waiting for two participants.

**Limitations:** the source presents Peterson's as a classic software-based, two-process solution and warns that it may not work as expected on modern computers. The algorithm is mainly useful for understanding synchronization; real implementations rely on hardware-supported atomic operations and memory-ordering guarantees. See the [variables and two-process trace on pages 13–15](<../../Scalar java backend contents/Threads_2.pdf#page=13>).

## 5. Hardware atomic operations: test-and-set

An **atomic operation** completes as one indivisible operation: another processor cannot interrupt it halfway through. The source introduces the hardware `TestAndSet` operation:

```text
boolean TestAndSet(boolean *target) {
    boolean old = *target;
    *target = true;
    return old;
}
```

The read of the old value and the write of `true` must be atomic. Otherwise, two threads could both observe an unlocked value and both enter.

A basic spin lock can use it like this:

```text
lock = false

do {
    while (TestAndSet(&lock)) {
        ;                       // spin while another thread holds the lock
    }

    // critical section

    lock = false;               // release the lock

    // remainder section
} while (true);
```

When the lock is free, one thread atomically changes it to `true` and enters. A second thread sees that it was already `true` and keeps retrying. This retry loop is **busy waiting** (or spinning): it consumes CPU cycles while waiting.

The source's basic test-and-set solution is marked as providing mutual exclusion and progress, but not bounded waiting. A thread may repeatedly lose the race to reacquire the lock. See [pages 16–18](<../../Scalar java backend contents/Threads_2.pdf#page=16>).

## 6. Semaphores

A **semaphore** is a synchronization primitive with an integer-like value, accessed through atomic operations:

- `wait(S)` (also called `P` or acquire) requests a resource/decrements the available count.
- `signal(S)` (also called `V` or release) returns a resource/increments the count.

Conceptually, a simple busy-waiting version is:

```text
wait(S):
    while S <= 0:
        ;                   // spin until a resource is available
    S = S - 1

signal(S):
    S = S + 1
```

In a real semaphore, the check-and-decrement and increment must be atomic; this pseudocode describes the behavior, not a safe implementation using ordinary unsynchronized reads and writes.

For mutual exclusion, initialize a binary semaphore to `1`, call `wait` before the critical section, and call `signal` when leaving:

```text
semaphore mutex = 1

wait(mutex)
// critical section
signal(mutex)
```

### Binary and counting semaphores

| Kind | Value/use |
|---|---|
| Binary semaphore | Has two states, `0` and `1`; can protect a single mutually exclusive resource |
| Counting semaphore | Can represent multiple available instances of a resource; initialize it to the number available |

The source calls the binary semaphore a **mutex lock**, and describes a counting semaphore as useful when controlling a resource with multiple instances ([page 21](<../../Scalar java backend contents/Threads_2.pdf#page=21>)).

### Busy waiting vs. blocking

The source points out that spinning wastes CPU cycles. One alternative is to **block** a thread that cannot proceed and place it on a waiting queue. The OS wakes it when the resource becomes available. Blocking avoids consuming a CPU continuously, although scheduling and context switching have their own cost. The semaphore's wait/signal outline is on [pages 19–22](<../../Scalar java backend contents/Threads_2.pdf#page=19>).

## 7. Starvation and deadlock

- **Starvation** means a process/thread waits indefinitely because others keep getting the resource or service first.
- **Deadlock** means a group of processes/threads is stuck waiting for events or resources that only members of that same waiting group can provide.

The source illustrates the distinction using two semaphores, `S` and `Q`: if `P1` waits on `S` and then `Q`, while `P2` waits on `Q` and then `S`, each may acquire its first semaphore and then wait forever for the second. Neither can reach the corresponding `signal` operation. This can create a circular wait and deadlock ([page 24](<../../Scalar java backend contents/Threads_2.pdf#page=24>)).

## 8. Necessary conditions for deadlock

The classic four necessary conditions are:

1. **Mutual exclusion:** at least one resource can be used by only one process at a time.
2. **Hold and wait:** a process holds one or more resources while requesting additional resources.
3. **No pre-emption:** a resource cannot simply be taken away; the holder releases it voluntarily.
4. **Circular wait:** there is a cycle of processes, each waiting for a resource held by the next process in the cycle.

If any one of these conditions is prevented, deadlock cannot arise through this mechanism. The resource-allocation diagrams on [page 25](<../../Scalar java backend contents/Threads_2.pdf#page=25>) show processes, resources, and a circular wait.

```text
P1 holds R1 and waits for R2
P2 holds R2 and waits for R1
```

## 9. Deadlock-handling strategies

The source outlines four approaches ([pages 26–27](<../../Scalar java backend contents/Threads_2.pdf#page=26>)):

1. **Ignore the problem:** accept the risk if deadlocks are considered sufficiently rare and recovery cost is acceptable. The source mentions this as the approach used in general-purpose operating systems such as Windows or Linux; it is a trade-off, not a guarantee that deadlock cannot happen.
2. **Prevention:** design resource rules so at least one necessary deadlock condition cannot hold. For example, impose a global order for acquiring locks to prevent circular wait.
3. **Avoidance:** before granting a request, check that the resulting allocation leaves the system in a **safe state**—one in which processes could still finish in some order. The source names the **Banker's algorithm** as an example.
4. **Detection and recovery:** allow deadlocks to occur, detect them, then recover—for example by terminating a process or reclaiming resources where safe.

Prevention and avoidance are different: prevention rules out a necessary condition by design, while avoidance evaluates resource requests and grants only those that keep the system safe.

The final page specifically says to detect a deadlock and then remove it. Its accompanying diagram also labels RAM and kernel space and points to boot-up information, a master process, system calls, and PCBs. These are labels in the source rather than a fully explained sequence, so use the [original page 27](<../../Scalar java backend contents/Threads_2.pdf#page=27>) to inspect the diagram.

## Quick self-check

1. Which state does each thread keep for itself, and which state is shared by threads in the same process?
2. How can a producer's increment and a consumer's decrement lose an update?
3. Name the four regions of the critical-section program structure.
4. State mutual exclusion, progress, and bounded waiting in your own words.
5. Why does Peterson's algorithm use both `flag` and `turn`, and what limits its practical use?
6. What makes test-and-set atomic? What is the drawback of a spin lock?
7. How do binary and counting semaphores differ?
8. How is blocking different from busy waiting?
9. How do starvation and deadlock differ?
10. Name the four necessary deadlock conditions and explain one prevention or avoidance strategy.

## Source page guide

- [Pages 2–7](<../../Scalar java backend contents/Threads_2.pdf#page=2>): multithreading examples, process/thread comparison, thread state, and benefits.
- [Pages 8–11](<../../Scalar java backend contents/Threads_2.pdf#page=8>): process synchronization, producer/consumer, shared memory, and the counter race.
- [Pages 12–15](<../../Scalar java backend contents/Threads_2.pdf#page=12>): critical-section problem and Peterson's solution.
- [Pages 16–18](<../../Scalar java backend contents/Threads_2.pdf#page=16>): atomic test-and-set and the spin-lock example.
- [Pages 19–22](<../../Scalar java backend contents/Threads_2.pdf#page=19>): semaphore operations, binary/counting semaphores, and blocking instead of busy waiting.
- [Pages 23–27](<../../Scalar java backend contents/Threads_2.pdf#page=23>): deadlock, starvation, necessary conditions, handling strategies, and recovery.
