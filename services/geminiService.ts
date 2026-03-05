import { GoogleGenAI, Type, GenerateContentResponse, Schema } from '@google/genai';
import { AiCreativity, Character, World, OutlineSection, GeminiSchema, OutlineGenerationParams, CustomTemplateParams } from '../types';
import { dbService } from './dbService';
import { storageService } from './storageService';

// === DYNAMIC API KEY MANAGEMENT ===
// KRITISCH: Kein hardcoded API key mehr!
// Der Key wird verschlüsselt in IndexedDB gespeichert und bei Bedarf geladen.

let cachedAiClient: GoogleGenAI | null = null;
let cachedApiKeyHash: string | null = null;

const hashApiKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
};

const getAiClient = async (): Promise<GoogleGenAI> => {
  const apiKey = await storageService.getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error(
      'NO_API_KEY: Kein Gemini API-Key konfiguriert. ' +
      'Bitte öffnen Sie die Einstellungen und fügen Sie Ihren API-Key hinzu.'
    );
  }

  // Cache invalidation bei Key-Änderung
  const currentHash = await hashApiKey(apiKey);
  if (cachedAiClient && cachedApiKeyHash === currentHash) {
    return cachedAiClient;
  }

  cachedAiClient = new GoogleGenAI({ apiKey });
  cachedApiKeyHash = currentHash;
  return cachedAiClient;
};

// Reset cache when key changes
export const invalidateAiClientCache = (): void => {
  cachedAiClient = null;
  cachedApiKeyHash = null;
};

const creativityToTemperature: Record<AiCreativity, number> = {
    'Focused': 0.2,
    'Balanced': 0.7,
    'Imaginative': 1.0
};

const getModelForText = () => 'gemini-2.5-flash';
const getModelForImage = () => 'gemini-2.5-flash-image';

// --- Hilfsfunktion für Retry ---
async function retry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            // Nur bei Netzwerkfehlern oder temporären Fehlern erneut versuchen
            if (err instanceof DOMException && err.name === 'AbortError') throw err;
            if (attempt < retries) await new Promise(res => setTimeout(res, delayMs));
        }
    }
    throw lastError;
}

function getUserFriendlyGeminiError(error: any): string {
    if (error instanceof Error) {
        if (error.message.includes('NO_API_KEY')) {
            return 'Gemini API-Key fehlt. Bitte in den Einstellungen hinterlegen.';
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return 'Netzwerkfehler: Die Verbindung zum Gemini-Server ist fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
        }
        if (error.message.includes('quota') || error.message.includes('limit')) {
            return 'Das Nutzungslimit für die Gemini-API wurde erreicht. Bitte warten Sie etwas und versuchen Sie es später erneut.';
        }
        if (error.message.includes('format')) {
            return 'Die Antwort des KI-Modells war ungültig. Bitte versuchen Sie es erneut.';
        }
        return error.message;
    }
    return 'Unbekannter Fehler bei der Gemini-API.';
}
// --- PROMPT TYPES ---
type PromptType = 'logline' | 'characterProfile' | 'regenerateCharacterField' | 'characterPortrait' | 'worldProfile' | 'regenerateWorldField' | 'worldImage' | 'outline' | 'regenerateOutlineSection' | 'personalizeTemplate' | 'customTemplate' | 'synopsis' | 'proofread' | 'consistencyCheck' | 'criticAnalysis' | 'plotHoleDetection';

type BasePromptParams = { lang: string };

type LoglineParams = BasePromptParams & { project: { title: string; outline: { title: string }[] } };
type CharacterProfileParams = BasePromptParams & { concept: string };
type RegenerateCharacterFieldParams = BasePromptParams & { character: Character; field: keyof Character };
type CharacterPortraitParams = BasePromptParams & { description: string };
type WorldProfileParams = BasePromptParams & { concept: string };
type RegenerateWorldFieldParams = BasePromptParams & { world: World; field: keyof World };
type WorldImageParams = BasePromptParams & { description: string };
type RegenerateOutlineSectionParams = BasePromptParams & { allSections: OutlineSection[]; sectionToIndex: number; };
type PersonalizeTemplateParams = BasePromptParams & { concept: string; sections: { title: string }[]; };
type SynopsisParams = BasePromptParams & { project: { title: string; logline: string; manuscript: { title: string; content: string }[] } };
type ProofreadParams = BasePromptParams & { text: string };
type ConsistencyCheckParams = BasePromptParams & { characterId: string; characters: Character[]; worlds: World[]; manuscript: { title: string; content: string }[]; relationships?: any[] };
type CriticAnalysisParams = BasePromptParams & { text: string; context?: string };
type PlotHoleDetectionParams = BasePromptParams & { project: { title: string; logline: string; manuscript: { title: string; content: string }[]; characters: Character[]; worlds: World[] } };

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
    proofread: ProofreadParams;
    consistencyCheck: ConsistencyCheckParams;
    criticAnalysis: CriticAnalysisParams;
    plotHoleDetection: PlotHoleDetectionParams;
};

// --- THINKING CONFIGURATION ---
const getThinkingBudget = (type: PromptType): number => {
    switch (type) {
        case 'outline':
        case 'customTemplate':
            return 4096;
        case 'characterProfile':
        case 'worldProfile':
        case 'regenerateOutlineSection':
            return 2048;
        case 'personalizeTemplate':
        case 'synopsis':
        case 'proofread':
            return 1024;
        default:
            return 0;
    }
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
                },
                thinkingBudget: getThinkingBudget('outline')
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
                schema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] },
                thinkingBudget: getThinkingBudget('regenerateOutlineSection')
            };
        }
        case 'personalizeTemplate': {
            const p = params as PersonalizeTemplateParams;
            return {
                prompt: `Personalize this story template for the concept: "${p.concept}". For each section title provided, create a short, inspiring "prompt" (a few sentences) to guide the writer.
                Sections: ${JSON.stringify(p.sections.map(s => s.title))}
                ${langInstruction}`,
                schema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING } }, required: ['title', 'prompt'] } },
                thinkingBudget: getThinkingBudget('personalizeTemplate')
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
                schema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING } }, required: ['title'] } },
                thinkingBudget: getThinkingBudget('customTemplate')
            };
        }
         case 'synopsis': {
            const p = params as SynopsisParams;
            return {
                prompt: `Based on the following story details, write a concise, one-page synopsis (3-4 paragraphs) suitable for a book proposal or query letter.\nTitle: ${p.project.title}\nLogline: ${p.project.logline}\nManuscript Text:\n${p.project.manuscript.map(s => `Chapter: ${s.title}\n${s.content}`).join('\n\n').substring(0, 10000)}...\n(Text truncated for length)${langInstruction}`,
                thinkingBudget: getThinkingBudget('synopsis')
            };
        }
        case 'proofread': {
            const p = params as ProofreadParams;
            return {
                prompt: `Act as a professional copy editor. Review the following text for spelling, grammar, punctuation, and flow errors.
                Return a JSON list of issues found. For each issue, provide the 'original' text snippet, the 'suggestion' to fix it, and a brief 'explanation'.
                If the text is perfect, return an empty array.
                Text to review:
                """
                ${p.text}
                """
                ${langInstruction}`,
                schema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            original: { type: Type.STRING },
                            suggestion: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        },
                        required: ['original', 'suggestion', 'explanation']
                    }
                },
                thinkingBudget: getThinkingBudget('proofread')
            }
        }
        case 'consistencyCheck': {
            const p = params as ConsistencyCheckParams;
            const character = p.characters.find(c => c.id === p.characterId);
            if (!character) throw new Error('Character not found');
            const context = `
Characters: ${JSON.stringify(p.characters)}
Worlds: ${JSON.stringify(p.worlds)}
Relationships: ${JSON.stringify(p.relationships || [])}
Manuscript: ${p.manuscript.map(s => `${s.title}: ${s.content}`).join('\n\n').substring(0, 50000)}
            `;
            return {
                prompt: `You are a consistency checker for a story universe. Analyze the character "${character.name}" for any contradictions or inconsistencies with the established lore, other characters, world-building, and the written manuscript.

Character Details: ${JSON.stringify(character)}
Full Context: ${context}

Identify any inconsistencies, plot holes, or contradictions related to this character. Be thorough but concise. If there are no issues, state that clearly.

${langInstruction}`,
                thinkingBudget: getThinkingBudget('consistencyCheck')
            };
        }
        case 'criticAnalysis': {
            const p = params as CriticAnalysisParams;
            return {
                prompt: `Act as a professional literary critic and editor. Analyze the following text for writing quality, character development, pacing, dialogue, and overall effectiveness.

Text to analyze:
"""
${p.text}
"""
${p.context ? `Context: ${p.context}` : ''}

Provide constructive feedback on strengths and weaknesses. Suggest specific improvements.

${langInstruction}`,
                thinkingBudget: getThinkingBudget('criticAnalysis')
            };
        }
        case 'plotHoleDetection': {
            const p = params as PlotHoleDetectionParams;
            const context = `
Title: ${p.project.title}
Logline: ${p.project.logline}
Characters: ${JSON.stringify(p.project.characters)}
Worlds: ${JSON.stringify(p.project.worlds)}
Manuscript: ${p.project.manuscript.map(s => `${s.title}: ${s.content}`).join('\n\n').substring(0, 50000)}
            `;
            return {
                prompt: `You are a plot hole detector for stories. Analyze the entire story for logical inconsistencies, plot holes, character inconsistencies, timeline issues, and unresolved threads.

Full Context: ${context}

List any plot holes, inconsistencies, or issues you find. For each issue, explain what the problem is and suggest how to fix it. If the story is consistent, state that clearly.

${langInstruction}`,
                thinkingBudget: getThinkingBudget('plotHoleDetection')
            };
        }
        default:
            throw new Error(`Unknown prompt type: ${type}`);
    }
}

// --- API CALLS ---

export const generateText = async (prompt: string, creativity: AiCreativity, signal?: AbortSignal, thinkingBudget?: number): Promise<string> => {
    try {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const ai = await getAiClient();

        const config: any = {
            temperature: creativityToTemperature[creativity],
        };

        if (thinkingBudget && thinkingBudget > 0) {
            config.thinkingConfig = { thinkingBudget };
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: getModelForText(),
            contents: prompt,
            config: config,
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

export const generateJson = async <T>(prompt: string, creativity: AiCreativity, schema: GeminiSchema, signal?: AbortSignal, thinkingBudget?: number): Promise<T> => {
    try {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const ai = await getAiClient();
        
        const config: any = {
            temperature: creativityToTemperature[creativity],
            responseMimeType: 'application/json',
            responseSchema: schema as Schema // Safely cast to SDK Schema type
        };

        if (thinkingBudget && thinkingBudget > 0) {
            config.thinkingConfig = { thinkingBudget };
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: getModelForText(),
            contents: prompt,
            config: config,
        });
        
        const rawText = response.text || '';
        // Robust cleaning: removes ```json or ``` at start, and ``` at end, handling optional newlines
        let jsonText = rawText.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
        }
        
        try {
            return JSON.parse(jsonText) as T;
        } catch (e) {
            console.error("Failed to parse JSON from model:", jsonText);
            throw new Error("The AI response was not in a valid format. Please try again.");
        }
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError' || signal?.aborted) {
             throw error;
        }
        console.error("Error generating JSON:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate structured data from AI.";
        throw new Error(errorMessage);
    }
}

export const checkConsistency = async (characterId: string, creativity: AiCreativity, lang: string): Promise<string> => {
    const { prompt } = getPrompts('consistencyCheck', { characterId, lang });
    return await generateText(prompt, creativity);
};

export const analyzeAsCritic = async (text: string, creativity: AiCreativity, lang: string): Promise<string> => {
    const { prompt } = getPrompts('criticAnalysis', { text, lang });
    return await generateText(prompt, creativity);
};

export const detectPlotHoles = async (text: string, creativity: AiCreativity, lang: string): Promise<string> => {
    const { prompt } = getPrompts('plotHoleDetection', { text, lang });
    return await generateText(prompt, creativity);
};

export const streamText = async (prompt: string, creativity: AiCreativity, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void> => {
    try {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const ai = await getAiClient();

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

        const ai = await getAiClient();

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

        const ai = await getAiClient();

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