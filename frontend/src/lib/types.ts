export type CardRow = {
  id: string;
  frontText: string;
  backText: string;
  note: string | null;
  sortOrder: number;
  correctCount: number;
  wrongCount: number;
  lastResult: boolean | null;
  lastReviewedAt: string | null;
};

export type DeckDetail = {
  id: string;
  title: string;
  description: string | null;
  cards: CardRow[];
};
