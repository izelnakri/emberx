import fs from 'fs/promises';

const TARGET_FILE_PATH = 'node_modules/@glimmer/compiler/dist/modules/es2017/lib/compiler.js';
let targetFileBuffer = await fs.readFile(TARGET_FILE_PATH);

let contents = targetFileBuffer.toString()
  .replace(/let templateId = 0;/, '')
  .split('\n');

function checkLineRemovalBeginning(line) {
  return line.includes('export const defaultId = (() => {');
}

function checkLineRemovalEnd(line) {
  return line.includes('const defaultOptions = {');
}

let foundLines = contents.reduce((result, line, index) => {
  if (result.length === 0) {
    checkLineRemovalBeginning(line) ? result.push(index) : null;
  } else if (result.length === 1) {
    checkLineRemovalEnd(line) ? result.push(index) : null;
  }

  return result;
}, []);

if (foundLines.length !== 2) {
  console.log('File contents are different than original @glimmer/compiler@0.79.2');
  console.log(`Please check the contents of ${TARGET_FILE_PATH}:`);
  console.log(contents.join('\n'));
  process.exit(1);
}

let [beginningIndex, endIndex] = foundLines;
contents.splice(beginningIndex, endIndex - beginningIndex, `
let templateId = 0;
export const defaultId = (() => {
  return () => {
    templateId++;
    return String(templateId);
  };
})();
`);

await fs.writeFile(TARGET_FILE_PATH, contents.join('\n'));

console.log(`${TARGET_FILE_PATH} rewritten`);
