import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { interviewQuestions, type InterviewQuestion } from '../data/interview-question-bank';
import { COMPLETE_REVISION_PROGRESS_KEY, loadCompleteRevisionProgress, saveCompleteRevisionProgress, type CompleteRevisionQuestionProgress } from '../engine/complete-revision-progress';
import QuestionAnswer from './QuestionAnswer';

type ReviewStatus = 'learning' | 'mastered';
type StatusFilter = 'all' | 'new' | ReviewStatus;
type QuestionProgress = CompleteRevisionQuestionProgress;

const PAGE_SIZE = 40;

export default function CompleteRevision() {
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [collapsedWhileShowingAllIds, setCollapsedWhileShowingAllIds] = useState<Set<string>>(() => new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>(() => loadCompleteRevisionProgress(localStorage));
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(
    () => [...new Set(interviewQuestions.map((question) => question.section ?? question.category))],
    [],
  );

  useEffect(() => {
    saveCompleteRevisionProgress(localStorage, progress);
  }, [progress]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [bookmarkedOnly, sectionFilter, search, statusFilter]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return interviewQuestions.filter((question) => {
      const questionProgress = progress[question.id];
      if (sectionFilter !== 'all' && (question.section ?? question.category) !== sectionFilter) return false;
      if (statusFilter === 'new' && questionProgress?.status) return false;
      if ((statusFilter === 'learning' || statusFilter === 'mastered') && questionProgress?.status !== statusFilter) return false;
      if (bookmarkedOnly && !questionProgress?.bookmarked) return false;
      if (normalizedSearch && !`${question.displayId ?? question.id} ${question.prompt} ${question.category} ${question.section ?? ''}`.toLowerCase().includes(normalizedSearch)) return false;
      return true;
    });
  }, [bookmarkedOnly, progress, search, sectionFilter, statusFilter]);

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);
  const reviewedCount = interviewQuestions.filter((question) => progress[question.id]?.status).length;

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleCount >= filteredQuestions.length) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredQuestions.length));
      }
    }, { rootMargin: '300px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredQuestions.length, visibleCount]);

  const updateProgress = (questionId: string, update: Partial<QuestionProgress>) => {
    setProgress((current) => ({
      ...current,
      [questionId]: { ...current[questionId], ...update },
    }));
  };

  const toggleAnswer = (questionId: string) => {
    if (showAllAnswers) {
      setCollapsedWhileShowingAllIds((current) => {
        const next = new Set(current);
        if (next.has(questionId)) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
      return;
    }

    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const toggleShowAllAnswers = (checked: boolean) => {
    setShowAllAnswers(checked);
    setCollapsedWhileShowingAllIds(new Set());
  };

  const handleQuestionToggle = (event: MouseEvent<HTMLButtonElement>, questionId: string) => {
    if (event.detail > 0) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0 && selection.getRangeAt(0).intersectsNode(event.currentTarget)) {
        return;
      }
    }
    toggleAnswer(questionId);
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
          <span>Section</span>
          <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}>
            <option value="all">All sections</option>
            {sections.map((section) => <option key={section} value={section}>{section}</option>)}
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
        <div className="revision-bank-filter-options">
          <label className="revision-bank-option">
            <input type="checkbox" checked={showAllAnswers} onChange={(event) => toggleShowAllAnswers(event.target.checked)} />
            Show all answers
          </label>
          <label className="revision-bookmarks-filter">
            <input type="checkbox" checked={bookmarkedOnly} onChange={(event) => setBookmarkedOnly(event.target.checked)} />
            Bookmarked only
          </label>
        </div>
      </div>

      <div className="revision-results-heading">
        <h2>Question bank</h2>
        <span>{filteredQuestions.length} matches</span>
      </div>
      {visibleQuestions.length ? (
        <div className="revision-question-list">
          {visibleQuestions.map((question: InterviewQuestion) => {
            const questionProgress = progress[question.id];
            const isExpanded = showAllAnswers
              ? !collapsedWhileShowingAllIds.has(question.id)
              : expandedIds.has(question.id);
            const status = questionProgress?.status ?? 'new';
            return (
              <article className={isExpanded ? 'revision-question is-expanded' : 'revision-question'} key={question.id}>
                <div className="revision-question-heading">
                  <button className="revision-question-toggle" type="button" aria-expanded={isExpanded} onClick={(event) => handleQuestionToggle(event, question.id)}>
                    <span className="revision-question-id">{question.displayId ?? question.id}</span>
                    <span className="revision-question-prompt">{question.prompt}</span>
                    <span className="revision-question-category">{question.section ?? question.category}</span>
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
      {filteredQuestions.length > visibleCount && <div ref={loadMoreRef} className="revision-load-more-sentinel" aria-hidden="true" />}
    </section>
  );
}