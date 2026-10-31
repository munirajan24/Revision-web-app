import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { androidConcepts, androidConceptQuestions, type AndroidConceptId, type AndroidConceptQuestion, type PrepDifficulty, type PrepMode } from '../data/android-concept-prep';
import { parseCompleteRevisionProgress, type CompleteRevisionProgress } from '../engine/complete-revision-progress';

type ReviewStatus = 'learning' | 'mastered';
type ProgressEntry = CompleteRevisionProgress[string];
type ProgressStore = CompleteRevisionProgress;
type ConceptFilter = AndroidConceptId | 'all';
type StatusFilter = 'all' | 'new' | ReviewStatus;

const STORAGE_KEY = 'kotlin-interview-trainer-android-concept-prep-v1';

function loadProgress(): ProgressStore {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return parseCompleteRevisionProgress(JSON.parse(raw)) ?? {};
  } catch {
    return {};
  }
}

function searchText(question: AndroidConceptQuestion) {
  const { exercise } = question;
  return [
    question.concept,
    question.subtopic,
    question.interviewQuestion,
    question.answer,
    exercise.problem,
    exercise.requirements.join(' '),
    exercise.starterCode,
    exercise.expectedBehavior,
    exercise.solutionCode,
    exercise.explanation,
    exercise.tests,
    exercise.commonMistakes.join(' '),
  ].join(' ').toLowerCase();
}

export default function AndroidConceptPrep() {
  const [mode, setMode] = useState<PrepMode>('concept');
  const [search, setSearch] = useState('');
  const [conceptFilter, setConceptFilter] = useState<ConceptFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<PrepDifficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [progress, setProgress] = useState<ProgressStore>(loadProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return androidConceptQuestions.filter((question) => {
      const entry = progress[question.id];
      if (conceptFilter !== 'all' && question.conceptId !== conceptFilter) return false;
      if (difficultyFilter !== 'all' && question.difficulty !== difficultyFilter) return false;
      if (statusFilter === 'new' && entry?.status) return false;
      if ((statusFilter === 'learning' || statusFilter === 'mastered') && entry?.status !== statusFilter) return false;
      if (bookmarkedOnly && !entry?.bookmarked) return false;
      if (normalizedSearch && !searchText(question).includes(normalizedSearch)) return false;
      return true;
    });
  }, [bookmarkedOnly, conceptFilter, difficultyFilter, progress, search, statusFilter]);

  const questionsByConcept = useMemo(() => {
    const visible = new Set(filteredQuestions.map((question) => question.id));
    return androidConcepts
      .filter((concept) => conceptFilter === 'all' || concept.id === conceptFilter)
      .map((concept) => ({
        ...concept,
        topics: concept.topics.filter((question) => visible.has(question.id)),
      }))
      .filter((concept) => concept.topics.length > 0);
  }, [conceptFilter, filteredQuestions]);

  const reviewedCount = Object.values(progress).filter((entry) => entry.status).length;
  const bookmarkedCount = Object.values(progress).filter((entry) => entry.bookmarked).length;

  const updateProgress = (questionId: string, update: Partial<ProgressEntry>) => {
    setProgress((current) => {
      const next = {
        ...current,
        [questionId]: { ...current[questionId], ...update },
      };
      return next;
    });
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  return (
    <section className="complete-revision android-concept-prep">
      <p className="android-concept-intro">
        Focused Android interview practice across Kotlin Coroutines, Kotlin Flow, Clean Architecture, and Jetpack Compose.
        Each topic pairs a concept question with a complete programming exercise and worked solution.
      </p>
      <div className="revision-bank-summary">
        <div><strong>{androidConceptQuestions.length}</strong><span>topic sets</span></div>
        <div><strong>{reviewedCount}</strong><span>reviewed</span></div>
        <div><strong>{bookmarkedCount}</strong><span>bookmarked</span></div>
      </div>

      <div className="android-concept-mode" role="tablist" aria-label="Android interview preparation mode">
        <button type="button" className={mode === 'concept' ? 'mode-button active' : 'mode-button'} role="tab" aria-selected={mode === 'concept'} onClick={() => setMode('concept')}>
          Concept-wise Questions
        </button>
        <button type="button" className={mode === 'programming' ? 'mode-button active' : 'mode-button'} role="tab" aria-selected={mode === 'programming'} onClick={() => setMode('programming')}>
          Concept-wise Programming
        </button>
      </div>

      <div className="revision-bank-filters android-concept-filters">
        <label className="revision-search-label">
          <span>Search topics and answers</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search concepts, code, tests, or pitfalls" />
        </label>
        <label>
          <span>Concept</span>
          <select value={conceptFilter} onChange={(event) => setConceptFilter(event.target.value as ConceptFilter)}>
            <option value="all">All Android concepts</option>
            {androidConcepts.map((concept) => <option key={concept.id} value={concept.id}>{concept.name}</option>)}
          </select>
        </label>
        <label>
          <span>Difficulty</span>
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as PrepDifficulty | 'all')}>
            <option value="all">All difficulties</option>
            <option value="Fundamental">Fundamental</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>
        <label>
          <span>Review status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="learning">Reviewing</option>
            <option value="mastered">Mastered</option>
          </select>
        </label>
        <label className="revision-bookmarks-filter">
          <input type="checkbox" checked={bookmarkedOnly} onChange={(event) => setBookmarkedOnly(event.target.checked)} />
          Bookmarked only
        </label>
      </div>

      <div className="revision-results-heading">
        <h2>{mode === 'concept' ? 'Interview questions' : 'Programming exercises'}</h2>
        <span>{filteredQuestions.length} topic sets</span>
      </div>

      {questionsByConcept.length > 0 ? questionsByConcept.map((concept) => (
        <section className="android-concept-group" key={concept.id} aria-label={concept.name}>
          <div className="android-concept-heading">
            <div>
              <h2>{concept.name}</h2>
              <p>{concept.description}</p>
            </div>
            <span>{concept.topics.length} topics</span>
          </div>
          <div className="revision-question-list">
            {concept.topics.map((question) => {
              const entry = progress[question.id];
              const isExpanded = expandedIds.has(question.id);
              const status = entry?.status ?? 'new';
              const exercise = question.exercise;
              return (
                <article className="revision-question" key={question.id}>
                  <div className="revision-question-heading">
                    <button className="revision-question-toggle" type="button" aria-expanded={isExpanded} onClick={() => toggleQuestion(question.id)}>
                      <span className="revision-question-id">{question.difficulty.slice(0, 3).toUpperCase()}</span>
                      <span className="revision-question-prompt">
                        {mode === 'concept' ? question.interviewQuestion : exercise.problem}
                      </span>
                      <span className="revision-question-category">{question.subtopic}</span>
                    </button>
                    <button
                      className={entry?.bookmarked ? 'revision-bookmark active' : 'revision-bookmark'}
                      type="button"
                      aria-label={entry?.bookmarked ? `Remove ${question.subtopic} bookmark` : `Bookmark ${question.subtopic}`}
                      aria-pressed={Boolean(entry?.bookmarked)}
                      onClick={() => updateProgress(question.id, { bookmarked: !entry?.bookmarked })}
                    >
                      {entry?.bookmarked ? '★' : '☆'}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="revision-question-detail">
                      <div className="revision-question-tools">
                        <span className={`revision-status revision-status-${status}`}>{status === 'new' ? 'New' : status === 'learning' ? 'Reviewing' : 'Mastered'}</span>
                        <span className="android-concept-difficulty">{question.difficulty}</span>
                        <label>
                          <span>Mark as</span>
                          <select value={entry?.status ?? ''} onChange={(event) => updateProgress(question.id, { status: (event.target.value || undefined) as ReviewStatus | undefined })}>
                            <option value="">New</option>
                            <option value="learning">Reviewing</option>
                            <option value="mastered">Mastered</option>
                          </select>
                        </label>
                      </div>
                      {mode === 'concept' ? (
                        <div className="question-answer-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.answer}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="question-answer-content android-exercise-content">
                          <h3>Requirements</h3>
                          <ul>{exercise.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
                          <h3>Starter code</h3>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{`\`\`\`kotlin\n${exercise.starterCode}\n\`\`\``}</ReactMarkdown>
                          <h3>Expected behavior</h3>
                          <p>{exercise.expectedBehavior}</p>
                          <h3>Solution</h3>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{`\`\`\`kotlin\n${exercise.solutionCode}\n\`\`\``}</ReactMarkdown>
                          <h3>Explanation</h3>
                          <p>{exercise.explanation}</p>
                          <h3>Tests</h3>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{`\`\`\`kotlin\n${exercise.tests}\n\`\`\``}</ReactMarkdown>
                          <h3>Common mistakes</h3>
                          <ul>{exercise.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )) : (
        <div className="revision-empty-state">No Android topics match these filters.</div>
      )}
    </section>
  );
}
