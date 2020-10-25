# glimmerx-router

[Working example/E2E Test](http://emberx-router.surge.sh/tests/tests.html?testId=906afba6)

Experimental router for glimmerx, will ship as `emberx/router` & `emberx/route` & `emberx/link-to`
& `emberx/test-helpers` and `emberx/string`

`src/index.js` is the public API developers will interact with and `src/routes/index.ts` built as an example.

```
npm install && parcel index.html
```

### API Design

What if `@ember/routing/router` & `@ember/routing/route` were a tiny and explicitly resolvable router you could import from npm.
Flexible and simple API below can be progressively backward-compatible and support current ember router definitions!

```ts
import Router from 'emberx/router';

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
import Router from 'emberx/router';
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

#### Familiar emberx/route:

```ts
import { hbs, tracked } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { action, on } from '@glimmerx/modifier';

import Route from 'emberx/route';
import LinkTo from 'emberx/link-to';

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

This experiment is also a sketch/request for a new ember edition.
Deprecates ember controllers and makes ember-specific CLI systems an option rather than requirement.
Allows "npm your way to ember", from a React alternative(glimmer) to a full-fledged ember application without ember-cli.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)

## Further Reading / Useful Links

* [glimmerx](http://github.com/glimmerjs/glimmer-experimental/)
