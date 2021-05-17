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
            presets: ['@glimmer/babel-preset', '@babel/preset-typescript']
          }
        },
      },
    ],
  },
}

// TODO: when --prod passed minify/optimize everything for npm
const glimmerBuildConfig = {
  name: 'glimmer',
  ...sharedConfig,
  experiments: {
    outputModule: true
  },
  entry: {
    '@glimmer/core': './node_modules/@glimmer/core/index.ts',
  },
  output: {
    filename: (pathData) => {
      return `packages/@emberx/component/glimmer-core/index.ts`;
    },
    path: __dirname,
    libraryTarget: 'module',
  }
};

const buildConfig = {
  name: 'build',
  ...sharedConfig,
  experiments: {
    outputModule: true
  },
  entry: {
    '@emberx/component': './packages/@emberx/component/index.ts',
    // '@emberx/helper': './packages/@emberx/helper/index.ts',
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
    path: __dirname,
    libraryTarget: 'module',
  }
};

const devConfig = {
  name: 'devserver',
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
      '@emberx/string': path.resolve(__dirname, 'packages/@emberx/string/index.ts'),
      '@emberx/link-to': path.resolve(__dirname, 'packages/@emberx/link-to/index.ts'),
      '@emberx/router': path.resolve(__dirname, 'packages/@emberx/router/index.ts'),
      '@emberx/route': path.resolve(__dirname, 'packages/@emberx/route/index.ts'),
      '@emberx/test-helpers': path.resolve(__dirname, 'packages/@emberx/test-helpers/index.ts')
    }
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}

export default [glimmerBuildConfig, buildConfig, devConfig];
