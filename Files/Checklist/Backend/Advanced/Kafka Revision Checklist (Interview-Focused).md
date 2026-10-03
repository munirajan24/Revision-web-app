# Kafka Revision Checklist (Interview-Focused)

Tick an item only when you can explain it aloud. ⭐ marks the most commonly asked segments.

---

## 1. Fundamentals ⭐
- [ ] What Kafka is: distributed, durable, append-only commit log for event streaming
- [ ] Kafka vs traditional message queues (RabbitMQ, SQS): log retention, replay, pull-based consumers
- [ ] Core terms: producer, consumer, broker, topic, partition, offset, record (key, value, headers, timestamp)
- [ ] Why Kafka is fast: sequential disk I/O, page cache, zero-copy, batching, compression
- [ ] Common use cases: event-driven microservices, log aggregation, CDC, stream processing, metrics pipelines
- [ ] When *not* to use Kafka (simple task queues, request/response, very low volume)

## 2. Architecture ⭐
- [ ] Cluster, broker, controller
- [ ] **KRaft vs ZooKeeper** (modern Kafka runs on KRaft; know why ZooKeeper was removed)
- [ ] Topic → partitions → segments (log files and index files)
- [ ] Leader and follower replicas, replication factor
- [ ] **ISR** (in-sync replicas), `min.insync.replicas`, leader election, unclean leader election
- [ ] High watermark
- [ ] Log retention (time and size), log compaction, tombstones
- [ ] Partition count trade-offs (parallelism vs overhead)

## 3. Producers ⭐
- [ ] Send flow: serializer → partitioner → batch buffer → broker
- [ ] Partitioning strategy: key-based, round-robin, sticky, custom partitioner
- [ ] **`acks` (0, 1, all)** and durability trade-offs
- [ ] `retries`, `delivery.timeout.ms`, `max.in.flight.requests.per.connection`
- [ ] **Idempotent producer** (`enable.idempotence`) and how it prevents duplicates
- [ ] Batching and throughput: `batch.size`, `linger.ms`, `compression.type`
- [ ] Sync vs async send, callbacks
- [ ] Ordering guarantees and when they break (retries, multiple partitions)

## 4. Consumers and Consumer Groups ⭐
- [ ] Consumer group concept: each partition assigned to one consumer in the group
- [ ] Scaling rule: consumers beyond partition count sit idle
- [ ] Offsets and the `__consumer_offsets` topic
- [ ] **Commit strategies**: auto commit vs manual sync/async, commit after processing
- [ ] `auto.offset.reset` (`earliest`, `latest`)
- [ ] **Rebalancing**: triggers, eager vs cooperative, static membership, why rebalances hurt
- [ ] Assignment strategies (range, round-robin, sticky, cooperative sticky)
- [ ] `poll()` loop, `max.poll.records`, `max.poll.interval.ms`, `session.timeout.ms`, heartbeats
- [ ] **Consumer lag**: what it is, how to monitor it, how to reduce it
- [ ] Pause/resume, seek, replaying messages from an offset

## 5. Delivery Semantics ⭐
- [ ] At-most-once vs at-least-once vs exactly-once
- [ ] How each is achieved (commit before/after processing, idempotent producer, transactions)
- [ ] **Kafka transactions**: transactional producer, `read_committed` isolation
- [ ] Exactly-once semantics in Kafka Streams vs across external systems (why it's hard)
- [ ] **Idempotent consumers**: dedup keys, upserts, processed-ID tables
- [ ] Ordering guarantees: per partition only, and how to preserve order per entity (use the entity ID as key)

## 6. Reliability and Fault Tolerance
- [ ] Settings for no data loss: `acks=all`, replication factor ≥ 3, `min.insync.replicas=2`
- [ ] What happens when a broker fails, and when a leader fails
- [ ] Producer and consumer failure scenarios and recovery
- [ ] Data loss and duplication scenarios, and their causes
- [ ] Rack awareness, multi-AZ deployment
- [ ] MirrorMaker / cross-cluster replication and disaster recovery basics

## 7. Error Handling Patterns ⭐
- [ ] Retries with backoff, non-blocking retry topics
- [ ] **Dead-letter topic (DLT)**
- [ ] Poison pill messages and deserialization errors
- [ ] Handling failures without blocking the whole partition
- [ ] Idempotent processing to make retries safe
- [ ] Ordering vs retry trade-offs

## 8. Schema and Serialization
- [ ] JSON vs Avro vs Protobuf
- [ ] Schema Registry and compatibility modes (backward, forward, full)
- [ ] Schema evolution rules (adding and removing fields)
- [ ] Event design: key choice, event vs command, event naming, versioning

## 9. Spring Boot + Kafka ⭐
- [ ] Spring Kafka: `KafkaTemplate`, `@KafkaListener`, listener container factory
- [ ] Producer and consumer configuration in `application.yml`
- [ ] Ack modes (`RECORD`, `BATCH`, `MANUAL`, `MANUAL_IMMEDIATE`)
- [ ] Error handling: `DefaultErrorHandler`, `DeadLetterPublishingRecoverer`, `@RetryableTopic`
- [ ] Concurrency setting vs partition count
- [ ] Batch listeners
- [ ] JSON and Avro (de)serialization, `ErrorHandlingDeserializer`
- [ ] Transactions with Spring (`KafkaTransactionManager`, chaining with DB transactions)
- [ ] Testing: `@EmbeddedKafka`, Testcontainers
- [ ] Virtual threads and Kafka consumers (basic awareness)

## 10. Kafka Streams, Connect and Ecosystem
- [ ] Kafka Streams: KStream vs KTable, stateless vs stateful operations, windowing, joins
- [ ] State stores and changelog topics (high level)
- [ ] Kafka Connect: source vs sink connectors, use cases
- [ ] CDC with Debezium, and the **outbox pattern**
- [ ] ksqlDB / Flink: know when they're used (awareness only)

## 11. Security and Operations
- [ ] Authentication (SASL, mTLS), authorization (ACLs), encryption in transit
- [ ] Monitoring: lag, under-replicated partitions, request latency, ISR shrinks
- [ ] Tools: `kafka-topics`, `kafka-console-producer/consumer`, `kafka-consumer-groups`
- [ ] Capacity planning: partitions, retention, throughput
- [ ] Increasing partitions (effects on key ordering) and reassigning partitions
- [ ] Quotas and throttling
- [ ] Managed options (Confluent Cloud, MSK) at a high level

## 12. Design and Scenario Questions ⭐
- [ ] How do you guarantee order for one user or order ID?
- [ ] How do you avoid duplicate processing?
- [ ] How would you handle a consumer that's falling behind?
- [ ] How do you reprocess or replay events after a bug?
- [ ] How do you choose the number of partitions?
- [ ] How do you guarantee an event is published when the DB commit succeeds? (outbox pattern)
- [ ] How do you design retries and dead-letter handling?
- [ ] Kafka vs RabbitMQ vs SQS: how do you choose?
- [ ] Design an order or payment event flow with Kafka
- [ ] Explain a real Kafka issue you faced (lag, rebalance storm, duplicates)

---

## Classic quick-fire questions (have one-liners ready)
- [ ] Why does Kafka guarantee order only within a partition?
- [ ] What's the difference between a consumer group and a consumer?
- [ ] What causes a rebalance, and how do you reduce it?
- [ ] `acks=all` vs `min.insync.replicas`?
- [ ] Can Kafka lose messages? When?
- [ ] Can Kafka deliver duplicates? When?
- [ ] What does log compaction do, and when would you use it?
- [ ] What's an offset, and who stores it?
- [ ] What happens if there are more consumers than partitions?
- [ ] Push vs pull model: why does Kafka use pull?

## Priority if time is short
1. Segments 1-2 (fundamentals and architecture)
2. Producers: `acks`, idempotence, ordering
3. Consumers: groups, offsets, rebalancing, lag
4. Delivery semantics and idempotent consumers
5. Error handling: retries and DLT
6. Spring Kafka usage
7. Scenario questions and the outbox pattern

