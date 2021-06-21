import RouterService from './router-service';
import Router from './index';
import EmberXComponent, { renderComponent, service } from '@emberx/component';
// import { on, action } from '@glimmer/modifier';

interface FreeObject {
  [propName: string]: any;
}

// NOTE: what is router-recognizer handler is exactly? model hook? one object with beforeModel, model?
export default class Route<Args extends FreeObject = {}> extends EmberXComponent<Args> {
  @service router: RouterService;

  static includes = {};
  static template = `
    <div id="intro">
      <h1 data-test-route-title>Route: {{this.routeName}}. This route is missing a template!</h1>
    </div>
  `;

  static async setup(model: object, transition: FreeObject): Promise<any> {
    if (Router.LOG_MODELS) {
      console.log(`'${transition.targetName}' Route[model] is`, model);
      console.log(`'${transition.targetName}' Route[transition] is`, transition);
    }

    // TODO: add a throw here if containerElement doesnt exist

    // @ts-ignore
    const containerElement: HTMLElement = globalThis.QUnit
      ? document.getElementById('ember-testing')
      : document.getElementById('app');

    containerElement.innerHTML = ''; // TODO: temporary solution, clear previously rendered route

    if (transition.routeInfos[transition.routeInfos.length - 1]._route === this) {
      await renderComponent(this, {
        element: containerElement as HTMLElement, // containerElement,
        args: { model: model || {} },
        owner: { services: Router.SERVICES },
      });
    }
  }

  // constructor(owner, args) {
  //   return super(owner, args);
  // }

  get model(): any {
    return this.args.model;
  }

  get routeName(): string {
    const routeNames = this.router.recognizer.recognize(document.location.pathname); // TODO: probably change this

    // @ts-ignore
    return routeNames ? (routeNames[routeNames.length - 1].handler as string) : 'not-found';
  }
}
