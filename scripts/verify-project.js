const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = ['App.js', 'babel.config.js', ...getFiles('scripts'), ...getFiles('src')];
let errors = 0;
let missingAssets = 0;

console.log(`[Verification] Checking ${files.length} project files...`);

files.forEach((file) => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    babel.transformSync(code, {
      filename: file,
      presets: ['babel-preset-expo'],
    });
  } catch (err) {
    console.error(`[Compilation Error] in ${file}:`, err.message);
    errors++;
  }
});

// Check require assets
const assetRegex = /require\(['"]([^'"]+\.(?:png|jpg|jpeg|webp|gif))['"]\)/g;

files.forEach((file) => {
  const code = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = assetRegex.exec(code)) !== null) {
    const assetRel = match[1];
    const resolved = path.resolve(path.dirname(file), assetRel);
    if (!fs.existsSync(resolved)) {
      console.error(`[Missing Asset] in ${file}: ${assetRel}`);
      missingAssets++;
    }
  }
});

if (errors === 0 && missingAssets === 0) {
  console.log(`[Success] All ${files.length} files compiled cleanly and all asset references exist!`);
  process.exit(0);
} else {
  console.error(`[Failure] ${errors} compile error(s), ${missingAssets} missing asset(s).`);
  process.exit(1);
}
