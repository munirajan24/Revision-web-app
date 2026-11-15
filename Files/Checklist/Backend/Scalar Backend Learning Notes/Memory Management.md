# Memory Management

Source: [Note_12_Mar_2022_Copy__2_.pdf](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf>) (26 pages)

## What you will learn

- Why an operating system allocates and reclaims memory as processes run.
- How fixed and dynamic contiguous allocation differ.
- How internal and external fragmentation waste otherwise useful memory.
- How paging maps a process's virtual pages to physical memory frames.
- How FIFO, Optimal, and LRU page-replacement policies work.

## 1. Memory allocation is part of multiprogramming

More than one process may need to stay in RAM so the operating system can switch the CPU between them. The OS allocates memory when a process is admitted, then reclaims that memory when the process finishes. The opening example shows processes being loaded into RAM and a completed process's memory being deallocated.

The amount and placement of free RAM matter: a process can be unable to load even when the sum of free spaces looks large enough, if no usable contiguous block is available.

## 2. Storage hierarchy

The source compares storage used by the CPU:

| Storage | Relative speed and capacity |
|---|---|
| Registers | Smallest and fastest |
| Cache | Very fast, close to the CPU |
| RAM | Larger, but slower than registers/cache; holds active programs and data |
| Secondary storage (HDD/SSD) | Much larger and persistent, but slower than RAM |

In general, faster storage costs more per unit of capacity. See the [storage hierarchy diagram on page 4](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=4>).

## 3. Contiguous memory allocation

With contiguous allocation, each process occupies one continuous region of RAM. The process is not split into pieces.

### 3.1 Fixed partitioning

RAM is divided into a fixed number of partitions before processes are placed in memory. The source's example uses partitions of different sizes.

- A partition holds at most one process at a time.
- A process must fit in one partition; it cannot span multiple partitions.
- The number of resident processes is therefore limited by the number of usable partitions.
- If the assigned partition is larger than the process, the unused space inside that allocated partition is **internal fragmentation**.
- If no single free partition is large enough, a process may not fit even though the total free space across separate regions is sufficient. The source labels this situation **external fragmentation**.

For example, if a process needs 3 MB but the free space is split into smaller gaps, adding those gaps together does not create one 3 MB partition. The fixed-partition and fragmentation examples are on [pages 6–10](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=6>).

### 3.2 Dynamic partitioning

In dynamic partitioning, RAM is not split into process partitions in advance. When a process arrives, the OS finds a free contiguous region large enough for it; when the process exits, that region becomes free again.

- The region can be sized to the process, so this avoids the unused *inside-a-larger-partition* space illustrated by fixed partitioning.
- Processes are still contiguous and cannot be broken apart.
- Allocation and deallocation happen at run time, so the OS must search for suitable free space.
- As processes start and finish, free regions can become separated by allocated regions. This is **external fragmentation**: the total free space may be sufficient, but no single free region is large enough.

The source demonstrates this with a new process that cannot fit into separated holes after earlier processes leave RAM. Dynamic allocation removes the fixed partition-count limit, but it does not remove external fragmentation. See [pages 11–15](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=11>).

### Internal vs. external fragmentation

| Type | Where the waste is | Example |
|---|---|---|
| Internal | Inside a region already allocated to a process | A 2 MB process occupies a 4 MB partition; 2 MB inside that partition is unused |
| External | Between allocated regions, in separate free holes | Several free holes add up to 15 MB, but a 10 MB process cannot fit in any one hole |

The source uses the term *external fragmentation* for both the separated-hole problem in dynamic allocation and an example where free partition space is split into blocks. The key distinction is whether the wasted space is inside an allocated block or outside it in separated free blocks.

## 4. Non-contiguous allocation: paging

Paging lets a process use physical memory that is not all in one continuous region.

1. Divide a process's virtual address space into fixed-size **pages**.
2. Divide RAM into equal-size **frames**.
3. Keep pages and frames the same size, so any page can fit into any frame.
4. Load each page into an available frame; one process's pages may occupy different, non-adjacent frames.

The source identifies 4 KB as a common page size and also shows 8 KB in its notes. The exact size is a system choice; the important requirement for this explanation is that pages and frames match.

### Page tables and address translation

Each process has its own **page table**. It maps a virtual page number to the physical frame currently holding that page. The offset within the page stays the same during translation:

```text
Virtual address = page number + offset
                       |
                       v
                 process page table
                       |
                       v
Physical address = frame number + same offset
```

For example, a process's pages might be placed like this:

```text
Process pages          Page table          Non-adjacent RAM frames
Page 0 --------------> Frame 4 ----------> Frame 4 contains Page 0
Page 1 --------------> Frame 1 ----------> Frame 1 contains Page 1
Page 2 --------------> Frame 7 ----------> Frame 7 contains Page 2
```

The page table records the mapping; it is not the page contents themselves. The CPU uses the process's mapping to find the frame for the requested page. The source illustrates a process split into pages and placed in separate RAM frames on [pages 17–20](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=17>).

The notes also connect this mapping to a process switch: if a higher-priority process interrupts the current one, the OS saves its execution state in its PCB and uses the incoming process's own page-table mapping. See [pages 20–21](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=20>).

## 5. Page faults and replacement

A **page fault** occurs when a process requests a page that is not currently in RAM. The OS must load that page. If there is no free frame, it chooses a resident page to evict; this choice is made by a **page-replacement policy**.

To work a reference-string example:

1. Start with all frames empty.
2. Read the page references from left to right.
3. If the requested page is already in a frame, record a **hit**.
4. Otherwise, record a **fault**. Use an empty frame if available; once full, choose a victim according to the policy.
5. Count faults and hits. A fault after all frames are occupied causes a replacement.

The handwritten examples use three frames.

### FIFO (First In, First Out)

FIFO evicts the page that has been in memory the longest, regardless of how recently it was used.

The source uses the reference string `1, 5, 6, 4, 5, 6, 1, 4`:

| Reference | Frames after reference | Result |
|---:|:---:|:---:|
| 1 | 1, –, – | Fault |
| 5 | 1, 5, – | Fault |
| 6 | 1, 5, 6 | Fault |
| 4 | 4, 5, 6 | Fault; evict 1 |
| 5 | 4, 5, 6 | Hit |
| 6 | 4, 5, 6 | Hit |
| 1 | 4, 1, 6 | Fault; evict 5 |
| 4 | 4, 1, 6 | Hit |

**Result: 5 faults and 3 hits.** This is the source's example on [page 24](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=24>).

### Optimal (OPT)

OPT evicts the page whose next use is farthest in the future (or that will never be used again). It is a useful theoretical benchmark, but a real OS generally cannot know future references exactly.

For `1, 5, 6, 4, 1, 7, 1, 6`:

| Reference | Frames after reference | Result |
|---:|:---:|:---:|
| 1 | 1, –, – | Fault |
| 5 | 1, 5, – | Fault |
| 6 | 1, 5, 6 | Fault |
| 4 | 1, 4, 6 | Fault; evict 5 (not used again) |
| 1 | 1, 4, 6 | Hit |
| 7 | 1, 7, 6 | Fault; evict 4 (not used again) |
| 1 | 1, 7, 6 | Hit |
| 6 | 1, 7, 6 | Hit |

**Result: 5 faults and 3 hits**, matching the example on [page 25](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=25>).

### LRU (Least Recently Used)

LRU evicts the page whose most recent use was farthest in the past.

For the same reference string, `1, 5, 6, 4, 1, 7, 1, 6`:

| Reference | Frames after reference | Result |
|---:|:---:|:---:|
| 1 | 1, –, – | Fault |
| 5 | 1, 5, – | Fault |
| 6 | 1, 5, 6 | Fault |
| 4 | 4, 5, 6 | Fault; evict 1 |
| 1 | 4, 1, 6 | Fault; evict 5 |
| 7 | 4, 1, 7 | Fault; evict 6 |
| 1 | 4, 1, 7 | Hit |
| 6 | 6, 1, 7 | Fault; evict 4 |

**Result: 7 faults and 1 hit**, as recorded on [page 26](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=26>).

### Compare the policies

| Policy | Replacement rule | What to remember |
|---|---|---|
| FIFO | Oldest-loaded page | Simple; does not consider how often or recently a page is used |
| OPT | Page used farthest in the future | Best theoretical comparison; future references are not known in advance |
| LRU | Least recently used page | Uses past recency as a practical clue about near-future use |

Fault counts depend on the reference string, number of frames, and replacement rule. Do not compare counts from different strings as if they were the same experiment: the source's FIFO example uses a different string from its OPT and LRU examples.

## Quick self-check

1. Why can a process fail to fit even when the total free memory is large enough?
2. Which type of fragmentation occurs inside an allocated partition? Which occurs in separated free holes?
3. What is the main difference between fixed and dynamic partitioning?
4. Why does paging allow a process to occupy non-adjacent physical memory?
5. What does a process's page table map, and what happens to the offset during translation?
6. When does a page fault require page replacement?
7. Which policy uses future knowledge as a benchmark? Which uses recency in the past?
8. Why can two replacement examples have different fault counts even when they use the same policy?

## Source page guide

- [Pages 2–5](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=2>): multiprogramming, allocation/deallocation, and storage hierarchy.
- [Pages 6–10](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=6>): fixed partitions and fragmentation examples.
- [Pages 11–15](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=11>): dynamic partitions, allocation/deallocation, and external fragmentation.
- [Pages 16–21](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=16>): non-contiguous allocation, pages, frames, page tables, and process switching.
- [Pages 23–26](<../../Scalar java backend contents/Note_12_Mar_2022_Copy__2_.pdf#page=23>): page replacement and the worked FIFO, OPT, and LRU traces.
