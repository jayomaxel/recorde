
import { Thought } from '../types';

const STORAGE_KEY = 'ethereal_notes_v1';

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
  }
};
