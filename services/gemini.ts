
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";
import { storage } from "./storage";

const getAIConfig = () => {
  const settings = storage.getSettings();
  const apiKey = settings.apiKey || process.env.API_KEY || '';
  const baseUrl = settings.apiBaseUrl || undefined;
  const model = settings.customModel || "gemini-3-flash-preview";
  return { apiKey, baseUrl, model, settings };
};

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mood: { type: Type.STRING, description: "情绪词: Calm, Happy, Anxious, Inspired, Reflective" },
  },
  required: ["mood"],
};

export const testApiConnection = async (config?: { apiKey?: string, customModel?: string, apiBaseUrl?: string }): Promise<{success: boolean, message?: string}> => {
  const settings = storage.getSettings();
  const apiKey = config?.apiKey || settings.apiKey || process.env.API_KEY;
  const model = config?.customModel || settings.customModel || "gemini-3-flash-preview";
  const baseUrl = config?.apiBaseUrl || settings.apiBaseUrl || undefined;
  
  if (!apiKey) {
    return { success: false, message: "请在设置中输入 API 密钥。" };
  }
  
  try {
    // Pass baseUrl for proxy support
    const ai = new GoogleGenAI({ apiKey, baseUrl } as any);
    const response = await ai.models.generateContent({
      model: model,
      contents: "ping",
    });
    
    return response.text ? { success: true } : { success: false, message: "接口未返回预期内容" };
  } catch (error: any) {
    console.error("Test error:", error);
    return { 
      success: false, 
      message: error.message || "请求失败，请检查密钥、代理地址或模型 ID。" 
    };
  }
};

export const analyzeThought = async (content: string): Promise<AIAnalysisResult | null> => {
  const { apiKey, baseUrl, model, settings } = getAIConfig();
  if (!settings.isAiEnabled || !apiKey || !content.trim()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey, baseUrl } as any);
    const response = await ai.models.generateContent({
      model: model,
      contents: `分析以下思绪内容的情绪并返回 JSON: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "你是一个情绪分析专家。请仅分析提供的内容属于哪种情绪（Calm, Happy, Anxious, Inspired, Reflective）。",
      },
    });

    return response.text ? JSON.parse(response.text.trim()) : null;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
