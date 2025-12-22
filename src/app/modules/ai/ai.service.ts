/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/ai/ai.service.ts

import axios, { AxiosInstance, AxiosError } from "axios";
import config from "../../config";
import AI_PROMPTS from "./ai.prompts";
import {
  ImageAnalysisResult,
  ProductContent,
  AIGenerationOptions,
  CompleteProductData
} from "./ai.types";

class AIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.frontend_url,
        "X-Title": "Ecommerce AI Backend"
      }
    });
  }

  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      const response = await this.client.post("/chat/completions", {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: AI_PROMPTS.IMAGE_ANALYSIS },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        temperature: 0.3
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");

      return this.parseJSON<ImageAnalysisResult>(content);
    } catch (error) {
      const err = error as AxiosError;
      console.error("❌ Image Analysis Error:", err.message);
      throw new Error("Failed to analyze image");
    }
  }
  async generateContent(
    analysis: ImageAnalysisResult,
    options?: AIGenerationOptions
  ): Promise<ProductContent> {
    try {
      const prompt = AI_PROMPTS.PRODUCT_CONTENT(
        options?.userTitle,
        options?.userStyle
      );

      const response = await this.client.post("/chat/completions", {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert e-commerce copywriter. Always return valid JSON only."
          },
          {
            role: "user",
            content: `${prompt}\n\nProduct Analysis:\n${JSON.stringify(
              analysis,
              null,
              2
            )}`
          }
        ],
        temperature: 0.7
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");

      return this.parseJSON<ProductContent>(content);
    } catch (error) {
      const err = error as AxiosError;
      console.error("❌ Content Generation Error:", err.message);
      throw new Error("Failed to generate product content");
    }
  }


  async analyzeWritingStyle(descriptions: string[]): Promise<string> {
    try {
      if (descriptions.length < 3) return "";

      const samples = descriptions.slice(0, 5).join("\n\n---\n\n");

      const response = await this.client.post("/chat/completions", {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: AI_PROMPTS.STYLE_ANALYSIS(samples) }],
        temperature: 0.3
      });

      return response.data?.choices?.[0]?.message?.content ?? "";
    } catch (error) {
      console.warn("⚠️ Style analysis failed");
      return "";
    }
  }

  async generateCompleteProduct(
    imageUrl: string,
    options?: AIGenerationOptions
  ): Promise<Omit<CompleteProductData, "images" | "videos">> {
    const analysis = await this.analyzeImage(imageUrl);
    const content = await this.generateContent(analysis, options);

    return { analysis, content };
  }

  private parseJSON<T>(content: string): T {
    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      console.error("❌ Invalid JSON from AI:", content);
      throw new Error("AI returned invalid JSON");
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.client.get("/models");
      return res.status === 200;
    } catch (error) {
      console.error("❌ AI Health Check Failed");
      return false;
    }
  }
}

export default new AIService();
