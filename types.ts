
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
  mood: string;
}

export interface UserSettings {
  userId: string;
  userName: string;
  email?: string;
  password?: string;
  avatarUrl: string;
  isInitialized: boolean;
  isAiEnabled: boolean;
  aiPersonality: 'philosophical' | 'poetic' | 'concise';
  showMoodTrends: boolean;
  apiKey?: string;
  apiBaseUrl?: string;
  customModel?: string;
}
