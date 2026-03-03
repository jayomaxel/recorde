
import { AIAnalysisResult, Thought, UserSettings } from "../types";
import { storage } from "./storage";

const MOOD_CANDIDATES = ["Calm", "Happy", "Anxious", "Inspired", "Reflective"] as const;

const personalityGuides: Record<UserSettings["aiPersonality"], { analysis: string; insight: string }> = {
  philosophical: {
    analysis: "关注价值取向、长期意义和内在冲突。",
    insight: "输出强调原因链和价值判断，措辞克制但有深度。"
  },
  poetic: {
    analysis: "关注情绪细节、意象和主观体验。",
    insight: "输出保留温度与画面感，但保持结构化和可执行。"
  },
  concise: {
    analysis: "聚焦关键信号，避免冗余。",
    insight: "输出短句、直接、结论先行。"
  }
};

const moodAliasMap: Record<string, string> = {
  calm: "Calm",
  peaceful: "Calm",
  serene: "Calm",
  平静: "Calm",
  宁静: "Calm",

  happy: "Happy",
  joyful: "Happy",
  开心: "Happy",
  快乐: "Happy",
  喜悦: "Happy",

  anxious: "Anxious",
  anxiety: "Anxious",
  nervous: "Anxious",
  焦虑: "Anxious",
  紧张: "Anxious",

  inspired: "Inspired",
  motivation: "Inspired",
  creative: "Inspired",
  灵感: "Inspired",
  振奋: "Inspired",

  reflective: "Reflective",
  reflection: "Reflective",
  thoughtful: "Reflective",
  反思: "Reflective",
  思考: "Reflective"
};

const getPersonalityGuide = (personality: UserSettings["aiPersonality"]) =>
  personalityGuides[personality] || personalityGuides.concise;

const normalizeMood = (value: unknown): string => {
  if (typeof value !== "string") return "Reflective";
  const trimmed = value.trim();

  if ((MOOD_CANDIDATES as readonly string[]).includes(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (moodAliasMap[lower]) return moodAliasMap[lower];
  if (moodAliasMap[trimmed]) return moodAliasMap[trimmed];

  return "Reflective";
};

const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const unique = new Set<string>();

  for (const tag of value) {
    if (typeof tag !== "string") continue;
    const cleaned = tag.trim().toLowerCase();
    if (!cleaned) continue;
    unique.add(cleaned);
    if (unique.size >= 3) break;
  }

  return Array.from(unique);
};

const normalizeAnalysisResult = (raw: any): AIAnalysisResult => ({
  mood: normalizeMood(raw?.mood),
  tags: normalizeTags(raw?.tags)
});

const getAIConfig = () => {
  const settings = storage.getSettings();
  const apiKey = settings.apiKey || '';
  const baseUrl = settings.apiBaseUrl?.trim() || '';
  const model = settings.customModel?.trim() || "gemini-1.5-flash";
  return { apiKey, baseUrl, model, settings };
};

const isGeminiNativeEndpoint = (baseUrl: string) => !baseUrl || baseUrl.includes('googleapis.com');

const sanitizeDelta = (text: string) => text.replace(/\*/g, '');

const extractGeminiChunkText = (payload: any): string => {
  const items = Array.isArray(payload) ? payload : [payload];
  let chunk = '';

  for (const item of items) {
    const parts = item?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      if (typeof part?.text === 'string') chunk += part.text;
    }
  }

  return chunk;
};

export const testApiConnection = async (config?: { apiKey?: string, customModel?: string, apiBaseUrl?: string }): Promise<{ success: boolean, message?: string }> => {
  const settings = storage.getSettings();
  const apiKey = config?.apiKey || settings.apiKey;
  const model = config?.customModel || settings.customModel || "gemini-1.5-flash";
  let baseUrl = (config?.apiBaseUrl || settings.apiBaseUrl || '').trim();

  if (!apiKey) return { success: false, message: "请输入 API Key。" };

  try {
    baseUrl = baseUrl.replace(/\/+$/, '');
    const isGeminiNative = isGeminiNativeEndpoint(baseUrl);

    if (isGeminiNative) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
      });
      const data = await response.json();
      if (data.error) return { success: false, message: `Gemini 错误: ${data.error.message}` };
      return data.candidates ? { success: true } : { success: false, message: "接口无法返回内容" };
    } else {
      const apiPath = baseUrl.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
      const url = `${baseUrl}${apiPath}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: `状态码 ${response.status}: ${errorData.error?.message || '请求失败'}` };
      }
      const data = await response.json();
      return data.choices ? { success: true } : { success: false, message: "返回格式错误" };
    }
  } catch (error: any) {
    return { success: false, message: `连接异常: ${error.message}` };
  }
};

export const analyzeThought = async (content: string): Promise<AIAnalysisResult | null> => {
  const { apiKey, baseUrl: rawBaseUrl, model, settings } = getAIConfig();
  if (!settings.isAiEnabled || !apiKey || !content.trim()) return null;
  const personalityGuide = getPersonalityGuide(settings.aiPersonality);

  const prompt = `你是心理文本标注助手。风格偏好：${personalityGuide.analysis}
分析下列文本，只能返回严格 JSON，不要 Markdown，不要解释。

返回格式：
{"mood":"Calm|Happy|Anxious|Inspired|Reflective","tags":["tag1","tag2","tag3"]}

规则：
1) mood 必须从候选值中选择 1 个。
2) tags 返回 1-3 个短标签，优先中文，不要句子。
3) 若无法判断标签，tags 返回 []。

文本：
${content}`;

  try {
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const isGeminiNative = isGeminiNativeEndpoint(baseUrl);

    if (isGeminiNative) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      if (!data.candidates) return null;
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text.trim());
      return normalizeAnalysisResult(parsed);
    } else {
      const apiPath = baseUrl.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
      const response = await fetch(`${baseUrl}${apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      const data = await response.json();
      if (!data.choices) return null;
      const parsed = JSON.parse(data.choices[0].message.content.trim());
      return normalizeAnalysisResult(parsed);
    }
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

// Streaming deep insights with optimized prompt and asterisk filter
export const streamDeepInsight = async (thoughts: Thought[], onChunk: (text: string) => void) => {
  const { apiKey, baseUrl: rawBaseUrl, model, settings } = getAIConfig();
  if (!apiKey || thoughts.length === 0) return;

  const personalityGuide = getPersonalityGuide(settings.aiPersonality);
  const context = thoughts.slice(0, 30).map((t) => `· ${t.content}`).join('\n');
  const prompt = `你是一个理性的心理分析助手。请深度分析以下随笔，直接分三段给出核心洞察：1.情绪现状 2.行为/思维模式 3.行动建议。
要求：
- 极其精简，禁止任何文学修辞和感性废话。
- 语调专业、冷静、客观。
- 风格偏好：${personalityGuide.insight}
- 严禁使用星号“*”或任何 Markdown 格式。
- 禁止任何开场白。

内容：
${context}`;

  try {
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const isGeminiNative = isGeminiNativeEndpoint(baseUrl);
    const decoder = new TextDecoder();
    let accumulated = "";

    if (isGeminiNative) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      if (!response.ok) throw new Error(`状态码 ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("未接收到流式响应");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const content = line.substring(6).trim();
          if (!content) continue;

          try {
            const parsed = JSON.parse(content);
            const textChunk = sanitizeDelta(extractGeminiChunkText(parsed));
            if (!textChunk) continue;

            // Gemini chunk may be cumulative text; avoid duplicate append.
            if (textChunk.startsWith(accumulated)) {
              accumulated = textChunk;
            } else {
              accumulated += textChunk;
            }
            onChunk(accumulated);
          } catch (e) { }
        }
      }
    } else {
      const apiPath = baseUrl.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
      const url = baseUrl ? `${baseUrl}${apiPath}` : `https://api.openai.com/v1/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      });
      if (!response.ok) throw new Error(`状态码 ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("未接收到流式响应");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const content = line.substring(6).trim();
          if (content === '[DONE]') break;
          try {
            const parsed = JSON.parse(content);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += sanitizeDelta(delta);
              onChunk(accumulated);
            }
          } catch (e) { }
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onChunk("连接异常，请确保 AI 配置正确。");
  }
};
