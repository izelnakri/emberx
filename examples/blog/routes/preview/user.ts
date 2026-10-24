import { Route, LinkTo, hbs } from '@emberx/router';

export default class PreviewUserRoute extends Route {
  // @service intl;

  // The comments are filtered by the server, so a change to either reloads them.
  static queryParams = {
    reviewed: { refreshModel: true },
    status: { refreshModel: true },
  };

  static async model(params, transition) {
    if (this.router.LOG_ROUTES) {
      console.log('params are', params);
      console.log('transition is', transition);
    }

    // The blog's API service (services/api.ts), from the browser, or from the server rendering the page.
    const query = new URLSearchParams(
      Object.entries(params.queryParams ?? {}).filter(([, value]) => value !== undefined) as [string, string][],
    ).toString();

    return { comments: await this.api.get(query === '' ? '/comments' : `/comments?${query}`) };
  }

  static includes = { LinkTo };

  static template = hbs`
    <LinkTo @route="preview" @model={{11}} data-test-preview-link>Main preview route</LinkTo>
    <LinkTo @route="preview.user" @query={{hash reviewed=true}} @model={{11}} data-test-preview-reviewed-comments-link>Last reviewed comments</LinkTo>
    <LinkTo @route="preview.user" @query={{hash reviewed=true status="complete"}} @model={{12}} data-test-preview-reviewed-comments-link>Last reviewed comments of user 12</LinkTo>
    <LinkTo @route="preview.user" @query={{hash status="pending"}} @model={{11}} data-test-preview-pending-comments-link>Last pending comments</LinkTo>

    <LinkTo @route="preview.user" @model={{11}} data-test-preview-all-comments-link>All users comments</LinkTo>

    {{#each this.model.comments as |comment index|}}
      <div data-test-comment="{{index}}">
        <p>{{comment.content}} | <span class="{{comment.status}}">{{comment.status}}</span></p>
        <p>{{comment.postedAt}}</p>
      </div>
    {{/each}}

    {{yield}}
  `;
}
