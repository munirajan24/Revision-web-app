import { describe, expect, it } from 'vitest';
import {
  createLearnTrack,
  emptyLearnProgress,
  getContinueStage,
  getLearnStageId,
  getLearnStageStatus,
  getLearnStages,
  getMistakeStages,
  getQuizQuestionIds,
  markLearnQuestion,
  markLearnStageKnown,
  mergeLearnProgress,
  parseLearnProgress,
  recordLearnQuizSummary,
  resetLearnStage,
  skipLearnStage,
} from './learn-track';

describe('learn track progress', () => {
  it('chunks bank order into stable stage IDs, including a partial final stage', () => {
    const track = createLearnTrack(['set'], ['section'], 3, 10);
    const stages = getLearnStages(track, ['a', 'b', 'c', 'd']);
    expect(stages.map((stage) => stage.questions)).toEqual([['a', 'b', 'c'], ['d']]);
    expect(stages[0].id).toBe(getLearnStageId(track.id, 3, 1));
    expect(getLearnStages(track, ['c', 'a', 'b', 'd'])[0].id).toBe(stages[0].id);
  });

  it('derives readiness, mastery, and continue position from flags and stats', () => {
    const track = createLearnTrack(['s'], ['a'], 3);
    const stage = getLearnStages(track, ['a', 'b', 'c'])[0];
    const known = markLearnStageKnown(track, stage, 20);
    expect(getLearnStageStatus(stage, known, {})).toBe('ready');
    const continueStage = getContinueStage([stage], known, {});
    expect(continueStage).toBe(stage);
    expect(getLearnStageStatus(stage, known, {
      a: { attended: 1, correct: 1, wrong: 0, skipped: 0 },
      b: { attended: 1, correct: 1, wrong: 0, skipped: 0 },
      c: { attended: 1, correct: 1, wrong: 0, skipped: 0 },
    })).toBe('mastered');
  });

  it('does not learn on reveal or skip, and flags review separately', () => {
    const track = createLearnTrack(['s'], ['a'], 3);
    const unchanged = markLearnQuestion(track, 'q', 'skip');
    expect(unchanged).toBe(track);
    const reviewed = markLearnQuestion(track, 'q', 'need-review', 10);
    expect(reviewed.questions.q).toMatchObject({ learned: false, needReview: true });
    const learned = markLearnQuestion(reviewed, 'q', 'learned', 20);
    expect(learned.questions.q).toMatchObject({ learned: true, needReview: false, learnedAt: 20 });
  });

  it('selects only questions without prior correct results by default', () => {
    const stage = { id: 's', ordinal: 1, questions: ['a', 'b'], mistakes: false };
    const stats = { a: { attended: 1, correct: 1, wrong: 0, skipped: 0 } };
    expect(getQuizQuestionIds(stage, stats)).toEqual(['b']);
    expect(getQuizQuestionIds(stage, stats, true)).toEqual(['a', 'b']);
  });

  it('builds deduplicated mistake stages and resets only learn state', () => {
    const track = createLearnTrack(['s'], ['a'], 3);
    const reviewed = markLearnQuestion(track, 'a', 'need-review');
    const stages = getMistakeStages(reviewed, ['a', 'b', 'c', 'd'], {
      b: { attended: 0, correct: 0, wrong: 1, skipped: 0 },
      c: { attended: 0, correct: 0, wrong: 0, skipped: 1 },
    });
    expect(stages.map((stage) => stage.questions)).toEqual([['a', 'b', 'c']]);
    const known = markLearnStageKnown(reviewed, stages[0]);
    const reset = resetLearnStage(known, stages[0]);
    expect(reset.questions.a).toBeUndefined();
  });

  it('records a stage summary once per session and preserves the newest summary', () => {
    const track = createLearnTrack(['s'], ['a'], 3);
    const progress = { version: 1 as const, tracks: [track] };
    const stageId = getLearnStageId(track.id, 3, 1);
    const summary = { sessionId: 'session', correct: 2, total: 3, finishedAt: 20 };
    const once = recordLearnQuizSummary(progress, track.id, stageId, summary);
    expect(recordLearnQuizSummary(once, track.id, stageId, { ...summary, finishedAt: 30 })).toBe(once);
  });

  it('parses valid data, rejects malformed shapes, and merges flags/summaries by recency', () => {
    const first = createLearnTrack(['s'], ['a'], 3, 10);
    const stageId = getLearnStageId(first.id, 3, 1);
    const left = {
      version: 1 as const,
      tracks: [{ ...first, questions: { q: { learned: true, needReview: false, learnedAt: 5 } }, stageQuizzes: {} }],
    };
    const right = {
      version: 1 as const,
      tracks: [{
        ...first,
        lastOpenedAt: 20,
        lastOpenedStageId: stageId,
        questions: { q: { learned: false, needReview: true }, r: { learned: true, needReview: false, learnedAt: 8 } },
        stageQuizzes: { [stageId]: { sessionId: 'new', correct: 3, total: 3, finishedAt: 50 } },
      }],
    };
    expect(parseLearnProgress(left)).toEqual(left);
    expect(parseLearnProgress({ version: 2, tracks: [] })).toBeUndefined();
    const merged = mergeLearnProgress(left, right).tracks[0];
    expect(merged.questions.q).toMatchObject({ learned: true, needReview: false, learnedAt: 5 });
    expect(merged.questions.r.learnedAt).toBe(8);
    expect(merged.stageQuizzes[stageId].sessionId).toBe('new');
    expect(merged.lastOpenedStageId).toBe(stageId);
  });

  it('shares question learning flags across tracks during backup merge', () => {
    const first = createLearnTrack(['one'], ['section-one'], 3, 10);
    const second = createLearnTrack(['two'], ['section-two'], 5, 20);
    const merged = mergeLearnProgress(
      { version: 1, tracks: [{ ...first, questions: { shared: { learned: true, needReview: false, learnedAt: 5 } } }] },
      { version: 1, tracks: [{ ...second, questions: { shared: { learned: false, needReview: true } } }] },
    );
    expect(merged.tracks.map((track) => track.questions.shared)).toEqual([
      { learned: true, needReview: false, skippedLearn: false, important: false, learnedAt: 5 },
      { learned: true, needReview: false, skippedLearn: false, important: false, learnedAt: 5 },
    ]);
  });

  it('marks an explicitly skipped learn stage as quiz-ready without recording question stats', () => {
    const track = createLearnTrack(['s'], ['a'], 3);
    const stage = getLearnStages(track, ['a'])[0];
    const skipped = skipLearnStage(track, stage);
    expect(getLearnStageStatus(stage, skipped, {})).toBe('ready');
  });

  it('provides an empty backup default', () => {
    expect(emptyLearnProgress()).toEqual({ version: 1, tracks: [] });
  });
});
