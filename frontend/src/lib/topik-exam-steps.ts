import { groupTopikQuestionsIntoPages } from "@/lib/group-topik-pages";
import { isWritingQuestion } from "@/lib/topik-answers";
import type { TopikQuestion } from "@/lib/types";

export type TopikExamStep =
  | { kind: "section-intro"; section: TopikQuestion["section"]; questionCount: number }
  | { kind: "mcq"; section: TopikQuestion["section"]; questions: TopikQuestion[] }
  | { kind: "writing"; section: TopikQuestion["section"]; question: TopikQuestion };

function groupQuestionsBySection(
  questions: TopikQuestion[],
): { section: TopikQuestion["section"]; questions: TopikQuestion[] }[] {
  const groups: { section: TopikQuestion["section"]; questions: TopikQuestion[] }[] = [];
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
  section: TopikQuestion["section"],
  sectionQuestions: TopikQuestion[],
): TopikExamStep[] {
  const steps: TopikExamStep[] = [];
  let mcqBuffer: TopikQuestion[] = [];

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
      steps.push({ kind: "writing", section, question: q });
    } else {
      mcqBuffer.push(q);
    }
  }
  flushMcq();
  return steps;
}

/** Xây luồng thi: intro từng phần → trang MCQ / câu viết. */
export function buildTopikExamSteps(questions: TopikQuestion[]): TopikExamStep[] {
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
