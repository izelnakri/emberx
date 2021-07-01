# @emberx/router: Fast, advanced, flexible routing library for browsers and node.js

This is a futuristic take on the router of ember.js, which is the most advanced and mature
routing solution I've seen so far in frontend development. It supports named routes, queryParameters,
dynamic link segments, redirections, promise-aware route-template render delayin for SSR,
parent-children route relationships. The router is fully testable with `visit` and `currentURL` helpers
for `@emberx/test-helpers`.

```ts
// in index.ts:

import startRouter from './start-router';

const Router = startRouter();

export default Router.visit(`${document.location.pathname}/${document.location.search}`);

// ===================================================
// in ./start-router.ts:

import Router from '@emberx/router';
import IndexRoute from './routes/index/route.ts';
import PostsRoute from './routes/posts/route.ts';
import PostsIndexRoute from './routes/posts/index/route.ts';
import PostsPostRoute from './routes/posts/post/route.ts';

Router.addServices({
  intl: new LocaleService(),
});

let router = Router.start([
  {
    path: '/',
    name: 'index',
    route: IndexRoute
  },
  {
    path: '/posts',
    name: 'posts',
    route: PostsRoute,
    indexRoute: PostsIndexRoute
  },
  {
    path: '/posts/:slug',
    name: 'posts.post',
    route: PostsPostRoute
  },
  {
    path: '/posts/:blog_post_id/comments',
    name: 'posts.post.comments',
    route: PostsPostCommentsRoute
  },
]);

export default router;

// ===================================================
// in ./routes/index/route.ts:

import { Route, hbs, service } from '@emberx/router';
import { WelcomeBanner } from './components/welcome-banner';
import translate from './helpers/translate';
import RSVP from 'rsvp';

export default class PostsPostRoute extends Route {
  @service intl;

  static model(params, transition) {
    return RSVP.hash({ comments: fetchComments() }); // NOTE: RSVP.hash() returns a promise that waits for promises inside the hash
  }

  static includes = { WelcomeBanner, translate };

  static template = hbs`
    <WelcomeBanner />

    <h5>{{translate "post-page.welcome"}}</h5>
    <LinkTo @route="posts" @model={{11}} data-test-preview-link>All posts</LinkTo>
    <LinkTo @route="posts.post" @query={{hash preview=true}} @model={{11}} data-test-preview-reviewed-comments-link>View post 11</LinkTo>
    <LinkTo @route="posts.post" @query={{hash preview=true asUser=22}} @model={{12}} data-test-preview-reviewed-comments-link>View post 12 in preview mode by user 22</LinkTo>
    <LinkTo @route="posts.post" @query={{hash priviledge="admin"}} @model={{11}} data-test-preview-pending-comments-link>View this post in admin priviledge mode</LinkTo>

    <LinkTo @route="posts.post.comments" @model={{11}} data-test-preview-all-comments-link>See comments in detail</LinkTo>

    {{#each this.model.comments as |comment index|}}
      <div data-test-comment="{{index}}">
        <p>{{comment.content}} | <span class="{{comment.status}}">{{comment.status}}</span></p>
        <p>{{comment.postedAt}}</p>
      </div>
    {{/each}}

    {{yield}} <!-- PostsPostCommentRoute can use this route in its template and extend it thanks to yield -->

    <button {{on "click" this.changeLocale}}>{{translate "buttons.change-locale"}}</button>
  `;

  @action
  async changeLocale() {
    await this.intl.changeLocaleToRandomLocale();
    console.log('locale changed to:', this.intl.currentLocale);
  }
}
```
