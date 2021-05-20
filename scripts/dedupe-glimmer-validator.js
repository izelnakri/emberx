import fs from 'fs/promises';

let TARGET_PACKAGES = [
  '@glimmer/ssr',
  '@glimmer/node',
  '@glimmer/core'
];

await Promise.all(TARGET_PACKAGES.map(async (pkgName) => {
  await fs.rm(`node_modules/${pkgName}/node_modules`, { recursive: true, force: true });
}));

console.log('node_modules folders removed from', TARGET_PACKAGES);
