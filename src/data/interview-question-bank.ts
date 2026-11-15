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

    if (mode === 'none' || !includeSection || !isQuestionList(node)) continue;

    const prompt = normalizeText(getText(getFirstElement(node, 'li')));
    if (!prompt) continue;

    let answerHtml = '';
    let answerText = '';
    for (let answerIndex = index + 1; answerIndex < children.length; answerIndex += 1) {
      const answerNode = children[answerIndex];
      if (isQuestionList(answerNode)) break;
      if (isSectionHeading(answerNode)) continue;
      answerHtml += serializeSafeHtml(answerNode);
      answerText += getText(answerNode);
    }
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
  return ['JAVA', 'KOTLIN', 'ANDROID', 'TESTING', 'GIT', 'iOS Development - swift'].includes(title);
}

function getCategoryInfo(section: string): { categoryId: QuestionCategoryId; prefix: string } {
  const normalized = section.toLowerCase();
  if (normalized === 'java') return { categoryId: 'java', prefix: 'J' };
  if (normalized === 'kotlin') return { categoryId: 'kotlin', prefix: 'K' };
  if (normalized === 'android') return { categoryId: 'android', prefix: 'A' };
  if (normalized === 'testing') return { categoryId: 'testing', prefix: 'T' };
  if (normalized === 'git') return { categoryId: 'general', prefix: 'G' };
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

function serializeSafeHtml(node: HtmlNode): string {
  if (node.nodeName === '#text') return escapeHtml('value' in node ? node.value : '');
  if (!isElement(node)) return '';
  if (['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'].includes(node.tagName)) return '';
  if (node.tagName === 'span') {
    const imageCrop = getImageCrop(node);
    if (imageCrop) {
      const { image, frameWidth, frameHeight, imageWidth, imageHeight, imageLeft, imageTop } = imageCrop;
      const imageHtml = serializeSafeHtml(image).replace(
        /\/?>$/,
        ` style="position: absolute; width: ${toPercent(imageWidth, frameWidth)}%; height: ${toPercent(imageHeight, frameHeight)}%; left: ${toPercent(imageLeft, frameWidth)}%; top: ${toPercent(imageTop, frameHeight)}%; margin: 0" />`,
      );
      return `<div class="question-answer-image-frame" style="aspect-ratio: ${frameWidth} / ${frameHeight}">${imageHtml}</div>`;
    }
  }
  const innerHtml = node.childNodes.map(serializeSafeHtml).join('');
  if (node.tagName === 'span') {
    const classes = new Set((getAttribute(node, 'class') ?? '').split(/\s+/));
    const formatted = classes.has('c23') ? `<code>${innerHtml}</code>` : innerHtml;
    return classes.has('c12') ? `<strong>${formatted}</strong>` : formatted;
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
  return voidTags.has(node.tagName) ? openTag : `${openTag}${innerHtml}</${node.tagName}>`;
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
