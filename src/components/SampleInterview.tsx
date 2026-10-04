import { useEffect, useState } from 'react';
import { interviewQuestions, type InterviewQuestion, type QuestionCategoryId } from '../data/interview-question-bank';
import { buildInterviewEvaluationPrompt, generateSampleInterview } from '../engine/sample-interview';
import QuestionAnswer from './QuestionAnswer';

const categoryOptions: Array<{ id: QuestionCategoryId; label: string }> = [
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'android', label: 'Android' },
  { id: 'java', label: 'Java' },
  { id: 'testing', label: 'Testing & Others' },
  { id: 'general', label: 'General / HR' },
];
const questionCountOptions = Array.from({ length: 10 }, (_, index) => (index + 1) * 10);

export default function SampleInterview() {
  const [categories, setCategories] = useState<QuestionCategoryId[]>(['kotlin', 'android']);
  const [questionCount, setQuestionCount] = useState(10);
  const [session, setSession] = useState<InterviewQuestion[] | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [revealedReferenceIds, setRevealedReferenceIds] = useState<Set<string>>(() => new Set());
  const [copyStatus, setCopyStatus] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!session || finished) return undefined;
    const interval = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [finished, session]);

  const beginSession = (questions: InterviewQuestion[], title: string) => {
    if (questions.length === 0) return;
    setSession(questions);
    setSessionTitle(title);
    setCurrentIndex(0);
    setShowAnswer(false);
    setDraftAnswers({});
    setRevealedReferenceIds(new Set());
    setCopyStatus('');
    setElapsedSeconds(0);
    setFinished(false);
  };

  const startGenerated = () => beginSession(
    generateSampleInterview(interviewQuestions, categories, questionCount),
    'Generated interview',
  );

  const currentQuestion = session?.[currentIndex];
  const moveTo = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
  };

  if (session && finished) {
    const writtenAnswerCount = session.filter((question) => draftAnswers[question.id]?.trim()).length;
    const selectedTopics = [...new Set(session.map((question) => question.category))];

    const toggleReferenceAnswer = (questionId: string) => {
      setRevealedReferenceIds((current) => {
        const next = new Set(current);
        if (next.has(questionId)) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
    };

    const copyInterviewForAi = async () => {
      try {
        await navigator.clipboard.writeText(buildInterviewEvaluationPrompt(session, draftAnswers));
        setCopyStatus('Copied. Paste it into your AI assistant.');
      } catch {
        setCopyStatus('Copy failed. Check clipboard permissions and try again.');
      }
    };

    return (
      <section className="sample-interview">
        <div className="interview-finish-heading">
          <div>
            <p className="eyebrow">Interview complete</p>
            <h2>{sessionTitle}</h2>
            <p className="interview-finish-count">{session.length} questions</p>
            <p className="interview-finish-topics"><span>Topics</span> {selectedTopics.join(', ')}</p>
          </div>
          <div className="interview-finish-actions">
            <button className="primary-button" type="button" onClick={() => setSession(null)}>New interview</button>
            <button className="secondary-button" type="button" onClick={copyInterviewForAi}>Copy Q&A for AI</button>
            <span className="interview-copy-status" aria-live="polite">{copyStatus}</span>
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>
        <div className="interview-summary-stats">
          <div><strong>{writtenAnswerCount}</strong><span>written</span></div>
          <div><strong>{session.length - writtenAnswerCount}</strong><span>blank</span></div>
        </div>
        <h3 className="interview-recap-heading">Answer recap</h3>
        <ul className="interview-answer-recap">
          {session.map((question) => {
            const writtenAnswer = draftAnswers[question.id]?.trim();
            const isReferenceShown = revealedReferenceIds.has(question.id);

            return (
              <li key={question.id}>
                <details className="interview-answer-recap-entry">
                  <summary>
                    <span className="interview-recap-question">
                      <strong className="revision-question-id">{question.id}</strong>
                      <span>{question.prompt}</span>
                    </span>
                    <span className={writtenAnswer ? 'interview-recap-status answered' : 'interview-recap-status'}>
                      {writtenAnswer ? 'Written' : 'Blank'}
                    </span>
                  </summary>
                  <div className="interview-recap-content">
                    <h4>Your answer</h4>
                    <p className={writtenAnswer ? 'interview-recap-response' : 'interview-recap-response empty'}>
                      {writtenAnswer || 'No written response.'}
                    </p>
                    <button className="secondary-button" type="button" onClick={() => toggleReferenceAnswer(question.id)} aria-expanded={isReferenceShown}>
                      {isReferenceShown ? 'Hide reference answer' : 'Reveal reference answer'}
                    </button>
                    {isReferenceShown && <QuestionAnswer question={question} />}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  if (session && currentQuestion) {
    return (
      <section className="sample-interview">
        <div className="interview-session-header">
          <div><p className="eyebrow">{sessionTitle}</p><h2>{currentQuestion.category}</h2></div>
          <div className="interview-session-meta"><span>{currentIndex + 1} / {session.length}</span><strong>{formatDuration(elapsedSeconds)}</strong></div>
        </div>
        <div className="interview-session-progress" role="progressbar" aria-label="Interview progress" aria-valuenow={currentIndex + 1} aria-valuemin={0} aria-valuemax={session.length}>
          <span style={{ width: `${((currentIndex + 1) / session.length) * 100}%` }} />
        </div>
        <article className="interview-prompt">
          <span className="revision-question-id">{currentQuestion.id}</span>
          <h3>{currentQuestion.prompt}</h3>
          <label className="interview-answer-draft">
            <span>Your answer</span>
            <textarea
              rows={6}
              value={draftAnswers[currentQuestion.id] ?? ''}
              onChange={(event) => setDraftAnswers((current) => ({ ...current, [currentQuestion.id]: event.target.value }))}
              placeholder="Type your response..."
            />
          </label>
          <button className="secondary-button" type="button" onClick={() => setShowAnswer((shown) => !shown)} aria-expanded={showAnswer}>
            {showAnswer ? 'Hide answer' : 'Reveal answer'}
          </button>
          {showAnswer && <QuestionAnswer question={currentQuestion} />}
        </article>
        <div className="interview-navigation-row">
          <button className="secondary-button" type="button" disabled={currentIndex === 0} onClick={() => moveTo(currentIndex - 1)}>Previous</button>
          {currentIndex < session.length - 1 ? (
            <button className="primary-button" type="button" onClick={() => moveTo(currentIndex + 1)}>Next question</button>
          ) : (
            <button className="primary-button" type="button" onClick={() => setFinished(true)}>Finish interview</button>
          )}
          <button className="interview-finish-early" type="button" onClick={() => setFinished(true)}>Finish now</button>
        </div>
      </section>
    );
  }

  return (
    <section className="sample-interview interview-setup">
      <div className="interview-setup-intro">
        <p className="eyebrow">Question practice</p>
        <h2>Run a sample interview</h2>
        <p>Answer aloud or in writing, reveal the reference answer when you’re ready, then mark what to revisit.</p>
      </div>
      <div className="interview-setup-grid">
        <section className="interview-setup-section">
          <h3>Sample interview</h3>
          <div className="interview-category-options">
            {categoryOptions.map((category) => (
              <label key={category.id}>
                <input type="checkbox" checked={categories.includes(category.id)} onChange={(event) => setCategories((current) => event.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id))} />
                {category.label}
              </label>
            ))}
          </div>
          <div className="interview-generator-controls">
            <label><span>Questions</span><select value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))}>{questionCountOptions.map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
          </div>
          <button className="secondary-button" type="button" disabled={categories.length === 0} onClick={startGenerated}>Generate interview</button>
        </section>
      </div>
    </section>
  );
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}