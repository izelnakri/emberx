import Component from '@emberx/component';

class OtherComponent extends Component {}

OtherComponent.setTemplate(`
  <b>Counter Val: {{@count}}</b>
`);

export default OtherComponent;
