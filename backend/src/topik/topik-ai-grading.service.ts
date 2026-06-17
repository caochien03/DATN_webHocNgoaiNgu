import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TopikQuestion } from '@prisma/client';
import { GradedTopikAnswer } from './topik-grading';
import { isWritingQuestionType } from './topik-question-validation';
import {
  buildWritingGradingPrompt,
  parseWritingGradingResponse,
  type WritingGradingInput,
} from './topik-ai-grading';

const DEFAULT_MODEL = 'gemini-2.0-flash';

@Injectable()
export class TopikAiGradingService {
  private readonly logger = new Logger(TopikAiGradingService.name);
  private readonly client: GoogleGenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.model = this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn(
        'GEMINI_API_KEY chưa cấu hình — câu viết sẽ giữ trạng thái "chờ chấm".',
      );
    }
  }

  get enabled(): boolean {
    return this.client != null;
  }

  /**
   * Chấm các câu viết trong danh sách đã chấm MCQ. Mutate tại chỗ:
   * gắn aiScore/aiFeedback và đổi gradeStatus -> 'ai_graded' khi thành công.
   */
  async gradeWritingAnswers(
    graded: GradedTopikAnswer[],
    questions: TopikQuestion[],
  ): Promise<GradedTopikAnswer[]> {
    if (!this.client) return graded;

    const byId = new Map(questions.map((q) => [q.id, q]));
    const writing = graded.filter(
      (a) =>
        isWritingQuestionType(a.questionType) && a.gradeStatus === 'pending',
    );
    if (writing.length === 0) return graded;

    await Promise.all(
      writing.map(async (answer) => {
        const question = byId.get(answer.questionId);
        if (!question) return;
        try {
          await this.gradeOne(answer, question);
        } catch (e) {
          this.logger.error(
            `Chấm AI câu ${answer.questionId} thất bại: ${
              e instanceof Error ? e.message : String(e)
            }`,
          );
        }
      }),
    );

    return graded;
  }

  private async gradeOne(
    answer: GradedTopikAnswer,
    question: TopikQuestion,
  ): Promise<void> {
    const input: WritingGradingInput = {
      questionType: question.questionType,
      prompt: question.prompt,
      passage: question.passage,
      modelAnswer: question.modelAnswer,
      rubric: question.rubric ?? undefined,
      maxScore: question.maxScore,
      minChars: question.minChars,
      maxChars: question.maxChars,
      textAnswer: answer.textAnswer ?? null,
      parts: answer.writingPartResults?.map((p) => ({
        label: p.label,
        textAnswer: p.textAnswer,
        modelAnswer: p.modelAnswer,
        maxScore: p.maxScore,
      })),
    };

    const prompt = buildWritingGradingPrompt(input);
    const response = await this.client!.models.generateContent({
      model: this.model,
      contents: prompt,
    });
    const text = response.text ?? '';
    const result = parseWritingGradingResponse(text, input);

    answer.aiScore = result.score;
    answer.aiFeedback = result.feedback || null;
    answer.gradeStatus = 'ai_graded';

    if (answer.writingPartResults && result.parts) {
      const byLabel = new Map(result.parts.map((p) => [p.label, p]));
      answer.writingPartResults = answer.writingPartResults.map((part) => {
        const r = byLabel.get(part.label);
        return r
          ? { ...part, aiScore: r.score, aiFeedback: r.feedback || null }
          : part;
      });
    }
  }
}
