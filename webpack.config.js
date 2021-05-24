import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sharedConfig = {
  mode: 'development',
  externals: {
    fs: 'fs',
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        mainFields: ['module', 'main'],
      }),
    ],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /(\.ts|\.js)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript',
            ],
            plugins: [
              ['module:@babel/plugin-proposal-decorators', { legacy: true }],
              'module:@babel/plugin-proposal-class-properties',
              'module:@babel/plugin-proposal-private-methods'
            ],
          }
        },
      },
    ],
  },
}

const devConfig = {
  name: 'devserver',
  ...sharedConfig,
  devServer: {
    hot: false,
    static: [
      path.resolve(process.cwd(), 'public'),
      path.resolve(process.cwd(), 'node_modules/qunitx/vendor'), // NOTE: make this work with qunitx in future
    ],
    devMiddleware: {
      writeToDisk: true
    },
    port: 1234
  },
  entry: {
    // 'examples/basic': './examples/basic/index.ts',
    // 'examples/blog': path.resolve(__dirname, './examples/blog/index.ts'),
    'test/index': path.resolve(__dirname, './test/index.ts')
  },
  resolve: {
    preferRelative: true,
    extensions: ['.js', '.ts'],
    alias: {
      '@emberx/component/test': path.resolve(__dirname, 'packages/@emberx/component/test/index.ts'),
      '@emberx/component': path.resolve(__dirname, 'packages/@emberx/component/lib/index.ts'),
      '@emberx/helper/test': path.resolve(__dirname, 'packages/@emberx/helper/test/index.ts'),
      '@emberx/helper': path.resolve(__dirname, 'packages/@emberx/helper/lib/index.ts'),
      '@emberx/test-helpers/test': path.resolve(__dirname, 'packages/@emberx/test-helpers/test/index.ts'),
      '@emberx/test-helpers': path.resolve(__dirname, 'packages/@emberx/test-helpers/lib/index.ts'),
      '@emberx/string/test': path.resolve(__dirname, 'packages/@emberx/string/test/index.ts'),
      '@emberx/string': path.resolve(__dirname, 'packages/@emberx/string/lib/index.ts'),
      '@emberx/link-to/test': path.resolve(__dirname, 'packages/@emberx/link-to/test/index.ts'),
      '@emberx/link-to': path.resolve(__dirname, 'packages/@emberx/link-to/lib/index.ts'),
      '@emberx/router/test': path.resolve(__dirname, 'packages/@emberx/router/test/index.ts'),
      '@emberx/router': path.resolve(__dirname, 'packages/@emberx/router/lib/index.ts'),
      '@emberx/route/test': path.resolve(__dirname, 'packages/@emberx/route/test/index.ts'),
      '@emberx/route': path.resolve(__dirname, 'packages/@emberx/route/lib/index.ts'),
    }
  },
  // externals: {
  //   // Remove once we have new glimmer-vm version published. The duplicate version is from linking issues
  //   '@glimmer/validator': 'commonjs @glimmer/validator'
  // },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}

export default [devConfig];
