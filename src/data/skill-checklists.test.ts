import { describe, expect, it } from 'vitest';
import { parseChecklistMarkdown, seedSkillChecklists } from './skill-checklists';

describe('skill checklist catalog seed', () => {
  it('imports all six checklist documents and their checklist items', () => {
    expect(seedSkillChecklists).toHaveLength(6);
    expect(new Set(seedSkillChecklists.map((checklist) => checklist.id)).size).toBe(6);
    expect(seedSkillChecklists.reduce((total, checklist) => total + checklist.sections.reduce((sectionTotal, section) => sectionTotal + section.items.length, 0), 0)).toBe(721);
    expect(seedSkillChecklists.every((checklist) => checklist.sections.length > 0)).toBe(true);
  });

  it('keeps section order, text, and priority labels while assigning stable item IDs', () => {
    const source = [
      '# Demo checklist',
      '## Core ⭐',
      '- [ ] `val` vs `var` and **value class**',
      '- [ ] (not important) Optional topic',
      '### Advanced',
      '- [ ] Explain flows',
    ].join('\n');
    const checklist = parseChecklistMarkdown('demo', 'Demo', source);

    expect(checklist.sections.map((section) => section.title)).toEqual(['Core', 'Advanced']);
    expect(checklist.sections[0].items).toEqual([
      { id: 'demo-item-001', text: 'val vs var and value class', codeTerms: ['val', 'var'] },
      { id: 'demo-item-002', text: '(not important) Optional topic', priority: 'low' },
    ]);
    expect(checklist.sections[1].items[0].id).toBe('demo-item-003');
  });
});