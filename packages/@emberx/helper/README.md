# @emberx/helper - Reactive UI functions for node.js and browser

EmberX helpers are UI functions that return data when its parameters or related services state changes:

```
// Helper definition:
import helper from '@emberx/helper';

const translate = helper(([key, intl], _hash, services) => {
  return services.intl.t(key);
});

export default translate;

// Helper usage:
import Component, { service, tracked } from '@emberx/component';

export default class UserDisplay extends Component {
  @service intl;

  user = {
    id: 1,
    firstName: 'Izel',
    lastName: 'Nakri'
  };

  static includes = {
    translate,
  };
  static template = `
    <div id="intro">
      <LinkTo @route="user.posts" @model="{{this.user.id}}">{{translate "user-page.posts-link" this.user.firstName}}</LinkTo>

      <h5>Current locale is: {{this.intl.currentLocale}}</h5>
      <button type="button" {{on "click" this.changeLocale}}>Change locale</button>

      <h5>Localized button example:</h5>
      <button type="button">{{translate "button.save"}}</button>
    </div>
  `;

  @action changeLocale(): void {
    this.intl.currentLocale = this.intl.currentLocale === 'en' ? 'es' : 'en';
  }
}

// Rendering:

renderComponent(UserDisplay, { element: document.getElementById('app') });
```
