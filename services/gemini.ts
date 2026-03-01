
import { AIAnalysisResult } from "../types";
import { storage } from "./storage";

const getAIConfig = () => {
  const settings = storage.getSettings();
  const apiKey = settings.apiKey || '';
  const baseUrl = settings.apiBaseUrl?.trim() || '';
  const model = settings.customModel?.trim() || "gemini-1.5-flash";
  return { apiKey, baseUrl, model, settings };
};

export const testApiConnection = async (config?: { apiKey?: string, customModel?: string, apiBaseUrl?: string }): Promise<{ success: boolean, message?: string }> => {
  const settings = storage.getSettings();
  const apiKey = config?.apiKey || settings.apiKey;
  const model = config?.customModel || settings.customModel || "gemini-1.5-flash";
  let baseUrl = (config?.apiBaseUrl || settings.apiBaseUrl || '').trim();

  if (!apiKey) return { success: false, message: "请输入 API Key。" };

  try {
    baseUrl = baseUrl.replace(/\/+$/, '');
    const isGeminiNative = !baseUrl || baseUrl.includes('googleapis.com');

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

  const prompt = `分析情绪，仅返回 JSON: {"mood": "情绪词"} (Calm, Happy, Anxious, Inspired, Reflective)。内容: ${content}`;

  try {
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const isGeminiNative = !baseUrl || baseUrl.includes('googleapis.com');

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
      return JSON.parse(data.candidates[0].content.parts[0].text.trim());
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
      return JSON.parse(data.choices[0].message.content.trim());
    }
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

// Streaming deep insights with optimized prompt and asterisk filter
export const streamDeepInsight = async (thoughts: any[], onChunk: (text: string) => void) => {
  const { apiKey, baseUrl: rawBaseUrl, model } = getAIConfig();
  if (!apiKey || thoughts.length === 0) return;

  const context = thoughts.slice(0, 30).map((t, i) => `· ${t.content}`).join('\n');
  const prompt = `你是一个理性的心理分析助手。请深度分析以下随笔，直接分三段给出核心洞察：1.情绪现状 2.行为/思维模式 3.行动建议。
要求：
- 极其精简，禁止任何文学修辞和感性废话。
- 语调专业、冷静、客观。
- 严禁使用星号“*”或任何 Markdown 格式。
- 禁止任何开场白。

内容：
${context}`;

  try {
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
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

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.substring(6).trim();
          if (content === '[DONE]') break;
          try {
            const parsed = JSON.parse(content);
            const delta = parsed.choices[0].delta.content;
            if (delta) {
              // SCRIPT: Filter out all asterisk symbols automatically
              const filteredDelta = delta.replace(/\*/g, '');
              accumulated += filteredDelta;
              onChunk(accumulated);
            }
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onChunk("连接异常，请确保 AI 配置正确。");
  }
};
