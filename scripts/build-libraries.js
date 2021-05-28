import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import './dedupe-glimmer-validator.js';
import './make-glimmer-compiler-universal.js';

const shell = promisify(exec);

let targetPackages = [
  '@emberx/component',
  '@emberx/helper',
  '@emberx/router',
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

  try {
    // await shell(`node_modules/.bin/esbuild $(find 'packages/${packageName}/src' -type f)  --outdir="./packages/${packageName}/dist"`);
    await shell(`node_modules/.bin/tsc $(find 'packages/${packageName}/src' -type f) --outDir packages/${packageName}/dist --target ES2018 --moduleResolution node -d --allowJs`);
  } catch (error) {
    console.error(error);
  }
}
