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
    let locale = window.localStorage.language as string | undefined
    if (locale && locales[locale]) this.currentLocale = locale;
  }

  t(key: string): string {
    let localeObj = locales[this.currentLocale] || locales['en']
    const translation = localeObj![key] || key;
    return translation;
  }
}

export const i18n = new LocalizationService();