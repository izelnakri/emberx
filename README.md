# EmberX: Explicitly resolvable & node.js friendly Ember.js

[Working example/E2E Test](http://emberx-router.surge.sh/tests/tests.html?testId=906afba6)

Experimental router for glimmer, will ship as `@emberx/router` & `@emberx/component` & `@emberx/helper` &
`@emberx/test-helpers` and `@emberx/string`.

This project allows you to import your routes, components and helpers in node.js. Thus removes need for any ember
specific build system. You can run your tests by using [QunitX](https://github.com/izelnakri/qunitx) and `@emberx/test-helpers`.

When stable, check examples folder for the documentation.

```
# will change:
npm install && parcel examples/blog/index.html
```

### API Design

What if `@ember/routing/router` & `@ember/routing/route` were a tiny and explicitly resolvable router you could import from npm.
Flexible and simple API below can be progressively backward-compatible and support current ember router definitions!

```ts
// in ./router.js

import Router from '@emberx/router';
import IndexRoute from './routes/index/route.ts';
import PostsRoute from './routes/posts/route.ts';
import PostsIndexRoute from './routes/posts/index/route.ts';
import PostsPostRoute from './routes/posts/post/route.ts';

Router.SERVICES = {
  intl: new LocaleService(),
};

let router = Router.start([
  {
    path: '/',
    route: IndexRoute
  },
  {
    path: '/posts',
    route: PostsRoute,
    indexRoute: PostsIndexRoute
  },
  {
    path: '/posts/:slug',
    route: PostsPostRoute
  },
  {
    path: '/posts/:blog_post_id/comments',
    route: PostsPostCommentsRoute
  },
]);

export default router;
```

This API also will allow custom resolvers that can resolve current ember routers(ie. routes in `Router.map(function() {})`) with a specific resolver definition(classic or MUD) in future:

#### Backward-compatible API suggestion:

```ts
import Router from '@emberx/router';
import SomeCustomResolver from './custom-resolver';

Router.resolver = SomeCustomResolver;

let existingMapDefinition = Router.map(function () {
  this.route("public", { path: "/" }, function () {
    this.route("index", { path: "/" });
    this.route("blog-post", { path: "/:slug" });
  });

  this.route("admin", function () {
    this.route("index", { path: "/" });
  });

  this.route("settings");
  this.route("login");
});

let router = Router.start([
  {
    path: '/',
    route: IndexRoute
  },
  {
    path: '/posts',
    route: PostsRoute,
    indexRoute: PostsIndexRoute,
  }
], existingMapDefinition);

export default router;
```

This experiment is also a sketch/request for a new ember edition.

#### Familiar @emberx/route:

```ts
import { Route, LinkTo, hbs, tracked, service, action, on } from '@emberx/router';

import t from '../helpers/t';
import Counter from '../components/Counter';

export default class IndexRoute extends Route {
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

  static includes = {
    Counter
  };

  static model(): object {
    return {
      logo: 'https://emberjs.com/images/ember-logo.svg',
      dynamicObject: { dynamicDate: new Date() },
    };
  }

  static template = hbs`
    <div id="intro">
      <h1>This is some route</h1>

      <LinkTo @route="posts.post" @model="232">Go to post 232</LinkTo>

      <h5>Current locale is: {{this.intl.currentLocale}}</h5>
      <button type="button" {{on "click" this.changeLocale}}>Change locale</button>

      <p>Localized button example:</p>
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
```

#### Familiar @emberx/component:

```ts
import Component, { service, tracked, action, renderComponent } from '@emberx/component';

class LocaleService {
  @tracked currentLocale: string;

  constructor(currentLocale: string) {
    this.currentLocale = currentLocale;
  }

  get currentLocale(): string {
    return this.currentLocale;
  }

  @action
  setLocale(locale) {
    this.currentLocale = locale;
  }
}

class AnotherComponent extends Component {
  @service locale;

  message = 'hello world';
  @tracked count = 55;

  static template = hbs`
    <div id="another-component">
      <p id="message">Current message: {{this.message}}</p>
      <p id="locale-info">Component gets rendered. Current locale is {{this.locale.currentLocale}}</p>
      <span>Count is {{this.count}}</span>
      <p id="received-arg">Received argument is {{@notice}}</p>
      <button {{on "click" this.increment}} id="increment-button">Increment</button>
      <button {{on "click" this.changeMessage}} id="another-message-button">Change message</button>
      <button {{on "click" (fn this.locale.setLocale "tr")}} id="change-locale-button">Change locale</button>
    </div>
  `;

  @action
  increment(): void {
    this.count++;
  }

  @action
  changeMessage(): void {
    this.message = 'message changed';
  }
}

class MainComponent extends Component {
  @service locale;
  @tracked mainMessage = 'hello world';

  get formattedMessage() {
    return this.mainMessage.toUpperCase();
  }

  // This is how you can do template imports
  static includes = {
    AnotherComponent,
  };
  static template = hbs`
    <p id="main-component-message">{{this.mainMessage}}</p>
    <p id="main-component-formatted-message">{{this.formattedMessage}}</p>
    <div id="another">
      <AnotherComponent @notice={{this.mainMessage}} />
    </div>
    <button {{on "click" this.changeMessage}} id="message-button">Change main message</button>
  `;

  @action
  changeMessage(): void {
    this.mainMessage = 'message changed';
  }
}

await renderComponent(MainComponent, {
  element: document.getElementById('ember-testing'),
  owner: { services: { locale: new LocaleService('en') } },
});

```

Template/Component imports are respecting typescript standards, thus can be easily run node.js with npm, allowing
simple server side rendering.

This also allows the ability to distribute every component, route, helper, module as an npm package without a need for a build/addon system.
Parent components can use `static includes` to include the components they depend on.

This experiment is also a sketch/request for a new ember edition.
Deprecates ember controllers and makes ember-specific CLI systems an option rather than requirement.
Allows "npm your way to ember", from a React alternative(glimmer) to a full-fledged ember application without ember-cli.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)

## Further Reading / Useful Links

* [glimmerx](http://github.com/glimmerjs/glimmer-experimental/)
