import type { ExamMcqQuestion } from "@/lib/types";

/** Gom câu liền kề cùng bundleId thành một trang (thi thử / luyện đã xếp thứ tự). */
export function groupTopikQuestionsIntoPages(
  questions: ExamMcqQuestion[],
): ExamMcqQuestion[][] {
  const pages: ExamMcqQuestion[][] = [];
  let i = 0;

  while (i < questions.length) {
    const q = questions[i];
    if (q.bundleId) {
      const page: ExamMcqQuestion[] = [q];
      let j = i + 1;
      while (j < questions.length && questions[j].bundleId === q.bundleId) {
        page.push(questions[j]);
        j++;
      }
      pages.push(page);
      i = j;
    } else {
      pages.push([q]);
      i++;
    }
  }

  return pages;
}

export function pageLabel(page: ExamMcqQuestion[], pageIndex: number): string {
  if (page.length === 1) {
    return `Câu ${pageIndex + 1}`;
  }
  const nums = page.map((q) => q.questionNo).join("–");
  return `Câu ${nums}`;
}

export function sharedAudioUrl(page: ExamMcqQuestion[]): string | null {
  for (const q of page) {
    if (q.audioUrl) return q.audioUrl;
  }
  return null;
}
