/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import config from "../../config";

const openRouterClient = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${config.openai.apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Ecommerce AI Backend"
  }
});

const generateTextFromImage = async (imageUrl: string, userTitle?: string) => {
  // ✅ Title optional করা হলো
  const titleInstruction = userTitle 
    ? `Use this title: "${userTitle}"` 
    : "Generate a short, catchy title";

  const prompt = `
You are an ecommerce product content generator.

Analyze the given product image and generate the following fields:

- title (${titleInstruction})
- description (2–3 sentences, marketing focused, based on the actual product in the image)
- category (single category name based on what you see in the image)
- tags (5–8 short tags as array, relevant to the product)
- keywords (SEO keywords as array, based on the product type)
- seoTitle (max 60 characters)
- seoDescription (max 160 characters)
- seoKeywords (SEO keyword list)

Rules:
- Analyze the ACTUAL product shown in the image
- Return ONLY valid JSON
- Do NOT use markdown
- Do NOT wrap with backticks
- Do NOT add explanations
- Do NOT return empty keys
- Be specific about what you see in the image (clothing, electronics, food, etc.)
`;

  // ✅ FIX: Proper vision API format
  const res = await openRouterClient.post("/chat/completions", {
    model: "openai/gpt-4o-mini", // Vision supported model
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ]
  });

  const content = res.data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI response is empty");
  }

  // ✅ JSON sanitize + safe parse
  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ AI RAW RESPONSE:", content);
    throw new Error("AI returned invalid JSON");
  }
};

export const aiService = {
  generateTextFromImage
};