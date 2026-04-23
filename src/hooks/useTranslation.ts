import { usePreferences } from '../contexts/PreferencesContext';
import { getTranslation } from '../lib/i18n';

export function useTranslation() {
    const { preferences } = usePreferences();
    
    return {
        t: (text: string) => getTranslation(preferences?.language || 'en-US', text)
    };
}
