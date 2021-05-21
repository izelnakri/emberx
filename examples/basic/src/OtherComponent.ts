import Component, { hbs } from '@emberx/component';

class OtherComponent extends Component {
  static template = hbs`
    <b>Counter Val: {{@count}}</b>
  `;
}

export default OtherComponent;
