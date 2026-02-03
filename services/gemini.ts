
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Fixed: Correctly initialize GoogleGenAI with named apiKey parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A very concise one-sentence summary of the thought.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Up to 3 relevant tags or keywords.",
    },
    wisdom: {
      type: Type.STRING,
      description: "A brief, gentle, philosophical perspective or follow-up question based on the content.",
    },
    mood: {
      type: Type.STRING,
      description: "The emotional tone of the thought (e.g., Calm, Anxious, Inspired, Reflective).",
    }
  },
  required: ["summary", "tags", "wisdom", "mood"],
};

export const analyzeThought = async (content: string): Promise<AIAnalysisResult | null> => {
  if (!content.trim()) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下思绪并提供见解: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "你是一个温柔且富有洞察力的个人助理。你的目标是帮助用户整理思绪，提供简短且富有哲理的反馈，并自动提取关键词。",
      },
    });

    // Fixed: Accessed .text property directly (not a method) as per guidelines
    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};
