import { usePreferences } from '../contexts/PreferencesContext';
import { getTranslation } from './i18n';

export function useTranslation() {
    const { preferences } = usePreferences();
    
    return {
        t: (text: string) => getTranslation(preferences?.language || 'en-US', text)
    };
}
