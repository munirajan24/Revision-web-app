import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import QuestionAnswer from './QuestionAnswer';
import { interviewQuestions } from '../data/interview-question-bank';
import { getMobileQuestionBank, getMobileQuestionSets, type MobileBankQuestion } from '../data/mobile-interview-bank';
import {
  createMobileInterviewSession,
  expireMobileInterviewPrompt,
  finishMobileInterviewSession,
  getMobileInterviewRemainingSeconds,
  loadMobileInterviewHistory,
  loadMobileInterviewSchedules,
  loadMobileInterviewSession,
  moveMobileInterviewToPrompt,
  pauseMobileInterviewSession,
  resumeMobileInterviewSession,
  saveMobileInterviewHistory,
  saveMobileInterviewSchedules,
  saveMobileInterviewSession,
  type MobileInterviewSchedule,
  type MobileInterviewPrompt,
  type MobileInterviewSession,
  type MobileInterviewTrack,
} from '../engine/mobile-interview';

type MobileInterviewScreen = 'home' | 'practice' | 'sets' | 'history' | 'session' | 'recap';

const MIN_QUESTION_TIME_SECONDS = 10;
const MAX_QUESTION_TIME_SECONDS = 600;
const QUESTION_TIME_STEP_SECONDS = 10;

export default function MobileInterview() {
  const [session, setSession] = useState<MobileInterviewSession | null>(() => loadMobileInterviewSession(localStorage));
  const [screen, setScreen] = useState<MobileInterviewScreen>('home');
  const [importantOnly, setImportantOnly] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [questionBank] = useState(() => getMobileQuestionBank());
  const [questionSets] = useState(() => getMobileQuestionSets(questionBank));
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [randomizeQuestionOrder, setRandomizeQuestionOrder] = useState(false);
  const [history, setHistory] = useState(() => loadMobileInterviewHistory(localStorage));
  const [schedules, setSchedules] = useState(() => loadMobileInterviewSchedules(localStorage));
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [questionTimeLimitSeconds, setQuestionTimeLimitSeconds] = useState(90);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [showHistory, setShowHistory] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const longPressTimer = useRef<number | null>(null);
  const longPressOrigin = useRef<{ x: number; y: number } | null>(null);
  const longPressPointerType = useRef('');
  const longPressHandled = useRef(false);
  const [feedback, setFeedback] = useState<{ promptId: string; result: 'correct' | 'incorrect' | 'submitted'; reveal: boolean; answerViewed: boolean } | null>(null);
  const selectedSets = useMemo(
    () => questionSets.filter((set) => selectedSetIds.includes(set.id)),
    [questionSets, selectedSetIds],
  );
  const availableSections = useMemo(() => {
    const sections = new Map<string, { id: string; title: string; questionCount: number }>();
    selectedSets.forEach((set) => set.sections.forEach((section) => {
      const current = sections.get(section.id);
      sections.set(section.id, { ...section, questionCount: (current?.questionCount ?? 0) + section.questionCount });
    }));
    return [...sections.values()];
  }, [selectedSets]);
  const availablePrompts = useMemo(() => getSectionOrientedPrompts(
    questionBank,
    questionSets,
    selectedSetIds,
    selectedSectionIds,
  ),
  [questionBank, selectedSectionIds, selectedSetIds]);
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  useEffect(() => {
    try {
      saveMobileInterviewSession(localStorage, session);
      setStorageError('');
    } catch {
      setStorageError('This browser could not save the interview. Keep this tab open to avoid losing progress.');
    }
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== 'finished') return;
    setHistory((current) => current.some((entry) => entry.id === session.id) ? current : [session, ...current]);
    setScreen('recap');
    if (session.scheduleId) {
      setSchedules((current) => current.map((schedule) => schedule.id === session.scheduleId
        ? { ...schedule, status: 'completed', completedAt: session.finishedAt ?? Date.now() }
        : schedule));
    }
  }, [session]);

  useEffect(() => {
    if (screen !== 'session' || !session || session.status !== 'running' || session.untimed) return undefined;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setClockNow(now);
      setSession((current) => {
        if (!current || current.status !== 'running' || current.untimed) return current;
        return getMobileInterviewRemainingSeconds(current, now) === 0
          ? expireMobileInterviewPrompt(current, now)
          : current;
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [screen, session?.id, session?.status, session?.activeIndex, session?.endsAt, session?.untimed]);

  useEffect(() => {
    try {
      saveMobileInterviewHistory(localStorage, history);
    } catch {
      setStorageError('This browser could not save interview history. Use Settings > Export Backup to protect your progress.');
    }
  }, [history]);

  useEffect(() => {
    try {
      saveMobileInterviewSchedules(localStorage, schedules);
      setStorageError('');
    } catch {
      setStorageError('This browser could not save the Mobile Interview calendar. Export a backup or keep this tab open.');
    }
  }, [schedules]);

  useEffect(() => () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
  }, []);

  useEffect(() => {
    if (!copyNotice) return undefined;
    const timeout = window.setTimeout(() => setCopyNotice(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [copyNotice]);

  const currentPrompt = session?.prompts[session.activeIndex];
  const sourceQuestion = currentPrompt
    ? interviewQuestions.find((question) => question.prompt === currentPrompt.text
      && getMobileSectionTitle(question) === currentPrompt.sectionTitle)
    : undefined;
  const answeredCount = session?.prompts.filter((prompt) => prompt.answered).length ?? 0;
  const skippedCount = session?.prompts.filter((prompt) => prompt.skipped).length ?? 0;
  const importantCount = session?.prompts.filter((prompt) => prompt.important).length ?? 0;
  const revealedCount = session?.prompts.filter((prompt) => prompt.referenceRevealed).length ?? 0;
  const progressSessions = session && !history.some((entry) => entry.id === session.id) ? [session, ...history] : history;
  const completedQuestionCount = progressSessions.reduce((total, entry) => total + entry.prompts.filter((prompt) => prompt.answered).length, 0);
  const revealedAnswerCount = progressSessions.reduce((total, entry) => total + entry.prompts.filter((prompt) => prompt.referenceRevealed).length, 0);
  const skippedQuestionCount = progressSessions.reduce((total, entry) => total + entry.prompts.filter((prompt) => prompt.skipped).length, 0);

  const beginSession = (schedule?: MobileInterviewSchedule) => {
    if (session && session.status !== 'finished'
      && !window.confirm('Starting another interview will replace the saved interview in progress. Continue?')) return;
    const setIds = schedule?.setIds ?? selectedSetIds;
    const sectionIds = schedule
      ? schedule.sectionIds.length > 0
        ? schedule.sectionIds
        : questionSets.filter((set) => setIds.includes(set.id)).flatMap((set) => set.sections.map((section) => section.id))
      : selectedSectionIds;
    const prompts = getSectionOrientedPrompts(questionBank, questionSets, setIds, sectionIds);
    if (prompts.length === 0) {
      if (schedule) window.alert('This calendar interview uses categories from an older question bank. Remove it and create a new interview with the current categories.');
      return;
    }
    const selectedSetsForSession = questionSets.filter((set) => setIds.includes(set.id));
    const title = schedule?.title ?? (selectedSetsForSession.length === 1
      ? selectedSetsForSession[0].title
      : `${selectedSetsForSession.length} categories`);
    const shouldRandomize = schedule?.randomizeQuestions ?? randomizeQuestionOrder;
    const orderedPrompts = shouldRandomize ? shufflePrompts(prompts) : prompts;
    const timeLimit = schedule?.questionTimeLimitSeconds ?? questionTimeLimitSeconds;
    setSession(createMobileInterviewSession(orderedPrompts, selectedSetsForSession.length > 1 ? 'mixed' : inferTrack(selectedSetsForSession[0]?.title), 0, Date.now(), {
      title,
      setIds,
      questionTimeLimitSeconds: timeLimit,
      ...(schedule ? { scheduleId: schedule.id } : {}),
    }));
    setImportantOnly(false);
    setFeedback(null);
    setScreen('session');
  };

  const updatePrompt = (promptId: string, update: Partial<MobileInterviewPrompt>) => {
    setSession((current) => current && ({
      ...current,
      prompts: current.prompts.map((prompt) => prompt.id === promptId ? { ...prompt, ...update } : prompt),
    }));
  };

  const submitAnswer = () => {
    if (!session || !currentPrompt || session.status !== 'running') return;
    const now = Date.now();
    const result: 'correct' | 'incorrect' | 'submitted' = currentPrompt.kind === 'mcq'
      ? currentPrompt.selectedOptionId === currentPrompt.correctOptionId ? 'correct' : 'incorrect'
      : 'submitted';
    const answeredSession = {
      ...session,
      prompts: session.prompts.map((prompt, index) => index === session.activeIndex
        ? { ...prompt, answered: true, skipped: false, answerResult: result === 'submitted' ? undefined : result }
        : prompt),
    };
    setSession(pauseMobileInterviewSession(answeredSession, now));
    setFeedback({ promptId: currentPrompt.id, result, reveal: false, answerViewed: false });
  };

  const advanceAfterFeedback = useCallback((promptId: string) => {
    setFeedback((current) => current?.promptId === promptId ? null : current);
    setSession((current) => {
      if (!current || current.status !== 'paused' || current.prompts[current.activeIndex].id !== promptId) return current;
      const next = moveMobileInterviewToPrompt(current, current.activeIndex + 1);
      return next.status === 'paused' ? resumeMobileInterviewSession(next) : next;
    });
  }, []);

  const continueAfterFeedback = () => {
    if (feedback) advanceAfterFeedback(feedback.promptId);
  };

  useEffect(() => {
    if (!feedback || feedback.answerViewed) return undefined;
    const timeout = window.setTimeout(() => advanceAfterFeedback(feedback.promptId), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback?.promptId, feedback?.answerViewed, advanceAfterFeedback]);

  const moveTo = (index: number) => {
    if (!session) return;
    setSession(moveMobileInterviewToPrompt(session, index));
  };

  const pauseSession = () => {
    setSession((current) => current && pauseMobileInterviewSession(current));
  };

  const resumeSession = () => {
    setSession((current) => current && resumeMobileInterviewSession(current));
  };

  const exitSession = () => {
    if (session?.status === 'running' && !window.confirm('Pause this interview and return to the Mobile Interview landing page?')) return;
    if (session?.status === 'running') {
      const paused = pauseMobileInterviewSession(session);
      try {
        saveMobileInterviewSession(localStorage, paused);
      } catch {
        setStorageError('This browser could not save the paused interview. Keep this tab open or resume before leaving.');
        return;
      }
      setSession(paused);
    }
    setFeedback(null);
    setScreen('home');
  };

  const abortSession = () => {
    if (!session || !window.confirm('Abort this interview? Your current answers and this attempt will be discarded, and it will not appear in History.')) return;
    setSession(null);
    setFeedback(null);
    setImportantOnly(false);
    setScreen('home');
  };

  const discardSession = () => {
    if (!window.confirm('Start a new round? This completed attempt will remain in History.')) return;
    setSession(null);
    setFeedback(null);
    setImportantOnly(false);
    setScreen('practice');
  };

  const finishSessionEarly = () => {
    if (!session || !window.confirm('End this interview now and open the recap?')) return;
    setSession(finishMobileInterviewSession(session));
    setScreen('recap');
  };

  const returnToHome = () => {
    if (session?.status === 'finished') setSession(null);
    setScreen('home');
  };

  const removeSchedule = (scheduleId: string) => {
    setSchedules((current) => current.filter((schedule) => schedule.id !== scheduleId));
  };

  const cancelQuestionLongPress = () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    longPressOrigin.current = null;
  };

  const copyQuestion = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice('Question copied');
    } catch {
      setCopyNotice('Could not copy. Check clipboard permissions and try again.');
    }
  };

  const startQuestionLongPress = (event: ReactPointerEvent<HTMLHeadingElement>, text: string) => {
    if (event.button !== 0) return;
    cancelQuestionLongPress();
    longPressOrigin.current = { x: event.clientX, y: event.clientY };
    longPressPointerType.current = event.pointerType;
    longPressHandled.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressHandled.current = true;
      longPressTimer.current = null;
      longPressOrigin.current = null;
      void copyQuestion(text);
    }, 550);
  };

  const moveQuestionLongPress = (event: ReactPointerEvent<HTMLHeadingElement>) => {
    if (!longPressOrigin.current) return;
    const distance = Math.hypot(
      event.clientX - longPressOrigin.current.x,
      event.clientY - longPressOrigin.current.y,
    );
    if (distance > 12) cancelQuestionLongPress();
  };

  const handleQuestionContextMenu = (event: ReactMouseEvent<HTMLHeadingElement>, text: string) => {
    if (longPressPointerType.current !== 'touch' && longPressPointerType.current !== 'pen') return;
    event.preventDefault();
    if (!longPressHandled.current) {
      longPressHandled.current = true;
      cancelQuestionLongPress();
      void copyQuestion(text);
    }
  };

  const allHistory = progressSessions;
  const toggleCategory = (categoryId: string, checked: boolean) => {
    const nextCategoryIds = checked
      ? [...new Set([...selectedSetIds, categoryId])]
      : selectedSetIds.filter((id) => id !== categoryId);
    setSelectedSetIds(nextCategoryIds);
    setSelectedSectionIds(questionSets
      .filter((set) => nextCategoryIds.includes(set.id))
      .flatMap((set) => set.sections.map((section) => section.id)));
  };

  const selectAllCategories = () => {
    setSelectedSetIds(questionSets.map((set) => set.id));
    setSelectedSectionIds(questionSets.flatMap((set) => set.sections.map((section) => section.id)));
  };

  const unselectAllCategories = () => {
    setSelectedSetIds([]);
    setSelectedSectionIds([]);
  };

  const renderCategorySelectionToolbar = () => (
    <div className="mobile-interview-selection-toolbar">
      <div className="mobile-interview-selection-summary">
        <strong>Categories</strong>
        <span>{selectedSetIds.length} of {questionSets.length} selected</span>
      </div>
      <div className="mobile-interview-selection-actions" role="group" aria-label="Category selection">
        <button type="button" className="secondary-button" onClick={selectAllCategories}>Select all</button>
        <button type="button" className="secondary-button" onClick={unselectAllCategories}>Clear</button>
      </div>
    </div>
  );

  const renderSectionSelectionToolbar = () => (
    <div className="mobile-interview-selection-toolbar">
      <div className="mobile-interview-selection-actions" role="group" aria-label="Section selection">
        <button type="button" className="secondary-button" onClick={() => setSelectedSectionIds(availableSections.map((section) => section.id))}>Select all</button>
        <button type="button" className="secondary-button" onClick={() => setSelectedSectionIds([])}>Clear</button>
      </div>
    </div>
  );

  const renderQuestionTimeSelector = () => (
    <div className="mobile-interview-schedule-field">
      <span id="mobile-interview-time-label">Time per question</span>
      <div className="mobile-interview-time-control" role="group" aria-labelledby="mobile-interview-time-label">
        <button
          type="button"
          className="mobile-interview-time-step"
          aria-label="Decrease time by 10 seconds"
          disabled={questionTimeLimitSeconds <= MIN_QUESTION_TIME_SECONDS}
          onClick={() => setQuestionTimeLimitSeconds((seconds) => Math.max(MIN_QUESTION_TIME_SECONDS, seconds - QUESTION_TIME_STEP_SECONDS))}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
        </button>
        <output className="mobile-interview-time-value" aria-live="polite">
          {formatQuestionTime(questionTimeLimitSeconds)}
        </output>
        <button
          type="button"
          className="mobile-interview-time-step"
          aria-label="Increase time by 10 seconds"
          disabled={questionTimeLimitSeconds >= MAX_QUESTION_TIME_SECONDS}
          onClick={() => setQuestionTimeLimitSeconds((seconds) => Math.min(MAX_QUESTION_TIME_SECONDS, seconds + QUESTION_TIME_STEP_SECONDS))}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const selectedSchedules = schedules.filter((schedule) => schedule.date === selectedDate);
    const sessionScheduleIds = new Set(progressSessions.flatMap((entry) => entry.scheduleId ? [entry.scheduleId] : []));
    const sessionCountsByDate = new Map<string, number>();
    progressSessions.forEach((entry) => {
      const dateKey = getLocalDateString(new Date(entry.startedAt));
      sessionCountsByDate.set(dateKey, (sessionCountsByDate.get(dateKey) ?? 0) + 1);
    });

    return (
      <>
        <div className="mobile-interview-calendar-card">
          <div className="mobile-interview-calendar-heading">
            <button type="button" className="secondary-button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
            <h3>{monthLabel}</h3>
            <button type="button" className="secondary-button" aria-label="Next month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="mobile-interview-calendar-grid" role="grid" aria-label={monthLabel}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day} className="weekday">{day}</span>)}
            {calendarDays.map((date) => {
              const dateKey = getLocalDateString(date);
              const unstartedSchedules = schedules.filter((schedule) => schedule.date === dateKey && !sessionScheduleIds.has(schedule.id));
              const count = (sessionCountsByDate.get(dateKey) ?? 0) + unstartedSchedules.length;
              const classes = [
                'mobile-interview-calendar-day',
                date.getMonth() !== calendarMonth.getMonth() ? 'outside-month' : '',
                dateKey === selectedDate ? 'selected' : '',
                dateKey === getLocalDateString(new Date()) ? 'today' : '',
              ].filter(Boolean).join(' ');
              return <button key={dateKey} type="button" className={classes} aria-pressed={dateKey === selectedDate} aria-label={`${date.toLocaleDateString()}${count ? `, ${count} interviews` : ''}`} onClick={() => {
                setSelectedDate(dateKey);
                if (date.getMonth() !== calendarMonth.getMonth() || date.getFullYear() !== calendarMonth.getFullYear()) {
                  setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }
              }}>
                <span>{date.getDate()}</span>{count > 0 && <i aria-hidden="true">{count}</i>}
              </button>;
            })}
          </div>
        </div>
        {selectedSchedules.length > 0 && (
          <section className="mobile-interview-selected-date">
            <ul className="mobile-interview-schedule-list">{selectedSchedules.map((schedule) => (
              <li key={schedule.id}>
                <div><strong>{schedule.title}</strong><span>{schedule.setIds.map((id) => questionSets.find((set) => set.id === id)?.title).filter(Boolean).join(' · ') || 'Categories from an earlier question bank'}</span>
                  <small>{schedule.status === 'completed' ? 'Completed' : 'Planned'}</small></div>
                <div className="mobile-interview-schedule-actions"><button type="button" className="primary-button" onClick={() => beginSession(schedule)}>{schedule.status === 'completed' ? 'Start again' : 'Start interview'}</button>
                  <button type="button" className="mobile-interview-text-button" onClick={() => removeSchedule(schedule.id)}>Remove</button></div>
              </li>
            ))}</ul>
          </section>
        )}
      </>
    );
  };

  if (screen === 'home') {
    return (
      <section className="mobile-interview mobile-interview-landing">
        {session && session.status !== 'finished' && (
          <section className="mobile-interview-resume-card">
            <div><span className="mobile-interview-kicker">{session.status === 'paused' ? 'Interview paused' : 'Interview in progress'}</span><h3>{session.title ?? `${trackLabel(session.track)} interview`}</h3>
              <p>Section {getSessionSections(session).indexOf(session.prompts[session.activeIndex].sectionId) + 1} of {getSessionSections(session).length} · Question {session.activeIndex + 1} of {session.prompts.length}</p>
            </div>
            <div className="mobile-interview-resume-actions">
              <button type="button" className="primary-button" onClick={() => {
                if (session.status === 'paused') setSession(resumeMobileInterviewSession(session));
                setScreen('session');
              }}>Continue last interview</button>
              <button type="button" className="mobile-interview-abort" onClick={abortSession}>Abort interview</button>
            </div>
          </section>
        )}
        <div className="mobile-interview-home-actions">
          <button type="button" className="mobile-interview-home-action" onClick={() => setScreen('practice')}>
            <span className="mobile-interview-home-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span><strong>New interview</strong>
          </button>
          <button type="button" className="mobile-interview-home-action" onClick={() => setScreen('sets')}>
            <span className="mobile-interview-home-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg></span><strong>Categories</strong>
          </button>
          <button type="button" className="mobile-interview-home-action" onClick={() => setScreen('history')}>
            <span className="mobile-interview-home-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5m4-1v5l3 2" /></svg></span><strong>History <small>{history.length}</small></strong>
          </button>
        </div>
        <section className="mobile-interview-home-calendar">
          <header><h2>Calendar</h2><span aria-live="polite">{formatScheduleDate(selectedDate)}</span></header>
          {renderCalendar()}
        </section>
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      </section>
    );
  }

  if (screen === 'sets') {
    return (
      <section className="mobile-interview mobile-interview-library">
        <header className="mobile-interview-top mobile-interview-page-heading">
          <button className="mobile-interview-back" type="button" onClick={() => setScreen('home')} aria-label="Back to interviews">‹</button>
          <div><h2>Categories</h2></div>
        </header>
        <div className="mobile-interview-library-list">{questionSets.map((set) => (
          <article key={set.id}>
            <header><div><h3>{set.title}</h3><span>{set.sections.reduce((total, section) => total + section.questionCount, 0)} questions</span></div>
              <button type="button" className="secondary-button" onClick={() => {
                setSelectedSetIds([set.id]);
                setSelectedSectionIds(set.sections.map((section) => section.id));
                setScreen('practice');
              }}>Select</button></header>
            <ul>{set.sections.map((section) => <li key={section.id}><span>{section.title}</span><strong>{section.questionCount}</strong></li>)}</ul>
          </article>
        ))}</div>
      </section>
    );
  }

  if (screen === 'history') {
    return (
      <section className="mobile-interview mobile-interview-history-page">
        <header className="mobile-interview-top mobile-interview-page-heading">
          <button className="mobile-interview-back" type="button" onClick={() => setScreen('home')} aria-label="Back to interviews">‹</button>
          <div><h2>History</h2></div>
        </header>
        <div className="mobile-interview-stats">
          <div><strong>{history.length}</strong><span>completed interviews</span></div>
          <div><strong>{completedQuestionCount}</strong><span>answered questions</span></div>
          <div><strong>{revealedAnswerCount}</strong><span>references viewed</span></div>
          <div><strong>{skippedQuestionCount}</strong><span>questions skipped</span></div>
        </div>
        {history.length === 0
          ? <p className="mobile-interview-empty">Completed interviews will appear here.</p>
          : <ol className="mobile-interview-history-list">{history.map((entry) => {
            const answered = entry.prompts.filter((prompt) => prompt.answered).length;
            const skipped = entry.prompts.filter((prompt) => prompt.skipped).length;
            return <li key={entry.id}><details>
              <summary><span><strong>{entry.title ?? `${trackLabel(entry.track)} interview`}</strong><small>{entry.finishedAt ? new Date(entry.finishedAt).toLocaleString() : new Date(entry.startedAt).toLocaleString()} · {entry.prompts.length} questions</small></span><b>{answered} answered · {skipped} skipped</b></summary>
              <ol>{entry.prompts.map((prompt) => <li key={prompt.id}><strong>{prompt.text.split('\n')[0]}</strong>
                <span>{prompt.answerResult === 'correct' ? 'Correct' : prompt.answerResult === 'incorrect' ? 'Review' : prompt.timeExpired ? 'Timed out' : prompt.skipped ? 'Skipped' : prompt.answered ? 'Submitted' : 'Not answered'}</span>
                {(prompt.answerText || prompt.note) && <p>Your answer: {prompt.answerText || prompt.note}</p>}</li>)}</ol>
            </details></li>;
          })}</ol>}
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      </section>
    );
  }

  const renderHistoryDialog = () => showHistory ? (
    <div className="mobile-interview-history-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setShowHistory(false);
    }}>
      <section className="mobile-interview-history-dialog" role="dialog" aria-modal="true" aria-labelledby="mobile-history-title">
        <header><div><h2 id="mobile-history-title">History</h2></div>
          <button type="button" className="mobile-interview-back" aria-label="Close history" onClick={() => setShowHistory(false)}>×</button>
        </header>
        <div className="mobile-interview-stats">
          <div><strong>{allHistory.length}</strong><span>interviews</span></div>
          <div><strong>{completedQuestionCount}</strong><span>answered</span></div>
          <div><strong>{revealedAnswerCount}</strong><span>references viewed</span></div>
          <div><strong>{skippedQuestionCount}</strong><span>questions skipped</span></div>
        </div>
        {allHistory.length === 0
          ? <p className="mobile-interview-empty">Completed interviews will appear here.</p>
          : <ol className="mobile-interview-history-list">{allHistory.map((entry) => {
            const answered = entry.prompts.filter((prompt) => prompt.answered).length;
            const skipped = entry.prompts.filter((prompt) => prompt.skipped).length;
            return (
              <li key={entry.id}>
                <details>
                  <summary><span><strong>{entry.title ?? `${trackLabel(entry.track)} interview`}</strong><small>{entry.status !== 'finished' ? 'In progress · ' : ''}{entry.finishedAt ? new Date(entry.finishedAt).toLocaleString() : new Date(entry.startedAt).toLocaleString()} · {entry.prompts.length} questions</small></span><b>{answered} answered · {skipped} skipped</b></summary>
                  <ol>{entry.prompts.map((prompt) => (
                    <li key={prompt.id}>
                      <strong>{prompt.text.split('\n')[0]}</strong>
                      <span>{prompt.answerResult === 'correct' ? 'Correct' : prompt.answerResult === 'incorrect' ? 'Review' : prompt.timeExpired ? 'Timed out' : prompt.skipped ? 'Skipped' : prompt.answered ? 'Submitted' : 'Not answered'}</span>
                      {(prompt.answerText || prompt.note) && <p>Your answer: {prompt.answerText || prompt.note}</p>}
                    </li>
                  ))}</ol>
                </details>
              </li>
            );
          })}</ol>}
        <button type="button" className="primary-button mobile-interview-primary" onClick={() => setShowHistory(false)}>Close</button>
      </section>
    </div>
  ) : null;

  if (session?.status === 'finished' && screen === 'recap') {
    const prompts = importantOnly ? session.prompts.filter((prompt) => prompt.important) : session.prompts;
    return (
      <section className="mobile-interview mobile-interview-recap">
        <header className="mobile-interview-top">
          <button className="mobile-interview-back" type="button" onClick={returnToHome} aria-label="Return to Mobile Interview home">‹</button>
          <div><span className="mobile-interview-kicker">Interview complete</span><h2>{session.title ?? `${trackLabel(session.track)} interview`}</h2></div>
          <button className="mobile-interview-text-button" type="button" onClick={() => setShowHistory(true)}>History</button>
        </header>
        <section className="mobile-interview-recap-card">
          <p className="mobile-interview-kicker">{session.finishedAt ? new Date(session.finishedAt).toLocaleString() : 'Completed'}</p>
          <h3>Interview recap</h3>
          <div className="mobile-interview-stats">
            <div><strong>{getSessionSections(session).length}</strong><span>sections</span></div>
            <div><strong>{answeredCount}</strong><span>answered</span></div>
            <div><strong>{skippedCount}</strong><span>skipped</span></div>
            <div><strong>{revealedCount}</strong><span>references</span></div>
          </div>
          <p>{session.prompts.length} questions · {importantCount} marked important</p>
        </section>
        <div className="mobile-interview-recap-heading">
          <div><span className="mobile-interview-kicker">Review</span><h3>{importantOnly ? 'Important questions' : 'Interview questions'}</h3></div>
          {importantCount > 0 && (
            <button type="button" className="mobile-interview-text-button" onClick={() => setImportantOnly((value) => !value)}>
              {importantOnly ? 'Show all' : 'Important only'}
            </button>
          )}
        </div>
        <ol className="mobile-interview-recap-list">
          {prompts.map((prompt) => (
            <li key={prompt.id} className="mobile-interview-recap-item">
              <div className="mobile-interview-recap-item-head">
                <span>{prompt.sectionTitle}</span>
                <strong>{prompt.important ? '★ Important' : prompt.skipped ? 'Skipped' : prompt.answered ? 'Answered' : 'Unanswered'}</strong>
              </div>
              <p>{prompt.text}</p>
              {prompt.answerResult && <strong>{prompt.answerResult === 'correct' ? 'Correct' : 'Incorrect'}</strong>}
              {!prompt.answerResult && prompt.answered && <strong>Submitted</strong>}
              {(prompt.answerText || prompt.note) && <blockquote>{prompt.answerText || prompt.note}</blockquote>}
              {prompt.referenceRevealed && <small>Reference answer viewed.</small>}
            </li>
          ))}
          {prompts.length === 0 && <li className="mobile-interview-empty">No questions were marked important.</li>}
        </ol>
        <div className="mobile-interview-recap-actions">
          <button className="primary-button mobile-interview-primary" type="button" onClick={discardSession}>Start another interview</button>
          <button className="secondary-button" type="button" onClick={returnToHome}>Mobile Interview home</button>
        </div>
        {renderHistoryDialog()}
      </section>
    );
  }

  if (session && currentPrompt && screen === 'session') {
    const sectionIds = getSessionSections(session);
    const currentSectionIndex = sectionIds.indexOf(currentPrompt.sectionId);
    return (
      <section className="mobile-interview mobile-interview-active">
        <header className="mobile-interview-top">
          <button className="mobile-interview-back" type="button" onClick={exitSession} aria-label="Pause and return to Mobile Interview home">‹</button>
          <div><span className="mobile-interview-kicker">{session.title ?? `${trackLabel(session.track)} interview`}</span><h2>{currentPrompt.sectionTitle}</h2></div>
          <button className="mobile-interview-icon-button" type="button" onClick={() => updatePrompt(currentPrompt.id, { important: !currentPrompt.important })} aria-pressed={currentPrompt.important} aria-label={currentPrompt.important ? 'Remove important mark' : 'Mark important'}>
            {currentPrompt.important ? '★' : '☆'}
          </button>
        </header>
        <div className="mobile-interview-section-progress">
          <strong>Section {currentSectionIndex + 1} of {sectionIds.length}</strong>
          <span>{currentPrompt.sectionTitle}</span>
          <small>Question {session.activeIndex + 1} of {session.prompts.length}</small>
        </div>
        <div
          className="mobile-interview-round-progress"
          role="progressbar"
          aria-label="Interview round progress"
          aria-valuenow={session.activeIndex + 1}
          aria-valuemin={0}
          aria-valuemax={session.prompts.length}
          aria-valuetext={`Question ${session.activeIndex + 1} of ${session.prompts.length}`}
        >
          {session.prompts.map((prompt, index) => (
            <span
              key={prompt.id}
              className={index < session.activeIndex ? 'is-complete' : index === session.activeIndex ? 'is-current' : ''}
            />
          ))}
        </div>
        {!session.untimed && (() => {
          const remainingSeconds = getMobileInterviewRemainingSeconds(session, clockNow);
          const timePercent = Math.max(0, Math.min(100, remainingSeconds / session.questionDurationSeconds * 100));
          return (
            <div className={`mobile-interview-question-timer${remainingSeconds <= 10 ? ' is-low' : ''}`} aria-label="Time remaining">
              <div><strong>{formatTimer(remainingSeconds)}</strong></div>
              <div className="mobile-interview-question-timer-track" role="progressbar" aria-label="Question time remaining" aria-valuenow={remainingSeconds} aria-valuemin={0} aria-valuemax={session.questionDurationSeconds}>
                <span style={{ width: `${timePercent}%` }} />
              </div>
            </div>
          );
        })()}
        {session.status === 'paused' && (
          <div className="mobile-interview-paused" role="status">
            <strong>{feedback ? 'Answer saved' : 'Paused'}</strong>
            <button className="primary-button" type="button" onClick={resumeSession}>Resume interview</button>
          </div>
        )}
        <article className="mobile-interview-prompt">
          {currentPrompt.priority === 'high' && <div className="mobile-interview-prompt-meta"><strong>High priority</strong></div>}
          <h3
            onPointerDown={(event) => startQuestionLongPress(event, currentPrompt.text)}
            onPointerUp={cancelQuestionLongPress}
            onPointerCancel={cancelQuestionLongPress}
            onPointerLeave={cancelQuestionLongPress}
            onPointerMove={moveQuestionLongPress}
            onContextMenu={(event) => handleQuestionContextMenu(event, currentPrompt.text)}
          >
            {currentPrompt.text.split('\n').map((line, index) => <span key={index}>{line}{index < currentPrompt.text.split('\n').length - 1 && <br />}</span>)}
          </h3>
          <span className="mobile-interview-sr-only" aria-live="polite">
            {copyNotice}
          </span>
          {currentPrompt.starterCode && <pre className="mobile-interview-code"><code>{currentPrompt.starterCode}</code></pre>}
          {currentPrompt.kind === 'mcq' && (
            <fieldset className="mobile-interview-options" disabled={session.status === 'paused'}>
              <legend>Choose one answer</legend>
              {currentPrompt.options?.map((option) => (
                <label key={option.id} className={currentPrompt.selectedOptionId === option.id ? 'selected' : ''}>
                  <input type="radio" name={`answer-${currentPrompt.id}`} value={option.id} checked={currentPrompt.selectedOptionId === option.id} onChange={() => updatePrompt(currentPrompt.id, { selectedOptionId: option.id })} />
                  <span>{option.text}</span>
                </label>
              ))}
            </fieldset>
          )}
          <label className="mobile-interview-note">
            <span className="mobile-interview-sr-only">{currentPrompt.kind === 'coding' ? 'Your code answer' : 'Your answer'}</span>
            <textarea
              rows={5}
              value={currentPrompt.answerText ?? currentPrompt.note}
              onChange={(event) => updatePrompt(currentPrompt.id, { answerText: event.target.value })}
              placeholder={currentPrompt.kind === 'coding' ? 'Write your solution…' : 'Answer in your own words (or aloud)…'}
              disabled={session.status === 'paused'}
            />
          </label>
          <div className="mobile-interview-prompt-tools">
            <button
              className="primary-button mobile-interview-submit"
              type="button"
              disabled={session.status === 'paused' || (currentPrompt.kind === 'mcq' && !currentPrompt.selectedOptionId)}
              onClick={submitAnswer}
            >
              Submit
            </button>
          </div>
        </article>
        <footer className="mobile-interview-controls">
          <div className="mobile-interview-control-row" role="group" aria-label="Interview controls">
            <button className="secondary-button" type="button" aria-label="Previous question" title="Previous question" disabled={session.activeIndex === 0 || session.status === 'paused'} onClick={() => moveTo(session.activeIndex - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
            </button>
            <button className="secondary-button" type="button" aria-label={session.status === 'running' ? 'Pause interview' : 'Resume interview'} title={session.status === 'running' ? 'Pause interview' : 'Resume interview'} onClick={session.status === 'running' ? pauseSession : resumeSession}>
              {session.status === 'running'
                ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>
                : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7z" /></svg>}
            </button>
            <button className="secondary-button" type="button" aria-label={session.activeIndex === session.prompts.length - 1 ? 'Finish interview' : 'Next question'} title={session.activeIndex === session.prompts.length - 1 ? 'Finish interview' : 'Next question'} disabled={session.status === 'paused' || !currentPrompt.answered} onClick={() => moveTo(session.activeIndex + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
            </button>
            <button className="mobile-interview-end-icon" type="button" aria-label="End interview and view recap" title="End interview and view recap" onClick={finishSessionEarly}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
          </div>
        </footer>
        {feedback && (
          <div className={`mobile-interview-feedback-overlay ${feedback.result}`} role="dialog" aria-modal="true" aria-labelledby="mobile-feedback-title">
            <section className="mobile-interview-feedback-card">
              <span className="mobile-interview-feedback-icon" aria-hidden="true">{feedback.result === 'correct' ? '✓' : feedback.result === 'incorrect' ? '↻' : '✓'}</span>
              <p className="mobile-interview-kicker">{feedback.result === 'submitted' ? 'Response saved' : 'Answer checked'}</p>
              <h2 id="mobile-feedback-title">{feedback.result === 'correct' ? 'Correct!' : feedback.result === 'incorrect' ? 'Keep practicing' : 'Answer submitted'}</h2>
              {currentPrompt.explanation && <p>{currentPrompt.explanation}</p>}
              {feedback.reveal && (
                <div className="mobile-interview-feedback-source">
                  <section className="mobile-interview-feedback-question">
                    <h3>Question</h3>
                    <p>{sourceQuestion?.prompt ?? currentPrompt.text}</p>
                  </section>
                  <section className="mobile-interview-feedback-reference">
                    <h3>Answer</h3>
                    {sourceQuestion
                      ? <QuestionAnswer question={sourceQuestion} />
                      : <pre className="mobile-interview-feedback-answer">{getReferenceAnswer(currentPrompt)}</pre>}
                  </section>
                </div>
              )}
              <button className="secondary-button" type="button" onClick={() => {
                if (!feedback.reveal) updatePrompt(feedback.promptId, { referenceRevealed: true });
                setFeedback((current) => current && ({ ...current, reveal: !current.reveal, answerViewed: true }));
              }}>
                {feedback.reveal ? 'Hide answer' : 'View answer'}
              </button>
              <button className="primary-button mobile-interview-primary" type="button" onClick={continueAfterFeedback}>
                {session.activeIndex === session.prompts.length - 1 ? 'Finish interview' : 'Next question'}
              </button>
            </section>
          </div>
        )}
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
        {renderHistoryDialog()}
      </section>
    );
  }

  return (
    <section className="mobile-interview mobile-interview-setup">
      <header className="mobile-interview-top mobile-interview-page-heading">
        <button className="mobile-interview-back" type="button" onClick={() => setScreen('home')} aria-label="Return to Mobile Interview home">‹</button>
        <div><span className="mobile-interview-kicker">Interview</span><h2>New interview</h2></div>
      </header>
      <div className="mobile-interview-setup-card">
        {renderCategorySelectionToolbar()}
        {[...new Set(questionSets.map((set) => set.source))].map((source) => (
          <details className="mobile-interview-set-group" key={source} open>
            <summary>Question bank<span>{questionSets.filter((set) => set.source === source && selectedSetIds.includes(set.id)).length} selected</span></summary>
            <div>{questionSets.filter((set) => set.source === source).map((set) => (
              <label key={set.id} className="mobile-interview-set-option">
                <input type="checkbox" checked={selectedSetIds.includes(set.id)} onChange={(event) => toggleCategory(set.id, event.target.checked)} />
                <span>{set.title}</span><small>{set.sections.reduce((total, section) => total + section.questionCount, 0)}</small>
              </label>
            ))}</div>
          </details>
        ))}
        <details className="mobile-interview-set-group mobile-interview-section-selector">
          <summary>Sections <span>{selectedSectionIds.length} selected</span></summary>
          {renderSectionSelectionToolbar()}
          {availableSections.map((section) => (
            <label key={section.id} className="mobile-interview-set-option">
              <input type="checkbox" checked={selectedSectionIds.includes(section.id)} onChange={(event) => setSelectedSectionIds((current) => event.target.checked
                ? [...new Set([...current, section.id])]
                : current.filter((id) => id !== section.id))} />
              <span>{section.title}</span><small>{section.questionCount}</small>
            </label>
          ))}
        </details>
        <div className="mobile-interview-available"><strong>{availablePrompts.length}</strong><span>{availablePrompts.length === 1 ? 'question available' : 'questions available'}</span></div>
        <label className="mobile-interview-random-toggle">
          <input type="checkbox" checked={randomizeQuestionOrder} onChange={(event) => setRandomizeQuestionOrder(event.target.checked)} />
          <span><strong>Randomize questions</strong></span>
        </label>
        {renderQuestionTimeSelector()}
        <button className="primary-button mobile-interview-primary" type="button" onClick={() => beginSession()} disabled={availablePrompts.length === 0}>Start interview</button>
        {availablePrompts.length === 0 && <p className="mobile-interview-empty">Choose a category to start.</p>}
      </div>
      {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      {renderHistoryDialog()}
    </section>
  );
}

function trackLabel(track: MobileInterviewTrack): string {
  return track === 'kotlin' ? 'Kotlin' : track === 'spring-boot' ? 'Spring Boot' : 'Mixed';
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatQuestionTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

function getSectionOrientedPrompts(
  questions: MobileBankQuestion[],
  sets: ReturnType<typeof getMobileQuestionSets>,
  selectedSetIds: string[],
  selectedSectionIds: string[],
): MobileInterviewPrompt[] {
  const selectedSections = new Set(selectedSectionIds);
  return sets
    .filter((set) => selectedSetIds.includes(set.id))
    .flatMap((set) => set.sections
      .filter((section) => selectedSections.has(section.id))
      .flatMap((section) => questions
        .filter((question) => question.setId === set.id && question.sectionId === section.id)
        .map(toMobilePrompt)));
}

function getSessionSections(session: MobileInterviewSession): string[] {
  return [...new Set(session.prompts.map((prompt) => prompt.sectionId))];
}

function shufflePrompts(prompts: MobileInterviewPrompt[]): MobileInterviewPrompt[] {
  const shuffled = [...prompts];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function toMobilePrompt(question: MobileBankQuestion): MobileInterviewPrompt {
  return {
    id: question.id,
    checklistId: question.setId,
    checklistTitle: question.setTitle,
    sectionId: question.sectionId,
    sectionTitle: question.sectionTitle,
    text: question.text,
    referenceItems: [],
    answered: false,
    skipped: false,
    important: false,
    referenceRevealed: false,
    note: '',
    referenceAnswer: question.answer,
  };
}

function inferTrack(title = ''): MobileInterviewTrack {
  if (/kotlin|android/i.test(title)) return 'kotlin';
  return 'mixed';
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMobileSectionTitle(question: (typeof interviewQuestions)[number]): string {
  const [sourceCategory, ...sourceSections] = (question.section || question.category).split(' / ');
  return /^Set\s+\d+\s*:/i.test(sourceCategory)
    ? [sourceCategory, ...sourceSections].join(' / ')
    : sourceSections.join(' / ') || 'General';
}

function getCalendarDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function formatScheduleDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderPrompt(item: Pick<MobileInterviewPrompt, 'text' | 'codeTerms'>) {
  if (!item.codeTerms?.length) return item.text;
  const escapedTerms = [...item.codeTerms].sort((first, second) => second.length - first.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = item.text.split(new RegExp(`(${escapedTerms.join('|')})`, 'g'));
  return parts.map((part, index) => item.codeTerms?.includes(part) ? <code key={`${part}-${index}`}>{part}</code> : part);
}

function getReferenceAnswer(prompt: MobileInterviewPrompt): string {
  if (prompt.referenceAnswer) return prompt.referenceAnswer;
  if (prompt.referenceItems.length > 0) return prompt.referenceItems.map((item) => `• ${item.text}`).join('\n');
  return 'No reference answer is available for this question.';
}
