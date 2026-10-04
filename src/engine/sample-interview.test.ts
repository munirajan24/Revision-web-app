import { describe, expect, it } from 'vitest';
import { buildInterviewEvaluationPrompt, generateSampleInterview } from './sample-interview';
import type { InterviewQuestion } from '../data/interview-question-bank';

describe('sample interview selection', () => {
  it('balances generated sessions across categories and avoids duplicate questions', () => {
    const makeQuestion = (id: string, categoryId: InterviewQuestion['categoryId']): InterviewQuestion => ({
      id,
      categoryId,
      category: categoryId,
      prompt: id,
      answerMarkdown: 'Answer',
      hasAnswer: true,
      hasAddedAnswer: false,
      hasAdditionalNotes: false,
    });
    const questions = [
      makeQuestion('K1', 'kotlin'), makeQuestion('K2', 'kotlin'), makeQuestion('K3', 'kotlin'),
      makeQuestion('A1', 'android'), makeQuestion('A2', 'android'), makeQuestion('A3', 'android'),
      makeQuestion('J1', 'java'), makeQuestion('J2', 'java'), makeQuestion('J3', 'java'),
    ];
    const session = generateSampleInterview(questions, ['kotlin', 'android', 'java'], 6, () => 0.5);
    const counts = session.reduce<Record<string, number>>((result, question) => {
      result[question.categoryId] = (result[question.categoryId] ?? 0) + 1;
      return result;
    }, {});

    expect(session).toHaveLength(6);
    expect(new Set(session.map((question) => question.id)).size).toBe(6);
    expect(counts).toEqual({ kotlin: 2, android: 2, java: 2 });
  });

  it('always excludes questions without answers', () => {
    const questions: InterviewQuestion[] = [
      { id: 'A1', categoryId: 'android', category: 'Android', prompt: 'Answered?', answerMarkdown: 'Yes', hasAnswer: true, hasAddedAnswer: false, hasAdditionalNotes: false },
      { id: 'A2', categoryId: 'android', category: 'Android', prompt: 'Unanswered?', answerMarkdown: '', hasAnswer: false, hasAddedAnswer: false, hasAdditionalNotes: false },
    ];

    expect(generateSampleInterview(questions, ['android'], 5).map((question) => question.id)).toEqual(['A1']);
  });

  it('builds a complete AI grading prompt with typo and code evaluation guidance', () => {
    const question: InterviewQuestion = {
      id: 'K001',
      categoryId: 'kotlin',
      category: 'Kotlin',
      prompt: 'What is Kotlin?',
      answerMarkdown: 'A statically typed language.',
      hasAnswer: true,
      hasAddedAnswer: false,
      hasAdditionalNotes: false,
    };
    const prompt = buildInterviewEvaluationPrompt([question], { K001: 'A staticly typed language.' });

    expect(prompt).toContain('score from 0 to 10');
    expect(prompt).toContain('Ignore ordinary spelling, punctuation, and grammar mistakes in prose');
    expect(prompt).toContain('Do not ignore mistakes in code');
    expect(prompt).toContain('**My answer:**\nA staticly typed language.');
    expect(prompt).toContain('**Reference answer:**\nA statically typed language.');
    expect(prompt).toContain('total score out of 10');
  });
});