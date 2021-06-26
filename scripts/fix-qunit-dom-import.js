import fs from 'fs/promises';

let packageJSONBuffer = await fs.readFile('node_modules/qunit-dom/package.json');
let packageJSON = JSON.parse(packageJSONBuffer.toString());

await fs.writeFile('node_modules/qunit-dom/package.json', JSON.stringify(Object.assign(packageJSON, {
  "type": "module",
}), null, 2));

console.log('qunit-dom/package.json fixed');
