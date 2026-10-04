import type { ChecklistItem, ChecklistSection, SkillChecklist } from '../engine/interviews';

const markdownSources = import.meta.glob('../../Files/Checklist/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const seedSkillChecklists: SkillChecklist[] = Object.entries(markdownSources)
  .filter(([path]) => !/(^|\/)Question bank\//i.test(path))
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
  .map(([path, markdown]) => {
    const sourceTitle = markdown.match(/^#\s+(.+)$/m)?.[1] ?? getFileTitle(path);
    const id = path
      .replace(/^\.\.\/\.\.\/Files\/Checklist\//, '')
      .replace(/\.md$/i, '')
      .split('/')
      .map(slugify)
      .filter(Boolean)
      .join('-');

    return parseChecklistMarkdown(id, cleanText(sourceTitle), markdown);
  });

export function parseChecklistMarkdown(id: string, title: string, markdown: string): SkillChecklist {
  const sections: ChecklistSection[] = [];
  let currentSection: ChecklistSection | undefined;
  let itemIndex = 0;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{2,3}\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const sectionTitle = cleanText(heading[1]);
      currentSection = {
        id: `${id}-section-${sections.length + 1}-${slugify(sectionTitle)}`,
        title: sectionTitle,
        items: [],
      };
      sections.push(currentSection);
      continue;
    }

    const checkbox = line.match(/^\s*-\s*\[([ xX])\]\s+(.+?)\s*$/);
    if (!checkbox) continue;

    if (!currentSection) {
      currentSection = { id: `${id}-section-general`, title: 'General', items: [] };
      sections.push(currentSection);
    }

    const sourceText = checkbox[2];
    const codeTerms = [...sourceText.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    const item: ChecklistItem = {
      id: `${id}-item-${String(++itemIndex).padStart(3, '0')}`,
      text: cleanText(sourceText),
    };
    if (codeTerms.length > 0) item.codeTerms = codeTerms;
    if (/\(not important\)/i.test(sourceText)) item.priority = 'low';
    else if (/[⭐★]/.test(sourceText)) item.priority = 'high';
    currentSection.items.push(item);
  }

  return { id, title, sections };
}

function getFileTitle(path: string): string {
  return path.split('/').pop()?.replace(/\.md$/i, '').trim() ?? path;
}

function cleanText(value: string): string {
  return value
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/[⭐★]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}