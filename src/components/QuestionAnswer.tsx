import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { InterviewQuestion } from '../data/interview-question-bank';

export default function QuestionAnswer({ question }: { question: InterviewQuestion }) {
  if (!question.hasAnswer) return <p className="question-no-answer">No answer has been added for this question yet.</p>;

  const answerMarkdown = question.answerMarkdown
    .replace(/^>\s*✦\s*\*\*Added answer\*\*\s*$/gm, '')
    .replace(/^>\s*✦\s*\*\*Additional notes\*\*\s*$/gm, '')
    .trim();

  return (
    <div className="question-answer-content">
      {(question.hasAddedAnswer || question.hasAdditionalNotes) && (
        <div className="answer-source-labels">
          {question.hasAddedAnswer && <span className="answer-source-label">Supplemental answer</span>}
          {question.hasAdditionalNotes && <span className="answer-source-label">Supplemental notes</span>}
        </div>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{answerMarkdown}</ReactMarkdown>
    </div>
  );
}