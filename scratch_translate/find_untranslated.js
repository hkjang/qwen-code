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

async function main() {
  const files = getFiles('docs');
  const untranslated = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    if (!/[\uAC00-\uD7AF]/.test(content)) {
      untranslated.push(file);
    }
  }

  console.log(JSON.stringify(untranslated, null, 2));
}

main();
