import { Route, hbs } from '@emberx/router';

// NOTE: used for /posts/:post_id/comments/new
export default class PostsPostCommentsNewRoute extends Route {
  static model(_params, _transition) {
    return {};
  }

  static async afterModel(model, _transition) {
    const currentTime = await getCurrentTime();
    model.currentTime = currentTime;
  }

  static template = hbs`
    <p>Time is {{this.model.currentTime}}</p>
  `;
}

async function getCurrentTime() {
  const response = await fetch('/current-time');
  const json = await response.json();

  return json.currentTime;
}
