import { getLanguage, requireApiVersion } from 'obsidian';
import en from 'src/localization/locales/en';
import ru from 'src/localization/locales/ru';

type LocaleObj = Record<string, string>

const locales: Record<string, LocaleObj> = {
  en,
  ru
};

export class LocalizationService {
  private currentLocale: string = 'en';

  setLocale() {
    let locale: string | undefined

    if (requireApiVersion("1.8.7")) {
      locale = getLanguage();
    } else {
      locale = window.localStorage.language;
    }

    if (locale && locales[locale]) this.currentLocale = locale;
  }

  t(key: string): string {
    let localeObj = locales[this.currentLocale] || locales['en']
    const translation = localeObj![key] || key;
    return translation;
  }
}

export const i18n = new LocalizationService();