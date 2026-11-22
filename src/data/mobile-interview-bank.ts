import { interviewQuestions, type InterviewQuestion } from './interview-question-bank';

export interface MobileBankQuestion {
  id: string;
  setId: string;
  setTitle: string;
  sectionId: string;
  sectionTitle: string;
  source: 'Complete Revision';
  text: string;
  answer: string;
}

export interface MobileQuestionSet {
  id: string;
  title: string;
  source: 'Complete Revision';
  sections: Array<{ id: string; title: string; questionCount: number }>;
}

export function getMobileQuestionBank(sourceQuestions: InterviewQuestion[] = interviewQuestions): MobileBankQuestion[] {
  const duplicateIds = new Map<string, number>();
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

    return {
      id: duplicateIndex === 0 ? stableId : `${stableId}-${duplicateIndex + 1}`,
      setId,
      setTitle,
      sectionId: `${setId}:${slug(sectionTitle)}`,
      sectionTitle,
      source: 'Complete Revision',
      text: question.prompt,
      answer: question.hasAnswer ? question.answerMarkdown : '',
    };
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
