import { validateOptions } from './toeic-question-limits';

export function assertQuestionInput(params: {
  options: string[];
  correctIndex: number;
}) {
  validateOptions(params.correctIndex, params.options);
}
