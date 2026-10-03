import { useMemo, useState } from 'react';
import {
  createInterview,
  getChecklistProgress,
  getInterviewForDate,
  getInterviewProgress,
  setInterviewChecklistItem,
  type InterviewAttendance,
  type InterviewRecord,
  type InterviewStore,
  type SkillChecklist,
} from '../engine/interviews';

interface InterviewPlannerProps {
  store: InterviewStore;
  onChange: (store: InterviewStore) => void;
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const attendanceLabels: Record<InterviewAttendance, string> = {
  scheduled: 'Scheduled',
  attended: 'Attended',
  not_attended: 'Not attended',
};

export default function InterviewPlanner({ store, onChange }: InterviewPlannerProps) {
  const [screen, setScreen] = useState<'calendar' | 'checklist' | 'catalog'>('calendar');
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(new Date()));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>([]);
  const [newSkillTitle, setNewSkillTitle] = useState('');
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [pendingChecklistRemoval, setPendingChecklistRemoval] = useState<SkillChecklist | null>(null);
  const [removalConfirmation, setRemovalConfirmation] = useState('');

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const dayInterviews = store.interviews
    .filter((interview) => interview.date === selectedDate)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt));
  const selectedInterview = getInterviewForDate(store.interviews, selectedDate, selectedInterviewId);
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const updateInterview = (updated: InterviewRecord) => {
    onChange({
      ...store,
      interviews: store.interviews.map((interview) => interview.id === updated.id ? updated : interview),
    });
  };

  const addInterview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedChecklistIds.length === 0) return;
    const interview = createInterview(selectedDate, selectedChecklistIds, store.catalog, {
      title: newTitle.trim(),
      company: newCompany.trim(),
    });
    onChange({ ...store, interviews: [...store.interviews, interview] });
    setNewTitle('');
    setNewCompany('');
    setSelectedChecklistIds([]);
    setShowCreateForm(false);
  };

  const addSkill = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newSkillTitle.trim();
    if (!title) return;
    const id = `custom-${slugify(title)}-${Date.now().toString(36)}`;
    onChange({
      ...store,
      catalog: [...store.catalog, { id, title, sections: [{ id: `${id}-general`, title: 'General', items: [] }] }],
    });
    setNewSkillTitle('');
  };

  const toggleChecklist = (checklistId: string) => {
    setSelectedChecklistIds((current) => current.includes(checklistId)
      ? current.filter((id) => id !== checklistId)
      : [...current, checklistId]);
  };

  const removeInterview = (interviewId: string) => {
    if (!window.confirm('Delete this interview and its checklist progress?')) return;
    onChange({ ...store, interviews: store.interviews.filter((interview) => interview.id !== interviewId) });
    if (selectedInterviewId === interviewId) setSelectedInterviewId(null);
  };

  const changeChecklist = (checklist: SkillChecklist) => {
    onChange({ ...store, catalog: store.catalog.map((entry) => entry.id === checklist.id ? checklist : entry) });
  };

  const removeChecklist = (checklistId: string) => {
    const checklist = store.catalog.find((entry) => entry.id === checklistId);
    if (!checklist) return;
    setPendingChecklistRemoval(checklist);
    setRemovalConfirmation('');
  };

  const confirmChecklistRemoval = () => {
    if (!pendingChecklistRemoval || removalConfirmation.trim() !== pendingChecklistRemoval.title) return;
    onChange({ ...store, catalog: store.catalog.filter((entry) => entry.id !== pendingChecklistRemoval.id) });
    setPendingChecklistRemoval(null);
    setRemovalConfirmation('');
  };

  return (
    <div className="interview-planner">
      <nav className="planner-screen-nav" aria-label="Interview planner screens" role="tablist">
        {([
          ['calendar', 'Calendar'],
          ['checklist', 'Checklist'],
          ['catalog', 'Source catalog'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={screen === id} className={screen === id ? 'planner-screen-tab active' : 'planner-screen-tab'} onClick={() => setScreen(id)}>
            {label}
          </button>
        ))}
      </nav>

      {screen === 'calendar' && <div className="planner-screen calendar-screen">
      <section className="interview-calendar-panel">
        <div className="planner-panel-heading">
          <div>
            <p className="eyebrow">Interview schedule</p>
            <h2>{monthLabel}</h2>
          </div>
          <div className="calendar-controls" aria-label="Calendar navigation">
            <button className="icon-button" type="button" aria-label="Previous month" title="Previous month" onClick={() => setVisibleMonth((month) => shiftMonth(month, -1))}>‹</button>
            <button className="secondary-button" type="button" onClick={() => { setVisibleMonth(getMonthStart(new Date())); setSelectedDate(getLocalDate()); }}>Today</button>
            <button className="icon-button" type="button" aria-label="Next month" title="Next month" onClick={() => setVisibleMonth((month) => shiftMonth(month, 1))}>›</button>
          </div>
        </div>
        <div className="calendar-grid" role="grid" aria-label={monthLabel}>
          {weekdays.map((weekday) => <span key={weekday} className="calendar-weekday" role="columnheader">{weekday}</span>)}
          {calendarDays.map((day) => {
            const dateKey = toDateKey(day);
            const count = store.interviews.filter((interview) => interview.date === dateKey).length;
            const outsideMonth = day.getMonth() !== visibleMonth.getMonth();
            return (
              <button
                key={dateKey}
                type="button"
                role="gridcell"
                aria-label={`${day.toLocaleDateString(undefined, { dateStyle: 'full' })}${count ? `, ${count} interviews` : ''}`}
                aria-pressed={selectedDate === dateKey}
                className={`calendar-day${outsideMonth ? ' outside-month' : ''}${selectedDate === dateKey ? ' selected' : ''}${count ? ' has-interview' : ''}`}
                onClick={() => setSelectedDate(dateKey)}
              >
                <span>{day.getDate()}</span>
                {count > 0 && <small>{count}</small>}
              </button>
            );
          })}
        </div>
        <div className="calendar-legend"><span className="calendar-dot" /> Scheduled interviews</div>
      </section>

      <section className="interview-day-panel">
        <div className="planner-panel-heading day-heading">
          <div>
            <p className="eyebrow">Selected date</p>
            <h2>{formatDate(selectedDate)}</h2>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreateForm((shown) => !shown)}>
            {showCreateForm ? 'Close form' : '+ Add interview'}
          </button>
        </div>

        {showCreateForm && (
          <form className="interview-create-form" onSubmit={addInterview}>
            <div className="interview-form-fields">
              <label>Interview name<input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Technical interview" /></label>
              <label>Company<input value={newCompany} onChange={(event) => setNewCompany(event.target.value)} placeholder="Company name" /></label>
            </div>
            <fieldset className="checklist-picker">
              <legend>Skills for this interview</legend>
              <div className="checklist-picker-grid">
                {store.catalog.map((checklist) => (
                  <label key={checklist.id} className="checklist-option">
                    <input type="checkbox" checked={selectedChecklistIds.includes(checklist.id)} onChange={() => toggleChecklist(checklist.id)} />
                    <span>{checklist.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="primary-button" type="submit" disabled={selectedChecklistIds.length === 0}>Create interview</button>
          </form>
        )}

        {dayInterviews.length === 0 && !showCreateForm && (
          <div className="interview-empty-state"><p>No interviews scheduled for this date.</p></div>
        )}

        <div className="interview-list">
          {dayInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onChange={updateInterview}
              onDelete={() => removeInterview(interview.id)}
              showChecklist={false}
              onOpenChecklist={() => { setSelectedInterviewId(interview.id); setScreen('checklist'); }}
            />
          ))}
        </div>
      </section>
      </div>}

      {screen === 'checklist' && <section className="planner-screen checklist-screen">
        <div className="planner-screen-heading">
          <div><p className="eyebrow">Interview preparation</p><h2>Checklist</h2></div>
          <button className="secondary-button" type="button" onClick={() => setScreen('calendar')}>Back to calendar</button>
        </div>
        {selectedInterview ? (
          <InterviewCard
            interview={selectedInterview}
            onChange={updateInterview}
            onDelete={() => removeInterview(selectedInterview.id)}
            showChecklist
            onOpenChecklist={() => undefined}
          />
        ) : (
          <div className="interview-empty-state"><p>Select an interview from the calendar to open its checklist.</p></div>
        )}
      </section>}

      {screen === 'catalog' && <section className="planner-screen catalog-manager-panel">
        <div className="planner-panel-heading">
          <div>
            <p className="eyebrow">Source catalog</p>
            <h2>Skill checklists <span className="catalog-count">{store.catalog.length}</span></h2>
          </div>
        </div>
        <div className="catalog-manager">
          <form className="add-skill-form" onSubmit={addSkill}>
            <label htmlFor="new-skill-title">New skill</label>
            <input id="new-skill-title" value={newSkillTitle} onChange={(event) => setNewSkillTitle(event.target.value)} placeholder="e.g. System design" />
            <button className="secondary-button" type="submit" disabled={!newSkillTitle.trim()}>Add skill</button>
          </form>
          {store.catalog.map((checklist) => (
            <ChecklistEditor key={checklist.id} checklist={checklist} onChange={changeChecklist} onDelete={() => removeChecklist(checklist.id)} />
          ))}
        </div>
      </section>}

      {pendingChecklistRemoval && (
        <div className="confirmation-overlay">
          <section className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="remove-checklist-title">
            <p className="eyebrow">Remove from source catalog</p>
            <h2 id="remove-checklist-title">Remove {pendingChecklistRemoval.title}?</h2>
            <p className="confirmation-copy">
              This removes the skill and its {countItems(pendingChecklistRemoval)} catalog items. Existing interviews keep their saved checklist and progress.
            </p>
            <label className="confirmation-input-label" htmlFor="confirm-skill-removal">
              Type <strong>{pendingChecklistRemoval.title}</strong> to confirm
              <input id="confirm-skill-removal" autoFocus value={removalConfirmation} onChange={(event) => setRemovalConfirmation(event.target.value)} />
            </label>
            <div className="confirmation-actions">
              <button className="secondary-button" type="button" onClick={() => { setPendingChecklistRemoval(null); setRemovalConfirmation(''); }}>Cancel</button>
              <button className="danger-button" type="button" disabled={removalConfirmation.trim() !== pendingChecklistRemoval.title} onClick={confirmChecklistRemoval}>Remove skill</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function InterviewCard({
  interview,
  onChange,
  onDelete,
  showChecklist,
  onOpenChecklist,
}: {
  interview: InterviewRecord;
  onChange: (interview: InterviewRecord) => void;
  onDelete: () => void;
  showChecklist: boolean;
  onOpenChecklist: () => void;
}) {
  const [selectedChecklistId, setSelectedChecklistId] = useState(interview.checklists[0]?.checklistId ?? '');
  const [copiedChecklistItemKey, setCopiedChecklistItemKey] = useState<string | null>(null);
  const progress = getInterviewProgress(interview);
  const activeChecklist = interview.checklists.find((checklist) => checklist.checklistId === selectedChecklistId) ?? interview.checklists[0];
  const activeChecklistProgress = activeChecklist ? getChecklistProgress(activeChecklist) : null;
  const copyChecklistItem = async (key: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedChecklistItemKey(key);
      window.setTimeout(() => setCopiedChecklistItemKey((current) => current === key ? null : current), 1500);
    } catch {
      setCopiedChecklistItemKey(null);
    }
  };
  return (
    <article className="interview-record">
      <div className="interview-record-heading">
        <div className="interview-record-title-fields">
          <input aria-label="Interview name" value={interview.title} onChange={(event) => onChange({ ...interview, title: event.target.value })} placeholder="Interview name" />
          <input aria-label="Company" value={interview.company} onChange={(event) => onChange({ ...interview, company: event.target.value })} placeholder="Company" />
        </div>
        <button className="icon-button danger-icon" type="button" title="Delete interview" aria-label="Delete interview" onClick={onDelete}>×</button>
      </div>
      <div className="interview-record-meta">
        <label className="attendance-control">Date
          <input type="date" value={interview.date} onChange={(event) => onChange({ ...interview, date: event.target.value })} />
        </label>
        <label className="attendance-control">Attendance
          <select value={interview.attendance} onChange={(event) => onChange({ ...interview, attendance: event.target.value as InterviewAttendance })}>
            {Object.entries(attendanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <span className="interview-overall-progress">{progress.completed}/{progress.total} checked <strong>{progress.completionPercent}% ready</strong></span>
      </div>
      <div className="interview-progress-track" role="progressbar" aria-label="Overall checklist completion" aria-valuenow={progress.completionPercent} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${progress.completionPercent}%` }} />
      </div>
      {showChecklist ? (
        <>
          <label className="interview-notes-label">Notes<textarea value={interview.notes} onChange={(event) => onChange({ ...interview, notes: event.target.value })} placeholder="Interview notes" rows={2} /></label>
          <div className="interview-checklists">
            <label className="skill-checklist-selector">
              <span>Skill checklist</span>
              <select value={activeChecklist?.checklistId ?? ''} onChange={(event) => setSelectedChecklistId(event.target.value)}>
                {interview.checklists.map((checklist) => {
                  const checklistProgress = getChecklistProgress(checklist);
                  return <option key={checklist.checklistId} value={checklist.checklistId}>{checklist.checklistTitle} ({checklistProgress.completionPercent}% complete)</option>;
                })}
              </select>
            </label>
            {activeChecklist && activeChecklistProgress ? (
              <section className="focused-checklist">
                <div className="focused-checklist-heading">
                  <div>
                    <p className="eyebrow">Current skill</p>
                    <h2>{activeChecklist.checklistTitle}</h2>
                  </div>
                  <div className="focused-checklist-stats">
                    <strong>{activeChecklistProgress.completionPercent}% complete</strong>
                    <span>{activeChecklistProgress.completed} of {activeChecklistProgress.total} items · {activeChecklistProgress.remainingPercent}% remaining</span>
                  </div>
                </div>
                <div className="focused-checklist-track" role="progressbar" aria-label={`${activeChecklist.checklistTitle} completion`} aria-valuenow={activeChecklistProgress.completionPercent} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${activeChecklistProgress.completionPercent}%` }} />
                </div>
                <div className="focused-checklist-sections">
                  {activeChecklist.sections.map((section) => {
                    const completedInSection = section.items.filter((item) => activeChecklist.completedItemIds.includes(item.id)).length;
                    return (
                      <section className="focused-checklist-section" key={section.id}>
                        <div className="checklist-section-heading">
                          <h3>{section.title}</h3>
                          <span>{completedInSection} / {section.items.length}</span>
                        </div>
                        {section.items.map((item) => {
                          const copyKey = `${activeChecklist.checklistId}:${item.id}`;
                          const wasCopied = copiedChecklistItemKey === copyKey;
                          const checkboxId = `check-${interview.id}-${copyKey}`;
                          return (
                          <div className="interview-check-item" key={item.id}>
                            <label className="interview-check-item-label" htmlFor={checkboxId}>
                              <input
                                id={checkboxId}
                                type="checkbox"
                                checked={activeChecklist.completedItemIds.includes(item.id)}
                                onChange={(event) => onChange(setInterviewChecklistItem(interview, activeChecklist.checklistId, item.id, event.target.checked))}
                              />
                              <span>{renderChecklistText(item.text, item.codeTerms)}</span>
                            </label>
                            {item.priority === 'high' && <small className="priority-label">Priority</small>}
                            {item.priority === 'low' && <small className="low-priority-label">Optional</small>}
                            <button className="interview-check-item-copy" type="button" aria-label={wasCopied ? 'Copied checklist item' : 'Copy checklist item'} title={wasCopied ? 'Copied' : 'Copy item'} onClick={() => void copyChecklistItem(copyKey, item.text)}>{wasCopied ? 'Copied' : 'Copy'}</button>
                          </div>
                        );})}
                      </section>
                    );
                  })}
                </div>
              </section>
            ) : (
              <div className="interview-empty-state"><p>This interview has no skill checklists.</p></div>
            )}
          </div>
        </>
      ) : (
        <div className="interview-record-footer">
          <ol className="interview-checklist-summary-list">
            {interview.checklists.map((checklist) => {
              const checklistProgress = getChecklistProgress(checklist);
              return (
                <li key={checklist.checklistId}>
                  <span>{checklist.checklistTitle}</span>
                  <strong>{checklistProgress.completionPercent}% complete</strong>
                </li>
              );
            })}
          </ol>
          <button className="secondary-button" type="button" onClick={onOpenChecklist}>Open checklist</button>
        </div>
      )}
    </article>
  );
}

function ChecklistEditor({
  checklist,
  onChange,
  onDelete,
}: {
  checklist: SkillChecklist;
  onChange: (checklist: SkillChecklist) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(() => new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [pendingSectionRemovalId, setPendingSectionRemovalId] = useState<string | null>(null);
  const [editingSkillName, setEditingSkillName] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftChecklist, setDraftChecklist] = useState<SkillChecklist>(() => structuredClone(checklist));

  const updateDraft = (update: (current: SkillChecklist) => SkillChecklist) => {
    setDraftChecklist(update);
    setHasUnsavedChanges(true);
  };

  const updateSection = (sectionId: string, update: (section: SkillChecklist['sections'][number]) => SkillChecklist['sections'][number]) => {
    updateDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => section.id === sectionId ? update(section) : section),
    }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSectionIds((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const addSection = () => {
    const id = `${draftChecklist.id}-section-${Date.now().toString(36)}`;
    updateDraft((current) => ({ ...current, sections: [...current.sections, { id, title: 'New section', items: [] }] }));
    setEditingSectionId(id);
    setExpandedSectionIds((current) => new Set(current).add(id));
  };

  const addItem = (sectionId: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      items: [...section.items, { id: `${section.id}-item-${Date.now().toString(36)}`, text: 'New checklist item' }],
    }));
  };

  const saveChanges = () => {
    const nextChecklist = pendingSectionRemovalId
      ? { ...draftChecklist, sections: draftChecklist.sections.filter((section) => section.id !== pendingSectionRemovalId) }
      : draftChecklist;
    if (hasUnsavedChanges) onChange(nextChecklist);
    setDraftChecklist(nextChecklist);
    setHasUnsavedChanges(false);
    setEditingSectionId(null);
    setPendingSectionRemovalId(null);
    setEditingSkillName(false);
  };

  const cancelChanges = () => {
    setDraftChecklist(structuredClone(checklist));
    setHasUnsavedChanges(false);
    setEditingSectionId(null);
    setPendingSectionRemovalId(null);
    setEditingSkillName(false);
  };

  const handleToggleSection = (sectionId: string) => {
    if (editingSectionId !== null || editingSkillName) cancelChanges();
    toggleSection(sectionId);
  };

  return (
    <div className="catalog-skill-editor">
      <div className={editingSkillName ? 'catalog-skill-heading editing' : isExpanded ? 'catalog-skill-heading selected' : 'catalog-skill-heading'} onClick={() => {
        if (!editingSkillName) setIsExpanded((expanded) => !expanded);
      }}>
        {editingSkillName ? (
          <label className="catalog-skill-name-input">Skill name
            <input autoFocus value={draftChecklist.title} onChange={(event) => updateDraft((current) => ({ ...current, title: event.target.value }))} />
          </label>
        ) : (
          <>
            <button className="catalog-skill-toggle" type="button" aria-expanded={isExpanded} onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((expanded) => !expanded);
            }}>
              <span>{draftChecklist.title}</span>
              <small>{countItems(draftChecklist)} items</small>
            </button>
            {isExpanded && editingSectionId === null && <button className="icon-button catalog-skill-edit-button" type="button" aria-label={`Edit skill name ${draftChecklist.title}`} title="Edit skill name" onClick={(event) => {
              event.stopPropagation();
              setEditingSkillName(true);
            }}>✎</button>}
            <button className="catalog-skill-view-button" type="button" aria-label={`${isExpanded ? 'Hide' : 'View'} checklist ${draftChecklist.title}`} aria-expanded={isExpanded} onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((expanded) => !expanded);
            }}>
              <span className={isExpanded ? 'catalog-skill-chevron expanded' : 'catalog-skill-chevron'} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      {isExpanded && <div className="catalog-skill-content">
        {editingSkillName && <DraftActionBar hasChanges={hasUnsavedChanges} onSave={saveChanges} onCancel={cancelChanges} />}
        {draftChecklist.sections.map((section, index) => {
          const isEditing = editingSectionId === section.id;
          const isExpanded = expandedSectionIds.has(section.id);
          const isPendingRemoval = pendingSectionRemovalId === section.id;

          return (
            <div className="catalog-segment-row" key={section.id}>
              <div className="catalog-segment-details">
                <div className="catalog-segment-header" onClick={() => handleToggleSection(section.id)}>
                  <button className="catalog-segment-main-toggle" type="button" aria-expanded={isExpanded} aria-label={`Toggle segment ${section.title}`} onClick={(event) => {
                    event.stopPropagation();
                    handleToggleSection(section.id);
                  }}>
                    <span className="catalog-segment-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="catalog-segment-title">{section.title}</span>
                    <span className="catalog-segment-count">{section.items.length} items</span>
                  </button>
                  <div className="catalog-segment-actions" onClick={(event) => event.stopPropagation()}>
                    {isEditing || isPendingRemoval ? (
                      <DraftActionBar className="catalog-segment-edit-actions" hasChanges={hasUnsavedChanges} onSave={saveChanges} onCancel={cancelChanges} />
                    ) : !editingSkillName && editingSectionId === null ? (
                      <button
                        className="secondary-button catalog-segment-edit"
                        type="button"
                        aria-label={`Edit segment ${section.title}`}
                        onClick={() => {
                          setEditingSectionId(section.id);
                          setExpandedSectionIds((current) => new Set(current).add(section.id));
                        }}
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                  <button className="catalog-segment-view-button" type="button" aria-expanded={isExpanded} onClick={(event) => {
                    event.stopPropagation();
                    handleToggleSection(section.id);
                  }}>
                    <span className="catalog-segment-view-label">{isExpanded ? 'Hide' : 'View'}</span>
                    <span className={isExpanded ? 'catalog-segment-chevron expanded' : 'catalog-segment-chevron'} aria-hidden="true" />
                  </button>
                </div>
                {isExpanded && (
                  <div className="catalog-section-content">
                    {isPendingRemoval ? (
                      <div className="catalog-segment-removal-draft">
                        <p>This segment will be removed when changes are saved.</p>
                      </div>
                    ) : isEditing ? (
                      <>
                        <div className="catalog-section-heading">
                          <input aria-label="Segment name" value={section.title} onChange={(event) => updateSection(section.id, (current) => ({ ...current, title: event.target.value }))} />
                          <button className="icon-button danger-icon" type="button" aria-label={`Remove segment ${section.title}`} title="Remove segment" onClick={() => {
                            setPendingSectionRemovalId(section.id);
                            setHasUnsavedChanges(true);
                          }}>×</button>
                        </div>
                        {section.items.map((item) => (
                          <div className="catalog-item-editor" key={item.id}>
                            <input aria-label="Checklist item" value={item.text} onChange={(event) => updateSection(section.id, (current) => ({
                              ...current,
                              items: current.items.map((entry) => entry.id === item.id ? { ...entry, text: event.target.value } : entry),
                            }))} />
                            <select aria-label="Item priority" value={item.priority ?? 'normal'} onChange={(event) => updateSection(section.id, (current) => ({
                              ...current,
                              items: current.items.map((entry) => {
                                if (entry.id !== item.id) return entry;
                                const priority = event.target.value;
                                return priority === 'normal' ? { ...entry, priority: undefined } : { ...entry, priority: priority as 'high' | 'low' };
                              }),
                            }))}>
                              <option value="normal">Normal</option><option value="high">Priority</option><option value="low">Optional</option>
                            </select>
                            <button className="icon-button danger-icon" type="button" aria-label="Remove checklist item" title="Remove item" onClick={() => updateSection(section.id, (current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id) }))}>×</button>
                          </div>
                        ))}
                        <button className="text-action" type="button" onClick={() => addItem(section.id)}>+ Add item</button>
                      </>
                    ) : (
                      <ol className="catalog-view-items">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <span>{renderChecklistText(item.text, item.codeTerms)}</span>
                            {item.priority === 'high' && <small className="priority-label">Priority</small>}
                            {item.priority === 'low' && <small className="low-priority-label">Optional</small>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className="catalog-actions">
          <button className="secondary-button" type="button" disabled={editingSkillName || editingSectionId !== null} onClick={addSection}>Add section</button>
          <button className="danger-button" type="button" disabled={hasUnsavedChanges || editingSkillName || editingSectionId !== null} onClick={onDelete}>Remove skill</button>
        </div>
      </div>}
    </div>
  );
}

function DraftActionBar({
  hasChanges,
  onSave,
  onCancel,
  className,
}: {
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}) {
  return (
    <div className={className ? `catalog-edit-actions ${className}` : 'catalog-edit-actions'}>
      <span>{hasChanges ? 'Unsaved changes' : 'No changes yet'}</span>
      <div>
        <button className="secondary-button" type="button" aria-label="Cancel changes" title="Cancel changes" onClick={onCancel}><span>Cancel</span></button>
        <button className="primary-button" type="button" aria-label="Save changes" title="Save changes" disabled={!hasChanges} onClick={onSave}><span>Save changes</span></button>
      </div>
    </div>
  );
}

function getCalendarDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getLocalDate(): string {
  return toDateKey(new Date());
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function countItems(checklist: SkillChecklist): number {
  return checklist.sections.reduce((total, section) => total + section.items.length, 0);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'skill';
}

function renderChecklistText(text: string, codeTerms: string[] = []) {
  if (codeTerms.length === 0) return text;
  const terms = [...new Set(codeTerms)].sort((first, second) => second.length - first.length);
  const expression = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'g');
  return text.split(expression).map((part, index) => (
    terms.includes(part) ? <code className="checklist-code-term" key={`${part}-${index}`}>{part}</code> : part
  ));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}