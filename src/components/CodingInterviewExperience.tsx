import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ErrorInfo, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import type { KotlinCodeMirror, KotlinPlaygroundInstance } from 'kotlin-playground';
import type { MobileCodingVerification, TimedMobileInterviewPrompt } from '../engine/mobile-interview';
import type { MobileCodingQuestion } from '../data/mobile-interview-bank';
import { outputsMatch } from '../utils/output-comparison';
import {
  getProblemExamples,
  getProblemSolutions,
  getSolutionComplexity,
  problems,
  type SolutionLanguage,
  type SolutionVariant,
} from '../data/roadmap';

interface CodingInterviewExperienceProps {
  prompt: TimedMobileInterviewPrompt;
  codingQuestion?: MobileCodingQuestion;
  paused: boolean;
  answerOpen: boolean;
  onPromptChange: (update: Partial<TimedMobileInterviewPrompt>) => void;
  onSubmit: () => void;
  onVerificationResult: (result: 'correct' | 'incorrect') => void;
  onRetryWithExtraTime: () => void;
  onViewAnswer: () => void;
  onHideAnswer: () => void;
  onNext: () => void;
  onTrySolution: (code: string) => void;
  onKeyboardVisibilityChange: (visible: boolean) => void;
}

type CodingRunStatus =
  | 'Running…'
  | 'Success'
  | 'Compile error'
  | 'Runtime error'
  | 'Timed out'
  | 'Offline'
  | 'Service busy'
  | 'Runner unavailable'
  | 'Stopped';

interface CodingRunResult {
  status: CodingRunStatus;
  output: string;
  stderr?: string;
  durationMs?: number;
  matchesExpected?: boolean;
  message?: string;
}

interface JudgeLanguage {
  id: number;
  name: string;
}

interface JudgeSubmission {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  exit_code?: number | null;
  status?: { id?: number; description?: string };
}

interface KotlinPlaygroundModule {
  default: (
    target: string | Node,
    options?: {
      eventFunctions?: {
        getInstance?: (instance: KotlinPlaygroundInstance) => void;
      };
    },
  ) => Promise<unknown[]>;
}

interface KotlinPlaygroundController {
  view?: KotlinPlaygroundInstance;
  destroy(): void;
}

const JUDGE0_URL = 'https://ce.judge0.com';
const JUDGE0_REQUEST_TIMEOUT_MS = 15_000;
const KOTLIN_EXECUTION_TIMEOUT_MS = 10_000;
const SHARED_SYMBOLS = [
  'Tab', '{', '}', '(', ')', '=', ';', '"', "'", '[', ']', '<', '>', ':', '+', '-', '*', '/', '.', ',', '!', '&', '|', '?', '_',
];
const LANGUAGE_SYMBOLS: Record<SolutionLanguage, string[]> = {
  kotlin: ['->', '$', '?.', '?:', '!!'],
  java: ['::', '@', '=='],
};

let javaLanguagePromise: Promise<JudgeLanguage> | undefined;

type CodingIconName = 'close' | 'collapse' | 'copy' | 'expand';

function CodingIcon({ name }: { name: CodingIconName }) {
  const paths: Record<CodingIconName, ReactNode> = {
    close: <path d="m6 6 12 12M18 6 6 18" />,
    collapse: <path d="m7 14 5-5 5 5" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
    expand: <path d="m7 10 5 5 5-5" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function IconAction({ icon, label, title, onClick }: { icon: CodingIconName; label: string; title: string; onClick: () => void }) {
  return (
    <button className="mobile-coding-icon-button" type="button" onClick={onClick} aria-label={label} title={title}>
      <CodingIcon name={icon} />
    </button>
  );
}

export default function CodingInterviewExperience({
  prompt,
  codingQuestion,
  paused,
  answerOpen,
  onPromptChange,
  onSubmit,
  onVerificationResult,
  onRetryWithExtraTime,
  onViewAnswer,
  onHideAnswer,
  onNext,
  onTrySolution,
  onKeyboardVisibilityChange,
}: CodingInterviewExperienceProps) {
  const problem = useMemo(
    () => prompt.codingProblemId === undefined ? undefined : problems.find((item) => item.id === prompt.codingProblemId),
    [prompt.codingProblemId],
  );
  const language = prompt.codingLanguage ?? 'kotlin';
  const code = prompt.codingAnswers?.[language] ?? '';
  const examples = useMemo(
    () => problem ? getProblemExamples(problem) : codingQuestion?.examples ?? [],
    [codingQuestion, problem],
  );
  const solutions = useMemo(() => problem ? {
    kotlin: getProblemSolutions(problem, 'kotlin'),
    java: getProblemSolutions(problem, 'java'),
  } : codingQuestion?.solutions ?? { kotlin: [], java: [] }, [codingQuestion, problem]);
  const problemTitle = problem?.title ?? codingQuestion?.title ?? prompt.text;
  const problemDescription = problem?.description ?? codingQuestion?.description ?? prompt.text;
  const expectedOutput = examples[0]?.output;
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [editorFocused, setEditorFocused] = useState(false);
  const problemCollapsed = prompt.codingProblemCollapsed ?? false;
  const [problemCardSticky, setProblemCardSticky] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [outputPromptId, setOutputPromptId] = useState<string | null>(null);
  const [result, setResult] = useState<CodingRunResult | null>(() => prompt.codingVerification
    ? {
        status: prompt.codingVerification.status === 'unavailable' ? 'Runner unavailable' : 'Success',
        output: prompt.codingVerification.output,
        ...(prompt.codingVerification.status !== 'unavailable'
          ? { matchesExpected: prompt.codingVerification.status === 'correct' }
          : {}),
        ...(prompt.codingVerification.message ? { message: prompt.codingVerification.message } : {}),
        ...(prompt.codingVerification.stderr ? { stderr: prompt.codingVerification.stderr } : {}),
      }
    : null);
  const [runnerLoadError, setRunnerLoadError] = useState('');
  const [editorReady, setEditorReady] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [editorSize, setEditorSize] = useState<'normal' | 'big'>('normal');
  const [solutionIndices, setSolutionIndices] = useState<Partial<Record<SolutionLanguage, number>>>({});
  const [answerCollapsed, setAnswerCollapsed] = useState(true);
  const [answerCopyNotice, setAnswerCopyNotice] = useState('');
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationDialogPromptId, setVerificationDialogPromptId] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState('');
  const [verificationRetrying, setVerificationRetrying] = useState(false);
  const [solutionPreviewActive, setSolutionPreviewActive] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const problemCardRef = useRef<HTMLElement | null>(null);
  const kotlinInstanceRef = useRef<KotlinPlaygroundInstance | null>(null);
  const codeMirrorRef = useRef<KotlinCodeMirror | null>(null);
  const onCodeChangeRef = useRef<(value: string) => void>(() => undefined);
  const currentCodeRef = useRef(code);
  const runTokenRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutTriggeredRef = useRef(false);
  const verificationPromptRef = useRef<string | null>(null);
  const autoVerifyPromptRef = useRef<string | null>(null);
  const onVerificationResultRef = useRef(onVerificationResult);
  const editorPaused = paused && !solutionPreviewActive;
  const canRetryWithExtraTime = prompt.timeExpired && !prompt.codingRetryUsed;

  const saveCode = useCallback((value: string) => {
    setResult(null);
    onPromptChange({
      codingAnswers: { ...prompt.codingAnswers, [language]: value },
      codingVerification: undefined,
      answerResult: undefined,
    });
  }, [language, onPromptChange, prompt.codingAnswers]);
  onCodeChangeRef.current = saveCode;
  currentCodeRef.current = code;
  onVerificationResultRef.current = onVerificationResult;

  useEffect(() => {
    if (!copyNotice) return undefined;
    const timeout = window.setTimeout(() => setCopyNotice(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [copyNotice]);

  useEffect(() => {
    const updateKeyboardInset = () => {
      const viewport = window.visualViewport;
      const inset = viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;
      const visible = inset > 120;
      setKeyboardInset(visible ? inset : 0);
      onKeyboardVisibilityChange(visible);
    };
    updateKeyboardInset();
    window.addEventListener('resize', updateKeyboardInset);
    window.addEventListener('orientationchange', updateKeyboardInset);
    window.visualViewport?.addEventListener('resize', updateKeyboardInset);
    window.visualViewport?.addEventListener('scroll', updateKeyboardInset);
    return () => {
      window.removeEventListener('resize', updateKeyboardInset);
      window.removeEventListener('orientationchange', updateKeyboardInset);
      window.visualViewport?.removeEventListener('resize', updateKeyboardInset);
      window.visualViewport?.removeEventListener('scroll', updateKeyboardInset);
      onKeyboardVisibilityChange(false);
    };
  }, [onKeyboardVisibilityChange]);

  useEffect(() => {
    if (!problemCardRef.current || problemCollapsed) {
      setProblemCardSticky(false);
      return undefined;
    }
    const card = problemCardRef.current;
    const measure = () => {
      const content = card.querySelector<HTMLElement>('.mobile-coding-problem-content');
      const contentFits = !content || content.scrollHeight <= content.clientHeight + 1;
      setProblemCardSticky(contentFits && card.getBoundingClientRect().height <= window.innerHeight * 0.4);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [problem, problemCollapsed]);

  useEffect(() => {
    if (language !== 'kotlin') {
      setEditorReady(false);
      return undefined;
    }
    let cancelled = false;
    let instance: KotlinPlaygroundInstance | null = null;
    let changeHandler: (() => void) | null = null;
    const host = hostRef.current;
    if (!host) return undefined;
    const editorElement = document.createElement('code');
    editorElement.id = `kotlin-editor-${prompt.id.replace(/[^a-zA-Z0-9_-]/g, '-')}-${editorResetKey}`;
    editorElement.setAttribute('theme', 'darcula');
    editorElement.setAttribute('auto-indent', 'true');
    editorElement.setAttribute('match-brackets', 'true');
    editorElement.setAttribute('data-autocomplete', 'false');
    editorElement.setAttribute('folded-button', 'false');
    editorElement.setAttribute('lines', 'true');
    editorElement.textContent = '// ';
    host.replaceChildren(editorElement);
    let playgroundDestroyed = false;
    const destroyPlayground = () => {
      if (playgroundDestroyed) return;
      const controller = (editorElement as HTMLElement & { KotlinPlayground?: KotlinPlaygroundController }).KotlinPlayground;
      if (controller) {
        controller.destroy();
        playgroundDestroyed = true;
      } else if (instance) {
        instance.destroy();
        playgroundDestroyed = true;
      }
    };
    setEditorReady(false);
    setRunnerLoadError('');

    void import('kotlin-playground')
      .then(async (loaded) => {
        if (cancelled) return;
        const playground = (loaded as KotlinPlaygroundModule).default;
        await playground(editorElement, {
          eventFunctions: {
            getInstance: (created) => {
              instance = created;
            },
          },
        });
        const controller = (editorElement as HTMLElement & { KotlinPlayground?: KotlinPlaygroundController }).KotlinPlayground;
        instance ??= controller?.view ?? null;
        if (cancelled) {
          destroyPlayground();
          return;
        }
        if (!instance) throw new Error('Kotlin Playground did not create an editor instance.');
        const playgroundWrapper = host.querySelector<HTMLElement>('.executable-fragment-wrapper');
        if (playgroundWrapper) playgroundWrapper.style.marginBottom = '0';
        kotlinInstanceRef.current = instance;
        const editor = instance.codemirror;
        codeMirrorRef.current = editor;
        editor.setOption('theme', 'darcula');
        editor.setOption('matchBrackets', true);
        editor.setOption('autoCloseBrackets', true);
        editor.setOption('indentUnit', 4);
        editor.setOption('lineWrapping', false);
        editor.setValue(currentCodeRef.current);
        changeHandler = () => onCodeChangeRef.current(editor.getValue());
        editor.on('change', changeHandler);
        setEditorReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Kotlin Playground failed to initialize.', error);
        setRunnerLoadError('Couldn’t load the Kotlin runner.');
      });

    return () => {
      cancelled = true;
      if (instance) {
        if (changeHandler) instance.codemirror.off('change', changeHandler);
        instance.codemirror.off('change');
      }
      destroyPlayground();
      if (kotlinInstanceRef.current === instance) kotlinInstanceRef.current = null;
      codeMirrorRef.current = null;
      host.replaceChildren();
    };
  }, [editorResetKey, language, prompt.id]);

  useEffect(() => {
    if (language !== 'kotlin') return;
    const editor = codeMirrorRef.current;
    if (editor && editor.getValue() !== code) editor.setValue(code);
  }, [code, language]);

  useEffect(() => {
    if (!solutionPreviewActive) return;
    if (language === 'kotlin') codeMirrorRef.current?.focus();
    else textAreaRef.current?.focus();
  }, [code, language, solutionPreviewActive]);

  useEffect(() => {
    codeMirrorRef.current?.setOption('readOnly', editorPaused);
  }, [editorPaused, language]);

  useEffect(() => {
    setSolutionIndices({});
    setAnswerCollapsed(true);
    setAnswerCopyNotice('');
  }, [prompt.id]);

  useEffect(() => () => {
    runTokenRef.current += 1;
    abortControllerRef.current?.abort();
  }, []);

  const setLanguage = (nextLanguage: SolutionLanguage) => {
    onPromptChange({ codingLanguage: nextLanguage });
  };

  const updateJavaCode = (value: string) => saveCode(value);

  const insertJavaText = (text: string, cursorOffset = text.length) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.setRangeText(text, start, end, 'end');
    const cursor = start + cursorOffset;
    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    saveCode(textarea.value);
    textarea.focus();
  };

  const insertAtCursor = (symbol: string) => {
    if (language === 'kotlin') {
      const editor = codeMirrorRef.current;
      if (!editor) return;
      const cursor = editor.getCursor('from');
      const pairedClose: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
      const close = pairedClose[symbol];
      editor.replaceSelection(close ? `${symbol}${close}` : symbol);
      if (close) editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
      editor.focus();
      return;
    }
    const textarea = textAreaRef.current;
    if (!textarea) return;
    const pairClose: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
    const close = pairClose[symbol];
    insertJavaText(close ? `${symbol}${close}` : symbol, close ? 1 : symbol.length);
  };

  const onJavaKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    if (event.key === 'Tab') {
      event.preventDefault();
      insertJavaText('    ');
      return;
    }
    if (['}', ')', ']'].includes(event.key) && start === end && value[start] === event.key) {
      event.preventDefault();
      textarea.setSelectionRange(start + 1, start + 1);
      return;
    }
    const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
    if (pairs[event.key]) {
      event.preventDefault();
      insertJavaText(`${event.key}${pairs[event.key]}`, 1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const before = value.slice(0, start);
      const after = value.slice(end);
      const currentLine = before.slice(before.lastIndexOf('\n') + 1);
      const indentation = currentLine.match(/^[ \t]*/)?.[0] ?? '';
      if (before.endsWith('{') && after.startsWith('}')) {
        const inserted = `\n${indentation}    \n${indentation}`;
        insertJavaText(inserted, 1 + indentation.length + 4);
      } else {
        insertJavaText(`\n${indentation}`);
      }
    }
  };

  const insertSymbol = (symbol: string) => {
    if (symbol === 'Tab') {
      insertAtCursor('    ');
    } else {
      insertAtCursor(symbol);
    }
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutputPromptId(prompt.id);
      setResult({ status: 'Runtime error', output: '', message: 'No code was entered, so there is nothing to run.' });
      return;
    }
    if (verificationPromptRef.current !== prompt.id) {
      onPromptChange({ codingVerification: undefined, answerResult: undefined });
    }
    if (!navigator.onLine) {
      setOutputPromptId(prompt.id);
      setResult({ status: 'Offline', output: '', message: 'You appear to be offline. Code running needs a connection.' });
      return;
    }
    const token = ++runTokenRef.current;
    setIsRunning(true);
    setOutputPromptId(prompt.id);
    setResult({ status: 'Running…', output: '' });
    const startedAt = performance.now();
    timeoutTriggeredRef.current = false;

    if (language === 'kotlin') {
      const instance = kotlinInstanceRef.current;
      if (!instance) {
        setIsRunning(false);
        setResult({
          status: 'Runner unavailable',
          output: '',
          message: runnerLoadError || 'Couldn’t load the Kotlin runner.',
        });
        return;
      }
      try {
        if (instance.getCode().trim() === '') {
          setIsRunning(false);
          setResult({ status: 'Runtime error', output: '', message: 'No code to check yet. Add your solution in the editor, then try again.' });
          return;
        }
        instance.execute();
        const deadline = Date.now() + KOTLIN_EXECUTION_TIMEOUT_MS;
        while (instance.state.waitingForOutput !== false && Date.now() < deadline) {
          await wait(100);
          if (token !== runTokenRef.current) return;
        }
        if (token !== runTokenRef.current) return;
        if (instance.state.waitingForOutput !== false) {
          setResult({
            status: 'Timed out',
            output: '',
            message: 'Timed out. Check for an infinite loop.',
            durationMs: Math.round(performance.now() - startedAt),
          });
          setEditorResetKey((current) => current + 1);
          return;
        }
        const errors = Array.isArray(instance.state.errors)
          ? instance.state.errors.filter((error) => error.severity === 'ERROR').map((error) => error.message ?? '')
          : [];
        const output = htmlToText(typeof instance.state.output === 'string' ? instance.state.output : '');
        const exception = typeof instance.state.exception === 'string' ? instance.state.exception : '';
        const status: CodingRunStatus = errors.length > 0
          ? 'Compile error'
          : exception
            ? 'Runtime error'
            : 'Success';
        setResult({
          status,
          output,
          ...(errors.length > 0 ? { stderr: errors.join('\n') } : {}),
          ...(exception ? { stderr: exception } : {}),
          durationMs: Math.round(performance.now() - startedAt),
          ...(status === 'Success' && expectedOutput !== undefined
            ? { matchesExpected: outputsMatch(output, expectedOutput) }
            : {}),
        });
      } catch (error) {
        if (token !== runTokenRef.current) return;
        setResult({
          status: 'Runner unavailable',
          output: '',
          message: error instanceof Error ? error.message : 'Couldn’t run Kotlin code.',
          durationMs: Math.round(performance.now() - startedAt),
        });
      } finally {
        if (token === runTokenRef.current) setIsRunning(false);
      }
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => {
      timeoutTriggeredRef.current = true;
      controller.abort();
    }, JUDGE0_REQUEST_TIMEOUT_MS);
    try {
      const javaLanguage = await getJavaLanguage(controller.signal);
      const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          source_code: code,
          language_id: javaLanguage.id,
          stdin: prompt.codingStdin ?? '',
          cpu_time_limit: 10,
          wall_time_limit: 12,
        }),
      });
      if (token !== runTokenRef.current) return;
      if (response.status === 429 || response.status >= 500) {
        setResult({
          status: 'Service busy',
          output: '',
          message: 'The free service is busy. Try again in a few seconds.',
          durationMs: Math.round(performance.now() - startedAt),
        });
        return;
      }
      if (!response.ok) {
        throw new Error(`Judge0 returned HTTP ${response.status}.`);
      }
      const submission = await response.json() as JudgeSubmission;
      if (token !== runTokenRef.current) return;
      const statusId = submission.status?.id;
      const output = submission.stdout ?? '';
      const stderr = submission.compile_output || submission.stderr || '';
      const status: CodingRunStatus = statusId === 6
        ? 'Compile error'
        : statusId === 5
          ? 'Timed out'
          : (statusId !== undefined && statusId >= 7) || (submission.exit_code !== null && submission.exit_code !== undefined && submission.exit_code !== 0)
            ? 'Runtime error'
            : 'Success';
      setResult({
        status,
        output,
        ...(stderr ? { stderr } : {}),
        durationMs: Math.round(performance.now() - startedAt),
        ...(status === 'Success' && expectedOutput !== undefined
          ? { matchesExpected: outputsMatch(output, expectedOutput) }
          : {}),
        ...(status === 'Timed out' ? { message: 'Timed out. Check for an infinite loop.' } : {}),
      });
    } catch (error) {
      if (token !== runTokenRef.current) return;
      if (controller.signal.aborted) {
        setResult({
          status: timeoutTriggeredRef.current ? 'Timed out' : 'Stopped',
          output: '',
          message: timeoutTriggeredRef.current
            ? 'Timed out. Check for an infinite loop.'
            : 'Run stopped.',
          durationMs: Math.round(performance.now() - startedAt),
        });
      } else if (!navigator.onLine) {
        setResult({
          status: 'Offline',
          output: '',
          message: 'You appear to be offline. Code running needs a connection.',
        });
      } else if (isServiceBusyError(error)) {
        setResult({
          status: 'Service busy',
          output: '',
          message: 'The free service is busy. Try again in a few seconds.',
          durationMs: Math.round(performance.now() - startedAt),
        });
      } else {
        console.error('Java code runner failed.', error);
        setResult({
          status: 'Runner unavailable',
          output: '',
          message: error instanceof Error
            ? `Couldn’t load the Java runner: ${error.message}`
            : 'Couldn’t load the Java runner.',
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
      if (token === runTokenRef.current) setIsRunning(false);
    }
  };

  const stopRun = () => {
    runTokenRef.current += 1;
    abortControllerRef.current?.abort();
    setIsRunning(false);
    setResult({ status: 'Stopped', output: '', message: 'Run stopped.' });
    if (language === 'kotlin') setEditorResetKey((current) => current + 1);
  };

  const handleSubmit = () => {
    verificationPromptRef.current = prompt.id;
    autoVerifyPromptRef.current = prompt.id;
    setVerificationDialogPromptId(prompt.id);
    setVerificationRetrying(false);
    onPromptChange({ codingVerification: undefined, answerResult: undefined });
    setVerificationOpen(true);
    onSubmit();
    if (code.trim()) void runCode();
    else setResult(null);
  };

  const retryVerification = () => {
    verificationPromptRef.current = prompt.id;
    setVerificationDialogPromptId(prompt.id);
    setVerificationRetrying(true);
    onPromptChange({ codingVerification: undefined, answerResult: undefined });
    if (code.trim()) void runCode();
    else setResult(null);
  };

  const retryWithExtraTime = () => {
    autoVerifyPromptRef.current = null;
    verificationPromptRef.current = null;
    setVerificationOpen(false);
    setVerificationDialogPromptId(null);
    setVerificationRetrying(false);
    setOutputPromptId(null);
    setResult(null);
    onRetryWithExtraTime();
  };

  const getQuestionDetails = () => [
    `Question: ${problemTitle}`,
    problemDescription ? `Description:\n${problemDescription}` : '',
    examples.length > 0
      ? `Examples:\n${examples.map((example, index) => (
          `${examples.length > 1 ? `Example ${index + 1}\n` : ''}Input: ${example.input}\nExpected output: ${example.output}`
        )).join('\n\n')}`
      : '',
  ].filter(Boolean).join('\n\n');

  const getRunDetails = () => [
    getQuestionDetails(),
    `Language: ${language === 'kotlin' ? 'Kotlin' : 'Java'}`,
    `Written code:\n${code.trim() || '(no code entered)'}`,
    result ? `Run status: ${result.status}` : '',
    result?.matchesExpected !== undefined ? `Verification: ${result.matchesExpected ? 'Correct' : 'Incorrect'}` : '',
    result?.output ? `Program output:\n${result.output.trim()}` : '',
    result?.stderr ? `Error details:\n${result.stderr.trim()}` : '',
    result?.message ? `Runner message:\n${result.message}` : '',
    prompt.codingStdin ? `Input (stdin):\n${prompt.codingStdin}` : '',
  ].filter(Boolean).join('\n\n');

  const copyText = async (text: string, successMessage: string) => {
    try {
      await copyToClipboard(text);
      setCopyNotice(successMessage);
    } catch (error) {
      console.error('Could not copy coding interview text.', error);
      setCopyNotice('Could not copy. Please select and copy the text manually.');
    }
  };

  useEffect(() => {
    setOutputPromptId(null);
    setVerificationOpen(false);
    setVerificationDialogPromptId(null);
    setSolutionPreviewActive(false);
    verificationPromptRef.current = null;
    autoVerifyPromptRef.current = null;
    setResult(prompt.codingVerification
      ? {
          status: prompt.codingVerification.status === 'unavailable' ? 'Runner unavailable' : 'Success',
          output: prompt.codingVerification.output,
          ...(prompt.codingVerification.status !== 'unavailable'
            ? { matchesExpected: prompt.codingVerification.status === 'correct' }
            : {}),
          ...(prompt.codingVerification.message ? { message: prompt.codingVerification.message } : {}),
          ...(prompt.codingVerification.stderr ? { stderr: prompt.codingVerification.stderr } : {}),
        }
      : null);
  }, [prompt.id]);

  useEffect(() => {
    if (!prompt.timeExpired || prompt.codingVerification || autoVerifyPromptRef.current === prompt.id) return;
    autoVerifyPromptRef.current = prompt.id;
    verificationPromptRef.current = prompt.id;
    setVerificationDialogPromptId(prompt.id);
    setVerificationRetrying(false);
    setVerificationOpen(true);
    if (code.trim()) void runCode();
    else setResult(null);
  }, [prompt.id, prompt.timeExpired, prompt.codingVerification, code]);

  useEffect(() => {
    if (verificationPromptRef.current !== prompt.id || !result || result.status === 'Running…') return;
    if (result?.status === 'Success' && result.matchesExpected !== undefined) {
      const status = result.matchesExpected ? 'correct' : 'incorrect';
      onPromptChange({
        codingVerification: {
          status,
          output: result.output,
        },
      });
      onVerificationResultRef.current(status);
    } else {
      onPromptChange({
        codingVerification: {
          status: 'unavailable',
          output: result.output,
          ...(result.message ? { message: result.message } : {}),
          ...(result.stderr ? { stderr: result.stderr } : {}),
        },
      });
    }
    verificationPromptRef.current = null;
    setVerificationRetrying(false);
  }, [onPromptChange, prompt.id, result]);

  const insertTemplate = () => {
    if (code.trim() && !window.confirm('Replace the code you have typed with a runnable template?')) return;
    saveCode(getTemplate(language, problemTitle));
    if (language === 'kotlin') codeMirrorRef.current?.focus();
    else textAreaRef.current?.focus();
  };

  const resetCode = () => {
    if (!window.confirm('Clear this editor and restore its original empty starting code?')) return;
    saveCode('');
    if (language === 'kotlin') codeMirrorRef.current?.focus();
    else textAreaRef.current?.focus();
  };

  const setCollapsed = () => {
    const collapsed = !problemCollapsed;
    onPromptChange({ codingProblemCollapsed: collapsed });
  };

  const activeSolutions = solutions[language];
  const selectedSolution = activeSolutions[solutionIndices[language] ?? 0] ?? activeSolutions[0];

  const openReferenceAnswer = () => {
    setVerificationOpen(false);
    onViewAnswer();
  };

  const closeReferenceAnswer = () => {
    setVerificationOpen(true);
    onHideAnswer();
  };

  const tryReferenceSolution = () => {
    if (!selectedSolution) return;
    onTrySolution(makeRunnableSolution(selectedSolution.code, language));
    setSolutionPreviewActive(true);
    setVerificationOpen(false);
    setOutputPromptId(null);
    setResult(null);
    verificationPromptRef.current = null;
  };

  const codeStyle = { '--mobile-coding-keyboard-inset': `${keyboardInset}px` } as CSSProperties;

  if (!problem && !codingQuestion) {
    return (
      <section className="mobile-coding-error" role="alert">
        <h3>Coding question unavailable</h3>
        <p>This question’s programming data could not be loaded. Your interview is still available.</p>
      </section>
    );
  }

  return (
    <section className={`mobile-coding-experience${answerOpen ? ' is-answer-open' : ''}${editorFocused ? ' is-editor-focused' : ''}`} style={codeStyle}>
      <article
        ref={problemCardRef}
        className={`mobile-coding-problem${problemCollapsed ? ' is-collapsed' : ''}${problemCardSticky ? ' is-sticky' : ''}`}
      >
        <header>
          <div className="mobile-coding-problem-heading">
            {problem && <span className="mobile-coding-eyebrow">{problem.difficulty} · {problem.levelTitle}</span>}
            <h3>{problemTitle}</h3>
          </div>
          <div className="mobile-coding-problem-actions">
            <button
              className="mobile-coding-icon-button"
              type="button"
              onClick={() => void copyText(getQuestionDetails(), 'Question and examples copied.')}
              aria-label="Copy question and examples"
              title="Copy question"
            >
              <CodingIcon name="copy" />
            </button>
            <button
              className="mobile-coding-icon-button"
              type="button"
              onClick={setCollapsed}
              aria-expanded={!problemCollapsed}
              aria-label={problemCollapsed ? 'Expand question details' : 'Collapse question details'}
              title={problemCollapsed ? 'Expand question details' : 'Collapse question details'}
            >
              <CodingIcon name={problemCollapsed ? 'expand' : 'collapse'} />
            </button>
          </div>
        </header>
        {!problemCollapsed && (
          <div className="mobile-coding-problem-content">
            <p>{problemDescription}</p>
            {examples.map((example, index) => (
              <div className="mobile-coding-example" key={`${prompt.id}-${index}`}>
                {examples.length > 1 && <strong>Example {index + 1}</strong>}
                <div><span>Input</span><code>{example.input}</code></div>
                <div><span>Expected Output</span><code>{example.output}</code></div>
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="mobile-coding-editor-toolbar">
        <div className="mobile-coding-language-switch" role="group" aria-label="Editor language">
          {(['kotlin', 'java'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={language === option ? 'is-selected' : ''}
              aria-pressed={language === option}
              onClick={() => setLanguage(option)}
            >
              {option === 'kotlin' ? 'Kotlin' : 'Java'}
            </button>
          ))}
        </div>
        <div className="mobile-coding-language-switch mobile-coding-size-switch" role="group" aria-label="Playground size">
          {(['normal', 'big'] as const).map((size) => (
            <button
              key={size}
              type="button"
              className={editorSize === size ? 'is-selected' : ''}
              aria-pressed={editorSize === size}
              onClick={() => setEditorSize(size)}
            >
              {size === 'normal' ? 'Normal' : 'Big'}
            </button>
          ))}
        </div>
      </div>

      <section
        className={`mobile-coding-editor-shell${editorSize === 'big' ? ' is-big' : ''}`}
        aria-label={`${language === 'kotlin' ? 'Kotlin' : 'Java'} code editor`}
        onFocus={() => setEditorFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEditorFocused(false);
        }}
      >
        {language === 'kotlin' ? (
          <>
            <div className={`mobile-coding-kotlin-editor${editorReady ? ' is-ready' : ''}`}>
              <div ref={hostRef} className="mobile-coding-kotlin-host" />
              {editorReady && !code.trim() && <span className="mobile-coding-kotlin-placeholder">Write your code here…</span>}
              {!editorReady && !runnerLoadError && <p className="mobile-coding-editor-loading" role="status">Loading Kotlin editor…</p>}
              {runnerLoadError && (
                <div className="mobile-coding-runner-fallback">
                  <p role="alert">{runnerLoadError} You can still edit and copy your code.</p>
                  <textarea
                    value={code}
                    onChange={(event) => saveCode(event.target.value)}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    aria-label="Kotlin code editor fallback"
                  />
                  <button type="button" className="mobile-coding-small-button" onClick={() => setEditorResetKey((current) => current + 1)}>Retry</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <textarea
            ref={textAreaRef}
            className="mobile-coding-java-editor"
            value={code}
            onChange={(event) => updateJavaCode(event.target.value)}
            onKeyDown={onJavaKeyDown}
            placeholder="Write your code here…"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            inputMode="text"
            enterKeyHint="enter"
            aria-label="Java code editor"
            disabled={editorPaused}
          />
        )}
      </section>

      <div className="mobile-coding-action-row">
        <div className="mobile-coding-primary-actions">
          <button type="button" className="primary-button" onClick={() => void runCode()} disabled={editorPaused || isRunning || !code.trim()}>
            {isRunning ? 'Running…' : 'Run'}
          </button>
          <button type="button" className="primary-button mobile-interview-submit" onClick={handleSubmit} disabled={paused || isRunning}>
            Submit
          </button>
        </div>
        <div className={`mobile-coding-secondary-actions${code.trim() ? ' has-code' : ''}`}>
          {code.trim() && (
            <button
              type="button"
              className="mobile-coding-icon-button"
              onClick={() => void copyText(code, 'Your code was copied.')}
              aria-label="Copy written code"
              title="Copy code"
            >
              <CodingIcon name="copy" />
            </button>
          )}
          <button type="button" className="secondary-button" onClick={insertTemplate} disabled={editorPaused}>Insert template</button>
          <button type="button" className="secondary-button" onClick={resetCode} disabled={editorPaused}>Clear</button>
        </div>
      </div>
      {copyNotice && <p className="mobile-coding-copy-notice" role="status" aria-live="polite">{copyNotice}</p>}

      <div className="mobile-coding-bottom-space" aria-hidden="true" />

      {outputPromptId === prompt.id && (
        <section className="mobile-coding-output-drawer" role="region" aria-label="Program output">
          <header>
            <div>
              <strong>Output</strong>
              {result && <span className={`mobile-coding-status is-${statusClass(result.status)}`} aria-live="polite">{result.status}{result.durationMs !== undefined ? ` · ${formatDuration(result.durationMs)}` : ''}</span>}
            </div>
            <div className="mobile-coding-output-actions">
              {result && <IconAction icon="copy" label="Copy question, code, output, and errors" title="Copy all" onClick={() => void copyText(getRunDetails(), 'Question, code, output, and errors copied.')} />}
              <IconAction icon="close" label="Close program output" title="Close output" onClick={() => setOutputPromptId(null)} />
            </div>
          </header>
          {copyNotice && <p className="mobile-coding-copy-notice" role="status">{copyNotice}</p>}
          {language === 'java' && (
            <label className="mobile-coding-stdin">
              <span>Input (stdin)</span>
              <textarea
                value={prompt.codingStdin ?? ''}
                onChange={(event) => onPromptChange({
                  codingStdin: event.target.value,
                  codingVerification: undefined,
                  answerResult: undefined,
                })}
                placeholder="Optional input passed to your program"
                disabled={isRunning}
              />
            </label>
          )}
          {result?.message && <p className="mobile-coding-result-message">{result.message}</p>}
          {result?.stderr && <pre className="mobile-coding-stderr">{result.stderr}</pre>}
          {result?.output && <pre className="mobile-coding-output-text">{result.output}</pre>}
          {result?.status === 'Success' && result.matchesExpected !== undefined && (
            <div className={`mobile-coding-expected-check ${result.matchesExpected ? 'is-match' : 'is-different'}`}>
              <strong role="status">{result.matchesExpected ? 'Correct answer' : 'Incorrect answer'}</strong>
              <div><span>Your output</span><code>{result.output.trim() || '(empty)'}</code></div>
              <div><span>Expected</span><code>{expectedOutput?.trim() || '(empty)'}</code></div>
            </div>
          )}
          {(result?.status === 'Service busy' || result?.status === 'Runner unavailable') && (
            <button className="secondary-button" type="button" onClick={() => void runCode()} disabled={isRunning}>Retry</button>
          )}
        </section>
      )}

      <div
        className="mobile-coding-symbol-bar"
        role="toolbar"
        aria-label="Code symbols and run"
        onMouseDown={(event) => event.preventDefault()}
      >
        <div className="mobile-coding-symbol-scroll">
          {[...SHARED_SYMBOLS, ...LANGUAGE_SYMBOLS[language]].map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => insertSymbol(symbol)}
              aria-label={symbol === 'Tab' ? 'Insert four spaces' : `Insert ${symbol}`}
            >
              {symbol}
            </button>
          ))}
        </div>
        <button
          className="mobile-coding-run-button"
          type="button"
          onClick={() => void runCode()}
          disabled={isRunning || !code.trim() || editorPaused}
          aria-label={isRunning ? 'Code is running' : 'Run code'}
        >
          {isRunning ? <span className="mobile-coding-spinner" aria-hidden="true" /> : <span aria-hidden="true">▶</span>}
          {isRunning ? 'Running' : 'Run'}
        </button>
        {isRunning && (
          <button
            className="mobile-coding-run-button is-stop"
            type="button"
            onClick={stopRun}
          >
            Stop
          </button>
        )}
      </div>

      {verificationOpen && !answerOpen && verificationDialogPromptId === prompt.id && (
        <div className="mobile-coding-verification-overlay" role="dialog" aria-modal="true" aria-labelledby={`coding-verification-title-${prompt.id}`}>
          <section className="mobile-coding-verification-card">
            {isRunning ? (
              <>
                <span className="mobile-coding-verification-spinner" aria-hidden="true" />
                <p className="mobile-coding-eyebrow">{prompt.timeExpired ? 'Time is up' : 'Answer submitted'}</p>
                <h2 id={`coding-verification-title-${prompt.id}`}>{verificationRetrying ? 'Checking again…' : 'Checking your program…'}</h2>
                <p>{verificationRetrying ? 'Your code is running again. Please wait for the result.' : 'Your code is running. This may take a few seconds.'}</p>
                <div className="mobile-coding-verification-progress" role="progressbar" aria-label="Verifying program" />
              </>
            ) : !code.trim() ? (
              <>
                <span className="mobile-coding-verification-icon is-unknown" aria-hidden="true">⌛</span>
                <p className="mobile-coding-eyebrow">{prompt.timeExpired ? 'Time is up' : 'Skipped · no code entered'}</p>
                <h2 id={`coding-verification-title-${prompt.id}`}>{prompt.timeExpired ? 'Time is up' : 'Question skipped'}</h2>
                {canRetryWithExtraTime && <button type="button" className="secondary-button mobile-coding-retry-button" onClick={retryWithExtraTime}>Try again (+25% time)</button>}
                {selectedSolution && <button type="button" className="secondary-button" onClick={openReferenceAnswer}>View answer</button>}
                <button type="button" className="primary-button" onClick={onNext}>Next question</button>
              </>
            ) : result?.matchesExpected !== undefined && result.status === 'Success' ? (
              <>
                <span className={`mobile-coding-verification-icon ${result.matchesExpected ? 'is-correct' : 'is-incorrect'}`} aria-hidden="true">{result.matchesExpected ? '✓' : '×'}</span>
                <p className="mobile-coding-eyebrow">{prompt.timeExpired ? 'Time is up' : 'Answer checked'}</p>
                <h2 id={`coding-verification-title-${prompt.id}`}>{result.matchesExpected ? 'Correct answer!' : 'Incorrect answer'}</h2>
                <p>{result.matchesExpected ? 'Your program output matches the expected answer.' : 'Your program output does not match the expected answer.'}</p>
                <div className="mobile-coding-verification-output">
                  <div><strong>Your output</strong><code>{result.output.trim() || '(empty)'}</code></div>
                  <div><strong>Expected output</strong><code>{expectedOutput?.trim() || '(not provided)'}</code></div>
                </div>
                <div className="mobile-coding-verification-actions">
                  <IconAction icon="copy" label="Copy question, code, output, and errors" title="Copy all" onClick={() => void copyText(getRunDetails(), 'Question, code, output, and errors copied.')} />
                  {selectedSolution && <button type="button" className="secondary-button" onClick={openReferenceAnswer}>View answer</button>}
                </div>
                {copyNotice && <p className="mobile-coding-copy-notice" role="status" aria-live="polite">{copyNotice}</p>}
                {canRetryWithExtraTime && <button type="button" className="secondary-button mobile-coding-retry-button" onClick={retryWithExtraTime}>Try again (+25% time)</button>}
                <button type="button" className="primary-button" onClick={onNext}>Next question</button>
              </>
            ) : (
              <>
                <span className="mobile-coding-verification-icon is-unknown" aria-hidden="true">!</span>
                <p className="mobile-coding-eyebrow">{prompt.timeExpired ? 'Time is up' : 'Answer submitted'}</p>
                <h2 id={`coding-verification-title-${prompt.id}`}>Could not verify your answer</h2>
                <p>{result?.message || result?.stderr || 'The program did not produce a verifiable result. Check the run output and try again.'}</p>
                {result && (
                  <div className="mobile-coding-verification-actions">
                    <IconAction icon="copy" label="Copy question, code, output, and errors" title="Copy all" onClick={() => void copyText(getRunDetails(), 'Question, code, output, and errors copied.')} />
                    {selectedSolution && <button type="button" className="secondary-button" onClick={openReferenceAnswer}>View answer</button>}
                  </div>
                )}
                {copyNotice && <p className="mobile-coding-copy-notice" role="status" aria-live="polite">{copyNotice}</p>}
                {canRetryWithExtraTime && <button type="button" className="secondary-button mobile-coding-retry-button" onClick={retryWithExtraTime}>Try again (+25% time)</button>}
                {!prompt.timeExpired && (
                  <button type="button" className="secondary-button mobile-coding-retry-button" onClick={retryVerification} disabled={isRunning || !code.trim()}>
                    {verificationRetrying ? <><span className="mobile-coding-spinner" aria-hidden="true" />Checking…</> : 'Check again'}
                  </button>
                )}
                <button type="button" className="primary-button" onClick={onNext}>Next question</button>
              </>
            )}
          </section>
        </div>
      )}

      {answerOpen && selectedSolution && (
        <div className="mobile-coding-answer-overlay" role="dialog" aria-modal="true" aria-labelledby={`coding-answer-title-${prompt.id}`}>
          <section className="mobile-coding-answer-sheet">
            <header className="mobile-coding-answer-header">
              <div>
                <span className="mobile-coding-eyebrow">Reference solutions</span>
                <h2 id={`coding-answer-title-${prompt.id}`}>{problemTitle}</h2>
              </div>
              <div className="mobile-coding-language-switch" role="group" aria-label="Answer language">
                {(['kotlin', 'java'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={language === option ? 'is-selected' : ''}
                    aria-pressed={language === option}
                    onClick={() => setLanguage(option)}
                  >
                    {option === 'kotlin' ? 'Kotlin' : 'Java'}
                  </button>
                ))}
              </div>
            </header>
            <div className="mobile-coding-answer-content">
              {activeSolutions.length > 1 && (
                <div className="mobile-coding-solution-chips" role="tablist" aria-label="Solution variants">
                  {activeSolutions.map((solution, index) => (
                    <button
                      key={`${language}-${solution.label}`}
                      role="tab"
                      aria-selected={(solutionIndices[language] ?? 0) === index}
                      className={(solutionIndices[language] ?? 0) === index ? 'is-selected' : ''}
                      type="button"
                      onClick={() => setSolutionIndices((current) => ({ ...current, [language]: index }))}
                    >
                      {solution.label}{solution.recommendation === 'Best' ? ' ★' : ''}
                    </button>
                  ))}
                </div>
              )}
              <div className="mobile-coding-answer-code">
                <button
                  type="button"
                  className="mobile-coding-icon-button"
                  onClick={() => void copySolution(selectedSolution, setAnswerCopyNotice)}
                  aria-label="Copy reference solution"
                  title="Copy solution"
                >
                  <CodingIcon name="copy" />
                </button>
                <pre><code>{selectedSolution.code}</code></pre>
              </div>
              {answerCopyNotice && <p className="mobile-coding-copy-notice" role="status">{answerCopyNotice}</p>}
              <p className="mobile-coding-complexity">
                {(() => {
                  const complexity = problem
                    ? getSolutionComplexity(problem, selectedSolution.code)
                    : getMobileSolutionComplexity(selectedSolution.note);
                  return <><span>Time {complexity.time}</span><span>Space {complexity.space}</span></>;
                })()}
              </p>
              <details className="mobile-coding-your-answer" open={!answerCollapsed} onToggle={(event) => setAnswerCollapsed(!event.currentTarget.open)}>
                <summary>Your answer</summary>
                <pre>{prompt.codingAnswers?.[language]?.trim() || 'No code entered.'}</pre>
              </details>
              <button
                type="button"
                className="secondary-button mobile-coding-try-solution"
                onClick={tryReferenceSolution}
              >
                Try this in the editor
              </button>
            </div>
            <footer className="mobile-coding-answer-footer">
              <button
                type="button"
                className="mobile-coding-icon-button"
                onClick={closeReferenceAnswer}
                aria-label="Close reference answer"
                title="Close answer"
              >
                <CodingIcon name="close" />
              </button>
              <button type="button" className="primary-button" onClick={onNext}>Next question</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export class CodingInterviewErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mobile Interview coding area crashed.', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mobile-coding-error" role="alert">
          <h3>Coding area could not be displayed</h3>
          <p>Your interview and saved editor code are still available.</p>
          <button type="button" className="secondary-button" onClick={() => this.setState({ hasError: false })}>Retry</button>
        </section>
      );
    }
    return this.props.children;
  }
}

function getTemplate(language: SolutionLanguage, title: string): string {
  const safeTitle = title.replace(/[\r\n]/g, ' ');
  if (language === 'kotlin') {
    return `fun main() {\n    // Implement ${safeTitle}\n}`;
  }
  return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement ${safeTitle}\n    }\n}`;
}

function getMobileSolutionComplexity(note: string): { time: string; space: string } {
  const match = note.match(/Time:\s*(.*?)\s*[·|,]\s*Space:\s*(.*)$/i);
  return match
    ? { time: match[1].trim(), space: match[2].trim() }
    : { time: 'N/A', space: 'N/A' };
}

function makeRunnableSolution(code: string, language: SolutionLanguage): string {
  if (language === 'kotlin') {
    if (/\bfun\s+main\s*\(/.test(code)) return code;
    if (!/\bfun\s+\w+\s*\(/.test(code)) {
      return `fun main() {\n${code.split('\n').map((line) => `    ${line}`).join('\n')}\n}`;
    }
    return `${code.trim()}\n\nfun main() {\n    // Call the solution with the sample input here.\n}`;
  }
  if (/\bstatic\s+void\s+main\s*\(/.test(code)) return code;
  const imports = code.match(/^\s*import\s+[^;]+;\s*$/gm) ?? [];
  const body = code.replace(/^\s*import\s+[^;]+;\s*$/gm, '').trim();
  const isMethodSolution = /\b(?:public|private|protected)?\s*(?:static\s+)?[\w<>?,.[\]]+\s+\w+\s*\([^;]*\)\s*(?:throws\s+[\w, ]+\s*)?\{/m.test(body);
  if (!isMethodSolution && !/\bclass\s+\w+/.test(body)) {
    const statements = body.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed || /[;{}]\s*$/.test(trimmed) || trimmed.startsWith('//')) return line;
      return `${line};`;
    });
    return `${[...imports, 'import java.util.*;'].join('\n')}\n\npublic class Main {\n    public static void main(String[] args) {\n${statements.map((line) => `        ${line}`).join('\n')}\n    }\n}`;
  }
  return `${[...imports, 'import java.util.*;', 'import java.util.stream.*;'].join('\n')}\n\npublic class Main {\n${body.split('\n').map((line) => `    ${line}`).join('\n')}\n\n    public static void main(String[] args) {\n        // Call the solution with the sample input here.\n    }\n}`;
}

async function getJavaLanguage(signal: AbortSignal): Promise<JudgeLanguage> {
  if (!javaLanguagePromise) {
    javaLanguagePromise = fetch(`${JUDGE0_URL}/languages`, { signal })
      .then(async (response) => {
        if (response.status === 429 || response.status >= 500) throw new Error(`Judge0 returned HTTP ${response.status}.`);
        if (!response.ok) throw new Error(`Judge0 returned HTTP ${response.status}.`);
        const languages = await response.json() as unknown;
        if (!Array.isArray(languages)) throw new Error('Judge0 returned an unexpected languages response.');
        const javaLanguages = languages.filter((item): item is JudgeLanguage => (
          typeof item === 'object'
          && item !== null
          && Number.isInteger((item as JudgeLanguage).id)
          && typeof (item as JudgeLanguage).name === 'string'
          && /^Java\b/i.test((item as JudgeLanguage).name)
        ));
        javaLanguages.sort((first, second) => compareJavaVersions(javaVersion(second.name), javaVersion(first.name)));
        const newestJava = javaLanguages[0];
        if (!newestJava) throw new Error('Judge0 did not list a Java language.');
        return newestJava;
      })
      .catch((error: unknown) => {
        javaLanguagePromise = undefined;
        throw error;
      });
  }
  return javaLanguagePromise;
}

function javaVersion(name: string): number[] {
  const match = name.match(/(?:JDK|OpenJDK)\s*([0-9]+(?:\.[0-9]+)*)/i) ?? name.match(/([0-9]+(?:\.[0-9]+)*)/);
  return match ? match[1].split('.').map((part) => Number(part)) : [0];
}

function compareJavaVersions(first: number[], second: number[]): number {
  for (let index = 0; index < Math.max(first.length, second.length); index += 1) {
    const difference = (first[index] ?? 0) - (second[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function isServiceBusyError(error: unknown): boolean {
  return error instanceof Error && /HTTP (429|5\d\d)/.test(error.message);
}

function htmlToText(value: string): string {
  const parsed = new DOMParser().parseFromString(value, 'text/html');
  return parsed.body.textContent ?? '';
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function formatDuration(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

function statusClass(status: CodingRunStatus): string {
  return status.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

async function copySolution(solution: SolutionVariant, setNotice: (notice: string) => void): Promise<void> {
  try {
    await copyToClipboard(solution.code);
    setNotice('Solution copied.');
  } catch (error) {
    console.error('Could not copy the coding solution.', error);
    setNotice('Could not copy the solution. Select and copy the code manually.');
  }
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for mobile browsers that expose clipboard but reject writes outside secure contexts.
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  let copied = false;
  try {
    textarea.select();
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }
  if (!copied) throw new Error('Clipboard copy was not available.');
}
