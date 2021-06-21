import { Route, hbs } from '@emberx/router';
import RSVP from 'rsvp';

export default class LoginRoute extends Route {
  static model() {
    return RSVP.hash({
      currentTime: getCurrentTime(),
    });
  }
  static template = hbs`
    <h4 data-test-route-name>This is Login route</h4>
    <p data-test-route-current-time>Current time is: {{this.model.currentTime}}</p>
  `;
}

async function getCurrentTime() {
  let response = await fetch('/current-time');
  let json = await response.json();

  return json.currentTime;
}
