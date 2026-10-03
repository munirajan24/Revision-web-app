# Kotlin + Spring Boot Backend Interview Checklist

Tick an item only when you can explain it aloud with a short example. ⭐ marks the most commonly asked segments.

---

## 1. Kotlin + Spring Setup ⭐
- [ ] Why Kotlin for backend (null safety, conciseness, coroutines, data classes, DSLs)
- [ ] Why Kotlin classes are `final` by default and why that breaks Spring proxies
- [ ] **`kotlin-spring` plugin** (all-open): what it opens and why
- [ ] **`kotlin-jpa` plugin** (no-arg): why JPA entities need it
- [ ] `jackson-module-kotlin` and how JSON deserialization works with Kotlin constructors
- [ ] Gradle Kotlin DSL (`build.gradle.kts`), KSP vs KAPT
- [ ] Kotlin and Java interop in a mixed codebase (platform types, `@Nullable`)
- [ ] Spring Framework 7 uses Kotlin 2.2 as its baseline Spring Framework 7 keeps the JDK 17 baseline while adopting Jakarta EE 11 and Kotlin 2.2 as new baselines
- [ ] Spring Boot 4 has a dedicated Kotlin serialization module and starter Boot ships a new spring-boot-kotlinx-serialization-json module and starter for Kotlin Serialization support
- [ ] Null safety: how JSpecify annotations map to Kotlin nullability

## 2. Kotlin Language Essentials ⭐
- [ ] `val` vs `var` vs `const val`, `lateinit` vs `lazy`
- [ ] Null safety operators (`?.`, `?:`, `!!`, `let`)
- [ ] `data class` (and why it's risky for JPA entities)
- [ ] `sealed class` / `sealed interface` for results and errors
- [ ] `object` and `companion object`
- [ ] Scope functions (`let`, `run`, `apply`, `also`, `with`)
- [ ] Extension functions (mapping DTOs to entities)
- [ ] Default and named arguments, `require` / `check` / `error`
- [ ] `Sequence` vs collection operations
- [ ] `inline`, `reified`, higher-order functions
- [ ] `value class` (for typed IDs)
- [ ] Delegation (`by lazy`, custom delegates)

## 3. Dependency Injection and Beans
- [ ] Constructor injection with a primary constructor (no `@Autowired` needed)
- [ ] `@Bean` methods and the beans DSL
- [ ] `lateinit` and field injection: why to avoid them
- [ ] `@ConfigurationProperties` with data classes and `@ConstructorBinding` behavior
- [ ] `@Value` and string templates (escaping `$`)
- [ ] Bean scopes, profiles, conditions (same as Java)
- [ ] AOP and proxies with all-open classes, `@Transactional` on Kotlin classes

## 4. REST APIs with Kotlin ⭐
- [ ] `@RestController` with expression-body functions
- [ ] DTOs as data classes, nullable vs non-null fields and validation
- [ ] Bean Validation annotations on Kotlin properties (use-site targets like `@field:NotBlank`, `@get:`)
- [ ] `ResponseEntity`, `ProblemDetail`, and `@ControllerAdvice`
- [ ] Handling missing or null JSON fields, default values in DTOs
- [ ] Router DSL (`router { }`) vs annotated controllers
- [ ] Pagination and sorting
- [ ] API versioning (new native support in Spring 7)
- [ ] `RestClient` / `WebClient` in Kotlin, extension functions like `awaitBody`
- [ ] Jackson vs kotlinx.serialization

## 5. Coroutines in Spring ⭐
- [ ] `suspend` controller functions in Spring MVC and WebFlux
- [ ] Coroutines vs reactive types (`Mono`/`Flux`) and interop (`awaitSingle`, `asFlow`, `mono {}`)
- [ ] `Flow` return types from controllers (streaming responses)
- [ ] Coroutine context, dispatchers, and blocking calls (`Dispatchers.IO`, `runInterruptible`)
- [ ] Structured concurrency: `coroutineScope`, `async` for parallel service calls
- [ ] Exception handling and cancellation in request handlers
- [ ] Coroutines vs Java virtual threads: when to choose which
- [ ] Why `runBlocking` inside a controller is a bad idea
- [ ] Propagating security and tracing context across coroutines

## 6. Data Access ⭐
- [ ] **JPA entities in Kotlin**: why `data class` is a bad entity (`equals`/`hashCode`, `copy`, lazy proxies, mutable state)
- [ ] Using regular classes with `var` properties, `open` via the plugins, and nullable IDs
- [ ] Entity design: `lateinit` vs nullable vs default values
- [ ] N+1 problem, lazy vs eager loading
- [ ] `@Transactional` rules, propagation, and self-invocation
- [ ] Spring Data JPA repositories with Kotlin (nullable return types instead of `Optional`)
- [ ] Spring Data R2DBC and coroutine repositories (`CoroutineCrudRepository`)
- [ ] Exposed / jOOQ / JdbcClient as alternatives
- [ ] Transactions with coroutines (limits of `@Transactional` and reactive transactions)
- [ ] Flyway/Liquibase migrations
- [ ] Projections with data classes / DTO queries

## 7. Kotlin DSLs in Spring
- [ ] Bean definition DSL
- [ ] Router DSL (functional endpoints)
- [ ] Spring Security Kotlin DSL (`http { authorizeHttpRequests { } }`)
- [ ] MockMvc Kotlin DSL
- [ ] When DSLs help and when annotations are clearer

## 8. Security
- [ ] `SecurityFilterChain` with the Kotlin DSL
- [ ] JWT authentication and validation
- [ ] OAuth2 / OpenID Connect resource server basics
- [ ] Method security (`@PreAuthorize`)
- [ ] CORS, CSRF, stateless sessions, password hashing
- [ ] Reading the current user in coroutine-based code

## 9. Error Handling and Design
- [ ] Exceptions vs sealed `Result` types (`Either`-style) in service layers
- [ ] Kotlin's `Result` / `runCatching`: pitfalls, especially with cancellation
- [ ] Custom exceptions and mapping them to HTTP status codes
- [ ] Layered architecture (controller → service → repository), clean/hexagonal architecture
- [ ] Immutability and thread safety in service beans
- [ ] Common patterns: repository, mapper, strategy via sealed classes

## 10. Testing ⭐
- [ ] JUnit 5 with Kotlin (backtick test names, `assertThrows`)
- [ ] **MockK** vs Mockito (and why MockK suits Kotlin)
- [ ] `@MockkBean` / `@MockitoBean` in Spring tests
- [ ] `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`
- [ ] `runTest` for coroutines, Turbine for `Flow`
- [ ] `WebTestClient` and coroutine test support
- [ ] Testcontainers for DB and messaging
- [ ] Kotest / assertion libraries (optional)

## 11. Microservices, Messaging and Performance
- [ ] Kafka producers/consumers with Kotlin, serialization choices
- [ ] Resilience: circuit breaker, retry (Spring's built-in retry vs Resilience4j)
- [ ] Idempotency, outbox pattern, Saga basics
- [ ] Caching with `@Cacheable` (note the all-open requirement) and Redis
- [ ] Observability: Micrometer, tracing, structured logging in Kotlin
- [ ] Logging idioms (`KotlinLogging` or a companion-object logger)
- [ ] Startup time and native images (GraalVM), Kotlin reflection cost

## 12. Build, Deployment and Migration
- [ ] Gradle Kotlin DSL, version catalogs, multi-module builds
- [ ] Kotlin compiler options for Spring (`-Xjsr305=strict`, `-java-parameters`)
- [ ] Docker multi-stage builds for Kotlin apps
- [ ] CI/CD basics
- [ ] Migrating a Java Spring service to Kotlin incrementally
- [ ] Spring Boot 3 → 4 upgrade points that touch Kotlin code

## 13. Project Story
- [ ] Self-introduction (60 seconds)
- [ ] End-to-end walkthrough of your backend project
- [ ] Why you chose Kotlin over Java for it
- [ ] Biggest challenge and one production issue you solved

---

## Classic "Kotlin + Spring" questions (prepare short answers)
- [ ] Why can't you use `data class` for JPA entities?
- [ ] Why do we need the `kotlin-spring` and `kotlin-jpa` plugins?
- [ ] How does Spring handle Kotlin nullability in request bodies?
- [ ] `suspend` controller vs `Mono`/`Flux` vs virtual threads?
- [ ] How do you run blocking JPA calls safely inside coroutines?
- [ ] `@field:` vs `@get:` vs `@param:` for validation annotations?
- [ ] MockK vs Mockito?
- [ ] Constructor injection with `val` properties: how does it work?

## Priority if time is short
1. Segment 1 (plugins and setup) and the classic questions above
2. Kotlin language essentials
3. REST APIs, JPA entity rules, `@Transactional`
4. Coroutines and Flow in Spring
5. Testing with MockK
6. Security and microservices basics
7. Your project story
