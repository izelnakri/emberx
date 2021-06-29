import Memserver from './memserver/index';
import startApplication from './router';

window.Memserver = Memserver;

const Router = startApplication();

window.Router = Router;

window.Router.LOG_ROUTES = false;
window.Router.LOG_MODELS = false;

export default Router.visit(`${document.location.pathname}/${document.location.search}`);
