import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { getProblemById, getProblemExamples, getProblemHintsForLanguage, getProblemSolution, getProblemSolutions, getSolutionComplexity, getSolutionFlow, keywordCatalog, levelMeta, loadProblemSolutions, problems, type SolutionLanguage, type SolutionVariant } from './data/roadmap';
import { getSyntaxReturnType, syntaxReference } from './data/syntax-reference';
import { calculateMastery, getNextReviewDate } from './engine/mastery';
import { getProblemImportanceLabel, normalizeProblemImportanceEntry, problemImportanceOptions, type ProblemImportance } from './engine/problem-importance';
import { createAppBackup, mergeInterviewStores, mergeJobApplicationStores, mergeProgressRecords, parseAppBackup, replaceProgressRecords, type AppBackupSection, type ParsedAppBackup } from './engine/app-backup';
import { loadCompleteRevisionProgress, mergeCompleteRevisionProgress, saveCompleteRevisionProgress } from './engine/complete-revision-progress';
import type { BackupTheme } from './engine/progress-transfer';
import InterviewPlanner from './components/InterviewPlanner';
import ProblemImportanceRating from './components/ProblemImportanceRating';
import { seedSkillChecklists } from './data/skill-checklists';
import { loadInterviewStore, saveInterviewStore, type InterviewStore } from './engine/interviews';
import { getJobApplicationProgress, getLocalDateKey, loadJobApplicationStore, saveJobApplicationStore, type JobApplicationStore } from './engine/job-applications';

const CompleteRevision = lazy(() => import('./components/CompleteRevision'));
const SampleInterview = lazy(() => import('./components/SampleInterview'));

type View = 'dashboard' | 'questions' | 'practice' | 'keywords' | 'reference' | 'analytics' | 'interviews' | 'complete-revision' | 'sample-interview' | 'settings';
type AppLanguage = 'kotlin' | 'java';
type TrainingMode = 'learning' | 'practice';
type ProgressStatus = 'not_started' | 'learning' | 'practicing' | 'strong' | 'mastered';
type ImportanceFilter = 'all' | 'unrated' | `${ProblemImportance}`;
type ImportanceSort = 'default' | 'highest' | 'lowest';

const backupSectionLabels: Record<AppBackupSection, string> = {
  coding: 'Coding progress and drafts',
  completeRevision: 'Complete Revision question progress',
  interviews: 'Interview and checklist data',
  jobApplications: 'Job-application calendar',
};

const viewByTab: Record<string, View> = {
  dashboard: 'dashboard',
  questions: 'questions',
  practice: 'practice',
  keywords: 'keywords',
  syntax: 'reference',
  reference: 'reference',
  analytics: 'analytics',
  interviews: 'interviews',
  'revision-checklist': 'interviews',
  'complete-revision': 'complete-revision',
  'sample-interview': 'sample-interview',
  settings: 'settings',
};

const tabByView: Record<View, string> = {
  dashboard: 'dashboard',
  questions: 'questions',
  practice: 'practice',
  keywords: 'keywords',
  reference: 'syntax',
  analytics: 'analytics',
  interviews: 'revision-checklist',
  'complete-revision': 'complete-revision',
  'sample-interview': 'sample-interview',
  settings: 'settings',
};

function getViewFromUrl(): View {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab ? viewByTab[tab.toLowerCase()] ?? 'dashboard' : 'dashboard';
}

const languageText = {
  kotlin: {
    appName: 'Kotlin Interview Trainer',
    shortCode: 'K',
    primaryLanguage: 'Kotlin',
    alternateLanguage: 'Java',
    practicePlaceholder: 'Write your Kotlin solution here...',
    validationLabel: 'Conceptual Kotlin validation',
    exportPrefix: 'kotlin',
  },
  java: {
    appName: 'Java Interview Trainer',
    shortCode: 'J',
    primaryLanguage: 'Java',
    alternateLanguage: 'Kotlin',
    practicePlaceholder: 'Write your Java solution here...',
    validationLabel: 'Conceptual Java validation',
    exportPrefix: 'java',
  },
} as const;

interface ProgressEntry {
  status: ProgressStatus;
  attempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  hintsUsed: number;
  solutionViewed: boolean;
  totalTimeSeconds: number;
  confidence: number;
  notes: string;
  lastAttemptedAt?: string;
  nextReviewAt?: string;
  reviewIntervalDays: number;
  bookmarked: boolean;
  importance?: ProblemImportance;
}

const STORAGE_KEY = 'kotlin-interview-trainer-state';

const codeKeywords: Record<AppLanguage, string[]> = {
  kotlin: ['fun', 'val', 'var', 'if', 'else', 'when', 'return', 'for', 'while', 'class', 'data', 'object', 'null', 'true', 'false', 'in', 'is', 'as', 'break', 'continue', 'private', 'public', 'override', 'import', 'package', 'try', 'catch', 'finally', 'println', 'filter', 'map', 'groupBy', 'distinct', 'sortedBy', 'firstOrNull', 'String', 'List', 'MutableList', 'Map', 'HashMap', 'Set', 'MutableSet'],
  java: ['public', 'private', 'protected', 'class', 'static', 'final', 'if', 'else', 'for', 'while', 'return', 'new', 'try', 'catch', 'finally', 'null', 'true', 'false', 'import', 'package', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long', 'char', 'byte', 'short', 'this', 'switch', 'case', 'break', 'continue', 'ArrayList', 'HashMap', 'HashSet', 'List', 'Map', 'Set', 'Collections', 'Optional'],
};

function getAutocompleteSuggestions(code: string, language: AppLanguage, cursor: number) {
  const beforeCursor = code.slice(0, cursor);
  const match = beforeCursor.match(/[A-Za-z_][A-Za-z0-9_]*$/);
  const current = match ? match[0] : '';
  const options = codeKeywords[language];

  if (!current) {
    return [];
  }

  return options
    .filter((option) => option.toLowerCase().startsWith(current.toLowerCase()) && option !== current)
    .slice(0, 6)
    .map((option) => ({ label: option, detail: language === 'kotlin' ? 'keyword' : 'keyword' }));
}

function renderHighlightedCode(code: string, language: AppLanguage) {
  const keywords = new Set(codeKeywords[language]);
  const tokens = code.split(/(\s+|\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b\d+\b|[{}()[\].,:;<>!=+\-*/%&|?]+)/g);

  return tokens.map((token, index) => {
    if (!token) return null;

    if (/^\s+$/.test(token)) {
      return <span key={`${token}-${index}`}>{token}</span>;
    }

    if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('*')) {
      return <span key={`${token}-${index}`} className="token-comment">{token}</span>;
    }

    if ((/^"(?:\\.|[^"])*"$/.test(token) || /^'(?:\\.|[^'])*'$/.test(token))) {
      return <span key={`${token}-${index}`} className="token-string">{token}</span>;
    }

    if (/^\d+$/.test(token)) {
      return <span key={`${token}-${index}`} className="token-number">{token}</span>;
    }

    if (/[{}()[\].,:;<>!=+\-*/%&|?]/.test(token)) {
      return <span key={`${token}-${index}`} className="token-operator">{token}</span>;
    }

    if (keywords.has(token)) {
      return <span key={`${token}-${index}`} className="token-keyword">{token}</span>;
    }

    if (/^[A-Z][A-Za-z0-9_<>]*$/.test(token) || /^(ArrayList|HashMap|HashSet|List|Map|Set|StringBuilder|Collections|Objects|Optional)$/i.test(token)) {
      return <span key={`${token}-${index}`} className="token-type">{token}</span>;
    }

    return <span key={`${token}-${index}`} className="token-identifier">{token}</span>;
  });
}

const DEFAULT_PROGRESS: ProgressEntry = {
  status: 'not_started',
  attempts: 0,
  successfulAttempts: 0,
  failedAttempts: 0,
  hintsUsed: 0,
  solutionViewed: false,
  totalTimeSeconds: 0,
  confidence: 1,
  notes: '',
  reviewIntervalDays: 1,
  bookmarked: false,
};

function normalizeProgressEntries(entries: Record<number, ProgressEntry & { important?: unknown }>): Record<number, ProgressEntry> {
  return Object.fromEntries(
    Object.entries(entries).map(([id, entry]) => [id, normalizeProblemImportanceEntry(entry)])
  ) as Record<number, ProgressEntry>;
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatExportTimestamp(date: Date): string {
  return date.toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z');
}

function buildDefaultProgressMap(): Record<number, ProgressEntry> {
  return Object.fromEntries(
    problems.map((problem) => [problem.id, { ...DEFAULT_PROGRESS }])
  ) as Record<number, ProgressEntry>;
}

function loadState(): {
  progress: Record<number, ProgressEntry>;
  drafts: Record<number, string>;
  theme: BackupTheme;
  language: AppLanguage;
  selectedProblemId: number;
  mode: TrainingMode;
} {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      progress: buildDefaultProgressMap(),
      drafts: {} as Record<number, string>,
      theme: 'dark',
      language: 'kotlin',
      selectedProblemId: 1,
      mode: 'practice',
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      progress: normalizeProgressEntries({ ...buildDefaultProgressMap(), ...(parsed.progress ?? {}) }),
      drafts: parsed.drafts ?? {},
      theme: parsed.theme === 'light' || parsed.theme === 'system' ? parsed.theme : 'dark',
      language: parsed.language === 'java' ? 'java' : 'kotlin',
      selectedProblemId: parsed.selectedProblemId ?? 1,
      mode: parsed.mode === 'learning' ? 'learning' : 'practice',
    };
  } catch {
    return {
      progress: buildDefaultProgressMap(),
      drafts: {},
      theme: 'dark',
      language: 'kotlin',
      selectedProblemId: 1,
      mode: 'practice',
    };
  }
}

export default function App() {
  const initial = useMemo(() => loadState(), []);
  const initialInterviewStore = useMemo(() => loadInterviewStore(localStorage, seedSkillChecklists), []);
  const initialJobApplicationStore = useMemo(() => loadJobApplicationStore(localStorage), []);
  const [view, setView] = useState<View>(getViewFromUrl);
  const [activeReferenceSection, setActiveReferenceSection] = useState(syntaxReference[0]?.id ?? '');
  const [theme, setTheme] = useState(initial.theme);
  const [language, setLanguage] = useState<AppLanguage>(initial.language);
  const [progress, setProgress] = useState<Record<number, ProgressEntry>>(initial.progress);
  const [drafts, setDrafts] = useState<Record<number, string>>(initial.drafts);
  const [pendingProgressImport, setPendingProgressImport] = useState<{ fileName: string; backup: ParsedAppBackup } | null>(null);
  const [progressImportStatus, setProgressImportStatus] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState(initial.selectedProblemId);
  const [mode, setMode] = useState<TrainingMode>(initial.mode);
  const [interviewStore, setInterviewStore] = useState<InterviewStore>(initialInterviewStore);
  const [jobApplicationStore, setJobApplicationStore] = useState<JobApplicationStore>(initialJobApplicationStore);
  const [todayDate, setTodayDate] = useState(getLocalDateKey);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState<ImportanceFilter>('all');
  const [importanceSort, setImportanceSort] = useState<ImportanceSort>('default');
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [solutionViewLanguage, setSolutionViewLanguage] = useState<AppLanguage>(initial.language);
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [confidence, setConfidence] = useState(1);
  const [notes, setNotes] = useState(initial.progress[initial.selectedProblemId]?.notes ?? '');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Array<{ label: string; detail: string }>>([]);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [lazySolutionMap, setLazySolutionMap] = useState<Record<number, Partial<Record<SolutionLanguage, SolutionVariant[]>>>>({});
  const [solutionLoadState, setSolutionLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const editorHighlightRef = useRef<HTMLPreElement | null>(null);
  const editorGutterRef = useRef<HTMLDivElement | null>(null);

  const selectedProblem = getProblemById(selectedProblemId) ?? problems[0];
  const editorCode = drafts[selectedProblem.id] ?? '';
  const activeLanguageText = languageText[language];

  const navigateToView = (nextView: View) => {
    setView(nextView);
    const url = new URL(window.location.href);
    const tab = tabByView[nextView];
    if (url.searchParams.get('tab') !== tab) {
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url);
    }
  };

  useEffect(() => {
    const handlePopState = () => setView(getViewFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (view !== 'reference') return;

    const sections = document.querySelectorAll<HTMLElement>('.reference-section');
    const observer = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
      const sectionId = visibleSections[0]?.target.id.replace('reference-', '');
      if (sectionId) setActiveReferenceSection(sectionId);
    }, { rootMargin: '-120px 0px -65% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.language = language;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, drafts, theme, language, selectedProblemId, mode }));
  }, [progress, drafts, theme, language, selectedProblemId, mode]);

  useEffect(() => {
    saveInterviewStore(localStorage, interviewStore);
  }, [interviewStore]);

  useEffect(() => {
    saveJobApplicationStore(localStorage, jobApplicationStore);
  }, [jobApplicationStore]);

  useEffect(() => {
    const refreshToday = () => setTodayDate(getLocalDateKey());
    const interval = window.setInterval(refreshToday, 60_000);
    window.addEventListener('focus', refreshToday);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshToday);
    };
  }, []);

  useEffect(() => {
    const record = progress[selectedProblemId] ?? { ...DEFAULT_PROGRESS };
    setConfidence(record.confidence);
    setNotes(record.notes);
    setShowSolution(false);
    setHintIndex(0);
    setSolutionViewLanguage(language);
    setSelectedSolutionIndex(0);
  }, [selectedProblemId, language]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const totalQuestions = problems.length;
  const completed = Object.values(progress).filter((entry) => entry.status === 'mastered' || entry.status === 'strong').length;
  const weakQuestions = Object.values(progress).filter((entry) => ['not_started', 'learning', 'practicing'].includes(entry.status)).length;
  const masteredQuestions = Object.values(progress).filter((entry) => entry.status === 'mastered').length;

  const readyScore = Math.round(
    Object.values(progress).reduce((sum, entry) => {
      const mastery = calculateMastery({
        correctness: entry.successfulAttempts * 25 + (entry.status === 'mastered' ? 25 : 0),
        speed: Math.min(100, 100 - entry.totalTimeSeconds / 80),
        independence: entry.confidence * 20,
        repeatedSuccess: entry.successfulAttempts * 20,
        explanation: entry.confidence * 20,
        hints: Math.max(0, 100 - entry.hintsUsed * 15),
      });
      return sum + mastery.score;
    }, 0) / Math.max(1, Object.keys(progress).length)
  );
  const todayJobApplicationProgress = getJobApplicationProgress(jobApplicationStore, todayDate);

  const dashboardFocus = [...problems]
    .map((problem) => ({ problem, record: progress[problem.id] ?? { ...DEFAULT_PROGRESS } }))
    .sort((a, b) => {
      const weightA = (['not_started', 'learning', 'practicing'].includes(a.record.status) ? 1 : 0) * 100 + a.record.hintsUsed * 10 + (a.record.confidence || 1);
      const weightB = (['not_started', 'learning', 'practicing'].includes(b.record.status) ? 1 : 0) * 100 + b.record.hintsUsed * 10 + (b.record.confidence || 1);
      return weightB - weightA;
    })
    .slice(0, 5)
    .map(({ problem }) => problem);

  const weakConcepts = useMemo(() => {
    const summary = new Map<string, number>();
    problems.forEach((problem) => {
      const entry = progress[problem.id] ?? { ...DEFAULT_PROGRESS };
      if (['not_started', 'learning', 'practicing'].includes(entry.status)) {
        problem.concepts.forEach((concept) => summary.set(concept, (summary.get(concept) ?? 0) + 1));
      }
    });
    return [...summary.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [progress]);

  const filteredQuestions = problems.filter((problem) => {
    const record = progress[problem.id] ?? { ...DEFAULT_PROGRESS };
    const combo = `${problem.title} ${problem.description} ${problem.keywords.join(' ')} ${problem.concepts.join(' ')}`.toLowerCase();
    const matchesSearch = combo.includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || String(problem.level) === levelFilter;
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesImportance = importanceFilter === 'all'
      || (importanceFilter === 'unrated'
        ? record.importance === undefined
        : record.importance === Number(importanceFilter));
    const matchesWeakOnly = !showWeakOnly || ['not_started', 'learning', 'practicing'].includes(record.status);
    return matchesSearch && matchesLevel && matchesDifficulty && matchesStatus && matchesImportance && matchesWeakOnly;
  });

  const sortedQuestions = importanceSort === 'default'
    ? filteredQuestions
    : [...filteredQuestions].sort((first, second) => {
      const firstImportance = progress[first.id]?.importance ?? 0;
      const secondImportance = progress[second.id]?.importance ?? 0;
      const ratingOrder = importanceSort === 'highest'
        ? secondImportance - firstImportance
        : firstImportance - secondImportance;
      return ratingOrder || first.id - second.id;
    });

  const topicMastery = useMemo(() => {
    const summary = new Map<string, number>();
    problems.forEach((problem) => {
      const record = progress[problem.id] ?? { ...DEFAULT_PROGRESS };
      const current = summary.get(problem.topic) ?? 0;
      const score = record.status === 'mastered'
        ? 100
        : record.status === 'strong'
          ? 80
          : record.status === 'practicing'
            ? 60
            : record.status === 'learning'
              ? 40
              : 10;
      summary.set(problem.topic, current + score);
    });
    return [...summary.entries()].slice(0, 6);
  }, [progress]);

  const currentRecord = progress[selectedProblemId] ?? { ...DEFAULT_PROGRESS };
  const selectedExamples = useMemo(() => getProblemExamples(selectedProblem), [selectedProblem]);
  const activeHints = useMemo(() => getProblemHintsForLanguage(selectedProblem, language), [selectedProblem, language]);
  const activeSolutions = useMemo(() => {
    const migrated = lazySolutionMap[selectedProblem.id]?.[solutionViewLanguage];
    return migrated && migrated.length > 0 ? migrated : getProblemSolutions(selectedProblem, solutionViewLanguage);
  }, [lazySolutionMap, selectedProblem, solutionViewLanguage]);
  const activeSolution = activeSolutions[selectedSolutionIndex]?.code ?? getProblemSolution(selectedProblem, solutionViewLanguage);
  const activeSolutionLabel = activeSolutions[selectedSolutionIndex]?.label ?? 'Basic Solution';
  const activeSolutionRecommendation = activeSolutions[selectedSolutionIndex]?.recommendation ?? 'Best';
  const activeSolutionNote = activeSolutions[selectedSolutionIndex]?.note ?? 'Best interview answer: shortest, clearest, and usually the most optimal for readability and time complexity.';

  useEffect(() => {
    if (!showSolution) {
      setSolutionLoadState('idle');
      return;
    }

    let isCancelled = false;
    setSolutionLoadState('loading');

    loadProblemSolutions(selectedProblem.id, selectedProblem.title)
      .then((loaded) => {
        if (isCancelled) return;
        if (loaded) {
          setLazySolutionMap((current) => ({
            ...current,
            [selectedProblem.id]: loaded,
          }));
          setSolutionLoadState('ready');
          return;
        }
        setSolutionLoadState('error');
      })
      .catch(() => {
        if (!isCancelled) setSolutionLoadState('error');
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedProblem.id, selectedProblem.title, showSolution]);

  const updateProgress = (id: number, patch: Partial<ProgressEntry>) => {
    setProgress((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? { ...DEFAULT_PROGRESS }),
        ...patch,
      },
    }));
  };

  const copyCode = async (code: string, key: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedCodeKey(key);
      window.setTimeout(() => setCopiedCodeKey((current) => current === key ? null : current), 1600);
    } catch {
      setCopiedCodeKey(null);
    }
  };

  const recordHintUsage = () => {
    const record = progress[selectedProblemId] ?? { ...DEFAULT_PROGRESS };
    updateProgress(selectedProblemId, {
      hintsUsed: record.hintsUsed + 1,
      status: record.status === 'not_started' ? 'learning' : record.status,
    });
    setHintIndex((current) => (current + 1) % Math.max(activeHints.length, 1));
  };

  const openQuestion = (id: number) => {
    setSelectedProblemId(id);
    navigateToView('practice');
  };

  const getQuestionSurfOrder = () => {
    const visibleIds = sortedQuestions.map((problem) => problem.id);
    if (visibleIds.length > 0) {
      return visibleIds;
    }
    return problems.map((problem) => problem.id);
  };

  const goToAdjacentQuestion = (direction: -1 | 1) => {
    const orderedIds = getQuestionSurfOrder();
    const currentIndex = orderedIds.indexOf(selectedProblemId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + orderedIds.length) % orderedIds.length;
    const nextId = orderedIds[nextIndex];
    openQuestion(nextId);
  };

  const applySuggestion = (suggestion: string) => {
    const textarea = editorRef.current;
    const value = drafts[selectedProblemId] ?? '';
    const cursor = textarea ? textarea.selectionStart : value.length;
    const beforeCursor = value.slice(0, cursor);
    const match = beforeCursor.match(/[A-Za-z_][A-Za-z0-9_]*$/);
    const start = match ? cursor - match[0].length : cursor;
    const newValue = `${value.slice(0, start)}${suggestion}${value.slice(cursor)}`;

    setDrafts((current) => ({ ...current, [selectedProblemId]: newValue }));
    setAutocompleteSuggestions([]);

    requestAnimationFrame(() => {
      if (textarea) {
        const nextCursor = start + suggestion.length;
        textarea.focus();
        textarea.selectionStart = nextCursor;
        textarea.selectionEnd = nextCursor;
      }
    });
  };

  const toggleTimer = () => {
    setTimerRunning((current) => !current);
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const submitAttempt = () => {
    const record = progress[selectedProblemId] ?? { ...DEFAULT_PROGRESS };
    const nextAttempts = record.attempts + 1;
    const nextSuccess = record.successfulAttempts + 1;
    const nextStatus: ProgressStatus = nextSuccess >= 2 ? 'mastered' : record.confidence >= 4 ? 'strong' : 'practicing';

    updateProgress(selectedProblemId, {
      attempts: nextAttempts,
      successfulAttempts: nextSuccess,
      totalTimeSeconds: record.totalTimeSeconds + timerSeconds,
      confidence: Math.min(5, Math.max(1, Math.round((record.confidence + confidence) / 2))),
      status: nextStatus,
      nextReviewAt: getNextReviewDate({ success: true, hintsUsed: record.hintsUsed, confidence }),
      reviewIntervalDays: Math.max(1, record.reviewIntervalDays + 1),
      lastAttemptedAt: new Date().toISOString(),
    });

    resetTimer();
  };

  const saveNote = () => {
    updateProgress(selectedProblemId, { notes, status: progress[selectedProblemId]?.status ?? 'learning' });
  };

  const exportProgress = () => {
    const exportedAt = new Date();
    const backup = createAppBackup({
      coding: {
        progress: progress as unknown as Record<number, Record<string, unknown> & { important?: boolean; importance?: ProblemImportance | null }>,
        drafts,
        theme: theme as BackupTheme,
        language,
        selectedProblemId,
        mode,
      },
      completeRevisionProgress: loadCompleteRevisionProgress(localStorage),
      interviews: interviewStore,
      jobApplications: jobApplicationStore,
    }, exportedAt.toISOString());
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeLanguageText.exportPrefix}-interview-trainer-full-backup-${formatExportTimestamp(exportedAt)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const beginProgressImport = () => {
    setProgressImportStatus('');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onerror = () => setProgressImportStatus('Could not read that file. No progress was changed.');
      reader.onload = () => {
        const backup = parseAppBackup(String(reader.result ?? ''), problems.map((problem) => problem.id));
        if (!backup) {
          setProgressImportStatus('This backup is invalid or unsupported. No data was changed.');
          return;
        }

        setPendingProgressImport({ fileName: file.name, backup });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const applyProgressImport = (replace: boolean) => {
    if (!pendingProgressImport) return;
    const { backup } = pendingProgressImport;

    if (replace) {
      if (backup.coding) {
        setProgress(replaceProgressRecords(buildDefaultProgressMap(), backup.coding.progress));
        setDrafts(backup.coding.drafts);
        setTheme(backup.coding.theme ?? 'dark');
        setLanguage(backup.coding.language ?? 'kotlin');
        setSelectedProblemId(backup.coding.selectedProblemId ?? 1);
        setMode(backup.coding.mode ?? 'practice');
      }
      if (backup.completeRevisionProgress) saveCompleteRevisionProgress(localStorage, backup.completeRevisionProgress);
      if (backup.interviews) setInterviewStore(backup.interviews);
      if (backup.jobApplications) setJobApplicationStore(backup.jobApplications);
      setProgressImportStatus(`Replaced backup sections: ${backup.sections.map((section) => backupSectionLabels[section]).join(', ')}.`);
    } else {
      if (backup.coding) {
        setProgress((current) => mergeProgressRecords(current, backup.coding!.progress));
        setDrafts((current) => ({ ...current, ...backup.coding!.drafts }));
      }
      if (backup.completeRevisionProgress) {
        saveCompleteRevisionProgress(localStorage, mergeCompleteRevisionProgress(
          loadCompleteRevisionProgress(localStorage),
          backup.completeRevisionProgress,
        ));
      }
      if (backup.interviews) setInterviewStore((current) => mergeInterviewStores(current, backup.interviews!));
      if (backup.jobApplications) setJobApplicationStore((current) => mergeJobApplicationStores(current, backup.jobApplications!));
      setProgressImportStatus(`Merged backup sections: ${backup.sections.map((section) => backupSectionLabels[section]).join(', ')}. Current preferences and schedule were kept.`);
    }

    setPendingProgressImport(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="logo">{activeLanguageText.shortCode}</div>
          <div>
            <p className="eyebrow">{activeLanguageText.appName}</p>
            <h2>Coding practice</h2>
          </div>
        </div>

        <div className={`sidebar-card job-application-sidebar-card${todayJobApplicationProgress.scheduled && todayJobApplicationProgress.completed < todayJobApplicationProgress.total ? ' is-due' : todayJobApplicationProgress.scheduled ? ' is-complete' : ' is-not-due'}`}>
          <div className="job-sidebar-heading">
            <span className="muted-label">Apply for jobs today</span>
            <strong className={todayJobApplicationProgress.scheduled ? 'job-sidebar-status due' : 'job-sidebar-status'}>
              {todayJobApplicationProgress.scheduled ? todayJobApplicationProgress.completed === todayJobApplicationProgress.total ? 'Due · Complete' : 'Due today' : 'Not due'}
            </strong>
          </div>
          <strong>{todayJobApplicationProgress.scheduled ? `${todayJobApplicationProgress.completed}/${todayJobApplicationProgress.total} platform checks` : 'No job-search block today'}</strong>
          <div className="progressbar"><span style={{ width: `${todayJobApplicationProgress.scheduled ? todayJobApplicationProgress.completionPercent : 0}%` }} /></div>
          <div className="job-sidebar-tracks">
            <span>Android {todayJobApplicationProgress.androidCompleted}/3</span>
            <span>Spring Boot {todayJobApplicationProgress.springBootCompleted}/3</span>
          </div>
          <button className="secondary-button" type="button" onClick={() => navigateToView('interviews')}>Open revision checklist</button>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <button
            type="button"
            className={view === 'dashboard' ? 'nav-item nav-overview active' : 'nav-item nav-overview'}
            onClick={() => navigateToView('dashboard')}
          >
            Dashboard
          </button>
          {[
            {
              id: 'coding',
              label: 'Coding',
              items: [
                ['questions', 'Coding Questions'],
                ['practice', 'Coding Practice'],
                ['keywords', 'Keywords'],
                ['reference', 'Syntax'],
              ],
            },
            {
              id: 'interview',
              label: 'Interview Prep',
              items: [
                ['interviews', 'Revision checklist'],
                ['complete-revision', 'Complete revision'],
                ['sample-interview', 'Sample interview'],
              ],
            },
            {
              id: 'workspace',
              label: 'Workspace',
              items: [
                ['analytics', 'Analytics'],
                ['settings', 'Settings'],
              ],
            },
          ].map((group) => (
            <div className={`nav-section nav-section-${group.id}`} key={group.id} role="group" aria-labelledby={`nav-section-${group.id}`}>
              <h3 id={`nav-section-${group.id}`} className="nav-section-heading">{group.label}</h3>
              <div className="nav-section-items">
                {group.items.map(([name, label]) => (
                  <button
                    key={name}
                    type="button"
                    className={view === name ? 'nav-item active' : 'nav-item'}
                    onClick={() => navigateToView(name as View)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="muted-label">Readiness</span>
          <strong>{readyScore}%</strong>
          <div className="progressbar"><span style={{ width: `${readyScore}%` }} /></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className={view === 'reference' ? 'topbar topbar-reference' : 'topbar'}>
          <div>
            <h1>
              {view === 'dashboard' && 'Dashboard'}
              {view === 'questions' && 'Coding Questions'}
              {view === 'practice' && (mode === 'learning' ? 'Learning mode' : 'Coding Practice')}
              {view === 'keywords' && 'Keyword trainer'}
              {view === 'reference' && 'Syntax'}
              {view === 'analytics' && 'Analytics'}
              {view === 'interviews' && 'Revision checklist'}
              {view === 'complete-revision' && 'Complete revision'}
              {view === 'sample-interview' && 'Sample interview'}
              {view === 'settings' && 'Settings'}
            </h1>
          </div>
          {(view === 'practice' || view === 'reference') && (
            <div className="topbar-controls">
              {view === 'practice' && (
                <div className="mode-switch top-mode-switch" role="tablist" aria-label="Training mode">
                  <button type="button" className={mode === 'learning' ? 'mode-button active' : 'mode-button'} onClick={() => setMode('learning')} role="tab" aria-selected={mode === 'learning'}>
                    Learn
                  </button>
                  <button type="button" className={mode === 'practice' ? 'mode-button active' : 'mode-button'} onClick={() => setMode('practice')} role="tab" aria-selected={mode === 'practice'}>
                    Practice
                  </button>
                </div>
              )}
              <div className="language-switch" role="group" aria-label="Programming language">
                {(['kotlin', 'java'] as AppLanguage[]).map((option) => (
                  <button key={option} type="button" className={language === option ? 'language-button active' : 'language-button'} onClick={() => setLanguage(option)}>
                    {languageText[option].primaryLanguage}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {view === 'dashboard' && (
          <div className="content-grid dashboard-grid">
            <section className="card stats-grid">
              <div className="stat-item"><span>Total questions</span><strong>{totalQuestions}</strong></div>
              <div className="stat-item"><span>Completed</span><strong>{completed}</strong></div>
              <div className="stat-item"><span>Remaining</span><strong>{totalQuestions - completed}</strong></div>
              <div className="stat-item"><span>Weak questions</span><strong>{weakQuestions}</strong></div>
              <div className="stat-item"><span>Mastered</span><strong>{masteredQuestions}</strong></div>
              <div className="stat-item"><span>Due today</span><strong>{Math.max(0, weakQuestions - 2)}</strong></div>
              <div className="stat-item"><span>Total practice time</span><strong>{formatSeconds(Object.values(progress).reduce((sum, entry) => sum + entry.totalTimeSeconds, 0))}</strong></div>
              <div className="stat-item"><span>Readiness</span><strong>{readyScore}%</strong></div>
            </section>

            <section className="card section-panel">
              <h3>Today’s Focus</h3>
              <ul className="list-view">
                {dashboardFocus.map((problem) => (
                  <li key={problem.id}>
                    <button className="inline-link" type="button" onClick={() => openQuestion(problem.id)}>#{problem.id} {problem.title}</button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card section-panel">
              <h3>Weak areas</h3>
              <ul className="list-view compact">
                {weakConcepts.length > 0 ? weakConcepts.map(([concept, count]) => (
                  <li key={concept}><span>{concept}</span><strong>{count}</strong></li>
                )) : <li>No weak topics yet.</li>}
              </ul>
            </section>

            <section className="card section-panel wide-panel">
              <h3>What should I learn?</h3>
              <p>Based on your activity, prioritize HashMap patterns, sliding-window questions, and {activeLanguageText.primaryLanguage.toLowerCase()} collection usage.</p>
              <div className="action-row">
                <button className="primary-button" type="button" onClick={() => navigateToView('questions')}>Start 10-Minute Coding Practice</button>
                <button className="secondary-button" type="button" onClick={() => { setMode('learning'); navigateToView('questions'); }}>Start Guided Learning</button>
              </div>
            </section>
          </div>
        )}

        {view === 'questions' && (
          <div className="questions-layout">
            <div className="card toolbar-card">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problem, keyword" aria-label="Search coding questions" />
              <div className="filter-row">
                <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                  <option value="all">All levels</option>
                  {levelMeta.map((level) => <option key={level.level} value={String(level.level)}>Level {level.level}</option>)}
                </select>
                <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
                  <option value="all">All difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="not_started">Not Started</option>
                  <option value="learning">Learning</option>
                  <option value="practicing">Practicing</option>
                  <option value="strong">Strong</option>
                  <option value="mastered">Mastered</option>
                </select>
                <select aria-label="Filter by importance" value={importanceFilter} onChange={(event) => setImportanceFilter(event.target.value as ImportanceFilter)}>
                  <option value="all">All importance</option>
                  <option value="unrated">☆ Not Rated / New</option>
                  {problemImportanceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {'★'.repeat(option.value)} {getProblemImportanceLabel(option.value)}
                    </option>
                  ))}
                </select>
                <select aria-label="Sort by importance" value={importanceSort} onChange={(event) => setImportanceSort(event.target.value as ImportanceSort)}>
                  <option value="default">Default order</option>
                  <option value="highest">★★★★★ Most important first</option>
                  <option value="lowest">★ Least important first</option>
                </select>
                <label><input type="checkbox" checked={showWeakOnly} onChange={(event) => setShowWeakOnly(event.target.checked)} /> Weak only</label>
              </div>
            </div>

            <div className="question-grid">
              {sortedQuestions.map((problem) => {
                const record = progress[problem.id] ?? { ...DEFAULT_PROGRESS };
                return (
                  <article key={problem.id} className="question-card">
                    <button type="button" className="question-card-open" onClick={() => openQuestion(problem.id)}>
                      <div className="card-header">
                        <span className="question-number">#{problem.id}</span>
                        <span className={`status-pill status-${record.status}`}>{record.status.replace('_', ' ')}</span>
                      </div>
                      <h4>{problem.title}</h4>
                      <div className="meta-line"><span>{problem.levelTitle}</span><span>{problem.difficulty}</span></div>
                      <p>{problem.topic}</p>
                      <div className="chip-row">
                        {problem.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="chip">{keyword}</span>)}
                      </div>
                    </button>
                    <ProblemImportanceRating
                      value={record.importance}
                      onChange={(importance) => updateProgress(problem.id, { importance })}
                      compact
                    />
                  </article>
                );
              })}
            </div>
          </div>
        )}

              {view === 'practice' && (
          <div className="practice-layout">
            <section className="card practice-main">
              <div className="problem-header">
                <div>
                  <p className="eyebrow">#{selectedProblem.id} • {selectedProblem.levelTitle}</p>
                </div>
                <div className="badges">
                  <span className="tag">{selectedProblem.difficulty}</span>
                  <span className="tag">{selectedProblem.topic}</span>
                </div>
              </div>

              <div className="question-navigator">
                <button className="secondary-button" type="button" onClick={() => goToAdjacentQuestion(-1)}>
                  ← Previous
                </button>
                <div className="question-navigator-meta">
                  <strong>Question {selectedProblem.id}</strong>
                  <span>
                    {selectedProblem.title}
                  </span>
                </div>
                <button className="primary-button" type="button" onClick={() => goToAdjacentQuestion(1)}>
                  Next →
                </button>
              </div>

              <ProblemImportanceRating
                value={progress[selectedProblem.id]?.importance}
                onChange={(importance) => updateProgress(selectedProblem.id, { importance })}
              />

              {mode === 'learning' ? (
                <div className="simple-learning">
                  <div className="simple-learning-intro">
                    <span className="eyebrow">Question</span>
                    <p className="learning-question-description">{selectedProblem.description}</p>
                  </div>

                  <section className="learning-example">
                    <div className="learning-section-header">
                      <h3>Example</h3>
                      <span className="tag">Input → Output</span>
                    </div>
                    {selectedExamples.map((example, index) => (
                      <div key={`${example.input}-${index}`} className="example-row">
                        <div><span>Input</span><code>{example.input}</code></div>
                        <span className="example-arrow">→</span>
                        <div><span>Output</span><code>{example.output}</code></div>
                      </div>
                    ))}
                  </section>

                  <section className="learning-section">
                    <div className="learning-section-header">
                      <h3>Answer</h3>
                    </div>
                    <div className="learning-solutions-stack">
                      {activeSolutions.map((variant, index) => (
                        <article key={`${variant.label}-${index}`} className="learning-solution-card">
                            {(() => {
                              const complexity = getSolutionComplexity(selectedProblem, variant.code);
                              return (
                                <>
                          <div className="learning-solution-header">
                            <div>
                              <h4>{variant.label}</h4>
                              <span className={`solution-badge ${variant.recommendation.toLowerCase().replace(/\s+/g, '-')}`}>{variant.recommendation}</span>
                            </div>
                            <div className="code-toolbar">
                              <span className="muted-label">{languageText[solutionViewLanguage].primaryLanguage} solution {index + 1}</span>
                              <button
                                className="secondary-button copy-code-button"
                                type="button"
                                onClick={() => copyCode(variant.code, `learning-${selectedProblem.id}-${solutionViewLanguage}-${index}`)}
                              >
                                {copiedCodeKey === `learning-${selectedProblem.id}-${solutionViewLanguage}-${index}` ? 'Copied' : 'Copy code'}
                              </button>
                            </div>
                          </div>
                          <pre className={`code-syntax code-syntax-${solutionViewLanguage}`}>{renderHighlightedCode(variant.code, solutionViewLanguage)}</pre>
                          <div className="solution-flow-block">
                            <span className="muted-label">How this solution works</span>
                            <div className="simple-flow" aria-label={`${variant.label} solution procedure`}>
                              {getSolutionFlow(selectedProblem, variant.label, variant.code).map((node, flowIndex) => (
                                <div key={`${node}-${flowIndex}`} className="simple-flow-step">
                                  <span>{flowIndex + 1}</span>
                                  <strong>{node}</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                            <div className="solution-complexity" aria-label={`${complexity.time} time and ${complexity.space} space`}>
                              <span><strong>Time:</strong> {complexity.time}</span>
                              <span><strong>Space:</strong> {complexity.space}</span>
                          </div>
                                </>
                              );
                            })()}
                        </article>
                      ))}
                    </div>
                  </section>

                </div>
              ) : (
              <>

              <p className="problem-description">{selectedProblem.description}</p>

              <div className="code-block">
                <h4>Example</h4>
                <pre>{selectedExamples[0]?.input ?? ''} → {selectedExamples[0]?.output ?? ''}</pre>
              </div>

              <div className="timer-panel">
                <div>
                  <span className="muted-label">Timer</span>
                  <strong>{formatSeconds(timerSeconds)}</strong>
                </div>
                <div className="timer-actions">
                  <button className="secondary-button" type="button" onClick={toggleTimer}>{timerRunning ? 'Pause' : 'Start'}</button>
                  <button className="secondary-button" type="button" onClick={resetTimer}>Reset</button>
                  <button className="primary-button" type="button" onClick={submitAttempt}>Submit</button>
                </div>
              </div>

              <div className="editor-area">
                <div className="editor-label-row">
                  <label htmlFor="answer-editor">Your answer</label>
                  <div className="editor-label-actions">
                    <span className="editor-language-badge">{languageText[solutionViewLanguage].primaryLanguage}</span>
                    <button
                      className="secondary-button copy-code-button"
                      type="button"
                      disabled={!editorCode.trim()}
                      onClick={() => copyCode(editorCode, `draft-${selectedProblem.id}`)}
                    >
                      {copiedCodeKey === `draft-${selectedProblem.id}` ? 'Copied' : 'Copy code'}
                    </button>
                  </div>
                </div>
                <div className={`editor-shell editor-shell-${solutionViewLanguage}`}>
                  <div className="editor-gutter">
                    <div className="editor-gutter-lines" ref={editorGutterRef}>
                      {Array.from({ length: editorCode.split('\n').length }).map((_, index) => (
                        <span key={index + 1}>{index + 1}</span>
                      ))}
                    </div>
                  </div>
                  <div className="editor-stack">
                    <pre className="editor-highlight" ref={editorHighlightRef} aria-hidden="true">
                      {renderHighlightedCode(editorCode, solutionViewLanguage)}
                    </pre>
                    <textarea
                      id="answer-editor"
                      ref={editorRef}
                      className={`code-editor code-editor-${solutionViewLanguage}`}
                      value={editorCode}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setDrafts((current) => ({ ...current, [selectedProblem.id]: nextValue }));
                        setAutocompleteSuggestions(getAutocompleteSuggestions(nextValue, solutionViewLanguage, event.target.selectionStart ?? nextValue.length));
                      }}
                      onScroll={(event) => {
                        const { scrollTop, scrollLeft } = event.currentTarget;
                        if (editorHighlightRef.current) {
                          editorHighlightRef.current.scrollTop = scrollTop;
                          editorHighlightRef.current.scrollLeft = scrollLeft;
                        }
                        if (editorGutterRef.current) {
                          editorGutterRef.current.style.transform = `translateY(-${scrollTop}px)`;
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Tab' && autocompleteSuggestions[0]) {
                          event.preventDefault();
                          applySuggestion(autocompleteSuggestions[0].label);
                        }
                      }}
                      onClick={() => {
                        const value = drafts[selectedProblem.id] ?? '';
                        setAutocompleteSuggestions(getAutocompleteSuggestions(value, solutionViewLanguage, editorRef.current?.selectionStart ?? value.length));
                      }}
                      onFocus={() => {
                        const value = drafts[selectedProblem.id] ?? '';
                        setAutocompleteSuggestions(getAutocompleteSuggestions(value, solutionViewLanguage, editorRef.current?.selectionStart ?? value.length));
                      }}
                      placeholder={activeLanguageText.practicePlaceholder}
                      spellCheck={false}
                    />
                  </div>
                </div>
                {autocompleteSuggestions.length > 0 && (
                  <div className="autocomplete-panel">
                    {autocompleteSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        className="autocomplete-item"
                        onClick={() => applySuggestion(suggestion.label)}
                      >
                        <span>{suggestion.label}</span>
                        <small>{suggestion.detail}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="action-row">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setHintIndex((value) => Math.min(value + 1, Math.max(activeHints.length - 1, 0)))}
                >
                  Show Hint
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowSolution((current) => !current)}
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
                <button className="secondary-button" type="button" onClick={saveNote}>Save Notes</button>
              </div>

              {activeHints[hintIndex] && (
                <div className="hint-card">
                  <h4>{activeHints[hintIndex].title}</h4>
                  <p>{activeHints[hintIndex].text}</p>
                </div>
              )}

              {showSolution && (
                <div className="solution-card">
                  <div className="solution-header-row">
                    <h4>{languageText[solutionViewLanguage].validationLabel}</h4>
                    <div className="solution-language-switcher">
                      {(['kotlin', 'java'] as AppLanguage[]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={solutionViewLanguage === option ? 'solution-chip active' : 'solution-chip'}
                          onClick={() => {
                            setSolutionViewLanguage(option);
                            setSelectedSolutionIndex(0);
                          }}
                        >
                          {languageText[option].primaryLanguage}
                        </button>
                      ))}
                    </div>
                  </div>

                  {solutionLoadState === 'loading' && (
                    <div className="hint-card">
                      <h4>Loading migrated solution…</h4>
                      <p>Fetching the JSON-backed answer for this question before showing the selected variant.</p>
                    </div>
                  )}
                  {solutionLoadState === 'error' && (
                    <div className="hint-card">
                      <h4>Using fallback solution</h4>
                      <p>The migrated JSON is not available yet for this question, so the app is showing the generated fallback while the migration continues.</p>
                    </div>
                  )}
                  <div className="solution-chip-row">
                    {activeSolutions.map((variant, index) => (
                      <button
                        key={`${variant.label}-${index}`}
                        type="button"
                        className={index === selectedSolutionIndex ? 'solution-chip active' : 'solution-chip'}
                        onClick={() => setSelectedSolutionIndex(index)}
                      >
                        <span>{variant.label}</span>
                        <span className={`solution-badge ${variant.recommendation.toLowerCase().replace(/\s+/g, '-')}`}>
                          {variant.recommendation}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="selected-solution-label">
                    Selected: {activeSolutionLabel} • {languageText[solutionViewLanguage].primaryLanguage}
                  </p>
                  <div className={`solution-rationale solution-rationale-${activeSolutionRecommendation.toLowerCase().replace(/\s+/g, '-')}`}>
                    <strong>{activeSolutionRecommendation}</strong>
                    <span>{activeSolutionNote}</span>
                  </div>
                  <div className="code-block-wrapper">
                    <div className="code-toolbar code-toolbar-floating">
                      <button
                        className="secondary-button copy-code-button"
                        type="button"
                        onClick={() => copyCode(activeSolution, `active-${selectedProblem.id}-${solutionViewLanguage}-${selectedSolutionIndex}`)}
                      >
                        {copiedCodeKey === `active-${selectedProblem.id}-${solutionViewLanguage}-${selectedSolutionIndex}` ? 'Copied' : 'Copy code'}
                      </button>
                    </div>
                    <pre className={`code-syntax code-syntax-${solutionViewLanguage}`}>
                      {renderHighlightedCode(activeSolution, solutionViewLanguage)}
                    </pre>
                  </div>
                  <div className="solution-complexity">
                    <span><strong>Time:</strong> {getSolutionComplexity(selectedProblem, activeSolution).time}</span>
                    <span><strong>Space:</strong> {getSolutionComplexity(selectedProblem, activeSolution).space}</span>
                  </div>
                </div>
              )}

              <div className="self-eval">
                <label htmlFor="confidence">Confidence</label>
                <select id="confidence" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))}>
                  <option value={1}>1 — I had no idea</option>
                  <option value={2}>2 — Needed a lot of help</option>
                  <option value={3}>3 — Solved with hints</option>
                  <option value={4}>4 — Solved independently</option>
                  <option value={5}>5 — Could explain and optimize it</option>
                </select>
              </div>

              <div className="notes-box">
                <label htmlFor="notes-editor">Private notes</label>
                <textarea id="notes-editor" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Write your interview explanation, pitfall, or recall plan here." />
              </div>

              <div className="card summary-panel">
                <h3>Result</h3>
                <div className="mini-metric"><span>Status</span><strong>{currentRecord.status}</strong></div>
                <div className="mini-metric"><span>Attempts</span><strong>{currentRecord.attempts}</strong></div>
                <div className="mini-metric"><span>Hints used</span><strong>{currentRecord.hintsUsed}</strong></div>
                <div className="mini-metric"><span>Best confidence</span><strong>{currentRecord.confidence}/5</strong></div>
                <div className="mini-metric"><span>Next review</span><strong>{currentRecord.nextReviewAt ? new Date(currentRecord.nextReviewAt ?? '').toLocaleDateString() : 'Not scheduled'}</strong></div>
                <h3>Related concepts</h3>
                <ul className="list-view compact">
                  {selectedProblem.concepts.map((concept) => <li key={concept}>{concept}</li>)}
                </ul>
              </div>
              </>
              )}
            </section>
          </div>
        )}

        {view === 'keywords' && (
          <div className="keywords-layout">
            {Object.entries(keywordCatalog).map(([group, items]) => (
              <section key={group} className="card section-panel">
                <h3>{group}</h3>
                <div className="chip-row wrap">
                  {items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="chipButton"
                      onClick={() => {
                        const related = problems.filter((problem) => problem.keywords.includes(item));
                        setSearch(item);
                        navigateToView('questions');
                        if (related[0]) openQuestion(related[0].id);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {view === 'reference' && (
          <div className="reference-layout">
            <div className="reference-page">
              {syntaxReference.map((section) => (
                <section key={section.id} id={`reference-${section.id}`} className="reference-section" aria-labelledby={`reference-heading-${section.id}`}>
                  <h2 id={`reference-heading-${section.id}`}>{section.title}</h2>
                  <div className="reference-grid">
                    {section.concepts.map((concept) => (
                      <section key={concept.id} className="reference-concept" aria-labelledby={`concept-${concept.id}`}>
                        <h3 id={`concept-${concept.id}`}>{concept.title}</h3>
                        <div className="reference-table-scroll" role="region" aria-label={`${concept.title} syntax table`} tabIndex={0}>
                          <table className="reference-table">
                            <thead>
                              <tr>
                                <th scope="col">Use case</th>
                                <th scope="col">Syntax</th>
                                <th scope="col">Return type</th>
                                <th scope="col">Example</th>
                              </tr>
                            </thead>
                            <tbody>
                              {concept.rows[language].map((row, rowIndex) => (
                                <tr key={`${row.useCase}-${row.syntax}`}>
                                  <th scope="row">{row.useCase}</th>
                                  <td><code>{row.syntax}</code></td>
                                  <td><code>{getSyntaxReturnType(concept.id, rowIndex, language)}</code></td>
                                  <td><code>{row.example}</code></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {concept.note?.[language] && <p className="reference-note">{concept.note[language]}</p>}
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <nav className="reference-segment-nav" aria-label="Syntax sections">
              {syntaxReference.map((section) => (
                <a
                  key={section.id}
                  href={`#reference-${section.id}`}
                  className={activeReferenceSection === section.id ? 'active' : undefined}
                  aria-current={activeReferenceSection === section.id ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveReferenceSection(section.id);
                    document.getElementById(`reference-${section.id}`)?.scrollIntoView({
                      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                      block: 'start',
                    });
                    const url = new URL(window.location.href);
                    const hash = `#reference-${section.id}`;
                    if (url.hash !== hash) {
                      url.hash = hash;
                      window.history.pushState({}, '', url);
                    }
                  }}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        )}

        {view === 'analytics' && (
          <div className="content-grid analytics-grid">
            <section className="card section-panel">
              <h3>Completion overview</h3>
              <div className="bar-chart">
                {levelMeta.map((level) => {
                  const questions = problems.filter((problem) => problem.level === level.level);
                  const count = questions.filter((problem) => (progress[problem.id] ?? { ...DEFAULT_PROGRESS }).status !== 'not_started').length;
                  const percentage = Math.round((count / questions.length) * 100);
                  return (
                    <div key={level.level} className="chart-row">
                      <span>Level {level.level}</span>
                      <div className="chart-bar"><span style={{ width: `${percentage}%` }} /></div>
                      <strong>{percentage}%</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card section-panel">
              <h3>Topic mastery</h3>
              <div className="bar-chart">
                {topicMastery.map(([topic, score]) => (
                  <div key={topic} className="chart-row">
                    <span>{topic}</span>
                    <div className="chart-bar"><span style={{ width: `${Math.min(100, score / 5)}%` }} /></div>
                    <strong>{Math.min(100, Math.round(score / 5))}%</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'settings' && (
          <div className="settings-layout">
            <section className="card section-panel">
              <h3>Language</h3>
              <div className="option-row">
                <button className={language === 'kotlin' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => setLanguage('kotlin')}>Kotlin</button>
                <button className={language === 'java' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => setLanguage('java')}>Java</button>
              </div>
            </section>

            <section className="card section-panel">
              <h3>Appearance</h3>
              <div className="option-row">
                <button className={theme === 'dark' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => setTheme('dark')}>Dark</button>
                <button className={theme === 'light' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => setTheme('light')}>Light</button>
                <button className={theme === 'system' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => setTheme('system')}>System</button>
              </div>
            </section>

            <section className="card section-panel">
              <h3>Data</h3>
              <div className="option-row stacked">
                <button className="secondary-button" type="button" onClick={exportProgress}>Export Backup</button>
                <button className="secondary-button" type="button" onClick={beginProgressImport}>Import Backup</button>
                {progressImportStatus && <p className="progress-import-status" role="status">{progressImportStatus}</p>}
                <button className="danger-button" type="button" onClick={() => {
                  if (window.confirm('Reset all progress?')) {
                    setProgress(buildDefaultProgressMap());
                  }
                }}>Reset All Progress</button>
              </div>
            </section>
          </div>
        )}

        {view === 'interviews' && (
          <InterviewPlanner store={interviewStore} onChange={setInterviewStore} jobApplicationStore={jobApplicationStore} onJobApplicationChange={setJobApplicationStore} />
        )}
        {(view === 'complete-revision' || view === 'sample-interview') && (
          <Suspense fallback={<div className="feature-loading" role="status">Loading question bank…</div>}>
            {view === 'complete-revision' ? <CompleteRevision /> : <SampleInterview />}
          </Suspense>
        )}
        {pendingProgressImport && (
          <div className="confirmation-overlay" onKeyDown={(event) => {
            if (event.key === 'Escape') setPendingProgressImport(null);
          }}>
            <section className="confirmation-dialog progress-import-dialog" role="dialog" aria-modal="true" aria-labelledby="progress-import-title" aria-describedby="progress-import-description">
              <p className="eyebrow">Import progress backup</p>
              <h2 id="progress-import-title">How should this file be imported?</h2>
              <p className="confirmation-copy" id="progress-import-description">
                <strong title={pendingProgressImport.fileName}>{pendingProgressImport.fileName}</strong><br />
                Contains: {pendingProgressImport.backup.sections.map((section) => backupSectionLabels[section]).join(', ')}.
              </p>
              <div className="progress-import-choices">
                <div><strong>Merge / Add</strong><span>Add imported records and update matching ones. Keep saved data in sections not included in this file.</span></div>
                <div><strong>Replace</strong><span>Replace only the sections included in this file. Missing records within those sections reset to defaults.</span></div>
              </div>
              <div className="confirmation-actions">
                <button className="secondary-button" type="button" onClick={() => setPendingProgressImport(null)}>Cancel</button>
                <button className="primary-button" type="button" autoFocus onClick={() => applyProgressImport(false)}>Merge / Add</button>
                <button className="danger-button" type="button" onClick={() => applyProgressImport(true)}>Replace</button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
