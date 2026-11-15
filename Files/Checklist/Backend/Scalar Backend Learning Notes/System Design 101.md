# System Design 101: DNS, Load Balancing, and Sharding

Source: [SYSTEM_DESIGN___101.pdf](<../../Scalar java backend contents/SYSTEM_DESIGN___101.pdf>) (8 pages)

## 1. Domain names and DNS

People use names such as `akshay.com`; networks route to IP addresses. The notes introduce domain registration, ICANN, DNS, and the lookup that maps a name to an address.

```text
Browser asks for a domain
        -> DNS lookup
        -> IP address
        -> connect to the server
```

The sketches distinguish a domain registrar (for example, GoDaddy) from the DNS system that answers lookups. Domain ownership/records and the address of the hosted service are related but separate concerns.

## 2. Capacity estimates

Before choosing infrastructure, estimate request and storage volume. The notes use a rough example of **1 million records × 250 bytes ≈ 250 MB**, then scale that estimate over time.

```text
stored data ≈ records created × average bytes per record
```

Treat this as a first estimate: real storage also includes indexes, metadata, replication, backups, and growth. State the time period and assumptions explicitly.

## 3. Scale up or scale out

- **Vertical scaling:** move to a larger machine with more capacity.
- **Horizontal scaling:** add machines and distribute requests/data.

The pages use a bookmark service (`del.icio.us`) to motivate scaling out. A load balancer sits in front of multiple application machines, and a backup load balancer is considered to avoid a single point of failure.

### Health checks and discovery

The diagrams include heartbeats/health checks and a registry-like view of machine status. The load balancer should avoid sending traffic to unhealthy machines; its own replacement or failover path also needs consideration.

## 4. Partitioning data across machines

For a bookmark service, the notes consider storing records such as `userId` and `url`, and ask which machine should own a user's data. A **shard key** determines that placement.

The approaches sketched include:

1. **Hash/modulo:** `machine = hash(userId) % numberOfMachines`
2. **Range partitioning:** assign ranges of keys to machines.
3. **Consistent hashing:** map keys and machines onto a ring, then assign each key to the next machine on the ring.

The shard key should distribute load well and match access patterns. Geographic location may distribute data unevenly or change, so the notes favor evaluating `userId` as a key for the example.

## 5. Consistent hashing and machine changes

With modulo hashing, changing the number of machines can remap many keys. Consistent hashing aims to limit how much data moves when machines are added or removed. The diagrams show a hash ring, machine positions, and virtual positions/nodes.

```text
hash(key) -> position on ring -> next machine clockwise
```

Machines still need a deterministic mapping and a rebalancing process. Hashing distributes keys; it does not by itself provide replication, backups, or availability.

## Design checklist

- What is the expected write/read rate and data growth?
- What record size and retention period are assumed?
- Which data is stored together, and what is the shard key?
- How are hotspots and uneven partitions detected?
- How are machines discovered and unhealthy nodes removed from rotation?
- What changes when a machine is added, removed, or fails?
- How are data durability, replication, and recovery handled?

## Review the diagrams

- [Domain names, IP addresses, ICANN, and DNS (pages 1–2)](<../../Scalar java backend contents/SYSTEM_DESIGN___101.pdf#page=1>)
- [Storage sizing, vertical/horizontal scaling, and load balancing (pages 3–4)](<../../Scalar java backend contents/SYSTEM_DESIGN___101.pdf#page=3>)
- [Shard-key choices and consistent-hashing sketches (pages 5–8)](<../../Scalar java backend contents/SYSTEM_DESIGN___101.pdf#page=5>)

The handwritten examples are approximate and some labels are hard to read. Recheck the original pages before relying on a particular numeric estimate or topology.

## Quick self-check

1. How does DNS connect a human-readable name to an IP address?
2. What is the difference between scaling vertically and horizontally?
3. Why put a health-checked load balancer in front of several servers?
4. How does changing cluster size affect modulo hashing versus consistent hashing?
5. Why should a capacity estimate include more than raw record bytes?
