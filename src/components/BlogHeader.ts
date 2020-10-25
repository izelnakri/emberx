import Component, { hbs } from '@glimmerx/component';

export default class AppHeader extends Component {
  static template = hbs`
    <nav class="navbar navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand">Izel Nakri</a>
      </div>
    </nav>
  `;
}
