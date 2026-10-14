import Memserver from '@memserver/server';
import routes from './server.ts';

const MemServer = new Memserver({
  initializer() {},
  routes: routes,
});

export default MemServer;
