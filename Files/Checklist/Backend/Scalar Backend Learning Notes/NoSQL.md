# NoSQL: Sharding, Replication, and Availability

Source: [NOSQL_II.pdf](<../../Scalar java backend contents/NOSQL_II.pdf>) (8 pages)

The handwritten diagrams focus on splitting data across machines, adding or removing machines, replication factor 3, and replica placement across racks or data centers. This guide explains those ideas and the operational trade-offs they introduce.

## 1. Why distribute data?

As one machine approaches its limits for storage, CPU, memory, or request throughput, a database can distribute work across multiple machines. This is **horizontal scaling**. A distributed design must decide:

- Which machine stores each record?
- How do requests find the right machine?
- What happens when a machine is slow, unavailable, or added?
- How many copies of data exist, and when are writes considered successful?

Adding nodes can increase capacity, but it does not automatically produce a balanced, available, or consistent system.

## 2. Sharding and shard keys

**Sharding** divides a dataset among multiple nodes. A **shard key** determines which shard owns a record. Common strategies include:

- **Hash partitioning:** hash a key and map it to a shard. This can spread uniformly distributed keys but is not naturally ordered for range queries.
- **Range partitioning:** assign ranges of keys to shards. Range queries can be efficient, but monotonically increasing keys can make one shard a write hot spot.
- **Directory-based placement:** maintain a routing table that maps a key or group of keys to a shard. This is flexible but requires a reliable directory.

```text
record -> shard key -> partition/range -> shard node
```

Choose a key that distributes storage and request volume while supporting important queries. Check for:

- **Cardinality:** does the key have enough distinct values?
- **Skew:** are a few values responsible for most requests or data?
- **Access pattern:** do common requests know the shard key?
- **Hot keys:** can one user, tenant, or popular item overload a shard?
- **Mutability:** can the key change after insertion?

No shard key is optimal for every query. A query without the partition key may need to contact many or all shards.

## 3. Adding and removing nodes

With a simple modulo scheme such as `hash(key) % nodeCount`, changing `nodeCount` can remap many keys. The data must then move or be made reachable on new owners.

**Consistent hashing** maps both keys and nodes to a logical ring. A key is assigned to the next node on the ring; adding a node generally moves only the keys in the affected ring segment. Systems may use multiple virtual positions per physical node to improve balance.

```text
hash(key) -> position on ring -> next node clockwise
```

Consistent hashing reduces movement in many cases, but does not remove the need for data migration, routing updates, replica repair, or monitoring for uneven load.

## 4. Replication

**Replication** keeps copies of data on multiple nodes. The source diagrams show a replication factor of **3**: for a replicated record/partition, maintain three copies according to the system's placement rules.

Replication can:

- Keep data available when a node fails.
- Provide copies for recovery or, in some systems, serve reads.
- Reduce the risk of losing data from a single machine failure.

Replication also increases storage and network traffic. It requires rules for write acknowledgement, consistency, conflict handling, and repairing stale or missing copies.

### Replica placement and failure domains

Three replicas on one host or rack may all be lost in one incident. Place replicas across independent **failure domains** where practical:

```text
Replica 1 -> Rack A / Data center 1
Replica 2 -> Rack B / Data center 1
Replica 3 -> Rack C or Data center 2
```

Rack awareness protects against a rack-level incident. Data-center awareness can protect against a site outage, but increases cross-site latency and operational complexity. The source explicitly sketches rack/data-center-aware placement and disaster recovery on [page 7](<../../Scalar java backend contents/NOSQL_II.pdf#page=7>).

## 5. Availability and consistency questions

Replication alone does not determine whether reads see the newest write. Ask:

- How many replicas must acknowledge a write?
- Can a read be served by one replica, or must replicas agree?
- What is the behavior when a quorum cannot be reached?
- Are concurrent writes possible, and how are conflicts resolved?
- Can a client read stale data after a successful write?

Some databases use quorum-style rules. If there are `N` replicas, a system can require `W` acknowledgements for writes and `R` responses for reads. Under suitable system assumptions, `R + W > N` gives overlap between a read set and a write set; it is not, by itself, a universal guarantee of linearizability. Follow the specific database's documented consistency model.

## 6. Rebalancing and recovery

When nodes are added, removed, or fail, a distributed database may need to:

1. Update routing and ownership metadata.
2. Move partitions or ranges to new owners.
3. Copy or repair replicas.
4. Throttle migration to avoid overwhelming live traffic.
5. Verify consistency and remove obsolete copies when safe.

Track data movement, shard size, request rate, replication lag, and node health. Rebalancing can take time and compete with normal reads and writes.

## 7. Capacity planning with replication

If raw data size is `D` and replication factor is `N`, a first-order estimate for replica storage is approximately `D × N`, before indexes, metadata, compaction overhead, and free-space requirements.

Capacity planning should also account for:

- Uneven partition sizes and hot shards.
- Growth and retention.
- Network bandwidth for replication and rebalancing.
- The capacity required to serve load after one or more failures.

## Quick self-check

1. What decision does a shard key make?
2. Why can a low-cardinality or monotonically increasing key create a hot shard?
3. What can change when a cluster using modulo hashing gains a node?
4. What does replication factor 3 describe?
5. Why should replicas span independent failure domains?
6. What trade-offs arise when replicas span data centers?
7. Why is replication not the same as a consistency guarantee?
8. What work happens when a cluster is rebalanced?

## Source page guide

- [Pages 1–3](<../../Scalar java backend contents/NOSQL_II.pdf#page=1>): shard key, data distribution, and node-count sketches.
- [Pages 4–6](<../../Scalar java backend contents/NOSQL_II.pdf#page=4>): moving data as machines are added or removed and replication-factor diagrams.
- [Pages 7–8](<../../Scalar java backend contents/NOSQL_II.pdf#page=7>): replica placement across failure domains and recovery sketches.

The diagrams contain handwritten topology and capacity examples whose labels are not reliably legible. The consistency and capacity sections above are supplementary explanations; use the PDF for the original cluster drawings.
