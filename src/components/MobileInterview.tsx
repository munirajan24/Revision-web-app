import { useEffect, useMemo, useState } from 'react';
import { seedSkillChecklists } from '../data/skill-checklists';
import {
  createMobileInterviewSession,
  expireMobileInterviewPrompt,
  finishMobileInterviewSession,
  getMobileInterviewPrompts,
  getMobileInterviewPromptLimit,
  getMobileInterviewRemainingSeconds,
  loadMobileInterviewSession,
  moveMobileInterviewToPrompt,
  pauseMobileInterviewSession,
  resumeMobileInterviewSession,
  saveMobileInterviewSession,
  type MobileInterviewPrompt,
  type MobileInterviewSession,
  type MobileInterviewTrack,
} from '../engine/mobile-interview';

const durationOptions = [15, 30, 45];

interface MobileInterviewProps {
  onExit: () => void;
}

export default function MobileInterview({ onExit }: MobileInterviewProps) {
  const [track, setTrack] = useState<MobileInterviewTrack>('kotlin');
  const [sectionId, setSectionId] = useState('all');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [session, setSession] = useState<MobileInterviewSession | null>(() => loadMobileInterviewSession(localStorage));
  const [importantOnly, setImportantOnly] = useState(false);
  const [storageError, setStorageError] = useState('');

  const availablePrompts = useMemo(
    () => getMobileInterviewPrompts(seedSkillChecklists, track, sectionId === 'all' ? undefined : sectionId, highPriorityOnly),
    [track, sectionId, highPriorityOnly],
  );
  const topicOptions = useMemo(() => {
    const prompts = getMobileInterviewPrompts(seedSkillChecklists, track);
    const topics = [...new Map(prompts.map((prompt) => [
      prompt.sectionId,
      { title: prompt.sectionTitle, checklistTitle: prompt.checklistTitle },
    ]))];
    const titleCounts = new Map<string, number>();
    topics.forEach(([, topic]) => titleCounts.set(topic.title, (titleCounts.get(topic.title) ?? 0) + 1));
    return topics.map(([id, topic]) => [
      id,
      titleCounts.get(topic.title) === 1 ? topic.title : `${topic.title} · ${topic.checklistTitle}`,
    ] as const);
  }, [track]);
  const plannedPromptCount = Math.min(availablePrompts.length, getMobileInterviewPromptLimit(durationMinutes));

  useEffect(() => {
    if (!session || session.status !== 'running') return undefined;
    const interval = window.setInterval(() => {
      setSession((current) => {
        if (!current || current.status !== 'running') return current;
        const remainingSeconds = getMobileInterviewRemainingSeconds(current);
        if (remainingSeconds === 0) return expireMobileInterviewPrompt(current);
        if (remainingSeconds === current.remainingSeconds) return current;
        return {
          ...current,
          remainingSeconds,
          prompts: current.prompts.map((prompt, index) => index === current.activeIndex ? { ...prompt, remainingSeconds } : prompt),
        };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session?.activeIndex, session?.id, session?.status]);

  useEffect(() => {
    try {
      saveMobileInterviewSession(localStorage, session);
      setStorageError('');
    } catch {
      setStorageError('This browser could not save the session. Keep this tab open to avoid losing progress.');
    }
  }, [session]);

  const currentPrompt = session?.prompts[session.activeIndex];
  const answeredCount = session?.prompts.filter((prompt) => prompt.answered).length ?? 0;
  const skippedCount = session?.prompts.filter((prompt) => prompt.skipped).length ?? 0;
  const importantCount = session?.prompts.filter((prompt) => prompt.important).length ?? 0;
  const revealedCount = session?.prompts.filter((prompt) => prompt.referenceRevealed).length ?? 0;
  const elapsedSeconds = session?.prompts.reduce((total, prompt) => total + prompt.timeLimitSeconds - prompt.remainingSeconds, 0) ?? 0;

  const beginSession = () => {
    if (availablePrompts.length === 0) return;
    setSession(createMobileInterviewSession(availablePrompts.slice(0, plannedPromptCount), track, durationMinutes));
    setImportantOnly(false);
  };

  const updatePrompt = (promptId: string, update: Partial<MobileInterviewPrompt>) => {
    setSession((current) => current && ({
      ...current,
      prompts: current.prompts.map((prompt) => prompt.id === promptId ? { ...prompt, ...update } : prompt),
    }));
  };

  const moveTo = (index: number) => {
    if (!session) return;
    setSession(moveMobileInterviewToPrompt(session, index));
  };

  const skipCurrent = () => {
    if (!session || !currentPrompt) return;
    const prompts = session.prompts.map((prompt) => prompt.id === currentPrompt.id
      ? { ...prompt, answered: false, skipped: true }
      : prompt);
    setSession(moveMobileInterviewToPrompt({ ...session, prompts }, session.activeIndex + 1));
  };

  const pauseSession = () => {
    setSession((current) => current && pauseMobileInterviewSession(current));
  };

  const resumeSession = () => {
    setSession((current) => current && resumeMobileInterviewSession(current));
  };

  const exitSession = () => {
    if (!session) {
      onExit();
      return;
    }
    if (session.status === 'running' && !window.confirm('Pause this interview and return to the revision checklist?')) return;
    if (session.status === 'running') {
      const paused = pauseMobileInterviewSession(session);
      try {
        saveMobileInterviewSession(localStorage, paused);
      } catch {
        setStorageError('This browser could not save the paused session. Keep this tab open or resume before leaving.');
        return;
      }
      setSession(paused);
    }
    onExit();
  };

  const discardSession = () => {
    if (!window.confirm('End this session and clear its saved progress?')) return;
    setSession(null);
    setImportantOnly(false);
  };

  const finishSessionEarly = () => {
    if (!session || !window.confirm('End this interview now and open the recap?')) return;
    setSession(finishMobileInterviewSession(session));
  };

  if (session?.status === 'finished') {
    const prompts = importantOnly ? session.prompts.filter((prompt) => prompt.important) : session.prompts;
    return (
      <section className="mobile-interview mobile-interview-recap">
        <header className="mobile-interview-top">
          <button className="mobile-interview-back" type="button" onClick={exitSession} aria-label="Return to revision checklist">‹</button>
          <div><span className="mobile-interview-kicker">Session complete</span><h2>{trackLabel(session.track)} interview</h2></div>
          <button className="mobile-interview-text-button" type="button" onClick={discardSession}>New session</button>
        </header>
        <section className="mobile-interview-recap-card">
          <p className="mobile-interview-kicker">{session.finishedAt ? new Date(session.finishedAt).toLocaleString() : 'Completed'}</p>
          <h3>Your practice recap</h3>
          <div className="mobile-interview-stats">
            <div><strong>{formatDuration(elapsedSeconds)}</strong><span>time used</span></div>
            <div><strong>{answeredCount}</strong><span>answered</span></div>
            <div><strong>{skippedCount}</strong><span>skipped</span></div>
            <div><strong>{revealedCount}</strong><span>references</span></div>
          </div>
          <p>{session.prompts.length} prompts · {importantCount} marked important</p>
        </section>
        <div className="mobile-interview-recap-heading">
          <div><span className="mobile-interview-kicker">Review</span><h3>{importantOnly ? 'Important prompts' : 'Session prompts'}</h3></div>
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
              {prompt.note && <blockquote>{prompt.note}</blockquote>}
              {prompt.referenceRevealed && <small>Revision checklist reference was viewed.</small>}
            </li>
          ))}
          {prompts.length === 0 && <li className="mobile-interview-empty">No prompts were marked important in this session.</li>}
        </ol>
        <button className="primary-button mobile-interview-primary" type="button" onClick={discardSession}>Start another session</button>
      </section>
    );
  }

  if (session && currentPrompt) {
    const remaining = getMobileInterviewRemainingSeconds(session);
    const timeRemainingPercent = (remaining / currentPrompt.timeLimitSeconds) * 100;
    return (
      <section className="mobile-interview mobile-interview-active">
        <header className="mobile-interview-top">
          <button className="mobile-interview-back" type="button" onClick={exitSession} aria-label="Pause and return to revision checklist">‹</button>
          <div><span className="mobile-interview-kicker">{trackLabel(session.track)} interview</span><h2>{currentPrompt.sectionTitle}</h2></div>
          <button className="mobile-interview-icon-button" type="button" onClick={() => updatePrompt(currentPrompt.id, { important: !currentPrompt.important })} aria-pressed={currentPrompt.important} aria-label={currentPrompt.important ? 'Remove important mark' : 'Mark important'}>
            {currentPrompt.important ? '★' : '☆'}
          </button>
        </header>
        <div className="mobile-interview-timer-row">
          <span>Question {session.activeIndex + 1} of {session.prompts.length}</span>
          <strong className={remaining <= 15 ? 'mobile-interview-timer is-low' : 'mobile-interview-timer'} aria-live="off">{formatDuration(remaining)}</strong>
        </div>
        <div
          className={remaining <= 15 ? 'mobile-interview-timer-progress is-low' : 'mobile-interview-timer-progress'}
          role="progressbar"
          aria-label="Question time remaining"
          aria-valuenow={remaining}
          aria-valuemin={0}
          aria-valuemax={currentPrompt.timeLimitSeconds}
        >
          <span style={{ width: `${timeRemainingPercent}%` }} />
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
        {session.status === 'paused' && (
          <div className="mobile-interview-paused" role="status">
            <strong>Session paused</strong><span>The countdown is stopped. Resume when you’re ready.</span>
            <button className="primary-button" type="button" onClick={resumeSession}>Resume interview</button>
            <button className="mobile-interview-text-button" type="button" onClick={finishSessionEarly}>End session and view recap</button>
          </div>
        )}
        <article className="mobile-interview-prompt">
          <div className="mobile-interview-prompt-meta">
            <span>{currentPrompt.checklistTitle}</span>
            {currentPrompt.priority === 'high' && <strong>High priority</strong>}
          </div>
          <h3>{renderPrompt(currentPrompt)}</h3>
          <label className="mobile-interview-note">
            <span>Your answer notes <small>Private to this session</small></span>
            <textarea
              rows={5}
              value={currentPrompt.note}
              onChange={(event) => updatePrompt(currentPrompt.id, { note: event.target.value })}
              placeholder="Capture your answer or key points…"
              disabled={session.status === 'paused'}
            />
          </label>
          <div className="mobile-interview-prompt-tools">
            <button
              className={currentPrompt.answered ? 'mobile-interview-answer-button is-answered' : 'mobile-interview-answer-button'}
              type="button"
              aria-pressed={currentPrompt.answered}
              onClick={() => updatePrompt(currentPrompt.id, { answered: !currentPrompt.answered, skipped: false })}
              disabled={session.status === 'paused'}
            >
              {currentPrompt.answered ? '✓ Answered' : 'Mark answered'}
            </button>
            <button
              className="mobile-interview-text-button"
              type="button"
              aria-expanded={currentPrompt.referenceRevealed}
              onClick={() => updatePrompt(currentPrompt.id, { referenceRevealed: !currentPrompt.referenceRevealed })}
            >
              {currentPrompt.referenceRevealed ? 'Hide revision points' : 'Show revision points'}
            </button>
          </div>
          {currentPrompt.referenceRevealed && (
            <section className="mobile-interview-reference" aria-label="Revision checklist reference">
              <h4>From your revision checklist</h4>
              <ul>{currentPrompt.referenceItems.map((item) => <li key={item.id}>{renderPrompt(item)}</li>)}</ul>
            </section>
          )}
        </article>
        <footer className="mobile-interview-controls">
          <div className="mobile-interview-control-row">
            <button className="secondary-button" type="button" disabled={session.activeIndex === 0 || session.prompts[session.activeIndex - 1].timeExpired || session.status === 'paused'} onClick={() => moveTo(session.activeIndex - 1)}>Previous</button>
            <button className="secondary-button" type="button" onClick={session.status === 'running' ? pauseSession : resumeSession}>
              {session.status === 'running' ? 'Pause' : 'Resume'}
            </button>
            <button className="secondary-button mobile-interview-skip" type="button" disabled={session.status === 'paused'} onClick={skipCurrent}>Skip</button>
          </div>
          <button className="primary-button mobile-interview-primary" type="button" disabled={session.status === 'paused'} onClick={() => moveTo(session.activeIndex + 1)}>
            {session.activeIndex === session.prompts.length - 1 ? 'Finish interview' : 'Next question'}
          </button>
          <button className="mobile-interview-exit" type="button" onClick={finishSessionEarly}>End session and view recap</button>
          <button className="mobile-interview-exit" type="button" onClick={exitSession}>Pause and return to checklist</button>
        </footer>
        {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
      </section>
    );
  }

  return (
    <section className="mobile-interview mobile-interview-setup">
      <header className="mobile-interview-top">
        <button className="mobile-interview-back" type="button" onClick={exitSession} aria-label="Return to revision checklist">‹</button>
        <div><span className="mobile-interview-kicker">Phone-first practice</span><h2>Interview challenge</h2></div>
      </header>
      <p className="mobile-interview-intro">One question at a time. Practice aloud or write short notes, with a timer that you control.</p>
      <div className="mobile-interview-setup-card">
        <fieldset className="mobile-interview-track-select">
          <legend>Choose your interview track</legend>
          {(['kotlin', 'spring-boot'] as MobileInterviewTrack[]).map((option) => (
            <label key={option} className={track === option ? 'mobile-interview-track-option selected' : 'mobile-interview-track-option'}>
              <input type="radio" name="mobile-interview-track" value={option} checked={track === option} onChange={() => { setTrack(option); setSectionId('all'); setHighPriorityOnly(false); }} />
              <span><strong>{trackLabel(option)}</strong><small>{option === 'kotlin' ? 'Kotlin language and Kotlin + Spring topics' : 'Spring Boot, REST, data, security, and backend'}</small></span>
              <b aria-hidden="true">{track === option ? '✓' : '›'}</b>
            </label>
          ))}
        </fieldset>
        <label className="mobile-interview-field"><span>Topic</span>
          <select value={sectionId} onChange={(event) => setSectionId(event.target.value)}>
            <option value="all">All topics</option>
            {topicOptions.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
          </select>
        </label>
        <fieldset className="mobile-interview-duration">
          <legend>Time limit</legend>
          <div>{durationOptions.map((minutes) => (
            <button key={minutes} type="button" className={durationMinutes === minutes ? 'selected' : ''} aria-pressed={durationMinutes === minutes} onClick={() => setDurationMinutes(minutes)}>
              <strong>{minutes}</strong><span>min</span>
            </button>
          ))}</div>
        </fieldset>
        <label className="mobile-interview-priority-filter">
          <input type="checkbox" checked={highPriorityOnly} onChange={(event) => setHighPriorityOnly(event.target.checked)} />
          <span>High-priority prompts only</span>
        </label>
        <div className="mobile-interview-available"><strong>{availablePrompts.length}</strong><span>{availablePrompts.length === 1 ? 'prompt available' : 'prompts available'}</span></div>
        {plannedPromptCount > 0 && (
          <p className="mobile-interview-round-size">
            This round includes up to {plannedPromptCount} prompts, with {formatDuration(Math.ceil(durationMinutes * 60 / plannedPromptCount))} for each question.
          </p>
        )}
        <button className="primary-button mobile-interview-primary" type="button" onClick={beginSession} disabled={plannedPromptCount === 0}>Start {plannedPromptCount}-question interview</button>
        {availablePrompts.length === 0 && <p className="mobile-interview-empty">No checklist prompts match these filters. Choose another topic or turn off the priority filter.</p>}
      </div>
      <p className="mobile-interview-source-note">Prompts come directly from your Revision Checklist. Practice notes stay separate from checklist completion.</p>
      {storageError && <p className="mobile-interview-storage-error" role="alert">{storageError}</p>}
    </section>
  );
}

function trackLabel(track: MobileInterviewTrack): string {
  return track === 'kotlin' ? 'Kotlin' : 'Spring Boot';
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function renderPrompt(item: Pick<MobileInterviewPrompt, 'text' | 'codeTerms'>) {
  if (!item.codeTerms?.length) return item.text;
  const escapedTerms = [...item.codeTerms].sort((first, second) => second.length - first.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = item.text.split(new RegExp(`(${escapedTerms.join('|')})`, 'g'));
  return parts.map((part, index) => item.codeTerms?.includes(part) ? <code key={`${part}-${index}`}>{part}</code> : part);
}
