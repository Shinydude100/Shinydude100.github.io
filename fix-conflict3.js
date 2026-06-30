const fs = require('fs');
let pkgContent = fs.readFileSync('package.json', 'utf8');
const lines = pkgContent.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<<<<<<< HEAD')) {
    skip = true;
    newLines.push('    "test": "jest && playwright test"');
  } else if (lines[i].includes('>>>>>>> origin/main')) {
    skip = false;
  } else if (!skip) {
    if (lines[i].includes('"playwright": "^1.61.1"')) {
      newLines.push(lines[i]);
      i++; // skip next line which is the duplicate jsdom
    } else {
      newLines.push(lines[i]);
    }
  }
}
fs.writeFileSync('package.json', newLines.join('\n'));
