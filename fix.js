const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.tsx') || name.endsWith('.ts')) {
        files.push(name);
      }
    }
  }
  return files;
}

const files = getFiles(path.join(__dirname, 'apps/web'));
let updatedFiles = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We are looking for files that have the flawed seasonId ?? true fallback
  if (content.includes('seasonId ?? true')) {
    content = content.replace(/seasonId \?\? true/g, '(seasonId || null) ?? true');
    fs.writeFileSync(filePath, content, 'utf8');
    updatedFiles++;
    console.log('Fixed:', filePath);
  }
}

console.log(`Updated ${updatedFiles} files.`);
