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

    expect(platformAnswer).toContain('<img');
    expect(platformAnswer).not.toContain('interview-source-image');
    expect(solidAnswer).toContain('<table>');
    expect(inheritanceAnswer.match(/<img\b/g)).toHaveLength(2);
    expect(renderAnswer('J015')).toContain('<table>');
    expect(renderAnswer('J015')).toContain('getInstance');
    expect(renderAnswer('J018')).toContain('<img');

    const imageAnswers = interviewQuestions.filter((question) => question.answerHtml?.includes('/interview-source-image/'));
    expect(imageAnswers.length).toBeGreaterThan(0);
    for (const question of imageAnswers) {
      expect(renderToStaticMarkup(createElement(QuestionAnswer, { question }))).not.toContain('interview-source-image');
    }
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
});
