import Component, { hbs } from '@glimmerx/component';
import { service } from '@glimmerx/service';
import { on, action } from '@glimmerx/modifier';

interface FreeObject {
  [propName: string]: any;
}

export default class extends Component<{ model: FreeObject; route: string }> {
  @service router;

  // TODO:
  get link() {
    if (typeof this.args.model === 'object' && this.args.model !== null) {
      return this.router.recognizer.generate(this.args.route, this.args.model); // TODO: append queryParams
    }

    return this.router.recognizer.generate(this.args.route, { slug: this.args.model }); // TODO: append queryParams
  }

  static template = hbs`
    <a href="{{this.link}}" {{on "click" this.transition}}>{{yield}}</a>
  `;

  @action transition(event) {
    event.preventDefault();

    this.router.transitionTo(this.link);
  }
}
