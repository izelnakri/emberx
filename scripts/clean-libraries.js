import fs from 'fs/promises';

let packages = await fs.readdir('./packages/@emberx');

await Promise.all(packages.map((packageName) => {
  return fs.rm(`${process.cwd()}/packages/@emberx/${packageName}/dist`, { recursive: true, force: true });
}));
