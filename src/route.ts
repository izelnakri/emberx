import Router from './router';
import { renderComponent } from '@glimmerx/core';
import Component, { hbs } from '@glimmerx/component';
import { action } from '@glimmerx/modifier';
import { service } from '@glimmerx/service';

interface FreeObject {
  [propName: string]: any;
}

export default class Route extends Component<{ model: object }> {
  @service router;

  get model(): any {
    return this.args.model;
  }

  get routeName(): string {
    const routeNames = this.router.recognizer.recognize(document.location.pathname);

    return routeNames ? routeNames[routeNames.length - 1].handler : 'not-found';
  }

  constructor(owner, args) {
    return super(owner, args);
  }

  static setup(model: object, transition: FreeObject): any {
    if (Router.LOG_MODELS) {
      console.log(`'${transition.targetName}' Route[model] is`, model);
      console.log(`'${transition.targetName}' Route[model] is`, transition);
    }

    const containerElement = globalThis.QUnit
      ? document.getElementById('ember-testing')
      : document.getElementById('app');

    containerElement.innerHTML = ''; // TODO: temporary solution, clear previously rendered route

    renderComponent(this, {
      element: containerElement,
      args: { model: model || {} },
      services: Router.SERVICES,
    });
  }

  static template = hbs`
    <div id="intro">
      <h1>{{this.routeName}} ROUTE IS MISSING A TEMPLATE!</h1>
    </div>
  `;

  @action transitionTo(routeName: string, params: object, options: object): object {
    return this.router.transitionTo(routeName, params, options);
  }
}
