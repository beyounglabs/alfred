const { copy, stat } = require('fs-extra');

const originalPath = process.argv[2];
const relativePath = originalPath.split('/alfred/defaults/')[1];
const alfredConfigFile = __dirname + '/../alfred.config.js';
let filesIgnore = [];
(async function bootstrap() {
  try {
    await stat(alfredConfigFile);
    const alfredConfig = require(alfredConfigFile);
    if (alfredConfig && alfredConfig.filesIgnore) {
      filesIgnore = alfredConfig.filesIgnore;
    }
  } catch (e) {}

  if (filesIgnore.includes(relativePath)) {
    return;
  }

  try {
    const copyPath =
      originalPath.split('/alfred/defaults/')[0] + '/../' + relativePath;
    await copy(originalPath, copyPath);
  } catch (e) {}
})();
