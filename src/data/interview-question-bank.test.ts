import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { interviewQuestions, parseInterviewQuestionHtml } from './interview-question-bank';
import QuestionAnswer from '../components/QuestionAnswer';

describe('Complete Revision HTML question bank', () => {
  it('loads every question in source order and keeps the HTML section numbering', () => {
    expect(interviewQuestions).toHaveLength(413);
    expect(new Set(interviewQuestions.map((question) => question.id)).size).toBe(413);
    expect(interviewQuestions.every((question) => question.prompt.trim())).toBe(true);

    expect(interviewQuestions[0]).toMatchObject({
      displayId: 'J001',
      categoryId: 'java',
      section: 'JAVA / Platform Questions',
      prompt: 'How is java platform independent?',
    });
    expect(interviewQuestions.find((question) => question.displayId === 'J005')?.prompt).toBe('SOLID principle?');
    expect(interviewQuestions.find((question) => question.displayId === 'J010')?.prompt).toBe('What is Polymorphism and types?');
    expect(interviewQuestions.find((question) => question.displayId === 'K001')?.categoryId).toBe('kotlin');
    expect(interviewQuestions.find((question) => question.displayId === 'A001')?.categoryId).toBe('android');
    expect(interviewQuestions.find((question) => question.displayId === 'T001')?.categoryId).toBe('testing');
    expect(interviewQuestions.some((question) => question.section.startsWith('Set 11'))).toBe(true);
    expect(interviewQuestions.some((question) => question.section.includes('iOS Development'))).toBe(true);
    expect(interviewQuestions.some((question) => question.prompt.includes('Udemy Free Course'))).toBe(false);
    expect(interviewQuestions.some((question) => question.prompt.includes('Road map'))).toBe(false);
  });

  it('preserves the source HTML tables, images, and code in answers', () => {
    const renderAnswer = (displayId: string) => {
      const question = interviewQuestions.find((entry) => entry.displayId === displayId);
      if (!question) throw new Error(`Missing question ${displayId}`);
      return renderToStaticMarkup(createElement(QuestionAnswer, { question }));
    };

    const platformAnswer = renderAnswer('J001');
    const solidAnswer = renderAnswer('J005');
    const inheritanceAnswer = renderAnswer('J009');
    const collectionsAnswer = renderAnswer('J024');
    const singletonAnswer = renderAnswer('J015');

    expect(platformAnswer).toContain('<img');
    expect(platformAnswer).not.toContain('interview-source-image');
    expect(solidAnswer).toContain('<table>');
    expect(inheritanceAnswer.match(/<img\b/g)).toHaveLength(2);
    expect(singletonAnswer).toContain('<table>');
    expect(singletonAnswer).toContain('getInstance');
    expect(singletonAnswer.match(/<pre class="question-answer-code">/g)).toHaveLength(1);
    expect(singletonAnswer).toContain('answer-code-keyword');
    expect(singletonAnswer).toContain('answer-code-function');
    expect(renderAnswer('J018')).toContain('<img');
    expect(collectionsAnswer).toContain('question-answer-table-scroll');
    expect(collectionsAnswer).toContain('question-answer-image-frame');
    expect(collectionsAnswer).toContain('target="_blank"');

    const imageAnswers = interviewQuestions.filter((question) => question.answerHtml?.includes('/interview-source-image/'));
    expect(imageAnswers.length).toBeGreaterThan(0);
    for (const question of imageAnswers) {
      expect(renderToStaticMarkup(createElement(QuestionAnswer, { question }))).not.toContain('interview-source-image');
    }
  });

  it('formats all source monospace classes as highlighted code blocks', () => {
    const sourceCodeAnswers = interviewQuestions.filter((question) =>
      question.answerMarkdown.includes('streamFromList') || question.answerMarkdown.includes('names.add'),
    );
    expect(sourceCodeAnswers.length).toBeGreaterThan(0);

    for (const question of sourceCodeAnswers) {
      const rendered = renderToStaticMarkup(createElement(QuestionAnswer, { question }));
      const visibleText = rendered
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');

      expect(rendered).toContain('<pre class="question-answer-code">');
      expect(rendered).toContain('answer-code-type');
      if (question.answerMarkdown.includes('streamFromList')) {
        expect(visibleText).toContain('Stream<Integer> streamFromList = numbers.stream();');
      }
      if (question.answerMarkdown.includes('names.add')) {
        expect(visibleText).toContain('names.add("Alice");');
        expect(rendered).toContain('answer-code-keyword');
      }
    }
  });

  it('detects monospaced source CSS classes and preserves code token spacing', () => {
    const source = `
      <style>.sample-code { font-family: "Roboto Mono"; }</style>
      <h1>Explanations &amp; Studies</h1>
      <h2>JAVA</h2>
      <ol class="lst-kix_java-0"><li>What is a list?</li></ol>
      <table><tr><td>
        <p><span class="sample-code">List</span>
          <span class="sample-code">&lt;</span><span class="sample-code">String</span>
          <span class="sample-code">&gt; names </span><span class="sample-code">= </span>
          <span class="sample-code">new </span><span class="sample-code">ArrayList&lt;&gt;();</span></p>
      </td></tr></table>
      <p>Inline <span class="sample-code">names.add("Alice");</span> example.</p>
    `;
    const [question] = parseInterviewQuestionHtml(source);
    const rendered = renderToStaticMarkup(createElement(QuestionAnswer, { question }));
    const visibleText = rendered.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    expect(rendered).toContain('<pre class="question-answer-code">');
    expect(rendered).toContain('<code class="answer-code">');
    expect(visibleText).toContain('List<String> names = new ArrayList<>();');
    expect(rendered).toContain('answer-code-keyword');
  });

  it('joins source code lines into one block across paragraph boundaries', () => {
    const source = `
      <style>.sample-code { font-family: "Roboto Mono"; }</style>
      <h1>Explanations &amp; Studies</h1>
      <h2>JAVA</h2>
      <ol class="lst-kix_java-0"><li>What is a functional interface?</li></ol>
      <table><tr><td>
        <p>Java 7:</p>
        <p><span class="sample-code">interface Greeting {</span></p>
        <p><span class="sample-code">&nbsp;&nbsp; void say(String name);</span></p>
        <p><span class="sample-code">}</span></p>
        <p class="empty"></p>
        <p><span class="sample-code">Greeting g = new Greeting() {</span></p>
        <p><span class="sample-code">&nbsp;&nbsp; public void say(String name) {</span></p>
        <p><span class="sample-code">&nbsp;&nbsp;&nbsp;&nbsp; System.out.println("Hello " + name);</span></p>
        <p><span class="sample-code">&nbsp;&nbsp; }</span></p>
        <p><span class="sample-code">};</span></p>
      </td></tr></table>
      <p>Inline <span class="sample-code">Greeting</span><span class="sample-code">.say</span> call.</p>
    `;
    const [question] = parseInterviewQuestionHtml(source);
    const rendered = renderToStaticMarkup(createElement(QuestionAnswer, { question }));
    const blockMatches = [...rendered.matchAll(/<pre class="question-answer-code"><code>([\s\S]*?)<\/code><\/pre>/g)];
    const codeBlocks = blockMatches.map(([, code]) => code
      .replace(/<[^>]*>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&'));
    const visibleText = rendered.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"');

    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0]).toContain('interface Greeting {');
    expect(codeBlocks[0]).toContain('void say(String name);');
    expect(codeBlocks[0]).toContain('Greeting g = new Greeting() {');
    expect(codeBlocks[0]).toContain('System.out.println("Hello " + name);');
    expect(rendered.match(/<code class="answer-code">/g)).toHaveLength(1);
    expect(visibleText).toContain('Greeting.say');
  });

  it('keeps the source functional-interface example in a single code box per snippet', () => {
    const question = interviewQuestions.find((entry) => entry.answerMarkdown.includes('interface Greeting {'));
    expect(question).toBeDefined();
    if (!question) throw new Error('Missing functional-interface source example.');

    const rendered = renderToStaticMarkup(createElement(QuestionAnswer, { question }));
    const blocks = [...rendered.matchAll(/<pre class="question-answer-code"><code>([\s\S]*?)<\/code><\/pre>/g)]
      .map(([, code]) => code.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    const functionalInterfaceBlock = blocks.find((code) => code.includes('interface Greeting {'));

    expect(functionalInterfaceBlock).toContain('void say(String name);');
    expect(functionalInterfaceBlock).toContain('Greeting g = new Greeting() {');
    expect(functionalInterfaceBlock).toContain('System.out.println("Hello " + name);');
  });

  it('extracts answers and section-specific questions while excluding non-Q&A headings', () => {
    const source = `
      <h1>Explanations &amp; Studies</h1>
      <h2>JAVA</h2>
      <h3>Platform Questions</h3>
      <ol class="lst-kix_java-0"><li>What is JVM?</li></ol>
      <ol class="lst-kix_java-1"><li><strong>Runs bytecode.</strong></li></ol>
      <table><tr><th>Runtime</th><th>Details</th></tr><tr><td>JVM</td><td>Executes bytecode</td></tr></table>
      <img src="images/image8.png" alt="JVM diagram">
      <script>alert('not answer content')</script>
      <ol class="lst-kix_java-0"><li>What is JDK?</li></ol>
      <h1>Important Course Videos</h1>
      <h2>Java courses</h2>
      <ol class="lst-kix_courses-0"><li>Java course link</li></ol>
      <h1>Interview question sets⭐</h1>
      <h2>Set 1 : Kotlin Interview</h2>
      <ol class="lst-kix_set-0"><li>Why Kotlin?</li></ol>
      <p>Kotlin is concise.</p>
    `;
    const questions = parseInterviewQuestionHtml(source);

    expect(questions).toHaveLength(3);
    expect(questions[0]).toMatchObject({
      displayId: 'J001',
      section: 'JAVA / Platform Questions',
      prompt: 'What is JVM?',
      hasAnswer: true,
    });
    expect(questions[0].answerHtml).toContain('<table>');
    expect(questions[0].answerHtml).toContain('<div class="question-answer-table-scroll"><table>');
    expect(questions[0].answerHtml).toContain('/interview-source-image/image8.png');
    expect(questions[0].answerHtml).not.toContain('<script>');
    expect(questions[1]).toMatchObject({ displayId: 'J002', prompt: 'What is JDK?', hasAnswer: false });
    expect(questions[2]).toMatchObject({
      displayId: 'S1-001',
      categoryId: 'general',
      section: 'Set 1 : Kotlin Interview',
      prompt: 'Why Kotlin?',
      hasAnswer: true,
    });
  });

  it('scales cropped source images with their frame and strips fixed image dimensions', () => {
    const source = `
      <h1>Explanations &amp; Studies</h1>
      <h2>JAVA</h2>
      <ol class="lst-kix_java-0"><li>What is JVM?</li></ol>
      <span style="overflow: hidden; display: inline-block; width: 400px; height: 100px">
        <img src="images/image8.png" style="width: 500px; height: 250px; margin-left: -20px; margin-top: -75px">
      </span>
    `;
    const [question] = parseInterviewQuestionHtml(source);

    expect(question.answerHtml).toContain('class="question-answer-image-frame" style="aspect-ratio: 400 / 100"');
    expect(question.answerHtml).toContain('width: 125%; height: 250%; left: -5%; top: -75%');
    expect(question.answerHtml).not.toContain('width: 500px');
    expect(question.answerHtml).not.toContain('height: 250px');
  });

  it('keeps image tables measurable and opens safe answer links in a new tab', () => {
    const source = `
      <h1>Explanations &amp; Studies</h1>
      <h2>JAVA</h2>
      <ol class="lst-kix_java-0"><li>What is Collections?</li></ol>
      <table><tr><td><span style="overflow: hidden; display: inline-block; width: 400px; height: 100px">
        <img src="images/image8.png" style="width: 500px; height: 250px; margin-left: -20px; margin-top: -75px">
      </span></td></tr></table>
      <p><a href="https://example.com/resource">Resource</a></p>
    `;
    const [question] = parseInterviewQuestionHtml(source);
    const rendered = renderToStaticMarkup(createElement(QuestionAnswer, { question }));

    expect(rendered).toContain('<div class="question-answer-table-scroll"><table>');
    expect(rendered).toContain('target="_blank"');
    expect(rendered).toContain('rel="noopener noreferrer"');
    expect(rendered).toContain('href="https://example.com/resource"');
  });
});
