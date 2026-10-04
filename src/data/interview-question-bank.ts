export type QuestionCategoryId = 'java' | 'kotlin' | 'android' | 'testing' | 'general';

export interface InterviewQuestion {
  id: string;
  categoryId: QuestionCategoryId;
  category: string;
  prompt: string;
  answerMarkdown: string;
  hasAnswer: boolean;
  hasAddedAnswer: boolean;
  hasAdditionalNotes: boolean;
}

const markdownSources = import.meta.glob('../../Files/Checklist/Android/Question bank/Interview_QA_Java_Kotlin_Android.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const sourceMarkdown = Object.values(markdownSources)[0] ?? '';

export const interviewQuestions = parseInterviewQuestionMarkdown(sourceMarkdown);

export function parseInterviewQuestionMarkdown(markdown: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  let category: { id: QuestionCategoryId; title: string } | undefined;
  let current: Omit<InterviewQuestion, 'answerMarkdown' | 'hasAnswer' | 'hasAddedAnswer' | 'hasAdditionalNotes'> | undefined;
  let answerLines: string[] = [];
  let readingAnswer = false;
  let codeFence: { character: string; length: number } | undefined;

  const finishQuestion = () => {
    if (!current || !category) return;

    const answerMarkdown = answerLines.join('\n').trim();
    questions.push({
      ...current,
      answerMarkdown,
      hasAnswer: answerMarkdown.length > 0,
      hasAddedAnswer: />\s*✦\s*\*\*Added answer\*\*/i.test(answerMarkdown),
      hasAdditionalNotes: />\s*✦\s*\*\*Additional notes\*\*/i.test(answerMarkdown),
    });
  };

  for (const line of markdown.split(/\r?\n/)) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (codeFence) {
      if (readingAnswer) answerLines.push(line);
      if (fence && fence[1][0] === codeFence.character && fence[1].length >= codeFence.length) codeFence = undefined;
      continue;
    }
    if (fence) {
      if (readingAnswer) answerLines.push(line);
      codeFence = { character: fence[1][0], length: fence[1].length };
      continue;
    }

    const categoryHeading = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (categoryHeading) {
      finishQuestion();
      current = undefined;
      answerLines = [];
      readingAnswer = false;
      category = getCategory(categoryHeading[1]);
      continue;
    }

    const questionHeading = line.match(/^###\s+([A-Z]\d{3})\.\s+(.+?)\s*$/);
    if (questionHeading) {
      finishQuestion();
      current = category ? {
        id: questionHeading[1],
        categoryId: category.id,
        category: category.title,
        prompt: questionHeading[2],
      } : undefined;
      answerLines = [];
      readingAnswer = false;
      continue;
    }

    if (/^Answer:\s*$/.test(line)) {
      readingAnswer = true;
      continue;
    }

    if (readingAnswer) answerLines.push(line);
  }

  finishQuestion();
  return questions;
}

function getCategory(title: string): { id: QuestionCategoryId; title: string } | undefined {
  const normalized = title.toLowerCase();
  if (normalized === 'java') return { id: 'java', title };
  if (normalized === 'kotlin') return { id: 'kotlin', title };
  if (normalized === 'android') return { id: 'android', title };
  if (normalized.includes('testing')) return { id: 'testing', title };
  if (normalized.includes('general')) return { id: 'general', title };
  return undefined;
}