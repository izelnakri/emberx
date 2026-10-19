import './mock-server/index.ts';
import startRouter from './start-router.ts';

const Router = startRouter();

Router.LOG_ROUTES = false;
Router.LOG_MODELS = false;

window.BlogRouter = Router;

export default Router.visit(`${document.location.pathname}${document.location.search}`);
