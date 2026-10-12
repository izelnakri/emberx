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

// Every result is assigned here, so the optimiser cannot delete the work measured.
export let sink: unknown;

const group = 'template-compilation';
const strictMode = { strictMode: true };

Deno.bench({
  name: 'template-compilation/precompileJSON: trivial (1 element)',
  group,
  fn: () => void (sink = precompileJSON(TRIVIAL, strictMode)),
});
Deno.bench({
  name: 'template-compilation/precompileJSON: typical component (~15 nodes)',
  group,
  fn: () => void (sink = precompileJSON(TYPICAL, strictMode)),
});
Deno.bench({
  name: 'template-compilation/precompileJSON: large page (24 sections)',
  group,
  fn: () => void (sink = precompileJSON(LARGE, strictMode)),
});
Deno.bench({
  name: 'template-compilation/createTemplate: trivial (1 element)',
  group,
  fn: () => void (sink = createTemplate(TRIVIAL, { strictMode: true }, {})),
});
Deno.bench({
  name: 'template-compilation/createTemplate: typical component (~15 nodes)',
  group,
  fn: () => void (sink = createTemplate(TYPICAL, { strictMode: true }, {})),
});
