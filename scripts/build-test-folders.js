import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import recursiveLookup from 'recursive-lookup';
import './fix-qunit-dom-import.js';

const shell = promisify(exec);

let targetPackages = [
  '@emberx/helper',
  '@emberx/component',
  '@emberx/string',
  // '@emberx/router',
  '@emberx/test-helpers',
  // '@emberx/ssr'
];

await targetPackages.reduce(async (lastCompile, packageName) => {
  await lastCompile;

  return buildPackage(packageName);
}, new Promise((resolve) => resolve()));


// TODO: maybe do not use --bundle due to cross reference:
async function buildPackage(packageName) {
  let targetFolder = `${process.cwd()}/packages/${packageName}`;

  await fs.rm(`${targetFolder}/tmp`, { recursive: true, force: true });

  try {
    let fileAbsolutePaths = await recursiveLookup(`packages/${packageName}/test`, (path) => path.endsWith('.ts'));

    await Promise.all(fileAbsolutePaths.map((fileAbsolutePath) => {
      let targetPath = fileAbsolutePath
        .replace(`packages/${packageName}/test`, `tmp/${packageName}`)
      targetPath = targetPath.slice(0, targetPath.length - 3) + '.js';

      return shell(`node_modules/.bin/babel ${fileAbsolutePath} --config-file ${process.cwd()}/.babelrc -o ${targetPath}`);
    }));

  } catch (error) {
    console.error(error);
  }
}
