import { useEffect, useMemo, useState } from 'react';
import ComposeQuickLearn from './ComposeQuickLearn';

type QuickReviewCategory = 'Coroutines' | 'Flow' | 'Compose';

interface QuickReview {
  id: string;
  category: QuickReviewCategory;
  title: string;
  takeaway: string;
  example: string;
  remember: string;
}

const STORAGE_KEY = 'kotlin-interview-trainer-android-quick-review-v1';

const categories: Array<'All' | QuickReviewCategory> = ['All', 'Coroutines', 'Flow', 'Compose'];

const reviews: QuickReview[] = [
  {
    id: 'coroutine-scope',
    category: 'Coroutines',
    title: 'Structured concurrency',
    takeaway: 'Launch work in the scope that owns its lifetime. Child coroutines are cancelled with their parent.',
    example: 'viewModelScope.launch {\n    val result = repository.load()\n    uiState.value = result\n}',
    remember: 'Avoid GlobalScope: it has no lifecycle owner and can leave work running after the screen is gone.',
  },
  {
    id: 'suspend-dispatcher',
    category: 'Coroutines',
    title: 'suspend does not mean background',
    takeaway: 'A suspend function can pause without blocking a thread. It does not automatically change dispatchers.',
    example: 'withContext(Dispatchers.IO) {\n    blockingFileRead()\n}',
    remember: 'Use Main for UI, IO for blocking I/O, and Default for CPU-heavy work. Make blocking APIs main-safe.',
  },
  {
    id: 'coroutine-launch-async',
    category: 'Coroutines',
    title: 'launch vs async',
    takeaway: 'launch returns a Job for work without a result; async returns Deferred<T>, whose result is read with await().',
    example: 'coroutineScope {\n    val user = async { loadUser() }\n    val feed = async { loadFeed() }\n    show(user.await(), feed.await())\n}',
    remember: 'Use async for independent results you need to combine, not as a replacement for ordinary sequential calls.',
  },
  {
    id: 'flow-cold',
    category: 'Flow',
    title: 'Flow is usually cold',
    takeaway: 'A cold Flow starts its upstream work separately for each collector, and only when collection begins.',
    example: 'val names: Flow<List<Name>> =\n    dao.observeNames()\n\nnames.collect { render(it) }',
    remember: 'Creating a Flow does not collect it. Collect UI state with lifecycle-aware APIs such as collectAsStateWithLifecycle().',
  },
  {
    id: 'flow-operators',
    category: 'Flow',
    title: 'Transform, then collect',
    takeaway: 'Use operators to describe a stream pipeline; collect at the boundary where values are consumed.',
    example: 'query\n    .debounce(300)\n    .distinctUntilChanged()\n    .flatMapLatest(repository::search)\n    .collect { render(it) }',
    remember: 'flatMapLatest cancels the previous inner flow when a newer value arrives—useful for search-as-you-type.',
  },
  {
    id: 'stateflow-sharedflow',
    category: 'Flow',
    title: 'StateFlow vs SharedFlow',
    takeaway: 'StateFlow represents the latest state and always has a current value. SharedFlow broadcasts values with configurable replay.',
    example: 'private val _state = MutableStateFlow(UiState())\nval state: StateFlow<UiState> = _state',
    remember: 'Expose read-only Flow/StateFlow from a ViewModel; keep the mutable flow private.',
  },
  {
    id: 'compose-state',
    category: 'Compose',
    title: 'State drives UI',
    takeaway: 'Composable functions describe UI from current state. When observed state changes, Compose recomposes affected UI.',
    example: '@Composable\nfun Counter() {\n    var count by remember { mutableIntStateOf(0) }\n    Button(onClick = { count++ }) {\n        Text(\"Count: $count\")\n    }\n}',
    remember: 'Keep state in the lowest common owner that needs it. Do not treat recomposition as a one-time lifecycle callback.',
  },
  {
    id: 'compose-hoisting',
    category: 'Compose',
    title: 'State hoisting',
    takeaway: 'Move state to a caller and pass a value plus events down. This makes UI components reusable and easier to test.',
    example: '@Composable\nfun NameField(name: String, onNameChange: (String) -> Unit)',
    remember: 'The reusable child renders state and reports events; the state owner decides how to update it.',
  },
  {
    id: 'compose-effects',
    category: 'Compose',
    title: 'Side effects need effect APIs',
    takeaway: 'Composable bodies may run again. Use effect APIs to run work with explicit keys and lifecycle.',
    example: 'LaunchedEffect(userId) {\n    viewModel.load(userId)\n}',
    remember: 'LaunchedEffect restarts when its keys change and is cancelled when it leaves composition. Avoid launching work directly in the body.',
  },
];

function loadSavedReviews(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const saved: unknown = JSON.parse(raw);
    return Array.isArray(saved) && saved.every((item) => typeof item === 'string') ? saved : [];
  } catch {
    return [];
  }
}

export default function AndroidQuickReview() {
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(loadSavedReviews);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  const visibleReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (category !== 'All' && review.category !== category) return false;
      if (savedOnly && !savedIds.includes(review.id)) return false;
      const searchableText = `${review.category} ${review.title} ${review.takeaway} ${review.example} ${review.remember}`.toLowerCase();
      return !normalizedSearch || searchableText.includes(normalizedSearch);
    });
  }, [category, savedIds, savedOnly, search]);

  const toggleSaved = (id: string) => {
    setSavedIds((current) => current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [...current, id]);
  };

  return (
    <section className="android-quick-review" aria-label="Android quick review">
      {category === 'Compose' ? (
        <ComposeQuickLearn search={search} onSearchChange={setSearch} onBack={() => setCategory('All')} />
      ) : (
        <>
      <p className="android-quick-intro">
        Fast Kotlin and Jetpack Compose refreshers for a quick study break or a last-minute reminder.
        Save the cards you want to revisit.
      </p>

      <div className="android-quick-tools">
        <label className="android-quick-search">
          <span>Search reminders</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try lifecycle, dispatcher, recomposition…"
          />
        </label>
        <label className="android-quick-saved-filter">
          <input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />
          Saved only ({savedIds.length})
        </label>
      </div>

      <div className="android-quick-categories" role="group" aria-label="Filter reminders by topic">
        {categories.map((option) => (
          <button
            key={option}
            className={category === option ? 'mode-button active' : 'mode-button'}
            type="button"
            aria-pressed={category === option}
            onClick={() => setCategory(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="android-quick-count" role="status">
        Showing {visibleReviews.length} of {reviews.length} reminders
      </p>

      {visibleReviews.length > 0 ? (
        <div className="android-quick-grid">
          {visibleReviews.map((review) => {
            const isSaved = savedIds.includes(review.id);
            return (
              <article className="android-quick-card" key={review.id}>
                <div className="android-quick-card-heading">
                  <div>
                    <span className="android-quick-category">{review.category}</span>
                    <h2>{review.title}</h2>
                  </div>
                  <button
                    className={isSaved ? 'android-quick-save saved' : 'android-quick-save'}
                    type="button"
                    aria-label={`${isSaved ? 'Remove saved reminder' : 'Save reminder'}: ${review.title}`}
                    aria-pressed={isSaved}
                    onClick={() => toggleSaved(review.id)}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
                <p>{review.takeaway}</p>
                <pre><code>{review.example}</code></pre>
                <p className="android-quick-remember"><strong>Remember:</strong> {review.remember}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="android-quick-empty">No reminders match. Try another topic or clear the search and saved-only filter.</p>
      )}
        </>
      )}
    </section>
  );
}
