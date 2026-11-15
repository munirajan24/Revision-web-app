import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { InterviewQuestion } from '../data/interview-question-bank';

const sourceImageUrls = import.meta.glob('../../Files/Checklist/Android/Interview Questions Android/images/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const sourceImagesByName = new Map(
  Object.entries(sourceImageUrls).map(([path, url]) => [path.split('/').pop() ?? '', url]),
);

export default function QuestionAnswer({ question }: { question: InterviewQuestion }) {
  if (!question.hasAnswer) return <p className="question-no-answer">No answer has been added for this question yet.</p>;

  if (question.answerHtml) {
    const answerHtml = question.answerHtml.replace(
      /src="\/interview-source-image\/(image\d+\.(?:png|jpe?g|gif|webp))"/gi,
      (_match, imageName: string) => {
        const imageSrc = sourceImagesByName.get(imageName);
        if (!imageSrc) throw new Error(`Missing interview source image: ${imageName}`);
        return `src="${imageSrc}"`;
      },
    );
    return <div className="question-answer-content" dangerouslySetInnerHTML={{ __html: answerHtml }} />;
  }

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt, ...props }) => {
            const imageName = src?.match(/^\/interview-source-image\/(image\d+\.png)$/)?.[1];
            const imageSrc = imageName ? sourceImagesByName.get(imageName) : src;
            if (imageName && !imageSrc) throw new Error(`Missing interview source image: ${imageName}`);
            if (!imageSrc) return null;
            return <img {...props} src={imageSrc} alt={alt ?? ''} loading="lazy" />;
          },
        }}
      >
        {answerMarkdown}
      </ReactMarkdown>
    </div>
  );
}