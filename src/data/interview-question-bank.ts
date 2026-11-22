import { parse as parseHtml, type DefaultTreeAdapterTypes } from 'parse5';

export type QuestionCategoryId = 'java' | 'kotlin' | 'android' | 'testing' | 'general';

export interface InterviewQuestion {
  id: string;
  displayId?: string;
  categoryId: QuestionCategoryId;
  category: string;
  section?: string;
  prompt: string;
  answerMarkdown: string;
  answerHtml?: string;
  hasAnswer: boolean;
  hasAddedAnswer: boolean;
  hasAdditionalNotes: boolean;
}

type HtmlNode = DefaultTreeAdapterTypes.Node;
type HtmlElement = DefaultTreeAdapterTypes.Element;
type SourceMode = 'none' | 'study' | 'interview-sets';

const htmlSources = import.meta.glob('../../Files/Checklist/Android/Interview Questions Android/InterviewQuestionsAndroid.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const sourceHtml = Object.values(htmlSources)[0];
if (!sourceHtml) throw new Error('Complete Revision source HTML is missing.');

export function parseInterviewQuestionHtml(html: string): InterviewQuestion[] {
  const document = parseHtml(html);
  const body = findElement(document, 'body');
  if (!body) throw new Error('Complete Revision source HTML has no body element.');
  const monospaceClasses = getMonospaceClasses(document);

  const questions: InterviewQuestion[] = [];
  const sectionCounts = new Map<string, number>();
  const children = body.childNodes.filter(isElement);
  let mode: SourceMode = 'none';
  let topSection = '';
  let subsection = '';
  let includeSection = false;

  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    if (!isElement(node)) continue;

    const headingText = normalizeText(getText(node));
    if (node.tagName === 'h1') {
      if (headingText.toLowerCase() === 'explanations & studies') mode = 'study';
      else if (headingText.toLowerCase().startsWith('interview question sets')) mode = 'interview-sets';
      else mode = 'none';
      topSection = '';
      subsection = '';
      includeSection = false;
      continue;
    }

    if (node.tagName === 'h2') {
      subsection = '';
      if (mode === 'study' && headingText) {
        if (isStudySection(headingText)) {
          topSection = headingText;
          includeSection = true;
        } else {
          topSection = headingText;
          includeSection = false;
        }
      } else if (mode === 'interview-sets' && /^Set\s+\d+\s*:/i.test(headingText)) {
        topSection = headingText;
        includeSection = true;
      } else if (headingText) {
        topSection = headingText;
        includeSection = false;
      }
      continue;
    }

    if (node.tagName === 'h3') {
      subsection = headingText;
      continue;
    }

    if (mode === 'interview-sets' && isElement(node) && node.tagName === 'p') {
      const prompt = normalizeText(getText(node));
      if (isInterviewSetQuestionParagraph(prompt)) {
        const answerNodes: HtmlNode[] = [];
        for (let answerIndex = index + 1; answerIndex < children.length; answerIndex += 1) {
          const answerNode = children[answerIndex];
          if (isSectionHeading(answerNode) || isQuestionList(answerNode) || isInterviewSetQuestionParagraph(normalizeText(getText(answerNode)))) break;
          answerNodes.push(answerNode);
        }
        const answerHtml = serializeSafeChildren(answerNodes, monospaceClasses);
        const answerText = normalizeAnswerText(answerNodes.map(getText).join(''));
        const section = [topSection, subsection].filter(Boolean).join(' / ');
        const sequence = (sectionCounts.get(topSection) ?? 0) + 1;
        sectionCounts.set(topSection, sequence);
        const { categoryId, prefix } = getCategoryInfo(topSection);
        const displayId = `${prefix}${String(sequence).padStart(3, '0')}`;
        const id = `html-${slugify(topSection)}-${String(sequence).padStart(3, '0')}`;
        questions.push({
          id,
          displayId,
          categoryId,
          category: getCategoryLabel(categoryId),
          section,
          prompt,
          answerMarkdown: answerText,
          answerHtml: answerText || /<img\b/i.test(answerHtml) ? answerHtml : undefined,
          hasAnswer: Boolean(answerText || /<img\b/i.test(answerHtml)),
          hasAddedAnswer: false,
          hasAdditionalNotes: false,
        });
        continue;
      }
    }

    if (mode === 'none' || !includeSection || !isQuestionList(node)) continue;

    if (mode === 'interview-sets') {
      const listItems = getChildNodes(node).filter(isElement).filter((child) => child.tagName === 'li');
      const answerNodes: HtmlNode[] = [];
      for (let answerIndex = index + 1; answerIndex < children.length; answerIndex += 1) {
        const answerNode = children[answerIndex];
        if (isSectionHeading(answerNode) || isQuestionList(answerNode)) break;
        answerNodes.push(answerNode);
      }
      const answerHtml = serializeSafeChildren(answerNodes, monospaceClasses);
      const answerText = normalizeAnswerText(answerNodes.map(getText).join(''));
      const hasAnswer = Boolean(answerText || /<img\b/i.test(answerHtml));
      for (const listItem of listItems) {
        const prompt = normalizeText(getText(listItem));
        if (!prompt) continue;

        const section = [topSection, subsection].filter(Boolean).join(' / ');
        const sequence = (sectionCounts.get(topSection) ?? 0) + 1;
        sectionCounts.set(topSection, sequence);
        const { categoryId, prefix } = getCategoryInfo(topSection);
        const displayId = `${prefix}${String(sequence).padStart(3, '0')}`;
        const id = `html-${slugify(topSection)}-${String(sequence).padStart(3, '0')}`;

        questions.push({
          id,
          displayId,
          categoryId,
          category: getCategoryLabel(categoryId),
          section,
          prompt,
          answerMarkdown: answerText,
          answerHtml: hasAnswer ? answerHtml : undefined,
          hasAnswer,
          hasAddedAnswer: false,
          hasAdditionalNotes: false,
        });
      }
      continue;
    }

    const prompt = normalizeText(getText(getFirstElement(node, 'li')));
    if (!prompt) continue;

    const answerNodes: HtmlNode[] = [];
    let answerText = '';
    for (let answerIndex = index + 1; answerIndex < children.length; answerIndex += 1) {
      const answerNode = children[answerIndex];
      if (isQuestionList(answerNode)) break;
      if (isSectionHeading(answerNode)) continue;
      answerNodes.push(answerNode);
      answerText += getText(answerNode);
    }
    const answerHtml = serializeSafeChildren(answerNodes, monospaceClasses);
    answerText = normalizeAnswerText(answerText);

    const section = [topSection, subsection].filter(Boolean).join(' / ');
    const sequence = (sectionCounts.get(topSection) ?? 0) + 1;
    sectionCounts.set(topSection, sequence);
    const { categoryId, prefix } = getCategoryInfo(topSection);
    const displayId = `${prefix}${String(sequence).padStart(3, '0')}`;
    const id = `html-${slugify(topSection)}-${String(sequence).padStart(3, '0')}`;
    const hasAnswer = Boolean(answerText || /<img\b/i.test(answerHtml));

    questions.push({
      id,
      displayId,
      categoryId,
      category: getCategoryLabel(categoryId),
      section,
      prompt,
      answerMarkdown: answerText,
      answerHtml,
      hasAnswer,
      hasAddedAnswer: false,
      hasAdditionalNotes: false,
    });
  }

  return questions;
}

export function parseInterviewQuestionMarkdown(markdown: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  let category: { id: QuestionCategoryId; title: string } | undefined;
  let current: Omit<InterviewQuestion, 'answerMarkdown' | 'hasAnswer' | 'hasAddedAnswer' | 'hasAdditionalNotes'> | undefined;
  let answerLines: string[] = [];
  let readingAnswer = false;
  let codeFence: { character: string; length: number } | undefined;

  const finishQuestion = () => {
    if (!current || !category) return;
    const answerMarkdown = answerLines.join('\n').trim();
    questions.push({
      ...current,
      answerMarkdown,
      hasAnswer: answerMarkdown.length > 0,
      hasAddedAnswer: />\s*✦\s*\*\*Added answer\*\*/i.test(answerMarkdown),
      hasAdditionalNotes: />\s*✦\s*\*\*Additional notes\*\*/i.test(answerMarkdown),
    });
  };

  for (const line of markdown.split(/\r?\n/)) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (codeFence) {
      if (readingAnswer) answerLines.push(line);
      if (fence && fence[1][0] === codeFence.character && fence[1].length >= codeFence.length) codeFence = undefined;
      continue;
    }
    if (fence) {
      if (readingAnswer) answerLines.push(line);
      codeFence = { character: fence[1][0], length: fence[1].length };
      continue;
    }

    const categoryHeading = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (categoryHeading) {
      finishQuestion();
      current = undefined;
      answerLines = [];
      readingAnswer = false;
      category = getMarkdownCategory(categoryHeading[1]);
      continue;
    }

    const questionHeading = line.match(/^###\s+([A-Z]\d{3})\.\s+(.+?)\s*$/);
    if (questionHeading) {
      finishQuestion();
      current = category ? {
        id: questionHeading[1],
        categoryId: category.id,
        category: category.title,
        prompt: questionHeading[2],
      } : undefined;
      answerLines = [];
      readingAnswer = false;
      continue;
    }

    if (/^Answer:\s*$/.test(line)) {
      readingAnswer = true;
      continue;
    }

    if (readingAnswer) answerLines.push(line);
  }

  finishQuestion();
  return questions;
}

function isStudySection(title: string): boolean {
  return ['JAVA', 'KOTLIN', 'ANDROID', 'TESTING', 'GIT', 'Programming', 'iOS Development - swift'].includes(title);
}

function getCategoryInfo(section: string): { categoryId: QuestionCategoryId; prefix: string } {
  const normalized = section.toLowerCase();
  if (normalized === 'java') return { categoryId: 'java', prefix: 'J' };
  if (normalized === 'kotlin') return { categoryId: 'kotlin', prefix: 'K' };
  if (normalized === 'android') return { categoryId: 'android', prefix: 'A' };
  if (normalized === 'testing') return { categoryId: 'testing', prefix: 'T' };
  if (normalized === 'git') return { categoryId: 'general', prefix: 'G' };
  if (normalized === 'programming') return { categoryId: 'general', prefix: 'P' };
  if (normalized.startsWith('ios development')) return { categoryId: 'general', prefix: 'I' };
  const setNumber = section.match(/^Set\s+(\d+)/i)?.[1];
  return { categoryId: 'general', prefix: setNumber ? `S${setNumber}-` : 'G' };
}

function getCategoryLabel(categoryId: QuestionCategoryId): string {
  if (categoryId === 'java') return 'Java';
  if (categoryId === 'kotlin') return 'Kotlin';
  if (categoryId === 'android') return 'Android';
  if (categoryId === 'testing') return 'Testing & Others';
  return 'General / Project / HR';
}

function getMarkdownCategory(title: string): { id: QuestionCategoryId; title: string } | undefined {
  const normalized = title.toLowerCase();
  if (normalized === 'java') return { id: 'java', title };
  if (normalized === 'kotlin') return { id: 'kotlin', title };
  if (normalized === 'android') return { id: 'android', title };
  if (normalized.includes('testing')) return { id: 'testing', title };
  if (normalized.includes('general')) return { id: 'general', title };
  return undefined;
}

function isQuestionList(node: HtmlNode): node is HtmlElement {
  if (!isElement(node) || node.tagName !== 'ol') return false;
  return /(?:^|\s)lst-kix_[^\s]*-0(?:\s|$)/.test(getAttribute(node, 'class') ?? '');
}

function isInterviewSetQuestionParagraph(text: string): boolean {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (/^(?:Output|Result|Example|Explanation|Answer|Note)\b/i.test(normalized)) return false;
  return normalized.endsWith('?')
    || /^(?:Find|Write|Code|Explain|What|Why|How|Can|Does|Tell|Which|Difference|Using|Using an example)\b/i.test(normalized);
}

function isSectionHeading(node: HtmlNode): boolean {
  return isElement(node) && ['h1', 'h2', 'h3'].includes(node.tagName);
}

function isElement(node: HtmlNode): node is HtmlElement {
  return 'tagName' in node;
}

function findElement(node: HtmlNode, tagName: string): HtmlElement | undefined {
  if (isElement(node) && node.tagName === tagName) return node;
  for (const child of getChildNodes(node)) {
    const match = findElement(child, tagName);
    if (match) return match;
  }
  return undefined;
}

function getFirstElement(node: HtmlNode, tagName: string): HtmlElement | undefined {
  return getChildNodes(node).filter(isElement).find((child) => child.tagName === tagName);
}

function getChildNodes(node: HtmlNode): HtmlNode[] {
  return 'childNodes' in node ? node.childNodes : [];
}

function getAttribute(node: HtmlElement, name: string): string | undefined {
  return node.attrs.find((attribute) => attribute.name === name)?.value;
}

function getText(node: HtmlNode | undefined): string {
  if (!node) return '';
  if (node.nodeName === '#text') return 'value' in node ? node.value : '';
  if (!('childNodes' in node)) return '';
  const separator = isElement(node) && ['br', 'li', 'p', 'tr'].includes(node.tagName) ? '\n' : '';
  return node.childNodes.map(getText).join(separator);
}

const allowedTags = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h3', 'h4', 'h5', 'hr', 'i', 'img',
  'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'u', 'ul',
]);
const voidTags = new Set(['br', 'hr', 'img']);
const allowedStyleProperties = new Set([
  'background-color', 'border', 'border-collapse', 'color', 'display', 'font-size', 'font-style',
  'font-weight', 'height', 'margin', 'margin-left', 'margin-top', 'max-width', 'overflow', 'padding',
  'text-align', 'text-decoration', 'transform', 'vertical-align', 'width',
]);

function serializeSafeHtml(node: HtmlNode, monospaceClasses: ReadonlySet<string>): string {
  if (node.nodeName === '#text') return escapeHtml('value' in node ? node.value : '');
  if (!isElement(node)) return '';
  if (['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'].includes(node.tagName)) return '';
  if (node.tagName === 'pre') {
    return `<pre class="question-answer-code"><code>${highlightSourceCode(getCodeBlockText(node))}</code></pre>`;
  }
  if (node.tagName === 'code') {
    return `<code class="answer-code">${highlightSourceCode(getCodeText(node))}</code>`;
  }
  if (node.tagName === 'p' && isCodeParagraph(node, monospaceClasses)) {
    return `<pre class="question-answer-code"><code>${highlightSourceCode(getCodeBlockText(node))}</code></pre>`;
  }
  if (node.tagName === 'span') {
    const imageCrop = getImageCrop(node);
    if (imageCrop) {
      const { image, frameWidth, frameHeight, imageWidth, imageHeight, imageLeft, imageTop } = imageCrop;
      const imageHtml = serializeSafeHtml(image, monospaceClasses).replace(
        /\/?>$/,
        ` style="position: absolute; width: ${toPercent(imageWidth, frameWidth)}%; height: ${toPercent(imageHeight, frameHeight)}%; left: ${toPercent(imageLeft, frameWidth)}%; top: ${toPercent(imageTop, frameHeight)}%; margin: 0" />`,
      );
      return `<div class="question-answer-image-frame" style="aspect-ratio: ${frameWidth} / ${frameHeight}">${imageHtml}</div>`;
    }
  }
  const serializedChildren = serializeSafeChildren(node.childNodes, monospaceClasses);
  const innerHtml = node.tagName === 'p' ? formatInlineCodeFragments(serializedChildren) : serializedChildren;
  if (node.tagName === 'span') {
    const formatted = isMonospaceSpan(node, monospaceClasses)
      ? `<code class="answer-code">${highlightSourceCode(getCodeText(node))}</code>`
      : innerHtml;
    return (getAttribute(node, 'class') ?? '').split(/\s+/).includes('c12') ? `<strong>${formatted}</strong>` : formatted;
  }
  if (!allowedTags.has(node.tagName)) return innerHtml;

  const attributes: string[] = [];
  for (const attribute of node.attrs) {
    const { name, value } = attribute;
    let safeValue: string | undefined;
    if (name === 'src' && node.tagName === 'img') {
      const imageName = value.match(/(?:^|\/)(image\d+\.(?:png|jpe?g|gif|webp))$/i)?.[1];
      if (imageName) safeValue = `/interview-source-image/${imageName}`;
    } else if (name === 'href' && node.tagName === 'a' && /^(https?:|mailto:)/i.test(value)) {
      safeValue = value;
    } else if (['alt', 'title', 'colspan', 'rowspan', 'start', 'type'].includes(name)) {
      safeValue = value;
    } else if (name === 'style') {
      if (node.tagName !== 'img') safeValue = sanitizeStyle(value);
    }

    if (safeValue) attributes.push(`${name}="${escapeHtml(safeValue)}"`);
  }

  const openTag = `<${node.tagName}${attributes.length ? ` ${attributes.join(' ')}` : ''}>`;
  if (node.tagName === 'table') {
    return `<div class="question-answer-table-scroll">${openTag}${innerHtml}</${node.tagName}></div>`;
  }
  return voidTags.has(node.tagName) ? openTag : `${openTag}${innerHtml}</${node.tagName}>`;
}

function serializeSafeChildren(children: HtmlNode[], monospaceClasses: ReadonlySet<string>): string {
  let html = '';
  for (let index = 0; index < children.length;) {
    const child = children[index];
    if (isCodeParagraph(child, monospaceClasses)) {
      const paragraphs: HtmlElement[] = [];
      let nextIndex = index;
      while (nextIndex < children.length) {
        const candidate = children[nextIndex];
        if (isCodeParagraph(candidate, monospaceClasses)) {
          if (isElement(candidate)) paragraphs.push(candidate);
          nextIndex += 1;
          continue;
        }

        const blankParagraphs: HtmlElement[] = [];
        let afterGap = nextIndex;
        while (afterGap < children.length) {
          const gapNode = children[afterGap];
          if (isWhitespaceText(gapNode)) {
            afterGap += 1;
          } else if (isBlankParagraph(gapNode)) {
            blankParagraphs.push(gapNode);
            afterGap += 1;
          } else {
            break;
          }
        }
        if (blankParagraphs.length && isCodeParagraph(children[afterGap], monospaceClasses)) {
          paragraphs.push(...blankParagraphs);
          nextIndex = afterGap;
          continue;
        }
        if (afterGap > nextIndex && blankParagraphs.length === 0 && isCodeParagraph(children[afterGap], monospaceClasses)) {
          nextIndex = afterGap;
          continue;
        }
        break;
      }
      const code = paragraphs.map(getCodeBlockText).join('\n');
      html += `<pre class="question-answer-code"><code>${highlightSourceCode(code)}</code></pre>`;
      index = nextIndex;
      continue;
    }

    if (isElement(child) && isMonospaceSpan(child, monospaceClasses)) {
      let code = getCodeText(child);
      let nextIndex = index + 1;
    while (nextIndex < children.length) {
      const sibling = children[nextIndex];
      if (!isElement(sibling) || !isMonospaceSpan(sibling, monospaceClasses)) break;
      code += getCodeText(sibling);
      nextIndex += 1;
    }
      html += `<code class="answer-code">${highlightSourceCode(code)}</code>`;
      index = nextIndex;
      continue;
    }

    html += serializeSafeHtml(child, monospaceClasses);
    index += 1;
  }
  return html;
}

function isMonospaceSpan(node: HtmlElement, monospaceClasses: ReadonlySet<string>): boolean {
  return node.tagName === 'span'
    && (getAttribute(node, 'class') ?? '').split(/\s+/).some((className) => monospaceClasses.has(className));
}

function isCodeParagraph(node: HtmlNode | undefined, monospaceClasses: ReadonlySet<string>): node is HtmlElement {
  return node !== undefined
    && isElement(node)
    && node.tagName === 'p'
    && (isCodeOnly(node, monospaceClasses) || isCodeLikeParagraph(node));
}

function isCodeLikeParagraph(node: HtmlElement): boolean {
  const text = getCodeBlockText(node).trim();
  const startsWithDeclaration = /^(?:@\w|(?:public|private|protected|static|final|abstract|class|interface|enum|fun|expect|actual|val|var|return|int|new|suspend|data|sealed|object|override|import)\b|[A-Z][\w$<>?,.[\]]*\s+[A-Za-z_$][\w$]*\s*=|[{}];?$)/;
  const startsWithCall = /^\.?[A-Za-z_$][\w$.]*\s*\([^;\n]*\)\s*(?:\{|;|->|$)/;
  return /^\s*\/\//.test(text)
    || (/[{}();=:@]/.test(text) && (startsWithDeclaration.test(text) || startsWithCall.test(text)));
}

function getCodeBlockText(node: HtmlNode): string {
  const text = getCodeBlockSourceText(node)
    .replace(/^\s*java\s*<br\s*\/?>/i, '')
    .replace(/<br\s*\/?>/gi, '\u0000')
    .replace(/\u00a0/g, ' ');
  return text.split('\u0000').map(normalizeCodeText).join('\n');
}

function getCodeBlockSourceText(node: HtmlNode): string {
  if (node.nodeName === '#text') return 'value' in node ? node.value : '';
  if (!isElement(node)) return '';
  if (node.tagName === 'br') return '\u0000';
  return node.childNodes.map((child) => {
    const text = getCodeBlockSourceText(child);
    return child.nodeName === '#text' && /^\s*$/.test(text) && /[\r\n]/.test(text) ? '' : text;
  }).join('');
}

function isBlankParagraph(node: HtmlNode): node is HtmlElement {
  return isElement(node) && node.tagName === 'p' && !getText(node).trim();
}

function isWhitespaceText(node: HtmlNode): boolean {
  return node.nodeName === '#text' && (!('value' in node) || /^\s*$/.test(node.value));
}

function isCodeOnly(node: HtmlNode, monospaceClasses: ReadonlySet<string>): boolean {
  if (node.nodeName === '#text') return !('value' in node) || /^\s*$/.test(node.value);
  if (!isElement(node)) return false;
  if (node.tagName === 'pre' || node.tagName === 'code') return true;
  if (node.tagName === 'span') {
    return (getAttribute(node, 'class') ?? '').split(/\s+/).some((className) => monospaceClasses.has(className));
  }
  return node.childNodes.length > 0 && node.childNodes.every((child) => isCodeOnly(child, monospaceClasses));
}

function getCodeText(node: HtmlNode): string {
  if (node.nodeName === '#text') return 'value' in node ? node.value : '';
  if (!isElement(node)) return '';
  if (node.tagName === 'br') return '\n';
  return node.childNodes.map((child) => {
    const text = getCodeText(child);
    return child.nodeName === '#text' && /^\s*$/.test(text) && /[\r\n]/.test(text) ? '' : text;
  }).join('');
}

function formatInlineCodeFragments(html: string): string {
  if (/<(?:code|pre)\b/i.test(html)) return html;
  const patterns = [
    /\bpublic(?:\s|<[^>]+>)+(?:(?:static|final)(?:\s|<[^>]+>)+)?void\s+\w+\([^)]*\)\s+throws\s+(?:<[^>]+>)*InterruptedException(?:<\/[^>]+>)*\s*\{\s*\/\/\.\.\.\s*\}?/gi,
    /\bfun\s+\w+\([^)]*\)(?:\s*:\s*[\w?.<>]+)?(?=\s*→)/g,
    /\b(?:sleep|wait|notify|notifyAll)\(\)/g,
    /\b[A-Za-z_$][\w$]*Scope(?:\([^)]*\))?\.launch(?:\s*\{\s*\})?/g,
    /\b(?:coroutineScope|supervisorScope)\s*\{\s*\.\.\.\s*\}/g,
    /\b(?:launch|Launch)\s*\{\s*\}/g,
  ];
  return patterns.reduce(
    (formatted, pattern) => formatted.replace(pattern, (match, offset: number, source: string) => {
      const lastCodeStart = source.lastIndexOf('<code', offset);
      const lastCodeEnd = source.lastIndexOf('</code>', offset);
      return lastCodeStart > lastCodeEnd
        ? match
        : `<code class="answer-code">${match.replace(/\s+/g, ' ')}</code>`;
    }),
    html,
  );
}

function getMonospaceClasses(document: HtmlNode): Set<string> {
  const classes = new Set<string>();
  const styles: HtmlElement[] = [];
  collectElements(document, 'style', styles);
  for (const style of styles) {
    const css = getText(style);
    for (const [, className, declarations] of css.matchAll(/\.([a-zA-Z_][\w-]*)\s*\{([^}]*)\}/g)) {
      if (/font-family\s*:[^;}]*\b(?:monospace|courier|consolas|roboto\s*mono)\b/i.test(declarations)) {
        classes.add(className);
      }
    }
  }
  return classes;
}

function collectElements(node: HtmlNode, tagName: string, matches: HtmlElement[]): void {
  if (isElement(node) && node.tagName === tagName) matches.push(node);
  for (const child of getChildNodes(node)) collectElements(child, tagName, matches);
}

function normalizeCodeText(code: string): string {
  return code.replace(/\r?\n[ \t]*/g, ' ').replace(/\u00a0/g, ' ').replace(/[ \t]+$/, '');
}

const sourceCodeKeywords = new Set([
  'abstract', 'as', 'boolean', 'break', 'byte', 'by', 'case', 'catch', 'char', 'class', 'companion',
  'const', 'continue', 'data', 'default', 'do', 'double', 'else', 'enum', 'extends', 'false', 'final',
  'finally', 'float', 'for', 'fun', 'if', 'implements', 'import', 'in', 'inline', 'instanceof', 'int',
  'interface', 'internal', 'is', 'lateinit', 'long', 'new', 'null', 'object', 'open', 'override',
  'package', 'private', 'protected', 'public', 'return', 'sealed', 'short', 'static', 'super', 'suspend',
  'switch', 'synchronized', 'this', 'throw', 'throws', 'true', 'try', 'val', 'var', 'void', 'volatile',
  'when', 'while',
]);

function highlightSourceCode(code: string): string {
  const tokens = code.split(/(\s+|\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b\d+(?:\.\d+)?\b|[{}()[\].,:;<>!=+\-*/%&|?]+)/g);

  return tokens.map((token, index) => {
    if (!token) return '';
    if (/^\s+$/.test(token)) return escapeHtml(token);

    let tokenClass = '';
    if (token.startsWith('//') || token.startsWith('/*')) tokenClass = 'answer-code-comment';
    else if (/^"(?:\\.|[^"])*"$/.test(token) || /^'(?:\\.|[^'])*'$/.test(token)) tokenClass = 'answer-code-string';
    else if (/^\d+(?:\.\d+)?$/.test(token)) tokenClass = 'answer-code-number';
    else if (sourceCodeKeywords.has(token)) tokenClass = 'answer-code-keyword';
    else if (/^[A-Z][A-Za-z0-9_]*$/.test(token)) tokenClass = 'answer-code-type';
    else if (/[{}()[\].,:;<>!=+\-*/%&|?]/.test(token)) tokenClass = 'answer-code-operator';
    else if (/^[A-Za-z_$][\w$]*$/.test(token)) {
      const nextToken = tokens.slice(index + 1).find((candidate) => !/^\s*$/.test(candidate));
      tokenClass = nextToken === '(' || /^[a-z][A-Za-z0-9]*[A-Z]/.test(token)
        ? 'answer-code-function'
        : 'answer-code-identifier';
    }

    return tokenClass
      ? `<span class="${tokenClass}">${escapeHtml(token)}</span>`
      : escapeHtml(token);
  }).join('');
}

function getImageCrop(node: HtmlElement): {
  image: HtmlElement;
  frameWidth: number;
  frameHeight: number;
  imageWidth: number;
  imageHeight: number;
  imageLeft: number;
  imageTop: number;
} | undefined {
  const wrapperStyle = parseInlineStyle(getAttribute(node, 'style') ?? '');
  if (wrapperStyle.get('overflow') !== 'hidden' || wrapperStyle.get('display') !== 'inline-block') return undefined;

  const image = findElement(node, 'img');
  if (!image) return undefined;
  const imageStyle = parseInlineStyle(getAttribute(image, 'style') ?? '');
  const frameWidth = parsePixels(wrapperStyle.get('width'));
  const frameHeight = parsePixels(wrapperStyle.get('height'));
  const imageWidth = parsePixels(imageStyle.get('width'));
  const imageHeight = parsePixels(imageStyle.get('height'));
  if (!frameWidth || !frameHeight || !imageWidth || !imageHeight) return undefined;

  return {
    image,
    frameWidth,
    frameHeight,
    imageWidth,
    imageHeight,
    imageLeft: parsePixels(imageStyle.get('margin-left')) ?? 0,
    imageTop: parsePixels(imageStyle.get('margin-top')) ?? 0,
  };
}

function parseInlineStyle(style: string): Map<string, string> {
  return new Map(style.split(';').flatMap((declaration) => {
    const separator = declaration.indexOf(':');
    if (separator < 0) return [];
    return [[declaration.slice(0, separator).trim().toLowerCase(), declaration.slice(separator + 1).trim()]];
  }));
}

function parsePixels(value: string | undefined): number | undefined {
  const match = value?.match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (!match) return undefined;
  const pixels = Number(match[1]);
  return Number.isFinite(pixels) ? pixels : undefined;
}

function toPercent(value: number, base: number): string {
  return Number(((value / base) * 100).toFixed(4)).toString();
}

function sanitizeStyle(style: string): string | undefined {
  const safeDeclarations = style.split(';').flatMap((declaration) => {
    const separator = declaration.indexOf(':');
    if (separator < 0) return [];
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();
    if (!allowedStyleProperties.has(property) || /url\s*\(|expression|javascript|@import/i.test(value)) return [];
    return [`${property}: ${value}`];
  });
  return safeDeclarations.length ? safeDeclarations.join('; ') : undefined;
}

function normalizeText(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeAnswerText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const interviewQuestions = parseInterviewQuestionHtml(sourceHtml);
