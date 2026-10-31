export type AndroidConceptId = 'coroutines' | 'flow' | 'architecture' | 'compose';
export type PrepDifficulty = 'Fundamental' | 'Intermediate' | 'Advanced';
export type PrepMode = 'concept' | 'programming';

export interface AndroidConceptExercise {
  problem: string;
  requirements: string[];
  starterCode: string;
  expectedBehavior: string;
  solutionCode: string;
  explanation: string;
  tests: string;
  commonMistakes: string[];
}

export interface AndroidConceptQuestion {
  id: string;
  conceptId: AndroidConceptId;
  concept: string;
  subtopic: string;
  difficulty: PrepDifficulty;
  interviewQuestion: string;
  answer: string;
  exercise: AndroidConceptExercise;
}

export interface AndroidConcept {
  id: AndroidConceptId;
  name: string;
  description: string;
  topics: AndroidConceptQuestion[];
}

export const androidConcepts: AndroidConcept[] = [
  {
    id: 'coroutines',
    name: 'Kotlin Coroutines',
    description: 'Structured asynchronous work, cancellation, dispatchers, error handling, and Android lifecycle integration.',
    topics: [
      {
        id: 'co-launch-async',
        conceptId: 'coroutines',
        concept: 'Kotlin Coroutines',
        subtopic: 'launch, async, and await',
        difficulty: 'Fundamental',
        interviewQuestion: 'When would you use launch versus async, and what does await do?',
        answer: `\`launch\` starts a coroutine for work whose result is not needed and returns a \`Job\`. \`async\` starts work that produces a value and returns a \`Deferred<T>\`; \`await()\` suspends until that value is available, or rethrows the deferred's failure.

\`\`\`kotlin
coroutineScope {
    val profile = async { repository.profile() }
    val settings = async { repository.settings() }
    render(profile.await(), settings.await())
}
\`\`\`

Both children start when created, so the independent requests can overlap. Calling \`await\` does not block a thread. Do not use \`GlobalScope\` to make work survive its owner, and do not launch a child just to immediately block on its result. For sequential dependent work, ordinary suspend calls are clearer. A child failure in a regular scope cancels its parent and siblings; use \`supervisorScope\` only when sibling work should fail independently.`,
        exercise: {
          problem: 'Fetch a user and their permissions concurrently, then return one dashboard model. Predict whether the requests overlap and implement the suspending function.',
          requirements: ['Use structured concurrency and async/await for the two independent calls.', 'Do not block a thread or use GlobalScope.', 'Propagate either request failure to the caller.'],
          starterCode: `data class Dashboard(val name: String, val permissions: List<String>)

suspend fun loadDashboard(api: DashboardApi): Dashboard {
    // TODO fetch profile and permissions concurrently
    TODO()
}`,
          expectedBehavior: 'Both API methods begin before either result is required; the function returns one Dashboard after both succeed. A failure is reported to the caller and cancels the sibling request.',
          solutionCode: `suspend fun loadDashboard(api: DashboardApi): Dashboard = coroutineScope {
    val profile = async { api.fetchProfile() }
    val permissions = async { api.fetchPermissions() }
    Dashboard(
        name = profile.await().name,
        permissions = permissions.await(),
    )
}`,
          explanation: 'coroutineScope keeps both Deferred values as children of the caller. If one fails, structured concurrency cancels its sibling instead of leaving an orphan request.',
          tests: `// With a fake API, assert both calls were started before either is completed.
// Complete both deferred responses and assert the resulting Dashboard fields.
// Make fetchProfile throw and assert loadDashboard fails and fetchPermissions is cancelled.`,
          commonMistakes: ['Calling runBlocking from Android UI code.', 'Using launch and then trying to retrieve a result from Job.', 'Awaiting the first operation before starting the second.', 'Swallowing an exception and returning an incomplete dashboard.'],
        },
      },
      {
        id: 'co-suspend-context',
        conceptId: 'coroutines',
        concept: 'Kotlin Coroutines',
        subtopic: 'suspend, withContext, and dispatchers',
        difficulty: 'Intermediate',
        interviewQuestion: 'What does suspend mean? How do dispatchers and withContext affect execution?',
        answer: `A \`suspend\` function may suspend without blocking its thread and can call other suspending functions. The keyword does not itself move work off the main thread. A dispatcher controls which thread or thread pool executes coroutine code: typically \`Dispatchers.Main\` for UI, \`IO\` for blocking I/O, and \`Default\` for CPU-heavy work.

\`\`\`kotlin
suspend fun readSettings(): Settings = withContext(Dispatchers.IO) {
    settingsFile.read()
}
\`\`\`

\`withContext\` suspends the caller, runs the block in the requested context, and returns its result. Prefer injecting dispatchers into repositories/use cases so tests can substitute a test dispatcher. Retrofit and Room suspend APIs are already main-safe; wrapping every suspend call in \`IO\` is unnecessary. Keep CPU work off Main, and switch back to Main only when needed (Android UI APIs generally require it).`,
        exercise: {
          problem: 'Make a legacy blocking file read safe to call from a ViewModel while keeping the dispatcher testable.',
          requirements: ['Expose a suspend function.', 'Move only the blocking read to an injected dispatcher.', 'Return the parsed result and let errors reach the caller.'],
          starterCode: `class SettingsRepository(
    private val file: LegacySettingsFile,
    private val ioDispatcher: CoroutineDispatcher,
) {
    suspend fun load(): Settings {
        // TODO
    }
}`,
          expectedBehavior: 'load suspends its caller while the blocking read runs on ioDispatcher, then returns the parsed Settings. It never blocks the main thread.',
          solutionCode: `class SettingsRepository(
    private val file: LegacySettingsFile,
    private val ioDispatcher: CoroutineDispatcher,
) {
    suspend fun load(): Settings = withContext(ioDispatcher) {
        file.readSettings()
    }
}`,
          explanation: 'The injected dispatcher makes thread policy explicit and controllable in tests. withContext returns the block value and preserves cancellation and exceptions.',
          tests: `// Inject a test dispatcher and a fake file; assert load returns the fake Settings.
// Configure the fake to throw and assert the exception is propagated.
// In a dispatcher test, verify the blocking function is invoked while the test dispatcher is active.`,
          commonMistakes: ['Assuming suspend automatically means background execution.', 'Using Dispatchers.IO for CPU-intensive transformations.', 'Catching every exception and returning a fake success value.', 'Hard-coding a dispatcher in code that needs deterministic tests.'],
        },
      },
      {
        id: 'co-structure-cancel',
        conceptId: 'coroutines',
        concept: 'Kotlin Coroutines',
        subtopic: 'Coroutine scopes, structured concurrency, and cancellation',
        difficulty: 'Advanced',
        interviewQuestion: 'How do coroutine scopes enforce structured concurrency, and how should cancellation be handled?',
        answer: `A \`CoroutineScope\` provides a parent \`Job\` and context. Structured concurrency requires child jobs to finish or be cancelled before the parent completes, which bounds lifetime and propagates cancellation. Use a scope owned by the feature: \`viewModelScope\` for ViewModel work, \`lifecycleScope\` for a Lifecycle owner, or a lexical \`coroutineScope\` for a suspending operation.

Cancellation is cooperative: suspending functions check it, and CPU loops should call \`ensureActive()\` or check \`isActive\`. Do not catch and ignore \`CancellationException\`; if catching broadly, rethrow it. Avoid \`GlobalScope\`, manually detached jobs, and a long-lived scope without an explicit owner. Use \`NonCancellable\` only for short cleanup that must finish.`,
        exercise: {
          problem: 'Fix a screen refresh that starts two requests but leaves one running when the other fails or the user leaves.',
          requirements: ['Tie the work to the supplied parent scope.', 'Cancel both requests when the caller is cancelled.', 'Do not swallow cancellation.'],
          starterCode: `suspend fun refresh(scope: CoroutineScope, api: Api): Pair<Item, Item> {
    val first = scope.async { api.first() }
    val second = scope.async { api.second() }
    return try {
        first.await() to second.await()
    } catch (error: Exception) {
        Item.empty() to Item.empty()
    }
}`,
          expectedBehavior: 'Both requests are children of the refresh operation. Cancellation cancels both; a real failure is propagated rather than disguised as empty data.',
          solutionCode: `suspend fun refresh(api: Api): Pair<Item, Item> = coroutineScope {
    val first = async { api.first() }
    val second = async { api.second() }
    first.await() to second.await()
}`,
          explanation: 'The lexical coroutineScope is the correct owner for work required to complete refresh. A regular child failure cancels its sibling. The caller can invoke refresh from viewModelScope, so screen lifetime is respected.',
          tests: `// Use CompletableDeferred-backed fake requests and cancel the parent; assert both are cancelled.
// Make either request fail; assert its panel is Error and the sibling still completes.
// Complete both requests; assert the returned pair contains both values.`,
          commonMistakes: ['Passing an unrelated long-lived scope into a suspend function.', 'Catching Exception without rethrowing CancellationException.', 'Creating child jobs whose lifetime is not joined to the parent.', 'Using a supervisor when the result requires both values.'],
        },
      },
      {
        id: 'co-errors-lifecycle',
        conceptId: 'coroutines',
        concept: 'Kotlin Coroutines',
        subtopic: 'Exception handling, supervisorScope, and Android lifecycle',
        difficulty: 'Advanced',
        interviewQuestion: 'How do coroutine exceptions differ between launch and async, and when do supervisorScope and lifecycle scopes help?',
        answer: `An uncaught exception from \`launch\` is reported to its parent/handler; an \`async\` exception is stored and rethrown by \`await()\`. A \`CoroutineExceptionHandler\` is for uncaught root-coroutine failures, not a replacement for handling expected errors around an operation.

\`supervisorScope\` prevents one child failure from cancelling its siblings, but the failed child still needs its own error handling. Use it when independent dashboard panels can succeed separately. In Android, \`viewModelScope\` cancels work when the ViewModel is cleared; collect UI state with \`repeatOnLifecycle(STARTED)\` (or Compose's lifecycle-aware collection) so collection stops while the UI is stopped. Put durable work in WorkManager, not a screen scope.`,
        exercise: {
          problem: 'Load profile and recommendations independently in a ViewModel. A recommendations failure must not discard a valid profile.',
          requirements: ['Use viewModelScope for screen-owned work.', 'Use supervisorScope so sibling jobs do not cancel each other.', 'Represent each request failure in UI state; do not hide cancellation.'],
          starterCode: `class HomeViewModel(
    private val repository: HomeRepository,
) : ViewModel() {
    fun refresh() {
        // TODO load the two independent panels
    }
}`,
          expectedBehavior: 'Profile can be shown if recommendations fail, and vice versa. Clearing the ViewModel cancels both requests.',
          solutionCode: `class HomeViewModel(
    private val repository: HomeRepository,
) : ViewModel() {
              private val _profile = MutableStateFlow<HomePanelState>(HomePanelState.Loading)
              val profile: StateFlow<HomePanelState> = _profile.asStateFlow()
              private val _recommendations = MutableStateFlow<HomePanelState>(HomePanelState.Loading)
              val recommendations: StateFlow<HomePanelState> = _recommendations.asStateFlow()

              fun refresh() = viewModelScope.launch {
                  supervisorScope {
                      launch {
                          _profile.value = try {
                              HomePanelState.Content(repository.profile())
                          } catch (cancelled: CancellationException) {
                              throw cancelled
                          } catch (error: IOException) {
                              HomePanelState.Error(error)
                          }
                      }
                      launch {
                          _recommendations.value = try {
                    HomePanelState.Content(repository.recommendations())
                } catch (cancelled: CancellationException) {
                    throw cancelled
                } catch (error: IOException) {
                    HomePanelState.Error(error)
                }
            }
        }
    }
}`,
          explanation: 'Each child converts only its expected I/O failure to its own panel state. The supervisor isolates siblings; viewModelScope remains the owner and cancellation still propagates.',
          tests: `// Fake profile success + recommendations IOException: assert profile is Content and recommendations is Error.
// Fake both success: assert both panels become Content.
// Cancel/clear the ViewModel during a pending request and assert the fake request is cancelled.`,
          commonMistakes: ['Assuming supervisorScope handles a child failure automatically.', 'Using a global exception handler for expected network errors.', 'Catching CancellationException as a normal error.', 'Collecting a flow forever from an Activity without lifecycle awareness.'],
        },
      },
    ],
  },
  {
    id: 'flow',
    name: 'Kotlin Flow',
    description: 'Cold and hot streams, transformations, backpressure, error handling, lifecycle collection, and tests.',
    topics: [
      {
        id: 'fl-cold-hot',
        conceptId: 'flow',
        concept: 'Kotlin Flow',
        subtopic: 'Cold Flow, hot Flow, StateFlow, and SharedFlow',
        difficulty: 'Fundamental',
        interviewQuestion: 'Compare cold Flow with StateFlow and SharedFlow. When should Android code use each?',
        answer: `A regular \`flow { }\` is cold: its block starts for each collector, and it has no value until collected. \`StateFlow\` is hot, always has a current value, replays the latest state to new collectors, and conflates updates; it is a good ViewModel UI-state holder. \`SharedFlow\` is a configurable hot broadcast stream with replay and buffer settings; it can represent shared events, though event delivery and replay semantics must be chosen deliberately.

\`\`\`kotlin
private val _uiState = MutableStateFlow(SearchUiState())
val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()
private val _notices = MutableSharedFlow<Notice>()
val notices = _notices.asSharedFlow()
\`\`\`

Use \`collect\` in a lifecycle-aware scope. A cold flow can perform work again per collector; use sharing operators only when sharing/replay is intended. StateFlow is not a durable event queue, and SharedFlow with replay zero does not retain an event for a collector that is absent.`,
        exercise: {
          problem: 'Predict and implement a cold stream that emits values whenever collected. Two collectors should each trigger the producer.',
          requirements: ['Create a cold Flow of 1, 2, and 3.', 'Transform values to their squares.', 'Collect twice and explain the producer execution count.'],
          starterCode: `fun squares(): Flow<Int> = flow {
    // TODO emit 1, 2, 3
}.map { value ->
    // TODO square
}`,
          expectedBehavior: 'Each collection receives [1, 4, 9], and the flow builder executes twice (once per collector).',
          solutionCode: `fun squares(): Flow<Int> = flow {
    emit(1)
    emit(2)
    emit(3)
}.map { value -> value * value }

suspend fun collectTwice(): Pair<List<Int>, List<Int>> {
    val first = squares().toList()
    val second = squares().toList()
    return first to second
}`,
          explanation: 'flow creates a cold stream; map is a stateless transformation and does not start work until terminal collection.',
          tests: `runTest {
    assertEquals(listOf(1, 4, 9), squares().toList())
    assertEquals(listOf(1, 4, 9), squares().toList())
}`,
          commonMistakes: ['Assuming declaring a Flow starts execution.', 'Confusing a cold Flow with a shared StateFlow.', 'Using StateFlow for one-time events without considering replay.', 'Forgetting that collect is suspending and usually does not return.'],
        },
      },
      {
        id: 'fl-transform-search',
        conceptId: 'flow',
        concept: 'Kotlin Flow',
        subtopic: 'collect, collectLatest, map, filter, combine, and flatMapLatest',
        difficulty: 'Intermediate',
        interviewQuestion: 'How do Flow transformation and collection operators support a responsive search screen?',
        answer: `        Intermediate operators such as \`map\` and \`filter\` transform a stream (\`filter\` keeps only values matching a predicate); terminal operators such as \`collect\` start collection. \`combine\` emits using the latest value from each input. \`flatMapLatest\` cancels the previous inner flow when a new upstream value arrives, which is useful for search queries. \`collectLatest\` cancels the previous collector action when a new value arrives; it is appropriate for replaceable work such as rendering a result, not for required side effects.

\`\`\`kotlin
combine(query, filters) { q, f -> q to f }
    .flatMapLatest { (q, f) -> repository.search(q, f) }
    .collectLatest { results -> render(results) }
\`\`\`

Debounce user input when appropriate, keep cancellation cooperative, and distinguish cancelling an outdated request from cancelling work that must be completed.`,
        exercise: {
          problem: 'Complete a search pipeline so changes to either query or selected category cancel the previous search and publish only current results.',
          requirements: ['Combine query and category StateFlows.', 'Ignore blank query strings.', 'Use flatMapLatest to cancel stale requests and map to UI state.'],
          starterCode: `fun searchResults(
    query: Flow<String>,
    category: Flow<Category>,
    repository: SearchRepository,
): Flow<SearchState> {
    // TODO
}`,
          expectedBehavior: 'A new query or category invalidates the previous search. Blank input emits the empty state without calling the repository.',
          solutionCode: `fun searchResults(
    query: Flow<String>,
    category: Flow<Category>,
    repository: SearchRepository,
): Flow<SearchState> =
    combine(query, category) { text, selected -> text.trim() to selected }
        .distinctUntilChanged()
        .flatMapLatest { (text, selected) ->
            if (text.isBlank()) {
                flowOf(SearchState.Empty)
            } else {
                repository.search(text, selected)
                    .map<List<Result>, SearchState> { SearchState.Results(it) }
                    .onStart { emit(SearchState.Loading) }
            }
        }`,
          explanation: 'combine reacts to either input; flatMapLatest cancels the old inner search. The blank-query branch prevents unnecessary repository work.',
          tests: `runTest {
    val states = searchResults(
        flowOf("  ", " kotlin "),
        flowOf(Category.All),
        fakeRepository,
    ).toList()
    assertEquals(SearchState.Empty, states.first())
    assertEquals("kotlin", fakeRepository.lastQuery)
    assertTrue(states.any { it is SearchState.Results })
}`,
          commonMistakes: ['Using flatMapConcat so outdated requests queue up.', 'Using collectLatest where a transform is required.', 'Forgetting that combine needs every upstream to emit once.', 'Failing to normalize or deduplicate query input.'],
        },
      },
      {
        id: 'fl-context-backpressure',
        conceptId: 'flow',
        concept: 'Kotlin Flow',
        subtopic: 'flowOn, buffer, conflate, catch, and cancellation',
        difficulty: 'Advanced',
        interviewQuestion: 'Explain Flow context and backpressure operators, and describe where catch handles an exception.',
        answer: `By default, a Flow pipeline follows context-preservation rules: emit from the flow builder in its collection context. \`flowOn\` changes the context of operators upstream from it, not downstream collection. \`buffer\` lets upstream and downstream run concurrently with a channel; \`conflate\` keeps the newest value when a slow collector cannot keep up, intentionally skipping intermediates.

\`catch\` handles upstream exceptions at its position and can emit a fallback; it does not catch downstream collector exceptions, and it does not turn cancellation into a normal failure. Place it deliberately, preserve \`CancellationException\`, and do not use conflate for data where every item matters (payments or audit records).`,
        exercise: {
          problem: 'Repair the pipeline that emits from the wrong dispatcher and replaces cancellation with an empty list.',
          requirements: ['Run the expensive upstream transformation on the injected computation dispatcher.', 'Use catch for expected upstream I/O failure only.', 'Keep collector work downstream and preserve cancellation.'],
          starterCode: `fun observeItems(source: Flow<Item>, dispatcher: CoroutineDispatcher): Flow<Item> =
    source
        .map { expensiveTransform(it) }
        .catch { emit(Item.fallback()) }
        .flowOn(dispatcher)
`,
          expectedBehavior: 'The function returns a Flow, upstream mapping uses the supplied dispatcher, I/O errors can map to a documented fallback, and cancellation remains cancellation.',
          solutionCode: `fun observeItems(
    source: Flow<Item>,
    dispatcher: CoroutineDispatcher,
): Flow<Item> =
    source
        .map { expensiveTransform(it) }
        .flowOn(dispatcher)
        .catch { error ->
            if (error is CancellationException) throw error
            if (error is IOException) emit(Item.fallback())
            else throw error
        }`,
          explanation: 'flowOn belongs before collection and only shifts upstream work. Returning Flow<Item> lets the caller choose a terminal operator. The catch branch handles a known recoverable error and rethrows unknown failures.',
          tests: `runTest {
    val values = observeItems(flowOf(Item.sample()), testDispatcher).toList()
    assertEquals(listOf(Item.transformedSample()), values)
    val result = runCatching { observeItems(cancellableFlow(), testDispatcher).toList() }
    assertTrue(result.exceptionOrNull() is CancellationException)
}`,
          commonMistakes: ['Calling toList inside a function advertised as returning Flow.', 'Thinking flowOn changes the collector dispatcher.', 'Conflating a stream where every item must be processed.', 'Catching Throwable/Exception and emitting a success-shaped fallback for all failures.'],
        },
      },
      {
        id: 'fl-android-testing',
        conceptId: 'flow',
        concept: 'Kotlin Flow',
        subtopic: 'Android lifecycle collection and Flow testing',
        difficulty: 'Intermediate',
        interviewQuestion: 'How do you collect flows safely in Android and test StateFlow or a cold Flow?',
        answer: `For Views, collect UI streams inside \`repeatOnLifecycle(Lifecycle.State.STARTED)\`; collection is cancelled below STARTED and restarted when visible. In Compose, use \`collectAsStateWithLifecycle()\` for state rather than a bare \`collectAsState()\` in typical Android UI. Expose read-only StateFlow from a ViewModel.

Use \`runTest\` and a test dispatcher from \`kotlinx-coroutines-test\`; control virtual time and assert values. StateFlow conflates, so tests should generally assert current state or collect while updates happen. Turbine is a common optional library for event-oriented Flow assertions, but simple state tests can use kotlinx-coroutines-test alone.`,
        exercise: {
          problem: 'Write a deterministic unit test for a ViewModel that exposes Loading followed by Content from a repository Flow.',
          requirements: ['Use runTest and a fake repository.', 'Assert the final state without real delays.', 'Collect the state while it is being updated.'],
          starterCode: `class ItemsViewModel(repository: ItemsRepository) : ViewModel() {
    val state: StateFlow<ItemsState> = TODO()
}

@Test
fun itemsArePublished() = runTest {
    // TODO
}`,
          expectedBehavior: 'The test completes instantly and asserts the exact content produced by the fake. Production UI collection stops/restarts with lifecycle.',
          solutionCode: `class ItemsViewModel(repository: ItemsRepository) : ViewModel() {
    val state: StateFlow<ItemsState> = repository.items()
        .map<List<Item>, ItemsState> { ItemsState.Content(it) }
        .stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5_000),
            ItemsState.Loading,
        )
}

@Test
fun itemsArePublished() = runTest {
    val viewModel = ItemsViewModel(FakeItemsRepository(flowOf(listOf(Item.sample()))))
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
        viewModel.state.collect()
    }
    advanceUntilIdle()
    assertEquals(ItemsState.Content(listOf(Item.sample())), viewModel.state.value)
}`,
          explanation: 'stateIn turns the repository Flow into a lifecycle-friendly hot state in the ViewModel. The test uses the shared virtual scheduler and subscribes so WhileSubscribed starts upstream collection.',
          tests: `// Also test an empty repository result and an expected repository error.
// For UI instrumentation, move the Activity to STOPPED and verify lifecycle collection is inactive.
// Replace the fake flow with a MutableSharedFlow when testing explicitly hot events.`,
          commonMistakes: ['Using Thread.sleep or real delays in tests.', 'Forgetting WhileSubscribed requires a subscriber.', 'Asserting every intermediate StateFlow value despite conflation.', 'Collecting UI state in an unbounded Activity/Fragment coroutine.'],
        },
      },
    ],
  },
  {
    id: 'architecture',
    name: 'Clean Architecture',
    description: 'Layer boundaries, repository abstractions, use cases, dependency inversion, MVVM, DI, modularity, and tests.',
    topics: [
      {
        id: 'ca-layers-repository',
        conceptId: 'architecture',
        concept: 'Clean Architecture',
        subtopic: 'Presentation, domain, data layers, and repository pattern',
        difficulty: 'Fundamental',
        interviewQuestion: 'What belongs in the presentation, domain, and data layers, and what problem does a repository solve?',
        answer: `The presentation layer renders UI state and forwards user intent; the domain layer contains app-specific rules and use cases; the data layer coordinates sources such as network, database, and cache. A repository exposes a stable domain-facing contract and hides data-source selection and mapping.

The dependency direction should point inward: the domain defines abstractions, and data implements them. Keep Android framework types, Retrofit DTOs, and Room entities out of domain models when they would couple business rules to infrastructure. A repository is not automatically useful for every trivial wrapper—add it when it provides a meaningful boundary, source policy, or test seam.`,
        exercise: {
          problem: 'Refactor a ViewModel that directly calls Retrofit and renders a network DTO into a layered feature.',
          requirements: ['Define a domain model and repository interface.', 'Implement a data repository that maps the DTO.', 'Use a use case from the ViewModel and expose UI state.'],
          starterCode: `class UserViewModel(private val api: UserApi) : ViewModel() {
    val name = MutableStateFlow("")
    fun load(id: String) = viewModelScope.launch {
        name.value = api.user(id).displayName
    }
}`,
          expectedBehavior: 'The ViewModel depends on a domain use case, not Retrofit. DTO mapping stays in data, and the domain contract can be tested without Android or networking.',
          solutionCode: `data class User(val id: String, val name: String)

interface UserRepository {
    suspend fun getUser(id: String): User
}

class GetUser(private val repository: UserRepository) {
    suspend operator fun invoke(id: String): User = repository.getUser(id)
}

class UserViewModel(private val getUser: GetUser) : ViewModel() {
    private val _state = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val state = _state.asStateFlow()

    fun load(id: String) = viewModelScope.launch {
        _state.value = UserUiState.Content(getUser(id))
    }
}`,
          explanation: 'The domain owns User and the repository contract. The data implementation translates the API DTO. The presentation depends on a use case and converts results into UI state.',
          tests: `// Unit-test GetUser using a fake UserRepository and assert the returned domain model.
// Test UserViewModel with a fake use case and assert Content is published.
// Test DTO-to-domain mapping independently in the data module.`,
          commonMistakes: ['Putting Retrofit DTOs in the domain contract.', 'Making the ViewModel know API paths or persistence rules.', 'Adding pass-through abstractions that have no boundary or policy.', 'Letting domain depend on Android or data-layer classes.'],
        },
      },
      {
        id: 'ca-usecases-dip',
        conceptId: 'architecture',
        concept: 'Clean Architecture',
        subtopic: 'Use cases, dependency inversion, and separation of concerns',
        difficulty: 'Intermediate',
        interviewQuestion: 'When should a use case exist, and how does dependency inversion preserve separation of concerns?',
        answer: `A use case represents a meaningful application action or domain rule, especially when it coordinates repositories, validates a rule, or is reused. It should not be a class for every one-line getter by default. Dependency inversion means high-level policy depends on abstractions it owns; implementation details such as database and network adapters implement those abstractions.

\`\`\`kotlin
class SaveFavorite(private val repository: FavoriteRepository) {
    suspend operator fun invoke(id: String) {
        require(id.isNotBlank())
        repository.save(id)
    }
}
\`\`\`

This isolates the rule from the storage mechanism and makes tests fast. Keep orchestration in the appropriate layer; do not leak UI formatting or Android Context into domain logic.`,
        exercise: {
          problem: 'Implement a use case that saves an article only when its ID is valid and it is not already saved.',
          requirements: ['Depend on a repository interface.', 'Keep validation and policy in the use case.', 'Return a result that the UI can act on.'],
          starterCode: `interface ArticleRepository {
    suspend fun isSaved(id: String): Boolean
    suspend fun save(id: String)
}

class SaveArticle(private val repository: ArticleRepository) {
    suspend operator fun invoke(id: String): SaveResult {
        // TODO
    }
}`,
          expectedBehavior: 'Blank IDs are rejected; an existing article returns AlreadySaved; otherwise it is saved and returns Saved.',
          solutionCode: `sealed interface SaveResult {
    data object Saved : SaveResult
    data object AlreadySaved : SaveResult
    data object InvalidId : SaveResult
}

class SaveArticle(private val repository: ArticleRepository) {
    suspend operator fun invoke(id: String): SaveResult {
        if (id.isBlank()) return SaveResult.InvalidId
        if (repository.isSaved(id)) return SaveResult.AlreadySaved
        repository.save(id)
        return SaveResult.Saved
    }
}`,
          explanation: 'The use case applies business policy without knowing which data source implements ArticleRepository. Its explicit result makes branch behavior testable.',
          tests: `// Blank ID: InvalidId and verify the repository is not called.
// Already saved: AlreadySaved and verify save is not called.
// New ID: Saved and verify exactly one save call.`,
          commonMistakes: ['Returning Unit when callers need to distinguish outcomes.', 'Putting the duplicate check in a Composable or API client.', 'Using a concrete database implementation in the domain constructor.', 'Catching all failures and claiming the save succeeded.'],
        },
      },
      {
        id: 'ca-mvvm-di',
        conceptId: 'architecture',
        concept: 'Clean Architecture',
        subtopic: 'MVVM integration and dependency injection',
        difficulty: 'Intermediate',
        interviewQuestion: 'How does MVVM fit Clean Architecture, and where should dependency injection happen?',
        answer: `MVVM is a presentation pattern: a ViewModel turns user actions into state and exposes observable state for the View. Clean Architecture describes dependency boundaries, so they complement one another rather than compete. A ViewModel may invoke domain use cases; it should not become a repository or hold Activity views.

Dependency injection builds the object graph at the application/composition boundary (for example Hilt modules or a manual app container). Inject abstractions into policy code and provide concrete implementations from the outer layer. Scope dependencies to their real lifetime, and keep constructors explicit so tests can provide fakes.`,
        exercise: {
          problem: 'Complete a ViewModel with injected dependencies that exposes loading, success, and error state for a profile screen.',
          requirements: ['Keep UI state immutable to consumers.', 'Use a use case from viewModelScope.', 'Rethrow cancellation and map a known recoverable failure to an error state.'],
          starterCode: `sealed interface ProfileState {
    data object Loading : ProfileState
    data class Content(val profile: Profile) : ProfileState
    data class Error(val message: String) : ProfileState
}

class ProfileViewModel(private val getProfile: GetProfile) : ViewModel() {
    // TODO expose StateFlow and implement load()
}`,
          expectedBehavior: 'The ViewModel begins in Loading, publishes Content on success and a user-safe Error for an expected I/O failure. A cleared ViewModel cancels the request.',
          solutionCode: `class ProfileViewModel(private val getProfile: GetProfile) : ViewModel() {
    private val _state = MutableStateFlow<ProfileState>(ProfileState.Loading)
    val state: StateFlow<ProfileState> = _state.asStateFlow()

    fun load() = viewModelScope.launch {
        _state.value = ProfileState.Loading
        _state.value = try {
            ProfileState.Content(getProfile())
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (error: IOException) {
            ProfileState.Error("Profile could not be loaded")
        }
    }
}`,
          explanation: 'The ViewModel owns presentation state and lifecycle-bound work. The use case owns domain policy; DI supplies it through the constructor. Only a known I/O problem is translated for the UI.',
          tests: `// Fake GetProfile returns a profile: assert state is Content.
// Fake GetProfile throws IOException: assert a safe Error state.
// Fake GetProfile suspends and cancel the ViewModel scope: assert cancellation is not displayed as an error.`,
          commonMistakes: ['Exposing MutableStateFlow publicly.', 'Injecting Activity or View into a ViewModel.', 'Catching CancellationException as a user-visible error.', 'Constructing repositories inside the ViewModel.'],
        },
      },
      {
        id: 'ca-modules-tests',
        conceptId: 'architecture',
        concept: 'Clean Architecture',
        subtopic: 'Modularization and unit testing',
        difficulty: 'Advanced',
        interviewQuestion: 'How do you decide module boundaries, and what should each architecture layer test?',
        answer: `Modularize around stable ownership and dependency boundaries, not simply every package. A common direction is \`app -> feature/presentation -> domain <- data\`, with the app composition root wiring implementations. Avoid cycles, excessive public APIs, and splitting a small app into modules that add build complexity without useful isolation.

Unit-test domain rules with fakes; test ViewModels by driving actions and asserting observable state; test data mapping and repository policy with fake data sources; use integration tests for real database/network wiring. Test behavior at the narrowest reliable level, and keep tests independent of implementation details.`,
        exercise: {
          problem: 'Design a small offline-first article feature boundary and write a unit test for the repository selection policy.',
          requirements: ['Prefer cached data immediately when available.', 'Refresh cache from the remote source when online.', 'Keep data-source policy in data and test it with fakes.'],
          starterCode: `class ArticleRepositoryImpl(
    private val local: ArticleLocalDataSource,
    private val remote: ArticleRemoteDataSource,
) {
    suspend fun articles(online: Boolean): List<Article> {
        // TODO
    }
}`,
          expectedBehavior: 'Offline returns the cache and does not call remote. Online fetches remote, updates local cache, and returns the fresh list.',
          solutionCode: `class ArticleRepositoryImpl(
    private val local: ArticleLocalDataSource,
    private val remote: ArticleRemoteDataSource,
) : ArticleRepository {
    override suspend fun articles(online: Boolean): List<Article> {
        if (!online) return local.read()
        val fresh = remote.fetch()
        local.replace(fresh)
        return fresh
    }
}`,
          explanation: 'The data implementation owns cache/network policy while callers depend on ArticleRepository. Small fakes can validate the policy without an Android runtime.',
          tests: `// Offline: local has cached rows; assert returned rows and remote was never called.
// Online: remote returns fresh rows; assert local.replace receives them and fresh rows are returned.
// Remote fails: assert the error propagates and cached content is not falsely reported as fresh.`,
          commonMistakes: ['Putting network reachability and cache policy in the screen.', 'Creating a module for each class instead of a stable boundary.', 'Testing only implementation calls instead of visible behavior.', 'Making the repository interface depend on Retrofit Response types.'],
        },
      },
    ],
  },
  {
    id: 'compose',
    name: 'Jetpack Compose',
    description: 'Declarative UI state, recomposition, effects, stability, lazy lists, and lifecycle-aware ViewModel integration.',
    topics: [
      {
        id: 'jc-state-hoist',
        conceptId: 'compose',
        concept: 'Jetpack Compose',
        subtopic: 'remember, rememberSaveable, and state hoisting',
        difficulty: 'Fundamental',
        interviewQuestion: 'How do remember, rememberSaveable, and state hoisting differ?',
        answer: `\`remember\` retains a value across recompositions while its call remains in the composition; it is forgotten when that composable leaves. \`rememberSaveable\` also saves supported values across Activity/process recreation through saved-instance state. Neither is a replacement for durable persistence such as Room or DataStore.

State hoisting moves state to a caller and passes a value plus callbacks down (for example \`value\` and \`onValueChange\`). This creates a single source of truth and reusable stateless UI. Screen/business state usually belongs in a ViewModel, while small ephemeral UI state can live near the composable that owns it.`,
        exercise: {
          problem: 'Refactor a counter so the parent owns its value, the child is stateless, and the count survives configuration recreation.',
          requirements: ['Use rememberSaveable in the state-owning parent.', 'Pass the count and an increment callback to the child.', 'Keep the child free of its own duplicated count.'],
          starterCode: `@Composable
fun CounterScreen() {
    // TODO own saveable state and pass it down
}

@Composable
fun Counter(value: Int, onIncrement: () -> Unit) {
    // TODO show value and button
}`,
          expectedBehavior: 'Tapping increments the displayed count; recomposition preserves it, and Activity recreation restores the saved value.',
          solutionCode: `@Composable
fun CounterScreen() {
    var count by rememberSaveable { mutableIntStateOf(0) }
    Counter(value = count, onIncrement = { count++ })
}

@Composable
fun Counter(value: Int, onIncrement: () -> Unit) {
    Column {
        Text("Count: $value")
        Button(onClick = onIncrement) { Text("Increment") }
    }
}`,
          explanation: 'The parent is the single source of truth and the child receives state and events. rememberSaveable handles supported saved UI state across recreation.',
          tests: `// Compose UI test: assert Count: 0, click Increment, then assert Count: 1.
// Save and restore the test Activity state; assert the value is restored.
// Verify Counter itself does not create internal count state.`,
          commonMistakes: ['Using remember for state that must survive configuration changes.', 'Using rememberSaveable for large or durable business data.', 'Keeping duplicate state in both parent and child.', 'Mutating a plain non-observable variable and expecting recomposition.'],
        },
      },
      {
        id: 'jc-effects',
        conceptId: 'compose',
        concept: 'Jetpack Compose',
        subtopic: 'LaunchedEffect, DisposableEffect, and SideEffect',
        difficulty: 'Intermediate',
        interviewQuestion: 'Compare LaunchedEffect, DisposableEffect, and SideEffect. How do keys affect them?',
        answer: `\`LaunchedEffect(key)\` launches a coroutine when it enters composition, cancels/restarts when its key changes, and cancels when it leaves. Use it for composition-scoped suspend work. \`DisposableEffect(key)\` registers a non-suspending resource or listener and requires cleanup in \`onDispose\`. \`SideEffect\` runs after every successful recomposition to publish Compose state to non-Compose code; it is not a coroutine.

Choose stable, meaningful keys. A constant key means the effect is tied to that call's lifetime; a changing key restarts it. Do not start suspend work directly in a composable body or use effects as a substitute for event callbacks.`,
        exercise: {
          problem: 'Register a lifecycle observer only while this composable is present and collect the latest user ID in a coroutine that restarts when the ID changes.',
          requirements: ['Use DisposableEffect for the observer and remove it on disposal.', 'Use LaunchedEffect keyed by userId for suspending load.', 'Do not perform work directly during recomposition.'],
          starterCode: `@Composable
fun UserScreen(userId: String, owner: LifecycleOwner, load: suspend (String) -> Unit) {
    // TODO register observer and load on userId change
}`,
          expectedBehavior: 'The observer is removed when owner changes or the composable leaves. A changed userId cancels the previous load and starts the new one.',
          solutionCode: `@Composable
fun UserScreen(
    userId: String,
    owner: LifecycleOwner,
    load: suspend (String) -> Unit,
) {
    DisposableEffect(owner) {
        val observer = LifecycleEventObserver { _, _ -> }
        owner.lifecycle.addObserver(observer)
        onDispose { owner.lifecycle.removeObserver(observer) }
    }
    LaunchedEffect(userId) {
        load(userId)
    }
}`,
          explanation: 'The lifecycle observer is a resource with symmetric setup and cleanup. The coroutine is composition-bound and its key gives the load operation the correct restart behavior.',
          tests: `// Compose test: enter composition and assert observer is registered.
// Change owner and assert old observer is removed and new observer is registered.
// Change userId while the first load is suspended; assert the first job is cancelled and second begins.`,
          commonMistakes: ['Using SideEffect for suspend calls.', 'Using LaunchedEffect(Unit) when the operation must restart for a changed input.', 'Registering a listener without onDispose cleanup.', 'Launching a coroutine from the composable body on every recomposition.'],
        },
      },
      {
        id: 'jc-recomposition',
        conceptId: 'compose',
        concept: 'Jetpack Compose',
        subtopic: 'Recomposition, derivedStateOf, key, and stability',
        difficulty: 'Advanced',
        interviewQuestion: 'What triggers recomposition, and how do keys, stability, and derivedStateOf affect correctness and performance?',
        answer: `Compose tracks reads of snapshot state; when observed state changes, affected restart scopes may recompose. Recomposition is expected and should be safe—composable bodies describe UI rather than perform unguarded side effects.

\`key(id)\` gives repeated composition content stable identity when items move or are inserted. Stable inputs let Compose reason about whether a child can be skipped; do not annotate a mutable type \`@Stable\` unless its contract is actually observable and obeyed. \`derivedStateOf\` is useful when a rapidly changing state produces a less frequently changing value (such as a boolean threshold), but adds overhead and is not needed for every simple expression. Use immutable models and profile before optimizing.`,
        exercise: {
          problem: 'A list reorders and row-local expansion state follows the old position. Fix identity and derive a “show scroll-to-top” flag only when the threshold changes.',
          requirements: ['Give LazyColumn items a stable unique key.', 'Use derivedStateOf for the threshold boolean.', 'Keep row state associated with the item ID.'],
          starterCode: `@Composable
fun ArticleList(items: List<Article>) {
    val listState = rememberLazyListState()
    val showTopButton = listState.firstVisibleItemIndex > 0
    LazyColumn(state = listState) {
        items(items) { article ->
            ArticleRow(article)
        }
    }
    if (showTopButton) ScrollToTopButton { /* TODO scroll */ }
}`,
          expectedBehavior: 'Reordering does not transfer remembered row state to another article. The threshold boolean updates when its value changes, not for every scroll index.',
          solutionCode: `@Composable
fun ArticleList(items: List<Article>) {
    val listState = rememberLazyListState()
    val showTopButton by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }
    LazyColumn(state = listState) {
        items(items, key = { article -> article.id }) { article ->
            ArticleRow(article)
        }
    }
    if (showTopButton) {
        ScrollToTopButton {
            listState.animateScrollToItem(0)
        }
    }
}`,
          explanation: 'Stable item keys preserve identity across moves. derivedStateOf limits downstream invalidation to changes of the boolean, useful when the index changes more often than the threshold result.',
          tests: `// Compose UI test: expand row A, reorder items, and verify A remains expanded.
// Scroll within index 0 and assert the top button stays hidden; move to index 1 and assert it appears.
// Profile before adding @Stable annotations or derivedStateOf to unrelated expressions.`,
          commonMistakes: ['Using list position as identity when items can reorder.', 'Adding @Stable to mutable collections without observable mutation.', 'Assuming recomposition means the entire screen is redrawn.', 'Wrapping every expression in derivedStateOf.'],
        },
      },
      {
        id: 'jc-lazy-flow-vm',
        conceptId: 'compose',
        concept: 'Jetpack Compose',
        subtopic: 'Lazy layouts, UI state, lifecycle-aware Flow, and ViewModel',
        difficulty: 'Intermediate',
        interviewQuestion: 'How should a Compose screen collect ViewModel state and render large lists?',
        answer: `Expose immutable screen state from a ViewModel, collect it with \`collectAsStateWithLifecycle()\` from lifecycle-runtime-compose, and render explicit Loading/Content/Error states. Send user events back to the ViewModel rather than mutating a second copy of business state in the composable.

Use \`LazyColumn\`/ \`LazyRow\` for potentially large or unbounded collections and provide stable keys. Plain \`Column\` composes all children. For very large paged data, Paging Compose integrates loading and pagination. Keep composables small and stateless where practical, and remember that a Lazy list only composes nearby items.`,
        exercise: {
          problem: 'Complete a lifecycle-aware article screen backed by a ViewModel StateFlow and render rows lazily with stable keys.',
          requirements: ['Collect ViewModel state lifecycle-aware.', 'Render Loading, Error, and Content states.', 'Use LazyColumn with article IDs as keys and forward retry events.'],
          starterCode: `@Composable
fun ArticlesScreen(viewModel: ArticlesViewModel) {
    // TODO collect and render viewModel.state
}`,
          expectedBehavior: 'The screen stops collecting while not at least STARTED, resumes with current state, displays all three UI states, and preserves row identity.',
          solutionCode: `@Composable
fun ArticlesScreen(viewModel: ArticlesViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    when (val current = state) {
        ArticlesState.Loading -> CircularProgressIndicator()
        is ArticlesState.Error -> ErrorPanel(
            message = current.message,
            onRetry = viewModel::retry,
        )
        is ArticlesState.Content -> LazyColumn {
            items(current.articles, key = { article -> article.id }) { article ->
                ArticleRow(article = article)
            }
        }
    }
}`,
          explanation: 'Lifecycle-aware collection avoids unnecessary work when the UI is stopped. The ViewModel remains the state owner, and lazy keyed items scale and maintain identity.',
          tests: `// Compose UI test each state: Loading indicator, Error + retry callback, and keyed content rows.
// ViewModel unit test: retry requests content and updates StateFlow.
// Lifecycle test: move owner below STARTED and verify upstream collection stops.`,
          commonMistakes: ['Using collectAsState without considering Android lifecycle.', 'Rendering a large collection in Column.', 'Omitting stable keys for mutable/reordered lists.', 'Making the composable own a competing copy of ViewModel business state.'],
        },
      },
    ],
  },
];

export const androidConceptQuestions = androidConcepts.flatMap((concept) => concept.topics);
