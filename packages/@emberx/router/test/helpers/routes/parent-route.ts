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
    let posts = await response.json();

    return { posts };
  }

  static async afterModel(model, transition) {
    if (model.posts.length === 1) {
      this.router.transitionTo('posts.post', model.posts[0]);
    }
  }

  // TODO: test <LinkTo/> first?
  static template = hbs`
    <h1 data-test-route-title>This is parent route: {{this.router.currentRouteName}}</h1>

    <div data-test-posts>
      {{#each this.model.posts as |post index|}}
        <div data-test-post="{{index}}">
          <h5 data-test-post-title="{{index}}">{{post.title}}</h5>
          <p data-test-post-content="{{index}}">{{post.content}}</h5>

          <LinkTo @route="posts.post" @model={{post}} data-test-post-link="{{index}}">Go to this post</LinkTo>
        </div>
      {{/each}}
    </div>
  `;
}

// beforeModel() {
//   if (!this.get('organizationManager.organization')) {
//     return this.organizationManager.setupTask.perform();
//   }
// },
// beforeModel() {
//   if (!this.capitalIncreaseManager.organization.underRegistration) {
//     this.transitionTo('organizations.show');
//   }
// }
// beforeModel(transition) {
//   if (!this.session.currentUser) {
//     this.session.previousRouteTransition = transition;
//     this.replaceWith('login');
//     this.flashMessages.warning(
//       this.loginRequiredFlashMessage || 'Please login to view this page'
//     );
//   }
// }
// afterModel(model) {
//   model.setProperties({
//     interval: window.setInterval(() => {
//       model.qrSeed = uuid();
//     }, 500),
//     qrSeed: uuid()
//   });
// }
// afterModel() {
//   this.transitionTo('transfers.multi.new');
// },
