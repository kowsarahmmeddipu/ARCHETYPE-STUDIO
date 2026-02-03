
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_PREFIX } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateInfluencerImage(
    faceBase64: string, 
    customPrompt: string, 
    outfitBase64?: string, 
    productBase64?: string,
    aspectRatio: string = "1:1",
    lightingPrompt: string = "",
    skinTexturePrompt: string = ""
  ) {
    const model = 'gemini-2.5-flash-image';
    
    const fullPrompt = `${SYSTEM_PROMPT_PREFIX} ${lightingPrompt}. ${skinTexturePrompt}. ${customPrompt}. Maintain identical face identity. Replicate the outfit exactly.`;

    const parts: any[] = [
      {
        inlineData: {
          data: faceBase64,
          mimeType: 'image/jpeg',
        },
      }
    ];

    if (outfitBase64) {
      parts.push({
        inlineData: {
          data: outfitBase64,
          mimeType: 'image/jpeg',
        },
      });
    }

    if (productBase64) {
      parts.push({
        inlineData: {
          data: productBase64,
          mimeType: 'image/jpeg',
        },
      });
    }

    parts.push({ text: fullPrompt });

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        }
      });

      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) throw new Error("Synthesis failed.");
      return imageUrl;
    } catch (error) {
      console.error("Studio Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
