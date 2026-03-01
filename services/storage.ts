
import { Thought, UserSettings } from '../types';

const STORAGE_KEY = 'ethereal_notes_v2';
const SETTINGS_KEY = 'ethereal_settings_v2';

const defaultSettings: UserSettings = {
  userId: '',
  userName: '',
  email: '',
  password: '',
  avatarUrl: 'https://picsum.photos/seed/ethereal/100/100',
  isInitialized: false,
  isAiEnabled: true,
  aiPersonality: 'concise',
  showMoodTrends: true,
  apiKey: '',
  apiBaseUrl: '',
  customModel: 'gemini-3-flash-preview'
};

export const storage = {
  getThoughts: (): Thought[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveThoughts: (thoughts: Thought[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
  },
  
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : defaultSettings;
    return { ...defaultSettings, ...settings };
  },
  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // Helper methods for App.tsx
  saveThought: (content: string, aiResult: any): Thought => {
    const thoughts = storage.getThoughts();
    const newThought: Thought = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      mood: aiResult?.mood || '',
      tags: aiResult?.tags || [],
      isFavorite: false
    };
    storage.saveThoughts([newThought, ...thoughts]);
    return newThought;
  },

  updateThought: (id: string, content: string, aiResult: any): Thought => {
    const thoughts = storage.getThoughts();
    const thought = thoughts.find(t => t.id === id);
    if (!thought) throw new Error('Thought not found');
    
    const updated: Thought = {
      ...thought,
      content,
      mood: aiResult?.mood || thought.mood,
      tags: aiResult?.tags || thought.tags,
      updatedAt: new Date().toISOString()
    };
    
    storage.saveThoughts(thoughts.map(t => t.id === id ? updated : t));
    return updated;
  },

  deleteThought: (id: string) => {
    const thoughts = storage.getThoughts();
    storage.saveThoughts(thoughts.filter(t => t.id !== id));
  },

  toggleFavorite: (id: string): Thought => {
    const thoughts = storage.getThoughts();
    let updatedThought: Thought | undefined;
    const newThoughts = thoughts.map(t => {
      if (t.id === id) {
        updatedThought = { ...t, isFavorite: !t.isFavorite };
        return updatedThought;
      }
      return t;
    });
    storage.saveThoughts(newThoughts);
    return updatedThought!;
  }
};
