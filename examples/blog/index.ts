import './mock-server/index.ts';
import startRouter from './start-router.ts';

const Router = startRouter();

window.BlogRouter = Router;

export default Router.visit(`${document.location.pathname}${document.location.search}`);
