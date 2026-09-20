import type { SolutionLanguage, SolutionVariant } from './roadmap';
import { problems } from './roadmap';

const solutionCache = new Map<number, Partial<Record<SolutionLanguage, SolutionVariant[]>>>();

const solutionModules = import.meta.glob('./solutions/*.json', { eager: true }) as Record<
  string,
  { default: Partial<Record<SolutionLanguage, SolutionVariant[]>> }
>;

const slugify = (value: string): string => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export const getSolutionFileName = (problemId: number, title: string): string =>
  `question-${String(problemId).padStart(3, '0')}-${slugify(title)}`;

const getProblemTitle = (problemId: number): string => {
  const match = problems.find((problem) => problem.id === problemId);
  return match?.title ?? `Question ${problemId}`;
};

export async function loadProblemSolutions(
  problemId: number,
  title?: string,
): Promise<Partial<Record<SolutionLanguage, SolutionVariant[]>> | undefined> {
  const cached = solutionCache.get(problemId);
  if (cached) return cached;

  try {
    const fileName = getSolutionFileName(problemId, title ?? getProblemTitle(problemId));
    const modulePath = `./solutions/${fileName}.json` as const;
    const module = solutionModules[modulePath];

    if (!module) return undefined;

    solutionCache.set(problemId, module.default);
    return module.default;
  } catch {
    return undefined;
  }
}
