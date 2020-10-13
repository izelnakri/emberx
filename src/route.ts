import Router from './router';
import { renderComponent } from '@glimmerx/core';
import Component, { hbs } from '@glimmerx/component';
import { action } from '@glimmerx/modifier';
import { service } from '@glimmerx/service';

export default class Route extends Component<{ model: object }> {
  @service router;

  get model() {
    return this.args.model;
  }

  // static model() {}

  static setup(model, transition) {
    if (Router.LOG_MODELS) {
      console.log('setup[model] is', model);
      console.log('setup[transition] is', transition);
    }

    const containerElement = document.getElementById('app');

    containerElement.innerHTML = ''; // NOTE: temporary solution, clear previously rendered route

    renderComponent(this, {
      element: containerElement,
      args: { model: model || {} },
      services: Router.SERVICES,
    });
  }

  static template = hbs`
    <div id="intro">
      <h1>ROUTE IS MISSING A TEMPLATE!</h1>
    </div>
  `;

  @action transitionTo(routeName, params, options) {
    this.router.transitionTo(routeName, params, options);
  }
}
