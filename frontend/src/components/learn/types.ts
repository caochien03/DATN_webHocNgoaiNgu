export type LearnCard = {
  id: string;
  frontText: string;
  backText: string;
  note: string | null;
};

export type AttemptHandler = (cardId: string, isCorrect: boolean) => void;
