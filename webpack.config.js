import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const librariesConfig = {
  mode: 'development',
  experiments: {
    outputModule: true
  },
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
  devServer: {
    writeToDisk: true,
  },
  entry: {
    '@emberx/component': './packages/@emberx/component/index.ts',
    '@emberx/helper': './packages/@emberx/helper/index.ts',
    '@emberx/link-to': './packages/@emberx/link-to/index.ts',
    '@emberx/router': './packages/@emberx/router/index.ts',
    '@emberx/route': './packages/@emberx/route/index.ts',
    '@emberx/string': './packages/@emberx/string/index.ts',
    '@emberx/test-helpers': './packages/@emberx/test-helpers/index.ts',
  },
  output: {
    filename: (pathData) => {
      return `packages/${pathData.chunk.name}/dist/index.js`;
    },
    path: __dirname,
    libraryTarget: 'module',
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
};

export default [librariesConfig];
