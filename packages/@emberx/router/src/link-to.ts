import Component, { hbs, service } from '@emberx/component';
import { action } from '@glimmer/modifier';
import { underscore, camelize } from '@emberx/string';

interface FreeObject {
  [propName: string]: any;
}

function isMissing<T>(value: T): boolean {
  return value === null || value === undefined;
}

export default class extends Component<{
  models?: any[];
  model?: FreeObject;
  tagName?: string;
  query?: FreeObject;
  preventDefault?: boolean;
  disabled?: boolean;
  replace?: boolean;
  route: string;
}> {
  @service router: any;

  get tagName() {
    return this.args.tagName || 'a';
  }

  get preventDefault() {
    return 'preventDefault' in this.args ? this.args.preventDefault : false;
  }

  constructor(owner: any, args: any) {
    // @ts-ignore
    super(owner, args);

    if (!args.route) {
      throw new Error('<LinkTo /> component missing @route argument');
    } else if ('model' in this.args && 'models' in this.args) {
      throw new Error(
        'You cannot provide both the `@model` and `@models` arguments to the <LinkTo> component.'
      );
    }
  }

  get link() {
    let link = this.router.recognizer.generate(this.args.route, this.models);

    if (!this.args.query) {
      return link;
    }

    let linkWithParams = new URLSearchParams('');

    Object.keys(this.args.query as object).forEach((key) => {
      // @ts-ignore
      linkWithParams.set(key, this.args.query[key]);
    });

    return `${link}?${linkWithParams.toString()}`;
  }

  get isLoading() {
    return (
      this.isActive &&
      (isMissing(this.args.route) ||
        Object.keys(this.models)
          .map((key) => this.models[key])
          .some((model) => isMissing(model)))
    );
  }

  get isActive() {
    return this.router.currentURL === this.link;
  }

  get willBeActive() {
    // NOTE: router needs a tracked property to be able to track it most likely
    if (this.router.activeTransition) {
      // console.log(this.router.activeTransition);
      // console.log('a', this.router.activeTransition.targetName);
      // console.log('b', this.args.route);
      return this.router.activeTransition.targetName.startsWith(this.args.route); // TODO: should also include params and queryParams
    }

    return false;
  }

  get models() {
    // NOTE: maybe optimize rendering if there is no dynamic segments?
    // @ts-ignore
    let dynamicSegments = this.router.recognizer.names[this.args.route].handlers.reduce((result, handlerFunc) => {
      if (handlerFunc.shouldDecodes.length > 0) {
        result.push(handlerFunc.names);
      }

      return result;
    }, []);

    if (this.args.models) {
      // @ts-ignore
      return dynamicSegments.reduce((model, segment, index) => {
        // @ts-ignore
        return Object.assign(model, { [segment]: this.args.models[index] });
      }, {});
    } else if (isObject(this.args.model)) {
      // @ts-ignore
      return dynamicSegments.reduce((model, segment) => {
        let actualSegmentInModel = [segment[0], underscore(segment[0]), camelize(segment[0]), 'id'].find(
          (potentialKey) => {
            // @ts-ignore
            return potentialKey in this.args.model;
          }
        );

        // @ts-ignore
        return Object.assign(model, { [segment]: this.args.model[actualSegmentInModel] });
      }, {});
    } else if (this.args.model) {
      return { [dynamicSegments[0]]: this.args.model };
    } // TODO: or use the existing model params from the existing router

    return {};
  }

  static template = hbs`
    <a href="{{this.link}}" {{on "click" this.transition}}
      class="{{if @disabled 'disabled'}} {{if this.isActive 'active'}} {{if this.isLoading 'loading'}} {{if (and this.willBeActive (not this.isActive)) 'ember-transitioning-in'}} {{if (and this.isActive (not this.willBeActive)) 'ember-transitioning-out'}}"
      ...attributes>
      {{yield}}
    </a>
  `;

  @action transition(event: any) {
    // @ts-ignore
    let element = event.target;
    if (element.target === '' || element.target === '_self') {
      event.preventDefault();
    } else {
      return;
    }

    if (this.args.disabled) {
      return;
    } else if (this.isLoading) {
      throw new Error(
        'This link is in an inactive loading state because at least one of its models currently has a null/undefined value, or the provided route name is invalid.'
      );
    }

    if (!this.preventDefault) {
      if (this.args.replace) {
        let promise = this.router
          .transitionTo(this.link, { queryParams: this.args.query }, true)
          .method('replace');
        this.willBeActive;
        // console.log(this.willBeActive);
        return promise;
      }

      let promise = this.router.transitionTo(this.link, { queryParams: this.args.query }, true);
      this.willBeActive;
      // console.log(this.willBeActive);
      return promise;
    }
  }
}

function isObject(value: any) {
  return ['function', 'object'].includes(typeof value) && value !== null && !Array.isArray(value);
}
