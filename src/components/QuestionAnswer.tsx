import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { InterviewQuestion } from '../data/interview-question-bank';

const sourceImageUrls = import.meta.glob('../../Files/Checklist/Android/Interview Questions Android/images/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const sourceImagesByName = new Map(
  Object.entries(sourceImageUrls).map(([path, url]) => [(path.split('/').pop() ?? '').toLowerCase(), url]),
);
const sourceImagesByBaseName = new Map(
  [...sourceImagesByName].map(([name, url]) => [name.replace(/\.[^.]+$/, '').toLowerCase(), url]),
);
const sourceImagePathPattern = /^\/interview-source-image\/(image\d+\.(?:png|jpe?g|gif|webp))$/i;

function getSourceImageUrl(imageName: string): string | undefined {
  const normalizedName = imageName.split(/[\\/]/).pop()?.toLowerCase();
  if (!normalizedName) return undefined;
  return sourceImagesByName.get(normalizedName)
    ?? sourceImagesByBaseName.get(normalizedName.replace(/\.[^.]+$/, ''));
}

function missingSourceImage(imageName: string) {
  return (
    <span className="question-answer-image-missing" role="img" aria-label={`Image unavailable: ${imageName}`}>
      Image unavailable
    </span>
  );
}

export default function QuestionAnswer({ question }: { question: InterviewQuestion }) {
  if (!question.hasAnswer) return <p className="question-no-answer">No answer has been added for this question yet.</p>;

  if (question.answerHtml) {
    const answerHtml = question.answerHtml.replace(
      /<img\b[^>]*>/gi,
      (imageTag) => {
        const source = imageTag.match(/\bsrc\s*=\s*(["'])\/interview-source-image\/(image\d+\.(?:png|jpe?g|gif|webp))\1/i);
        if (!source) return imageTag;
        const [, , imageName] = source;
        const imageSrc = getSourceImageUrl(imageName);
        if (!imageSrc) return `<span class="question-answer-image-missing" role="img" aria-label="Image unavailable: ${imageName}">Image unavailable</span>`;
        return imageTag.replace(source[0], `src="${imageSrc}"`);
      },
    );
    return (
      <div
        className="question-answer-content"
        dangerouslySetInnerHTML={{
          __html: answerHtml.replace(/<a(?=\s|>)/gi, '<a target="_blank" rel="noopener noreferrer"'),
        }}
      />
    );
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
            const imageName = src?.match(sourceImagePathPattern)?.[1];
            const imageSrc = imageName ? getSourceImageUrl(imageName) : src;
            if (imageName && !imageSrc) return missingSourceImage(imageName);
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