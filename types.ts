
export interface Thought {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
  aiInsight?: string;
  summary?: string;
  mood?: string;
  isFavorite?: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  tags: string[];
  wisdom: string;
  mood: string;
}
