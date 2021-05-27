// import Router from '@emberx/router';
import Component, { renderComponent } from '@emberx/component';
import { on, action } from '@glimmer/modifier';
// import { service } from '@emberx/service';

interface FreeObject {
  [propName: string]: any;
}

export default class Route extends Component<{ model: object }> {
  // @service router;

  static scope: {};

  get model(): any {
    return this.args.model;
  }

  get routeName(): string {
    const routeNames = this.router.recognizer.recognize(document.location.pathname);

    return routeNames ? routeNames[routeNames.length - 1].handler : 'not-found';
  }

  // constructor(owner, args) {
  //   return super(owner, args);
  // }

  static setup(model: object, transition: FreeObject): any {
    // if (Router.LOG_MODELS) {
    //   console.log(`'${transition.targetName}' Route[model] is`, model);
    //   console.log(`'${transition.targetName}' Route[transition] is`, transition);
    // }

    // TODO: add a throw here if containerElement doesnt exist

    const containerElement = globalThis.QUnit
      ? document.getElementById('ember-testing')
      : document.getElementById('app');

    containerElement.innerHTML = ''; // TODO: temporary solution, clear previously rendered route

    renderComponent(this, {
      element: containerElement,
      args: { model: model || {} },
      // services: Router.SERVICES,
    });
  }

  static template = `
    <div id="intro">
      <h1>{{this.routeName}} ROUTE IS MISSING A TEMPLATE!</h1>
    </div>
  `;

  @action transitionTo(routeName: string, params: object, options: object): object {
    // return this.router.transitionTo(routeName, params, options);
  }
}