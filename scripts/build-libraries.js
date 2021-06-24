import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import lookup from 'recursive-lookup';
import './dedupe-glimmer-validator.js';
import './fix-rsvp-module-reference.js';
// TODO: fix @glimmer/core imports by removing the module lookup
import './make-glimmer-compiler-universal.js';

const shell = promisify(exec);

let targetPackages = [
  '@emberx/helper',
  '@emberx/component',
  '@emberx/string',
  '@emberx/router',
  '@emberx/test-helpers',
  '@emberx/ssr'
];
// let packages = await fs.readdir('./packages/@emberx');

await targetPackages.reduce(async (lastCompile, packageName) => {
  await lastCompile;

  return buildPackage(packageName);
}, new Promise((resolve) => resolve()));


// TODO: maybe do not use --bundle due to cross reference:
async function buildPackage(packageName) {
  let targetFolder = `${process.cwd()}/packages/${packageName}`;

  await fs.rm(`${targetFolder}/dist`, { recursive: true, force: true });
  await fs.mkdir(`${targetFolder}/dist`, { recursive: true });

  try {
    if (process.env.ENVIRONMENT === 'development') {
      let paths = await lookup(`packages/${packageName}/src`, (path) => path.endsWith('.ts') || path.endsWith('.js'));

      await Promise.all(paths.map((absolutePath) => {
        let targetPath = absolutePath.replace(`${packageName}/src`, `${packageName}/dist`)
        let jsTargetPath = targetPath.slice(0, targetPath.length - 3).concat('.js');

        return shell(`node_modules/.bin/babel ${absolutePath} --config-file ${process.cwd()}/.babelrc -o ${jsTargetPath}`);
      }));
    } else {
      await shell(`node_modules/.bin/tsc $(find 'packages/${packageName}/src' -type f ) --outDir packages/${packageName}/dist --module es2020 --target ES2018 --moduleResolution node --allowSyntheticDefaultImports true --experimentalDecorators true -d --allowJs`);

      let fileAbsolutePaths = await lookup(`packages/${packageName}/dist`, (path) => path.endsWith('.js'));

      await Promise.all(fileAbsolutePaths.map((fileAbsolutePath) => {
        return shell(`node_modules/.bin/babel ${fileAbsolutePath} --config-file ${process.cwd()}/.babelrc -o ${fileAbsolutePath}`);
      }));
    }
  } catch (error) {
    console.error(error);
  }
}

// node_modules/.bin/tsc $(find 'src' -type f) --outDir dist --target ES2018 --moduleResolution node --experimentalDecorators true -d --allowJs --resolveJsonModule true
