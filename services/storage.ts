import { AIAnalysisResult, Thought, UserSettings } from '../types';

const STORAGE_KEY = 'ethereal_notes_v2';
const SETTINGS_KEY = 'ethereal_settings_v2';
const ENC_PREFIX = 'enc:v1:';
const ENC_SALT_SIZE = 8;

let sessionPassword = '';

type RawSettings = Partial<UserSettings> & { password?: string };

const defaultSettings: UserSettings = {
  userId: '',
  userName: '',
  email: '',
  passwordHash: '',
  avatarUrl: 'https://picsum.photos/seed/ethereal/100/100',
  isInitialized: false,
  isAiEnabled: true,
  aiPersonality: 'concise',
  showMoodTrends: true,
  apiKey: '',
  apiBaseUrl: '',
  customModel: 'gemini-3-flash-preview'
};

const utf8ToBytes = (value: string): Uint8Array => new TextEncoder().encode(value);
const bytesToUtf8 = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const fromBase64 = (base64: string): Uint8Array | null => {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
};

const concatBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
};

const randomBytes = (size: number): Uint8Array => {
  const salt = new Uint8Array(size);
  crypto.getRandomValues(salt);
  return salt;
};

const deriveKey = (password: string): Uint8Array => utf8ToBytes(`${password}|ethereal.local.storage.v1`);

const xorTransform = (input: Uint8Array, key: Uint8Array, salt: Uint8Array): Uint8Array => {
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = input[i] ^ key[i % key.length] ^ salt[i % salt.length];
  }
  return out;
};

const encryptAtRest = (plainText: string, password: string): string => {
  const salt = randomBytes(ENC_SALT_SIZE);
  const cipher = xorTransform(utf8ToBytes(plainText), deriveKey(password), salt);
  return `${ENC_PREFIX}${toBase64(concatBytes(salt, cipher))}`;
};

const decryptAtRest = (cipherText: string, password: string): string | null => {
  if (!cipherText.startsWith(ENC_PREFIX)) return cipherText;
  if (!password) return null;

  const raw = fromBase64(cipherText.slice(ENC_PREFIX.length));
  if (!raw || raw.length <= ENC_SALT_SIZE) return null;

  const salt = raw.slice(0, ENC_SALT_SIZE);
  const cipher = raw.slice(ENC_SALT_SIZE);

  try {
    return bytesToUtf8(xorTransform(cipher, deriveKey(password), salt));
  } catch {
    return null;
  }
};

const getRawSettings = (): RawSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const TAG_BLACKLIST = new Set([
  'this', 'that', 'with', 'have', 'from', 'your', 'just', 'then', 'about',
  '今天', '然后', '就是', '因为', '所以', '我们', '你们', '他们', '自己', '一个'
]);

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];
  const unique = new Set<string>();

  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const cleaned = tag.trim().toLowerCase();
    if (!cleaned || TAG_BLACKLIST.has(cleaned)) continue;
    unique.add(cleaned);
    if (unique.size >= 3) break;
  }

  return Array.from(unique);
};

const extractFallbackTags = (content: string): string[] => {
  const tokens = content.toLowerCase().match(/[a-z]{4,}|[\u4e00-\u9fa5]{2,6}/g) || [];
  const unique = new Set<string>();

  for (const token of tokens) {
    const cleaned = token.trim();
    if (!cleaned || TAG_BLACKLIST.has(cleaned)) continue;
    unique.add(cleaned);
    if (unique.size >= 3) break;
  }

  return Array.from(unique);
};

const ensureCreatedAt = (createdAt: unknown): string => {
  if (typeof createdAt === 'string' && !Number.isNaN(Date.parse(createdAt))) return createdAt;
  if (typeof createdAt === 'number') return new Date(createdAt).toISOString();
  return new Date().toISOString();
};

const normalizeThought = (raw: any): Thought => {
  const content = typeof raw?.content === 'string' ? raw.content : '';
  const tags = normalizeTags(raw?.tags);

  return {
    id: String(raw?.id ?? Date.now()),
    content,
    createdAt: ensureCreatedAt(raw?.createdAt),
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : undefined,
    mood: typeof raw?.mood === 'string' ? raw.mood : undefined,
    isFavorite: Boolean(raw?.isFavorite),
    tags: tags.length ? tags : extractFallbackTags(content),
    aiInsight: typeof raw?.aiInsight === 'string' ? raw.aiInsight : undefined,
    summary: typeof raw?.summary === 'string' ? raw.summary : undefined
  };
};

const resolveTags = (content: string, aiResult?: AIAnalysisResult | null, existingTags: string[] = []): string[] => {
  const aiTags = normalizeTags(aiResult?.tags);
  if (aiTags.length) return aiTags;

  const normalizedExisting = normalizeTags(existingTags);
  if (normalizedExisting.length) return normalizedExisting;

  return extractFallbackTags(content);
};

const saveThoughtsWithPassword = (thoughts: Thought[], password: string) => {
  const serialized = JSON.stringify(thoughts);
  const payload = password ? encryptAtRest(serialized, password) : serialized;
  localStorage.setItem(STORAGE_KEY, payload);
};

export const storage = {
  hashPassword: (value: string): string => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a:${(hash >>> 0).toString(16).padStart(8, '0')}:${value.length}`;
  },

  verifyPassword: (input: string, passwordHash?: string): boolean => {
    if (!passwordHash) return input === '';
    return storage.hashPassword(input) === passwordHash;
  },

  setSessionPassword: (password: string): boolean => {
    const settings = storage.getSettings();
    if (!settings.passwordHash) {
      sessionPassword = '';
      return true;
    }
    if (!storage.verifyPassword(password, settings.passwordHash)) return false;
    sessionPassword = password;
    return true;
  },

  clearSensitiveCache: () => {
    sessionPassword = '';
  },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    sessionPassword = '';
  },

  getThoughts: (): Thought[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const settings = storage.getSettings();
      const decryptPassword = settings.passwordHash ? sessionPassword : '';
      const serialized = decryptAtRest(data, decryptPassword);
      if (!serialized) return [];

      const parsed = JSON.parse(serialized);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeThought);
    } catch {
      return [];
    }
  },

  saveThoughts: (thoughts: Thought[]) => {
    const settings = storage.getSettings();
    const encryptPassword = settings.passwordHash ? sessionPassword : '';
    if (settings.passwordHash && !encryptPassword) return;
    saveThoughtsWithPassword(thoughts, encryptPassword);
  },

  getSettings: (): UserSettings => {
    const raw = getRawSettings();
    const hasLegacyPasswordField = Object.prototype.hasOwnProperty.call(raw, 'password');
    const migratedHash =
      typeof raw.passwordHash === 'string'
        ? raw.passwordHash
        : (typeof raw.password === 'string' && raw.password ? storage.hashPassword(raw.password) : '');

    if (hasLegacyPasswordField) {
      const migratedPersisted: RawSettings = { ...raw, passwordHash: migratedHash };
      delete migratedPersisted.password;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(migratedPersisted));
    }

    const settings: UserSettings = {
      ...defaultSettings,
      ...raw,
      passwordHash: migratedHash
    };

    if (typeof raw.apiKey === 'string') {
      const decryptPassword = settings.passwordHash ? sessionPassword : '';
      const decryptedApiKey = decryptAtRest(raw.apiKey, decryptPassword);
      settings.apiKey = decryptedApiKey ?? '';
    }

    return settings;
  },

  saveSettings: (settings: UserSettings, runtimePassword?: string) => {
    const thoughts = storage.getThoughts();
    const persisted: UserSettings = { ...settings, passwordHash: settings.passwordHash || '' };
    delete (persisted as RawSettings).password;
    const hasPassword = Boolean(persisted.passwordHash);
    const passwordForNewHash =
      hasPassword &&
      runtimePassword &&
      storage.verifyPassword(runtimePassword, persisted.passwordHash)
        ? runtimePassword
        : '';

    if (hasPassword) {
      if (passwordForNewHash) {
        sessionPassword = passwordForNewHash;
      } else if (!sessionPassword || !storage.verifyPassword(sessionPassword, persisted.passwordHash)) {
        throw new Error('无法验证当前会话密码，请重新解锁后再保存设置。');
      }

      if (persisted.apiKey) {
        persisted.apiKey = encryptAtRest(persisted.apiKey, sessionPassword);
      }
      saveThoughtsWithPassword(thoughts, sessionPassword);
    } else {
      if (persisted.apiKey && persisted.apiKey.startsWith(ENC_PREFIX)) {
        persisted.apiKey = '';
      }
      saveThoughtsWithPassword(thoughts, '');
      sessionPassword = '';
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(persisted));
  },

  saveThought: (content: string, aiResult: AIAnalysisResult | null): Thought => {
    const thoughts = storage.getThoughts();
    const newThought: Thought = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      mood: aiResult?.mood || '',
      tags: resolveTags(content, aiResult),
      isFavorite: false
    };
    storage.saveThoughts([newThought, ...thoughts]);
    return newThought;
  },

  updateThought: (id: string, content: string, aiResult: AIAnalysisResult | null): Thought => {
    const thoughts = storage.getThoughts();
    const thought = thoughts.find((t) => t.id === id);
    if (!thought) throw new Error('Thought not found');

    const updated: Thought = {
      ...thought,
      content,
      mood: aiResult?.mood || thought.mood,
      tags: resolveTags(content, aiResult, thought.tags),
      updatedAt: new Date().toISOString()
    };

    storage.saveThoughts(thoughts.map((t) => (t.id === id ? updated : t)));
    return updated;
  },

  deleteThought: (id: string) => {
    const thoughts = storage.getThoughts();
    storage.saveThoughts(thoughts.filter((t) => t.id !== id));
  },

  toggleFavorite: (id: string): Thought => {
    const thoughts = storage.getThoughts();
    let updatedThought: Thought | undefined;
    const newThoughts = thoughts.map((t) => {
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
