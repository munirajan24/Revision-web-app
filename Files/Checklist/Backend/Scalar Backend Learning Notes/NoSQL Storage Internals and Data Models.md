# NoSQL Storage Internals and Data Models

Source: [NO_____52.pdf](<../../Scalar java backend contents/NO_____52.pdf>) (18 pages)

The handwritten pages move from read/write workload and schema choices to internal storage, LSM trees and SSTables, then key-value, column-family, and document models. The scan is difficult to OCR; this note explains the concepts and labels the original sketches separately from supplementary details.

## 1. Begin with the workload

Database performance depends on the operations an application performs:

- Are writes frequent, or are reads dominant?
- Are reads point lookups, range scans, or queries over several fields?
- Are records updated in place, appended as new versions, or deleted?
- How much data must fit on one machine or partition?
- What consistency, durability, and transaction guarantees are required?

NoSQL is a family of models and implementations, not one storage design. Some systems use log-structured storage; others use different layouts. The sections below focus on the LSM/SSTable sketches in the source.

## 2. Log-Structured Merge (LSM) storage

An LSM-style engine often batches writes in memory, then flushes sorted, immutable files to disk.

```text
write request
    -> write-ahead log (WAL)
    -> in-memory table (memtable)
    -> flush when full
    -> immutable sorted files (SSTables)
    -> background compaction
```

### Write path

1. **Write-ahead log:** append the change to a durable sequential log so it can be recovered after a crash. A system may acknowledge a write after the relevant durability condition is met.
2. **Memtable:** apply the change to an in-memory ordered structure.
3. **Flush:** when the memtable reaches a threshold, write its sorted contents as an immutable **SSTable**.
4. **New active memtable:** continue accepting writes into another in-memory table while the older file remains readable.

Writing sequentially and buffering changes can make write-heavy workloads efficient. The WAL and memtable serve different purposes: the WAL supports recovery; the memtable supports recent reads and batches data for sorted disk output.

### Read path

A point lookup may check:

1. The active memtable.
2. Any immutable in-memory tables not yet flushed.
3. Relevant SSTables on disk, usually searching newer data before older data.

An index helps locate candidate keys in an SSTable. A **Bloom filter** can indicate that a key is definitely absent from a file, or may be present; it can reduce unnecessary disk reads but a “maybe” still requires checking.

As the number of files grows, reads may need to consult more places. Caches, indexes, Bloom filters, and compaction help manage this work.

## 3. Updates, deletes, and compaction

Because SSTables are immutable, an update is commonly written as a newer value for the same key. The newest visible version wins according to the engine's ordering rules.

A delete is often represented by a **tombstone** rather than immediately erasing the key from every old file. The tombstone hides older values during reads. It can be removed only when compaction and replication rules ensure that no older copy can reappear.

**Compaction** merges SSTables:

- Combine sorted files and discard superseded values when safe.
- Remove obsolete tombstones when all relevant older values are accounted for.
- Reorganize data to reduce the number of files a read checks.

Compaction consumes disk bandwidth, CPU, and temporary storage. If it cannot keep up with incoming writes, files can accumulate and affect latency and space usage. The exact compaction strategy and guarantees vary by database.

## 4. Amplification trade-offs

LSM systems trade work among reads, writes, and space:

- **Read amplification:** one lookup may inspect multiple memtables/files.
- **Write amplification:** one logical update may be written again as files are compacted.
- **Space amplification:** old and new copies can coexist until compaction removes obsolete data.

These are useful ways to reason about the storage path, not fixed performance numbers. The source's complexity annotations are not fully legible; measure the actual database and workload rather than treating a sketch as a guarantee.

## 5. NoSQL data models

### Key-value

Store a value by a key:

```text
put("user:42", value)
get("user:42")
```

This is simple and efficient for known-key access. The application generally needs to know the key; arbitrary queries inside values may be limited or require a different index/model. The source names Redis as an example.

### Wide-column / column-family

Rows are organized by a partition key and can contain grouped or sparse columns. The schema and partition key should fit the queries the service needs. For example, a conversation service might keep a conversation's messages together so it can fetch recent messages by conversation and time.

This model does not mean that columns are independently stored as in a basic spreadsheet. Distribution, partitioning, sort order, and supported queries depend on the particular database. The source names Cassandra and sketches message/profile-like data.

### Document

Store a structured record, often JSON-like, with fields that can vary between records:

```json
{
  "type": "car",
  "model": "City",
  "brand": "Honda"
}
```

Documents can keep data commonly read together in one record. Flexible fields do not remove the need for data validation or schema evolution. Cross-document joins, transactions, and indexes depend on the database.

### Relational systems as a contrast

Relational models emphasize tables, explicit relationships, constraints, and SQL. NoSQL models often make partition keys and query-specific data layouts more visible. Neither category eliminates schema design: the application still decides which data goes together and how it is retrieved.

## 6. Design around queries

Before choosing a NoSQL model, write representative operations:

```text
get user profile by user ID
get latest messages for conversation ID
find product by category and price range
```

Then identify the partition or lookup key, ordering, indexes, and whether a query can be served by one partition. A model optimized for one query may need duplicated data or a separate index to serve another.

Consider:

- What is the primary access key?
- Does a request need range scans or arbitrary filtering?
- What is the expected partition size and write rate?
- Can a hot key overwhelm one partition?
- What update/delete semantics and consistency level are required?
- How will the schema evolve?

## Source page guide

- [Pages 1–3](<../../Scalar java backend contents/NO_____52.pdf#page=1>): workload and relational/NoSQL model sketches.
- [Pages 4–9](<../../Scalar java backend contents/NO_____52.pdf#page=4>): memory/disk storage and write/read paths.
- [Pages 10–13](<../../Scalar java backend contents/NO_____52.pdf#page=10>): SSTables, merging/compaction, and LSM diagrams.
- [Pages 14–18](<../../Scalar java backend contents/NO_____52.pdf#page=14>): key-value, column-family, and document-model examples.

The PDF contains diagrams and exact handwritten labels that are not reliably recoverable from OCR. The write/read-path explanations and amplification vocabulary above are supplementary; check the cited pages for the original example sketches.

## Quick self-check

1. Why does an LSM engine use both a WAL and a memtable?
2. What is an SSTable, and why is it immutable?
3. Why can a read need to check multiple files?
4. What information does a Bloom filter provide, and what does it not prove?
5. Why does a delete often use a tombstone?
6. What does compaction do, and what resources does it consume?
7. How do key-value, wide-column, and document models differ?
8. Why should a partition key follow the access pattern?
