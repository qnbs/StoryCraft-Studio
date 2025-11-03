
import { GoogleGenAI, Type } from "@google/genai";
import { OutlineSection } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateWithGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 } // For faster response
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "Error: Could not generate content. Please check the console for details.";
  }
};

export const generateCharacterProfile = async (name: string, concept: string) => {
    const prompt = `Generate a detailed character profile for a story.
    Character Name: ${name}
    Core Concept: ${concept}
    
    Please provide a detailed backstory, a strong motivation, and a description of their appearance and personality.
    `;
    return generateWithGemini(prompt);
};

export const generateWorldDetails = async (name: string, concept: string) => {
    const prompt = `Generate detailed world-building information for a story.
    World Name: ${name}
    Core Concept: ${concept}

    Please provide details on its history, geography, and any unique systems like magic or technology.
    `;
    return generateWithGemini(prompt);
};

export const generateScene = async (context: string, type: 'description' | 'dialogue' | 'ending') => {
    let prompt = `You are an AI writing assistant for a novelist.`;

    switch(type) {
        case 'description':
            prompt += `\nWrite a vivid scene description based on this context: "${context}". Focus on sensory details and atmosphere.`;
            break;
        case 'dialogue':
            prompt += `\nWrite compelling dialogue based on this scenario: "${context}". Ensure the characters have distinct voices.`;
            break;
        case 'ending':
            prompt += `\nWrite a compelling and surprising alternative ending for this story plot: "${context}".`;
            break;
    }
    return generateWithGemini(prompt);
};

export const generateJsonFromPrompt = async <T,>(prompt: string, schema: any): Promise<T | null> => {
  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: schema,
          },
      });

      const text = response.text.trim();
      return JSON.parse(text) as T;
  } catch (error) {
      console.error("Error generating JSON content with Gemini:", error);
      return null;
  }
};

export const generateStoryOutline = async (genre: string, idea: string): Promise<OutlineSection[] | null> => {
    const prompt = `You are an expert story planner. Generate a compelling story outline based on the user's request.
    The outline should be structured into clear acts or chapters. For each part, provide a concise title and a paragraph describing the key plot points and character developments.

    Genre: ${genre}
    Story Idea: ${idea}

    Return the outline as a JSON array of objects.`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: 'The title of the chapter, act, or story section.'
                },
                description: {
                    type: Type.STRING,
                    description: 'A summary of the key events, plot points, and character arcs in this section.'
                }
            },
            required: ['title', 'description']
        }
    };

    return generateJsonFromPrompt<OutlineSection[]>(prompt, schema);
};
