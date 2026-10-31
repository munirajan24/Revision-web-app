import { describe, expect, it } from 'vitest';
import { androidConcepts, androidConceptQuestions } from './android-concept-prep';

describe('Android concept interview preparation', () => {
  it('provides unique concept questions and programming exercises for all four requested areas', () => {
    expect(androidConcepts.map((concept) => concept.id)).toEqual([
      'coroutines',
      'flow',
      'architecture',
      'compose',
    ]);
    expect(androidConcepts.every((concept) => concept.topics.length >= 4)).toBe(true);
    expect(new Set(androidConceptQuestions.map((question) => question.id)).size).toBe(androidConceptQuestions.length);
    expect(new Set(androidConceptQuestions.map((question) => question.difficulty))).toEqual(
      new Set(['Fundamental', 'Intermediate', 'Advanced']),
    );
    expect(androidConceptQuestions.every((question) => (
      question.interviewQuestion.trim().length > 0
      && question.answer.trim().length > 0
      && question.exercise.problem.trim().length > 0
      && question.exercise.requirements.length > 0
      && question.exercise.expectedBehavior.trim().length > 0
      && question.exercise.solutionCode.trim().length > 0
      && question.exercise.explanation.trim().length > 0
      && question.exercise.tests.trim().length > 0
      && question.exercise.commonMistakes.length > 0
    ))).toBe(true);
  });

  it('covers the requested coroutine, Flow, architecture, and Compose APIs and topics', () => {
    const textFor = (conceptId: string) => androidConcepts
      .find((concept) => concept.id === conceptId)!
      .topics
      .map((question) => `${question.subtopic}\n${question.interviewQuestion}\n${question.answer}\n${question.exercise.solutionCode}`)
      .join('\n')
      .toLowerCase();

    const coroutineTopics = textFor('coroutines');
    for (const term of ['launch', 'async', 'await', 'suspend', 'structured concurrency', 'coroutine scope', 'dispatcher', 'cancellation', 'exception', 'supervisorscope', 'withcontext', 'lifecycle']) {
      expect(coroutineTopics).toContain(term);
    }

    const flowTopics = textFor('flow');
    for (const term of ['cold flow', 'hot flow', 'stateflow', 'sharedflow', 'collect', 'collectlatest', 'map', 'filter', 'combine', 'flatmaplatest', 'flowon', 'buffer', 'conflate', 'catch', 'testing']) {
      expect(flowTopics).toContain(term);
    }

    const architectureTopics = textFor('architecture');
    for (const term of ['presentation', 'domain', 'data', 'repository', 'use case', 'dependency inversion', 'separation of concerns', 'mvvm', 'dependency injection', 'modularization', 'unit test']) {
      expect(architectureTopics).toContain(term);
    }

    const composeTopics = textFor('compose');
    for (const term of ['remember', 'remembersaveable', 'recomposition', 'state hoisting', 'launchedeffect', 'disposableeffect', 'sideeffect', 'derivedstateof', 'key', 'stability', 'lazycolumn', 'ui state', 'collectasstatewithlifecycle', 'viewmodel']) {
      expect(composeTopics).toContain(term);
    }
  });
});
