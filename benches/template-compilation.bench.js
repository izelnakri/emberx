/**
 * Runtime template compilation.
 *
 * emberx has no build step: `hbs` is a no-op tag and templates are handed to
 * Ember's runtime template compiler in the browser, on first render of each component. Every
 * millisecond here is paid by the user on page load, once per component, so
 * this is the benchmark that matters most for the project's core claim.
 *
 * `precompile` is measured separately from `createTemplate` to separate the
 * compiler's cost from evaluating its output and building the template.
 */
import { precompile } from 'ember-source/ember-template-compiler/index.js';
import { createTemplate } from '@emberx/component';

const TRIVIAL = `<span>{{@name}}</span>`;

const TYPICAL = `
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

const LARGE = Array.from(
  { length: 24 },
  (_unused, index) => `
  <section data-index="${index}">
    <h2>{{@sections.${index}.heading}}</h2>
    {{#if @sections.${index}.visible}}
      <ul>
        {{#each @sections.${index}.items key="id" as |item|}}
          <li class="{{if item.done "done" "pending"}}">{{item.label}}</li>
        {{/each}}
      </ul>
    {{/if}}
  </section>`,
).join('\n');

export default [
  {
    name: 'precompile: trivial (1 element)',
    fn: () => precompile(TRIVIAL, { strictMode: true }),
  },
  {
    name: 'precompile: typical component (~15 nodes)',
    fn: () => precompile(TYPICAL, { strictMode: true }),
  },
  {
    name: 'precompile: large page (24 sections)',
    fn: () => precompile(LARGE, { strictMode: true }),
  },
  {
    name: 'createTemplate: trivial (1 element)',
    fn: () => createTemplate(TRIVIAL, { strictMode: true }, {}),
  },
  {
    name: 'createTemplate: typical component (~15 nodes)',
    fn: () => createTemplate(TYPICAL, { strictMode: true }, {}),
  },
];
