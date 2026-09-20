import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getLearningFlow, getProblemExamples, getProblemHintsForLanguage, getProblemRecommendation, getProblemSolution, getProblemSolutions, getQuestionIndexByTopic, getSolutionComplexity, getSolutionFlow, getVariantNote, loadProblemSolutions, loadQuestionsByTopic, loadTopicIndex, problems, topicIndex, validateGeneratedSolutionCode } from '../data/roadmap';
import { getSolutionFileName } from '../data/question-solution-loader';
import { calculateMastery, getNextReviewDate } from './mastery';

describe('calculateMastery', () => {
  it('returns mastered status for a high score', () => {
    const result = calculateMastery({
      correctness: 95,
      speed: 90,
      independence: 90,
      repeatedSuccess: 85,
      explanation: 80,
      hints: 100,
    });

    expect(result.status).toBe('mastered');
    expect(result.score).toBeGreaterThan(85);
  });

  it('returns not_started status for a low score', () => {
    const result = calculateMastery({
      correctness: 25,
      speed: 20,
      independence: 10,
      repeatedSuccess: 10,
      explanation: 20,
      hints: 60,
    });

    expect(result.status).toBe('not_started');
  });
});

describe('getNextReviewDate', () => {
  it('schedules same-day retry after failure', () => {
    const date = getNextReviewDate({ success: false, hintsUsed: 0, confidence: 1, currentReviewAt: '2026-09-18T00:00:00.000Z' });
    expect(new Date(date).toISOString()).toBe('2026-09-18T00:00:00.000Z');
  });

  it('schedules one-day recall after success with hints', () => {
    const date = getNextReviewDate({ success: true, hintsUsed: 1, confidence: 3, currentReviewAt: '2026-09-18T00:00:00.000Z' });
    expect(new Date(date).toISOString()).toBe('2026-09-19T00:00:00.000Z');
  });
});

describe('solution recommendation logic', () => {
  it('derives recommendations from code patterns instead of a label-only switch', () => {
    expect(getProblemRecommendation('Basic Solution', 'return input.filter { it > 0 }.sorted()')).toBe('Best');
    expect(getProblemRecommendation('Stream API', 'input.asSequence().filter { it > 0 }.sorted().toList()')).toBe('Good to try');
    expect(getProblemRecommendation('Stream API', 'input.stream().flatMap(...).distinct().collect(...)')).toBe('Avoid unless needed');
    expect(getVariantNote('Stream API', 'input.stream().flatMap(...).distinct().collect(...)')).toContain('flatMap');
    expect(getVariantNote('Basic Solution', 'return input.filter { it > 0 }.sorted()')).toContain('cleanest');
    expect(getProblemSolutions(problems[0], 'kotlin')[3].recommendation).toBe('Good to try');
  });

  it('rejects placeholder generator fallbacks that only return the input or a hardcoded boolean', () => {
    problems.forEach((problem) => {
      const kotlin = getProblemSolutions(problem, 'kotlin');
      const java = getProblemSolutions(problem, 'java');

      [...kotlin, ...java].forEach((variant) => {
        expect(variant.code).not.toMatch(/(?:^|\n)\s*return\s+input\s*(?:;|\n|\})/i);
        expect(variant.code).not.toMatch(/(?:^|\n)\s*return\s+false\s*(?:;|\n|\})/i);
        expect(variant.code).not.toMatch(/(?:^|\n)\s*return\s+new\s+ArrayList<>\(input\)\s*(?:;|\n|\})/i);
      });
    });
  });

  it('uses title-aware implementations for common interview problems instead of generic placeholders', () => {
    const reverseProblem = problems.find((problem) => problem.title === 'Reverse a String');
    const twoSumProblem = problems.find((problem) => problem.title === 'Two Sum');
    const largestProblem = problems.find((problem) => problem.title === 'Find largest number');

    expect(reverseProblem?.solutions?.kotlin?.[0].code).toContain('reversed()');
    expect(twoSumProblem?.solutions?.kotlin?.[0].code).toContain('mutableMapOf');
    expect(largestProblem?.solutions?.java?.[0].code).toContain('Collections.max');
  });
});

describe('getProblemSolution', () => {
  it('returns real language-specific solution templates instead of placeholder fallback text', () => {
    const problem = problems[0];
    const javaSolution = getProblemSolution(problem, 'java');

    expect(getProblemSolution(problem, 'kotlin')).toContain('fun ');
    expect(javaSolution.includes('public static') || javaSolution.includes('class ')).toBe(true);
    expect(javaSolution).not.toContain('No Java solution');
    expect(problem.solutions?.java).toBeDefined();
  });
});

describe('getProblemHintsForLanguage', () => {
  it('returns best and alternative guidance with stream and loop mentions for the active language', () => {
    const hints = getProblemHintsForLanguage(problems[3], 'kotlin');

    expect(hints.length).toBeGreaterThanOrEqual(3);
    expect(hints.some((hint) => /best/i.test(hint.title) || /best/i.test(hint.text))).toBe(true);
    expect(hints.some((hint) => /alternative|other/i.test(hint.title) || /alternative|other/i.test(hint.text))).toBe(true);
    expect(hints.some((hint) => /stream|loop/i.test(hint.text))).toBe(true);
  });
});

describe('problem coaching metadata', () => {
  it('includes interview-ready explanation and follow-up prompts for each question', () => {
    const problem = problems[0];

    expect(problem.explanation).toBeTruthy();
    expect(problem.followUpQuestions?.length).toBeGreaterThan(0);
    expect(problem.commonMistakes?.length).toBeGreaterThan(0);
  });
});

describe('multi-solution coverage', () => {
  it('provides exactly four ordered solutions with recommendation metadata for every problem', () => {
    const problem = problems[0];
    const kotlinSolutions = problem.solutions?.kotlin ?? [];
    const javaSolutions = problem.solutions?.java ?? [];

    expect(kotlinSolutions).toHaveLength(4);
    expect(javaSolutions).toHaveLength(4);
    expect(kotlinSolutions.map((entry) => entry.label)).toEqual([
      'Basic Solution',
      'Alternative',
      'Loop',
      'Stream API',
    ]);
    expect(javaSolutions.map((entry) => entry.label)).toEqual([
      'Basic Solution',
      'Alternative',
      'Loop',
      'Stream API',
    ]);
    expect(kotlinSolutions.every((entry) => entry.recommendation && entry.note)).toBe(true);
    expect(javaSolutions.every((entry) => entry.recommendation && entry.note)).toBe(true);
    expect(kotlinSolutions[0].recommendation).toBe('Best');
    expect(kotlinSolutions[3].recommendation).toBe('Good to try');
  });
});

describe('simple learning flow', () => {
  it('provides a short procedural flow for every question', () => {
    problems.forEach((problem) => {
      const flow = getLearningFlow(problem);
      expect(flow.length).toBeGreaterThanOrEqual(4);
      expect(flow[0]).toBe('Start');
      expect(flow.at(-1)).toBe('Return the answer');
    });
  });

  it('explains loop and stream solutions with their own procedures', () => {
    const problem = problems[0];
    expect(getSolutionFlow(problem, 'Loop')).toContain('Visit each input item');
    expect(getSolutionFlow(problem, 'Stream API')).toContain('Create a stream');
  });

  it('replaces placeholder examples with question-specific examples', () => {
    const problem = problems.find((item) => item.title === 'Find duplicate characters');
    const example = getProblemExamples(problem ?? problems[0])[0];

    expect(example.input).toBe('"programming"');
    expect(example.output).toBe('[r, g, m]');
  });

  it('keeps duplicate-character contracts aligned in both languages', () => {
    const duplicateProblems = problems.filter((problem) => problem.title === 'Find duplicate characters');

    expect(duplicateProblems).toHaveLength(2);
    duplicateProblems.forEach((problem) => {
      expect(problem.contract).toEqual({
        family: 'character-list',
        input: 'String',
        output: 'List<Char>',
        preservesOrder: true,
      });
      expect(getProblemSolutions(problem, 'kotlin')[0].code).toContain('(input: String): List<Char>');
      expect(getProblemSolutions(problem, 'java')[0].code).toContain('(String input)');
      expect(getProblemSolutions(problem, 'java')[0].code).toContain('List<Character>');
      expect(getProblemSolutions(problem, 'kotlin')[0].code).not.toContain('List<Int>');
      expect(getProblemSolutions(problem, 'java')[0].code).not.toContain('List<Integer>');
    });
  });

  it('does not route adjacent problem families through unrelated generators', () => {
    const negativeProblem = problems.find((problem) => problem.title === 'Move all negative numbers to beginning');
    const linkedListProblem = problems.find((problem) => problem.title === 'Reverse Linked List');
    const subarrayProblem = problems.find((problem) => problem.title === 'Maximum Subarray');

    expect(getProblemSolutions(negativeProblem!, 'kotlin')[0].code).toContain('it < 0');
    expect(getProblemSolutions(negativeProblem!, 'java')[0].code).toContain('value < 0');
    expect(getProblemSolutions(linkedListProblem!, 'java')[0].code).not.toContain('StringBuilder');
    expect(getProblemSolutions(subarrayProblem!, 'java')[0].code).not.toContain('Collections.max');
  });

  it('assigns a contract and type-shaped fallback to every roadmap question', () => {
    problems.forEach((problem) => {
      expect(problem.contract?.input).toBeTruthy();
      expect(problem.contract?.output).toBeTruthy();

      const kotlin = getProblemSolutions(problem, 'kotlin')[0].code;
      const java = getProblemSolutions(problem, 'java')[0].code;
      const numericFallback = /filter \{ it > 0 \}\.sorted\(\)|filter\(value -> value > 0\)\.sorted\(\)/;

      if (problem.contract?.family !== 'numeric-list') {
        expect(kotlin).not.toMatch(numericFallback);
        expect(java).not.toMatch(numericFallback);
      }
    });
  });

  it('does not return vague examples for any roadmap question', () => {
    problems.forEach((problem) => {
      const example = getProblemExamples(problem)[0];
      expect(example.input).not.toContain('example');
      expect(example.output).not.toMatch(/requested operation|applying the requested operation/i);
    });
  });

  it('stores canonical examples and matching test cases on every problem', () => {
    problems.forEach((problem) => {
      expect(problem.examples.length).toBeGreaterThan(0);
      expect(problem.examples.some((example) => example.input.includes('example') || example.output.includes('example'))).toBe(false);
      expect(problem.testCases).toHaveLength(problem.examples.length);
      expect(problem.testCases.map(({ input, output }) => ({ input, output }))).toEqual(problem.examples.map(({ input, output }) => ({ input, output })));
    });
  });

  it('keeps the lightweight topic index synchronized with the question catalog', () => {
    const indexedEntries = Object.values(topicIndex).flat();
    const indexedIds = indexedEntries.map((entry) => entry.id);

    expect(indexedEntries).toHaveLength(problems.length);
    expect(new Set(indexedIds).size).toBe(problems.length);
    problems.forEach((problem) => {
      const entry = indexedEntries.find((candidate) => candidate.id === problem.id);
      expect(entry?.title).toBe(problem.title);
      expect(getQuestionIndexByTopic(problem.topic)).toContainEqual(entry);
    });
  });

  it('loads a single topic index on demand', async () => {
    const entries = await loadTopicIndex('HashMap');

    expect(entries).toEqual(getQuestionIndexByTopic('HashMap'));
    expect(entries).toContainEqual({ id: 5, title: 'Find duplicate characters' });
  });

  it('loads full questions through the topic boundary', async () => {
    const questions = await loadQuestionsByTopic('HashMap');

    expect(questions).toHaveLength(getQuestionIndexByTopic('HashMap').length);
    expect(questions.find((question) => question.id === 5)?.title).toBe('Find duplicate characters');
  });

  it('loads question-specific solutions lazily for migrated questions', async () => {
    const problem = problems.find((item) => item.id === 5)!;
    const loaded = await loadProblemSolutions(problem.id);
    const normalizeCode = (code: string) => code.replace(/\n\s*\n\s*}/g, '\n}').trim();

    expect(normalizeCode(loaded?.kotlin?.[0].code ?? '')).toBe(normalizeCode(getProblemSolutions(problem, 'kotlin')[0].code));
    expect(normalizeCode(loaded?.java?.[0].code ?? '')).toBe(normalizeCode(getProblemSolutions(problem, 'java')[0].code));
  });

  it('loads another migrated question through the same filename convention', async () => {
    const loaded = await loadProblemSolutions(105);

    expect(loaded?.kotlin?.[0].code).toContain('fun binarySearch');
    expect(loaded?.java?.[0].code).toContain('public static int binarySearch');
  });

  it('derives the migrated solution file name from the canonical question format', () => {
    expect(getSolutionFileName(38, 'Find duplicate characters')).toBe('question-038-find-duplicate-characters');
    expect(getSolutionFileName(105, 'Binary Search')).toBe('question-105-binary-search');
  });

  it('keeps migrated solution files aligned with the full 120-question roadmap', () => {
    const solutionFiles = readdirSync(new URL('../data/solutions', import.meta.url))
      .filter((fileName) => fileName.endsWith('.json'))
      .sort();

    expect(solutionFiles).toHaveLength(problems.length);
    expect(solutionFiles[0]).toBe('question-001-reverse-a-string.json');
    expect(solutionFiles.at(-1)).toBe('question-120-number-of-islands.json');
  });

  it('keeps examples aligned with specific operations', () => {
    expect(getProblemExamples(problems.find((item) => item.title === 'Count occurrences of a substring') ?? problems[0])[0]).toEqual({ input: 'text = "aaaa", pattern = "aa"', output: '3' });
    expect(getProblemExamples(problems.find((item) => item.title === 'Sort numbers descending') ?? problems[0])[0]).toEqual({ input: '[5, 1, 4, 2]', output: '[5, 4, 2, 1]' });
    expect(getProblemExamples(problems.find((item) => item.title === 'Find second largest number') ?? problems[0])[0]).toEqual({ input: '[5, 1, 9, 3]', output: '5' });
    expect(getProblemExamples(problems.find((item) => item.title === 'Remove duplicate characters') ?? problems[0])[0]).toEqual({ input: '"programming"', output: '"progamin"' });
    expect(getProblemExamples(problems.find((item) => item.title === 'Sort strings by length') ?? problems[0])[0]).toEqual({ input: '["cat", "elephant", "dog"]', output: '["cat", "dog", "elephant"]' });
    expect(getProblemExamples(problems.find((item) => item.title === 'Group Anagrams') ?? problems[0])[0]).toEqual({ input: '["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]' });
    expect(getProblemExamples(problems.find((item) => item.title === 'Find All Anagrams in a String') ?? problems[0])[0]).toEqual({ input: 'text = "cbaebabacd", pattern = "abc"', output: '[0, 6]' });
  });

  it('formats Kotlin expression solutions as block-body functions', () => {
    const reverseSolution = getProblemSolutions(problems[0], 'kotlin')[0].code;

    expect(reverseSolution).toContain('fun reverseAString(input: String): String {');
    expect(reverseSolution).toContain('return input.reversed()');
    expect(reverseSolution).not.toContain('): String =');
  });

  it('keeps every Kotlin solution in block-body format', () => {
    problems.forEach((problem) => {
      getProblemSolutions(problem, 'kotlin').forEach((solution) => {
        expect(solution.code).not.toMatch(/\bfun\s+[A-Za-z0-9_]+\([^\n]*\)\s*(?::[^=\n]+)?\s*=/);
      });
    });
  });

  it('keeps generated solution languages and declarations clean', () => {
    problems.forEach((problem) => {
      getProblemSolutions(problem, 'kotlin').forEach((solution) => {
        expect(solution.code).not.toMatch(/\bpublic\s+static\b|\bCollectors\b|\bnew\s+[A-Z]|\bval\s+\w+\s*\{/);
        validateGeneratedSolutionCode(solution.code, 'kotlin');
      });
      getProblemSolutions(problem, 'java').forEach((solution) => {
        expect(solution.code).not.toMatch(/\bfun\s+\w+|\bval\s+|mutable(?:List|Map|Set)Of|\bwhen\s*\(/);
        validateGeneratedSolutionCode(solution.code, 'java');
      });
    });
  });

  it('derives complexity from each solution implementation', () => {
    const problem = problems.find((item) => item.title === 'Sort an array') ?? problems[0];
    const direct = getSolutionComplexity(problem, 'fun solve(input: List<Int>): List<Int> { return input }');
    const sorted = getSolutionComplexity(problem, 'fun solve(input: List<Int>): List<Int> { return input.sorted() }');
    const nested = getSolutionComplexity(problem, 'for (a in input) { for (b in input) { println(a + b) } }');

    expect(direct.time).toBe('O(n)');
    expect(direct.space).toBe('O(1)');
    expect(sorted.time).toBe('O(n log n)');
    expect(nested.time).toBe('O(n^2)');
  });
});
