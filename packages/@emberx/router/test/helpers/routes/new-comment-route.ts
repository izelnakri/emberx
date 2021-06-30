import { Route, hbs, action, tracked, service } from '@emberx/router';

// NOTE: used for /posts/:post_id/comments/new
export default class PostsPostCommentsNewRoute extends Route {
  static model(params, transition) {
    return {};
  }

  static async afterModel(model, transition) {
    let currentTime = await getCurrentTime();
    model.currentTime = currentTime;
  }

  static template = hbs`
    <p>Time is {{this.model.currentTime}}</p>
  `;
}

async function getCurrentTime() {
  let response = await fetch('/current-time');
  let json = await response.json();

  return json.currentTime;
}
