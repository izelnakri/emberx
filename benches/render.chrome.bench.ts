/**
 * Rendering in a real browser, through Chrome.bench (scripts/lib/chrome-bench.js).
 *
 * Template compilation is measured in Deno (template-compilation.bench.ts); this
 * is what happens after it: the first render of a component into a fresh
 * element, in Chrome's DOM, which jsdom cannot stand in for. Each class compiles
 * its template once, on its first render, so every timed iteration is a render.
 *
 * Re-renders are not measured on this branch. @glimmer/core schedules them with
 * setTimeout(0), which browsers clamp to 4ms once timers nest, so a loop of them
 * would time the clamp. It also keeps every root renderComponent ever made and
 * revalidates all of them on each change (ROADMAP.md, dependency debt), so the
 * roots these benchmarks create stay alive until the page closes: the heap grows
 * during a run and GC moves these numbers 15–55% between runs. check-benchmarks
 * therefore treats them as observational, failing only at its hard ceiling.
 */
import Component, { hbs, renderComponent } from '@emberx/component';

declare const Chrome: {
  bench(options: { name: string; group?: string; fn: () => unknown | Promise<unknown> }): void;
};

const group = 'render';

class Post extends Component<{ post: Record<string, any> }> {
  static template = hbs`
    <article class="post">
      <h1>{{@post.title}}</h1>
      <p class="byline">by {{@post.author.name}} on {{@post.publishedAt}}</p>
      {{#if @post.summary}}
        <p class="summary">{{@post.summary}}</p>
      {{/if}}
      <div class="body">{{@post.body}}</div>
      <footer>
        {{#each @post.tags key="id" as |tag|}}
          <span class="tag">{{tag.label}}</span>
        {{/each}}
      </footer>
    </article>
  `;
}

class PostList extends Component<{ posts: Array<Record<string, any>> }> {
  static template = hbs`
    <ul class="posts">
      {{#each @posts key="id" as |post|}}
        <li class={{if post.published "published" "draft"}}>{{post.title}} — {{post.author.name}}</li>
      {{/each}}
    </ul>
  `;
}

class Feed extends Component<{ posts: Array<Record<string, any>> }> {
  static includes = { Post };
  static template = hbs`
    <section class="feed">
      {{#each @posts key="id" as |post|}}
        <Post @post={{post}} />
      {{/each}}
    </section>
  `;
}

const post = (id: number) => ({
  id,
  title: `Adventures in rendering, part ${id}`,
  author: { name: 'Izel Nakri' },
  publishedAt: '2026-10-13',
  summary: id % 2 === 0 ? 'A summary for the even ones.' : null,
  body: 'Body text. '.repeat(20),
  published: id % 3 !== 0,
  tags: [
    { id: 1, label: 'emberx' },
    { id: 2, label: 'glimmer' },
  ],
});

const ONE_POST = post(1);
const HUNDRED_POSTS = Array.from({ length: 100 }, (_unused, index) => post(index));
const TEN_POSTS = HUNDRED_POSTS.slice(0, 10);

Chrome.bench({
  name: 'render/typical component (~15 nodes)',
  group,
  fn: () => renderComponent(Post, { element: document.createElement('div'), args: { post: ONE_POST } }),
});

Chrome.bench({
  name: 'render/list (100 rows)',
  group,
  fn: () => renderComponent(PostList, { element: document.createElement('div'), args: { posts: HUNDRED_POSTS } }),
});

Chrome.bench({
  name: 'render/nested components (10 × typical)',
  group,
  fn: () => renderComponent(Feed, { element: document.createElement('div'), args: { posts: TEN_POSTS } }),
});
