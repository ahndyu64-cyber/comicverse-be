const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../dist/src/main.js');
const mainJsMapPath = path.join(__dirname, '../dist/src/main.js.map');

try {
  if (fs.existsSync(mainJsPath)) {
    fs.unlinkSync(mainJsPath);
    console.log('✓ Deleted dist/src/main.js');
  }
  if (fs.existsSync(mainJsMapPath)) {
    fs.unlinkSync(mainJsMapPath);
    console.log('✓ Deleted dist/src/main.js.map');
  }
  console.log('✓ Cleanup complete');
} catch (error) {
  console.error('Error removing files:', error);
  process.exit(1);
}
