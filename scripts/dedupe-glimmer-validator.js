import fs from 'fs/promises';

let TARGET_PACKAGES = [
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

await Promise.all(TARGET_PACKAGES.map(async (pkgName) => {
  await fs.rm(`node_modules/${pkgName}/node_modules`, { recursive: true, force: true });
}));

console.log('node_modules folders removed from', TARGET_PACKAGES);
