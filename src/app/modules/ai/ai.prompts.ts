// src/modules/ai/ai.prompts.ts

export const AI_PROMPTS = {
  /**
   * Image Analysis Prompt
   */
  IMAGE_ANALYSIS: `Analyze this product image carefully and return ONLY a JSON object with:

{
  "productType": "what is this product (be specific)",
  "category": "product category (e.g., Electronics, Fashion, Home & Garden)",
  "colors": ["primary colors visible in the product"],
  "features": ["key visual features of the product"],
  "suggestedKeywords": ["relevant SEO keywords"]
}

Rules:
- Be accurate about what you see
- Use specific product names (e.g., "Wireless Bluetooth Headphones" not just "headphones")
- Return ONLY valid JSON
- NO markdown, NO backticks, NO explanations`,

  /**
   * Product Content Generation Prompt
   */
  PRODUCT_CONTENT: (userTitle?: string, userStyle?: string) => `
You are an expert e-commerce copywriter.

${userTitle ? `**IMPORTANT: Use this exact title: "${userTitle}"**` : 'Generate a compelling product title'}

${userStyle ? `**Writing Style to Match:**\n${userStyle}\n` : ''}

Based on the product analysis provided, generate ONLY a JSON object with:

{
  "title": "${userTitle || 'catchy product title (50-70 characters)'}",
  "description": "compelling 2-3 paragraph product description (200-300 words)",
  "shortDescription": "brief one-liner for previews (120-150 characters)",
  "category": "product category",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "seoTitle": "SEO optimized title (50-60 characters)",
  "seoDescription": "SEO meta description (150-160 characters)",
  "seoKeywords": ["seo_keyword1", "seo_keyword2", "seo_keyword3"]
}

Rules:
- Write persuasive, benefit-focused copy
- Use natural, engaging language
- Include emotional triggers and value propositions
- Make it ready for immediate e-commerce use
- Return ONLY valid JSON
- NO markdown, NO backticks, NO explanations
${userTitle ? '- Use the EXACT title provided above' : ''}`,

  /**
   * Writing Style Analysis Prompt
   */
  STYLE_ANALYSIS: (samples: string) => `Analyze these product descriptions and identify the writing style:

${samples}

Summarize the style in 2-3 concise sentences focusing on:
- Tone (formal, casual, enthusiastic, professional)
- Vocabulary level (simple, technical, sophisticated)
- Sentence structure (short, varied, complex)
- Use of adjectives and marketing language
- Overall voice and personality

Be specific and actionable so this style can be replicated.`,

  /**
   * Smart Search Query Generator
   */
  SEARCH_QUERY_GENERATOR: (productType: string, category: string) => 
    `Generate 5 diverse search queries for finding related images for this product:
Product: ${productType}
Category: ${category}

Return queries that would find:
1. Direct product photos
2. Lifestyle/contextual images
3. Mockup/presentation images
4. Color/style variations
5. Related accessories

Return as JSON array: ["query1", "query2", ...]`
};

export default AI_PROMPTS;