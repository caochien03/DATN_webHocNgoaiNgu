import { groupTopikQuestionsIntoPages } from "@/lib/group-topik-pages";
import { isWritingQuestion } from "@/lib/topik-answers";
import type { ExamMcqQuestion, TopikQuestion } from "@/lib/types";

export type TopikExamStep =
  | { kind: "section-intro"; section: ExamMcqQuestion["section"]; questionCount: number }
  | { kind: "mcq"; section: ExamMcqQuestion["section"]; questions: ExamMcqQuestion[] }
  | { kind: "writing"; section: TopikQuestion["section"]; question: TopikQuestion };

function groupQuestionsBySection(
  questions: ExamMcqQuestion[],
): { section: ExamMcqQuestion["section"]; questions: ExamMcqQuestion[] }[] {
  const groups: { section: ExamMcqQuestion["section"]; questions: ExamMcqQuestion[] }[] = [];
  for (const q of questions) {
    const last = groups[groups.length - 1];
    if (last && last.section === q.section) {
      last.questions.push(q);
    } else {
      groups.push({ section: q.section, questions: [q] });
    }
  }
  return groups;
}

function stepsForSection(
  section: ExamMcqQuestion["section"],
  sectionQuestions: ExamMcqQuestion[],
): TopikExamStep[] {
  const steps: TopikExamStep[] = [];
  let mcqBuffer: ExamMcqQuestion[] = [];

  function flushMcq() {
    if (mcqBuffer.length === 0) return;
    for (const page of groupTopikQuestionsIntoPages(mcqBuffer)) {
      steps.push({ kind: "mcq", section, questions: page });
    }
    mcqBuffer = [];
  }

  for (const q of sectionQuestions) {
    if (isWritingQuestion(q)) {
      flushMcq();
      steps.push({ kind: "writing", section, question: q as TopikQuestion });
    } else {
      mcqBuffer.push(q);
    }
  }
  flushMcq();
  return steps;
}

/** Xây luồng thi: intro từng phần → trang MCQ / câu viết. */
export function buildTopikExamSteps(questions: ExamMcqQuestion[]): TopikExamStep[] {
  if (questions.length === 0) return [];

  const groups = groupQuestionsBySection(questions);
  const multiSection = groups.length > 1;
  const steps: TopikExamStep[] = [];

  for (const group of groups) {
    if (multiSection) {
      steps.push({
        kind: "section-intro",
        section: group.section,
        questionCount: group.questions.length,
      });
    }
    steps.push(...stepsForSection(group.section, group.questions));
  }

  return steps;
}
