import { useMemo, useState } from 'react';
import QuestionAnswer from './QuestionAnswer';
import { interviewQuestions } from '../data/interview-question-bank';
import type { MobileBankQuestion, MobileCodingQuestion, MobileQuestionSet } from '../data/mobile-interview-bank';
import { getProblemById, getProblemExamples, getProblemSolutions } from '../data/roadmap';
import type { MobileInterviewQuestionStats, MobileInterviewPrompt, MobileInterviewSession } from '../engine/mobile-interview';
import { getRevisionRecord, type RevisionPriority, type SmartRevisionData } from '../engine/smart-revision';
import {
  createLearnTrack,
  getContinueStage,
  getLearnStageStatus,
  getLearnStages,
  getMistakeStages,
  getQuizQuestionIds,
  markLearnQuestion,
  markLearnStageKnown,
  resetLearnStage,
  skipLearnStage,
  type LearnProgress,
  type LearnStage,
  type LearnTrackProgress,
} from '../engine/learn-track';

interface LearnQAProps {
  questionBank: MobileBankQuestion[];
  questionSets: MobileQuestionSet[];
  questionStats: Record<string, MobileInterviewQuestionStats>;
  revisionData: SmartRevisionData;
  onRevisionPriorityChange: (questionId: string, priority: RevisionPriority) => void;
  latestResultsByTrack?: Record<string, Record<string, 'correct' | 'incorrect' | 'skipped'>>;
  progress: LearnProgress;
  onProgressChange: (progress: LearnProgress) => void;
  onStartQuiz: (
    track: LearnTrackProgress,
    stage: LearnStage,
    prompts: MobileInterviewPrompt[],
    options: { includeAlreadyCorrect: boolean; shuffle: boolean; questionTimeSeconds: number; programTimeSeconds: number },
  ) => void;
  onBackToInterview: () => void;
  initialTrackId?: string;
  interviewToResume?: MobileInterviewSession | null;
  onResumeInterview?: () => void;
  onAbortInterview?: () => void;
  storageError?: string;
  initialStageId?: string;
}

const DEFAULT_OPTIONS = { includeAlreadyCorrect: true, shuffle: true, questionTimeSeconds: 120, programTimeSeconds: 600 };

export default function LearnQA({
  questionBank,
  questionSets,
  questionStats,
  revisionData,
  onRevisionPriorityChange,
  latestResultsByTrack,
  progress,
  onProgressChange,
  onStartQuiz,
  onBackToInterview,
  initialTrackId,
  interviewToResume,
  onResumeInterview,
  onAbortInterview,
  storageError,
  initialStageId,
}: LearnQAProps) {
  const hasInitialTrack = progress.tracks.some((track) => track.id === initialTrackId);
  const [view, setView] = useState<'home' | 'setup' | 'track' | 'cards'>(initialStageId && hasInitialTrack ? 'cards' : hasInitialTrack ? 'track' : 'home');
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState<3 | 5 | 10>(5);
  const [stageSizeTouched, setStageSizeTouched] = useState(false);
  const [trackId, setTrackId] = useState(hasInitialTrack ? initialTrackId ?? '' : '');
  const [stageId, setStageId] = useState(initialStageId && hasInitialTrack ? initialStageId : '');
  const [cardIndex, setCardIndex] = useState(0);
  const [skippedCardIds, setSkippedCardIds] = useState<string[]>([]);
  const [codingDrafts, setCodingDrafts] = useState<Record<string, { language: 'kotlin' | 'java'; code: string }>>({});
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [quizOptions, setQuizOptions] = useState(DEFAULT_OPTIONS);
  const [notice, setNotice] = useState('');

  const activeTrack = progress.tracks.find((track) => track.id === trackId);
  const latestResults = latestResultsByTrack?.[trackId];
  const selectedBankQuestions = questionBank.filter((question) => selectedSetIds.includes(question.setId)
    && selectedSectionIds.includes(question.sectionId));
  const selectedPrompts = useMemo(() => selectedBankQuestions.map(toPrompt), [selectedBankQuestions]);
  const activeQuestionIds = activeTrack
    ? questionBank.filter((question) => activeTrack.setIds.includes(question.setId)
      && activeTrack.sectionIds.includes(question.sectionId)).map((question) => question.id)
    : [];
  const stages = activeTrack ? getLearnStages(activeTrack, activeQuestionIds) : [];
  const mistakeStages = activeTrack ? getMistakeStages(activeTrack, activeQuestionIds, questionStats, latestResults) : [];
  const selectedStage = [...stages, ...mistakeStages].find((stage) => stage.id === stageId);
  const cardQuestionId = selectedStage?.questions[cardIndex];
  const cardQuestion = questionBank.find((question) => question.id === cardQuestionId);
  const codingQuestion = cardQuestion ? getCodingQuestion(cardQuestion) : undefined;
  const cardRevision = cardQuestion ? getRevisionRecord(revisionData, cardQuestion.id) : undefined;
  const sourceQuestion = cardQuestion
    ? interviewQuestions.find((question) => question.prompt === cardQuestion.text
      && getSectionTitle(question) === cardQuestion.sectionTitle)
    : undefined;
  const eligibleQuizIds = selectedStage ? getQuizQuestionIds(selectedStage, questionStats, quizOptions.includeAlreadyCorrect, latestResults) : [];

  const startTrack = () => {
    const newTrack = createLearnTrack(selectedSetIds, selectedSectionIds, stageSize);
    const existing = progress.tracks.find((track) => track.id === newTrack.id);
    const effectiveStageSize = selectedPrompts.every((prompt) => prompt.kind === 'coding') && !stageSizeTouched ? 3 : stageSize;
    const trackWithSize = effectiveStageSize === stageSize ? newTrack : createLearnTrack(selectedSetIds, selectedSectionIds, effectiveStageSize);
    const track = existing ? { ...existing, stageSize: effectiveStageSize, lastOpenedAt: Date.now() } : trackWithSize;
    onProgressChange({
      version: 1,
      tracks: existing
        ? progress.tracks.map((entry) => entry.id === track.id ? track : entry)
        : [...progress.tracks, track],
    });
    setTrackId(track.id);
    setView('track');
  };

  const updateTrack = (nextTrack: LearnTrackProgress) => {
    onProgressChange({
      version: 1,
      tracks: progress.tracks.map((track) => track.id === nextTrack.id ? nextTrack : track),
    });
  };

  const openStage = (stage: LearnStage, phase: 'learn' | 'quiz' = 'learn') => {
    if (!activeTrack) return;
    const updated = { ...activeTrack, lastOpenedStageId: stage.id, lastOpenedAt: Date.now() };
    updateTrack(updated);
    setStageId(stage.id);
    setCardIndex(0);
    if (phase === 'quiz') setOptionsOpen(true);
    else {
      setSkippedCardIds([]);
      setView('cards');
    }
  };

  const startQuiz = (includeAlreadyCorrect = quizOptions.includeAlreadyCorrect) => {
    if (!activeTrack || !selectedStage) return;
    const questionIds = getQuizQuestionIds(selectedStage, questionStats, includeAlreadyCorrect, latestResults);
    if (questionIds.length === 0) {
      if (!includeAlreadyCorrect) setNotice('Nothing left to quiz here. Include questions you already got right to review them.');
      else setNotice('There are no questions in this stage.');
      return;
    }
    const questionById = new Map(questionBank.map((question) => [question.id, question]));
    let prompts = questionIds.map((id) => questionById.get(id))
      .filter((question): question is MobileBankQuestion => Boolean(question))
      .map((question) => ({
        ...toPrompt(question),
        ...(codingDrafts[question.id] && question.codingQuestion
          ? {
              codingLanguage: codingDrafts[question.id].language,
              codingAnswers: { [codingDrafts[question.id].language]: codingDrafts[question.id].code },
            }
          : {}),
      }));
    if (quizOptions.shuffle) prompts = shuffle(prompts);
    onStartQuiz(activeTrack, selectedStage, prompts, { ...quizOptions, includeAlreadyCorrect });
    setOptionsOpen(false);
  };

  const recordCardAction = (action: 'learned' | 'need-review' | 'skip') => {
    if (!activeTrack || !cardQuestionId) return;
    if (action !== 'skip') {
      const updated = markLearnQuestion(activeTrack, cardQuestionId, action);
        const synced = progress.tracks.map((track) => {
          const ownsQuestion = questionBank.some((question) => question.id === cardQuestionId
            && track.setIds.includes(question.setId) && track.sectionIds.includes(question.sectionId));
          if (!ownsQuestion) return track.id === activeTrack.id ? updated : track;
          return { ...track, questions: { ...track.questions, [cardQuestionId]: updated.questions[cardQuestionId] } };
        });
      onProgressChange({ version: 1, tracks: synced });
      setSkippedCardIds((current) => current.filter((id) => id !== cardQuestionId));
    } else {
      setSkippedCardIds((current) => [...new Set([...current, cardQuestionId])]);
    }
    setCardIndex((current) => Math.min(current + 1, selectedStage?.questions.length ?? 0));
  };

  const markStageKnown = (stage: LearnStage) => {
    if (!activeTrack) return;
    const updated = markLearnStageKnown(activeTrack, stage);
    const questionsByTrack = new Map<string, Record<string, (typeof updated.questions)[string]>>();
    for (const track of progress.tracks) questionsByTrack.set(track.id, { ...track.questions });
    stage.questions.forEach((questionId) => {
      const question = updated.questions[questionId];
      questionBank.filter((bankQuestion) => bankQuestion.id === questionId).forEach((bankQuestion) => {
        progress.tracks.filter((track) => track.setIds.includes(bankQuestion.setId) && track.sectionIds.includes(bankQuestion.sectionId))
          .forEach((track) => {
            const questions = questionsByTrack.get(track.id);
            if (questions) questions[questionId] = question;
          });
      });
    });
    onProgressChange({ version: 1, tracks: progress.tracks.map((track) => track.id === updated.id
      ? updated
      : { ...track, questions: questionsByTrack.get(track.id) ?? track.questions }) });
  };

  const resetTrack = () => {
    if (!activeTrack || !window.confirm('Reset learn progress for this track? This clears learned and review flags, stage quiz summaries, and the last-opened stage pointer for this track. It keeps shared attendance, correct, wrong, and skipped question statistics.')) return;
    const ids = new Set(activeQuestionIds);
    onProgressChange({ version: 1, tracks: progress.tracks.map((track) => ({
      ...track,
      questions: Object.fromEntries(Object.entries(track.questions).filter(([id]) => !ids.has(id))),
      ...(track.id === activeTrack.id ? { stageQuizzes: {}, lastOpenedStageId: undefined, lastOpenedAt: Date.now() } : {}),
    })) });
    setNotice('Learn progress reset. Question statistics were kept.');
  };

  const removeTrack = (id: string) => {
    if (!window.confirm('Remove this track and its Learn progress? Your interview question statistics will be kept.')) return;
    onProgressChange({ version: 1, tracks: progress.tracks.filter((track) => track.id !== id) });
    if (trackId === id) {
      setTrackId('');
      setView('home');
    }
  };

  const renderStats = (ids: string[]) => {
    const learned = ids.filter((id) => activeTrack?.questions[id]?.learned).length;
    const totals = ids.reduce((result, id) => {
      const stats = questionStats[id];
      return {
        attended: result.attended + (stats?.attended ?? 0),
        correct: result.correct + (stats?.correct ?? 0),
        wrong: result.wrong + (stats?.wrong ?? 0),
        skipped: result.skipped + (stats?.skipped ?? 0),
      };
    }, { attended: 0, correct: 0, wrong: 0, skipped: 0 });
    const needsAttention = new Set(ids.filter((id) => activeTrack?.questions[id]?.needReview
      || (questionStats[id]?.wrong ?? 0) > 0 || (questionStats[id]?.skipped ?? 0) > 0)).size;
    return { learned, ...totals, needsAttention, percent: ids.length ? Math.round(learned / ids.length * 100) : 0 };
  };

  if (view === 'home') {
    return (
      <section className="mobile-interview mobile-learn-home">
        <header className="mobile-learn-page-heading mobile-learn-home-heading">
          <button type="button" className="mobile-interview-back" onClick={onBackToInterview} aria-label="Back to Mobile Interview">‹</button>
          <div><span className="mobile-interview-kicker">MOBILE INTERVIEW</span><h2>Learn &amp; Q&amp;A</h2>
            <p>Learn a few questions at a time, then check what you remember.</p>
          </div>
        </header>
        {interviewToResume && <section className="mobile-interview-resume-card">
          <div><span className="mobile-interview-kicker">{interviewToResume.status === 'paused' ? 'Interview paused' : 'Interview in progress'}</span><h3>{interviewToResume.title ?? 'Saved interview in progress'}</h3>
            <p>Question {interviewToResume.activeIndex + 1} of {interviewToResume.prompts.length}</p>
          </div>
          <div className="mobile-interview-resume-actions">
            <button type="button" className="primary-button" onClick={onResumeInterview}>{interviewToResume.mode === 'learn' ? 'Continue Learn quiz' : 'Continue interview'}</button>
            <button type="button" className="mobile-interview-abort" onClick={onAbortInterview}>Abort interview</button>
          </div>
        </section>}
        <button type="button" className="mobile-learn-new-track" onClick={() => {
          setSelectedSetIds([]);
          setSelectedSectionIds([]);
          setStageSize(5);
          setView('setup');
        }}><span aria-hidden="true">+</span> Start a new track</button>
        <div className="mobile-learn-section-heading">
          <div><h3>Your tracks</h3><span>{progress.tracks.length} {progress.tracks.length === 1 ? 'track' : 'tracks'}</span></div>
        </div>
        {progress.tracks.length === 0
          ? <section className="mobile-learn-empty-state">
            <span aria-hidden="true">✦</span><h3>Make learning manageable</h3>
            <p>Choose a category, learn in short stages, and review questions whenever you need.</p>
            <button type="button" className="secondary-button" onClick={() => setView('setup')}>Choose a category</button>
          </section>
          : <div className="mobile-learn-track-list">{progress.tracks.map((track) => {
            const ids = questionBank.filter((question) => track.setIds.includes(question.setId)
              && track.sectionIds.includes(question.sectionId)).map((question) => question.id);
            const counts = getTrackCounts(track, ids, questionStats);
            return (
              <article key={track.id} className="mobile-learn-track-card">
                <button type="button" className="mobile-learn-track-open" onClick={() => {
                  setTrackId(track.id);
                  setView('track');
                }}>
                  <span className="mobile-learn-track-title"><strong>{getTrackTitle(track, questionSets)}</strong><span aria-hidden="true">›</span></span>
                  <span className="mobile-learn-track-progress-copy">{counts.percent}% learned <span>{getLearnStages(track, ids).length} stages · {ids.length} questions</span></span>
                  <span className="mobile-learn-progress"><i style={{ width: `${counts.percent}%` }} /></span>
                  <span className="mobile-learn-track-metrics"><span><strong>{counts.attended}</strong> attended</span><span><strong>{counts.correct}</strong> correct</span><span><strong>{counts.wrong}</strong> wrong</span><span><strong>{counts.skipped}</strong> skipped</span></span>
                </button>
                {ids.length === 0 && <div className="mobile-learn-track-unavailable"><p>This category is no longer available.</p><button type="button" className="mobile-interview-text-button" onClick={() => removeTrack(track.id)}>Remove track</button></div>}
              </article>
            );
          })}</div>}
        {notice && <p role="status" className="mobile-interview-empty">{notice}</p>}
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      </section>
    );
  }

  if (view === 'setup') {
    const codingOnly = selectedPrompts.length > 0 && selectedPrompts.every((prompt) => prompt.kind === 'coding');
    return (
      <section className="mobile-interview mobile-interview-setup mobile-learn-setup">
        <header className="mobile-interview-top mobile-interview-page-heading">
          <button className="mobile-interview-back" type="button" onClick={() => setView('home')} aria-label="Back to Learn home">‹</button>
          <div><span className="mobile-interview-kicker">Learn &amp; Q&amp;A</span><h2>Choose a track</h2></div>
        </header>
        {questionSets.map((set) => {
          const checked = selectedSetIds.includes(set.id);
          return <details className="mobile-interview-set-group" key={set.id}>
            <summary>{set.title}<span>{set.sections.reduce((sum, section) => sum + section.questionCount, 0)} questions</span></summary>
            <label className="mobile-interview-set-option"><input type="checkbox" checked={set.sections.every((section) => selectedSectionIds.includes(section.id))} onChange={(event) => {
              const sections = set.sections.map((section) => section.id);
              setSelectedSetIds((current) => event.target.checked ? [...new Set([...current, set.id])] : current.filter((id) => id !== set.id));
              setSelectedSectionIds((current) => event.target.checked ? [...new Set([...current, ...sections])] : current.filter((id) => !sections.includes(id)));
            }} /><span>All questions in this set</span></label>
            {set.sections.map((section) => <label className="mobile-interview-set-option" key={section.id}>
              <input type="checkbox" checked={selectedSectionIds.includes(section.id)} onChange={(event) => {
                setSelectedSectionIds((current) => event.target.checked ? [...new Set([...current, section.id])] : current.filter((id) => id !== section.id));
                if (event.target.checked) setSelectedSetIds((current) => [...new Set([...current, set.id])]);
              }} />
              <span>{section.title}</span><small>{section.questionCount}</small>
            </label>)}
          </details>;
        })}
        <label className="mobile-learn-stage-size">Questions per stage
          <select value={codingOnly && !stageSizeTouched ? 3 : stageSize} onChange={(event) => {
            setStageSize(Number(event.target.value) as 3 | 5 | 10);
            setStageSizeTouched(true);
          }}>
            {[3, 5, 10].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <p>{selectedPrompts.length} questions in this track {codingOnly ? '· coding default: 3 per stage' : ''}</p>
        <button type="button" className="primary-button mobile-interview-primary" disabled={selectedPrompts.length === 0} onClick={startTrack}>Create track</button>
      </section>
    );
  }

  if (!activeTrack) return <p className="mobile-interview-empty">This track could not be found. <button type="button" className="mobile-interview-text-button" onClick={() => setView('home')}>Back to Learn home</button></p>;

  if (view === 'track') {
    if (activeQuestionIds.length === 0) return <section className="mobile-interview mobile-learn-track"><p className="mobile-interview-empty">This track is empty because its category or section is no longer available.</p><button className="mobile-interview-text-button" type="button" onClick={() => removeTrack(activeTrack.id)}>Remove track</button></section>;
    const continueStage = getContinueStage(stages, activeTrack, questionStats, latestResults);
    const counts = renderStats(activeQuestionIds);
    return (
      <section className="mobile-interview mobile-learn-track">
        <header className="mobile-learn-page-heading mobile-learn-track-heading">
          <div><button type="button" className="mobile-learn-mode-link" onClick={() => setView('home')}>‹ All tracks</button><h2>{getTrackTitle(activeTrack, questionSets)}</h2>
            <p>{activeQuestionIds.length} questions · {stages.length} stages · {activeTrack.stageSize} per stage</p>
          </div>
        </header>
        <section className="mobile-learn-overview">
          <div className="mobile-learn-overview-progress"><div><strong>{counts.percent}%</strong><span>learned</span></div><span>{counts.learned} of {activeQuestionIds.length} questions</span></div>
          <span className="mobile-learn-progress"><i style={{ width: `${counts.percent}%` }} /></span>
          <div className="mobile-learn-overview-metrics">
            <span><strong>{counts.attended}</strong> Attended</span><span><strong>{counts.correct}</strong> Correct</span>
            <span><strong>{counts.wrong}</strong> Wrong</span><span><strong>{counts.skipped}</strong> Skipped</span>
            <span className="needs-attention"><strong>{counts.needsAttention}</strong> Needs attention</span>
          </div>
        </section>
        {continueStage
          ? <button type="button" className="mobile-learn-continue-button" onClick={() => openStage(continueStage)}>
            <span><strong>Continue learning</strong><small>Stage {continueStage.ordinal} · {continueStage.questions.length} questions</small></span><b aria-hidden="true">→</b>
          </button>
          : <section className="mobile-learn-complete-state"><strong>All stages mastered</strong><span>Keep your skills sharp with a review of your mistakes.</span></section>}
        <div className="mobile-learn-section-heading"><div><h3>Stages</h3><span>Choose any stage to begin</span></div></div>
        <div className="mobile-learn-stage-grid">{stages.map((stage) => {
          const status = getLearnStageStatus(stage, activeTrack, questionStats, latestResults);
          const summary = activeTrack.stageQuizzes[stage.id];
          return <button type="button" className={`mobile-learn-stage-tile ${status}`} key={stage.id} onClick={() => openStage(stage)}>
            <span className="mobile-learn-stage-number">{stage.ordinal}</span><span className="mobile-learn-stage-copy"><strong>Stage {stage.ordinal}</strong><small>{stage.questions.length} questions</small></span>
            <span className={`mobile-learn-stage-status ${status}`}>{statusLabel(status)}</span>
            {summary && <small className="mobile-learn-stage-score">Last quiz {summary.correct}/{summary.total}</small>}
          </button>;
        })}</div>
        <details className="mobile-learn-management">
          <summary>Manage stages</summary>
          <section className="mobile-learn-stage-actions">
            {stages.map((stage) => <details key={stage.id}><summary>Stage {stage.ordinal} · {stage.questions.length} questions</summary>
            <div className="mobile-learn-action-row">
              <button type="button" className="secondary-button" onClick={() => openStage(stage)}>Open</button>
              <button type="button" className="secondary-button" onClick={() => {
                const skipped = skipLearnStage(activeTrack, stage);
                updateTrack({ ...skipped, lastOpenedStageId: stage.id, lastOpenedAt: Date.now() });
                setStageId(stage.id);
                setView('track');
                setOptionsOpen(true);
              }}>Skip Learn, go to Quiz</button>
              <button type="button" className="secondary-button" onClick={() => markStageKnown(stage)}>Mark stage as already known</button>
              <button type="button" className="mobile-interview-text-button" onClick={() => {
                if (window.confirm(`Reset Stage ${stage.ordinal}? This clears learned and review flags and its quiz summary for these questions, but keeps all question statistics.`)) {
                  const reset = resetLearnStage(activeTrack, stage);
                  const resetIds = new Set(stage.questions);
                  onProgressChange({ version: 1, tracks: progress.tracks.map((track) => ({
                    ...track,
                    questions: Object.fromEntries(Object.entries(track.questions).filter(([id]) => !resetIds.has(id))),
                    ...(track.id === activeTrack.id ? { stageQuizzes: reset.stageQuizzes } : {}),
                  })) });
                }
              }}>Reset stage</button>
              <p className="mobile-learn-mini-stats">{(() => {
                const stageCounts = getTrackCounts(activeTrack, stage.questions, questionStats);
                return `Learned ${stageCounts.learned}/${stage.questions.length} · Attended ${stageCounts.attended} · Correct ${stageCounts.correct} · Wrong ${stageCounts.wrong} · Skipped ${stageCounts.skipped}`;
              })()}</p>
            </div>
            </details>)}
          </section>
        </details>
        <section className="mobile-learn-mistakes">
          <h3>Mistakes</h3>
          {mistakeStages.length === 0 ? <p>No mistakes or review questions right now.</p> : mistakeStages.map((stage) => (
            <button type="button" className="mobile-learn-mistake-tile" key={stage.id} onClick={() => openStage(stage)}>
              <span className="mobile-learn-mistake-title"><strong>Mistakes{stage.ordinal > 1 ? ` ${stage.ordinal}` : ''}</strong><span aria-hidden="true">›</span></span>
              <span className="mobile-learn-mistake-meta">{stage.questions.length} questions <span>Review questions</span></span>
            </button>
          ))}
        </section>
        {notice && <p role="status" className="mobile-interview-empty">{notice}</p>}
        {selectedStage && eligibleQuizIds.length === 0 && <button type="button" className="secondary-button" onClick={() => {
          setQuizOptions((options) => ({ ...options, includeAlreadyCorrect: true }));
          setOptionsOpen(true);
        }}>Include questions I already got right</button>}
        <details className="mobile-learn-management mobile-learn-track-settings">
          <summary>Track settings</summary>
          <div className="mobile-learn-track-settings-actions">
            <button type="button" className="mobile-learn-reset-button" onClick={resetTrack}>Reset Learn progress</button>
            <button type="button" className="mobile-learn-remove-button" onClick={() => removeTrack(activeTrack.id)}>Remove track</button>
          </div>
        </details>
        {optionsOpen && <QuizOptionsDialog
          options={quizOptions}
          onChange={setQuizOptions}
          onClose={() => setOptionsOpen(false)}
          onStart={() => startQuiz()}
          eligibleCount={eligibleQuizIds.length}
        />}
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      </section>
    );
  }

  if (!selectedStage) return <section className="mobile-interview mobile-learn-cards"><p className="mobile-interview-empty">This stage could not be found.</p><button type="button" className="mobile-interview-text-button" onClick={() => setView('track')}>Back to stages</button></section>;
  const learnSummary = selectedStage.questions.reduce((totals, id) => {
    const question = activeTrack.questions[id];
    if (skippedCardIds.includes(id)) totals.skipped += 1;
    else if (question?.learned) totals.gotIt += 1;
    else if (question?.needReview) totals.review += 1;
    return totals;
  }, { gotIt: 0, review: 0, skipped: 0 });
  const isLastCard = cardIndex >= selectedStage.questions.length - 1;
  if (cardIndex >= selectedStage.questions.length) {
    return (
      <section className="mobile-interview mobile-learn-cards mobile-learn-completion">
        <header className="mobile-learn-page-heading">
          <div><button type="button" className="mobile-learn-mode-link" onClick={() => setView('track')}>‹ All stages</button><h2>Stage complete</h2>
            <p>{selectedStage.mistakes ? 'Mistakes review' : `Stage ${selectedStage.ordinal}`} · {selectedStage.questions.length} cards</p>
          </div>
        </header>
        <section className="mobile-learn-summary">
          <span className="mobile-learn-completion-icon" aria-hidden="true">✓</span>
          <h3>Nice work</h3><p>Here’s how you marked this stage.</p>
          <div className="mobile-learn-summary-counts">
            <span><strong>{learnSummary.gotIt}</strong> Got it</span><span><strong>{learnSummary.review}</strong> Need review</span><span><strong>{learnSummary.skipped}</strong> Skipped</span>
          </div>
          <button type="button" className="primary-button mobile-interview-primary" onClick={() => setOptionsOpen(true)}>Quiz this stage</button>
          <button type="button" className="secondary-button" onClick={() => setCardIndex(0)}>Review cards again</button>
          <button type="button" className="mobile-interview-text-button" onClick={() => setView('track')}>Back to all stages</button>
        </section>
        {optionsOpen && <QuizOptionsDialog options={quizOptions} onChange={setQuizOptions} onClose={() => setOptionsOpen(false)} onStart={() => startQuiz()} eligibleCount={eligibleQuizIds.length} />}
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      </section>
    );
  }
  if (!cardQuestion) return <section className="mobile-interview mobile-learn-cards"><p className="mobile-interview-empty">This card is no longer available.</p><button type="button" className="mobile-interview-text-button" onClick={() => setView('track')}>Back to stages</button></section>;
  return (
    <section className="mobile-interview mobile-learn-cards">
      <header className="mobile-learn-page-heading mobile-learn-card-heading">
        <div><button type="button" className="mobile-learn-mode-link" onClick={() => setView('track')}>‹ All stages</button><h2>{selectedStage.mistakes ? 'Mistakes review' : `Stage ${selectedStage.ordinal}`}</h2></div>
      </header>
      <div className="mobile-learn-card-progress"><div><span>Card {cardIndex + 1} of {selectedStage.questions.length}</span><span>{Math.round((cardIndex + 1) / selectedStage.questions.length * 100)}%</span></div>
        <span className="mobile-learn-progress"><i style={{ width: `${(cardIndex + 1) / selectedStage.questions.length * 100}%` }} /></span>
      </div>
      <article className="mobile-interview-prompt mobile-learn-card">
        <div className="mobile-learn-question-toolbar">
          <span>{codingQuestion ? 'CODING QUESTION' : 'QUESTION'}</span>
          {cardRevision && <button type="button" className="mobile-learn-revision-priority" aria-label={`Revision priority: ${priorityLabel(cardRevision.priority)}. Change priority`} onClick={() => {
            onRevisionPriorityChange(cardQuestion.id, ((cardRevision.priority + 1) % 3) as RevisionPriority);
          }}>{priorityLabel(cardRevision.priority)}</button>}
          <button type="button" className="mobile-learn-important-button" aria-label={activeTrack.questions[cardQuestion.id]?.important ? 'Remove important mark' : 'Mark question important'} aria-pressed={Boolean(activeTrack.questions[cardQuestion.id]?.important)} onClick={() => {
            const important = !activeTrack.questions[cardQuestion.id]?.important;
            if (important && cardRevision && cardRevision.priority < 1) onRevisionPriorityChange(cardQuestion.id, 1);
            const questions = { ...activeTrack.questions, [cardQuestion.id]: { ...(activeTrack.questions[cardQuestion.id] ?? { learned: false, needReview: false }), important } };
            const updatedTrack = { ...activeTrack, questions };
            onProgressChange({ version: 1, tracks: progress.tracks.map((track) => questionBank.some((question) => question.id === cardQuestion.id
              && track.setIds.includes(question.setId) && track.sectionIds.includes(question.sectionId))
              ? { ...track, questions: { ...track.questions, [cardQuestion.id]: questions[cardQuestion.id] } }
              : track.id === activeTrack.id ? updatedTrack : track) });
          }}>{activeTrack.questions[cardQuestion.id]?.important ? '★' : '☆'}</button>
        </div>
        {cardRevision?.autoPromoted && <small className="mobile-revision-auto-label">Auto-promoted after repeated mistakes</small>}
        {codingQuestion && <div className="mobile-learn-coding-prompt">
          <h3>{codingQuestion.title}</h3><p>{codingQuestion.description}</p>
          {codingQuestion.examples.map((example, index) => <p key={index}><strong>Input:</strong> {example.input}<br /><strong>Expected output:</strong> {example.output}</p>)}
        </div>}
        {!codingQuestion && <h3>{cardQuestion.text}</h3>}
        <section className="mobile-learn-answer">
          {codingQuestion
            ? <>{(['kotlin', 'java'] as const).map((language) => <section key={language}><h4>{language === 'kotlin' ? 'Kotlin' : 'Java'}</h4>{codingQuestion.solutions[language].map((solution, index) => <details key={index}><summary>{solution.label} · {solution.recommendation}</summary><pre><code>{solution.code}</code></pre>{solution.note && <small>{solution.note}</small>}<button type="button" className="secondary-button" onClick={() => setCodingDrafts((current) => ({ ...current, [cardQuestion.id]: { language, code: solution.code } }))}>Use solution in next quiz</button></details>)}</section>)}</>
            : sourceQuestion ? <QuestionAnswer question={sourceQuestion} /> : <p>{cardQuestion.answer || 'No reference answer is available.'}</p>}
        </section>
      </article>
      <nav className="mobile-learn-card-actions" aria-label="Mark your understanding">
        <button type="button" className="mobile-learn-decision known" onClick={() => recordCardAction('learned')}><span aria-hidden="true">✓</span> Got it</button>
        <button type="button" className="mobile-learn-decision review" onClick={() => recordCardAction('need-review')}><span aria-hidden="true">↻</span> Need review</button>
      </nav>
      <nav className="mobile-learn-card-navigation" aria-label="Card navigation">
        <button type="button" className="secondary-button" disabled={cardIndex === 0} onClick={() => setCardIndex((index) => index - 1)}>‹ Previous</button>
        <button type="button" className="mobile-interview-text-button" onClick={() => recordCardAction('skip')}>{isLastCard ? 'Finish stage' : 'Skip for now'} <span aria-hidden="true">→</span></button>
      </nav>
      {optionsOpen && <QuizOptionsDialog options={quizOptions} onChange={setQuizOptions} onClose={() => setOptionsOpen(false)} onStart={() => startQuiz()} eligibleCount={eligibleQuizIds.length} />}
      {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
    </section>
  );
}

function QuizOptionsDialog({
  options,
  onChange,
  onClose,
  onStart,
  eligibleCount,
}: {
  options: typeof DEFAULT_OPTIONS;
  onChange: (options: typeof DEFAULT_OPTIONS) => void;
  onClose: () => void;
  onStart: () => void;
  eligibleCount: number;
}) {
  return <div className="mobile-interview-history-overlay"><section className="mobile-interview-history-dialog mobile-learn-options" role="dialog" aria-modal="true" aria-labelledby="learn-quiz-options-title">
    <header><h2 id="learn-quiz-options-title">Quiz options</h2><button type="button" className="mobile-interview-back" aria-label="Close quiz options" onClick={onClose}>×</button></header>
    <label className="mobile-interview-random-toggle"><input type="checkbox" checked={options.includeAlreadyCorrect} onChange={(event) => onChange({ ...options, includeAlreadyCorrect: event.target.checked })} /><span>Include questions I already got right</span></label>
    <label className="mobile-interview-random-toggle"><input type="checkbox" checked={options.shuffle} onChange={(event) => onChange({ ...options, shuffle: event.target.checked })} /><span>Shuffle questions</span></label>
    <label>Time per question (minutes)<input type="number" min="1" max="60" value={options.questionTimeSeconds / 60} onChange={(event) => onChange({ ...options, questionTimeSeconds: Math.max(60, Number(event.target.value) * 60) })} /></label>
    <label>Program time (minutes)<input type="number" min="1" max="60" value={options.programTimeSeconds / 60} onChange={(event) => onChange({ ...options, programTimeSeconds: Math.max(60, Number(event.target.value) * 60) })} /></label>
    <p>{eligibleCount > 0 ? `${eligibleCount} questions ready` : 'Nothing left to quiz here. Turn on “Include questions I already got right” to review mastered questions.'}</p>
    <button type="button" className="primary-button mobile-interview-primary" onClick={onStart}>Start quiz</button>
  </section></div>;
}

function getTrackCounts(track: LearnTrackProgress, ids: string[], stats: Record<string, MobileInterviewQuestionStats>) {
  const result = ids.reduce((counts, id) => {
    const question = stats[id];
    return {
      learned: counts.learned + (track.questions[id]?.learned ? 1 : 0),
      attended: counts.attended + (question?.attended ?? 0),
      correct: counts.correct + (question?.correct ?? 0),
      wrong: counts.wrong + (question?.wrong ?? 0),
      skipped: counts.skipped + (question?.skipped ?? 0),
    };
  }, { learned: 0, attended: 0, correct: 0, wrong: 0, skipped: 0 });
  return { ...result, percent: ids.length ? Math.round(result.learned / ids.length * 100) : 0 };
}

function getTrackTitle(track: LearnTrackProgress, sets: MobileQuestionSet[]): string {
  return track.setIds.map((id) => sets.find((set) => set.id === id)?.title).filter(Boolean).join(' · ')
    || 'Unavailable question track';
}

function statusLabel(status: ReturnType<typeof getLearnStageStatus>): string {
  return ({ 'not-started': 'Not started', learning: 'Learning', ready: 'Ready for quiz', quizzed: 'Quizzed', mastered: 'Mastered' })[status];
}

function toPrompt(question: MobileBankQuestion): MobileInterviewPrompt {
  const isCoding = Boolean(question.codingQuestion || question.codingProblemId !== undefined);
  return {
    id: question.id,
    checklistId: question.setId,
    checklistTitle: question.setTitle,
    sectionId: question.sectionId,
    sectionTitle: question.codingQuestion ? `${question.codingQuestion.language === 'kotlin' ? 'Kotlin' : 'Java'} Coding` : question.sectionTitle,
    text: question.text,
    referenceItems: [],
    answered: false,
    skipped: false,
    important: false,
    referenceRevealed: false,
    note: '',
    referenceAnswer: question.answer || undefined,
    ...(isCoding ? { kind: 'coding' as const, codingProblemId: question.codingProblemId, codingLanguage: question.codingLanguage } : {}),
  };
}

function getCodingQuestion(question: MobileBankQuestion): MobileCodingQuestion | undefined {
  if (question.codingQuestion) return question.codingQuestion;
  if (question.codingProblemId === undefined) return undefined;
  const problem = getProblemById(question.codingProblemId);
  if (!problem) return undefined;
  return {
    language: question.codingLanguage ?? 'kotlin',
    title: problem.title,
    description: problem.description,
    examples: getProblemExamples(problem),
    solutions: {
      kotlin: getProblemSolutions(problem, 'kotlin'),
      java: getProblemSolutions(problem, 'java'),
    },
  };
}

function getSectionTitle(question: (typeof interviewQuestions)[number]): string {
  const [category, ...sections] = (question.section || question.category).split(' / ');
  return /^Set\s+\d+\s*:/i.test(category) ? [category, ...sections].join(' / ') : sections.join(' / ') || 'General';
}

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function priorityLabel(priority: RevisionPriority): string {
  return priority === 2 ? 'Must-know' : priority === 1 ? 'Important' : 'Normal';
}
