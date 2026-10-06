import { useEffect, useMemo, useState } from 'react';
import { interviewQuestions, type InterviewQuestion, type QuestionCategoryId } from '../data/interview-question-bank';
import { COMPLETE_REVISION_PROGRESS_KEY, loadCompleteRevisionProgress, saveCompleteRevisionProgress, type CompleteRevisionQuestionProgress } from '../engine/complete-revision-progress';
import QuestionAnswer from './QuestionAnswer';

type ReviewStatus = 'learning' | 'mastered';
type StatusFilter = 'all' | 'new' | ReviewStatus;
type QuestionProgress = CompleteRevisionQuestionProgress;

const PAGE_SIZE = 40;
const categories: Array<{ id: QuestionCategoryId | 'all'; label: string }> = [
  { id: 'all', label: 'All categories' },
  { id: 'java', label: 'Java' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'android', label: 'Android' },
  { id: 'testing', label: 'Testing & Others' },
  { id: 'general', label: 'General / Project / HR' },
];

export default function CompleteRevision() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategoryId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>(() => loadCompleteRevisionProgress(localStorage));

  useEffect(() => {
    saveCompleteRevisionProgress(localStorage, progress);
  }, [progress]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return interviewQuestions.filter((question) => {
      const questionProgress = progress[question.id];
      if (categoryFilter !== 'all' && question.categoryId !== categoryFilter) return false;
      if (statusFilter === 'new' && questionProgress?.status) return false;
      if ((statusFilter === 'learning' || statusFilter === 'mastered') && questionProgress?.status !== statusFilter) return false;
      if (bookmarkedOnly && !questionProgress?.bookmarked) return false;
      if (normalizedSearch && !`${question.id} ${question.prompt} ${question.category}`.toLowerCase().includes(normalizedSearch)) return false;
      return true;
    });
  }, [bookmarkedOnly, categoryFilter, progress, search, statusFilter]);

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);
  const reviewedCount = Object.values(progress).filter((entry) => entry.status).length;

  const updateProgress = (questionId: string, update: Partial<QuestionProgress>) => {
    setProgress((current) => ({
      ...current,
      [questionId]: { ...current[questionId], ...update },
    }));
  };

  const toggleAnswer = (questionId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  return (
    <section className="complete-revision">
      <div className="revision-bank-summary">
        <div><strong>{interviewQuestions.length}</strong><span>questions</span></div>
        <div><strong>{reviewedCount}</strong><span>reviewed</span></div>
      </div>

      <div className="revision-bank-filters">
        <label className="revision-search-label">
          <span>Search questions</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search question or ID" />
        </label>
        <label>
          <span>Category</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as QuestionCategoryId | 'all')}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
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
        <h2>Question bank</h2>
        <span>{filteredQuestions.length} matches</span>
      </div>
      {visibleQuestions.length ? (
        <div className="revision-question-list">
          {visibleQuestions.map((question: InterviewQuestion) => {
            const questionProgress = progress[question.id];
            const isExpanded = expandedIds.has(question.id);
            const status = questionProgress?.status ?? 'new';
            return (
              <article className="revision-question" key={question.id}>
                <div className="revision-question-heading">
                  <button className="revision-question-toggle" type="button" aria-expanded={isExpanded} onClick={() => toggleAnswer(question.id)}>
                    <span className="revision-question-id">{question.id}</span>
                    <span className="revision-question-prompt">{question.prompt}</span>
                    <span className="revision-question-category">{question.category}</span>
                  </button>
                  <button
                    className={questionProgress?.bookmarked ? 'revision-bookmark active' : 'revision-bookmark'}
                    type="button"
                    aria-label={questionProgress?.bookmarked ? `Remove ${question.id} bookmark` : `Bookmark ${question.id}`}
                    aria-pressed={Boolean(questionProgress?.bookmarked)}
                    onClick={() => updateProgress(question.id, { bookmarked: !questionProgress?.bookmarked })}
                  >
                    {questionProgress?.bookmarked ? '★' : '☆'}
                  </button>
                </div>
                {isExpanded && (
                  <div className="revision-question-detail">
                    <div className="revision-question-tools">
                      <span className={`revision-status revision-status-${status}`}>{status === 'new' ? 'New' : status === 'learning' ? 'Reviewing' : 'Mastered'}</span>
                      <label>
                        <span>Mark as</span>
                        <select value={questionProgress?.status ?? ''} onChange={(event) => updateProgress(question.id, { status: (event.target.value || undefined) as ReviewStatus | undefined })}>
                          <option value="">New</option>
                          <option value="learning">Reviewing</option>
                          <option value="mastered">Mastered</option>
                        </select>
                      </label>
                    </div>
                    <QuestionAnswer question={question} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="revision-empty-state">No questions match these filters.</div>
      )}
      {filteredQuestions.length > visibleCount && (
        <button className="secondary-button revision-load-more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Load {Math.min(PAGE_SIZE, filteredQuestions.length - visibleCount)} more questions
        </button>
      )}
    </section>
  );
}