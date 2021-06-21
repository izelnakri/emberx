import { Route } from '@emberx/router';

export default [
  {
    name: 'admin',
    route: undefined,
    options: { path: '/admin' },
    nestedRoutes: [
      {
        name: 'admin.content',
        route: undefined,
        options: { path: '/content' },
        nestedRoutes: [],
      },
      {
        name: 'admin.index',
        route: undefined,
        options: { path: '/' },
        nestedRoutes: [],
      },
      {
        name: 'admin.lol',
        route: undefined,
        options: { path: '/lol' },
        nestedRoutes: [
          {
            name: 'admin.lol.abc',
            route: undefined,
            options: { path: '/abc' },
            nestedRoutes: [],
          },
          {
            name: 'admin.lol.index',
            route: undefined,
            options: { path: '/' },
            nestedRoutes: [],
          },
        ],
      },
      {
        name: 'admin.posts',
        route: undefined,
        options: { resetNamespace: true, path: '/posts' },
        nestedRoutes: [
          {
            name: 'admin.posts.index',
            route: undefined,
            options: { path: '/' },
            nestedRoutes: [],
          },
          {
            name: 'admin.posts.new',
            route: undefined,
            options: { path: '/new' },
            nestedRoutes: [],
          },
          {
            name: 'admin.posts.post',
            route: undefined,
            options: { path: '/:slug' },
            nestedRoutes: [],
          },
        ],
      },
      {
        name: 'admin.settings',
        route: undefined,
        options: { path: '/settings' },
        nestedRoutes: [],
      },
    ],
  },
  {
    name: 'login',
    route: undefined,
    options: { path: '/login' },
    nestedRoutes: [],
  },
  {
    name: 'logout',
    route: undefined,
    options: { path: '/logout' },
    nestedRoutes: [],
  },
  {
    name: 'not-found',
    route: class NotFoundRoute extends Route {},
    options: { path: '/*slug' },
    nestedRoutes: [],
  },
  {
    name: 'public',
    route: undefined,
    options: { path: '/' },
    nestedRoutes: [
      {
        name: 'public.blog-post',
        route: undefined,
        options: { path: '/:slug' },
        nestedRoutes: [],
      },
      {
        name: 'public.index',
        route: undefined,
        options: { path: '/' },
        nestedRoutes: [],
      },
    ],
  },
];
