import { Route, hbs, action, tracked, service } from '@emberx/router';

// NOTE: used for /posts/:post_id/comments/new
export default class PostsPostCommentsNewRoute extends Route {
  static model(params, transition) {}

  static async afterModel(model, transition) {
    let currentTime = await getTime();

    model.currentTime = currentTime;
  }

  static template = hbs`
  `;
}
