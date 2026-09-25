/**
 * Runtime template compilation.
 *
 * emberx has no build step: `hbs` is a no-op tag and templates are handed to
 * `@glimmer/compiler` in the browser, on first render of each component. Every
 * millisecond here is paid by the user on page load, once per component, so
 * this is the benchmark that matters most for the project's core claim.
 *
 * `precompileJSON` is measured separately from `createTemplate` to separate
 * Glimmer's cost from emberx's wrapper (scope reification + templateFactory).
 */
import { precompileJSON } from '@glimmer/compiler';
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
    name: 'precompileJSON: trivial (1 element)',
    fn: () => precompileJSON(TRIVIAL, { strictMode: true }),
  },
  {
    name: 'precompileJSON: typical component (~15 nodes)',
    fn: () => precompileJSON(TYPICAL, { strictMode: true }),
  },
  {
    name: 'precompileJSON: large page (24 sections)',
    fn: () => precompileJSON(LARGE, { strictMode: true }),
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
