"use server";

import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';
import path from 'path';

let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf-8');
    const match = envLocal.match(/(?:^|\n)NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
    } else {
      const match2 = envLocal.match(/(?:^|\n)GEMINI_API_KEY=(.*)/);
      if (match2 && match2[1]) {
        apiKey = match2[1].trim();
      }
    }
  }
} catch (e) {
  console.error("Failed to read .env.local", e);
}

const ai = new GoogleGenAI({ apiKey });

export async function generateRoadmap(goal: string, timeline: string, hours: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a learning roadmap for: ${goal}. Timeline: ${timeline}. Time commitment: ${hours} hours per day.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          totalDuration: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                impact: { type: Type.STRING }
              },
              required: ["title", "duration", "objectives", "impact"]
            }
          }
        },
        required: ["title", "totalDuration", "nodes"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate roadmap");
  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Invalid JSON response from AI");
  }
}

export async function refineRoadmap(currentRoadmap: any, prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current Roadmap: ${JSON.stringify(currentRoadmap)}. User request to refine: ${prompt}. Return the updated roadmap.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          totalDuration: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                impact: { type: Type.STRING }
              },
              required: ["title", "duration", "objectives", "impact"]
            }
          }
        },
        required: ["title", "totalDuration", "nodes"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to refine roadmap");
  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Invalid JSON response from AI");
  }
}

export async function teachingExplain(concept: string, context: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explain the concept: "${concept}" in the context of: "${context}".`,
    config: {
      systemInstruction: `You are an AI tutor inside a learning app.
Rules:
- Respond conversationally like ChatGPT.
- Use short paragraphs (2–4 lines max).
- Use bullet points only when helpful.
- Do NOT narrate roadmap structure.
- Do NOT include external resources.
- Do NOT include course suggestions.
- Do NOT include animations or UI references.
- Do NOT mention phases unless explicitly asked.
- Do NOT include code unless user asks.
- Keep responses clear, tight, and readable.
- Default length: 300–600 words max.
- Only go longer if user explicitly asks for deep detail.`
    }
  });

  if (!response.text) throw new Error("Failed to generate explanation");
  return response.text;
}

export async function generateNotes(topic: string, context: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate notes for the topic: "${topic}" in the context of: "${context}".`,
    config: {
      systemInstruction: `You are an AI tutor inside a learning app.
Rules:
- Return concise study notes.
- Use headings + bullets.
- No essays.
- No storytelling.
- No roadmap narration.
- No external links.
- No allocated resources.
- Use this structure pattern:
  # Topic Name
  **Definition:** Short 1–2 line explanation.
  **Key Points:**
  - Point 1
  - Point 2
  - Point 3
  **Important Terms:**
  - Term → meaning
- Keep each section short.
- Maximum response length: 500 words unless user asks for detailed notes.`
    }
  });

  if (!response.text) throw new Error("Failed to generate notes");
  return response.text;
}
