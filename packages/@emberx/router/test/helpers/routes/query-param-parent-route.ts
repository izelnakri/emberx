import { Route, hbs, action, tracked } from '@emberx/router';
import { step } from './logged-route';

export const POSTS = [
  { id: 1, title: 'Compilers are the New Frameworks', category: 'compilers' },
  { id: 2, title: 'Adventures in Microbenchmarking', category: 'performance' },
  { id: 3, title: 'Making the Jump: How Desktop-Era Frameworks Can Thrive on Mobile', category: 'mobile' },
  { id: 4, title: 'What’s the Deal with TypeScript?', category: 'compilers' },
  { id: 5, title: 'Glimmer: Blazing Fast Rendering for Ember.js', category: 'performance' },
];

const PAGE_SIZE = 2;

// NOTE: used for /posts
export default class QueryParamParentRoute extends Route {
  static queryParams = {
    page: { defaultValue: 1, refreshModel: true }, // the model hook loads one page at a time
    sort: { defaultValue: 'oldest', replace: true }, // sorted on the page, and kept out of the history
    category: 'all', // filtered on the page; shorthand for { defaultValue: 'all' }
  };

  static model(params) {
    step(`posts model: ${JSON.stringify(params.queryParams)}`);

    const { page } = params.queryParams;

    return { posts: POSTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
  }

  @tracked bookmarks = 0;

  get visiblePosts() {
    const { category, sort } = this.queryParams;
    const posts = category === 'all' ? this.model.posts : this.model.posts.filter((post) => post.category === category);

    return sort === 'newest' ? [...posts].reverse() : posts;
  }

  @action
  bookmark() {
    this.bookmarks++;
  }

  static template = hbs`
    <h1 data-test-title>Page {{@queryParams.page}} of {{this.queryParams.category}} posts, {{@queryParams.sort}} first</h1>

    {{#each this.visiblePosts as |post|}}
      <p data-test-post={{post.id}}>{{post.title}}</p>
    {{/each}}

    <button type="button" data-test-bookmark {{on "click" this.bookmark}}>Bookmarked {{this.bookmarks}}</button>
  `;
}
