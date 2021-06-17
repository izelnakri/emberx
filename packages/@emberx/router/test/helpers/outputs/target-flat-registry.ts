import { Route } from '@emberx/router';

export default {
  admin: {
    options: {
      path: '/admin',
    },
    route: undefined,
    routeName: 'admin',
  },
  'admin.content': {
    options: {
      path: '/content',
    },
    route: undefined,
    routeName: 'admin.content',
  },
  'admin.index': {
    options: {
      path: '/',
    },
    route: undefined,
    routeName: 'admin.index',
  },
  'admin.lol': {
    options: {
      path: '/lol',
    },
    route: undefined,
    routeName: 'admin.lol',
  },
  'admin.lol.abc': {
    options: {
      path: '/abc',
    },
    route: undefined,
    routeName: 'admin.lol.abc',
  },
  'admin.lol.index': {
    options: {
      path: '/',
    },
    route: undefined,
    routeName: 'admin.lol.index',
  },
  'admin.posts': {
    options: {
      resetNamespace: true,
      path: '/posts',
    },
    route: undefined,
    routeName: 'admin.posts',
  },
  'admin.posts.index': {
    options: {
      path: '/',
    },
    route: undefined,
    routeName: 'admin.posts.index',
  },
  'admin.posts.new': {
    options: {
      path: '/new',
    },
    route: undefined,
    routeName: 'admin.posts.new',
  },
  'admin.posts.post': {
    options: {
      path: '/:slug',
    },
    route: undefined,
    routeName: 'admin.posts.post',
  },
  'admin.settings': {
    options: {
      path: '/settings',
    },
    route: undefined,
    routeName: 'admin.settings',
  },
  login: {
    options: {
      path: '/login',
    },
    route: undefined,
    routeName: 'login',
  },
  logout: {
    options: {
      path: '/logout',
    },
    route: undefined,
    routeName: 'logout',
  },
  'not-found': {
    options: {
      path: '/*slug',
    },
    route: class NotFoundRoute extends Route {},
    routeName: 'not-found',
  },
  public: {
    options: {
      path: '/',
    },
    route: undefined,
    routeName: 'public',
  },
  'public.blog-post': {
    options: {
      path: '/:slug',
    },
    route: undefined,
    routeName: 'public.blog-post',
  },
  'public.index': {
    options: {
      path: '/',
    },
    route: undefined,
    routeName: 'public.index',
  },
};
