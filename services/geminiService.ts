import { GoogleGenAI, Modality, Type } from "@google/genai";
import { blobToBase64 } from '../utils/blob';
import { InstrumentFeedback, StudyPlan, StudyMaterial, Module, SearchResult, GroundingSource, Composition, TheoryLesson, FinalEvaluation, VocalFeedback, WarmUpFeedback } from "../types";
import { getTranslator } from "../i18n";
import { getApiKey } from "../utils/apiKey";

export const generateSpeechData = async (text: string, voice: string = 'Charon'): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech data:", error);
        throw new Error("Failed to generate Maestre Arco's voice.");
    }
};

export const generateStudyPlan = async (instrument: string, language: 'en' | 'es'): Promise<StudyPlan> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = t('generateStudyPlanPrompt', { instrument });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    instrument: { type: Type.STRING },
                    modules: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                module: { type: Type.NUMBER },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                instrument_technique: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                        },
                                        required: ["title", "description"]
                                    }
                                },
                                music_theory: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                        },
                                        required: ["title", "description"]
                                    }
                                },
                                music_history: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                        },
                                        required: ["title", "description"]
                                    }
                                }
                            },
                             required: ["module", "title", "description", "instrument_technique", "music_theory", "music_history"]
                        }
                    }
                },
                required: ["instrument", "modules"]
            }
        }
    });

    const jsonText = response.text.trim();
    try {
        const parsedPlan = JSON.parse(jsonText) as StudyPlan;
        // The Gemini schema doesn't support adding sources directly, so we can skip that part
        return parsedPlan;
    } catch (e) {
        console.error("Failed to parse study plan JSON:", e);
        console.error("Received text from API:", response.text);
        throw new Error("The Maestre's response was not in the expected JSON format.");
    }
};

export const generateStudyMaterial = async (instrument: string, module: Module, language: 'en' | 'es'): Promise<StudyMaterial> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = t('generateStudyMaterialPrompt', { moduleNum: module.module.toString(), moduleTitle: module.title, instrument });
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                theoretical_concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                warm_up_exercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                main_pieces: { type: Type.ARRAY, items: { type: Type.STRING } },
                interpretation_tips: { type: Type.STRING },
            },
            required: ["title", "theoretical_concepts", "warm_up_exercises", "main_pieces", "interpretation_tips"]
        }
      },
    });
  
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as StudyMaterial;
};

export const analyzePerformanceVideo = async (videoBlob: Blob, language: 'en' | 'es'): Promise<InstrumentFeedback> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const videoBase64 = await blobToBase64(videoBlob);

    const prompt = t('analyzePerformanceVideoPrompt');
    
    const videoPart = {
        inlineData: {
            mimeType: videoBlob.type,
            data: videoBase64,
        },
    };
    
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [videoPart, textPart] },
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    instrumento: { type: Type.STRING },
                    analisisTono: { type: Type.STRING },
                    analisisRitmo: { type: Type.STRING },
                    analisisPostura: { type: Type.STRING },
                    sugerencias: { type: Type.STRING },
                    evaluacion: {
                        type: Type.OBJECT,
                        properties: {
                            intonation: { type: Type.NUMBER },
                            rhythm: { type: Type.NUMBER },
                            musicality: { type: Type.NUMBER },
                            interpretation: { type: Type.NUMBER },
                            total: { type: Type.NUMBER },
                        },
                        required: ["intonation", "rhythm", "musicality", "interpretation", "total"]
                    }
                },
                required: ["instrumento", "analisisTono", "analisisRitmo", "analisisPostura", "sugerencias", "evaluacion"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as InstrumentFeedback;
};

export const askMaestreWithGoogleSearch = async (query: string, language: 'en' | 'es'): Promise<SearchResult> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const prompt = t('hallOfKnowledgePrompt', { query });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const answer = response.text;
    const sources: GroundingSource[] = [];

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        for (const chunk of groundingChunks) {
            if (chunk.web) {
                if (!sources.some(source => source.uri === chunk.web.uri)) {
                    sources.push({
                        uri: chunk.web.uri,
                        title: chunk.web.title || new URL(chunk.web.uri).hostname,
                    });
                }
            }
        }
    }

    return { answer, sources };
};

export const getPlaceFromCoordinates = async (latitude: number, longitude: number, language: 'en' | 'es'): Promise<string> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = t('getPlacePrompt');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude,
                            longitude
                        }
                    }
                }
            },
        });

        if (!response.text || response.text.trim() === '') {
            throw new Error("API returned an empty response for the location.");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Gemini Maps API call failed:", error);
        throw new Error("Failed to get place name from coordinates via API.");
    }
};

export const generateComposition = async (topic: string, language: 'en' | 'es'): Promise<Composition> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = t('generateCompositionPrompt', { topic });
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                lyrics: { type: Type.STRING },
                chords: { type: Type.STRING },
                melodyDescription: { type: Type.STRING },
                mood: { type: Type.STRING },
            },
            required: ["lyrics", "chords", "melodyDescription", "mood"]
        }
      },
    });
  
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Composition;
};

export const generateTheoryLessonAndExercises = async (topic: string, instrument: string, language: 'en' | 'es'): Promise<TheoryLesson> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = t('generateTheoryLessonPrompt', { topic, instrument });
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING },
                explanation: { type: Type.STRING },
                exercises: { 
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING },
                                nullable: true
                            },
                            answer: { type: Type.STRING }
                        },
                        required: ["question", "type", "answer"]
                    }
                },
            },
            required: ["topic", "explanation", "exercises"]
        }
      },
    });
  
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TheoryLesson;
};

export const generateFinalEvaluation = async (transcript: string, module: Module, language: 'en' | 'es'): Promise<FinalEvaluation> => {
    const t = getTranslator(language);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = t('generateFinalEvaluationPrompt', { 
        moduleNum: module.module.toString(), 
        moduleTitle: module.title, 
        transcript 
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overallFeedback: { type: Type.STRING },
                    score: {
                        type: Type.OBJECT,
                        properties: {
                            intonation: { type: Type.NUMBER },
                            rhythm: { type: Type.NUMBER },
                            musicality: { type: Type.NUMBER },
                            interpretation: { type: Type.NUMBER },
                            total: { type: Type.NUMBER },
                        },
                        required: ["intonation", "rhythm", "musicality", "interpretation", "total"]
                    },
                    passed: { type: Type.BOOLEAN }
                },
                required: ["overallFeedback", "score", "passed"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FinalEvaluation;
};

export const analyzeVocalPerformance = async (audioBlob: Blob, graphImageBase64: string, prompt: string): Promise<VocalFeedback> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const audioBase64 = await blobToBase64(audioBlob);
    const imageBase64Data = graphImageBase64.split(',')[1];

    const audioPart = { inlineData: { mimeType: audioBlob.type, data: audioBase64 } };
    const imagePart = { inlineData: { mimeType: 'image/png', data: imageBase64Data } };
    const textPart = { text: prompt };

    const parts: any[] = [audioPart, textPart];
    if (imageBase64Data) {
        parts.splice(1, 0, imagePart);
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: parts },
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pitchAnalysis: { type: Type.STRING },
                    rhythmAnalysis: { type: Type.STRING },
                    breathingAnalysis: { type: Type.STRING },
                    overallFeedback: { type: Type.STRING },
                },
                required: ["pitchAnalysis", "rhythmAnalysis", "breathingAnalysis", "overallFeedback"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as VocalFeedback;
};

export const analyzeWarmUpRepetition = async (audioBlob: Blob, instruction: string): Promise<WarmUpFeedback> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const audioBase64 = await blobToBase64(audioBlob);

    const audioPart = { inlineData: { mimeType: audioBlob.type, data: audioBase64 } };
    const textPart = { text: `You are Mrs. Glorifique, an expert vocal coach. The student was given the instruction: "${instruction}". This is their audio recording repeating the exercise. Please provide concise, encouraging feedback on their performance. For lip trills ('brrr'), check for consistency. For articulation exercises ('Ma-Me-Mi-Mo-Mu'), check for clarity. Respond only in JSON.` };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [audioPart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    feedback: { type: Type.STRING },
                },
                required: ["feedback"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as WarmUpFeedback;
};


export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("No image data received from API.");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const analyzeUploadedImage = async (imageFile: File, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imageBase64 = await blobToBase64(imageFile);

    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
            data: imageBase64,
        },
    };
    
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [imagePart, textPart] },
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
        }
    });
    
    return response.text;
};

export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imageBase64 = await blobToBase64(imageFile);

    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
            data: imageBase64,
        },
    };

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePartResponse?.inlineData) {
        const base64ImageBytes: string = imagePartResponse.inlineData.data;
        const mimeType = imagePartResponse.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No edited image data received from API.");
};