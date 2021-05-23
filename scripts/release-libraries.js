import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';

const shell = promisify(exec);
const version = process.argv[2];

if (!version) {
  console.error('No version provided for upgrade!');
  process.exit(1);
}

const TARGET_LIBRARIES = [
  '@emberx/component',
  '@emberx/helper',
  '@emberx/link-to',
  '@emberx/route',
  '@emberx/router',
  '@emberx/ssr',
  '@emberx/string',
  '@emberx/test-helpers'
]

await Promise.all(TARGET_LIBRARIES.map((libraryName) => bumpVersion(libraryName, version, TARGET_LIBRARIES)));
await Promise.all(TARGET_LIBRARIES.map((libraryName) => shell(`npm publish --workspace=${libraryName} --access public`)));

async function bumpVersion(libraryName, version, allLibrariesToUpgrade) {
  let packageJSON = await fs.readFile(`packages/${libraryName}/package.json`);

  let oldJSON = JSON.parse(packageJSON.toString());

  oldJSON.version = version;

  let oldDependencies = Object.keys(oldJSON.dependencies || {});

  oldJSON.dependencies = oldDependencies.reduce((result, dependency) => {
    if (TARGET_LIBRARIES.includes(dependency)) {
      return { ...result, [dependency]: version };
    }

    return { ...result, [dependency]: oldJSON.dependencies[dependency] };
  }, oldDependencies);

  await fs.writeFile(`packages/${libraryName}/package.json`, JSON.stringify(oldJSON, null, 2));
}