import { groupTopikQuestionsIntoPages } from "@/lib/group-topik-pages";
import { isWritingQuestion } from "@/lib/topik-answers";
import type { TopikQuestion } from "@/lib/types";

export type TopikExamStep =
  | { kind: "mcq"; questions: TopikQuestion[] }
  | { kind: "writing"; question: TopikQuestion };

export function buildTopikExamSteps(questions: TopikQuestion[]): TopikExamStep[] {
  const steps: TopikExamStep[] = [];
  let mcqBuffer: TopikQuestion[] = [];

  function flushMcq() {
    if (mcqBuffer.length === 0) return;
    for (const page of groupTopikQuestionsIntoPages(mcqBuffer)) {
      steps.push({ kind: "mcq", questions: page });
    }
    mcqBuffer = [];
  }

  for (const q of questions) {
    if (isWritingQuestion(q)) {
      flushMcq();
      steps.push({ kind: "writing", question: q });
    } else {
      mcqBuffer.push(q);
    }
  }
  flushMcq();
  return steps;
}
