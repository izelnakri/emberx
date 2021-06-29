import RSVP from 'rsvp';
import { Route, LinkTo, hbs } from '@emberx/router';

class CommentStore {
  static async findAll(queryParams) {
    let targetQueryParams = Object.keys(queryParams).reduce((result, key) => {
      result.set(key, queryParams[key]);

      return result;
    }, new URLSearchParams());
    let fullURL =
      targetQueryParams.toString() === '' ? `/comments` : `/comments?${targetQueryParams.toString()}`;
    let response = await fetch(fullURL);
    return await response.json();
  }
}

// TODO: we want to add replace behavior, defaultValue behavior(?), and refresh?() - should happen all the time
export default class PreviewUserRoute extends Route {
  // @service intl;

  static model(params, transition) {
    console.log('!!!!!!!!!!!!!!!!MODEL CALLL!!!!!!!!!!!!');
    if (this.router.LOG_ROUTES) {
      console.log('params are', params);
      console.log('transition is', transition);
    }

    return RSVP.hash({ comments: CommentStore.findAll(params.queryParams || {}) });
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
