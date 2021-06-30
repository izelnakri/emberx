import { Route, hbs, action, tracked, service } from '@emberx/router';

// NOTE: used for /posts/:post_id
export default class ChildRoute extends Route {
  @service session;

  static beforeModel(transition) {
    let posts = this.modelFor('posts');
    if (posts.length === 1) {
      return this.router.transitionTo('posts.post.comments.new', posts[0]);
    }
  }

  static model(params) {
    let { posts } = this.modelFor('posts');
    return {
      posts,
      post: posts.find((post) => post.id === params.post_id),
    };
  }

  static async afterModel(model, transition) {
    if (model.posts.length === 1) {
      this.router.transitionTo('posts.post', model.posts[0]);
    }
  }

  // put a link to
  // static template = hbs`
  //   <h1 data-test-route-title>This is parent route: {{this.router.currentRouteName}}</h1>

  //   <div data-test-posts>
  //     {{#each this.model.posts as |post index|}}
  //       <div data-test-post="{{index}}">
  //         <h5 data-test-post-title="{{index}}">{{post.title}}</h5>
  //         <p data-test-post-content="{{index}}">{{post.content}}</h5>

  //         <LinkTo @route="posts.post" @model={{post}} data-test-post-link="{{index}}">Go to this post</LinkTo>
  //       </div>
  //     {{/each}}
  //   </div>
  // `;
}
