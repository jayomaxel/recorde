
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
  addThought: (thought: Thought) => {
    const thoughts = storage.getThoughts();
    storage.saveThoughts([thought, ...thoughts]);
  },
  updateThought: (updatedThought: Thought) => {
    const thoughts = storage.getThoughts();
    storage.saveThoughts(thoughts.map(t => t.id === updatedThought.id ? updatedThought : t));
  },
  deleteThought: (id: string) => {
    const thoughts = storage.getThoughts();
    storage.saveThoughts(thoughts.filter(t => t.id !== id));
  },
  toggleFavorite: (id: string) => {
    const thoughts = storage.getThoughts();
    storage.saveThoughts(thoughts.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  },
  
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : defaultSettings;
    return { ...defaultSettings, ...settings };
  },
  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
