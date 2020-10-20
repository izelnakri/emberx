import Route from '../../route'; // import Route from 'emberx/route';
import { hbs, tracked } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { action, on } from '@glimmerx/modifier';
import t from '../../helpers/t';

import LinkTo from '../../components/LinkTo'; // import LinkTo from 'emberx/link-to';
import Counter from '../../components/Counter';

export default class PublicIndexRoute extends Route {
  @service intl;

  @tracked dynamicObject;

  constructor(owner, args) {
    super(owner, args);

    window.setInterval(() => {
      this.dynamicObject = {
        dynamicDate: new Date().toString(),
      };
    }, 200);
  }

  static model(): object {
    console.log('index route model called');
    // this.flashMessages.danger('Invalid verification link');
    // return this.transitionTo('application');

    return {
      logo: 'https://emberjs.com/images/ember-logo.svg',
      name: 'Izel',
      dynamicObject: { dynamicDate: new Date() },
    };
  }

  static template = hbs`
    <div id="intro">
      <h1>This is INDEXROUTE</h1>
      <LinkTo @route="admin.posts.post" @model="232">Go to post 232</LinkTo>
      <h5>Current locale is: {{this.intl.currentLocale}}</h5>
      <button type="button" {{on "click" this.changeLocale}}>Change locale</button>
      <p>Localized button example</p>

      <button type="button">{{t "button.save" this.intl}}</button>

      <img src={{this.model.logo}}/>
      <h5>Logo is {{this.model.logo}}</h5>
    </div>

    {{this.dynamicObject.dynamicDate}}

    <Counter/>
  `;

  @action changeLocale(): void {
    this.intl.currentLocale = this.intl.currentLocale === 'en' ? 'es' : 'en';
  }
}
