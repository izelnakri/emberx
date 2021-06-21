import { Route, hbs, action, tracked, service } from '@emberx/router';

// NOTE: used for /posts
export default class ParentRoute extends Route {
  @service session;

  static beforeModel(transition) {
    if (!this.session.currentUser) {
      return this.router.transitionTo('login');
    }
  }

  static async model(params, transition) {
    let response = await fetch('/posts');
  }

  static async afterModel(model, transition) {
    if (model.get('length') === 1) {
      this.router.transitionTo('post', model.posts[0]);
    }
  }

  static template = hbs`
    <h1 data-test-route-title>This is parent route: {{this.router.currentRouteName}}</h1>

    <div data-test-posts>
      {{#each this.model.posts as |post index|}}
        <div data-test-post="{{index}}">
          <h5 data-test-post-title="{{index}}">{{post.title}}</h5>
          <p data-test-post-content="{{index}}">{{post.content}}</h5>
        </div>
      {{/each}}
    </div>
  `;
}
