import type { SolutionLanguage, SolutionVariant } from './roadmap';

const solutionCache = new Map<number, Partial<Record<SolutionLanguage, SolutionVariant[]>>>();

export async function loadProblemSolutions(
  problemId: number,
): Promise<Partial<Record<SolutionLanguage, SolutionVariant[]>> | undefined> {
  const cached = solutionCache.get(problemId);
  if (cached) return cached;

  try {
    const solutionFileNames: Record<number, string> = {
      5: 'question-005-find-duplicate-characters',
      105: 'question-105-binary-search',
    };
    const fileName = solutionFileNames[problemId];
    if (!fileName) return undefined;

    const module = await import(`./solutions/${fileName}.json`) as {
      default: Partial<Record<SolutionLanguage, SolutionVariant[]>>;
    };
    solutionCache.set(problemId, module.default);
    return module.default;
  } catch {
    return undefined;
  }
}
