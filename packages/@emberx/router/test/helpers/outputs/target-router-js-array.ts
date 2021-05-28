export default [
  {
    routeName: 'admin',
    route: undefined,
    options: { path: '/admin' },
    nestedRoutes: [
      {
        routeName: 'admin.content',
        route: undefined,
        options: { path: '/content' },
        nestedRoutes: [],
      },
      {
        routeName: 'admin.index',
        route: undefined,
        options: { path: '/' },
        nestedRoutes: [],
      },
      {
        routeName: 'admin.lol',
        route: undefined,
        options: { path: '/lol' },
        nestedRoutes: [
          {
            routeName: 'admin.lol.abc',
            route: undefined,
            options: { path: '/abc' },
            nestedRoutes: [],
          },
          {
            routeName: 'admin.lol.index',
            route: undefined,
            options: { path: '/' },
            nestedRoutes: [],
          },
        ],
      },
      {
        routeName: 'admin.posts',
        route: undefined,
        options: { resetNamespace: true, path: '/posts' },
        nestedRoutes: [
          {
            routeName: 'admin.posts.index',
            route: undefined,
            options: { path: '/' },
            nestedRoutes: [],
          },
          {
            routeName: 'admin.posts.new',
            route: undefined,
            options: { path: '/new' },
            nestedRoutes: [],
          },
          {
            routeName: 'admin.posts.post',
            route: undefined,
            options: { path: '/:slug' },
            nestedRoutes: [],
          },
        ],
      },
      {
        routeName: 'admin.settings',
        route: undefined,
        options: { path: '/settings' },
        nestedRoutes: [],
      },
    ],
  },
  {
    routeName: 'login',
    route: undefined,
    options: { path: '/login' },
    nestedRoutes: [],
  },
  {
    routeName: 'logout',
    route: undefined,
    options: { path: '/logout' },
    nestedRoutes: [],
  },
  {
    routeName: 'public',
    route: undefined,
    options: { path: '/' },
    nestedRoutes: [
      {
        routeName: 'public.blog-post',
        route: undefined,
        options: { path: '/:slug' },
        nestedRoutes: [],
      },
      {
        routeName: 'public.index',
        route: undefined,
        options: { path: '/' },
        nestedRoutes: [],
      },
    ],
  },
];
