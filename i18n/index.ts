let translations: { [key: string]: { [key: string]: string } } = {};
let isLoaded = false;

export const loadTranslations = async () => {
    if (isLoaded) return;
    try {
        const [enResponse, esResponse] = await Promise.all([
            fetch('/i18n/en.json'),
            fetch('/i18n/es.json')
        ]);
        if (!enResponse.ok || !esResponse.ok) {
            throw new Error('Failed to load translation files');
        }
        const en = await enResponse.json();
        const es = await esResponse.json();
        translations = { en, es };
        isLoaded = true;
    } catch (error) {
        console.error("Could not load translations:", error);
        // Fallback to empty to prevent crashes
        translations = { en: {}, es: {} };
    }
};


export type Translator = (key: string, replacements?: { [key: string]: string }) => string;

export const getTranslator = (language: 'en' | 'es'): Translator => {
    return (key: string, replacements?: { [key: string]: string }): string => {
        let translation = translations[language]?.[key] || key;

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`\${${placeholder}}`, replacements[placeholder]);
            });
        }
        
        return translation;
    };
};