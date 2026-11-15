# Productionising Apps

Source: [Productionising_apps.pdf](<../../Scalar java backend contents/Productionising_apps.pdf>) (1 page)

The page sketches mobile/web clients, backend application instances, a database and downstream dependencies. It calls out a load balancer, API gateway, CDN/static content, caching, security/authentication, and service dependencies. The handwritten arrows are not consistently legible; this guide turns those components into a production-readiness walkthrough rather than claiming every arrow is a definitive architecture.

## 1. Trace the request path

A common request path is:

```text
Browser / mobile client
    -> DNS and edge/CDN (for cacheable static content)
    -> load balancer / API gateway
    -> backend application instance
    -> cache, database, or downstream service
```

Different systems may combine or omit these components. Draw the actual request path, identify trust boundaries and dependencies, and decide what happens at each failure point.

### Load balancer

A load balancer routes requests among application instances. Health checks should remove unhealthy instances from rotation, and the load-balancing layer itself should not become an unplanned single point of failure.

### API gateway

An API gateway can provide a managed entry point for routing, authentication integration, rate limiting, or request shaping. It is not a substitute for authorization and validation inside the service that owns the operation.

### CDN and static content

A content delivery network can serve eligible static assets from edge locations closer to users. Define cache headers, versioned asset names, and invalidation behavior. Do not cache personalized or sensitive responses as public content.

## 2. Application instances and dependencies

Application instances should be replaceable: store durable state in the appropriate data store rather than depending on one server's local memory or disk. Scale instances according to demand and monitor whether the true bottleneck is the application, database, or another dependency.

For each dependency, specify:

- Connection and request timeouts.
- Retry policy, including limits and whether the operation is safe to retry.
- Behavior when the dependency is unavailable.
- Connection-pool and concurrency limits.
- How partial failures are reported and observed.

Unlimited retries can amplify an outage. A circuit breaker or load-shedding mechanism may help in some designs, but should be configured around measured behavior rather than added automatically.

## 3. Cache deliberately

A cache can reduce repeated work or database load, but introduces stale data and invalidation questions:

- What is cached, and for how long?
- Is the data public, user-specific, or sensitive?
- How is a cache miss handled?
- What happens if the cache is unavailable?
- How do writes invalidate or refresh entries?

Treat a cache as an optimization unless the application explicitly designs it as durable storage. The database or authoritative service remains the source of truth for data that must survive cache loss.

## 4. Security and identity

The source diagram calls out security and authentication. In production, distinguish:

- **Authentication:** establish who the caller is.
- **Authorization:** decide which actions/data that identity may access.
- **Transport protection:** encrypt traffic across network boundaries.
- **Secret management:** keep credentials and keys out of code and logs.
- **Input validation:** enforce request shape and domain rules at the service boundary.

Apply authorization close to the data or business operation it protects. A gateway can help with shared authentication concerns, but downstream services should not blindly trust caller-supplied identity fields.

## 5. Availability, deployment, and recovery

- Run enough application instances and distribute them across appropriate failure domains.
- Use readiness checks to prevent sending traffic to an instance before it can serve requests.
- Deploy gradually where possible and keep a rollback path.
- Back up durable data and practice restoration; a backup that has never been restored is unverified.
- Define recovery-time and recovery-point expectations for critical services.
- Document ownership, escalation, and incident-response procedures.

Redundancy improves availability only when failover is tested and shared dependencies are also considered.

## 6. Observe production behavior

Collect signals that help identify user impact and bottlenecks:

- **Metrics:** request rate, error rate, latency percentiles, CPU/memory, queue depth, database saturation.
- **Logs:** structured, contextual events with sensitive fields excluded or redacted.
- **Traces:** request flow across services and dependencies.
- **Alerts:** actionable thresholds tied to user impact, not noisy normal variation.

Monitor both application behavior and dependency health. Correlate deployment changes with changes in errors and latency.

## 7. Capacity and performance

Measure traffic and resource use under representative load. Track latency, throughput, saturation, and cost. Add capacity based on the bottleneck and test how the system behaves when a dependency slows or a node fails.

Review:

- Maximum concurrent requests and connection-pool sizes.
- Database query plans and index maintenance.
- Cache hit rate and hot-key behavior.
- Background-job queues and retry buildup.
- Static-content transfer and CDN behavior.

## Production-readiness checklist

- [ ] Request path and trust boundaries are documented.
- [ ] Health/readiness checks and load-balancer behavior are tested.
- [ ] Authentication and authorization are applied to sensitive actions.
- [ ] Secrets and personal data are not exposed in logs.
- [ ] Dependency timeouts and bounded retries are defined.
- [ ] Cache consistency and failure behavior are understood.
- [ ] Metrics, logs, traces, and actionable alerts are available.
- [ ] Deployment, rollback, backup, and restore procedures are tested.
- [ ] Capacity and failure scenarios have been exercised.

## Quick self-check

1. What is the difference between a load balancer and an API gateway?
2. Why should downstream work have timeouts and bounded retries?
3. What can make a cache unsafe for a personalized response?
4. Why are backups not sufficient without restore testing?
5. Which signals help distinguish an application bottleneck from a database bottleneck?

## Source page guide

- [Page 1](<../../Scalar java backend contents/Productionising_apps.pdf#page=1>): client/backend/database architecture, dependencies, gateway/load-balancer and CDN notes, caching, and security/authentication.

Use the source diagram to check the original component labels. Its handwritten arrows are not clear enough to treat the sketch as a fully specified request flow.
