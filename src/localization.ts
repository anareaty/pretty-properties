import { getLanguage } from 'obsidian';
import en from './locales/en';
import ru from './locales/ru';


const locales: Record<string, any> = {
  en,
  ru
};

export class LocalizationService {
  private currentLocale: string = 'en';

  setLocale() {
    let locale: string
		if (getLanguage) locale = getLanguage();
		else locale = window.localStorage.language;
    if (locales[locale]) this.currentLocale = locale;
  }

  t(key: string): string {
    const translation = locales[this.currentLocale][key] || locales['en'][key] || key;
    return translation;
  }
}

export const i18n = new LocalizationService();