export const translations = {
    'en-US': {
        personalize: 'Personalize',
    },
    'en-GB': {
        personalize: 'Personalise',
    },
    'en-IN': {
        personalize: 'Personalise',
    }
};

export type LanguageKey = keyof typeof translations;

export function t(lang: LanguageKey | string, key: keyof typeof translations['en-US']): string {
    const defaultLang = 'en-US';
    const languageData = translations[lang as LanguageKey] || translations[defaultLang];
    return languageData[key] || translations[defaultLang][key] || key;
}
