import Memserver from '@memserver/server';
import routes from './server';

const MemServer = new Memserver({
  initializer() {},
  routes: routes,
});

export default MemServer;
