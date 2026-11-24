import { interviewQuestions, type InterviewQuestion } from './interview-question-bank';
import { getProblemExamples, getProblemSolutions, problems } from './roadmap';
import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';

export type MobileCodingLanguage = 'kotlin' | 'java';

export interface MobileCodingExample {
  input: string;
  output: string;
}

export interface MobileCodingSolution {
  label: string;
  code: string;
  recommendation: 'Best' | 'Good to try' | 'Avoid unless needed';
  note: string;
}

export interface MobileCodingQuestion {
  language: MobileCodingLanguage;
  title: string;
  description: string;
  examples: MobileCodingExample[];
  solutions: Record<MobileCodingLanguage, MobileCodingSolution[]>;
}

export interface MobileBankQuestion {
  id: string;
  setId: string;
  setTitle: string;
  sectionId: string;
  sectionTitle: string;
  source: 'Complete Revision';
  text: string;
  answer: string;
  codingProblemId?: number;
  codingLanguage?: MobileCodingLanguage;
  codingQuestion?: MobileCodingQuestion;
}

export interface MobileQuestionSet {
  id: string;
  title: string;
  source: 'Complete Revision';
  sections: Array<{ id: string; title: string; questionCount: number }>;
}

export function getMobileQuestionBank(sourceQuestions: InterviewQuestion[] = interviewQuestions): MobileBankQuestion[] {
  const duplicateIds = new Map<string, number>();
  const codingQuestions = getProgrammingCodingQuestions(sourceQuestions);
  return sourceQuestions.map((question) => {
    const [sourceCategory, ...sourceSections] = (question.section || question.category).split(' / ');
    const isInterviewSet = /^Set\s+\d+\s*:/i.test(sourceCategory);
    const setTitle = isInterviewSet ? 'Original interview sets' : getCategoryTitle(sourceCategory);
    const sectionTitle = isInterviewSet
      ? [sourceCategory, ...sourceSections].join(' / ')
      : sourceSections.join(' / ') || 'General';
    const setId = `complete-revision:${slug(setTitle)}`;
    const stableId = `complete-revision:${hashIdentity([
      question.categoryId,
      question.section || question.category,
      normalizeIdentityText(question.prompt),
    ].join('\0'))}`;
    const duplicateIndex = duplicateIds.get(stableId) ?? 0;
    duplicateIds.set(stableId, duplicateIndex + 1);

    const codingQuestion = codingQuestions.get(question);
    return {
      id: duplicateIndex === 0 ? stableId : `${stableId}-${duplicateIndex + 1}`,
      setId,
      setTitle,
      sectionId: `${setId}:${slug(sectionTitle)}`,
      sectionTitle,
      source: 'Complete Revision',
      text: question.prompt,
      answer: question.hasAnswer ? question.answerMarkdown : '',
      ...(codingQuestion ? {
        codingQuestion,
        codingLanguage: codingQuestion.language,
      } : {}),
    };
  });
}

function getProgrammingCodingQuestions(questions: InterviewQuestion[]): Map<InterviewQuestion, MobileCodingQuestion> {
  const sections: Record<MobileCodingLanguage, InterviewQuestion[]> = {
    kotlin: questions.filter((question) => isProgrammingCodingSection(question, 'kotlin')),
    java: questions.filter((question) => isProgrammingCodingSection(question, 'java')),
  };
  const extracted = new Map<InterviewQuestion, MobileCodingQuestion>();

  for (const language of ['kotlin', 'java'] as const) {
    const partnerLanguage = language === 'kotlin' ? 'java' : 'kotlin';
    sections[language].forEach((question, index) => {
      const parsed = parseProgrammingCodingPrompt(question, language, index);
      if (!parsed) return;
      const partner = parseProgrammingCodingSolutions(sections[partnerLanguage][index], partnerLanguage);
      const own = parseProgrammingCodingSolutions(question, language);
      const solutions = {
        [language]: own,
        [partnerLanguage]: partner,
      } as Record<MobileCodingLanguage, MobileCodingSolution[]>;
      if (solutions.kotlin.length === 0 || solutions.java.length === 0) return;
      extracted.set(question, { ...parsed, solutions });
    });
  }
  return extracted;
}

function isProgrammingCodingSection(question: InterviewQuestion, language: MobileCodingLanguage): boolean {
  return new RegExp(`^Programming\\s*/\\s*${language}\\s+basic\\s+coding$`, 'i').test(question.section ?? '');
}

function parseProgrammingCodingPrompt(
  question: InterviewQuestion,
  language: MobileCodingLanguage,
  index: number,
): Pick<MobileCodingQuestion, 'language' | 'title' | 'description' | 'examples'> | undefined {
  const inputMatch = question.prompt.match(/\bInput\s*:\s*/i);
  const outputMatch = question.prompt.match(/\b(?:Expected\s+Output|Output)\s*:\s*/i);
  if (!inputMatch || !outputMatch || outputMatch.index === undefined || inputMatch.index === undefined || outputMatch.index <= inputMatch.index) {
    return undefined;
  }
  const rawDescription = question.prompt.slice(0, inputMatch.index).replace(/^Problem\s*:\s*/i, '').trim();
  const input = question.prompt.slice(inputMatch.index + inputMatch[0].length, outputMatch.index).replace(/[|,]\s*$/, '').trim();
  const output = question.prompt.slice(outputMatch.index + outputMatch[0].length).replace(/[|)]\s*$/, '').trim();
  if (!rawDescription || !input || !output) return undefined;

  const titleDescription = rawDescription.match(/^(.+?)\s+[–—-]\s+(.+)$/);
  const description = (titleDescription?.[2] ?? rawDescription).trim();
  const title = titleDescription?.[1]?.trim() || inferCodingTitle(description, language, index);
  return {
    language,
    title,
    description,
    examples: [{ input, output }],
  };
}

function inferCodingTitle(description: string, language: MobileCodingLanguage, index: number): string {
  if (/unique elements/i.test(description)) return 'Count Unique Elements';
  const firstSentence = description.split(/[.!?](?:\s|$)/, 1)[0].trim();
  if (firstSentence.length <= 64) return firstSentence;
  return `${language === 'kotlin' ? 'Kotlin' : 'Java'} Coding Challenge ${index + 1}`;
}

type CodingHtmlNode = DefaultTreeAdapterTypes.Node;

function parseProgrammingCodingSolutions(
  question: InterviewQuestion | undefined,
  language: MobileCodingLanguage,
): MobileCodingSolution[] {
  if (!question?.answerHtml) return [];
  const fragment = parseFragment(question.answerHtml);
  const blocks = collectCodingAnswerBlocks(fragment);
  const solutions: MobileCodingSolution[] = [];
  let current: MobileCodingSolution | undefined;

  const beginSolution = (label: string, recommendation: MobileCodingSolution['recommendation']) => {
    current = { label, code: '', recommendation, note: '' };
    solutions.push(current);
  };

  for (const block of blocks) {
    const heading = block.type === 'text' && block.text.match(/^(Kotlin|Java)\s*[–—-]\s*(.+)$/i);
    if (heading) {
      if (heading[1].toLowerCase() !== language) {
        current = undefined;
        continue;
      }
      const variantText = heading[2].trim();
      const recommendationMatch = variantText.match(/\((Best|Good to try|Avoid unless needed)\)\s*$/i);
      const label = variantText.replace(/\s*\((?:Best|Good to try|Avoid unless needed)\)\s*$/i, '').replace(/\s*Solution$/i, '').trim() || 'Basic';
      beginSolution(label, normalizeRecommendation(recommendationMatch?.[1]));
      continue;
    }

    if (block.type === 'text') {
      const complexity = block.text.match(/Time\s*:\s*(.*?)\s+Space\s*:\s*(.*)$/i);
      if (complexity && current) current.note = `Time: ${complexity[1].trim()} · Space: ${complexity[2].trim()}`;
      continue;
    }

    if (!current) beginSolution('Basic', 'Best');
    current!.code = [current!.code, block.text].filter(Boolean).join('\n').trim();
  }

  return solutions
    .map((solution) => ({ ...solution, code: solution.code.trim() }))
    .filter((solution) => solution.code.length > 0);
}

function collectCodingAnswerBlocks(root: CodingHtmlNode): Array<{ type: 'text' | 'code'; text: string }> {
  const blocks: Array<{ type: 'text' | 'code'; text: string }> = [];
  const visit = (node: CodingHtmlNode) => {
    if ('tagName' in node && node.tagName === 'pre') {
      const code = getCodingHtmlText(node).trim();
      if (code) blocks.push({ type: 'code', text: code });
      return;
    }
    if ('tagName' in node && node.tagName === 'p') {
      const text = getCodingHtmlText(node).replace(/\s+/g, ' ').trim();
      if (text) blocks.push({ type: 'text', text });
      return;
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  };
  visit(root);
  return blocks;
}

function getCodingHtmlText(node: CodingHtmlNode): string {
  if (node.nodeName === '#text' && 'value' in node) return node.value;
  if (!('childNodes' in node)) return '';
  return node.childNodes.map(getCodingHtmlText).join(node.nodeName === 'br' ? '\n' : '');
}

function normalizeRecommendation(value: string | undefined): MobileCodingSolution['recommendation'] {
  if (value?.toLowerCase() === 'good to try') return 'Good to try';
  if (value?.toLowerCase() === 'avoid unless needed') return 'Avoid unless needed';
  return 'Best';
}

export function getMobileCodingQuestionBank(): MobileBankQuestion[] {
  return problems.flatMap((problem) => {
    const examples = getProblemExamples(problem);
    if (!problem.description.trim() || examples.length === 0) return [];
    const solutions = {
      kotlin: getProblemSolutions(problem, 'kotlin'),
      java: getProblemSolutions(problem, 'java'),
    };
    if (Object.values(solutions).some((variants) => variants.length === 0 || variants.some((variant) => !variant.code.trim()))) {
      return [];
    }

    return (['kotlin', 'java'] as const).map((language) => ({
      id: `coding-${language}-${problem.id}`,
      setId: `complete-revision:${language}-coding`,
      setTitle: `${language === 'kotlin' ? 'Kotlin' : 'Java'} Coding`,
      sectionId: `complete-revision:${language}-coding:all`,
      sectionTitle: `${language === 'kotlin' ? 'Kotlin' : 'Java'} Coding`,
      source: 'Complete Revision' as const,
      text: problem.title,
      answer: solutions[language][0].code,
      codingProblemId: problem.id,
      codingLanguage: language,
    }));
  });
}

export function getMobileQuestionSets(questions = getMobileQuestionBank()): MobileQuestionSet[] {
  const sets = new Map<string, MobileQuestionSet>();
  questions.forEach((question) => {
    let set = sets.get(question.setId);
    if (!set) {
      set = { id: question.setId, title: question.setTitle, source: 'Complete Revision', sections: [] };
      sets.set(question.setId, set);
    }
    let section = set.sections.find((candidate) => candidate.id === question.sectionId);
    if (!section) {
      section = { id: question.sectionId, title: question.sectionTitle, questionCount: 0 };
      set.sections.push(section);
    }
    section.questionCount += 1;
  });
  return [...sets.values()];
}

function getCategoryTitle(sourceCategory: string): string {
  const normalized = sourceCategory.trim().toLowerCase();
  if (normalized === 'java') return 'Java';
  if (normalized === 'kotlin') return 'Kotlin';
  if (normalized === 'android') return 'Android';
  if (normalized === 'testing') return 'Testing';
  if (normalized === 'git') return 'Git';
  if (normalized.startsWith('ios development')) return 'iOS Development';
  return sourceCategory.trim() || 'Other';
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

function normalizeIdentityText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function hashIdentity(value: string): string {
  let hash = 14695981039346656037n;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 1099511628211n);
  }
  return hash.toString(16).padStart(16, '0');
}
