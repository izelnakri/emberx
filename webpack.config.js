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

const glimmerBuildConfig = {
  name: 'glimmer',
  ...sharedConfig,
  mode: 'production',
  experiments: {
    outputModule: true
  },
  entry: {
    '@glimmer/core': 'packages/@emberx/component/glimmer.ts'
  },
  output: {
    filename: (pathData) => {
      return `packages/@emberx/component/glimmer-core/index.js`;
    },
    path: __dirname,
    libraryTarget: 'module',
  }
};

const buildConfig = {
  name: 'build',
  ...sharedConfig,
  mode: 'production',
  experiments: {
    outputModule: true
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
      '@emberx/component': path.resolve(__dirname, 'packages/@emberx/component/index.ts'),
      '@emberx/helper/tests': path.resolve(__dirname, 'packages/@emberx/helper/tests/index.ts'),
      '@emberx/helper': path.resolve(__dirname, 'packages/@emberx/helper/index.ts'),
      '@emberx/test-helpers/tests': path.resolve(__dirname, 'packages/@emberx/test-helpers/tests/index.ts'),
      '@emberx/test-helpers': path.resolve(__dirname, 'packages/@emberx/test-helpers/index.ts'),
      '@emberx/string/tests': path.resolve(__dirname, 'packages/@emberx/string/tests/index.ts'),
      '@emberx/string': path.resolve(__dirname, 'packages/@emberx/string/index.ts'),
      '@emberx/link-to': path.resolve(__dirname, 'packages/@emberx/link-to/index.ts'),
      '@emberx/router': path.resolve(__dirname, 'packages/@emberx/router/index.ts'),
      '@emberx/route': path.resolve(__dirname, 'packages/@emberx/route/index.ts'),
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

export default [glimmerBuildConfig, buildConfig, devConfig];
