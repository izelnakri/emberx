import { isSimpleClick } from '../-internals/views/lib/system/utils.js';
import { getEngineParent } from '../engine/lib/engine-parent.js';
import { flaggedInstrument } from '../instrumentation/index.js';
import { action } from '../object/index.js';
import { service } from '../service/index.js';
import { c as consumeTag, e as createCache, g as getValue, u as untrack } from '../../shared-chunks/cache-CofLhaS4.js';
import { t as tagFor } from '../../shared-chunks/meta-BJtIZDir.js';
import { on } from '../modifier/on.js';
import { t as templateFactory } from '../../shared-chunks/index-kwuZeaNz.js';
import { I as InternalComponent, o as opaquify } from '../../shared-chunks/internal-BQ7zHrqS.js';
import { d as decorateFieldV2, i as initializeDeferredDecorator, a as decorateMethodV2 } from '../../shared-chunks/runtime-CYyqkz5q-BOdRhmsS.js';

const LinkToTemplate = templateFactory(
/*
  <a
  {{!-- for compatibility --}}
  id={{this.id}}
  class={{this.class}}

  {{!-- deprecated attribute bindings --}}
  role={{this.role}}
  title={{this.title}}
  rel={{this.rel}}
  tabindex={{this.tabindex}}
  target={{this.target}}

  ...attributes

  href={{this.href}}

  {{on 'click' this.click}}
>{{yield}}</a>
*/
{
  "id": null,
  "block": "[[[11,3],[16,1,[30,0,[\"id\"]]],[16,0,[30,0,[\"class\"]]],[16,\"role\",[30,0,[\"role\"]]],[16,\"title\",[30,0,[\"title\"]]],[16,\"rel\",[30,0,[\"rel\"]]],[16,\"tabindex\",[30,0,[\"tabindex\"]]],[16,\"target\",[30,0,[\"target\"]]],[17,1],[16,6,[30,0,[\"href\"]]],[4,[32,0],[\"click\",[30,0,[\"click\"]]],null],[12],[18,2,null],[13]],[\"&attrs\",\"&default\"],[\"yield\"]]",
  "moduleName": "packages/@ember/-internals/glimmer/lib/templates/link-to.hbs",
  "scope": () => ({
    on
  }),
  "isStrictMode": true
});

const EMPTY_ARRAY = [];
const EMPTY_QUERY_PARAMS = {};
function isMissing(value) {
  return value === null || value === undefined;
}
function isPresent(value) {
  return !isMissing(value);
}
function isQueryParams(value) {
  return typeof value === 'object' && value !== null && value['isQueryParams'] === true;
}

/**
 @module @ember/routing
 */

/**
  The `LinkTo` component renders a link to the supplied `routeName` passing an optionally
  supplied model to the route as its `model` context of the route. The block for `LinkTo`
  becomes the contents of the rendered element:

  ```gjs
  import { LinkTo } from '@ember/routing';
    
  <template>
    <LinkTo @route='photoGallery'>
      Great Hamster Photos
    </LinkTo>
  </template>
  ```

  This will result in:

  ```html
  <a href="/hamster-photos">
    Great Hamster Photos
  </a>
  ```

  ### Disabling the `LinkTo` component

  The `LinkTo` component can be disabled by using the `disabled` argument. A disabled link
  doesn't result in a transition when activated, and adds the `disabled` class to the `<a>`
  element.

  (The class name to apply to the element can be overridden by using the `disabledClass`
  argument)

  ```handlebars
  <LinkTo @route='photoGallery' @disabled={{true}}>
    Great Hamster Photos
  </LinkTo>
  ```

  ### Handling `href`

  `<LinkTo>` will use your application's Router to fill the element's `href` property with a URL
  that matches the path to the supplied `routeName`.

  ### Handling current route

  The `LinkTo` component will apply a CSS class name of 'active' when the application's current
  route matches the supplied routeName. For example, if the application's current route is
  'photoGallery.recent', then the following invocation of `LinkTo`:

  ```handlebars
  <LinkTo @route='photoGallery.recent'>
    Great Hamster Photos
  </LinkTo>
  ```

  will result in

  ```html
  <a href="/hamster-photos/this-week" class="active">
    Great Hamster Photos
  </a>
  ```

  The CSS class used for active classes can be customized by passing an `activeClass` argument:

  ```handlebars
  <LinkTo @route='photoGallery.recent' @activeClass="current-url">
    Great Hamster Photos
  </LinkTo>
  ```

  ```html
  <a href="/hamster-photos/this-week" class="current-url">
    Great Hamster Photos
  </a>
  ```

  ### Keeping a link active for other routes

  If you need a link to be 'active' even when it doesn't match the current route, you can use the
  `current-when` argument.

  ```handlebars
  <LinkTo @route='photoGallery' @current-when='photos'>
    Photo Gallery
  </LinkTo>
  ```

  This may be helpful for keeping links active for:

  * non-nested routes that are logically related
  * some secondary menu approaches
  * 'top navigation' with 'sub navigation' scenarios

  A link will be active if `current-when` is `true` or the current
  route is the route this link would transition to.

  To match multiple routes 'space-separate' the routes:

  ```handlebars
  <LinkTo @route='gallery' @current-when='photos drawings paintings'>
    Art Gallery
  </LinkTo>
  ```

  ### Supplying a model

  An optional `model` argument can be used for routes whose
  paths contain dynamic segments. This argument will become
  the model context of the linked route:

  ```javascript
  Router.map(function() {
    this.route("photoGallery", {path: "hamster-photos/:photo_id"});
  });
  ```

  ```handlebars
  <LinkTo @route='photoGallery' @model={{this.aPhoto}}>
    {{aPhoto.title}}
  </LinkTo>
  ```

  ```html
  <a href="/hamster-photos/42">
    Tomster
  </a>
  ```

  ### Supplying multiple models

  For deep-linking to route paths that contain multiple
  dynamic segments, the `models` argument can be used.

  As the router transitions through the route path, each
  supplied model argument will become the context for the
  route with the dynamic segments:

  ```javascript
  Router.map(function() {
    this.route("photoGallery", { path: "hamster-photos/:photo_id" }, function() {
      this.route("comment", {path: "comments/:comment_id"});
    });
  });
  ```

  This argument will become the model context of the linked route:

  ```handlebars
  <LinkTo @route='photoGallery.comment' @models={{array this.aPhoto this.comment}}>
    {{comment.body}}
  </LinkTo>
  ```

  ```html
  <a href="/hamster-photos/42/comments/718">
    A+++ would snuggle again.
  </a>
  ```

  ### Supplying an explicit dynamic segment value

  If you don't have a model object available to pass to `LinkTo`,
  an optional string or integer argument can be passed for routes whose
  paths contain dynamic segments. This argument will become the value
  of the dynamic segment:

  ```javascript
  Router.map(function() {
    this.route("photoGallery", { path: "hamster-photos/:photo_id" });
  });
  ```

  ```handlebars
  <LinkTo @route='photoGallery' @model={{aPhotoId}}>
    {{this.aPhoto.title}}
  </LinkTo>
  ```

  ```html
  <a href="/hamster-photos/42">
    Tomster
  </a>
  ```

  When transitioning into the linked route, the `model` hook will
  be triggered with parameters including this passed identifier.

  ### Supplying query parameters

  If you need to add optional key-value pairs that appear to the right of the ? in a URL,
  you can use the `query` argument.

  ```handlebars
  <LinkTo @route='photoGallery' @query={{hash page=1 per_page=20}}>
    Great Hamster Photos
  </LinkTo>
  ```

  This will result in:

  ```html
  <a href="/hamster-photos?page=1&per_page=20">
    Great Hamster Photos
  </a>
  ```

  @for @ember/routing
  @method LinkTo
  @static
  @public
*/

class _LinkTo extends InternalComponent {
  static toString() {
    return 'LinkTo';
  }
  static {
    decorateFieldV2(this.prototype, "routing", [service('-routing')]);
  }
  #routing = (initializeDeferredDecorator(this, "routing"), void 0);
  validateArguments() {
    super.validateArguments();
  }
  get class() {
    let classes = 'ember-view';
    if (this.isActive) {
      classes += this.classFor('active');
      if (this.willBeActive === false) {
        classes += ' ember-transitioning-out';
      }
    } else if (this.willBeActive) {
      classes += ' ember-transitioning-in';
    }
    if (this.isLoading) {
      classes += this.classFor('loading');
    }
    if (this.isDisabled) {
      classes += this.classFor('disabled');
    }
    return classes;
  }
  get href() {
    if (this.isLoading) {
      return '#';
    }
    let {
      routing,
      route,
      models,
      query
    } = this;
    // TODO: can we narrow this down to QP changes only?
    consumeTag(tagFor(routing, 'currentState'));
    {
      return routing.generateURL(route, models, query);
    }
  }
  click(event) {
    if (!isSimpleClick(event)) {
      return;
    }
    let element = event.currentTarget;
    let target = element instanceof SVGAElement ? element.target.baseVal : element.target;
    let isSelf = target === '' || target === '_self';
    if (isSelf) {
      this.preventDefault(event);
    } else {
      return;
    }
    if (this.isDisabled) {
      return;
    }
    if (this.isLoading) {
      return;
    }
    let {
      routing,
      route,
      models,
      query,
      replace
    } = this;
    let payload = {
      transition: undefined
    };
    flaggedInstrument('interaction.link-to', payload, () => {
      payload.transition = routing.transitionTo(route, models, query, replace);
    });
  }
  static {
    decorateMethodV2(this.prototype, "click", [action]);
  }
  get route() {
    if ('route' in this.args.named) {
      let route = this.named('route');
      return route && this.namespaceRoute(route);
    } else {
      return this.currentRoute;
    }
  }

  // GH #17963
  currentRouteCache = createCache(() => {
    consumeTag(tagFor(this.routing, 'currentState'));
    return untrack(() => this.routing.currentRouteName);
  });
  get currentRoute() {
    return getValue(this.currentRouteCache);
  }

  // TODO: not sure why generateURL takes {}[] instead of unknown[]
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  get models() {
    if ('models' in this.args.named) {
      let models = this.named('models');
      return models;
    } else if ('model' in this.args.named) {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      return [this.named('model')];
    } else {
      return EMPTY_ARRAY;
    }
  }
  get query() {
    if ('query' in this.args.named) {
      let query = this.named('query');
      if (query === null || query === undefined) {
        return EMPTY_QUERY_PARAMS;
      }
      return {
        ...query
      };
    } else {
      return EMPTY_QUERY_PARAMS;
    }
  }
  get replace() {
    return this.named('replace') === true;
  }
  get isActive() {
    return this.isActiveForState(this.routing.currentState);
  }
  get willBeActive() {
    let current = this.routing.currentState;
    let target = this.routing.targetState;
    if (current === target) {
      return null;
    } else {
      return this.isActiveForState(target);
    }
  }
  get isLoading() {
    return isMissing(this.route) || this.models.some(model => isMissing(model));
  }
  get isDisabled() {
    return Boolean(this.named('disabled'));
  }
  get isEngine() {
    let owner = this.owner;
    return getEngineParent(owner) !== undefined;
  }
  get engineMountPoint() {
    let owner = this.owner;
    return owner.mountPoint;
  }
  classFor(state) {
    let className = this.named(`${state}Class`);
    if (className === true || isMissing(className)) {
      return ` ${state}`;
    } else if (className) {
      return ` ${className}`;
    } else {
      return '';
    }
  }
  namespaceRoute(route) {
    let {
      engineMountPoint
    } = this;
    if (engineMountPoint === undefined) {
      return route;
    } else if (route === 'application') {
      return engineMountPoint;
    } else {
      return `${engineMountPoint}.${route}`;
    }
  }
  isActiveForState(state) {
    if (!isPresent(state)) {
      return false;
    }
    if (this.isLoading) {
      return false;
    }
    let currentWhen = this.named('current-when');
    if (typeof currentWhen === 'boolean') {
      return currentWhen;
    } else if (typeof currentWhen === 'string') {
      let {
        routing
      } = this;
      return currentWhen.split(' ').some(route => routing.isActiveForRoute([], undefined, this.namespaceRoute(route), state));
    } else {
      let {
        route,
        models,
        query,
        routing
      } = this;
      return routing.isActiveForRoute(models, query, route, state);
    }
  }
  preventDefault(event) {
    event.preventDefault();
  }
  isSupportedArgument(name) {
    let supportedArguments = ['route', 'model', 'models', 'query', 'replace', 'disabled', 'current-when', 'activeClass', 'loadingClass', 'disabledClass'];
    return supportedArguments.indexOf(name) !== -1 || super.isSupportedArgument(name);
  }
}
let {
  prototype
} = _LinkTo;
let descriptorFor = (target, property) => {
  if (target) {
    return Object.getOwnPropertyDescriptor(target, property) || descriptorFor(Object.getPrototypeOf(target), property);
  } else {
    return null;
  }
};

// @href
{
  let superOnUnsupportedArgument = prototype['onUnsupportedArgument'];
  Object.defineProperty(prototype, 'onUnsupportedArgument', {
    configurable: true,
    enumerable: false,
    value: function onUnsupportedArgument(name) {
      if (name === 'href') ; else {
        superOnUnsupportedArgument.call(this, name);
      }
    }
  });
}

// QP
{
  let superModelsDescriptor = descriptorFor(prototype, 'models');
  let superModelsGetter = superModelsDescriptor.get;
  Object.defineProperty(prototype, 'models', {
    configurable: true,
    enumerable: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    get: function models() {
      let models = superModelsGetter.call(this);
      if (models.length > 0 && !('query' in this.args.named)) {
        if (isQueryParams(models[models.length - 1])) {
          models = models.slice(0, -1);
        }
      }
      return models;
    }
  });
  let superQueryDescriptor = descriptorFor(prototype, 'query');
  let superQueryGetter = superQueryDescriptor.get;
  Object.defineProperty(prototype, 'query', {
    configurable: true,
    enumerable: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    get: function query() {
      if ('query' in this.args.named) {
        let qp = superQueryGetter.call(this);
        if (isQueryParams(qp)) {
          return qp.values ?? EMPTY_QUERY_PARAMS;
        } else {
          return qp;
        }
      } else {
        let models = superModelsGetter.call(this);
        if (models.length > 0) {
          let qp = models[models.length - 1];
          if (isQueryParams(qp) && qp.values !== null) {
            return qp.values;
          }
        }
        return EMPTY_QUERY_PARAMS;
      }
    }
  });
}

// Positional Arguments
{
  let superOnUnsupportedArgument = prototype['onUnsupportedArgument'];
  Object.defineProperty(prototype, 'onUnsupportedArgument', {
    configurable: true,
    enumerable: false,
    value: function onUnsupportedArgument(name) {
      if (name !== 'params') {
        superOnUnsupportedArgument.call(this, name);
      }
    }
  });
}
const LinkTo = opaquify(_LinkTo, LinkToTemplate);

export { LinkTo };
