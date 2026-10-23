import Component, { action, hbs, service } from '@emberx/component';
import { underscore, camelize } from '@emberx/string';

interface FreeObject {
  [propName: string]: any;
}

/**
 * The shape route-recognizer stores under `recognizer.names[routeName].handlers`.
 * Only the two fields <LinkTo /> reads are described here; everything else on it
 * is router_js/route-recognizer internal bookkeeping.
 */
interface RecognizerHandler {
  names: string[];
  shouldDecodes: boolean[];
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

  static template: string = hbs`
    <a
      href="{{this.link}}"
      aria-current={{if this.isActive "page"}}
      aria-disabled={{if @disabled "true"}}
      {{on "click" this.transition}}
      class="emberx-link {{this.class}}"
      ...attributes
    >
      {{yield}}
    </a>
  `;

  get tagName(): string {
    return this.args.tagName || 'a';
  }

  get preventDefault(): boolean | undefined {
    return 'preventDefault' in this.args ? this.args.preventDefault : false;
  }

  constructor(owner: any, args: any) {
    super(owner, args);

    if (!args.route) {
      throw new Error('<LinkTo /> component missing @route argument');
    } else if ('model' in this.args && 'models' in this.args) {
      throw new Error('You cannot provide both the `@model` and `@models` arguments to the <LinkTo> component.');
    }
  }

  get link(): string {
    const link = this.router.recognizer.generate(this.args.route, this.models);
    const linkWithParams = new URLSearchParams('');

    const allParams = Object.assign({}, null, this.args.query); // TODO: this needs to only apply to targeted routes
    Object.keys(allParams as object).forEach((key) => {
      // @ts-ignore
      linkWithParams.set(key, allParams[key]);
    });

    const queryParams = linkWithParams.toString();
    return queryParams === '' ? link : `${link}?${queryParams}`;
  }

  get isLoading(): boolean {
    if (!this.isActive) {
      return false;
    }

    return (
      isMissing(this.args.route) ||
      this.isTransitioningIn ||
      Object.keys(this.models)
        .map((key) => this.models[key])
        .some((model) => isMissing(model))
    );
  }

  get isActive(): boolean {
    return this.router.currentURL === this.link;
  }

  /** The link leads where the transition under way is going. */
  get isTransitioningIn(): boolean {
    return this.router.isTransitioning && this.isActive && this.router.transitionFromURL !== this.link;
  }

  /** The link leads where the transition under way is leaving. */
  get isTransitioningOut(): boolean {
    return this.router.isTransitioning && !this.isActive && this.router.transitionFromURL === this.link;
  }

  get models(): FreeObject {
    // NOTE: maybe optimize rendering if there is no dynamic segments?
    // @ts-ignore
    const dynamicSegments = this.router.recognizer.names[this.args.route].handlers.reduce(
      (result: string[][], handlerFunc: RecognizerHandler) => {
        if (handlerFunc.shouldDecodes.length > 0) {
          result.push(handlerFunc.names);
        }

        return result;
      },
      [],
    );

    if (this.args.models) {
      // @ts-ignore
      return dynamicSegments.reduce((model, segment, index) => {
        // @ts-ignore
        return Object.assign(model, { [segment]: this.args.models[index] });
      }, {});
    } else if (isObject(this.args.model)) {
      // @ts-ignore
      return dynamicSegments.reduce((model, segment) => {
        const actualSegmentInModel = [segment[0], underscore(segment[0]), camelize(segment[0]), 'id'].find(
          (potentialKey) => {
            // @ts-ignore
            return potentialKey in this.args.model;
          },
        );

        // @ts-ignore
        return Object.assign(model, { [segment]: this.args.model[actualSegmentInModel] });
      }, {});
    } else if (this.args.model) {
      return { [dynamicSegments[0]]: this.args.model };
    } // TODO: or use the existing model params from the existing router

    return {};
  }

  get class(): string {
    return [
      this.args.disabled ? 'disabled' : null,
      this.isActive ? 'active' : null,
      this.isLoading ? 'loading' : null,
      this.isTransitioningIn ? 'ember-transitioning-in' : null,
      this.isTransitioningOut ? 'ember-transitioning-out' : null,
    ].join(' ');
  }

  /** Follows the link, unless the click is the browser's to follow: the transition, or nothing. */
  @action transition(event: MouseEvent): Promise<unknown> | undefined {
    // The link itself, not the element inside it that was clicked. A click
    // meant for a new tab or window, or a link opening in another target, is
    // the browser's to follow.
    const link = event.currentTarget as HTMLAnchorElement;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (link.target !== '' && link.target !== '_self')
    ) {
      return;
    }
    event.preventDefault();

    if (this.args.disabled) {
      return;
    } else if (this.isLoading) {
      throw new Error(
        'This link is in an inactive loading state because at least one of its models currently has a null/undefined value, or the provided route name is invalid.',
      );
    }

    if (!this.preventDefault) {
      if (this.args.replace) {
        const promise = this.router.transitionTo(this.link, { queryParams: this.args.query }, true).method('replace');
        return promise;
      }

      const promise = this.router.transitionTo(this.link, { queryParams: this.args.query }, true);
      return promise;
    }
  }
}

function isObject(value: any) {
  return ['function', 'object'].includes(typeof value) && value !== null && !Array.isArray(value);
}

function isMissing<T>(value: T): boolean {
  return value === null || value === undefined;
}
