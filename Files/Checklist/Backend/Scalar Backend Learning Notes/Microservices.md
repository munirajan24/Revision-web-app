# Microservices: From Monolith to Distributed System

Source: [Micro_services_.pdf](<../../Scalar java backend contents/Micro_services_.pdf>) (1 page)

The page agenda moves from a monolith, to scaling a monolith, to microservices. It lists APIs, communication patterns, distributed transactions, the **Saga pattern**, and further reading. The architecture sketch contrasts a backend monolith with multiple service instances.

## 1. Start with a monolith

A **monolith** is an application delivered as one deployable unit. It may still have well-separated internal modules and multiple server instances.

Typical advantages, reflected in the source's monolith notes:

- One build and deployment process.
- Local function calls rather than network calls between modules.
- Easier end-to-end debugging and a simpler operational baseline.
- Transactions can often be managed in one database boundary.

Potential disadvantages as the system grows include coordinated releases, a large shared codebase, and difficulty scaling or assigning ownership independently. These disadvantages do not mean every monolith is poorly structured.

## 2. Scale and modularize before splitting

Before creating services, check whether the actual pressure can be addressed by:

- Increasing capacity for the current application.
- Running multiple instances behind a load balancer.
- Improving database indexes, caching, or slow code.
- Separating well-defined modules inside the monolith.

A **modular monolith** can preserve one deployment while making boundaries explicit. It may meet current needs without the distributed-system costs of a network boundary.

## 3. What makes a microservice?

A microservice is a small, independently deployable service organized around a bounded business responsibility. A system is not meaningfully “microservices” just because it has many processes: boundaries, ownership, data responsibility, and operations matter.

```text
Client -> API / gateway -> service A -> service B
                          owns data A   owns data B
```

Services should own their behavior and data. Directly sharing one database schema across services couples releases and makes ownership unclear; prefer a service API or event contract for cross-boundary communication.

## 4. API and communication choices

### Synchronous requests

An HTTP/REST or RPC call returns a response as part of the current interaction. It is straightforward when the caller needs an immediate answer, but it couples availability and latency: if the downstream service is slow or unavailable, the caller is affected.

Use explicit timeouts, bounded retries, and clear error behavior. Retrying non-idempotent operations can create duplicates unless the operation has an idempotency strategy.

### Asynchronous messaging

A service publishes an event or command to a broker, and another service processes it later. This can reduce direct runtime coupling and absorb bursts, but introduces eventual consistency, duplicate delivery, ordering questions, and the need to monitor queues and consumers.

Consumers should tolerate retries and duplicates where the broker's delivery model permits them. Version messages carefully and define what happens when processing repeatedly fails.

## 5. Distributed transactions and Saga

A normal database transaction generally covers one database transaction boundary, not several independently owned service databases. If a business action spans services, a **Saga** models it as a series of local transactions:

```text
Reserve inventory -> authorize payment -> create shipment
        |                    |
        +-- compensation on failure (release/cancel)
```

Each step commits locally. If a later step fails, the workflow may run **compensating actions** to undo or counteract earlier business effects. Compensation is not always a literal rollback: an external side effect such as a sent email cannot be unsent.

A Saga needs durable workflow state, retry and timeout rules, idempotent handlers, and observability so operators can see a partially completed process. The source explicitly lists distributed transactions and Saga in its agenda.

## 6. Advantages and costs

Possible benefits:

- Independent deployment and scaling for services with different needs.
- Clear ownership boundaries for teams.
- Fault containment when services and dependencies are isolated appropriately.

Costs and risks:

- Network latency, partial failures, and dependency management.
- Distributed data consistency and cross-service workflows.
- More deployments, configuration, logs, metrics, and alerts to operate.
- API and message versioning, service discovery, and local development complexity.

Microservices move complexity from in-process code into the network and operational environment. They do not automatically improve performance, reliability, or team speed.

## 7. A decision checklist

Consider a service split when there is a concrete need for independent ownership, deployment, scaling, or failure isolation and a stable business boundary can be defined. Before splitting, answer:

1. What capability does the service own?
2. Which data is authoritative in that service?
3. What API or event contract do callers use?
4. What happens when the service is slow, unavailable, or returns an invalid response?
5. How are cross-service operations retried, made idempotent, or compensated?
6. How will logs, metrics, traces, deployments, and on-call responsibility work?
7. Can a modular monolith meet the requirement with less operational cost?

## Quick self-check

1. Why might a team scale a monolith before extracting services?
2. What changes when an in-process call becomes a network call?
3. What data should a service own?
4. How do synchronous calls and asynchronous messages differ?
5. What problem does a Saga address, and why is compensation not always a rollback?
6. What operational capabilities must accompany independently deployed services?

## Source page guide

- [Page 1](<../../Scalar java backend contents/Micro_services_.pdf#page=1>): monolith and scaling agenda, service/API and communication topics, distributed transactions, Saga, and architecture comparison.

The one-page source is an agenda and architecture sketch, not a complete microservices specification. The design details above explain its listed topics and should be adapted to a concrete system.
