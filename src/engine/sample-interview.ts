import type { InterviewQuestion, QuestionCategoryId } from '../data/interview-question-bank';

export function generateSampleInterview(
  questions: InterviewQuestion[],
  categories: QuestionCategoryId[],
  count: number,
  random: () => number = Math.random,
): InterviewQuestion[] {
  if (count <= 0 || categories.length === 0) return [];

  const categoryGroups = categories.map((categoryId) => shuffle(
    questions.filter((question) => question.categoryId === categoryId && question.hasAnswer),
    random,
  ));
  const selected: InterviewQuestion[] = [];

  while (selected.length < count) {
    let addedQuestion = false;
    for (const group of categoryGroups) {
      const question = group.pop();
      if (!question) continue;
      selected.push(question);
      addedQuestion = true;
      if (selected.length === count) break;
    }
    if (!addedQuestion) break;
  }

  return selected;
}

export function buildInterviewEvaluationPrompt(
  questions: InterviewQuestion[],
  draftAnswers: Record<string, string>,
): string {
  const questionSections = questions.map((question) => {
    const response = draftAnswers[question.id]?.trim() || 'No written response.';
    const reference = question.answerMarkdown.trim() || 'No reference answer available.';

    return [
      `## ${question.id} - ${question.category}`,
      `**Question:** ${question.prompt}`,
      `**My answer:**\n${response}`,
      `**Reference answer:**\n${reference}`,
    ].join('\n\n');
  });

  return [
    '# Technical Interview Evaluation',
    'Evaluate my responses against each question and its reference answer.',
    '',
    'For each question:',
    '- Give a score from 0 to 10 based on technical correctness, completeness, and clarity.',
    '- State the major corrections or missing concepts. Do not rewrite answers that are already correct just for style.',
    '- Ignore ordinary spelling, punctuation, and grammar mistakes in prose when the meaning is clear.',
    '- Do not ignore mistakes in code: check spelling of identifiers and API names, syntax, and behavior.',
    '- If no written response is provided, score it 0 and say what a good answer should cover.',
    '',
    `At the end, give the total score out of ${questions.length * 10} and a brief overall assessment.`,
    '',
    ...questionSections,
  ].join('\n');
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}