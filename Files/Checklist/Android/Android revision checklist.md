# Android Interview Checklist: Segment-wise (Modern Stack)

---

## 1: Kotlin Core
- [ ] `val` vs `var` vs `const val`; `lateinit` vs `lazy`
- [ ] How does Kotlin null safety work? (`?.`, `?:`, `!!`, `let`)
- [ ] `data class` vs `sealed class` vs `enum` vs `sealed interface`
- [ ] `object` vs `companion object`
- [ ] Scope functions: `let`, `run`, `with`, `apply`, `also`
- [ ] Extension functions: how they work internally, limitations
- [ ] `inline`, `noinline`, `crossinline`, `reified`
- [ ] Higher-order functions and lambdas
- [ ] `in` / `out` variance, generics
- [ ] `Sequence` vs `List`
- [ ] Delegation (`by lazy`, `by viewModels`, custom delegate)
- [ ] `value class`, `typealias`, destructuring

## 2: Coroutines
- [ ] Coroutine vs thread
- [ ] How `suspend` works internally (continuation, state machine)
- [ ] `launch` vs `async` vs `runBlocking`
- [ ] Dispatchers: Main, IO, Default
- [ ] `withContext` vs `launch`
- [ ] Structured concurrency, `Job`, `SupervisorJob`
- [ ] `coroutineScope` vs `supervisorScope`
- [ ] Exception handling and `CoroutineExceptionHandler`
- [ ] Cancellation (cooperative, `ensureActive`, `CancellationException`)
- [ ] `viewModelScope` vs `lifecycleScope` vs `GlobalScope`
- [ ] Running parallel API calls and combining results

## 3: Flow
- [ ] Cold vs hot flows
- [ ] `StateFlow` vs `SharedFlow` vs `LiveData`
- [ ] `stateIn` vs `shareIn`, and `WhileSubscribed`
- [ ] Operators: `map`, `filter`, `combine`, `zip`, `flatMapLatest`, `debounce`, `distinctUntilChanged`
- [ ] `flowOn`, `catch`, `onCompletion`
- [ ] `callbackFlow`, `channelFlow`
- [ ] Collecting safely in UI (`repeatOnLifecycle`, `collectAsStateWithLifecycle`)
- [ ] Implement debounced search with Flow
- [ ] One-time events with Channel/SharedFlow

## 4: Jetpack Compose
- [ ] Declarative vs imperative UI
- [ ] What is recomposition, and what triggers it?
- [ ] `remember` vs `rememberSaveable`
- [ ] `derivedStateOf`, `snapshotFlow`
- [ ] State hoisting and unidirectional data flow
- [ ] Side effects: `LaunchedEffect`, `DisposableEffect`, `SideEffect`, `rememberCoroutineScope`
- [ ] Stable vs unstable types, `@Stable` / `@Immutable`
- [ ] How to avoid unnecessary recompositions
- [ ] `LazyColumn`: keys, `contentType`, performance
- [ ] Modifier order and why it matters
- [ ] `CompositionLocal`
- [ ] Custom layouts and `Canvas` (basic)
- [ ] Compose + Views interop (`AndroidView`, `ComposeView`)
- [ ] Theming with Material 3
- [ ] Testing Compose UI

## 5: Architecture
- [ ] SOLID and common design patterns
- [ ] MVVM vs MVI
- [ ] Clean Architecture layers and dependency rule
- [ ] Repository pattern, single source of truth
- [ ] Use case / interactor: when it's worth it
- [ ] Modeling UI state (sealed class vs data class)
- [ ] Handling one-time events (navigation, snackbar)


## 6: ViewModel and Lifecycle (modern framing)
- [ ] Why ViewModel survives configuration changes
- [ ] ViewModel vs `onSaveInstanceState` vs `SavedStateHandle`
- [ ] Handling process death
- [ ] Single-Activity architecture: why and how
- [ ] Lifecycle-aware collection of state
- [ ] ViewModel scoping (per screen, per navigation graph)
- [ ] Short answer ready for Activity lifecycle callbacks, just in case

## 7: Dependency Injection (Hilt)
- [ ] What is DI, and why use it?
- [ ] Hilt vs Dagger vs Koin
- [ ] `@Inject`, `@Module`, `@Provides` vs `@Binds`
- [ ] `@InstallIn` and component scopes
- [ ] `@Singleton` vs `@ViewModelScoped` vs `@ActivityRetainedScoped`
- [ ] `@HiltViewModel`, `@AndroidEntryPoint`
- [ ] Qualifiers (`@Named`)
- [ ] Replacing dependencies in tests

## 8: Data Layer (Networking and Storage)
- [ ] How Retrofit works internally
- [ ] OkHttp interceptors (auth, logging), `Authenticator` for token refresh
- [ ] Error handling and `Result` wrapper pattern
- [ ] Room: entities, DAO, relations, migrations, `@Transaction`, Flow queries
- [ ] DataStore (Preferences vs Proto) vs SharedPreferences
- [ ] Caching strategy (network + database)
- [ ] Paging 3 (`PagingSource`, `RemoteMediator`)
- [ ] Image loading with Coil/Glide
- [ ] JSON parsing options (Moshi, kotlinx.serialization, Gson)

## 9: Navigation
- [ ] Navigation Compose: routes, arguments, back stack
- [ ] Type-safe navigation
- [ ] Nested graphs and bottom navigation state saving
- [ ] Deep links and App Links
- [ ] Sharing a ViewModel between screens
- [ ] Passing results between screens

## 10: Background Work and System Features
- [ ] WorkManager vs foreground service vs AlarmManager
- [ ] WorkManager constraints, chaining, periodic work
- [ ] Foreground service types and restrictions
- [ ] Doze mode and background limits
- [ ] (not important)FCM: data vs notification messages, token handling
- [ ] (not important)Notification channels and Android 13+ permission
- [ ] (not important)Runtime permissions flow

## 11: Performance and Memory
- [ ] Common memory leaks and how to find them (LeakCanary)
- [ ] What causes ANR, and how to prevent it?
- [ ] Reducing app startup time, Baseline Profiles
- [ ] Compose performance tools (Layout Inspector recomposition counts)
- [ ] R8/ProGuard: shrinking, obfuscation, keep rules
- [ ] (not important)APK vs AAB, reducing app size
- [ ] Android Profiler usage
- [ ] StrictMode

## 12: Testing
- [ ] (not important)Testing pyramid, unit vs instrumented tests
- [ ] Testing ViewModel with `runTest` and `TestDispatcher`
- [ ] Testing Flow with Turbine
- [ ] MockK/Mockito, fake vs mock vs stub
- [ ] Compose UI testing
- [ ] Testing Room and repositories
- [ ] TDD basics

## 13: Security
- [ ] Secure storage: Keystore, EncryptedSharedPreferences
- [ ] SSL pinning, network security config
- [ ] (not important)Biometric authentication
- [ ] Protecting API keys
- [ ] R8 obfuscation, root detection, Play Integrity
- [ ] (not important)Exported components and WebView risks


## 14: Legacy Knowledge (short answers only)
- [ ] RxJava basics (only if your target company uses it)

---

