import Memserver from './memserver/index';
import startRouter from './start-router';

window.Memserver = Memserver;

const Router = startRouter();

Router.LOG_ROUTES = false;
Router.LOG_MODELS = false;

window.BlogRouter = Router;

export default Router.visit(`${document.location.pathname}/${document.location.search}`);
