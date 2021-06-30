import Memserver from '@memserver/server';

export default function setupMemserver(hooks) {
  hooks.beforeEach(function () {
    try {
      this.Server = new Memserver({
        routes() {
          const COMMENTS = [
            {
              id: 1,
              content: 'This is great',
              status: 'reviewed',
              postedAt: '2021-06-21T19:24:46.264Z',
            },
            {
              id: 2,
              content: 'Awesome',
              status: 'pending',
              postedAt: '2021-06-20T19:24:46.264Z',
            },
            {
              id: 3,
              content: 'Wow!',
              status: 'pending',
              postedAt: '2021-06-19T19:24:46.264Z',
            },
          ];

          this.get('/posts', (req) => {
            return JSON.stringify([
              {
                id: 1,
                title: 'Compilers are the New Frameworks',
                content:
                  'My current “investment thesis” is that what we call web frameworks are transforming from runtime libraries into optimizing compilers...',
              },
              {
                id: 2,
                title: 'Adventures in Microbenchmarking',
                content:
                  'When we’re trying to speed up some part of our code, we want quick, targeted feedback about how our changes perform against the initial implementation....',
              },
              {
                id: 3,
                title: 'Making the Jump: How Desktop-Era Frameworks Can Thrive on Mobile',
                content:
                  'How do tools that grew up on the desktop, like Ember, Angular and React, make the jump to the mobile future?..',
              },
              {
                id: 4,
                title: 'What’s the Deal with TypeScript?',
                content:
                  'Two weeks ago at EmberConf, we announced Glimmer.js, a component-based library for writing superfast web applications...',
              },
            ]);
          });

          this.get('/comments', (req, res) => {
            let queryParams = req.queryParams;

            if (queryParams.reviewed) {
              return COMMENTS.filter((comment) => comment.status === 'reviewed');
            } else if (queryParams.status === 'pending') {
              return COMMENTS.filter((comment) => comment.status === 'pending');
            }

            return JSON.stringify(COMMENTS);
          });

          this.get('/current-time', (req) => {
            return { currentTime: '2021-06-30T21:27:33.195Z' };
          });
        },
      });
    } catch (error) {
      debugger;
    }
  });

  hooks.afterEach(function () {
    this.Server.shutdown();
  });
}
