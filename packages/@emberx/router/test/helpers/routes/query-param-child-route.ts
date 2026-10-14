import { Route, hbs } from '@emberx/router';
import { step } from './logged-route';
import { POSTS } from './query-param-parent-route';

const COMMENTS = {
  1: ['This is great', 'Wow!'],
  2: ['Awesome'],
};

// NOTE: used for /posts/:post_id
export default class QueryParamChildRoute extends Route {
  static queryParams = {
    comments: { defaultValue: false, refreshModel: true }, // comments are loaded only when asked for
  };

  static model(params) {
    step(`posts.post model: ${JSON.stringify(params.queryParams)}`);

    const post = POSTS.find((post) => post.id === Number(params.post_id));

    return { ...post, comments: params.queryParams.comments ? COMMENTS[post.id] || [] : [] };
  }

  static template = hbs`
    <h1 data-test-title>{{this.model.title}}</h1>

    {{#each this.model.comments as |comment|}}
      <p data-test-comment>{{comment}}</p>
    {{/each}}
  `;
}
