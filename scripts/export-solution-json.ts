import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getProblemSolutions, problems } from '../src/data/roadmap';

const solutionsDirectory = join(process.cwd(), 'src', 'data', 'solutions');

const slugify = (value: string): string => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

mkdirSync(solutionsDirectory, { recursive: true });

for (const problem of problems) {
  const fileName = `question-${String(problem.id).padStart(3, '0')}-${slugify(problem.title)}.json`;
  const filePath = join(solutionsDirectory, fileName);
  const solutionSet = {
    kotlin: getProblemSolutions(problem, 'kotlin'),
    java: getProblemSolutions(problem, 'java'),
  };

  writeFileSync(filePath, `${JSON.stringify(solutionSet, null, 2)}\n`, 'utf8');
}

console.log(`Solution files available: ${problems.length}`);
