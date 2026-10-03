# Java + Spring Boot Backend Interview Checklist (Latest Stack)

Tick an item only when you can explain it aloud with a short example. Segments marked ⭐ are the ones interviewers ask most often.

---


## Segment 1: Core Java ⭐
- [ ] OOP pillars, abstract class vs interface (default/static/private methods)
- [ ] `equals()` / `hashCode()` contract
- [ ] String immutability, String pool, `StringBuilder` vs `StringBuffer`
- [ ] `final` / `finally` / `finalize`
- [ ] Checked vs unchecked exceptions, try-with-resources, custom exceptions
- [ ] Generics, wildcards (`? extends` / `? super`), type erasure
- [ ] Pass by value in Java, shallow vs deep copy
- [ ] Immutable classes (how to create one)
- [ ] `static`, `this`, `super`, initialization order
- [ ] Inner, nested, and anonymous classes
- [ ] Serialization basics, `transient`

## Segment 2: Modern Java (17 / 21 / 25) ⭐
- [ ] Lambdas, functional interfaces, method references
- [ ] Streams: `map`, `filter`, `flatMap`, `reduce`, `collect`, `groupingBy`, `partitioningBy`
- [ ] Intermediate vs terminal operations, lazy evaluation, parallel streams and their risks
- [ ] `Optional` (correct usage and misuse)
- [ ] Records (limits, compact constructors)
- [ ] Sealed classes/interfaces
- [ ] Pattern matching (`instanceof`, `switch`, record patterns)
- [ ] Switch expressions, text blocks, `var`
- [ ] Sequenced collections (Java 21)
- [ ] Virtual threads (Java 21)
- [ ] Scoped values and structured concurrency (check their current status in the JDK you target)
- [ ] Why LTS versions matter (8, 11, 17, 21, 25)

## Segment 3: Collections Framework ⭐
- [ ] ArrayList vs LinkedList, HashSet vs TreeSet vs LinkedHashSet
- [ ] **HashMap internals**: hashing, buckets, collisions, treeification, resizing, load factor
- [ ] HashMap vs Hashtable vs ConcurrentHashMap vs `Collections.synchronizedMap`
- [ ] Fail-fast vs fail-safe iterators, `ConcurrentModificationException`
- [ ] Comparable vs Comparator
- [ ] `PriorityQueue`, `Deque`, `EnumMap`
- [ ] Immutable collections (`List.of`, `Map.of`)
- [ ] Time complexity of common operations

## Segment 4: Concurrency ⭐
- [ ] Thread lifecycle, `Runnable` vs `Callable`
- [ ] `synchronized`, `volatile`, happens-before, Java Memory Model
- [ ] `ReentrantLock`, `ReadWriteLock`, `StampedLock`
- [ ] Atomic classes, CAS
- [ ] `ExecutorService`, thread pool types, sizing pools
- [ ] `CompletableFuture` (chaining, combining, exception handling)
- [ ] Deadlock, livelock, starvation and how to prevent them
- [ ] `ThreadLocal` and its pitfalls
- [ ] `CountDownLatch`, `CyclicBarrier`, `Semaphore`
- [ ] **Virtual threads vs platform threads vs reactive**: when to use which
- [ ] Enabling virtual threads in Spring Boot (`spring.threads.virtual.enabled`), pinning issues

## Segment 5: JVM Internals
- [ ] JVM architecture: class loaders, heap, stack, metaspace
- [ ] ⭐Garbage collectors: G1, ZGC, Shenandoah (generational modes)
- [ ] ⭐GC tuning basics, heap dump and thread dump analysis
- [ ] ⭐Common causes of `OutOfMemoryError`, memory leaks in Java
- [ ] JIT compilation, escape analysis
- [ ] Java Flight Recorder, VisualVM, profiling tools
- [ ] JVM behavior in containers (memory limits, CPU awareness)

## Segment 6: Design Patterns and Principles ⭐
- [ ] SOLID with examples
- [ ] Singleton (thread-safe versions), Factory, Builder, Strategy, Observer, Decorator, Adapter, Proxy
- [ ] Which patterns Spring itself uses (Proxy, Singleton, Template Method, Factory)
- [ ] DRY, KISS, YAGNI
- [ ] Clean architecture / hexagonal architecture
- [ ] DDD basics (entity, value object, aggregate, bounded context)

## Segment 7: Spring Core ⭐
- [ ] IoC and DI, constructor vs setter vs field injection (and why constructor is preferred)
- [ ] Bean lifecycle, scopes (singleton, prototype, request, session)
- [ ] `@Component` / `@Service` / `@Repository` / `@Controller`
- [ ] `@Configuration` and `@Bean`, `@Primary` and `@Qualifier`
- [ ] Circular dependencies and how to resolve them
- [ ] `ApplicationContext` vs `BeanFactory`
- [ ] Spring AOP: proxies (JDK vs CGLIB), aspects, advice types, self-invocation problem
- [ ] `@Transactional` internals (proxy-based)
- [ ] Spring events, `@Async`, `@Scheduled`
- [ ] Lazy initialization, `@Conditional`

## Segment 8: Spring Boot Fundamentals ⭐
- [ ] How auto-configuration works (`@SpringBootApplication` breakdown)
- [ ] Starters and creating a custom starter
- [ ] `application.properties` vs YAML, profiles, externalized config, `@ConfigurationProperties`
- [ ] Configuration precedence order
- [ ] Actuator endpoints, health probes, custom health indicators
- [ ] Embedded servers (Tomcat/Jetty/Undertow)
- [ ] DevTools, graceful shutdown
- [ ] Logging (SLF4J, Logback), structured logging
- [ ] Observability: Micrometer, OpenTelemetry, tracing
- [ ] Native images with GraalVM and AOT processing

## Segment 9: REST API Development ⭐
- [ ] REST principles, HTTP methods, idempotency, status codes
- [ ] `@RestController`, `@RequestMapping`, `@PathVariable`, `@RequestParam`, `@RequestBody`
- [ ] DTOs vs entities, mapping (MapStruct)
- [ ] Bean Validation (`@Valid`, custom validators)
- [ ] Global exception handling (`@ControllerAdvice`, `ProblemDetail` / RFC 9457)
- [ ] Pagination, sorting, filtering
- [ ] **API versioning** (new native support vs older approaches)
- [ ] `RestClient` / `WebClient` / HTTP interface clients
- [ ] OpenAPI/Swagger documentation
- [ ] File upload/download, content negotiation
- [ ] HATEOAS basics, REST vs GraphQL vs gRPC
- [ ] Spring MVC request flow (`DispatcherServlet`), filters vs interceptors

## Segment 10: Spring Data JPA and Hibernate ⭐
- [ ] Entity mapping, `@Id` generation strategies
- [ ] Relationships: `@OneToMany`, `@ManyToOne`, `@ManyToMany`, owning side, cascade, orphan removal
- [ ] **N+1 problem** and solutions (`JOIN FETCH`, entity graphs, batch fetching)
- [ ] Lazy vs eager loading, `LazyInitializationException`
- [ ] Persistence context, entity states, first- and second-level cache
- [ ] `JpaRepository`, derived queries, `@Query`, projections, specifications
- [ ] `@Transactional`: propagation, isolation, rollback rules, read-only, pitfalls
- [ ] Optimistic vs pessimistic locking (`@Version`)
- [ ] Open Session in View (why to disable it)
- [ ] Database migrations with Flyway/Liquibase
- [ ] Auditing, soft delete, batch inserts
- [ ] JPA vs JDBC vs jOOQ vs JdbcClient

## Segment 11: Databases and SQL ⭐
- [ ] Joins, subqueries, window functions, `GROUP BY` / `HAVING`
- [ ] Indexing: B-tree, composite, covering indexes, when indexes hurt
- [ ] Query optimization, `EXPLAIN` plans
- [ ] ACID, isolation levels, dirty/phantom/non-repeatable reads
- [ ] Normalization vs denormalization
- [ ] Deadlocks in databases
- [ ] Connection pooling (HikariCP) and tuning
- [ ] SQL vs NoSQL, when to choose MongoDB, Redis, Cassandra
- [ ] Sharding, replication, partitioning
- [ ] Common SQL coding questions (second highest salary, duplicates, top-N per group)

## Segment 12: Spring Security ⭐
- [ ] Authentication vs authorization
- [ ] Security filter chain (`SecurityFilterChain` bean, no `WebSecurityConfigurerAdapter`)
- [ ] JWT: structure, validation, refresh tokens, storage, revocation
- [ ] OAuth2 / OpenID Connect flows (authorization code + PKCE, client credentials)
- [ ] Resource server vs authorization server vs client
- [ ] Method security (`@PreAuthorize`), role vs authority
- [ ] Password hashing (BCrypt, Argon2)
- [ ] CORS, CSRF, session vs stateless
- [ ] OWASP Top 10 and how Spring helps
- [ ] Secrets management (Vault, environment variables)

## Segment 13: Microservices
- [ ] Monolith vs microservices, when not to use microservices
- [ ] Service discovery, API gateway (Spring Cloud Gateway), config server
- [ ] Sync vs async communication
- [ ] Resilience: circuit breaker, retry, rate limiter, bulkhead (Resilience4j and built-in retry)
- [ ] Distributed transactions: Saga (orchestration vs choreography), outbox pattern
- [ ] CQRS and event sourcing
- [ ] Distributed tracing and centralized logging
- [ ] Data consistency and eventual consistency
- [ ] Idempotency and deduplication
- [ ] Service-to-service security
- [ ] Versioning and backward compatibility between services

## Segment 14: Messaging and Async Processing
- [ ] Kafka: topics, partitions, consumer groups, offsets, replication
- [ ] Delivery semantics (at-most / at-least / exactly-once)
- [ ] Ordering guarantees, partition keys
- [ ] Error handling: retries, dead-letter topics, poison messages
- [ ] Kafka vs RabbitMQ vs SQS
- [ ] Spring Kafka / Spring AMQP usage
- [ ] Backpressure and consumer lag
- [ ] Event-driven architecture patterns

## Segment 15: Caching and Performance
- [ ] Spring Cache (`@Cacheable`, `@CacheEvict`, `@CachePut`)
- [ ] Redis: data structures, eviction policies, persistence, use cases
- [ ] Cache patterns: cache-aside, write-through, write-behind
- [ ] Cache stampede, invalidation strategies, TTL
- [ ] HTTP caching (ETag, Cache-Control)
- [ ] Profiling and finding bottlenecks
- [ ] Load testing (JMeter, k6, Gatling)
- [ ] Reactive (WebFlux) vs blocking: when it actually helps

## Segment 16: Testing ⭐
- [ ] Test pyramid, unit vs integration tests
- [ ] JUnit 5 features (parameterized tests, extensions)
- [ ] Mockito / `@MockitoBean`, `@Mock` vs `@InjectMocks`
- [ ] Test slices: `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`
- [ ] `MockMvc`, `RestTestClient`, `TestRestTemplate`
- [ ] **Testcontainers** for DB/Kafka integration tests
- [ ] Contract testing (Spring Cloud Contract, Pact)
- [ ] Code coverage and mutation testing basics
- [ ] TDD, testing async code and transactions

## Segment 17: DevOps, Deployment and Observability
- [ ] Docker: writing a Dockerfile, multi-stage builds, layered JARs, buildpacks
- [ ] Docker Compose for local dependencies
- [ ] Kubernetes basics: pods, deployments, services, config maps, probes
- [ ] CI/CD pipeline stages
- [ ] 12-factor app principles
- [ ] Logging, metrics, tracing (ELK/Loki, Prometheus, Grafana, OpenTelemetry)
- [ ] Zero-downtime deployments (blue-green, canary)
- [ ] Cloud basics (AWS/Azure/GCP core services)

## Segment 18: Backend System Design ⭐
- [ ] Requirements gathering, estimation (QPS, storage)
- [ ] Load balancing, horizontal vs vertical scaling
- [ ] Rate limiting algorithms (token bucket, sliding window)
- [ ] CAP theorem, consistency models
- [ ] Database choice, sharding, replication
- [ ] Caching layers, CDN
- [ ] Idempotent APIs, pagination at scale
- [ ] Common designs: URL shortener, notification service, chat, payment flow, booking system
- [ ] Failure handling and disaster recovery
- [ ] Monitoring and alerting

## Segment 19: Coding and DSA
- [ ] Arrays and strings (two pointers, sliding window)
- [ ] HashMap-based problems
- [ ] Linked lists, stacks, queues
- [ ] Trees and graphs (BFS/DFS)
- [ ] Sorting and searching
- [ ] Recursion and dynamic programming basics
- [ ] Stream API coding questions (group, count, find max)
- [ ] Machine coding: LRU cache, rate limiter, parking lot, simple in-memory key-value store

## Segment 20: Project and Behavioral
- [ ] 60-second self-introduction
- [ ] End-to-end walkthrough of your latest project (architecture, your role, tech choices)
- [ ] Biggest technical challenge and how you solved it
- [ ] Production issue you debugged
- [ ] A trade-off decision you made and why
- [ ] Disagreement with a teammate
- [ ] Why leaving your current job
- [ ] Strengths and weaknesses
- [ ] Salary expectation and notice period
- [ ] Questions to ask the interviewer


## Segment 21: What's New (know this to sound current)
- [ ] Spring Boot 4.0 was released on November 20, 2025, with support for JDK 25 LTS, which came out in September 2025
- [ ] Spring Framework 7 keeps the JDK 17 baseline while embracing JDK 25, and adopts Jakarta EE 11 and Kotlin 2.2 as new baselines
- [ ] First-class REST API versioning in Spring MVC and WebFlux (path, header, query parameter, and media type strategies)
- [ ] JSpecify annotations for null safety across the portfolio, and Jackson 3 as the new default
- [ ] The spring-retry library is replaced by a built-in retry API in spring-core
- [ ] The monolithic autoconfigure JAR is split into modules (faster startup, smaller images, better native builds)
- [ ] Migration path: move to Boot 3.5 first, fix deprecations, then go to 4.0
- [ ] `@MockBean` → `@MockitoBean` (and `@SpyBean` → `@MockitoSpyBean`)
- [ ] `RestClient` and declarative HTTP interface clients instead of `RestTemplate`
- [ ] Spring Boot 3.x vs 4.x differences you can state in 30 seconds

---
