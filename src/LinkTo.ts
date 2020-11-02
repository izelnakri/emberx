import Component, { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { on, action } from '@glimmerx/modifier';

interface FreeObject {
  [propName: string]: any;
}

// <LinkTo @route='photoGallery' @model={{this.aPhoto}}>
// <LinkTo @route='photoGallery.comment' @models={{array this.aPhoto this.comment}}>

// By default the `<LinkTo>` component prevents the default browser action by calling
// `preventDefault()` to avoid reloading the browser page.

// If you need to trigger a full browser reload pass `@preventDefault={{false}}`:
// <LinkTo @route='photoGallery' @model={{this.aPhotoId}} @preventDefault={{false}}>

// <LinkTo @route='photoGallery' @tagName='li'>
//   Great Hamster Photos
// </LinkTo>

// ```handlebars
// <LinkTo @route='photoGallery' @query={{hash page=1 per_page=20}}>
//   Great Hamster Photos
// </LinkTo>
// ```

// This will result in:

// ```html
// <a href="/hamster-photos?page=1&per_page=20">
//   Great Hamster Photos
// </a>
// ```

export default class extends Component<{
  models?: any[];
  model?: FreeObject;
  tagName?: string;
  query?: FreeObject;
  preventDefault?: boolean;
  replace?: boolean;
  route: string;
}> {
  @service router;

  get tagName() {
    return this.args.tagName || 'a';
  }

  //   try {
  //   return routing.generateURL(route, models, query);
  // } catch (e) {
  //   // tslint:disable-next-line:max-line-length
  //   assert(
  //     `You attempted to generate a link for the "${this.route}" route, but did not ` +
  //       `pass the models required for generating its dynamic segments. ` +
  //       e.message
  //   );
  // }

  // get models() {
  //   let { model, models } = this;

  //   assert(
  //     'You cannot provide both the `@model` and `@models` arguments to the <LinkTo> component.',
  //     model === UNDEFINED || models === UNDEFINED
  //   );

  //   if (model !== UNDEFINED) {
  //     return [model];
  //   } else if (models !== UNDEFINED) {
  //     assert('The `@models` argument must be an array.', Array.isArray(models));
  //     return models;
  //   } else {
  //     return [];
  //   }
  // }

  constructor(owner, args) {
    super(owner, args);

    if (!args.route) {
      throw new Error('<LinkTo /> component missing @route argument');
    }
  }

  // TODO: model, models, query
  get link() {
    // NOTE: also think about: this.router.recognizer.generate('admin.posts.post', { slug: 'anan' })

    if (modelIsObject(this.args.model)) {
      const dynamicSegments = this.router.recognizer.names[this.args.route].handlers.reduce(
        (result, handlerFunc) => {
          if (handlerFunc.shouldDecodes) {
            result.push(this.args.model[handlerFunc.names]); // TODO: maybe @ember/string manipulate in future
          }

          return result;
        },
        []
      );
      debugger;
      // NOTE: check the route dynamic
      return this.router.recognizer.generate(this.args.route, this.args.model); // TODO: append queryParams
    }

    return this.router.recognizer.generate(this.args.route, this.args.model); // TODO: append queryParams
  }

  // TODO: add activeClass, loadingClass, disabledClass, 'ember-transitioning-in', 'ember-transitioning-out'
  static template = hbs`
    <a href="{{this.link}}" {{on "click" this.transition}} ...attributes>{{yield}}</a>
  `;

  @action transition(event) {
    event.preventDefault();

    this.router.transitionTo(this.link);
  }
}

function modelIsObject(value) {
  return ['function', 'object'].includes(typeof value) && value !== null && !Array.isArray(value);
}
