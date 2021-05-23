import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import './dedupe-glimmer-validator.js';
import './make-glimmer-compiler-universal.js';

const shell = promisify(exec);

let targetPackages = [
  '@emberx/component',
  '@emberx/helper',
  // '@emberx/link-to',
  // '@emberx/route',
  // '@emberx/router',
  '@emberx/string',
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

  return shell(`node_modules/.bin/esbuild $(find 'packages/${packageName}/lib' -type f) --format=cjs --platform=node --outdir="./packages/${packageName}/dist"`);
}
