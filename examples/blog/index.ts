import startApplication from './router';

const Router = startApplication();

window.Router = Router;

window.Router.LOG_ROUTES = false;
window.Router.LOG_MODELS = false;

export default Router.visit(`${document.location.pathname}/${document.location.search}`);
