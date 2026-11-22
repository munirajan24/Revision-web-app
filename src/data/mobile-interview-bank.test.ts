import { describe, expect, it } from 'vitest';
import { interviewQuestions } from './interview-question-bank';
import { getMobileQuestionBank, getMobileQuestionSets } from './mobile-interview-bank';

describe('mobile interview question bank', () => {
  const questions = getMobileQuestionBank();
  const sets = getMobileQuestionSets(questions);

  it('uses the complete revision source questions and answers in source order', () => {
    expect(questions).toHaveLength(interviewQuestions.length);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(questions[0]).toMatchObject({
      setTitle: 'Java',
      sectionTitle: 'Platform Questions',
      text: interviewQuestions[0].prompt,
      answer: interviewQuestions[0].answerMarkdown,
      source: 'Complete Revision',
    });
  });

  it('keeps Mobile Interview question IDs stable when another source question is inserted', () => {
    const targetQuestion = interviewQuestions[20];
    const insertedQuestion = {
      ...targetQuestion,
      id: 'inserted-question',
      prompt: 'A newly inserted question before an existing question',
    };
    const updatedQuestions = getMobileQuestionBank([
      ...interviewQuestions.slice(0, 10),
      insertedQuestion,
      ...interviewQuestions.slice(10),
    ]);
    const originalId = questions.find((question) => question.text === targetQuestion.prompt)?.id;
    const updatedId = updatedQuestions.find((question) => question.text === targetQuestion.prompt)?.id;

    expect(updatedId).toBe(originalId);
  });

  it('groups major technologies above their source subsections', () => {
    const kotlin = sets.find((set) => set.title === 'Kotlin');
    const android = sets.find((set) => set.title === 'Android');
    const originalSets = sets.find((set) => set.title === 'Original interview sets');

    expect(kotlin?.sections.map((section) => section.title)).toContain('Coroutines');
    expect(android?.sections.length).toBeGreaterThan(1);
    expect(originalSets?.sections).toHaveLength(11);
    expect(originalSets?.sections.some((section) => section.title.startsWith('Set 1'))).toBe(true);
  });

  it('keeps section counts consistent with the shared question bank', () => {
    const sectionTotal = sets.reduce((total, set) => (
      total + set.sections.reduce((setTotal, section) => setTotal + section.questionCount, 0)
    ), 0);

    expect(sectionTotal).toBe(interviewQuestions.length);
  });
});
