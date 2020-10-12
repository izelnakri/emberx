import { tracked } from '@glimmerx/component';

export default class Locale {
  @tracked currentLocale = 'en';

  locales = {
    en: {
      'button.save': 'Save model',
      'button.delete': 'Delete model',
      'profile.about.description': 'This is description',
    },
    es: {
      'button.save': 'Guardar modelo',
      'button.delete': 'Eliminar modelo',
      'profile.about.description': 'Esta es un description',
    },
  };

  t(key) {
    return this.locales[this.currentLocale][key];
  }
}
