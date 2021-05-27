import fs from 'fs/promises';

let TARGET_DEPENDENCIES = [
  '@glimmer/ssr',
  '@glimmer/node',
  '@glimmer/core',
  '@glimmer/component',
  '@glimmer/compiler',
  '@glimmer/destroyable',
  '@glimmer/runtime',
  '@glimmer/reference',
  '@glimmer/manager',
  '@glimmer/modifier',
  '@glimmer/opcode-compiler',
  '@glimmer/owner',
  '@glimmer/program',
  '@glimmer/tracking',
];

await Promise.all(TARGET_DEPENDENCIES.map(async (pkgName) => {
  await fs.rm(`node_modules/${pkgName}/node_modules`, { recursive: true, force: true });
}));

let TARGET_PACKAGES = [
  '@emberx/component',
  '@emberx/helper',
  '@emberx/link-to',
  '@emberx/route',
  '@emberx/router',
  '@emberx/ssr',
  '@emberx/string',
  '@emberx/test-helpers',
];

await Promise.all(TARGET_PACKAGES.map(async (pkgName) => {
  await fs.rm(`packages/${pkgName}/node_modules`, { recursive: true, force: true });
}));

console.log('node_modules folders removed from', TARGET_DEPENDENCIES.concat(TARGET_PACKAGES));
