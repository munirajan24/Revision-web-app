# Kotlin Interview Checklist (Android Developer)

## 1. Language Basics
- [ ] `val` vs `var` vs `const val` (and `lateinit` vs `lazy`)
- [ ] Null safety: `?`, `?.`, `?:`, `!!`, `let`, safe casts (`as?`)
- [ ] Type inference, smart casts, `Any` / `Unit` / `Nothing`
- [ ] `when` expression (as expression, with `is`, ranges)
- [ ] String templates, ranges, loops, `==` vs `===`
- [ ] Functions: default and named arguments, single-expression functions, `vararg`
- [ ] Top-level functions and `@JvmStatic` / `@JvmOverloads` / `@JvmField`

## 2. OOP in Kotlin
- [ ] Classes are `final` by default; `open`, `abstract`, `override`
- [ ] Primary vs secondary constructors, `init` blocks
- [ ] Visibility modifiers (`internal` especially)
- [ ] **Data class** (`copy`, `componentN`, `equals`/`hashCode`, limits)
- [ ] **Sealed class vs sealed interface vs enum** (very common question)
- [ ] `object`, `companion object`, object expression (anonymous object)
- [ ] Interfaces with default implementations
- [ ] Inner vs nested class
- [ ] Delegation: `by` for classes and properties, custom delegates
- [ ] `value class` (inline class)

## 3. Functional Programming and Collections
- [ ] Lambdas, higher-order functions, function types
- [ ] `it` and trailing lambda syntax
- [ ] `map`, `filter`, `flatMap`, `fold`, `reduce`, `groupBy`, `associate`, `zip`, `partition`
- [ ] `List` vs `MutableList`, `Set`, `Map`, `Array`
- [ ] **Sequence vs Iterable** (lazy vs eager)
- [ ] `inline`, `noinline`, `crossinline`, `reified`
- [ ] Extension functions and properties (how they work, no true override)
- [ ] Infix functions, operator overloading

## 4. Scope Functions (guaranteed question)
- [ ] `let`, `run`, `with`, `apply`, `also`: what each returns and whether it uses `this` or `it`
- [ ] When to use which, with real Android examples

## 5. Generics
- [ ] Generic classes and functions, upper bounds
- [ ] **`in` / `out` variance** and declaration-site vs use-site
- [ ] Star projection `*`
- [ ] `reified` and type erasure

## 6. Coroutines (most important area)
- [ ] What a coroutine is and how it differs from a thread
- [ ] `suspend` functions: how they work (state machine, continuation)
- [ ] `launch` vs `async` vs `runBlocking`
- [ ] `CoroutineScope`, `CoroutineContext`, `Job`, `SupervisorJob`
- [ ] **Dispatchers**: Main, IO, Default, Unconfined
- [ ] `viewModelScope`, `lifecycleScope`, `repeatOnLifecycle`
- [ ] `withContext`
- [ ] Structured concurrency
- [ ] Exception handling: `try/catch`, `CoroutineExceptionHandler`, `supervisorScope`
- [ ] Cancellation: cooperative cancellation, `isActive`, `ensureActive`, `CancellationException`
- [ ] `coroutineScope` vs `supervisorScope`
- [ ] `GlobalScope` and why to avoid it

## 7. Flow
- [ ] Cold (Flow) vs hot (StateFlow, SharedFlow)
- [ ] **StateFlow vs SharedFlow vs LiveData**
- [ ] `flow {}`, `emit`, `collect`, `collectLatest`
- [ ] Operators: `map`, `filter`, `flatMapLatest`, `combine`, `zip`, `debounce`, `distinctUntilChanged`
- [ ] `flowOn`, `catch`, `onEach`, `onCompletion`
- [ ] `stateIn`, `shareIn`, `callbackFlow`, `channelFlow`
- [ ] Channels and backpressure/buffering
- [ ] Collecting flows safely in UI (`collectAsStateWithLifecycle`)

## 8. Kotlin and Java Interop
- [ ] Calling Java from Kotlin: platform types (`String!`)
- [ ] `@Nullable` / `@NotNull` annotations
- [ ] `@Throws`, `@JvmName`
- [ ] How Kotlin compiles to bytecode (Show Kotlin Bytecode → decompile)

## 9. Kotlin in Android-Specific Context
- [ ] `lateinit` vs `lazy` in Activities/Fragments
- [ ] View binding and delegates (`by viewModels()`)
- [ ] Extension functions for Views/Context
- [ ] Parcelize (`@Parcelize`) vs Serializable
- [ ] Sealed classes for UI state / Result handling
- [ ] Kotlin with Compose: `remember`, state hoisting, lambdas as parameters
- [ ] Coroutines with Room, Retrofit, WorkManager
- [ ] Memory leaks with lambdas and coroutines
- [ ] Kotlin DSL for Gradle (`build.gradle.kts`)
- [ ] Hilt/Dagger with Kotlin, KSP vs KAPT

## 10. Advanced and Frequently Missed
- [ ] `typealias`
- [ ] Destructuring declarations
- [ ] `Pair` / `Triple`
- [ ] `Result` type and `runCatching`
- [ ] Contracts, `@DslMarker`
- [ ] `tailrec`
- [ ] `lateinit` limitations (no primitives, no null)
- [ ] `by lazy` thread-safety modes
- [ ] Backing fields and custom getters/setters (`field`)
- [ ] Kotlin Multiplatform basics (`expect` / `actual`) if you list KMP on your resume

## 11. Classic "Compare and Contrast" Questions
Prepare a crisp one-line answer for each:
- [ ] `val` vs `const val`
- [ ] `lateinit` vs `lazy`
- [ ] `open` vs `abstract`
- [ ] `sealed class` vs `enum`
- [ ] `data class` vs regular class
- [ ] `object` vs `companion object`
- [ ] `apply` vs `also`, `let` vs `run`
- [ ] `launch` vs `async`
- [ ] `Flow` vs `LiveData`
- [ ] `StateFlow` vs `SharedFlow`
- [ ] `Sequence` vs `List`
- [ ] `inline` vs `noinline` vs `crossinline`
- [ ] `==` vs `===`
- [ ] Kotlin vs Java (top 5 advantages)

## 12. Coding Practice Tasks
- [ ] Reverse a string / check palindrome
- [ ] Find duplicates or the first non-repeating character
- [ ] FizzBuzz, Fibonacci, prime check
- [ ] Two Sum, anagram check, group anagrams
- [ ] Write a custom extension function
- [ ] Write a sealed class `Result<T>` with `Success` / `Error` / `Loading`
- [ ] Write a simple coroutine with parallel `async` calls
- [ ] Implement a debounced search using Flow
- [ ] Write a singleton in Kotlin

---

## Priority order if time is short
1. Coroutines and Flow
2. Scope functions
3. Null safety
4. Sealed/data classes, `object`/`companion`
5. Collections, lambdas, higher-order functions
6. Generics (`in`/`out`) and `inline`/`reified`
7. Delegation and `lazy`/`lateinit`
8. Java interop
