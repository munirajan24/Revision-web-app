import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getProblemExamples,
  getProblemSolutions,
  getSolutionComplexity,
  problems,
  type SolutionLanguage,
  type SolutionVariant,
} from '../src/data/roadmap';

const root = process.cwd();
const outputPath = join(root, 'Files', 'Checklist', 'Android', 'Programming Questions - Java and Kotlin.html');
const solutionsDirectory = join(root, 'src', 'data', 'solutions');
const languages: SolutionLanguage[] = ['kotlin', 'java'];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getSolutions(problemId: number, title: string, language: SolutionLanguage): SolutionVariant[] {
  const fileName = `question-${String(problemId).padStart(3, '0')}-${slugify(title)}.json`;
  const filePath = join(solutionsDirectory, fileName);
  if (!existsSync(filePath)) return getProblemSolutions(problems[problemId - 1], language);

  const data = JSON.parse(readFileSync(filePath, 'utf8')) as Partial<Record<SolutionLanguage, SolutionVariant[]>>;
  const variants = data[language];
  if (!variants?.length || variants.some((variant) => !variant.code.trim())) {
    throw new Error(`Missing ${language} answers for question ${problemId}: ${title}`);
  }
  return variants;
}

function renderVariant(problemId: number, language: SolutionLanguage, variant: SolutionVariant): string {
  const problem = problems[problemId - 1];
  const complexity = getSolutionComplexity(problem, variant.code);
  return `
        <article class="solution">
          <h5>${escapeHtml(variant.label)} <span>${escapeHtml(variant.recommendation)}</span></h5>
          <p>${escapeHtml(variant.note)}</p>
          <pre><code>${escapeHtml(variant.code)}</code></pre>
          <p class="complexity"><strong>Time:</strong> ${escapeHtml(complexity.time)} &nbsp; <strong>Space:</strong> ${escapeHtml(complexity.space)}</p>
        </article>`;
}

const questionSections = problems.map((problem) => {
  const examples = getProblemExamples(problem);
  const examplesHtml = examples.length
    ? `<div class="examples">${examples.map((example, index) => `
            <div class="example">
              <h5>Example ${index + 1}</h5>
              <p><strong>Input:</strong> <code>${escapeHtml(example.input)}</code></p>
              <p><strong>Output:</strong> <code>${escapeHtml(example.output)}</code></p>
              ${example.explanation ? `<p>${escapeHtml(example.explanation)}</p>` : ''}
            </div>`).join('')}
          </div>`
    : '';
  const languageSections = languages.map((language) => {
    const variants = getSolutions(problem.id, problem.title, language);
    if (!variants.length) throw new Error(`No ${language} answer for question ${problem.id}: ${problem.title}`);
    return `
        <section class="language">
          <h4>${language === 'kotlin' ? 'Kotlin' : 'Java'}</h4>
          ${variants.map((variant) => renderVariant(problem.id, language, variant)).join('')}
        </section>`;
  }).join('');

  return `
    <article class="question" id="question-${problem.id}">
      <header>
        <p class="eyebrow">Question ${problem.id} · ${escapeHtml(problem.levelTitle)} · ${escapeHtml(problem.difficulty)}</p>
        <h3>${escapeHtml(problem.title)}</h3>
        <p>${escapeHtml(problem.description)}</p>
      </header>
      ${examplesHtml}
      <div class="languages">${languageSections}
      </div>
    </article>`;
}).join('\n');

const tableOfContents = problems.map((problem) => (
  `<li><a href="#question-${problem.id}">${problem.id}. ${escapeHtml(problem.title)}</a></li>`
)).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Programming Questions — Java and Kotlin Answers</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, Segoe UI, sans-serif; color: #172033; background: #f4f6fb; }
    * { box-sizing: border-box; }
    body { max-width: 1080px; margin: 0 auto; padding: 28px 18px 56px; line-height: 1.55; }
    h1, h2, h3, h4, h5, p { margin-top: 0; }
    h1 { margin-bottom: 8px; }
    .intro, .toc, .question { padding: 22px; border: 1px solid #dce2ee; border-radius: 14px; background: #fff; }
    .intro, .toc { margin-bottom: 18px; }
    .toc ol { columns: 2; column-gap: 32px; padding-left: 24px; }
    .toc li { break-inside: avoid; margin: 4px 0; }
    a { color: #3156a6; }
    .question { margin: 16px 0; scroll-margin-top: 16px; }
    .question header { border-bottom: 1px solid #e6eaf1; margin-bottom: 16px; }
    .eyebrow { margin-bottom: 5px; color: #596780; font-size: .82rem; }
    .question h3 { margin-bottom: 10px; }
    .examples { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px; margin-bottom: 18px; }
    .example { padding: 12px; border-radius: 10px; background: #f4f6fb; }
    .example h5 { margin-bottom: 7px; }
    .example p { margin-bottom: 5px; }
    .languages { display: grid; gap: 16px; }
    .language { min-width: 0; }
    .language > h4 { padding-bottom: 7px; border-bottom: 2px solid #8a63e6; }
    .solution { margin: 12px 0; padding: 14px; border: 1px solid #e1e6ef; border-radius: 10px; }
    .solution h5 { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
    .solution h5 span { color: #3156a6; font-size: .8rem; }
    .solution p { color: #4b5568; font-size: .9rem; }
    pre { max-width: 100%; overflow: auto; margin: 10px 0; padding: 14px; border-radius: 9px; background: #101827; color: #e8edf7; tab-size: 4; }
    pre code { font: 13px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre; }
    .solution .complexity { margin-bottom: 0; font-size: .8rem; }
    @media (min-width: 760px) { .languages { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { body { padding: 14px 10px 36px; } .intro, .toc, .question { padding: 15px; } .toc ol { columns: 1; } }
    @media print { :root { background: white; } body { max-width: none; padding: 0; } .intro, .toc, .question { box-shadow: none; break-inside: avoid; } pre { white-space: pre-wrap; overflow-wrap: anywhere; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <header class="intro">
    <p class="eyebrow">Coding Questions · Learning mode</p>
    <h1>Programming Questions — Java and Kotlin</h1>
    <p>${problems.length} questions with examples and all available solution variants for both languages.</p>
  </header>
  <nav class="toc" aria-label="Question index">
    <h2>Questions</h2>
    <ol>${tableOfContents}</ol>
  </nav>
  <main>
    ${questionSections}
  </main>
</body>
</html>
`;

writeFileSync(outputPath, html, 'utf8');
console.log(`Exported ${problems.length} questions with Java and Kotlin answers to ${outputPath}`);
