import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ComposeSection = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  keywords: string;
};

const sections: ComposeSection[] = [
  { id: 'mental-model', title: 'The rendering loop', eyebrow: '01', description: 'Follow state through composition, layout, and drawing.', keywords: 'state input declarative composition recomposition layout draw phases invalidation skipping side effect snapshot' },
  { id: 'state', title: 'State & ownership', eyebrow: '02', description: 'Choose where state belongs and how it survives.', keywords: 'remember rememberSaveable ViewModel SavedStateHandle Room DataStore state hoisting state down events up mutableStateOf derivedStateOf snapshot aware collections' },
  { id: 'effects', title: 'Side-effect chooser', eyebrow: '03', description: 'Pick the effect API by trigger, lifetime, and cleanup.', keywords: 'LaunchedEffect DisposableEffect SideEffect rememberCoroutineScope produceState snapshotFlow rememberUpdatedState derivedStateOf coroutine listener cleanup' },
  { id: 'layout', title: 'Layouts, modifiers & lists', eyebrow: '04', description: 'Choose a container, reason about constraints, and keep list identity stable.', keywords: 'Row Column Box BoxWithConstraints Scaffold Modifier padding clickable LazyColumn LazyRow LazyVerticalGrid key contentType constraints' },
  { id: 'architecture', title: 'Architecture & Flow', eyebrow: '05', description: 'Connect events, ViewModels, repositories, and observable screen state.', keywords: 'UDF unidirectional ViewModel repository StateFlow SharedFlow Flow collectAsStateWithLifecycle collectAsState stateIn shareIn immutable ui state' },
  { id: 'navigation', title: 'Navigation & Material 3', eyebrow: '06', description: 'Remember the route graph, screen scaffold, and resource units.', keywords: 'NavController NavHost route backstack navigate popBackStack MaterialTheme Scaffold Surface Card TextField dp sp WindowInsets resources' },
  { id: 'animation', title: 'Animation & input', eyebrow: '07', description: 'Select declarative animation or a custom gesture API.', keywords: 'animateAsState updateTransition Animatable AnimatedVisibility Crossfade rememberInfiniteTransition animateContentSize clickable pointerInput gesture accessibility' },
  { id: 'performance', title: 'Performance', eyebrow: '08', description: 'Measure first, then optimize the cause—not recomposition counts.', keywords: 'performance stability immutable strong skipping profiler trace benchmark derivedStateOf snapshotFlow lazy list keys contentType baseline profiles' },
  { id: 'quality', title: 'Testing & accessibility', eyebrow: '09', description: 'Test semantics, support assistive tech, and bridge Views when needed.', keywords: 'testing semantics contentDescription testTag ComposeTestRule AndroidView ComposeView accessibility adaptive SubcomposeLayout Modifier.Node CompositionLocal' },
  { id: 'patterns', title: 'Code patterns', eyebrow: '10', description: 'Reusable patterns for state, effects, Flow, and lazy lists.', keywords: 'Counter state hoisting collectAsStateWithLifecycle StateFlow LaunchedEffect rememberCoroutineScope LazyColumn modifier patterns code' },
];

const renderingPhases = [
  { title: 'Inputs', description: 'Parameters and observable state are the inputs to a composable. A state read is tracked at the scope where it happens.', cue: 'Ask: which values can change, and which composables read them?' },
  { title: 'Composition', description: 'Composable functions run to describe the UI tree for the current inputs. Compose may skip eligible scopes when inputs are unchanged.', cue: 'Ask: what UI should exist for this state?' },
  { title: 'Layout', description: 'Constraints move down the tree; children report measured sizes; parents place them.', cue: 'Ask: how large is each child, and where does it go?' },
  { title: 'Drawing', description: 'Text, shapes, images, and draw modifiers render pixels after measurement and placement.', cue: 'Ask: what should be painted?' },
];

const LEARNED_SECTIONS_KEY = 'kotlin-interview-trainer-compose-learned-sections-v1';

function loadLearnedSections(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(LEARNED_SECTIONS_KEY) ?? '[]');
    return Array.isArray(stored) && stored.every((id) => typeof id === 'string')
      ? stored.filter((id) => sections.some((section) => section.id === id))
      : [];
  } catch {
    return [];
  }
}

const codeSamples = [
  {
    label: 'State down · events up',
    code: `@Composable
fun Counter(value: Int, onIncrement: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("Count: $value")
        Button(onClick = onIncrement) { Text("Add") }
    }
}

@Composable
fun CounterRoute() {
    var count by rememberSaveable { mutableIntStateOf(0) }
    Counter(value = count, onIncrement = { count++ })
}`,
    note: 'The route owns state; the reusable child renders a value and emits an event.',
  },
  {
    label: 'Lifecycle-aware screen state',
    code: `@Composable
fun SearchRoute(viewModel: SearchViewModel) {
    val uiState by viewModel.uiState
        .collectAsStateWithLifecycle()

    SearchScreen(
        uiState = uiState,
        onQueryChange = viewModel::onQueryChange,
        onRetry = viewModel::retry
    )
}`,
    note: 'Keep Android lifecycle collection at the route boundary and pass plain state to the screen.',
  },
  {
    label: 'Effects follow their trigger',
    code: `LaunchedEffect(articleId) {
    viewModel.load(articleId)
}

val scope = rememberCoroutineScope()
Button(onClick = {
    scope.launch { snackbar.showSnackbar("Saved") }
}) { Text("Save") }`,
    note: 'Use a keyed effect for composition-driven work; use a remembered scope for event-driven work.',
  },
  {
    label: 'Lazy list identity',
    code: `LazyColumn {
    items(
        items = products,
        key = { it.id },
        contentType = { it.category }
    ) { product ->
        ProductRow(product)
    }
}`,
    note: 'key tracks item identity across changes; contentType groups similar row structures for reuse.',
  },
];

const coreRapidRecall = [
  ['remember vs rememberSaveable', 'Retain through recomposition vs restore small UI state after recreation.'],
  ['State hoisting', 'Move state to the caller; pass state down and events up.'],
  ['Recomposition', 'Re-run affected scopes when observed inputs change; eligible unchanged work may be skipped.'],
  ['LaunchedEffect vs coroutine scope', 'Composition/key-triggered coroutine vs event-triggered coroutine.'],
  ['DisposableEffect', 'Register a resource on entry or key change; release it in onDispose.'],
  ['StateFlow vs SharedFlow', 'Current state with a value vs hot broadcast with configurable replay and buffer.'],
  ['collectAsStateWithLifecycle', 'Collect a Flow in a lifecycle-aware way and expose Compose State.'],
  ['key vs contentType', 'Stable item identity vs similar item layout structure.'],
  ['Row / Column / Box', 'Horizontal arrangement / vertical arrangement / stacking.'],
  ['Is recomposition bad?', 'No. It is normal; profile before optimizing a user-visible issue.'],
];

const additionalRapidRecall = [
  ['Should composables perform side effects?', 'Keep the body focused on describing UI. Run work from event handlers or effect APIs because recomposition can happen again.'],
  ['What does a LaunchedEffect key do?', 'A changed key cancels and restarts the effect; leaving composition cancels it. LaunchedEffect(Unit) is not process-wide.'],
  ['Modifier order: why care?', 'Modifiers wrap in order, changing constraints, drawing, and hit targets. For example, clickable().padding() differs from padding().clickable().'],
  ['When should I use a LazyColumn?', 'Use lazy layouts for long or potentially large scrolling collections; use Row or Column for small bounded content.'],
  ['Lazy-list key vs contentType?', 'Use a stable unique key for item identity across moves; contentType groups similar item structures for reuse.'],
  ['How should a screen collect Flow?', 'Expose read-only StateFlow from the ViewModel and collect with collectAsStateWithLifecycle() at the Android UI boundary.'],
  ['How should navigation pass data?', 'Pass a stable identifier such as userId, then load the domain object at its destination instead of passing large objects.'],
  ['How do Compose UI tests find content?', 'Tests query the semantics tree. Prefer meaningful text and semantics; add testTag only when those are insufficient.'],
  ['Which animation API should I pick?', 'animate*AsState for one target, updateTransition for coordinated values, and Animatable for direct coroutine control.'],
  ['@Composable contract', 'A composable describes UI and may run repeatedly; keep it side-effect free and treat parameters as inputs.'],
  ['CompositionLocal', 'Implicitly provide tree-scoped values such as theme data; prefer explicit parameters for ordinary dependencies.'],
  ['CompositionLocalProvider', 'Override one or more CompositionLocal values for a subtree.'],
  ['mutableIntStateOf', 'Use the primitive-backed Int state holder to avoid boxing an Int in frequently updated state.'],
  ['derivedStateOf', 'Cache a derived value when inputs change more often than the value matters; it is not needed for every simple calculation.'],
  ['rememberUpdatedState', 'Let a long-lived effect read the latest value without restarting when that value changes.'],
  ['Saver', 'Define how a custom value is saved and restored when using rememberSaveable.'],
  ['SnapshotStateList', 'An observable mutable list whose structural changes notify Compose readers.'],
  ['Snapshot system', 'Compose snapshot state supports observable reads and consistent state changes.'],
  ['key in Composition', 'Give repeated call sites stable identity when their order or presence can change.'],
  ['movableContentOf', 'Preserve a composable content instance while moving it to a different location in the composition.'],
  ['Modifier.weight', 'Distribute remaining main-axis space among children in a Row or Column.'],
  ['Modifier.requiredSize', 'Demand a specific size even when incoming constraints would normally limit the child.'],
  ['BoxScope.matchParentSize', 'Make a Box child match the final Box size without making that child determine the Box size.'],
  ['BoxWithConstraints', 'Choose content based on the constraints available at layout time; avoid using it when ordinary adaptive modifiers suffice.'],
  ['SubcomposeLayout', 'Compose some content during measurement when the layout decision depends on measured information.'],
  ['Intrinsic measurements', 'Ask a layout for an estimated size before normal measurement; use sparingly because it adds measurement work.'],
  ['WindowInsets', 'Represent system bars, cutouts, and keyboard areas so content can avoid or intentionally draw behind them.'],
  ['imePadding', 'Apply bottom padding for the on-screen keyboard using window inset data.'],
  ['BringIntoViewRequester', 'Request that a containing scrollable bring a target composable into view.'],
  ['nestedScroll', 'Coordinate scroll delta and fling consumption between nested scrolling components.'],
  ['pointerInput keys', 'Changing a pointerInput key cancels and restarts its gesture-handling coroutine.'],
  ['awaitEachGesture', 'Handle gestures in a loop that restarts after all pointers from the current gesture are up.'],
  ['combinedClickable', 'Handle click, long-click, and optional double-click interactions with appropriate semantics.'],
  ['MutableInteractionSource', 'Observe or emit component interactions such as press and drag for indication or custom behavior.'],
  ['Semantics tree', 'Expose meaning, actions, and state to accessibility services and Compose UI tests.'],
  ['clearAndSetSemantics', 'Replace descendant semantics deliberately; use carefully because it can hide accessible information.'],
  ['FocusRequester', 'Request keyboard or directional focus for a focusable composable.'],
  ['focusGroup', 'Treat related focus targets as a group when navigating focus, especially with directional input.'],
  ['Stability', 'A type is stable when Compose can rely on its equality and observable-change contract for skipping decisions.'],
  ['Skippability', 'A composable may be skipped when its inputs meet compiler/runtime rules and have not changed.'],
  ['Strong skipping', 'Compiler mode that can make more restartable composables skippable; it does not remove the need for correct state models.'],
  ['Compose compiler reports', 'Use compiler stability and composable reports to investigate unexpected skipping or recomposition behavior.'],
  ['Baseline Profiles', 'Precompile important app code paths to improve startup and runtime performance on users’ devices.'],
  ['Macrobenchmark', 'Measure end-to-end app performance, such as startup or scrolling, on a representative device.'],
  ['Layout Inspector', 'Inspect the running UI hierarchy and Compose recomposition information while debugging.'],
  ['Recomposition scope', 'State reads identify the scopes that may need to run again when that state changes.'],
  ['stateIn', 'Convert a cold Flow into a StateFlow in a supplied coroutine scope with an initial value and sharing policy.'],
  ['shareIn', 'Convert a cold Flow into a SharedFlow in a supplied scope with a configurable sharing policy and replay.'],
  ['combine', 'Create a Flow from the latest values of multiple upstream flows, useful for deriving screen state.'],
  ['Channel vs SharedFlow', 'A Channel is a communication primitive; SharedFlow broadcasts to collectors with configurable replay and buffering.'],
  ['UI state modeling', 'Represent loading, content, and recoverable errors explicitly instead of scattering unrelated Boolean flags.'],
  ['SavedStateHandle', 'Store small restorable screen values in a ViewModel across system-initiated process recreation.'],
  ['viewModelScope', 'Run ViewModel work in a coroutine scope that is cancelled when the ViewModel is cleared.'],
  ['Paging Compose', 'Connect the Paging library to Compose lazy layouts for incremental loading of large datasets.'],
  ['LazyPagingItems', 'Collect and display PagingData in Compose, including load states and item access.'],
  ['Paging load states', 'Render loading, error, and completion UI for refresh, prepend, and append operations.'],
  ['PullToRefreshBox', 'Use the Material 3 pull-to-refresh container to expose and trigger a refresh action.'],
  ['PreviewParameterProvider', 'Supply reusable sets of sample values to Compose previews for multiple UI states.'],
  ['Screenshot testing', 'Compare rendered UI images to catch visual regressions across representative states and configurations.'],
  ['Compose BOM', 'Align versions of Compose libraries; it does not select or manage the Kotlin or Compose compiler plugin version.'],
];

const decisionDetails = {
  local: {
    title: 'Local, temporary UI state',
    api: 'remember',
    detail: 'Keep state close to the composable that reads and changes it. It survives recomposition while its call site remains, but not Activity recreation.',
  },
  restore: {
    title: 'Small UI state should restore',
    api: 'rememberSaveable',
    detail: 'Use for compact values such as a query, selected tab, or expanded flag that should survive Activity recreation and saved-instance-state restoration.',
  },
  screen: {
    title: 'Screen state or business logic',
    api: 'ViewModel',
    detail: 'Own screen-level state and handle events in a ViewModel. Use SavedStateHandle for small values that need restoration after system process recreation.',
  },
  durable: {
    title: 'Must survive app relaunch?',
    api: 'Room · DataStore · backend',
    detail: 'Persist durable user or application data outside the Composition. A ViewModel is not a permanent data store.',
  },
};

const effectDetails = [
  { title: 'LaunchedEffect', prompt: 'Suspend work starts with composition or a key change.', code: 'LaunchedEffect(userId) {\n    viewModel.loadUser(userId)\n}', recall: 'Key changes cancel and restart it; leaving composition cancels it.' },
  { title: 'DisposableEffect', prompt: 'A listener or observer needs setup and cleanup.', code: 'DisposableEffect(owner) {\n    owner.addObserver(observer)\n    onDispose { owner.removeObserver(observer) }\n}', recall: 'Pair every registration with onDispose cleanup.' },
  { title: 'rememberCoroutineScope', prompt: 'A click or callback should launch a coroutine.', code: 'val scope = rememberCoroutineScope()\nButton(onClick = { scope.launch { save() } }) {\n    Text("Save")\n}', recall: 'Use for UI events, not as a replacement for a keyed effect.' },
  { title: 'SideEffect', prompt: 'Publish Compose state to a non-Compose object after success.', code: 'SideEffect {\n    analytics.setUserType(userType)\n}', recall: 'Runs after every successful recomposition.' },
  { title: 'produceState', prompt: 'Adapt an external asynchronous source into Compose State.', code: 'val value by produceState(initialValue) {\n    value = source.awaitValue()\n}', recall: 'The producer is scoped to the Composition.' },
  { title: 'snapshotFlow', prompt: 'Turn reads of Compose snapshot state into a Flow.', code: 'snapshotFlow { listState.firstVisibleItemIndex }\n    .collect { index -> log(index) }', recall: 'Use Flow operators to react to snapshot state changes.' },
];

const flowKinds = [
  { title: 'Flow<T>', subtitle: 'A stream description', detail: 'Standard builders are usually cold: upstream work starts for each collector. Flow itself does not promise a current value or replay.', badge: 'Collect to start' },
  { title: 'StateFlow<T>', subtitle: 'Current screen state', detail: 'Hot state holder with a value. New collectors receive the latest value; updates are conflated using equality.', badge: 'Has value' },
  { title: 'SharedFlow<T>', subtitle: 'Broadcast events or values', detail: 'Hot broadcast with configurable replay and buffer. With replay = 0, an absent collector does not receive a past emission.', badge: 'Replay is configurable' },
];

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  };

  return (
    <div className="compose-code">
      <div className="compose-code-toolbar">
        <span>{label ?? 'Kotlin'}</span>
        <button type="button" onClick={copyCode}>
          {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy unavailable' : 'Copy code'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function ComposeSectionHeading({ index, title, description, action }: { index: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="compose-section-heading">
      <span>{index}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function ComposeQuickLearn({
  search,
  onSearchChange,
  onBack,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState('rapid');
  const [view, setView] = useState<'learn' | 'rapid'>('rapid');
  const [stateChoice, setStateChoice] = useState<keyof typeof decisionDetails>('local');
  const [activeEffect, setActiveEffect] = useState(0);
  const [activeFlow, setActiveFlow] = useState(0);
  const [activeCode, setActiveCode] = useState(0);
  const [activeRenderPhase, setActiveRenderPhase] = useState(0);
  const [learnedSections, setLearnedSections] = useState<string[]>(loadLearnedSections);
  const [areRecallHoverPreviewsEnabled, setAreRecallHoverPreviewsEnabled] = useState(false);
  const [isRememberHovered, setIsRememberHovered] = useState(false);
  const [isRememberFocused, setIsRememberFocused] = useState(false);
  const [isLaunchedEffectHovered, setIsLaunchedEffectHovered] = useState(false);
  const [isLaunchedEffectFocused, setIsLaunchedEffectFocused] = useState(false);
  const [isDisposableEffectHovered, setIsDisposableEffectHovered] = useState(false);
  const [isDisposableEffectFocused, setIsDisposableEffectFocused] = useState(false);
  const [isHoistingHovered, setIsHoistingHovered] = useState(false);
  const [isHoistingFocused, setIsHoistingFocused] = useState(false);
  const [isRecompositionHovered, setIsRecompositionHovered] = useState(false);
  const [isRecompositionFocused, setIsRecompositionFocused] = useState(false);
  const [pinnedRecallTip, setPinnedRecallTip] = useState<string | null>(null);
  const [dismissedRecallTip, setDismissedRecallTip] = useState<string | null>(null);
  const ignoredTipPointerTransition = useRef<string | null>(null);
  const hoistingCloseTimer = useRef<number | null>(null);

  const normalizedSearch = search.trim().toLowerCase();
  const matchingSections = useMemo(() => sections.filter((section) => (
    `${section.title} ${section.eyebrow} ${section.description} ${section.keywords}`.toLowerCase().includes(normalizedSearch)
  )), [normalizedSearch]);
  const visibleIds = new Set(matchingSections.map((section) => section.id));
  const matchingCoreRecall = coreRapidRecall.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(normalizedSearch));
  const matchingAdditionalRecall = additionalRapidRecall.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(normalizedSearch));
  const visibleCount = view === 'rapid' ? matchingCoreRecall.length + matchingAdditionalRecall.length : matchingSections.length;
  useEffect(() => {
    localStorage.setItem(LEARNED_SECTIONS_KEY, JSON.stringify(learnedSections));
  }, [learnedSections]);
  useEffect(() => () => {
    if (hoistingCloseTimer.current !== null) window.clearTimeout(hoistingCloseTimer.current);
  }, []);

  const cancelHoistingClose = () => {
    if (hoistingCloseTimer.current !== null) {
      window.clearTimeout(hoistingCloseTimer.current);
      hoistingCloseTimer.current = null;
    }
  };

  const scheduleHoistingClose = () => {
    cancelHoistingClose();
    hoistingCloseTimer.current = window.setTimeout(() => {
      setIsRememberHovered(false);
      setIsLaunchedEffectHovered(false);
      setIsDisposableEffectHovered(false);
      setIsHoistingHovered(false);
      setIsRecompositionHovered(false);
      hoistingCloseTimer.current = null;
    }, 140);
  };

  const scheduleRecompositionClose = scheduleHoistingClose;

  const dismissRecallTip = (tipId: string) => {
    ignoredTipPointerTransition.current = tipId;
    setPinnedRecallTip(null);
    setDismissedRecallTip(tipId);
  };

  const handleRecallPointerTransition = (tipId: string) => {
    if (ignoredTipPointerTransition.current === tipId) {
      ignoredTipPointerTransition.current = null;
      return;
    }
    setDismissedRecallTip((current) => current === tipId ? null : current);
  };

  const openRecallTip = (tipId: string) => {
    ignoredTipPointerTransition.current = null;
    setDismissedRecallTip((current) => current === tipId ? null : current);
    setPinnedRecallTip((current) => current === tipId ? null : tipId);
  };

  const navigateTo = (id: string) => {
    setView(id === 'rapid' ? 'rapid' : 'learn');
    setActiveSection(id);
    if (id !== 'rapid') {
      window.setTimeout(() => document.getElementById(`compose-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  };

  const toggleLearned = (id: string) => {
    setLearnedSections((current) => current.includes(id)
      ? current.filter((sectionId) => sectionId !== id)
      : [...current, id]);
  };

  const renderLearnSection = (id: string, index: string, title: string, description: string, content: ReactNode) => {
    if (!visibleIds.has(id)) return null;
    const isLearned = learnedSections.includes(id);
    return (
      <section id={`compose-${id}`} className="compose-topic" key={id} onMouseEnter={() => setActiveSection(id)}>
        <ComposeSectionHeading
          index={index}
          title={title}
          description={description}
          action={(
            <button type="button" className={isLearned ? 'compose-learned-toggle learned' : 'compose-learned-toggle'} aria-pressed={isLearned} onClick={() => toggleLearned(id)}>
              <span aria-hidden="true">{isLearned ? '✓' : '○'}</span>{isLearned ? 'Learned' : 'Mark learned'}
            </button>
          )}
        />
        {content}
      </section>
    );
  };

  return (
    <section className="compose-studio" aria-label="Jetpack Compose learning studio">
      <header className="compose-hero">
        <div className="compose-hero-copy">
          <button type="button" className="compose-back" onClick={onBack}>← All Android topics</button>
          <span className="compose-overline">ANDROID DEVELOPER FIELD GUIDE</span>
          <h1>Jetpack Compose<span>.</span></h1>
          <p>From first composition to confident code review. Learn the mental models, then use the decision maps when you need a fast answer.</p>
          <div className="compose-hero-actions">
            <button type="button" aria-pressed={view === 'rapid'} className={view === 'rapid' ? 'compose-view-button active' : 'compose-view-button'} onClick={() => { setView('rapid'); setActiveSection('rapid'); }}>
              Quick revision <span>{coreRapidRecall.length + additionalRapidRecall.length} prompts</span>
            </button>
            <button type="button" aria-pressed={view === 'learn'} className={view === 'learn' ? 'compose-view-button active' : 'compose-view-button'} onClick={() => { setView('learn'); setActiveSection('mental-model'); }}>
              Learning path <span>10 topics</span>
            </button>
          </div>
        </div>
        <div className="compose-hero-art" aria-hidden="true">
          <div className="compose-orbit compose-orbit-one" />
          <div className="compose-orbit compose-orbit-two" />
          <div className="compose-orbit-core"><span>UI</span><small>STATE</small></div>
          <span className="compose-orbit-label compose-label-compose">COMPOSE</span>
          <span className="compose-orbit-label compose-label-layout">LAYOUT</span>
          <span className="compose-orbit-label compose-label-draw">DRAW</span>
        </div>
      </header>

      <div className="compose-guide-tools">
        <label className="compose-search">
          <span>Find a concept</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Try rememberSaveable, effects, lazy lists…"
          />
        </label>
        <div className="compose-guide-count" role="status">
          <strong>{visibleCount}</strong>
          <span>{view === 'rapid' ? 'quick answers' : 'matching topics'}</span>
        </div>
      </div>

      <div className="compose-guide-layout">
        <nav className="compose-guide-nav" aria-label="Compose guide topics">
          <button type="button" aria-current={activeSection === 'rapid' ? 'location' : undefined} className={activeSection === 'rapid' ? 'compose-nav-rapid active' : 'compose-nav-rapid'} onClick={() => navigateTo('rapid')}>
            <span>↗</span> Quick revision
          </button>
          <div className="compose-guide-nav-heading">
            <span className="compose-guide-nav-title">YOUR LEARNING PATH</span>
          </div>
          {sections.filter((section) => !normalizedSearch || visibleIds.has(section.id)).map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                type="button"
                key={section.id}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => navigateTo(section.id)}
              >
                <span className="compose-nav-step">{section.eyebrow}</span>
                <span className="compose-nav-label">{section.title}</span>
              </button>
            );
          })}
          <div className="compose-guide-nav-note"><strong>Recall the loop</strong><span>State → UI → event → state</span></div>
        </nav>

        <div className="compose-guide-content">
          {view === 'learn' && (
            <>
              {renderLearnSection('mental-model', '01', 'The rendering loop', 'Compose describes what the UI should look like now. Observed state changes invalidate the scopes that read it.', (
                <>
                  <div className="compose-flow compose-flow-horizontal" aria-label="Compose rendering phases">
                    {[
                      ['01', 'Inputs', 'State + parameters'],
                      ['02', 'Composition', 'What UI exists?'],
                      ['03', 'Layout', 'Measure → place'],
                      ['04', 'Drawing', 'Render pixels'],
                    ].map(([step, title, detail], index) => (
                      <div className="compose-flow-item" key={step}>
                        <div className="compose-flow-node"><span>{step}</span><strong>{title}</strong><small>{detail}</small></div>
                        {index < 3 && <span className="compose-flow-arrow" aria-hidden="true">→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="compose-callout info"><strong>Recomposition is not a full-screen redraw.</strong> Compose tracks where state is read, can re-run affected scopes, and may skip eligible work whose inputs are unchanged.</div>
                  <div className="compose-phase-selector" role="group" aria-label="Explore the rendering phases">
                    {renderingPhases.map((phase, index) => (
                      <button type="button" key={phase.title} aria-pressed={activeRenderPhase === index} className={activeRenderPhase === index ? 'active' : ''} onClick={() => setActiveRenderPhase(index)}>
                        <span>0{index + 1}</span><strong>{phase.title}</strong>
                      </button>
                    ))}
                  </div>
                  <div className="compose-phase-detail" role="region" aria-live="polite" aria-label={`${renderingPhases[activeRenderPhase].title} phase details`}>
                    <span>PHASE 0{activeRenderPhase + 1}</span>
                    <div><h3>{renderingPhases[activeRenderPhase].title}</h3><p>{renderingPhases[activeRenderPhase].description}</p><small>{renderingPhases[activeRenderPhase].cue}</small></div>
                  </div>
                </>
              ))}

              {renderLearnSection('state', '02', 'State & ownership', 'Keep state with the owner that needs to read and update it. Choose persistence by the lifetime the value needs.', (
                <>
                  <div className="compose-choice-layout">
                    <div className="compose-choice-list" role="group" aria-label="Choose state lifetime">
                      {(Object.entries(decisionDetails) as Array<[keyof typeof decisionDetails, (typeof decisionDetails)[keyof typeof decisionDetails]]>).map(([key, choice], index) => (
                        <button type="button" key={key} className={stateChoice === key ? 'selected' : ''} aria-pressed={stateChoice === key} onClick={() => setStateChoice(key)}>
                          <span>{String(index + 1).padStart(2, '0')}</span><strong>{choice.title}</strong><i aria-hidden="true">→</i>
                        </button>
                      ))}
                    </div>
                    <div className="compose-choice-answer" aria-live="polite">
                      <span>RECOMMENDED OWNER</span><h3>{decisionDetails[stateChoice].api}</h3><p>{decisionDetails[stateChoice].detail}</p>
                    </div>
                  </div>
                  <div className="compose-two-cards">
                    <article><span className="compose-card-kicker">STATE HOISTING</span><h3>State down. Events up.</h3><p>Move state to the lowest common owner. Pass values to children and callbacks back up. This creates a single source of truth and makes UI easier to reuse and test.</p></article>
                    <article><span className="compose-card-kicker">STATE HELPERS</span><h3>Remember the distinction</h3><p><code>remember</code> caches a value by keys. <code>derivedStateOf</code> derives observable state and can suppress downstream updates when the result is unchanged. Ordinary mutable collections are not observable.</p></article>
                  </div>
                  <CodeBlock code={`@Composable
fun NameField(value: String, onValueChange: (String) -> Unit) {
    TextField(value = value, onValueChange = onValueChange)
}

@Composable
fun ProfileRoute() {
    var name by rememberSaveable { mutableStateOf("") }
    NameField(value = name, onValueChange = { name = it })
}`} label="Kotlin · state hoisting" />
                </>
              ))}

              {renderLearnSection('effects', '03', 'Side-effect chooser', 'Choose by what starts the work and whether a resource must be cleaned up.', (
                <>
                  <div className="compose-effect-tabs" role="group" aria-label="Choose a Compose effect API">
                    {effectDetails.map((effect, index) => (
                      <button type="button" key={effect.title} aria-pressed={activeEffect === index} className={activeEffect === index ? 'active' : ''} onClick={() => setActiveEffect(index)}>
                        {effect.title}
                      </button>
                    ))}
                  </div>
                  <div className="compose-effect-detail" role="region" aria-label="Selected effect details">
                    <div><span className="compose-card-kicker">PICK THIS WHEN</span><h3>{effectDetails[activeEffect].title}</h3><p>{effectDetails[activeEffect].prompt}</p><small>{effectDetails[activeEffect].recall}</small></div>
                    <CodeBlock code={effectDetails[activeEffect].code} />
                  </div>
                  <div className="compose-effect-footnote"><strong>Also know:</strong> <code>produceState</code> adapts external async data to Compose State; <code>snapshotFlow</code> turns snapshot reads into Flow; <code>rememberUpdatedState</code> provides the latest value to a long-running effect without restarting it.</div>
                </>
              ))}

              {renderLearnSection('layout', '04', 'Layouts, modifiers & lists', 'Start with the shape of the content. Use lazy containers for long collections and stable identity when items move.', (
                <>
                  <div className="compose-layout-options">
                    <article><span>01</span><h3>Row</h3><p>Arrange children horizontally.</p></article>
                    <article><span>02</span><h3>Column</h3><p>Arrange children vertically.</p></article>
                    <article><span>03</span><h3>Box</h3><p>Stack or overlay children.</p></article>
                    <article><span>04</span><h3>Scaffold</h3><p>Screen slots + inner insets.</p></article>
                  </div>
                  <div className="compose-branch">
                    <div className="compose-branch-question"><span>CHOOSE A COLLECTION</span><h3>How many items, and how should they scroll?</h3></div>
                    <div className="compose-branch-answers">
                      <article><span>SMALL + BOUNDED</span><strong>Row / Column</strong><p>All children are composed. Add a scroll modifier only when needed.</p></article>
                      <article><span>LONG + SCROLLING</span><strong>LazyColumn / LazyRow</strong><p>Compose visible items as needed. Provide a stable, unique <code>key</code>.</p></article>
                      <article><span>SCROLLING GRID</span><strong>LazyVerticalGrid</strong><p>Choose fixed or adaptive columns. Keys still identify each item.</p></article>
                    </div>
                  </div>
                  <div className="compose-two-cards">
                    <article><span className="compose-card-kicker">MODIFIER ORDER</span><h3>Order changes behavior</h3><p><code>clickable().padding(16.dp)</code> makes the padded area clickable; <code>padding(16.dp).clickable()</code> leaves outer padding outside the clickable region.</p></article>
                    <article><span className="compose-card-kicker">LAZY LISTS</span><h3>Identity vs structure</h3><p><code>key</code> tracks which item is which across insertions and moves. <code>contentType</code> groups similar row layouts for reuse in mixed lists.</p></article>
                  </div>
                  <CodeBlock code={`LazyColumn {
    items(
        items = messages,
        key = { it.id },
        contentType = { it.kind }
    ) { message ->
        MessageRow(message)
    }
}`} label="Kotlin · lazy list" />
                </>
              ))}

              {renderLearnSection('architecture', '05', 'Architecture & Flow', 'Treat the screen as a state renderer. Events travel up to the owner; updated state travels back down.', (
                <>
                  <div className="compose-flow compose-architecture-flow" aria-label="Unidirectional data flow">
                    <div className="compose-arch-node event"><span>01</span><strong>User action</strong><small>callback / event ↑</small></div>
                    <span className="compose-flow-arrow">→</span>
                    <div className="compose-arch-node owner"><span>02</span><strong>ViewModel</strong><small>handles event + state</small></div>
                    <span className="compose-flow-arrow">→</span>
                    <div className="compose-arch-node data"><span>03</span><strong>Repository</strong><small>data access / rules</small></div>
                    <span className="compose-flow-arrow">↓</span>
                    <div className="compose-arch-node state"><span>04</span><strong>StateFlow&lt;UiState&gt;</strong><small>latest screen state</small></div>
                    <span className="compose-flow-arrow">←</span>
                    <div className="compose-arch-node ui"><span>05</span><strong>Composable UI</strong><small>collect + render ↓</small></div>
                  </div>
                  <div className="compose-compare-tabs" role="group" aria-label="Compare Kotlin Flow types">
                    {flowKinds.map((flow, index) => (
                      <button type="button" key={flow.title} aria-pressed={activeFlow === index} className={activeFlow === index ? 'active' : ''} onClick={() => setActiveFlow(index)}>
                        <strong>{flow.title}</strong><span>{flow.subtitle}</span>
                      </button>
                    ))}
                  </div>
                  <div className="compose-flow-detail" role="region" aria-label="Selected Flow type details">
                    <span>{flowKinds[activeFlow].badge}</span><p>{flowKinds[activeFlow].detail}</p>
                  </div>
                  <CodeBlock code={`@Composable
fun ProfileRoute(viewModel: ProfileViewModel) {
    val uiState by viewModel.uiState
        .collectAsStateWithLifecycle()
    ProfileScreen(
        uiState = uiState,
        onRetry = viewModel::retry
    )
}`} label="Kotlin · lifecycle-aware collection" />
                </>
              ))}

              {renderLearnSection('navigation', '06', 'Navigation & Material 3', 'Keep destination identity compact. Let Material components and window insets provide a consistent screen structure.', (
                <>
                  <div className="compose-flow compose-flow-horizontal">
                    {[
                      ['NavController', 'Actions + back stack'],
                      ['NavHost', 'Graph + start route'],
                      ['Destination', 'Screen content'],
                    ].map(([title, detail], index) => (
                      <div className="compose-flow-item" key={title}>
                        <div className="compose-flow-node"><span>0{index + 1}</span><strong>{title}</strong><small>{detail}</small></div>
                        {index < 2 && <span className="compose-flow-arrow">→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="compose-mini-grid">
                    <article><span>THEME</span><h3>MaterialTheme</h3><p>Provides colorScheme, typography, and shapes to the tree.</p></article>
                    <article><span>STRUCTURE</span><h3>Scaffold</h3><p>App bars, FAB, snackbar, content, and inner padding.</p></article>
                    <article><span>UNITS</span><h3>dp · sp · insets</h3><p>dp for layout, sp for text, WindowInsets for system areas.</p></article>
                  </div>
                  <div className="compose-callout caution"><strong>Route design:</strong> Pass a stable identifier such as <code>userId</code>, then load the object at the destination. Avoid large or mutable domain objects in routes.</div>
                </>
              ))}

              {renderLearnSection('animation', '07', 'Animation & input', 'Use state-driven animation for normal transitions; reach for lower-level control only when interaction requires it.', (
                <>
                  <div className="compose-branch compose-animation-branch">
                    <div className="compose-branch-question"><span>WHAT SHOULD MOVE?</span><h3>Choose the animation API by control</h3></div>
                    <div className="compose-branch-answers">
                      <article><span>ONE TARGET VALUE</span><strong>animate*AsState</strong><p>Animate a property when its target changes.</p></article>
                      <article><span>COORDINATED VALUES</span><strong>updateTransition</strong><p>Drive multiple values from one state.</p></article>
                      <article><span>DIRECT CONTROL</span><strong>Animatable</strong><p>Animate, stop, snap, or fling from a coroutine.</p></article>
                    </div>
                  </div>
                  <div className="compose-two-cards">
                    <article><span className="compose-card-kicker">CONTENT</span><h3>Show / switch / repeat</h3><p><code>AnimatedVisibility</code> for entering and leaving, <code>Crossfade</code> for switching content, <code>rememberInfiniteTransition</code> for loops.</p></article>
                    <article><span className="compose-card-kicker">GESTURES</span><h3>High-level first</h3><p>Prefer <code>clickable</code>, <code>draggable</code>, or <code>scrollable</code> for behavior and semantics. Use <code>pointerInput</code> when the gesture is genuinely custom.</p></article>
                  </div>
                </>
              ))}

              {renderLearnSection('performance', '08', 'Performance', 'Recomposition is expected. Diagnose measurable jank, optimize its cause, then verify the result.', (
                <>
                  <div className="compose-flow compose-flow-horizontal">
                    {[
                      ['01', 'Observe', 'Jank / slow screen'],
                      ['02', 'Diagnose', 'Trace / profiler'],
                      ['03', 'Optimize', 'Fix the cause'],
                      ['04', 'Benchmark', 'Verify the gain'],
                    ].map(([step, title, detail], index) => (
                      <div className="compose-flow-item" key={step}>
                        <div className="compose-flow-node"><span>{step}</span><strong>{title}</strong><small>{detail}</small></div>
                        {index < 3 && <span className="compose-flow-arrow">→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="compose-two-cards">
                    <article><span className="compose-card-kicker">STABILITY</span><h3>Prefer truthful contracts</h3><p>Immutable UI models with <code>val</code> properties make change easier to reason about. Do not promise stability if a type can change invisibly.</p></article>
                    <article><span className="compose-card-kicker">PRACTICAL WINS</span><h3>Keep work bounded</h3><p>Use stable lazy-list keys, keep expensive work out of item content, read state as late as practical, and profile release builds.</p></article>
                  </div>
                  <div className="compose-callout info"><strong>Measure, don't count recompositions.</strong> Recomposition counts alone do not tell you whether users experience a performance problem.</div>
                </>
              ))}

              {renderLearnSection('quality', '09', 'Testing & accessibility', 'Compose tests use the semantics tree—the same meaningful structure assistive technologies consume.', (
                <>
                  <div className="compose-flow compose-flow-horizontal">
                    {[
                      ['01', 'Set content', 'ComposeTestRule'],
                      ['02', 'Find node', 'Semantics matcher'],
                      ['03', 'Perform', 'Click / input'],
                      ['04', 'Assert', 'State / visibility'],
                    ].map(([step, title, detail], index) => (
                      <div className="compose-flow-item" key={step}>
                        <div className="compose-flow-node"><span>{step}</span><strong>{title}</strong><small>{detail}</small></div>
                        {index < 3 && <span className="compose-flow-arrow">→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="compose-mini-grid">
                    <article><span>ACCESSIBILITY</span><h3>Meaningful semantics</h3><p>Give informative images useful descriptions. Keep decorative content from producing redundant announcements.</p></article>
                    <article><span>TESTING</span><h3>Use testTag sparingly</h3><p>Prefer meaningful text and semantics; add stable tags when those are insufficient.</p></article>
                    <article><span>INTEROP</span><h3>Bridge when needed</h3><p><code>AndroidView</code> embeds a View in Compose; <code>ComposeView</code> hosts Compose in a View hierarchy.</p></article>
                  </div>
                </>
              ))}

              {renderLearnSection('patterns', '10', 'Code patterns', 'Switch between the compact patterns that solve common screen-level problems.', (
                <>
                  <div className="compose-pattern-tabs" role="group" aria-label="Choose a Compose code pattern">
                    {codeSamples.map((sample, index) => (
                      <button type="button" key={sample.label} aria-pressed={activeCode === index} className={activeCode === index ? 'active' : ''} onClick={() => setActiveCode(index)}>
                        <span>0{index + 1}</span>{sample.label}
                      </button>
                    ))}
                  </div>
                  <p className="compose-pattern-note">{codeSamples[activeCode].note}</p>
                  <CodeBlock code={codeSamples[activeCode].code} label="Kotlin · Compose pattern" />
                </>
              ))}
            </>
          )}

          {view === 'rapid' && (
            <section id="compose-rapid" className="compose-topic compose-rapid-topic">
              <ComposeSectionHeading
                index="↗"
                title="Rapid recall"
                description="Start with the core questions, then use the extra reminders to round out your revision."
                action={(
                  <button
                    type="button"
                    className="compose-hover-toggle"
                    aria-pressed={areRecallHoverPreviewsEnabled}
                    onClick={() => {
                      setAreRecallHoverPreviewsEnabled((enabled) => !enabled);
                      setIsRememberHovered(false);
                      setIsLaunchedEffectHovered(false);
                      setIsDisposableEffectHovered(false);
                      setIsHoistingHovered(false);
                      setIsRecompositionHovered(false);
                      setPinnedRecallTip(null);
                    }}
                  >
                    <span>Hover previews</span>
                    <span className="compose-hover-toggle-state">{areRecallHoverPreviewsEnabled ? 'On' : 'Off'}</span>
                    <span className="compose-hover-toggle-track" aria-hidden="true"><i /></span>
                  </button>
                )}
              />
              {matchingCoreRecall.length > 0 && (
                <section className="compose-recall-group" aria-labelledby="compose-core-recall-title">
                  <div className="compose-recall-heading">
                    <div><span>THE ESSENTIAL TEN</span><h3 id="compose-core-recall-title">Core rapid recall</h3><small className="compose-recall-heading-hint">Hover or use any card’s guide button to unpack the idea</small></div>
                    <div className="compose-recall-heading-actions">
                      <strong>{matchingCoreRecall.length} / {coreRapidRecall.length}</strong>
                    </div>
                  </div>
                  <div className="compose-rapid-grid">
                    {matchingCoreRecall.map(([question, answer], index) => {
                      const isRememberRecall = question === coreRapidRecall[0][0];
                      const isStateHoistingRecall = question === coreRapidRecall[1][0];
                      const isRecompositionRecall = question === coreRapidRecall[2][0];
                      const isLaunchedEffectRecall = question === coreRapidRecall[3][0];
                      const isDisposableEffectRecall = question === coreRapidRecall[4][0];
                      const explanationId = isRememberRecall
                        ? 'compose-remember-explanation'
                        : isStateHoistingRecall
                          ? 'compose-state-hoisting-explanation'
                          : isRecompositionRecall
                            ? 'compose-recomposition-explanation'
                            : isLaunchedEffectRecall
                              ? 'compose-launched-effect-explanation'
                              : isDisposableEffectRecall
                                ? 'compose-disposable-effect-explanation'
                                : `compose-core-tip-${index}`;
                      const isPinned = pinnedRecallTip === explanationId;
                      const isDismissed = dismissedRecallTip === explanationId;
                      return (
                        <article
                          key={question}
                          className={`compose-rapid-explainer${isRememberRecall ? ' compose-rapid-first' : ''}${isStateHoistingRecall ? ' compose-rapid-second' : ''}${isRecompositionRecall ? ' compose-rapid-third' : ''}${areRecallHoverPreviewsEnabled ? ' compose-hover-enabled' : ''}${isPinned ? ' compose-tip-pinned' : ''}${isDismissed ? ' compose-tip-dismissed' : ''}`}
                          onPointerEnter={() => {
                            handleRecallPointerTransition(explanationId);
                            if (isRememberRecall && areRecallHoverPreviewsEnabled) {
                              cancelHoistingClose();
                              setIsRememberHovered(true);
                            }
                            if (isStateHoistingRecall && areRecallHoverPreviewsEnabled) {
                              cancelHoistingClose();
                              setIsHoistingHovered(true);
                            }
                            if (isRecompositionRecall && areRecallHoverPreviewsEnabled) {
                              cancelHoistingClose();
                              setIsRecompositionHovered(true);
                            }
                            if (isLaunchedEffectRecall && areRecallHoverPreviewsEnabled) {
                              cancelHoistingClose();
                              setIsLaunchedEffectHovered(true);
                            }
                            if (isDisposableEffectRecall && areRecallHoverPreviewsEnabled) {
                              cancelHoistingClose();
                              setIsDisposableEffectHovered(true);
                            }
                          }}
                          onPointerLeave={() => {
                            handleRecallPointerTransition(explanationId);
                            if (isRememberRecall || isStateHoistingRecall || isRecompositionRecall || isLaunchedEffectRecall || isDisposableEffectRecall) scheduleHoistingClose();
                          }}
                          onFocus={() => {
                            if (isRememberRecall) {
                              cancelHoistingClose();
                              setIsRememberFocused(true);
                            }
                            if (isStateHoistingRecall) {
                              cancelHoistingClose();
                              setIsHoistingFocused(true);
                            }
                            if (isRecompositionRecall) {
                              cancelHoistingClose();
                              setIsRecompositionFocused(true);
                            }
                            if (isLaunchedEffectRecall) {
                              cancelHoistingClose();
                              setIsLaunchedEffectFocused(true);
                            }
                            if (isDisposableEffectRecall) {
                              cancelHoistingClose();
                              setIsDisposableEffectFocused(true);
                            }
                          }}
                          onBlur={(event) => {
                            const focusIsInPopover = event.relatedTarget instanceof Node
                              && document.getElementById(explanationId)?.contains(event.relatedTarget);
                            if (!(event.relatedTarget instanceof Node) || (!event.currentTarget.contains(event.relatedTarget) && !focusIsInPopover)) {
                              if (isStateHoistingRecall) setIsHoistingFocused(false);
                              if (isRecompositionRecall) setIsRecompositionFocused(false);
                              if (isRememberRecall) setIsRememberFocused(false);
                              if (isLaunchedEffectRecall) setIsLaunchedEffectFocused(false);
                              if (isDisposableEffectRecall) setIsDisposableEffectFocused(false);
                            }
                          }}
                        >
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <div>
                            <h3>{question}</h3>
                            <p>{answer}</p>
                          </div>
                          <button
                            type="button"
                            className="compose-recall-quick-button"
                            aria-label={`Open explanation for ${question}`}
                            aria-controls={explanationId}
                            onClick={() => openRecallTip(explanationId)}
                          >
                            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8 11.9 8l6.3 2-6.3 2-1.9 6.2L8 12l-6.2-2L8 8z" /><path d="m15.8 1 .8 2.2 2.2.8-2.2.8-.8 2.2L15 4.8 12.8 4l2.2-.8z" /></svg>
                          </button>
                          {isRememberRecall && !isDismissed && (isRememberHovered || isRememberFocused || isPinned) && createPortal(
                            <div
                              id="compose-remember-explanation"
                              className="compose-recall-popover compose-remember-popover"
                              role="region"
                              aria-label="remember versus rememberSaveable visual guide"
                              onPointerEnter={() => { cancelHoistingClose(); setIsRememberHovered(true); }}
                              onPointerLeave={scheduleHoistingClose}
                            >
                              <button
                                type="button"
                                className="hoist-close-button"
                                aria-label="Close remember visual guide"
                                onClick={() => {
                                  cancelHoistingClose();
                                  setIsRememberHovered(false);
                                  setIsRememberFocused(false);
                                  dismissRecallTip(explanationId);
                                }}
                              >
                                <span aria-hidden="true">×</span>
                              </button>
                              <header className="recomposition-heading">
                                <span className="recomposition-kicker">JETPACK COMPOSE · STATE LIFECYCLE</span>
                                <h4><code>remember</code> vs <code>rememberSaveable</code></h4>
                                <p>Both retain state through recomposition. The difference is what happens when the composition is recreated.</p>
                              </header>
                              <section className="recomposition-sequence remember-sequence" aria-label="State across screen recreation">
                                <article className="recomposition-step">
                                  <span className="recomposition-step-number">01 · CURRENT SCREEN</span>
                                  <div className="recomposition-counter"><span>Counter state</span><strong>Count: 5</strong><small>Value in use</small></div>
                                </article>
                                <span className="recomposition-sequence-arrow" aria-hidden="true">→</span>
                                <article className="recomposition-step changed">
                                  <span className="recomposition-step-number">02 · SCREEN RECREATED</span>
                                  <div className="recomposition-action"><b aria-hidden="true">↻</b><span>For example, rotation<small>Composition is created again</small></span></div>
                                </article>
                                <span className="recomposition-sequence-arrow" aria-hidden="true">→</span>
                                <article className="recomposition-step remember-outcomes">
                                  <span className="recomposition-step-number">03 · DIFFERENT RESULTS</span>
                                  <div className="remember-outcome lost"><span><code>remember</code></span><strong>Count: 0</strong><small>Starts over</small></div>
                                  <div className="remember-outcome restored"><span><code>rememberSaveable</code></span><strong>Count: 5</strong><small>Restored</small></div>
                                </article>
                              </section>
                              <section className="recomposition-concepts remember-concepts" aria-label="What both APIs do">
                                <article><span aria-hidden="true">↻</span><div><strong>During recomposition</strong><p>Both keep the value while the composable remains in the composition.</p></div></article>
                                <article><span aria-hidden="true">◉</span><div><strong><code>remember</code></strong><p>In-memory state for the current composition; it is forgotten when that composition leaves.</p></div></article>
                                <article><span aria-hidden="true">✓</span><div><strong><code>rememberSaveable</code></strong><p>Restores supported values after recreation when saved instance state is available.</p></div></article>
                              </section>
                              <div className="recomposition-detail-grid remember-detail-grid">
                                <section className="recomposition-code-card">
                                  <div className="recomposition-card-heading"><span>01</span><h5>Choose by state lifetime</h5></div>
                                  <div className="remember-code-example"><span>Temporary UI state</span><code>var count by remember {'{'}<br />&nbsp;&nbsp;mutableIntStateOf(0)<br />{'}'}</code></div>
                                  <div className="remember-code-example saveable"><span>Small restorable UI state</span><code>var count by rememberSaveable {'{'}<br />&nbsp;&nbsp;mutableIntStateOf(0)<br />{'}'}</code></div>
                                  <p>For durable app data, use a persistent source such as Room or DataStore.</p>
                                </section>
                                <section className="recomposition-scope-card remember-lifecycle-card">
                                  <div className="recomposition-card-heading"><span>02</span><h5>Quick comparison</h5></div>
                                  <div className="remember-lifecycle-row"><strong>Recomposition</strong><span>Both keep the value</span></div>
                                  <div className="remember-lifecycle-row"><strong>Configuration change</strong><span><code>remember</code> resets · <code>rememberSaveable</code> restores</span></div>
                                  <div className="remember-lifecycle-row"><strong>System process recreation</strong><span><code>rememberSaveable</code> can restore when saved state is available</span></div>
                                  <p>Saved UI state is not permanent storage and is not guaranteed after force-stop or dismissing the app.</p>
                                </section>
                              </div>
                              <footer className="recomposition-takeaway remember-takeaway"><span aria-hidden="true">✦</span><p><strong>Recall it:</strong> Both survive recomposition; use <code>rememberSaveable</code> when supported UI state should restore after recreation.</p></footer>
                            </div>,
                            document.body,
                          )}
                          {isLaunchedEffectRecall && !isDismissed && (isLaunchedEffectHovered || isLaunchedEffectFocused || isPinned) && createPortal(
                            <div
                              id="compose-launched-effect-explanation"
                              className="compose-recall-popover compose-effect-pair-popover"
                              role="region"
                              aria-label="LaunchedEffect versus rememberCoroutineScope visual guide"
                              onPointerEnter={() => { cancelHoistingClose(); setIsLaunchedEffectHovered(true); }}
                              onPointerLeave={scheduleHoistingClose}
                            >
                              <button type="button" className="hoist-close-button" aria-label="Close LaunchedEffect visual guide" onClick={() => {
                                cancelHoistingClose();
                                setIsLaunchedEffectHovered(false);
                                setIsLaunchedEffectFocused(false);
                                dismissRecallTip(explanationId);
                              }}><span aria-hidden="true">×</span></button>
                              <header className="recomposition-heading effect-pair-heading">
                                <span className="recomposition-kicker">JETPACK COMPOSE · COROUTINE TRIGGERS</span>
                                <h4><code>LaunchedEffect</code> vs <code>rememberCoroutineScope</code></h4>
                                <p>Both launch coroutines tied to the composition, but one starts from composition and the other from an event.</p>
                              </header>
                              <section className="effect-pair-columns" aria-label="Coroutine launch choices">
                                <article className="effect-pair-panel launched">
                                  <div className="effect-pair-panel-title"><span aria-hidden="true">↻</span><h5>LaunchedEffect</h5></div>
                                  <p className="effect-pair-purpose">Composition-driven work</p>
                                  <div className="effect-pair-flow"><span>Enters composition<br /><small>or key changes</small></span><i aria-hidden="true">→</i><span>Coroutine starts<br /><small>automatically</small></span><i aria-hidden="true">→</i><span>Leaves / key changes<br /><small>cancel / restart</small></span></div>
                                  <ul><li>Use for work that belongs to a composable and its keys.</li><li>Key change cancels the old coroutine and launches a new one.</li><li>Leaving composition cancels the coroutine.</li></ul>
                                </article>
                                <article className="effect-pair-panel scope">
                                  <div className="effect-pair-panel-title"><span aria-hidden="true">✦</span><h5>rememberCoroutineScope</h5></div>
                                  <p className="effect-pair-purpose">Event-driven work</p>
                                  <div className="effect-pair-flow"><span>Composable enters<br /><small>scope is remembered</small></span><i aria-hidden="true">→</i><span>User event<br /><small>you call launch</small></span><i aria-hidden="true">→</i><span>Leaves composition<br /><small>scope is cancelled</small></span></div>
                                  <ul><li>Use for a click or callback that should start a coroutine.</li><li>It does not launch anything automatically.</li><li>Scope is cancelled when its composable leaves composition.</li></ul>
                                </article>
                              </section>
                              <div className="effect-pair-example-grid">
                                <section className="recomposition-code-card">
                                  <div className="recomposition-card-heading"><span>01</span><h5>Load when the key is active</h5></div>
                                  <pre><code><span className="recomposition-code-annotation">@Composable</span>{'\n'}<span className="recomposition-code-keyword">fun</span> <span className="recomposition-code-function">UserScreen</span>(userId: Int, viewModel: UserViewModel) {'{'}{'\n'}  <span className="recomposition-code-function">LaunchedEffect</span>(userId) {'{'}{'\n'}    viewModel.loadUser(userId){'\n'}  {'}'}{'\n'}{'}'}</code></pre>
                                  <p>A new <code>userId</code> cancels and restarts the keyed work.</p>
                                </section>
                                <section className="recomposition-code-card">
                                  <div className="recomposition-card-heading"><span>02</span><h5>Launch from a click</h5></div>
                                  <pre><code><span className="recomposition-code-annotation">@Composable</span>{'\n'}<span className="recomposition-code-keyword">fun</span> <span className="recomposition-code-function">RefreshButton</span>(viewModel: UserViewModel) {'{'}{'\n'}  <span className="recomposition-code-keyword">val</span> scope = <span className="recomposition-code-function">rememberCoroutineScope</span>(){'\n'}  <span className="recomposition-code-function">Button</span>(onClick = {'{'}{'\n'}    scope.launch {'{'} viewModel.refresh() {'}'}{'\n'}  {'}'}) {'{'}{'\n'}    <span className="recomposition-code-function">Text</span>(<span className="recomposition-code-string">"Refresh"</span>){'\n'}  {'}'}{'\n'}{'}'}</code></pre>
                                  <p>The coroutine starts only after the user triggers the event.</p>
                                </section>
                              </div>
                              <footer className="recomposition-takeaway"><span aria-hidden="true">✦</span><p><strong>Quick rule:</strong> Composition or key triggers the work? Use <code>LaunchedEffect</code>. A click or callback triggers it? Launch from <code>rememberCoroutineScope</code>.</p></footer>
                            </div>,
                            document.body,
                          )}
                          {isDisposableEffectRecall && !isDismissed && (isDisposableEffectHovered || isDisposableEffectFocused || isPinned) && createPortal(
                            <div
                              id="compose-disposable-effect-explanation"
                              className="compose-recall-popover compose-effect-pair-popover"
                              role="region"
                              aria-label="DisposableEffect versus SideEffect visual guide"
                              onPointerEnter={() => { cancelHoistingClose(); setIsDisposableEffectHovered(true); }}
                              onPointerLeave={scheduleHoistingClose}
                            >
                              <button type="button" className="hoist-close-button" aria-label="Close DisposableEffect visual guide" onClick={() => {
                                cancelHoistingClose();
                                setIsDisposableEffectHovered(false);
                                setIsDisposableEffectFocused(false);
                                dismissRecallTip(explanationId);
                              }}><span aria-hidden="true">×</span></button>
                              <header className="recomposition-heading effect-pair-heading">
                                <span className="recomposition-kicker">JETPACK COMPOSE · EFFECT LIFECYCLE</span>
                                <h4><code>DisposableEffect</code> vs <code>SideEffect</code></h4>
                                <p>Choose based on whether the effect needs a lifecycle cleanup or a quick update after successful recomposition.</p>
                              </header>
                              <section className="effect-pair-columns" aria-label="Effect lifecycle choices">
                                <article className="effect-pair-panel launched">
                                  <div className="effect-pair-panel-title"><span aria-hidden="true">⌫</span><h5>DisposableEffect</h5></div>
                                  <p className="effect-pair-purpose">Setup + cleanup</p>
                                  <div className="effect-pair-flow"><span>Enter / key changes<br /><small>run setup</small></span><i aria-hidden="true">→</i><span>In composition<br /><small>resource active</small></span><i aria-hidden="true">→</i><span>Leave / key changes<br /><small>onDispose cleanup</small></span></div>
                                  <ul><li>Register listeners, observers, or other lifecycle-bound resources.</li><li>Runs again only when it enters or a key changes.</li><li>Pair setup with cleanup in <code>onDispose</code>.</li></ul>
                                </article>
                                <article className="effect-pair-panel scope">
                                  <div className="effect-pair-panel-title"><span aria-hidden="true">↻</span><h5>SideEffect</h5></div>
                                  <p className="effect-pair-purpose">Publish after success</p>
                                  <div className="effect-pair-flow"><span>Composition runs<br /><small>describes UI</small></span><i aria-hidden="true">→</i><span>Successful commit<br /><small>SideEffect runs</small></span><i aria-hidden="true">→</i><span>Next success<br /><small>runs again</small></span></div>
                                  <ul><li>Synchronize Compose state to a non-Compose object.</li><li>Runs after every successful recomposition.</li><li>Keep it quick and non-suspending; it has no cleanup block.</li></ul>
                                </article>
                              </section>
                              <div className="effect-pair-example-grid">
                                <section className="recomposition-code-card">
                                  <div className="recomposition-card-heading"><span>01</span><h5>Register and always clean up</h5></div>
                                  <pre><code><span className="recomposition-code-annotation">@Composable</span>{'\n'}<span className="recomposition-code-function">DisposableEffect</span>(owner) {'{'}{'\n'}  owner.addObserver(observer){'\n'}  <span className="recomposition-code-function">onDispose</span> {'{'}{'\n'}    owner.removeObserver(observer){'\n'}  {'}'}{'\n'}{'}'}</code></pre>
                                  <p>Key changes dispose the previous registration before setting up for the new key.</p>
                                </section>
                                <section className="recomposition-code-card">
                                  <div className="recomposition-card-heading"><span>02</span><h5>Publish committed state</h5></div>
                                  <pre><code><span className="recomposition-code-annotation">@Composable</span>{'\n'}<span className="recomposition-code-keyword">fun</span> <span className="recomposition-code-function">Profile</span>(userType: String) {'{'}{'\n'}  <span className="recomposition-code-function">SideEffect</span> {'{'}{'\n'}    analytics.setUserType(userType){'\n'}  {'}'}{'\n'}{'}'}</code></pre>
                                  <p>Runs after a successful recomposition to update the external object with current state.</p>
                                </section>
                              </div>
                              <footer className="recomposition-takeaway"><span aria-hidden="true">✦</span><p><strong>Quick rule:</strong> Need setup and release? Use <code>DisposableEffect</code>. Need to publish the latest committed value? Use <code>SideEffect</code>.</p></footer>
                            </div>,
                            document.body,
                          )}
                          {!isRememberRecall && !isStateHoistingRecall && !isRecompositionRecall && !isLaunchedEffectRecall && !isDisposableEffectRecall && (
                            <div id={explanationId} className="compose-recall-popover compose-recall-generic" role="region" aria-label={`${question} explanation`}>
                              <button type="button" className="hoist-close-button" aria-label="Close explanation" onClick={() => dismissRecallTip(explanationId)}><span aria-hidden="true">×</span></button>
                              <span className="compose-generic-tip-kicker">QUICK CONCEPT GUIDE</span>
                              <h4>{question}</h4>
                              <div className="compose-generic-tip-flow"><span>QUESTION</span><i aria-hidden="true">→</i><span>CORE IDEA</span></div>
                              <p>{answer}</p>
                              <div className="compose-generic-tip-cue"><strong>RECALL CUE</strong><span>Explain the key idea in one sentence, then connect it to a Compose use case.</span></div>
                            </div>
                          )}
                          {isStateHoistingRecall && !isDismissed && (isHoistingHovered || isHoistingFocused || isPinned) && createPortal(
                            <div
                              id="compose-state-hoisting-explanation"
                              className="compose-recall-popover compose-hoisting-popover"
                              role="region"
                              aria-label="State hoisting visual guide"
                              onPointerEnter={() => { cancelHoistingClose(); setIsHoistingHovered(true); }}
                              onPointerLeave={scheduleHoistingClose}
                            >
                              <button
                                type="button"
                                className="hoist-close-button"
                                aria-label="Close State hoisting visual guide"
                                onClick={() => {
                                  cancelHoistingClose();
                                  setIsHoistingHovered(false);
                                  setIsHoistingFocused(false);
                                  dismissRecallTip(explanationId);
                                }}
                              >
                                <span aria-hidden="true">×</span>
                              </button>
                              <div className="hoist-infographic-heading">
                                <h4>State hoisting</h4>
                                <p>Move state to a common parent and pass it down with a value and an event callback, so multiple components can share and update the same state.</p>
                              </div>
                              <div className="hoist-comparison">
                                <section className="hoist-scenario without">
                                  <h5>Without state hoisting</h5>
                                  <div className="hoist-parent">
                                    <strong>ParentScreen</strong>
                                    <div className="hoist-children">
                                      <div className="hoist-child">
                                        <b>Counter A</b>
                                        <span className="hoist-count">0</span>
                                        <span className="hoist-buttons"><i>−</i><i>+</i></span>
                                        <small>Own state: count = 0</small>
                                      </div>
                                      <div className="hoist-child">
                                        <b>Counter B</b>
                                        <span className="hoist-count">0</span>
                                        <span className="hoist-buttons"><i>−</i><i>+</i></span>
                                        <small>Own state: count = 0</small>
                                      </div>
                                    </div>
                                  </div>
                                  <p>Each child owns separate state. Updating one counter does not update the other.</p>
                                </section>
                                <div className="hoist-transform" aria-hidden="true">→</div>
                                <section className="hoist-scenario with">
                                  <h5>With state hoisting</h5>
                                  <div className="hoist-parent">
                                    <strong>ParentScreen · single source of truth</strong>
                                    <div className="hoist-owner-state"><span aria-hidden="true">◉</span><b>count = 0</b><small>State owner</small></div>
                                    <div className="hoist-children">
                                      <div className="hoist-child">
                                        <b>Counter A</b>
                                        <span className="hoist-count">0</span>
                                        <span className="hoist-buttons"><i>−</i><i>+</i></span>
                                        <small>value + onValueChange</small>
                                      </div>
                                      <div className="hoist-child">
                                        <b>Counter B</b>
                                        <span className="hoist-count">0</span>
                                        <span className="hoist-buttons"><i>−</i><i>+</i></span>
                                        <small>value + onValueChange</small>
                                      </div>
                                    </div>
                                    <div className="hoist-data-flow"><span>value flows down ↓</span><span>↑ events flow up</span></div>
                                  </div>
                                  <p>Both children render and update the same state owned by their parent.</p>
                                </section>
                              </div>
                              <div className="hoist-code-grid">
                                <section className="hoist-code-card without">
                                  <h5>Without state hoisting</h5>
                                  <pre><code>
                                    <span className="hoist-code-annotation">@Composable</span><br />
                                    <span className="hoist-code-keyword">fun</span> <span className="hoist-code-function">CounterA</span>() {'{'}<br />
                                    {'    '}<span className="hoist-code-keyword">var</span> count <span className="hoist-code-keyword">by</span> <span className="hoist-code-function">remember</span> {'{'} <span className="hoist-code-function">mutableIntStateOf</span>(<span className="hoist-code-number">0</span>) {'}'}<br />
                                    {'    '}<span className="hoist-code-function">Column</span> {'{'}<br />
                                    {'        '}<span className="hoist-code-function">Text</span>(<span className="hoist-code-string">"Count: $count"</span>)<br />
                                    {'        '}<span className="hoist-code-function">Button</span>(onClick = {'{'} count++ {'}'}) {'{'} <span className="hoist-code-function">Text</span>(<span className="hoist-code-string">"+"</span>) {'}'}<br />
                                    {'    '}{'}'}<br />
                                    {'}'}
                                  </code></pre>
                                </section>
                                <section className="hoist-code-card with">
                                  <h5>With state hoisting</h5>
                                  <pre><code>
                                    <span className="hoist-code-annotation">@Composable</span><br />
                                    <span className="hoist-code-keyword">fun</span> <span className="hoist-code-function">ParentScreen</span>() {'{'}<br />
                                    {'    '}<span className="hoist-code-keyword">var</span> count <span className="hoist-code-keyword">by</span> <span className="hoist-code-function">remember</span> {'{'} <span className="hoist-code-function">mutableIntStateOf</span>(<span className="hoist-code-number">0</span>) {'}'}<br />
                                    {'    '}<span className="hoist-code-function">Row</span> {'{'}<br />
                                    {'        '}<span className="hoist-code-function">Counter</span>(count) {'{'} count = it {'}'}<br />
                                    {'        '}<span className="hoist-code-function">Counter</span>(count) {'{'} count = it {'}'}<br />
                                    {'    '}{'}'}<br />
                                    {'}'}
                                  </code></pre>
                                </section>
                                <section className="hoist-code-card reusable">
                                  <h5>Child component · reusable</h5>
                                  <pre><code>
                                    <span className="hoist-code-annotation">@Composable</span><br />
                                    <span className="hoist-code-keyword">fun</span> <span className="hoist-code-function">Counter</span>(<br />
                                    {'    '}value: <span className="hoist-code-type">Int</span>,<br />
                                    {'    '}onValueChange: (<span className="hoist-code-type">Int</span>) -&gt; <span className="hoist-code-type">Unit</span><br />
                                    ) {'{'}<br />
                                    {'    '}<span className="hoist-code-function">Column</span> {'{'}<br />
                                    {'        '}<span className="hoist-code-function">Text</span>(<span className="hoist-code-string">"$value"</span>)<br />
                                    {'        '}<span className="hoist-code-function">Row</span> {'{'}<br />
                                    {'            '}<span className="hoist-code-function">Button</span>(onClick = {'{'} onValueChange(value - <span className="hoist-code-number">1</span>) {'}'}) {'{'} <span className="hoist-code-function">Text</span>(<span className="hoist-code-string">"-"</span>) {'}'}<br />
                                    {'            '}<span className="hoist-code-function">Button</span>(onClick = {'{'} onValueChange(value + <span className="hoist-code-number">1</span>) {'}'}) {'{'} <span className="hoist-code-function">Text</span>(<span className="hoist-code-string">"+"</span>) {'}'}<br />
                                    {'        '}{'}'}<br />
                                    {'    '}{'}'}<br />
                                    {'}'}
                                  </code></pre>
                                </section>
                              </div>
                              <div className="compose-recall-rule"><span aria-hidden="true">💡</span><strong>QUICK RULE</strong><p>Keep one source of truth in the lowest common parent. Pass state down as values and send changes up through callbacks.</p>
                              </div>
                            </div>,
                            document.body,
                          )}
                          {isRecompositionRecall && !isDismissed && (isRecompositionHovered || isRecompositionFocused || isPinned) && createPortal(
                            <div
                              id="compose-recomposition-explanation"
                              className="compose-recall-popover compose-recomposition-popover"
                              role="region"
                              aria-label="Recomposition visual guide"
                              onPointerEnter={() => { cancelHoistingClose(); setIsRecompositionHovered(true); }}
                              onPointerLeave={scheduleRecompositionClose}
                            >
                              <button
                                type="button"
                                className="hoist-close-button"
                                aria-label="Close Recomposition visual guide"
                                onClick={() => {
                                  cancelHoistingClose();
                                  setIsRecompositionHovered(false);
                                  setIsRecompositionFocused(false);
                                  dismissRecallTip(explanationId);
                                }}
                              >
                                <span aria-hidden="true">×</span>
                              </button>
                              <header className="recomposition-heading">
                                <span className="recomposition-kicker">JETPACK COMPOSE · HOW UI UPDATES</span>
                                <h4>Recomposition</h4>
                                <p>When observed state changes, Compose re-executes the composable scopes that read it to update the UI.</p>
                              </header>
                              <section className="recomposition-sequence" aria-label="Recomposition sequence">
                                <article className="recomposition-step">
                                  <span className="recomposition-step-number">01 · FIRST COMPOSITION</span>
                                  <div className="recomposition-counter"><span>Counter</span><strong>Count: 0</strong><small>Initial UI</small></div>
                                </article>
                                <span className="recomposition-sequence-arrow" aria-hidden="true">→</span>
                                <article className="recomposition-step changed">
                                  <span className="recomposition-step-number">02 · STATE CHANGES</span>
                                  <div className="recomposition-action"><b>＋</b><span>User taps “Add”<small>count changes: 0 → 1</small></span></div>
                                </article>
                                <span className="recomposition-sequence-arrow" aria-hidden="true">→</span>
                                <article className="recomposition-step updated">
                                  <span className="recomposition-step-number">03 · UI UPDATES</span>
                                  <div className="recomposition-counter"><span>Counter</span><strong>Count: 1</strong><small>Updated UI</small></div>
                                </article>
                              </section>
                              <section className="recomposition-concepts" aria-label="What to remember">
                                <article><span aria-hidden="true">◉</span><div><strong>State is observed</strong><p>A composable that reads the changed state is invalidated and scheduled for recomposition.</p></div></article>
                                <article><span aria-hidden="true">↻</span><div><strong>Compose updates declaratively</strong><p>The composable describes the UI for the new value; Compose applies the necessary changes.</p></div></article>
                                <article><span aria-hidden="true">✓</span><div><strong>Unchanged work may be skipped</strong><p>Eligible scopes with unchanged inputs can be skipped. Recomposition is not a promise that only one widget runs.</p></div></article>
                              </section>
                              <div className="recomposition-detail-grid">
                                <section className="recomposition-code-card">
                                  <div className="recomposition-card-heading"><span>01</span><h5>State drives the UI</h5></div>
                                  <pre><code><span className="recomposition-code-annotation">@Composable</span>{'\n'}<span className="recomposition-code-keyword">fun</span> <span className="recomposition-code-function">Counter</span>() {'{'}{'\n'}  <span className="recomposition-code-keyword">var</span> count <span className="recomposition-code-keyword">by</span> <span className="recomposition-code-function">remember</span> {'{'}{'\n'}    <span className="recomposition-code-function">mutableIntStateOf</span>(<span className="recomposition-code-number">0</span>){'\n'}  {'}'}{'\n'}  <span className="recomposition-code-function">Column</span> {'{'}{'\n'}    <span className="recomposition-code-function">Text</span>(<span className="recomposition-code-string">"Count: $count"</span>){'\n'}    <span className="recomposition-code-function">Button</span>(onClick = {'{'} count++ {'}'}) {'{'}{'\n'}      <span className="recomposition-code-function">Text</span>(<span className="recomposition-code-string">"Add"</span>){'\n'}    {'}'}{'\n'}  {'}'}{'\n'}{'}'}</code></pre>
                                  <p>The <code>Text</code> reads <code>count</code>. Tapping the button changes that state and schedules affected work.</p>
                                </section>
                                <section className="recomposition-scope-card">
                                  <div className="recomposition-card-heading"><span>02</span><h5>Think in scopes</h5></div>
                                  <div className="recomposition-scope-tree">
                                    <div className="recomposition-scope-node root"><span>Counter scope</span><b>re-executes</b></div>
                                    <div className="recomposition-scope-children">
                                      <div className="recomposition-scope-node refreshed"><span>Text("Count: $count")</span><b>reads changed state</b></div>
                                      <div className="recomposition-scope-node skipped"><span>Unchanged child</span><b>may be skipped*</b></div>
                                    </div>
                                  </div>
                                  <p>*When the child is eligible for skipping and its inputs have not changed. Exact work depends on the composition structure.</p>
                                </section>
                              </div>
                              <footer className="recomposition-takeaway"><span aria-hidden="true">✦</span><p><strong>Recall it:</strong> State changes invalidate readers; Compose reruns affected scopes and may skip eligible unchanged work.</p></footer>
                            </div>,
                            document.body,
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
              {matchingAdditionalRecall.length > 0 && (
                <section className="compose-recall-group compose-recall-additional" aria-labelledby="compose-additional-recall-title">
                  <div className="compose-recall-heading">
                    <div><span>BUILD ON THE BASICS</span><h3 id="compose-additional-recall-title">Also important</h3></div>
                    <strong>{matchingAdditionalRecall.length} / {additionalRapidRecall.length}</strong>
                  </div>
                  <div className="compose-rapid-grid">
                    {matchingAdditionalRecall.map(([question, answer], index) => {
                      const explanationId = `compose-extra-tip-${index}`;
                      const isPinned = pinnedRecallTip === explanationId;
                      const isDismissed = dismissedRecallTip === explanationId;
                      return (
                        <article
                          key={question}
                          className={`compose-rapid-explainer compose-additional-tip${areRecallHoverPreviewsEnabled ? ' compose-hover-enabled' : ''}${isPinned ? ' compose-tip-pinned' : ''}${isDismissed ? ' compose-tip-dismissed' : ''}`}
                          onPointerEnter={() => handleRecallPointerTransition(explanationId)}
                          onPointerLeave={() => handleRecallPointerTransition(explanationId)}
                        >
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <div><h3>{question}</h3><p>{answer}</p></div>
                          <button
                            type="button"
                            className="compose-recall-quick-button"
                            aria-label={`Open explanation for ${question}`}
                            aria-controls={explanationId}
                            onClick={() => openRecallTip(explanationId)}
                          >
                            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8 11.9 8l6.3 2-6.3 2-1.9 6.2L8 12l-6.2-2L8 8z" /><path d="m15.8 1 .8 2.2 2.2.8-2.2.8-.8 2.2L15 4.8 12.8 4l2.2-.8z" /></svg>
                          </button>
                          <div id={explanationId} className="compose-recall-popover compose-recall-generic" role="region" aria-label={`${question} explanation`}>
                            <button type="button" className="hoist-close-button" aria-label="Close explanation" onClick={() => dismissRecallTip(explanationId)}><span aria-hidden="true">×</span></button>
                            <span className="compose-generic-tip-kicker">QUICK CONCEPT GUIDE</span>
                            <h4>{question}</h4>
                            <div className="compose-generic-tip-flow"><span>QUESTION</span><i aria-hidden="true">→</i><span>CORE IDEA</span></div>
                            <p>{answer}</p>
                            <div className="compose-generic-tip-cue"><strong>RECALL CUE</strong><span>Explain the key idea in one sentence, then connect it to a Compose use case.</span></div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
              <div className="compose-avoid">
                <span className="compose-card-kicker">COMMON INTERVIEW TRAPS</span>
                <div><strong>Don't say:</strong><span><code>remember</code> survives rotation.</span><strong>Say:</strong><span><code>remember</code> survives recomposition; <code>rememberSaveable</code> restores small saved UI state.</span></div>
                <div><strong>Don't say:</strong><span>Every state update redraws the whole screen.</span><strong>Say:</strong><span>Compose invalidates affected scopes and may skip unchanged work.</span></div>
                <div><strong>Don't say:</strong><span>A composable body is a one-time callback.</span><strong>Say:</strong><span>It can run again; put work with effects or event handlers.</span></div>
              </div>
            </section>
          )}

          {view === 'learn' && matchingSections.length === 0 && (
            <div className="compose-no-results"><strong>No matching concepts</strong><span>Try a broader term like “state”, “effects”, or “lists”.</span></div>
          )}
          {view === 'rapid' && visibleCount === 0 && (
            <div className="compose-no-results"><strong>No quick answers found</strong><span>Try a broader search or clear the search field.</span></div>
          )}

          {view === 'learn' && visibleCount > 0 && (
            <button type="button" className="compose-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
          )}
        </div>
      </div>
    </section>
  );
}
