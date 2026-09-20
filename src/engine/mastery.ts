export type MasteryStatus = 'not_started' | 'learning' | 'practicing' | 'strong' | 'mastered';

export interface MasteryInputs {
  correctness: number;
  speed: number;
  independence: number;
  repeatedSuccess: number;
  explanation: number;
  hints: number;
}

export interface MasteryBreakdown {
  score: number;
  status: MasteryStatus;
  weights: {
    correctness: number;
    speed: number;
    independence: number;
    repeatedSuccess: number;
    explanation: number;
    hints: number;
  };
}

export function calculateMastery(raw: MasteryInputs): MasteryBreakdown {
  const weights = {
    correctness: 0.3,
    speed: 0.2,
    independence: 0.2,
    repeatedSuccess: 0.15,
    explanation: 0.1,
    hints: 0.05,
  };

  const score =
    raw.correctness * weights.correctness +
    raw.speed * weights.speed +
    raw.independence * weights.independence +
    raw.repeatedSuccess * weights.repeatedSuccess +
    raw.explanation * weights.explanation +
    raw.hints * weights.hints;

  let status: MasteryStatus = 'not_started';
  if (score >= 85) status = 'mastered';
  else if (score >= 70) status = 'strong';
  else if (score >= 50) status = 'practicing';
  else if (score >= 30) status = 'learning';

  return { score, status, weights };
}

export function getNextReviewDate({
  success,
  hintsUsed,
  confidence,
  currentReviewAt,
}: {
  success: boolean;
  hintsUsed: number;
  confidence: number;
  currentReviewAt?: string;
}): string {
  const base = currentReviewAt ? new Date(currentReviewAt) : new Date();

  if (!success) {
    base.setDate(base.getDate() + 0);
    return base.toISOString();
  }

  if (hintsUsed > 0) {
    base.setDate(base.getDate() + 1);
    return base.toISOString();
  }

  if (confidence >= 4) {
    base.setDate(base.getDate() + 2);
    return base.toISOString();
  }

  base.setDate(base.getDate() + 5);
  return base.toISOString();
}
