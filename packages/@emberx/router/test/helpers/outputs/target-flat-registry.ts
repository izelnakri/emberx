import { Route } from '@emberx/router';

export default {
  admin: {
    options: {
      path: '/admin',
    },
    route: undefined,
    name: 'admin',
  },
  'admin.content': {
    options: {
      path: '/content',
    },
    route: undefined,
    name: 'admin.content',
  },
  'admin.index': {
    options: {
      path: '/',
    },
    route: undefined,
    name: 'admin.index',
  },
  'admin.lol': {
    options: {
      path: '/lol',
    },
    route: undefined,
    name: 'admin.lol',
  },
  'admin.lol.abc': {
    options: {
      path: '/abc',
    },
    route: undefined,
    name: 'admin.lol.abc',
  },
  'admin.lol.index': {
    options: {
      path: '/',
    },
    route: undefined,
    name: 'admin.lol.index',
  },
  'admin.posts': {
    options: {
      resetNamespace: true,
      path: '/posts',
    },
    route: undefined,
    name: 'admin.posts',
  },
  'admin.posts.index': {
    options: {
      path: '/',
    },
    route: undefined,
    name: 'admin.posts.index',
  },
  'admin.posts.new': {
    options: {
      path: '/new',
    },
    route: undefined,
    name: 'admin.posts.new',
  },
  'admin.posts.post': {
    options: {
      path: '/:slug',
    },
    route: undefined,
    name: 'admin.posts.post',
  },
  'admin.settings': {
    options: {
      path: '/settings',
    },
    route: undefined,
    name: 'admin.settings',
  },
  login: {
    options: {
      path: '/login',
    },
    route: undefined,
    name: 'login',
  },
  logout: {
    options: {
      path: '/logout',
    },
    route: undefined,
    name: 'logout',
  },
  'not-found': {
    options: {
      path: '/*slug',
    },
    route: class NotFoundRoute extends Route {},
    name: 'not-found',
  },
  public: {
    options: {
      path: '/',
    },
    route: undefined,
    name: 'public',
  },
  'public.blog-post': {
    options: {
      path: '/:slug',
    },
    route: undefined,
    name: 'public.blog-post',
  },
  'public.index': {
    options: {
      path: '/',
    },
    route: undefined,
    name: 'public.index',
  },
};
