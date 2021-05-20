import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import './dedupe-glimmer-validator.js';
import './make-glimmer-compiler-universal.js';

const shell = promisify(exec);

const providedPkgs = process.argv.slice(2).reduce((result, arg) => {
  return result.concat(arg);
}, []);

let targetPackages = providedPkgs.length > 0 ? providedPkgs : [
  '@emberx/component',
  // '@emberx/helper',
  // '@emberx/link-to',
  // '@emberx/route',
  // '@emberx/router',
  '@emberx/string',
  // '@emberx/test-helpers'
];
// let packages = await fs.readdir('./packages/@emberx');

await targetPackages.reduce(async (lastCompile, packageName) => {
  await lastCompile;

  return buildPackage(packageName);
}, new Promise((resolve) => resolve()));


// TODO: maybe do not use --bundle due to cross reference:
async function buildPackage(packageName) {
  let targetFolder = `${process.cwd()}/packages/${packageName}`;

  await fs.mkdir(`${targetFolder}/dist`, { recursive: true });

  return shell(`node_modules/.bin/esbuild ${targetFolder}/index.ts --bundle --platform=node > ${targetFolder}/dist/index.js`);
}
