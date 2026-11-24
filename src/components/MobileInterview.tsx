import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import QuestionAnswer from './QuestionAnswer';
import CodingInterviewExperience, { CodingInterviewErrorBoundary } from './CodingInterviewExperience';
import { interviewQuestions } from '../data/interview-question-bank';
import { getMobileCodingQuestionBank, getMobileQuestionBank, getMobileQuestionSets, type MobileBankQuestion } from '../data/mobile-interview-bank';
import { formatAppDate, formatAppDateKey, formatAppDateTime, formatAppFileDateTime } from '../utils/date-format';
import {
  createMobileInterviewSession,
  clearMobileInterviewQuestionStats,
  expireMobileInterviewPrompt,
  finishMobileInterviewSession,
  formatMobileInterviewQaText,
  getMobileInterviewRemainingSeconds,
  isProgramInterviewPrompt,
  loadMobileInterviewHistory,
  loadMobileInterviewQuestionStats,
  loadMobileInterviewSchedules,
  loadMobileInterviewSession,
  moveMobileInterviewToPrompt,
  pauseMobileInterviewSession,
  resumeMobileInterviewSession,
  retryCodingInterviewPromptWithExtraTime,
  recordMobileInterviewQuestionAnswerResult,
  recordMobileInterviewQuestionAttendance,
  recordMobileInterviewQuestionSkipped,
  saveMobileInterviewHistory,
  saveMobileInterviewSchedules,
  saveMobileInterviewSession,
  type MobileInterviewSchedule,
  type MobileInterviewPrompt,
  type MobileInterviewQuestionStats,
  type MobileInterviewSession,
  type MobileInterviewTrack,
} from '../engine/mobile-interview';

type MobileInterviewScreen = 'home' | 'practice' | 'sets' | 'history' | 'session' | 'recap';

const QUESTION_TIME_OPTIONS = [30, ...Array.from({ length: 30 }, (_, index) => (index + 1) * 60)];

export default function MobileInterview() {
  const [session, setSession] = useState<MobileInterviewSession | null>(() => loadMobileInterviewSession(localStorage));
  const [screen, setScreen] = useState<MobileInterviewScreen>('home');
  const [importantOnly, setImportantOnly] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [questionBank] = useState(() => [...getMobileQuestionBank(), ...getMobileCodingQuestionBank()]);
  const [questionSets] = useState(() => getMobileQuestionSets(questionBank));
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [randomizeQuestionOrder, setRandomizeQuestionOrder] = useState(false);
  const [history, setHistory] = useState(() => loadMobileInterviewHistory(localStorage));
  const [questionStats, setQuestionStats] = useState<Record<string, MobileInterviewQuestionStats>>(
    () => loadMobileInterviewQuestionStats(localStorage),
  );
  const [schedules, setSchedules] = useState(() => loadMobileInterviewSchedules(localStorage));
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [questionTimeLimitSeconds, setQuestionTimeLimitSeconds] = useState(120);
  const [programQuestionTimeLimitSeconds, setProgramQuestionTimeLimitSeconds] = useState(900);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [showHistory, setShowHistory] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const [codingKeyboardOpen, setCodingKeyboardOpen] = useState(false);
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
  const hasProgramQuestions = availablePrompts.some(isProgramInterviewPrompt);
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  useEffect(() => {
    setSession((current) => {
      if (!current) return current;
      let changed = false;
      const prompts = current.prompts.map((prompt) => {
        const codingQuestion = questionBank.find((question) => question.id === prompt.id)?.codingQuestion;
        if (!codingQuestion || prompt.kind === 'coding') return prompt;
        changed = true;
        const shouldResetTimer = !current.untimed && !prompt.answered && !prompt.skipped && !prompt.timeExpired;
        const duration = shouldResetTimer ? 300 : prompt.timeLimitSeconds;
        return {
          ...prompt,
          kind: 'coding' as const,
          codingLanguage: codingQuestion.language,
          sectionTitle: `${codingQuestion.language === 'kotlin' ? 'Kotlin' : 'Java'} Coding`,
          timeLimitSeconds: duration,
          remainingSeconds: shouldResetTimer ? duration : prompt.remainingSeconds,
        };
      });
      if (!changed) return current;
      const activePrompt = prompts[current.activeIndex];
      return {
        ...current,
        prompts,
        durationSeconds: current.untimed ? 0 : prompts.reduce((total, prompt) => total + prompt.timeLimitSeconds, 0),
        remainingSeconds: activePrompt.remainingSeconds,
        endsAt: current.status === 'running' && !current.untimed
          ? Date.now() + activePrompt.remainingSeconds * 1000
          : null,
      };
    });
  }, [questionBank]);

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
    if (screen === 'session' && session?.status === 'running' && !session.untimed) {
      setClockNow(Date.now());
    }
  }, [screen, session?.status, session?.endsAt, session?.activeIndex, session?.untimed]);

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
  const recordQuestionStat = useCallback((
    sessionId: string,
    promptId: string,
    record: typeof recordMobileInterviewQuestionAttendance,
    description: string,
  ) => {
    try {
      setQuestionStats(record(localStorage, sessionId, promptId));
      setStorageError('');
    } catch {
      setStorageError(`This browser could not save ${description}.`);
    }
  }, []);

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

  const clearQuestionStats = () => {
    if (!window.confirm('Clear all question attendance, correct, wrong, and skipped statistics? This cannot be undone.')) return;
    try {
      clearMobileInterviewQuestionStats(localStorage);
      setQuestionStats({});
      setStorageError('');
    } catch {
      setStorageError('This browser could not clear question statistics.');
    }
  };

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
    const programTimeLimit = schedule?.programQuestionTimeLimitSeconds ?? programQuestionTimeLimitSeconds;
    setSession(createMobileInterviewSession(orderedPrompts, selectedSetsForSession.length > 1 ? 'mixed' : inferTrack(selectedSetsForSession[0]?.title), 0, Date.now(), {
      title,
      setIds,
      questionTimeLimitSeconds: timeLimit,
      programQuestionTimeLimitSeconds: programTimeLimit,
      ...(schedule ? { scheduleId: schedule.id } : {}),
    }));
    setImportantOnly(false);
    setFeedback(null);
    setScreen('session');
  };

  const updatePrompt = useCallback((promptId: string, update: Partial<MobileInterviewPrompt>) => {
    setSession((current) => current && ({
      ...current,
      prompts: current.prompts.map((prompt) => prompt.id === promptId ? { ...prompt, ...update } : prompt),
    }));
  }, []);

  const submitAnswer = () => {
    if (!session || !currentPrompt || session.status !== 'running') return;
    const now = Date.now();
    if (currentPrompt.kind === 'coding') {
      const remainingSeconds = session.untimed
        ? currentPrompt.remainingSeconds
        : getMobileInterviewRemainingSeconds(session, now);
      if (!session.untimed && remainingSeconds === 0) {
        setSession(expireMobileInterviewPrompt(session, now));
        setFeedback(null);
        return;
      }
      const code = currentPrompt.codingAnswers?.[currentPrompt.codingLanguage ?? 'kotlin'] ?? '';
      if (!code.trim()) {
        recordQuestionStat(session.id, currentPrompt.id, recordMobileInterviewQuestionSkipped, 'skipped-question statistics');
        setSession({
          ...session,
          status: 'paused',
          remainingSeconds,
          endsAt: null,
          prompts: session.prompts.map((prompt, index) => index === session.activeIndex
            ? {
                ...prompt,
                answered: false,
                skipped: true,
                remainingSeconds,
              }
            : prompt),
        });
        setFeedback(null);
        return;
      }
      recordQuestionStat(session.id, currentPrompt.id, recordMobileInterviewQuestionAttendance, 'question attendance statistics');
      setSession({
        ...session,
        status: 'paused',
        remainingSeconds,
        endsAt: null,
        prompts: session.prompts.map((prompt, index) => index === session.activeIndex
          ? {
              ...prompt,
              answered: true,
              skipped: false,
              remainingSeconds,
              timeExpired: prompt.timeExpired,
            }
          : prompt),
      });
      setFeedback(null);
      return;
    }
    const result: 'correct' | 'incorrect' | 'submitted' = currentPrompt.kind === 'mcq'
      ? currentPrompt.selectedOptionId === currentPrompt.correctOptionId ? 'correct' : 'incorrect'
      : 'submitted';
    recordQuestionStat(session.id, currentPrompt.id, recordMobileInterviewQuestionAttendance, 'question attendance statistics');
    if (result !== 'submitted') {
      recordQuestionStat(
        session.id,
        currentPrompt.id,
        (storage, sessionId, promptId) => recordMobileInterviewQuestionAnswerResult(storage, sessionId, promptId, result),
        'answer-result statistics',
      );
    }
    const answeredSession = {
      ...session,
      prompts: session.prompts.map((prompt, index) => index === session.activeIndex
        ? { ...prompt, answered: true, skipped: false, answerResult: result === 'submitted' ? undefined : result }
        : prompt),
    };
    setSession(pauseMobileInterviewSession(answeredSession, now));
    setFeedback({
      promptId: currentPrompt.id,
      result,
      reveal: false,
      answerViewed: false,
    });
  };

  const assessShortAnswer = (result: 'correct' | 'incorrect') => {
    if (!feedback || !session) return;
    updatePrompt(feedback.promptId, { answerResult: result });
    recordQuestionStat(
      session.id,
      feedback.promptId,
      (storage, sessionId, promptId) => recordMobileInterviewQuestionAnswerResult(storage, sessionId, promptId, result),
      'answer-result statistics',
    );
    setFeedback((current) => current?.promptId === feedback.promptId
      ? { ...current, result, reveal: true, answerViewed: true }
      : current);
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

  const hideCodingAnswer = () => {
    setFeedback(null);
  };

  const viewCodingAnswer = () => {
    if (!currentPrompt) return;
    setFeedback({
      promptId: currentPrompt.id,
      result: currentPrompt.answerResult ?? 'submitted',
      reveal: false,
      answerViewed: true,
    });
  };

  const tryCodingSolution = (code: string) => {
    if (!currentPrompt) return;
    const language = currentPrompt.codingLanguage ?? 'kotlin';
    updatePrompt(currentPrompt.id, {
      codingAnswers: { ...currentPrompt.codingAnswers, [language]: code },
      codingVerification: undefined,
      answerResult: undefined,
    });
    hideCodingAnswer();
  };

  const onCodingKeyboardVisibilityChange = useCallback((visible: boolean) => {
    setCodingKeyboardOpen(visible);
  }, []);

  const onCodingVerificationResult = useCallback((result: 'correct' | 'incorrect') => {
    if (!currentPrompt) return;
    if (session) {
      recordQuestionStat(session.id, currentPrompt.id, recordMobileInterviewQuestionAttendance, 'question attendance statistics');
      recordQuestionStat(
        session.id,
        currentPrompt.id,
        (storage, sessionId, promptId) => recordMobileInterviewQuestionAnswerResult(storage, sessionId, promptId, result),
        'answer-result statistics',
      );
    }
    updatePrompt(currentPrompt.id, { answered: true, answerResult: result });
  }, [currentPrompt, recordQuestionStat, session, updatePrompt]);

  const retryCodingPromptWithExtraTime = useCallback(() => {
    setFeedback(null);
    setSession((current) => current && retryCodingInterviewPromptWithExtraTime(current));
  }, []);

  useEffect(() => {
    if (!feedback || feedback.answerViewed || currentPrompt?.kind === 'coding') return undefined;
    const timeout = window.setTimeout(() => advanceAfterFeedback(feedback.promptId), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback?.promptId, feedback?.answerViewed, currentPrompt?.kind, advanceAfterFeedback]);

  const moveTo = (index: number) => {
    if (!session) return;
    let movingSession = session;
    if (index > session.activeIndex && currentPrompt && !currentPrompt.answered && !currentPrompt.skipped) {
      recordQuestionStat(session.id, currentPrompt.id, recordMobileInterviewQuestionSkipped, 'skipped-question statistics');
      movingSession = {
        ...session,
        prompts: session.prompts.map((prompt, promptIndex) => promptIndex === session.activeIndex
          ? { ...prompt, skipped: true }
          : prompt),
      };
    }
    setSession(moveMobileInterviewToPrompt(movingSession, index));
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

  const copyAllQa = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(formatMobileInterviewQaText(session));
      setCopyNotice('All Q&A copied');
    } catch {
      setCopyNotice('Could not copy all Q&A. Check clipboard permissions and try again.');
    }
  };

  const downloadAllQa = () => {
    if (!session) return;
    try {
      const blob = new Blob([formatMobileInterviewQaText(session)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const safeTitle = (session.title ?? trackLabel(session.track))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'interview';
      const completedAt = new Date(session.finishedAt ?? session.startedAt);
      anchor.href = url;
      anchor.download = `${safeTitle}-qa ${formatAppFileDateTime(completedAt)}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setCopyNotice('Q&A downloaded as a text file');
    } catch {
      setCopyNotice('Could not download Q&A. Please try again.');
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
    <>
      <TimeWheelPicker label="Time per question" value={questionTimeLimitSeconds} onChange={setQuestionTimeLimitSeconds} />
      {hasProgramQuestions && (
        <TimeWheelPicker label="Time per program question" value={programQuestionTimeLimitSeconds} onChange={setProgramQuestionTimeLimitSeconds} />
      )}
    </>
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
              return <button key={dateKey} type="button" className={classes} aria-pressed={dateKey === selectedDate} aria-label={`${formatAppDate(date)}${count ? `, ${count} interviews` : ''}`} onClick={() => {
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
                const activePrompt = session.prompts[session.activeIndex];
                if (activePrompt.kind === 'coding' && activePrompt.timeExpired) {
                  advanceAfterFeedback(activePrompt.id);
                } else if (session.status === 'paused') {
                  setSession(resumeMobileInterviewSession(session));
                }
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
              <summary><span><strong>{entry.title ?? `${trackLabel(entry.track)} interview`}</strong><small>{formatAppDateTime(new Date(entry.finishedAt ?? entry.startedAt))} · {entry.prompts.length} questions</small></span><b>{answered} answered · {skipped} skipped</b></summary>
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
                  <summary><span><strong>{entry.title ?? `${trackLabel(entry.track)} interview`}</strong><small>{entry.status !== 'finished' ? 'In progress · ' : ''}{formatAppDateTime(new Date(entry.finishedAt ?? entry.startedAt))} · {entry.prompts.length} questions</small></span><b>{answered} answered · {skipped} skipped</b></summary>
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
          <p className="mobile-interview-kicker">{session.finishedAt ? formatAppDateTime(new Date(session.finishedAt)) : 'Completed'}</p>
          <h3>Interview recap</h3>
          <div className="mobile-interview-stats">
            <div><strong>{getSessionSections(session).length}</strong><span>sections</span></div>
            <div><strong>{answeredCount}</strong><span>answered</span></div>
            <div><strong>{skippedCount}</strong><span>skipped</span></div>
            <div><strong>{revealedCount}</strong><span>references</span></div>
          </div>
          <p>{session.prompts.length} questions · {importantCount} marked important</p>
          <div className="mobile-interview-qa-actions">
            <button type="button" className="secondary-button" onClick={() => void copyAllQa()}>Copy all Q&amp;A</button>
            <button type="button" className="secondary-button" onClick={downloadAllQa}>Download .txt</button>
          </div>
          <p className="mobile-interview-qa-notice" role="status" aria-live="polite">{copyNotice}</p>
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
    const bankQuestion = questionBank.find((question) => question.id === currentPrompt.id);
    const codingActive = currentPrompt.kind === 'coding'
      && (currentPrompt.codingProblemId !== undefined || bankQuestion?.codingQuestion !== undefined);
    const codingPrompt = codingActive && bankQuestion?.codingQuestion
      ? {
          ...currentPrompt,
          kind: 'coding' as const,
          codingLanguage: currentPrompt.codingLanguage ?? bankQuestion.codingQuestion.language,
          sectionTitle: `${bankQuestion.codingQuestion.language === 'kotlin' ? 'Kotlin' : 'Java'} Coding`,
        }
      : currentPrompt;
    return (
      <section className={`mobile-interview mobile-interview-active${codingActive ? ' mobile-interview-coding-active' : ''}${codingActive && codingKeyboardOpen ? ' coding-keyboard-open' : ''}`}>
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
        <aside className="mobile-interview-question-stats" aria-label="Question statistics">
          <div>
            <span>Attended <strong>{questionStats[currentPrompt.id]?.attended ?? 0}</strong></span>
            <span>Correct <strong>{questionStats[currentPrompt.id]?.correct ?? 0}</strong></span>
            <span>Wrong <strong>{questionStats[currentPrompt.id]?.wrong ?? 0}</strong></span>
            <span>Skipped <strong>{questionStats[currentPrompt.id]?.skipped ?? 0}</strong></span>
          </div>
          <button type="button" className="mobile-interview-text-button" onClick={clearQuestionStats}>Clear stats</button>
        </aside>
        {!session.untimed && (() => {
          const remainingSeconds = getMobileInterviewRemainingSeconds(session, clockNow);
          const timePercent = Math.max(0, Math.min(100, remainingSeconds / currentPrompt.timeLimitSeconds * 100));
          return (
            <div className={`mobile-interview-question-timer${remainingSeconds <= 10 ? ' is-low' : ''}`} aria-label="Time remaining">
              <div><strong>{formatTimer(remainingSeconds)}</strong></div>
              <div className="mobile-interview-question-timer-track" role="progressbar" aria-label="Question time remaining" aria-valuenow={remainingSeconds} aria-valuemin={0} aria-valuemax={currentPrompt.timeLimitSeconds}>
                <span style={{ width: `${timePercent}%` }} />
              </div>
            </div>
          );
        })()}
        {session.status === 'paused' && (
          <div className="mobile-interview-paused" role="status">
            {currentPrompt.timeExpired && codingActive ? (
              <>
                <strong>
                  Time is up
                  {currentPrompt.answerResult ? ` · ${currentPrompt.answerResult === 'correct' ? 'Correct' : 'Incorrect'}` : ''}
                </strong>
                {currentPrompt.codingVerification?.status === 'unavailable' && (
                  <span>{currentPrompt.codingVerification.message || 'The answer could not be verified.'}</span>
                )}
                <button className="primary-button" type="button" onClick={() => advanceAfterFeedback(currentPrompt.id)}>
                  Continue interview
                </button>
              </>
            ) : (
              <>
                <strong>{feedback ? 'Answer saved' : 'Paused'}</strong>
                <button className="primary-button" type="button" onClick={resumeSession}>Resume interview</button>
              </>
            )}
          </div>
        )}
        {codingActive ? (
          <CodingInterviewErrorBoundary>
            <CodingInterviewExperience
              prompt={codingPrompt}
              codingQuestion={bankQuestion?.codingQuestion}
              paused={session.status === 'paused'}
              answerOpen={feedback?.promptId === currentPrompt.id}
              onPromptChange={(update) => updatePrompt(currentPrompt.id, update)}
              onSubmit={submitAnswer}
              onVerificationResult={onCodingVerificationResult}
              onRetryWithExtraTime={retryCodingPromptWithExtraTime}
              onViewAnswer={viewCodingAnswer}
              onHideAnswer={hideCodingAnswer}
              onNext={() => advanceAfterFeedback(currentPrompt.id)}
              onTrySolution={tryCodingSolution}
              onKeyboardVisibilityChange={onCodingKeyboardVisibilityChange}
            />
          </CodingInterviewErrorBoundary>
        ) : (
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
        )}
        <footer className="mobile-interview-controls">
          <div className={`mobile-interview-control-row${codingActive && session.status === 'paused' ? ' is-coding-paused' : ''}`} role="group" aria-label="Interview controls">
            <button className="secondary-button" type="button" aria-label="Previous question" title="Previous question" disabled={session.activeIndex === 0 || session.status === 'paused'} onClick={() => moveTo(session.activeIndex - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
            </button>
            {!(codingActive && session.status === 'paused') && (
              <button className="secondary-button" type="button" aria-label={session.status === 'running' ? 'Pause interview' : 'Resume interview'} title={session.status === 'running' ? 'Pause interview' : 'Resume interview'} onClick={session.status === 'running' ? pauseSession : resumeSession}>
                {session.status === 'running'
                  ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>
                  : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7z" /></svg>}
              </button>
            )}
            <button className="secondary-button" type="button" aria-label={session.activeIndex === session.prompts.length - 1 ? 'Finish interview' : 'Next question'} title={session.activeIndex === session.prompts.length - 1 ? 'Finish interview' : 'Next question'} onClick={() => moveTo(session.activeIndex + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
            </button>
            <button className="mobile-interview-end-icon" type="button" aria-label="End interview and view recap" title="End interview and view recap" onClick={finishSessionEarly}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
          </div>
        </footer>
        {feedback && !codingActive && (
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
              {feedback.reveal && currentPrompt.kind !== 'mcq' && currentPrompt.kind !== 'coding' && (
                <div className="mobile-interview-self-assessment" role="group" aria-label="Assess your answer">
                  <span>{feedback.result === 'submitted' ? 'How did you do?' : 'Your assessment'}</span>
                  <button type="button" className={feedback.result === 'correct' ? 'is-selected' : ''} aria-pressed={feedback.result === 'correct'} onClick={() => assessShortAnswer('correct')}>Correct</button>
                  <button type="button" className={feedback.result === 'incorrect' ? 'is-selected' : ''} aria-pressed={feedback.result === 'incorrect'} onClick={() => assessShortAnswer('incorrect')}>Not yet</button>
                </div>
              )}
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

function TimeWheelPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (seconds: number) => void;
}) {
  const titleId = useId();
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draftSeconds, setDraftSeconds] = useState(value);
  const selectedIndex = getClosestTimeOptionIndex(draftSeconds);

  useEffect(() => {
    if (!isOpen) return undefined;
    setDraftSeconds(value);
    const frame = window.requestAnimationFrame(() => {
      if (!wheelRef.current) return;
      wheelRef.current.scrollTop = getClosestTimeOptionIndex(value) * 44;
      wheelRef.current.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, value]);

  const moveWheel = (index: number) => {
    const nextIndex = Math.max(0, Math.min(QUESTION_TIME_OPTIONS.length - 1, index));
    setDraftSeconds(QUESTION_TIME_OPTIONS[nextIndex]);
    wheelRef.current?.scrollTo({ top: nextIndex * 44, behavior: 'smooth' });
  };

  const handleWheelKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveWheel(selectedIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      moveWheel(event.key === 'Home' ? 0 : QUESTION_TIME_OPTIONS.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onChange(draftSeconds);
      setIsOpen(false);
    }
  };

  return (
    <div className="mobile-interview-schedule-field">
      <span>{label}</span>
      <button
        type="button"
        className="mobile-interview-time-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <strong>{formatQuestionTime(value)}</strong>
        <span aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div className="mobile-interview-time-picker-backdrop" onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}>
          <section
            className="mobile-interview-time-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsOpen(false);
              else if (event.target === wheelRef.current) handleWheelKeyDown(event);
            }}
          >
            <header><strong id={titleId}>{label}</strong></header>
            <div className="mobile-interview-time-picker-wheel-wrap">
              <div className="mobile-interview-time-picker-selection" aria-hidden="true" />
              <div
                ref={wheelRef}
                className="mobile-interview-time-picker-wheel"
                role="listbox"
                aria-label={label}
                aria-activedescendant={`${titleId}-option-${selectedIndex}`}
                tabIndex={0}
                onScroll={(event) => {
                  const index = Math.max(0, Math.min(
                    QUESTION_TIME_OPTIONS.length - 1,
                    Math.round(event.currentTarget.scrollTop / 44),
                  ));
                  setDraftSeconds(QUESTION_TIME_OPTIONS[index]);
                }}
              >
                <div className="mobile-interview-time-picker-spacer" aria-hidden="true" />
                {QUESTION_TIME_OPTIONS.map((seconds, index) => (
                  <div
                    key={seconds}
                    id={`${titleId}-option-${index}`}
                    className={`mobile-interview-time-picker-option${selectedIndex === index ? ' selected' : ''}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => moveWheel(index)}
                  >
                    {formatQuestionTime(seconds)}
                  </div>
                ))}
                <div className="mobile-interview-time-picker-spacer" aria-hidden="true" />
              </div>
            </div>
            <footer>
              <button type="button" className="secondary-button" onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="button" className="primary-button" onClick={() => {
                onChange(draftSeconds);
                setIsOpen(false);
              }}>Done</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function getClosestTimeOptionIndex(seconds: number): number {
  return QUESTION_TIME_OPTIONS.reduce((closestIndex, option, index) => (
    Math.abs(option - seconds) < Math.abs(QUESTION_TIME_OPTIONS[closestIndex] - seconds) ? index : closestIndex
  ), 0);
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
  if (minutes === 0) return `${remainingSeconds} sec`;
  if (remainingSeconds === 0) return `${minutes} min`;
  return `${minutes} min ${remainingSeconds} sec`;
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
  const isCoding = question.codingProblemId !== undefined || question.codingQuestion !== undefined;
  return {
    id: question.id,
    checklistId: question.setId,
    checklistTitle: question.setTitle,
    sectionId: question.sectionId,
    sectionTitle: question.codingQuestion
      ? `${question.codingQuestion.language === 'kotlin' ? 'Kotlin' : 'Java'} Coding`
      : question.sectionTitle,
    text: question.text,
    referenceItems: [],
    answered: false,
    skipped: false,
    important: false,
    referenceRevealed: false,
    note: '',
    referenceAnswer: question.answer,
    ...(isCoding ? {
      kind: 'coding' as const,
      codingProblemId: question.codingProblemId,
      codingLanguage: question.codingLanguage,
    } : {}),
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
  return formatAppDateKey(date);
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
