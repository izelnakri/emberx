import { Route, LinkTo, hbs } from '@emberx/router';

export default class PreviewUserRoute extends Route {
  // @service intl;

  // static queryParams = {
  //   reviewed: {
  //     replace: true,
  //   },
  //   status: {
  //     default: 'something'
  //   }
  // }

  static model(params, abc) {
    console.log('params are', params);
    console.log('abc is', abc);

    let comments = [
      {
        id: 1,
        content: 'This is great',
        status: 'reviewed',
        postedAt: '2021-06-21T19:24:46.264Z',
      },
      {
        id: 2,
        content: 'Awesome',
        status: 'pending',
        postedAt: '2021-06-20T19:24:46.264Z',
      },
      {
        id: 3,
        content: 'Wow!',
        status: 'pending',
        postedAt: '2021-06-19T19:24:46.264Z',
      },
    ];

    if (params.reviewed) {
      return { comments: comments.filter((comment) => comment.status === 'reviewed') };
    } else if (params.status === 'pending') {
      return { comments: comments.filter((comment) => comment.status === 'pending') };
    }

    return { comments };
  }

  static includes = { LinkTo };

  static template = hbs`
    <LinkTo @route="preview" @model={{11}} data-test-preview-link>Main preview route</LinkTo>
    <LinkTo @route="preview.user" @query={{hash reviewed=true}} @model={{11}} data-test-preview-reviewed-comments-link>Last reviewed comments</LinkTo>
    <LinkTo @route="preview.user" @query={{hash reviewed=true}} @model={{12}} data-test-preview-reviewed-comments-link>Last reviewed comments of user 12</LinkTo>
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
