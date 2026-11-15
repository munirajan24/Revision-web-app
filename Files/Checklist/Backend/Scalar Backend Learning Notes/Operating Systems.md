# Operating Systems

Source: [Operating_Systems_1_Og.pdf](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf>) (25 pages)

This note expands the full topic list in the PDF: what an OS is and why it is needed, CPU power, multiprogramming, multitasking, processes and the PCB, process states, and CPU scheduling algorithms.

## 1. What an operating system does

An **operating system (OS)** is the mediator/interface between applications and computer hardware. Applications request resources and services; the OS manages access to the CPU, RAM, storage, and other devices while providing protection between programs.

The PDF groups the OS's main jobs as:

| OS responsibility | Resource or concern |
|---|---|
| CPU scheduling | Decides which ready process runs and for how long |
| Memory management | Manages RAM used by processes |
| Storage management | Manages secondary storage |
| Security/protection | Restricts and controls access between applications and resources |

### Why is a mediator needed?

The handwritten analogy is a school where several classes want to use the games period at the same time. Without a teacher to coordinate access, the result can be chaotic, resources can be used poorly, and groups can bully or exclude one another. A teacher helps allocate resources fairly and safely.

Similarly, without an OS, applications could compete inefficiently for hardware or interfere with one another. A malicious program could also try to access another application's data. The OS coordinates resource use and enforces protection.

## 2. CPU power, concurrency, and parallelism

The CPU performs instructions using one or more **cores**. A single core can run only one instruction stream at a time, but the OS can switch the core between processes so quickly that several applications appear to run smoothly together.

- **Concurrency:** multiple tasks make progress over overlapping time periods. On one core, the OS commonly achieves this by switching between tasks.
- **Parallelism:** multiple tasks execute at the same instant, typically on different CPU cores.
- **I/O wait:** a process waiting for a disk, network, or other event cannot use the CPU during that wait. The OS can schedule another ready process instead.

The PDF uses a superhero/rescue analogy to discuss tasks, bottlenecks caused by outside events, and why independent activities can make progress concurrently. The computing takeaway is that I/O waits can leave the CPU free to do other work; CPU-bound work, by contrast, continues to need CPU time.

## 3. Multiprogramming, multitasking, and multiprocessing

These terms describe different ways of sharing or using the CPU:

| Term | Meaning | Core requirement |
|---|---|---|
| **Multiprogramming** | Keep multiple processes in RAM. When one process stops using the CPU (for example, while waiting for I/O), schedule another. | Possible on one core |
| **Multitasking / time sharing** | Switch the CPU among processes, usually using time slices, so users can interact with multiple activities. | Possible on one core with pre-emption |
| **Multiprocessing** | Execute processes at the same time on multiple CPU cores. | Requires multiple cores |

The PDF's shorthand is that multiprogramming plus pre-emptive scheduling gives multitasking. A single-core CPU can support multiprogramming and time-sharing, but cannot execute two instruction streams in parallel at the same instant.

### Multiprogramming and its limitation

In the PDF's basic multiprogramming model, a process keeps the CPU until it:

- finishes,
- waits for an I/O operation, or
- stops/crashes.

This makes better use of the CPU while other work is waiting, but it does not by itself guarantee responsiveness. A long-running process can keep the CPU, and a newly arrived high-priority task cannot run immediately if the current process is not pre-empted.

### Time slicing and the Round Robin intuition

The PDF compares four one-second processes:

- In a simple non-pre-emptive run, each process runs for one second in sequence; all four finish after four seconds.
- With **Round Robin** and a 0.1-second quantum, each process gets a turn before the first process finishes. The total CPU work is still about four seconds (ignoring switching overhead), but the system responds and shares CPU time more smoothly.

Time slicing improves responsiveness; it does not make the total CPU work disappear.

### Non-pre-emptive vs. pre-emptive scheduling

- **Non-pre-emptive:** a process leaves the CPU when it finishes, blocks for I/O, or stops. The OS does not interrupt it just because another process arrives.
- **Pre-emptive:** the OS can interrupt a running process—for example, when its time quantum expires or when higher-priority work must run.

The PDF lists the same completion, I/O, and failure/blocking events for either model, and adds **time-slice completion** as an additional pre-emption point.

## 4. Processes and the process control block

A **process** is a program currently under execution—an active program with its own execution state and resources. For example, opening a code editor creates a process.

### Process states

The notes show the usual lifecycle:

```text
New -> Ready -> Running -> Terminated
        ^          |
        |          +---- requests I/O ----> Waiting/Blocked
        |                                      |
        +------------- I/O completes ----------+

Running --pre-empted / time quantum expires--> Ready
```

- **New:** being created.
- **Ready:** able to run, waiting for CPU time.
- **Running:** currently executing on a core.
- **Waiting/Blocked:** waiting for I/O or another event, so it is not ready to use the CPU.
- **Terminated:** finished or stopped.

In the source diagram, the **long-term scheduler (LTS)** admits a new process into the ready state (the notes describe this as loading it into RAM). The **short-term scheduler (STS)** selects a ready process to run on the CPU. A running process can become waiting when it requests I/O; after the I/O completes, it returns to ready. A running process can also terminate.

### Process Control Block (PCB)

A **PCB** is the OS data structure that records the information needed to manage and resume a process. The OS creates a corresponding PCB when it creates a process. The PDF sketches fields such as:

- process state and process number/identifier,
- program counter,
- CPU registers,
- open-file information,
- other information needed to execute and manage the process.

The PCB is maintained by the OS in protected **kernel space**. The kernel contains OS code that manages hardware and process execution.

### Context switching

When the CPU switches from one process to another, the OS saves the current process's execution state in its PCB and restores the next process's saved state. This save-and-restore operation is a **context switch**.

```text
P1 running
  -> save P1 state in PCB(P1)
  -> load saved state from PCB(P2)
  -> P2 running
```

The PDF's walkthrough creates PCBs for P1 and P2 and places both in the ready state. P1 runs, then requests I/O and waits, allowing P2 to run. When P1's I/O completes, P1 becomes ready again. The example then introduces a higher-priority P3: P1 is moved back to ready, P3 runs, and P1 runs afterward. The diagram is a state/scheduling illustration rather than a complete timing trace; it does not give burst lengths. The scheduler uses each process's state and PCB information to decide what to run next. A context switch enables sharing but takes time; it is overhead rather than useful application work.

## 5. CPU scheduling and how to measure it

A **CPU scheduling algorithm** chooses which ready process receives CPU time. The PDF introduces these measures:

| Measure | Meaning / calculation |
|---|---|
| **Arrival time (AT)** | Time a process enters the ready/system workload |
| **Burst time (BT)** | CPU time required for the process's CPU burst |
| **Completion time (CT)** | Time the process finishes |
| **Turnaround time (TAT)** | Total elapsed time from arrival to completion: `CT - AT` |
| **Waiting time (WT)** | Time spent waiting for CPU service; for the single-burst examples, `TAT - BT` |
| **Throughput** | Number of processes completed per unit time |
| **Response time** | Time from arrival until the process first gets CPU service |
| **CPU utilization** | Fraction/percentage of elapsed time the CPU is busy |

For the single CPU-burst exercises in the PDF:

```text
TAT = CT - AT
WT  = TAT - BT
```

Be careful not to confuse **response time** (first service) with **turnaround time** (arrival to completion). Scheduling goals can conflict: a policy that improves response time may increase context switches or average waiting time.

**Source timing example (page 21):** P1 arrives at time `0`. It runs for 5 units, waits for I/O from `5` to `8`, runs for 2 more units, waits from `10` to `12`, then runs for 3 units and completes at `15`.

```text
0       5       8   10      12      15
|running|waiting|run|waiting|running|
```

Thus `BT = 5 + 2 + 3 = 10`, `WT = 3 + 2 = 5`, `CT = 15`, and `TAT = CT - AT = 15`. This example includes I/O waits, so its waiting time is not captured by treating the process as one uninterrupted CPU burst.

## 6. Scheduling algorithms in the PDF

### First Come, First Served (FCFS / FIFO)

- Run processes in arrival order.
- Non-pre-emptive in the example.
- Simple, but a long earlier job can make shorter later jobs wait (the convoy effect).

**Worked example from page 22**

| Process | AT | BT | CT | TAT = CT - AT | WT = TAT - BT |
|---|---:|---:|---:|---:|---:|
| P0 | 1 | 5 | 6 | 5 | 0 |
| P1 | 2 | 3 | 9 | 7 | 4 |
| P2 | 2 | 8 | 17 | 15 | 7 |
| P3 | 3 | 6 | 23 | 20 | 14 |

```text
0    1       6    9          17       23
|Idle|  P0   | P1 |    P2    |   P3   |
```

Average waiting time: `(0 + 4 + 7 + 14) / 4 = 6.5`.

### Shortest Job First (SJF)

- Choose the available process with the smallest CPU burst.
- The PDF's example is non-pre-emptive: once selected, a process runs to completion or until it blocks.
- It can reduce average waiting time when burst lengths are known, but the next CPU burst is generally not known exactly in advance. The notes flag this as a problem for interactive systems.

**Worked example from page 23**

| Process | AT | BT | CT | TAT | WT |
|---|---:|---:|---:|---:|---:|
| P0 | 1 | 5 | 9 | 8 | 3 |
| P1 | 1 | 3 | 4 | 3 | 0 |
| P2 | 2 | 8 | 23 | 21 | 13 |
| P3 | 3 | 6 | 15 | 12 | 6 |

```text
0    1    4       9          15          23
|Idle| P1 |  P0   |    P3    |     P2    |
```

Average waiting time: `(3 + 0 + 13 + 6) / 4 = 5.5`.

### Round Robin (RR)

- Pre-emptive scheduling: each ready process receives a fixed **time quantum**.
- If unfinished when its quantum expires, it goes to the back of the ready queue.
- A smaller quantum can improve responsiveness, but very small quanta increase context-switch overhead.

**Worked example from page 24:** quantum `3`, with the Gantt sequence shown in the source:

```text
0    1       4    7    10   13   15   18   21   23
|Idle|  P0   | P1 | P2 | P3 | P0 | P2 | P3 | P2 |
```

Reading the timeline gives completion times P0=15, P1=7, P2=23, P3=21. The source writes an average waiting time of `37/4 = 9.25`, but that total does not agree with the shown timeline and process bursts (P0=5, P1=3, P2=8, P3=6): using `WT = CT - AT - BT` gives 9, 2, 13, and 12, for an average of `36/4 = 9`. Treat the handwritten average as an arithmetic inconsistency and verify the original example if your class uses different arrival/burst assumptions.

## 7. Choosing a policy

The final page summarizes the classroom rule of thumb:

- **Complete a small task list / FIFO:** FCFS.
- **Reduce waiting when burst time is known:** SJF.
- **Keep a long-running process from monopolizing the CPU / improve response:** Round Robin.

These are trade-offs, not universal rules. For real workloads, consider fairness, priorities, I/O behavior, response targets, throughput, and context-switch cost.

## Page-by-page source guide

- [Topic outline and OS responsibilities (pages 1–5)](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf#page=1>)
- [Resource-sharing analogy, CPU power, and multiprogramming (pages 6–10)](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf#page=6>)
- [Multitasking, pre-emption, and multiprocessing (pages 11–14)](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf#page=11>)
- [PCB, kernel space, process states, and context-switch walkthrough (pages 15–18)](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf#page=15>)
- [Scheduling measures and formula examples (pages 19–21)](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf#page=19>)
- [FCFS, SJF, Round Robin worked timelines, and policy summary (pages 22–25)](<../../Scalar java backend contents/Operating_Systems_1_Og.pdf#page=22>)

The handwritten pages contain additional diagrams and labels. Use the linked pages to check the original drawings and any lecture-specific assumptions.

## Quick self-check

1. What hardware resources does an OS manage, and why is protection needed?
2. How can one core support multitasking without executing two processes in parallel?
3. What event moves a process from running to waiting? What can move it back to ready?
4. What information does a PCB preserve during a context switch?
5. Given `AT`, `BT`, and `CT`, calculate `TAT` and `WT`.
6. Why can FCFS have a long average wait? Why is SJF difficult to use exactly?
7. What changes when Round Robin's time quantum is made smaller?
