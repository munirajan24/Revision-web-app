import { describe, expect, it } from 'vitest';
import { interviewQuestions } from './interview-question-bank';
import { getMobileCodingQuestionBank, getMobileQuestionBank, getMobileQuestionSets } from './mobile-interview-bank';
import { getProblemExamples, getProblemSolutions, problems } from './roadmap';

describe('mobile interview question bank', () => {
  const questions = getMobileQuestionBank();
  const programmingCodingQuestions = questions.filter((question) => question.codingQuestion);
  const codingQuestions = getMobileCodingQuestionBank();
  const sets = getMobileQuestionSets(questions);
  const codingSets = getMobileQuestionSets([...questions, ...codingQuestions]);

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

  it('adds Kotlin and Java coding sets from problems with examples and solutions', () => {
    expect(codingQuestions).toHaveLength(240);
    expect(codingQuestions.filter((question) => question.setTitle === 'Kotlin Coding')).toHaveLength(120);
    expect(codingQuestions.filter((question) => question.setTitle === 'Java Coding')).toHaveLength(120);
    expect(codingQuestions[0]).toMatchObject({
      sectionTitle: 'Kotlin Coding',
      codingProblemId: 1,
      codingLanguage: 'kotlin',
    });
    expect(codingQuestions[0].answer).toBeTruthy();
    expect(codingSets.find((set) => set.title === 'Kotlin Coding')?.sections[0].questionCount).toBe(120);
  });

  it('returns the missing number as a scalar in both language references', () => {
    const problem = problems.find((item) => item.id === 24);

    expect(problem?.title).toBe('Find missing number from 1 to N');
    expect(problem && getProblemExamples(problem)).toEqual([
      { input: '[1, 2, 4, 5]', output: '3' },
    ]);
    expect(problem && getProblemSolutions(problem, 'kotlin')[0].code).toContain('): Int');
    expect(problem && getProblemSolutions(problem, 'kotlin')[0].code).toContain('expectedSum - actualSum');
    expect(problem && getProblemSolutions(problem, 'java')[0].code).toContain('public static int findMissingNumberFrom1ToN');
  });

  it('uses examples whose outputs match the described roadmap operation', () => {
    const exampleFor = (id: number) => getProblemExamples(problems.find((problem) => problem.id === id)!)[0];

    expect(exampleFor(20)).toEqual({ input: '[1, 2, 3, 4]', output: '[4, 3, 2, 1]' });
    expect(exampleFor(23)).toEqual({ input: '[1, 2, 2, 3]', output: '[2]' });
    expect(exampleFor(36)).toEqual({ input: '"banana"', output: '{b=1, a=3, n=2}' });
    expect(exampleFor(39)).toEqual({ input: '[1, 2, 2, 3]', output: '[2]' });
    expect(exampleFor(44)).toEqual({ input: '"banana"', output: '"a"' });
    expect(exampleFor(52)).toEqual({ input: 'expected = "abcde", actual = "abce"', output: 'd' });
    expect(exampleFor(64)).toEqual({ input: '"cat dog cat bird dog cat"', output: '["cat", "dog", "bird"]' });
    expect(exampleFor(89)).toEqual({ input: '["eat", "tea", "tan"]', output: '{aet=[eat, tea], ant=[tan]}' });
    expect(exampleFor(83)).toEqual({ input: '"banana"', output: '[b, a, n]' });
    expect(exampleFor(31)).toEqual({ input: 'numbers = [2, 7, 11, 15], target = 9', output: '[[2, 7]]' });
    expect(exampleFor(68)).toEqual({ input: 'numbers = [1, 4, 9, 12], target = 6', output: '4' });
    expect(exampleFor(101)).toEqual({ input: '1 -> 2 -> 3 -> null', output: '[3, 2, 1]' });
    expect(exampleFor(105)).toEqual({ input: 'numbers = [1, 3, 5, 7], target = 5', output: '2' });
  });

  it('routes the Programming Kotlin and Java coding sections to the coding experience', () => {
    expect(programmingCodingQuestions).toHaveLength(242);
    const kotlin = programmingCodingQuestions.find((question) => question.sectionTitle === 'Kotlin basic coding');
    const java = programmingCodingQuestions.find((question) => question.sectionTitle === 'Java basic coding');
    const kotlinReverse = programmingCodingQuestions.find((question) => (
      question.sectionTitle === 'Kotlin basic coding' && question.text.includes('Reverse a String')
    ));

    expect(kotlin?.codingQuestion).toMatchObject({
      language: 'kotlin',
      title: 'Count Unique Elements',
      examples: [{ input: 'val myList = listOf(1, 2, 3, 2, 3, 4)', output: '4' }],
    });
    expect(kotlin?.codingQuestion?.solutions.kotlin[0].code).toContain('myList.distinct().size');
    expect(kotlin?.codingQuestion?.solutions.java[0].code).toContain('myList');
    expect(java?.codingQuestion?.language).toBe('java');
    expect(kotlinReverse?.codingQuestion?.solutions.kotlin.length).toBeGreaterThan(1);
    expect(kotlinReverse?.codingQuestion?.solutions.java.length).toBeGreaterThan(1);
  });
});
