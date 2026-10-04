import { describe, expect, it } from 'vitest';
import { interviewQuestions, parseInterviewQuestionMarkdown } from './interview-question-bank';

describe('interview question bank', () => {
  it('loads all 488 questions with unique stable IDs across five categories', () => {
    expect(interviewQuestions).toHaveLength(488);
    expect(new Set(interviewQuestions.map((question) => question.id)).size).toBe(488);
    expect(new Set(interviewQuestions.map((question) => question.categoryId))).toEqual(
      new Set(['java', 'kotlin', 'android', 'testing', 'general']),
    );
    expect(interviewQuestions[0]).toMatchObject({ id: 'J001', categoryId: 'java' });
    expect(interviewQuestions.find((question) => question.id === 'K001')?.categoryId).toBe('kotlin');
    expect(interviewQuestions.find((question) => question.id === 'A001')?.categoryId).toBe('android');
    expect(interviewQuestions.find((question) => question.id === 'T001')?.categoryId).toBe('testing');
    expect(interviewQuestions.find((question) => question.id === 'G001')?.categoryId).toBe('general');
  });

  it('preserves answer Markdown and identifies supplemental answer labels', () => {
    const source = [
      '## Kotlin',
      '### K001. What is Kotlin?',
      'Answer:',
      '> ✦ **Added answer**',
      '',
      '| Feature | Meaning |',
      '| --- | --- |',
      '| `val` | Read-only |',
      '',
      '```kotlin',
      'val answer = "yes"',
      '```',
      '### K002. Explain Flow?',
      'Answer:',
      '> ✦ **Additional notes**',
      'A cold asynchronous stream.',
    ].join('\n');

    expect(parseInterviewQuestionMarkdown(source)).toEqual([
      expect.objectContaining({
        id: 'K001',
        categoryId: 'kotlin',
        prompt: 'What is Kotlin?',
        hasAnswer: true,
        hasAddedAnswer: true,
        hasAdditionalNotes: false,
        answerMarkdown: expect.stringContaining('```kotlin\nval answer = "yes"\n```'),
      }),
      expect.objectContaining({
        id: 'K002',
        hasAnswer: true,
        hasAddedAnswer: false,
        hasAdditionalNotes: true,
      }),
    ]);
  });

  it('keeps unanswered questions and supports all category headings', () => {
    const source = [
      '## Testing & Others',
      '### T001. What is a test?',
      'Answer:',
      '',
      '## General / Project / HR',
      '### G001. Tell me about yourself?',
      'Answer:',
      '> ✦ **Additional notes**',
      'Personal question.',
    ].join('\n');
    const questions = parseInterviewQuestionMarkdown(source);

    expect(questions[0]).toMatchObject({ id: 'T001', categoryId: 'testing', hasAnswer: false, answerMarkdown: '' });
    expect(questions[1]).toMatchObject({ id: 'G001', categoryId: 'general', hasAnswer: true });
  });
});