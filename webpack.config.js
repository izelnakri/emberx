import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sharedConfig = {
  mode: 'development',
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
            presets: ['@babel/preset-env', '@babel/preset-typescript', '@glimmer/babel-preset']
          }
        },
      },
    ],
  },
}

const librariesConfig = {
  name: 'libraries',
  ...sharedConfig,
  externals: {
    fs: 'fs',
  },
  experiments: {
    outputModule: true
  },
  entry: {
    '@emberx/component': './packages/@emberx/component/index.ts',
    '@emberx/helper': './packages/@emberx/helper/index.ts',
    // '@emberx/link-to': './packages/@emberx/link-to/index.ts',
    // '@emberx/router': './packages/@emberx/router/index.ts',
    // '@emberx/route': './packages/@emberx/route/index.ts',
    // '@emberx/string': './packages/@emberx/string/index.ts',
    // '@emberx/test-helpers': './packages/@emberx/test-helpers/index.ts',
  },
  output: {
    filename: (pathData) => {
      return `packages/${pathData.chunk.name}/dist/index.js`;
    },
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module',
  }
};

const appsConfig = {
  name: 'examples',
  ...sharedConfig,
  devServer: {
    hot: false,
    static: [
      path.resolve(process.cwd(), 'public'),
      path.resolve(process.cwd(), 'node_modules/qunitx/vendor'),
    ],
    devMiddleware: {
      writeToDisk: true
    },
    port: 1234
  },
  entry: {
    'examples/basic': './examples/basic/index.ts',
    'examples/blog': path.resolve(__dirname, './examples/blog/index.ts'),
    'tests/index': path.resolve(__dirname, './tests/index.ts')
  },
  resolve: {
    preferRelative: true,
    extensions: ['.js', '.ts'],
    alias: {
      '@emberx/helper': path.resolve(__dirname, 'packages/@emberx/helper/index.ts'),
      '@emberx/string': path.resolve(__dirname, 'packages/@emberx/string/index.ts')
    }
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}

export default [librariesConfig, appsConfig];
