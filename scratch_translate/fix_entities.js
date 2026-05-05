import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

function fixEntities(content) {
  return content.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
}

async function main() {
  const files = getFiles('docs');
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const fixed = fixEntities(content);
    if (content !== fixed) {
      fs.writeFileSync(file, fixed, 'utf-8');
      console.log(`Fixed entities in ${file}`);
    }
  }
}

main();
