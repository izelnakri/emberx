import Memserver from './memserver/index';
import startApplication from './router';

window.Memserver = Memserver;

const Router = startApplication();

Router.LOG_ROUTES = false;
Router.LOG_MODELS = false;

window.BlogRouter = Router;

export default Router.visit(`${document.location.pathname}/${document.location.search}`);
