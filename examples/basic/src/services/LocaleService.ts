import { tracked } from '@glimmer/tracking';

export default class LocaleService {
  @tracked _currentLocale: string;

  constructor(currentLocale: string) {
    this._currentLocale = currentLocale;
  }

  get currentLocale(): string {
    return this._currentLocale;
  }

  setLocale(locale) {
    this._currentLocale = locale;
  }
}
