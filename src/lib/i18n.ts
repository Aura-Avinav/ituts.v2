export const enUS: Record<string, string> = {}; // Baseline English

export const enGB: Record<string, string> = {
    "Personalize": "Personalise",
    "Customize your experience to fit your workflow.": "Customise your experience to fit your workflow.",
    "Accent Color": "Accent Colour",
    "Analyze": "Analyse",
    "Behavior": "Behaviour",
    "Favorite": "Favourite",
    "Favorites": "Favourites",
    "Optimize": "Optimise",
    "Organization": "Organisation",
    "Initialize": "Initialise",
    "Synchronize": "Synchronise",
    "Ask me to analyze your habits, suggest improvements, or just chat about your day!": "Ask me to analyse your habits, suggest improvements, or just chat about your day!"
};

export const enIN: Record<string, string> = { ...enGB };

export const dictionaries = {
    'en-US': enUS,
    'en-GB': enGB,
    'en-IN': enIN
};

export type LanguageKey = keyof typeof dictionaries;

export function getTranslation(lang: string, text: string): string {
    const dict = dictionaries[lang as LanguageKey];
    if (!dict) return text;
    return dict[text] || text;
}
