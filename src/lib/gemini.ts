import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateProductIdentity(description: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this product description: "${description}", create a detailed visual identity for the product. 
    Focus on physical characteristics: shape, materials, colors, textures, and any unique branding elements or logos. 
    Keep it concise but descriptive enough to ensure visual consistency in image generation. 
    Do NOT include any people in the description.`,
  });
  return response.text || description;
}

export async function generateBrandImage(identity: string, medium: string) {
  const prompt = `A professional, high-quality commercial photograph of the following product: ${identity}. 
  The product is featured in a ${medium} context. 
  The lighting should be cinematic and the composition should be professional. 
  STRICT REQUIREMENT: There must be NO PEOPLE in the image. 
  The image should focus entirely on the product and its environment.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: medium === "billboard" ? "16:9" : medium === "social post" ? "1:1" : "3:4",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
