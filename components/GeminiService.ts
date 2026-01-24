
import { GoogleGenAI } from "@google/genai";
import { AI_PROMPTS } from "../constants";

// Initialize Gemini Client
// In a real production app, consider using a backend proxy to hide the API KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface TreeholeResult {
  reply: string;
  story: string;
  nickname: string;
}

export const GeminiService = {
  async getDailySign(): Promise<string> {
    try {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? "早晨" : hour < 18 ? "午后" : "夜晚";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite-preview-02-05',
        contents: AI_PROMPTS.sign(timeOfDay),
      });
      
      return response.text?.trim() || "心无挂碍，方见山海。";
    } catch (error) {
      console.error("AI Sign Error:", error);
      return "推门，见山色。"; // Fallback
    }
  },

  async getTreeHoleReply(mood: string, context: string, text: string): Promise<TreeholeResult> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite-preview-02-05',
        contents: AI_PROMPTS.treehole(mood, context, text),
        config: {
            responseMimeType: 'application/json',
        }
      });
      
      const textResponse = response.text || "{}";
      const json = JSON.parse(textResponse);
      
      return {
          reply: json.reply || "抱抱你呀，不开心也没关系的，喝口茶休息一下吧。",
          story: json.story || "那天心慌得像要跳出来，下楼买关东煮，看着热气冒上来，突然觉得日子还可以继续。",
          nickname: json.nickname || "路过的温暖小熊"
      };

    } catch (error) {
      console.error("AI Treehole Error:", error);
      return {
          reply: "风起时听风，雨落时听雨。小屿一直都在陪着你呢。",
          story: "每个人都有下雨天，试着深呼吸，等雨停。",
          nickname: "等雨停的蘑菇"
      };
    }
  }
};
