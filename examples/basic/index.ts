import { renderComponent } from '@emberx/component';
import MyComponent from './src/MyComponent.ts';
import LocaleService from './src/services/LocaleService.ts';

export interface Owner {
  services: {
    locale: LocaleService;
  };
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const element = document.getElementById('app');
    renderComponent(MyComponent, {
      element: element!,

      owner: {
        services: {
          locale: new LocaleService('en_US'),
        },
      },
    });
  },
  { once: true },
);
