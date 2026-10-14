import Memserver from './memserver/index.ts';
import startRouter from './start-router.ts';

window.Memserver = Memserver;

const Router = startRouter();

Router.LOG_ROUTES = false;
Router.LOG_MODELS = false;

window.BlogRouter = Router;

export default Router.visit(`${document.location.pathname}${document.location.search}`);
