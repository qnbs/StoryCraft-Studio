import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { AiCreativity, Character, World, OutlineSection, GeminiSchema, OutlineGenerationParams, CustomTemplateParams } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const creativityToTemperature: Record<AiCreativity, number> = {
    'Focused': 0.2,
    'Balanced': 0.7,
    'Imaginative': 1.0
};

const getModelForText = () => 'gemini-2.5-flash';
const getModelForImage = () => 'gemini-2.5-flash-image';

// --- PROMPT TYPES ---
type PromptType = 'logline' | 'characterProfile' | 'regenerateCharacterField' | 'characterPortrait' | 'worldProfile' | 'regenerateWorldField' | 'worldImage' | 'outline' | 'regenerateOutlineSection' | 'personalizeTemplate' | 'customTemplate' | 'synopsis';

type BasePromptParams = { lang: string };

type LoglineParams = BasePromptParams & { project: { title: string; outline: { title: string }[] } };
type CharacterProfileParams = BasePromptParams & { concept: string };
type RegenerateCharacterFieldParams = BasePromptParams & { character: Character; field: keyof Character };
type CharacterPortraitParams = BasePromptParams & { description: string };
type WorldProfileParams = BasePromptParams & { concept: string };
type RegenerateWorldFieldParams = BasePromptParams & { world: World; field: keyof World };
type WorldImageParams = BasePromptParams & { description: string };
// Use interface from types.ts for OutlineParams
type RegenerateOutlineSectionParams = BasePromptParams & { allSections: OutlineSection[]; sectionToIndex: number; };
type PersonalizeTemplateParams = BasePromptParams & { concept: string; sections: { title: string }[]; };
// Use interface from types.ts for CustomTemplateParams
type SynopsisParams = BasePromptParams & { project: { title: string; logline: string; manuscript: { title: string; content: string }[] } };

type PromptParamsMap = {
    logline: LoglineParams;
    characterProfile: CharacterProfileParams;
    regenerateCharacterField: RegenerateCharacterFieldParams;
    characterPortrait: CharacterPortraitParams;
    worldProfile: WorldProfileParams;
    regenerateWorldField: RegenerateWorldFieldParams;
    worldImage: WorldImageParams;
    outline: OutlineGenerationParams;
    regenerateOutlineSection: RegenerateOutlineSectionParams;
    personalizeTemplate: PersonalizeTemplateParams;
    customTemplate: CustomTemplateParams;
    synopsis: SynopsisParams;
};


// --- PROMPT FACTORY ---
export const getPrompts = <T extends PromptType>(type: T, params: PromptParamsMap[T]) => {
    const langInstruction = `\n\nVERY IMPORTANT: Your entire response must be in the following language: ${params.lang === 'de' ? 'German' : 'English'}. Do not use any other language. For JSON responses, only translate the string values, not the keys.`;

    switch (type) {
        case 'logline': {
            const p = params as LoglineParams;
            return {
                prompt: `Based on the following story details, generate 4 compelling and diverse logline suggestions.\nTitle: ${p.project.title}\nOutline: ${p.project.outline.map(s => s.title).join(', ')}\n${langInstruction}`,
                schema: { type: Type.ARRAY, items: { type: Type.STRING } }
            };
        }
        case 'characterProfile': {
            const p = params as CharacterProfileParams;
            return {
                prompt: `Generate a detailed character profile based on this concept: "${p.concept}". The profile should include fields for 'name', 'backstory', 'motivation', 'appearance', 'personalityTraits', 'flaws', 'characterArc', and 'relationships'.${langInstruction}`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING }, backstory: { type: Type.STRING }, motivation: { type: Type.STRING },
                        appearance: { type: Type.STRING }, personalityTraits: { type: Type.STRING }, flaws: { type: Type.STRING },
                        characterArc: { type: Type.STRING }, relationships: { type: Type.STRING }
                    }
                }
            };
        }
        case 'regenerateCharacterField': {
             const p = params as RegenerateCharacterFieldParams;
             return { prompt: `Given the character profile:\n${JSON.stringify(p.character, null, 2)}\n\nRewrite or expand upon the "${String(p.field)}" field to be more compelling and detailed.${langInstruction}` };
        }
        case 'characterPortrait': {
             const p = params as CharacterPortraitParams;
             return { prompt: `Create a vivid, artistic, digital painting style portrait of a character based on this description: "${p.description}". The portrait should be centered, showing the character from the chest up. The background should be simple and atmospheric, complementing the character's description. Focus on capturing the character's key features and mood. Do not include any text or watermarks.${langInstruction}` };
        }
        case 'worldProfile': {
            const p = params as WorldProfileParams;
            return {
                prompt: `Generate a detailed world profile based on this concept: "${p.concept}". The profile should include 'name', 'description', 'geography', 'magicSystem', and 'culture'.${langInstruction}`,
                schema: {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, geography: { type: Type.STRING },
                        magicSystem: { type: Type.STRING }, culture: { type: Type.STRING }
                    }
                }
            };
        }
        case 'regenerateWorldField': {
             const p = params as RegenerateWorldFieldParams;
             return { prompt: `Given the world profile:\n${JSON.stringify(p.world, null, 2)}\n\nRewrite or expand upon the "${String(p.field)}" field to be more detailed and imaginative.${langInstruction}` };
        }
        case 'worldImage': {
            const p = params as WorldImageParams;
            return { prompt: `Generate a breathtaking, atmospheric, digital painting of a fantasy/sci-fi landscape that captures the essence of this description: "${p.description}". Focus on the mood, lighting, and key geographical features. Do not include any text or watermarks.${langInstruction}` };
        }
        case 'outline': {
            const p = params as OutlineGenerationParams;
            return {
                prompt: `Generate a story outline with ${p.numChapters} sections for a ${p.pacing || ''} ${p.genre}.
                Core Idea: ${p.idea}
                ${p.characters ? `Key Characters: ${p.characters}` : ''}
                ${p.setting ? `Setting: ${p.setting}` : ''}
                ${p.includeTwist ? 'The outline must include a significant plot twist in one of the later sections.' : ''}
                For each section, provide a "title" and a "description". If a section is a plot twist, add "isTwist": true.
                ${langInstruction}`,
                schema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            isTwist: { type: Type.BOOLEAN }
                        },
                        required: ['title', 'description']
                    }
                }
            };
        }
        case 'regenerateOutlineSection': {
            const p = params as RegenerateOutlineSectionParams;
            const { allSections, sectionToIndex } = p;
            const contextSections = allSections.slice(Math.max(0, sectionToIndex - 2), sectionToIndex + 2);
            return {
                prompt: `You are regenerating a single section of a story outline.
                Here is the context of the surrounding sections: ${JSON.stringify(contextSections)}
                The section to regenerate is: "${allSections[sectionToIndex].title}".
                Provide a new, more interesting version of this section with a new "title" and "description".
                ${langInstruction}`,
                schema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] }
            };
        }
        case 'personalizeTemplate': {
            const p = params as PersonalizeTemplateParams;
            return {
                prompt: `Personalize this story template for the concept: "${p.concept}". For each section title provided, create a short, inspiring "prompt" (a few sentences) to guide the writer.
                Sections: ${JSON.stringify(p.sections.map(s => s.title))}
                ${langInstruction}`,
                schema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING } }, required: ['title', 'prompt'] } }
            };
        }
        case 'customTemplate': {
            const p = params as CustomTemplateParams;
            return {
                prompt: `Generate a custom story structure template with approximately ${p.numSections} sections.
                Concept: ${p.customConcept}
                Key Elements: ${p.customElements}
                For each section, just provide a "title".
                ${langInstruction}`,
                schema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING } }, required: ['title'] } }
            };
        }
         case 'synopsis': {
            const p = params as SynopsisParams;
            return {
                prompt: `Based on the following story details, write a concise, one-page synopsis (3-4 paragraphs).\nTitle: ${p.project.title}\nLogline: ${p.project.logline}\nManuscript: ${p.project.manuscript.map(s => `Title: ${s.title}\nContent: ${s.content.substring(0, 500)}...`).join('\n\n')}\n${langInstruction}`
            };
        }
        default:
            throw new Error(`Unknown prompt type: ${type}`);
    }
}

// --- API CALLS ---

export const generateText = async (prompt: string, creativity: AiCreativity, signal?: AbortSignal): Promise<string> => {
    try {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: getModelForText(),
            contents: prompt,
            config: {
                temperature: creativityToTemperature[creativity],
            },
        });
        return response.text || '';
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError' || signal?.aborted) {
             throw error;
        }
        console.error("Error generating text:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate text from AI.";
        throw new Error(errorMessage);
    }
};

export const generateJson = async <T>(prompt: string, creativity: AiCreativity, schema: GeminiSchema, signal?: AbortSignal): Promise<T> => {
    try {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: getModelForText(),
            contents: prompt,
            config: {
                temperature: creativityToTemperature[creativity],
                responseMimeType: 'application/json',
                responseSchema: schema as any // Cast to any as SDK type compatibility might vary slightly with our strict interface
            },
        });
        
        const rawText = response.text || '';
        // CRITICAL FIX: Strip markdown code blocks if present to ensure parsing succeeds.
        // LLMs often return ```json { ... } ``` even when responseMimeType is set.
        const jsonText = rawText.replace(/```json\n?|```/g, '').trim();
        
        return JSON.parse(jsonText) as T;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError' || signal?.aborted) {
             throw error;
        }
        console.error("Error generating JSON:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate structured data from AI.";
        throw new Error(errorMessage);
    }
}

export const streamText = async (prompt: string, creativity: AiCreativity, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void> => {
    try {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        const responseStream = await ai.models.generateContentStream({
            model: getModelForText(),
            contents: prompt,
            config: {
                temperature: creativityToTemperature[creativity],
            },
        });

        for await (const chunk of responseStream) {
            if (signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError' || signal?.aborted) {
             // We can suppress abort errors in streaming if we just want to stop silently, 
             // but re-throwing allows Redux to know it was cancelled.
             throw error;
        }
        console.error("Error streaming text:", error);
         const errorMessage = error instanceof Error ? error.message : "Failed to stream text from AI.";
        throw new Error(errorMessage);
    }
};

export const streamAiHelpResponse = async (question: string, onChunk: (chunk: string) => void, temperature: number, signal?: AbortSignal): Promise<void> => {
    try {
         if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        const prompt = `You are a helpful assistant for a creative writing app called StoryCraft Studio. Answer the user's question concisely and clearly. Format your answer using Markdown. Question: ${question}`;
        const responseStream = await ai.models.generateContentStream({
            model: getModelForText(),
            contents: prompt,
            config: {
                temperature: temperature,
            },
        });

        for await (const chunk of responseStream) {
             if (signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }
             if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error: unknown) {
         if (error instanceof Error && error.name === 'AbortError' || signal?.aborted) {
             throw error;
        }
        console.error("Error streaming AI help response:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get help from AI assistant.";
        throw new Error(errorMessage);
    }
};

export const generateImage = async (prompt: string, signal?: AbortSignal): Promise<string> => {
    try {
         if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        const response = await ai.models.generateContent({
            model: getModelForImage(),
            contents: {
                parts: [
                    { text: prompt }
                ]
            },
            config: {
                // Nano Banana doesn't support responseMimeType, using text prompt to get image part
            }
        });

        // Iterate to find the image part
        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts) {
             for (const part of response.candidates[0].content.parts) {
                 if (part.inlineData) {
                     return part.inlineData.data;
                 }
             }
        }
        
        throw new Error("No image was generated.");
    } catch (error: unknown) {
         if (error instanceof Error && error.name === 'AbortError' || signal?.aborted) {
             throw error;
        }
        console.error("Error generating image:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate image from AI.";
        throw new Error(errorMessage);
    }
};
