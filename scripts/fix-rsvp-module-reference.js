import fs from 'fs/promises';

let packageJSONBuffer = await fs.readFile('node_modules/rsvp/package.json');
let packageJSON = JSON.parse(packageJSONBuffer.toString());

await fs.writeFile('node_modules/rsvp/package.json', JSON.stringify(Object.assign(packageJSON, {
  "module": "lib/rsvp.js",
}), null, 2));

console.log('rsvp/package.json fixed');
